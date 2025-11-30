# Operations Guide

This document provides guidelines for deploying, monitoring, and troubleshooting the Data Diode Connector (DDC) in a production environment.

## Deployment Checklist

Before going live, ensure the following:

1. **Network Reachability**:
    - **Ingress**: Can reach the Source (e.g., Kafka) and the Diode Hardware/Network Interface.
    - **Egress**: Can reach the Diode Hardware/Network Interface and the Destination.
2. **MTU Configuration**:
    - **Ingress**: Ensure the network interface MTU is large enough for the UDP packets, or let IP fragmentation handle it (though DDC handles application-layer fragmentation, avoiding IP fragmentation is better for performance).
3. **Rate Limiting (`sendDelayMs`)**:
    - This is the most critical setting.
    - **Too Low**: You will overflow the diode receiver buffer, causing packet loss.
    - **Too High**: You will introduce unnecessary latency and reduce throughput.
    - **Tuning**: Start high (e.g., `10ms`) and decrease until you see packet loss in the Egress logs, then back off slightly.
4.  **Buffer Sizing (`bipBufferElementCount`)**:
    - Increase this if you expect bursty traffic from the source.

## Monitoring

DDC is designed to be "observable by default".

### Syslog
DDC sends structured logs to the configured `toHostSyslog`, `toPortSyslog`.
- **Info**: Startup events, configuration summaries.
- **Warn**: Recoverable issues (e.g., Kafka connection lost and retrying).
- **Error**: Critical failures (e.g., invalid config, thread panic).

### Metrics (StatsD)
DDC emits metrics to any StatsD-compatible collector (Prometheus StatsD Exporter, Telegraf, Datadog).

**Key Metrics:**

| Metric Name | Type | Description |
| :---------- | :--- | :---------- |
| `ddc.ingress.packets_sent` | Counter | Total UDP packets sent to diode. |
| `ddc.ingress.bytes_sent` | Counter | Total bytes sent. |
| `ddc.egress.packets_received`| Counter | Total UDP packets received. |
| `ddc.egress.packet_loss` | Counter | **Critical**. Increments when a sequence gap is detected. Should be 0 in a healthy system. |
| `ddc.dropped_packets` | Counter | Packets rejected by Filters. |
| `ddc.buffer_full` | Counter | Increments if the Ring Buffer is full (indicates bottlenecks). |

## Troubleshooting

### Scenario 1: "I see `packet_loss` increasing on the Egress side."
- **Cause**: The Ingress is sending data faster than the physical diode or the Egress server can process it.
- **Fix**: Increase `transportUdpSend.sendDelayMs` in the Ingress configuration. Even a small increase (e.g., from 0ms to 1ms) can drastically stabilize the link.

### Scenario 2: "Data is not arriving at the destination, but no errors in logs."
- **Cause**: Filters might be silently dropping data (if configured to do so), or the Egress is receiving data but failing to produce to the sink.
- **Fix**:
    1. Check `ddc.dropped_packets` metric.
    2. Set `logLevel = "Debug"` on Egress to see if it's receiving UDP packets.
    3. Verify the Egress `protocolHandler` configuration (correct Kafka topic/host).

### Scenario 3: "High Latency."
- **Cause**: Large `sendDelayMs` or extremely large buffers.
- **Fix**: Reduce `sendDelayMs` as much as possible without causing packet loss. Reduce `bipBufferElementCount` to process smaller batches more frequently.

### Scenario 4: "Kafka Consumer Group rebalancing constantly."
- **Cause**: Processing is taking too long, causing Kafka to time out the consumer.
- **Fix**: Decrease `maxBytesPerPartition` in the Protocol Handler config to fetch smaller batches.
