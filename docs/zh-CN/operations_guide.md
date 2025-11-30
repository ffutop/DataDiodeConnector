# 运维指南

本文档提供在生产环境中部署、监控和排查网闸连接器故障的指南。

## 部署检查清单 (Checklist)

在上线之前，请确保以下几点：

1. **网络连通性**：
    - **入口代理**：可以连接到源（如 Kafka）和网闸硬件/网络接口。
    - **出口代理**：可以连接到网闸硬件/网络接口和目的地。
2. **MTU 配置**：
    - **确保网络接口的 MTU 足够大以容纳 UDP 数据包，或者允许 IP 分片处理（尽管网闸连接器处理应用层分片，但避免 IP 分片对性能更好）。**
3. **速率限制 (`send_delay_ms`)**：
    - **这是最关键的设置。**
    - **太低**：你会溢出网闸接收缓冲区，导致丢包。
    - **太高**：你会引入不必要的延迟并降低吞吐量。
    - **调优**：从较高的值（例如 `10ms`）开始，逐渐降低，直到在出口代理日志中看到丢包，然后稍微回调。
4. **缓冲区大小 (`bip_buffer_element_count`)**：
    - **如果预期源端会有突发流量，请增加此值。**

## 监控

网闸连接器的设计原则是“默认可观测 (observable by default)”。

### Syslog

网闸连接器发送结构化日志到配置的 `toHostSysLog`, `toPortSysLog`。
- **Info**: 启动事件、配置摘要。
- **Warn**: 可恢复的问题（例如，Kafka 连接丢失并正在重试）。
- **Error**: 严重故障（例如，无效配置、线程 Panic）。

### 指标 (StatsD)

网闸连接器将指标发送到任何兼容 StatsD 的收集器（Prometheus StatsD Exporter, Telegraf, Datadog）。

**关键指标：**

| 指标名称 | 类型 | 描述 |
| :---------- | :--- | :---------- |
| `ddc.ingress.packets_sent` | Counter | 发送到网闸的 UDP 数据包总数。 |
| `ddc.ingress.bytes_sent` | Counter | 发送的总字节数。 |
| `ddc.egress.packets_received`| Counter | 接收到的 UDP 数据包总数。 |
| `ddc.egress.packet_loss` | Counter | **严重**。当检测到序列号缺口时增加。在健康系统中应为 0。 |
| `ddc.dropped_packets` | Counter | 被过滤器拒绝的数据包。 |
| `ddc.buffer_full` | Counter | 如果环形缓冲区已满则增加（指示瓶颈）。 |

## 故障排查

### 场景 1："我看到出口代理端的 `packet_loss` 增加。"
- **原因**：入口代理发送数据的速度超过了物理网闸或出口代理服务器的处理能力。
- **修复**：增加入口代理配置中的 `transportUdpSend.sendDelayMs`。即使是微小的增加（例如从 0ms 到 1ms）也能极大地稳定链路。

### 场景 2："数据没有到达目的地，但日志中没有错误。"
- **原因**：过滤器可能正在静默丢弃数据（如果配置如此），或者出口代理正在接收数据但无法生产到下游。
- **修复**：
    1. 检查 `ddc.dropped_packets` 指标。
    2. 在出口代理上设置 `logLevel = "Debug"` 以查看是否接收到 UDP 数据包。
    3. 验证出口代理 `protocolHandler` 配置（正确的 Kafka topic/host）。

### 场景 3："高延迟。"
- **原因**：`transportUdpSend.sendDelayMs` 过大或缓冲区过大。
- **修复**：在不导致丢包的前提下尽可能降低 `transportUdpSend.sendDelayMs`。减小 `bipBufferElementCount` 以更频繁地处理较小的批次。

### 场景 4："Kafka 消费者组不断重平衡 (Rebalancing)。"
- **原因**：处理耗时太长，导致 Kafka 认为消费者超时。
- **修复**：在协议处理器配置中减小 `maxBytesPerPartition` 以获取更小的数据批次。
