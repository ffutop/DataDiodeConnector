# DDC Flow Control Mechanism and Tuning Guide

In a Data Diode environment, Flow Control is the most critical factor for system stability. Due to the physical unidirectionality, the Egress (Receiver) cannot send "ACKs", "Window Full", or "Slow Down" signals back to the Ingress (Sender).

If the Sender transmits at full Line Speed while the diode hardware or the Receiver processes slightly slower, **Silent Packet Loss** will occur.

DDC addresses this issue via an application-layer **Active Send Rate Limiting** mechanism.

## How It Works

The flow control mechanism resides in the `transport-udp-send` component of the **Ingress Proxy (Sender)**.

The implementation is straightforward: before sending every UDP packet, the sending thread is forced to pause for a specified duration.

### Core Logic

```rust
// Pseudo-code logic
fn send_data(packet, delay_ms) {
    // 1. Force Sleep
    if delay_ms > 0 {
        sleep(delay_ms);
    }
    
    // 2. Send Packet
    udp_socket.send(packet);
}
```

This mechanism effectively **artificially increases the Inter-Packet Gap**, thereby reducing instantaneous throughput to ensure it does not exceed the physical diode's bandwidth limit.

### Parameters Involved

*   **Packet Size**: DDC defaults to filling the UDP packet as much as possible, with a max payload of approximately **64KB** (65,498 bytes).
*   **Delay**: Controlled by the `send_delay_ms` parameter in the configuration file.

## Theoretical Throughput Calculation

Since each DDC packet carries roughly 64KB of data, we can estimate the **Maximum Theoretical Bandwidth** for different `send_delay_ms` settings.

**Formula**:
$$ \text{Throughput (MB/s)} \approx \frac{\text{0.064 MB (Packet Size)}}{\text{Delay (seconds)}} $$

| send_delay_ms | Packets Per Second (PPS) | Theoretical Max Bandwidth (MB/s) | Theoretical Max Bandwidth (Mbps) | Use Case (Estimate) |
| :--- | :--- | :--- | :--- | :--- |
| **0** | CPU Limit | 100+ MB/s | 1 Gbps+ | 10G Diode / Pure Software Test |
| **1** | ~1000 | ~64 MB/s | ~512 Mbps | 1G Diode (Recommended Start) |
| **2** | ~500 | ~32 MB/s | ~256 Mbps | 300-500Mbps Bandwidth |
| **5** | ~200 | ~12.8 MB/s | ~100 Mbps | 100Mbps Diode |
| **10** | ~100 | ~6.4 MB/s | ~50 Mbps | Low Speed / Unstable Link |

> **Note**: Actual throughput will be slightly lower than the theoretical value because System Calls (Syscall) and Network Stack processing also consume microsecond-level time.

## Tuning Strategy

Adjusting flow control parameters is a trial-and-error process. We recommend following these steps:

### Step 1: Benchmark
Set `send_delay_ms` to a conservative value (e.g., `5`, corresponding to ~100Mbps).

### Step 2: Monitor Packet Loss
Observe the **Egress Proxy (Receiver)** logs or monitoring metrics (`ddc.egress.packet_loss`).
- If `packet_loss > 0`: You are sending too fast, or the intermediate network/diode is dropping packets.
- If `packet_loss == 0`: The link is stable.

### Step 3: Ramp Up

1. Decrease `send_delay_ms` (e.g., from `5` to `2`, then to `1`).
2. After each adjustment, run for a while and check the Egress side for packet loss.
3. **Find the Limit**: When you start seeing a small amount of packet loss, back off slightly (increase the delay).

### Step 4: The "0" Trap

Setting `send_delay_ms` to `0` means "Unlimited".
- On Linux systems, this causes DDC to call `sendto()` as fast as possible.
- This can easily instantly saturate the 1Gbps or even 10Gbps NIC buffer, causing **Local** (Sender NIC) or **Switch** port overflows.
- **Recommendation**: Unless you are absolutely sure the hardware diode can handle line speed, it is recommended to keep at least `send_delay_ms = "1"`.


## FAQ

**Q1: Why do I only get 500Mbps when I set `send_delay_ms = 1`? I can't saturate my 1Gbps link?**

A1: `sleep(1ms)` does not guarantee exactly 1.000ms precision at the OS level; it usually sleeps slightly longer. Additionally, a 64KB packet is fragmented into ~45 IP packets on an MTU=1500 network, increasing overhead. If you need finer control (e.g., 800Mbps), the millisecond-level precision of DDC might not be enough currently. It is recommended to increase concurrency (run multiple Chains) to fill the bandwidth.

**Q2: Can I set decimal values? Like 0.5ms?**

A2: No. The configuration parser reads it as an integer (`u64`). If higher precision is needed, future versions might introduce microsecond-level control. Currently, please keep it as an integer.

**Q3: Does the buffer size (`bip_buffer_element_count`) affect flow control?**

A3: The buffer does not affect the **Send Rate**, but it determines the **Burst Tolerance**.
- If Kafka suddenly floods 100MB of data, and flow control is limited to 50MB/s.
- A larger buffer can temporarily store this 100MB, allowing the sender to drain it slowly.
- A smaller buffer will cause the Kafka Consumer to block (Backpressure), pausing reads from Kafka.
- **Conclusion**: When used with flow control, appropriately increasing the buffer size helps smooth out bursty traffic from Kafka.
