---
title: DDC UDP Protocol Specification - Headers & Fragmentation
description: Technical specification for the Data Diode Connector (DDC) custom UDP protocol. Details the 9-byte header, packet fragmentation logic, sequence numbering for loss detection, and the receiver state machine.
head:
  - - meta
    - name: keywords
      content: UDP Protocol Spec, Packet Header, Fragmentation, Sequence Number, Packet Loss Detection, State Machine, Custom Protocol
seo:
  proficiencyLevel: Advanced
  keywords:
    - UDP Protocol Specification
    - Packet Fragmentation
    - Sequence Numbering
    - Finite State Machine
    - Reliable UDP
---

# UDP Transport Protocol Specification

Version: `1.0`

## Overview

The Data Diode Connector (DDC) utilizes a custom, lightweight application-layer protocol on top of UDP for communication between the **[Ingress Proxy and Egress Proxy components](/en/software_architecture)**. This protocol is designed to reliably transport large, opaque binary data chunks across the data diode by splitting them into smaller UDP packets and reassembling them on the receiving end.

The protocol provides the following key features:

- **Message Fragmentation and Reassembly**: Allows transmission of data chunks larger than the standard UDP payload size.
- **Packet Loss Detection**: Uses a sequential numbering system to detect lost packets.
- **Connection Lifecycle Management**: Includes special message types for startup, shutdown, and keep-alive.

## Packet Structure

Every UDP packet exchanged between the transport components follows a fixed header structure, followed by a variable-length payload.

```
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|  Message Type |               Sequence Number                 |
|               |                (LSB, 24 bits)                 |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|Sequence Number|         Payload Length        | Remaining Pkts|
| (MSB, 8 bits) |         (Little-Endian)       |     (LSB)     |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
| Remaining Pkts|                                               |
|     (MSB)     |                   (Padding)                   |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```

### Header Fields

The header has a fixed size of **9 bytes**.

- **Message Type** (1 byte)
    - An 8-bit unsigned integer that defines the purpose of the packet. See [Message Types](#message-types) for details.

- **Sequence Number** (4 bytes)
    - A 32-bit unsigned integer in **Little-Endian** format.
    - This number increments by one for every packet sent.
    - It is used by the receiver to detect packet loss. The sequence number `0` is a special case and does not indicate packet loss when received out of order (e.g., after a `StartUp` message).

- **Payload Length** (2 bytes)
    - A 16-bit unsigned integer in **Little-Endian** format.
    - Specifies the size of the `Payload` field in bytes for the current packet.
    - For `Data` and `DataFirst` packets, this value is typically the maximum payload size (`MAX_PAYLOAD_SIZE_BYTES`), except for the very last packet of a fragmented message, which may be smaller.

- **Remaining Packets** (2 bytes)
    - A 16-bit unsigned integer in **Little-Endian** format.
    - Indicates how many packets are **left** to be received to complete the current data chunk.
    - For a `DataFirst` packet, this value represents the total number of subsequent packets for that chunk.
    - For a `Data` packet, this value decrements with each packet received.
    - When this value is `0`, it signifies that the current packet is the final one for the data chunk.

### Payload

- **Payload** (Variable size)
    - The raw binary data segment of the original data chunk.
    - The size of this field is defined by the `Payload Length` header field.

## Message Types

The `Message Type` field dictates how the receiver processes the packet.

| Value | Name        | Description                                                                                                                                                            |
| :---- | :---------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `0`   | `DataFirst` | Marks the first packet of a new data chunk. The receiver transitions from `WaitingForFirstData` to `WaitingForData` state and uses the `Remaining Packets` field to know how many more packets to expect. |
| `1`   | `Data`      | A subsequent packet of a fragmented data chunk. The receiver collects these packets until `Remaining Packets` is zero, then reassembles the full chunk.                 |
| `2`   | `StartUp`   | A control message sent when the sender initializes. On receipt, the receiver resets its expected sequence number to `0` and returns to the `WaitingForFirstData` state, discarding any partially received data. |
| `3`   | `HeartBeat` | A [keep-alive message](/en/deployment_topologies#heartbeat-detection). The receiver logs its reception and remains in its current state. It does not affect data processing.                                            |
| `4`   | `Shutdown`  | A control message indicating the sender is shutting down. On receipt, the receiver will terminate its processing loop.                                                 |

## State Machine and Reassembly Logic

The receiver operates as a state machine to handle packet reassembly.

1. **Initial State: `WaitingForFirstData`**
    - The receiver is idle, waiting for a new data transmission to begin.
    - It only accepts `DataFirst`, `StartUp`, `HeartBeat`, or `Shutdown` packets. Any `Data` packets are discarded.

2. **Receiving `DataFirst`**
    - When a `DataFirst` packet arrives, the receiver stores its payload as the first part of a new message.
    - If `Remaining Packets` is `0`, the message is complete. The payload is written to the output buffer, and the state remains `WaitingForFirstData`.
    - If `Remaining Packets` is greater than `0`, the receiver transitions to the `WaitingForData(N)` state, where `N` is the total number of packets for this message (`Remaining Packets` + 1).

3. **State: `WaitingForData(N)`**
    - The receiver is actively collecting packets for a fragmented message.
    - It expects `N-1` subsequent `Data` packets.
    - Each incoming `Data` packet's payload is stored in an intermediate buffer based on its position in the sequence (calculated using the `Remaining Packets` value).
    - If a `DataFirst` packet is received unexpectedly in this state, the current reassembly is aborted, the partial data is discarded, and a new reassembly begins with this new packet.

4. **Receiving the Final `Data` Packet**
    - When a `Data` packet arrives with `Remaining Packets` equal to `0`, it signals the end of the message.
    - The receiver combines all stored payloads from the intermediate buffer into a single, contiguous byte array.
    - This reassembled data chunk is then written to the output [`bip_buffer`](/en/software_architecture#lock-free-buffering-bipbuffer) for the downstream component.
    - The state machine transitions back to `WaitingForFirstData`.

5. **Packet Loss Handling**
    - At every received packet, the receiver compares the packet's `Sequence Number` with its expected sequence number.
    - If `incoming > expected`, the receiver detects that one or more packets have been lost.
    - When packet loss is detected, the receiver **aborts the current message reassembly**, discards any buffered data for that message, and resets its state to `WaitingForFirstData`. This ensures that corrupted or incomplete data chunks are not forwarded.
