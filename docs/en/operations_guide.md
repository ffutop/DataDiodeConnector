---
title: DDC Operations Guide - Deployment, Monitoring & Troubleshooting
description: Practical operations guide for Data Diode Connector (DDC). Includes pre-flight checklist, monitoring via StatsD metrics, Syslog configuration, and troubleshooting common issues like packet loss.
head:
  - - meta
    - name: keywords
      content: DDC Operations, Production Deployment, Monitoring, Troubleshooting, StatsD Metrics, Packet Loss, Kafka Rebalancing
seo:
  proficiencyLevel: Expert
  keywords:
    - Operations Guide
    - Monitoring
    - Troubleshooting
    - Data Diode
    - Kafka Operations
    - Metrics
---

# Operations Guide

This document provides guidelines for **deploying, monitoring, and troubleshooting** the Data Diode Connector (DDC) in a production environment.

## Deployment Checklist

Before going live, ensure the following:

1. **Network Reachability**:
    - **Ingress**: Can reach the Source (e.g., Kafka) and the Diode Hardware/Network Interface.
    - **Egress**: Can reach the Diode Hardware/Network Interface and the Destination.
2. **MTU Configuration**:
    - **Ingress**: Ensure the network interface MTU is large enough for the UDP packets, or let IP fragmentation handle it (though DDC handles application-layer fragmentation, avoiding IP fragmentation is better for performance).
3. **Rate Limiting ([`send_delay_ms`](/en/flow_control))**:
    - **This is the most critical setting.**
    - **Too Low**: You will overflow the diode receiver buffer, causing packet loss.
    - **Too High**: You will introduce unnecessary latency and reduce throughput.
    - **Tuning**: Start high (e.g., `10ms`) and decrease until you see packet loss in the [Egress logs](/en/operations_guide#syslog), then back off slightly.
4.  **Buffer Sizing ([`bip_buffer_element_count`](/en/software_architecture#lock-free-buffering-bipbuffer))**:
    - **Increase this if you expect bursty traffic from the source.**

## Monitoring

DDC is designed to be "observable by default".

### Syslog
DDC sends structured logs to the [configured](/en/configuration_reference) `to_host_syslog` and `to_port_syslog`.
- **Info**: Startup events, configuration summaries.
- **Warn**: Recoverable issues (e.g., [Kafka connection lost and retrying](/en/configuration_reference#kafka-mode-protocolhandler-kafka)).
- **Error**: Critical failures (e.g., invalid config, thread panic).

### Metrics (StatsD)
DDC emits metrics to any [StatsD](https://github.com/statsd/statsd)-compatible collector (Prometheus StatsD Exporter, Telegraf, Datadog).

**Key Metrics:**

| Metric Name | Type | Description |
| :---------- | :--- | :---------- |
| `ddc.ingress.packets_sent` | Counter | Total UDP packets sent to diode. |
| `ddc.ingress.bytes_sent` | Counter | Total bytes sent. |
| `ddc.egress.packets_received`| Counter | Total UDP packets received. |
| `ddc.egress.packet_loss` | Counter | **Critical**. Increments when a sequence gap is detected. Should be 0 in a healthy system. |
| `ddc.dropped_packets` | Counter | Packets rejected by [Filters](/en/security_model#content-filtering-and-sanitization). |
| `ddc.buffer_full` | Counter | Increments if the Ring Buffer is full (indicates bottlenecks). |

## Troubleshooting

### Scenario 1: "I see `packet_loss` increasing on the Egress side."
- **Cause**: The [Ingress](/en/software_architecture#ingress-proxy-sender) is sending data faster than the physical diode or the [Egress](/en/software_architecture#egress-proxy-receiver) server can process it.
- **Fix**: Increase `transportUdpSend.sendDelayMs` in the [Ingress configuration](/en/configuration_reference#transport-layer-send-configuration-transportudpsend). Even a small increase (e.g., from 0ms to 1ms) can drastically stabilize the link.

### Scenario 2: "Data is not arriving at the destination, but no errors in logs."
- **Cause**: [Filters](/en/security_model#content-filtering-and-sanitization) might be silently dropping data (if configured to do so), or the Egress is receiving data but failing to produce to the sink.
- **Fix**:
    1. Check `ddc.dropped_packets` metric.
    2. Set [`logLevel = "Debug"`](/en/configuration_reference) on Egress to see if it's receiving UDP packets.
    3. Verify the Egress `protocolHandler` [configuration](/en/configuration_reference#core-protocol-configuration-protocolhandler-1) (correct Kafka topic/host).

### Scenario 3: "High Latency."
- **Cause**: Large [`send_delay_ms`](/en/flow_control) or extremely large buffers.
- **Fix**: Reduce `send_delay_ms` as much as possible without causing packet loss. Reduce [`bip_buffer_element_count`](/en/software_architecture#lock-free-buffering-bipbuffer) to process smaller batches more frequently.

### Scenario 4: "[Kafka Consumer Group rebalancing constantly](/en/deployment_topologies#kafka-consumer-group-failover-mode-active-active-sharding)."
- **Cause**: Processing is taking too long, causing Kafka to time out the consumer.
- **Fix**: Decrease `max_bytes_per_partition` in the [Protocol Handler config](/en/configuration_reference#kafka-mode-protocolhandlerkafka) to fetch smaller batches.