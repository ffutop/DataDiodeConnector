---
title: DDC Developer Guide - Custom Plugins & Compilation
description: Guide for extending Data Diode Connector (DDC). Learn Rust workspace structure, how to implement custom protocol adapters (MQTT/HTTP) and filters, and instructions for cross-compiling to ARM64.
head:
  - - meta
    - name: keywords
      content: DDC Development, Rust Plugin, Protocol Adapter, Custom Filter, Source Compilation, Cross Compilation, Rust Workspace
seo:
  proficiencyLevel: Expert
  keywords:
    - Developer Guide
    - Rust Development
    - Protocol Adapter
    - Custom Filter
    - Cross Compilation
    - Plugin System
---

# Developer Guide

This guide is intended for developers who wish to extend the Data Diode Connector (DDC) by adding support for new [protocols](/en/configuration_reference#core-protocol-configuration-protocolhandler), creating [custom filters](/en/security_model#content-filtering-and-sanitization), or modifying the core transport logic.

## Project Structure

The codebase is organized as a Rust workspace with several crates:

*   `framework/`: Core libraries shared by all components.
    *   `osdd`: The main application runner and trait definitions.
    *   `bip_utils`: Utilities for the [Bipartite Buffer](/en/software_architecture#lock-free-buffering-bipbuffer).
    *   `logging`: Centralized logging setup.
*   `protocol_handlers/`: Plugins for external communication.
    *   `ph_kafka`: Kafka Producer/Consumer implementation.
    *   `ph_udp`: Raw UDP socket handling.
    *   `ph_mock_handler`: Test stub.
*   `filters/`: Content inspection plugins.
    *   `filter`: Basic keyword filtering.
*   `settings/`: Default [configuration files](/en/configuration_reference).

## Adding a New Protocol Handler

To add support for a new protocol (e.g., MQTT, HTTP, AMQP), you need to create a new crate in `protocol_handlers/` and implement the standard traits.

### 1. Create the Crate
Generate a new library crate inside `protocol_handlers/`:
```bash
cargo new --lib protocol_handlers/ph_mqtt
```

### 2. Implement the Traits
DDC uses a generic system where handlers are loaded based on configuration. You will need to implement structs that handle the initialization and the run loop.

**Key Traits to Implement:**

For **Ingress** (Reading data):
You typically create a `struct` that reads from your source and writes to a `BipBufferWriter`.

```rust
// Pseudo-code structure
pub struct MqttIngress {
    // ... connection details
}

impl MqttIngress {
    pub fn run(&mut self, mut writer: BipBufferWriter) {
        loop {
            let message = self.mqtt_client.recv();
            // Serialize message to internal binary format
            // Write to 'writer'
        }
    }
}
```

For **Egress** (Writing data):
You create a `struct` that reads from a `BipBufferReader` and writes to your destination.

```rust
// Pseudo-code structure
pub struct MqttEgress {
    // ... connection details
}

impl MqttEgress {
    pub fn run(&mut self, mut reader: BipBufferReader) {
        loop {
            if let Some(data) = reader.read() {
                // Deserialize 'data'
                // Publish to MQTT broker
            }
        }
    }
}
```

### 3. Register the Handler
You must update the main factory logic (usually in `framework/osdd` or the main binary entry point) to recognize your new `type = "ph_mqtt"` string in `Config.toml` and instantiate your struct.

## Working with Data Formats

DDC is payload-agnostic, but `ph_kafka` uses a specific `KafkaMessage` struct serialized via `bincode`.

If you are integrating with the existing ecosystem, you should likely respect this format or wrap your data similarly:

```rust
#[derive(Serialize, Deserialize)]
pub struct MyMessage {
    pub payload: Vec<u8>,
    pub metadata: String,
}
```

## Creating a Custom Filter

[Filters](/en/configuration_reference#filter-configuration-filters) are the easiest component to extend.

1.  Look at `filters/filter/src/lib.rs`.
2.  The core function signature usually resembles:
    ```rust
    pub fn filtering(
        buffer: &[u8],
        length: usize,
        writer: &mut BipBufferWriter,
        // ... custom args
    )
    ```
3.  **Logic**:
    *   Deserializes the packet from `buffer`.
    *   Inspects the content.
    *   **If Allowed**: Writes it to `writer` (the next stage).
    *   **If Denied**: Does *not* write to `writer`, effectively dropping it. Adds to `dropped_packets` stats.

## Building and Testing

### Running Tests
Use standard Cargo commands:
```bash
cargo test --workspace
```

### Building for Release
```bash
cargo build --release
```

### Cross-Compilation
The project supports ARM64 (for edge devices).
```bash
cross build --target aarch64-unknown-linux-gnu --release
```