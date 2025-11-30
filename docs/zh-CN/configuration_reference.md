# 配置参考手册

本工程目前推荐使用 Kubernetes (Helm) 或 Docker Compose 进行部署。

本文档基于 Helm Chart 的 `values.yaml` 结构进行说明，这些参数定义了各个微服务组件（Ingress/Egress、协议处理、传输层）的行为。在使用 Docker Compose 时，这些参数通常映射为环境变量或启动命令参数。

您可以在 ArtifactHub 上找到对应的 Helm Charts：
- [入口代理 Helm Chart](https://artifacthub.io/packages/helm/ffutop/data-diode-connector-ingress)
- [出口代理 Helm Chart](https://artifacthub.io/packages/helm/ffutop/data-diode-connector-egress)

## 入口代理配置

入口代理部署在网闸的发送侧（高安全区/源端），负责从源系统接收数据，进行可选的过滤，并通过 UDP 单向发送给网闸。

### 核心协议配置 (`protocolHandler`)

决定入口端如何从外部系统“摄入”数据。通过 `protocolHandler.type` 选择模式。

**通用参数：**
- `type`: 协议类型，可选值为 `"kafka"` 或 `"udp"`。

#### Kafka 模式 (`protocolHandler.kafka`)
适用于从 Kafka 主题消费数据。

| 参数 (Key) | 默认值 | 描述 |
| :--- | :--- | :--- |
| `hostKafkaServer` | `"kafka.kafka.svc.cluster.local"` | 源 Kafka Broker 的地址。 |
| `portKafkaServer` | `9092` | 源 Kafka Broker 的端口。 |
| `topicName` | `"TestTopic"` | 要订阅/消费的 Kafka 主题名称。 |
| `maxBytesPerPartition` | `1000000` | 每次从 Kafka 分区获取的最大字节数。 |
| `bipBufferElementCount` | `2` | 内部环形缓冲区大小（单位：元素个数，每元素约 1MB）。 |
| `statsServerAddress` | `"0.0.0.0"` | StatsD 统计服务器地址。 |
| `statsServerPort` | `8081` | StatsD 统计服务器端口。 |

#### UDP 模式 (`protocolHandler.udp`)
适用于接收原始 UDP 数据包。

| 参数 (Key) | 默认值 | 描述 |
| :--- | :--- | :--- |
| `listeningPort` | `1235` | 监听外部 UDP 数据输入的本地端口。 |
| `bipBufferElementCount` | `10` | 内部环形缓冲区大小。 |

### 传输层发送配置 (`transportUdpSend`)

配置如何将数据封装并通过单向链路发送。

| 参数 (Key) | 默认值 | 描述 |
| :--- | :--- | :--- |
| `senderAddress` | `"0.0.0.0"` | 发送进程绑定的本地 IP。 |
| `senderPort` | `33333` | 发送进程绑定的本地端口。 |
| `receiverAddress` | `"0.0.0.0"` | **目标 IP**：网闸对端（Egress 端）或物理网闸设备的接收 IP。 |
| `receiverPort` | `1234` | **目标端口**：网闸对端的接收端口。 |
| `sendDelayMs` | `5` | **流控延迟**：每发送一个 UDP 包后的等待时间（毫秒）。用于防止压垮物理网闸或接收端。 |
| `bipBufferElementCount` | `10` | 传输层缓冲区大小。 |

### 过滤器配置 (`filters`)

可选的安全过滤层，可配置多个过滤器。

| 参数 (Key) | 默认值 | 描述 |
| :--- | :--- | :--- |
| `enabled` | `false` | 是否启用此过滤器。 |
| `wordToFilter` | `"secret"` | 关键词过滤：包含此字符串的数据包将被丢弃。 |
| `maxMessageSize` | `1050000` | 允许的最大消息大小（字节），超过将被丢弃。 |

## 出口代理配置

出口代理部署在网闸的接收侧（低安全区/目的端），负责监听来自网闸的 UDP 流量，重组数据包，并转发给目标系统。

### 传输层接收配置 (`transportUdpReceive`)

负责接收原始的单向 UDP 数据流并进行重组。

| 参数 (Key) | 默认值 | 描述 |
| :--- | :--- | :--- |
| `receiverAddress` | `"0.0.0.0"` | 监听绑定的本地 IP。 |
| `receiverPort` | `1234` | **监听端口**：必须与 Ingress 端配置的 `receiverPort` 一致（经由网闸映射）。 |
| `bipBufferElementCount` | `10` | 重组缓冲区大小，需足够大以处理分片重组。 |

### 核心协议配置 (`protocolHandler`)

决定出口端如何将数据“转发”给目标系统。通过 `protocolHandler.type` 选择模式。

**通用参数：**
- `type`: 协议类型，可选值为 `"kafka"` 或 `"udp"`。

#### Kafka 模式 (`protocolHandler.kafka`)
适用于将数据写入目标 Kafka 集群。

| 参数 (Key) | 默认值 | 描述 |
| :--- | :--- | :--- |
| `hostKafkaServer` | `"kafka.kafka.svc.cluster.local"` | 目标 Kafka Broker 的地址。 |
| `portKafkaServer` | `9092` | 目标 Kafka Broker 的端口。 |
| `inReplacement` | `"TestTopic"` | （可选）源主题重映射匹配串。 |
| `outReplacement` | `"FinalTestTopic"` | （可选）写入目标 Kafka 时的实际主题名称。 |

#### UDP 模式 (`protocolHandler.udp`)
适用于将数据以 UDP 包形式转发给后端服务。

| 参数 (Key) | 默认值 | 描述 |
| :--- | :--- | :--- |
| `udpReceiverHost` | `"127.0.0.1"` | 后端目标服务的 IP 地址。 |
| `udpReceiverPort` | `8125` | 后端目标服务的端口。 |


## 通用运维配置

以下参数适用于入口代理和出口代理的所有组件：

| 参数 (Key) | 默认值 | 描述 |
| :--- | :--- | :--- |
| `logLevel` | `"Warn"` | 日志级别。可选值：`Trace`, `Debug`, `Info`, `Warn`, `Error`。 |
| `fromHostSysLog` | `"0.0.0.0"` | 发送 Syslog 的源绑定地址。 |
| `toHostSysLog` | `"127.0.0.1"` | 集中式 Syslog 服务器地址。 |
| `toPortSysLog` | `8082` | 集中式 Syslog 服务器端口。 |
| `images.<component>.repository` | - | 各组件的 Docker 镜像仓库地址。 |
| `images.<component>.tag` | `"latest"` | 镜像标签版本。 |

## 部署架构参考

在典型的 Kubernetes 或 Docker Compose 部署中，服务映射关系如下：

- **Ingress Pod/Container**:

    ```mermaid
    %%{init: { "themeVariables": { "clusterBkg": "#ffffff", "clusterBorder": "#424242" }}}%%
    graph LR
    A["protocol_handler (Kafka/UDP)"] -->B["filter (可选)"] --> C[transport_udp_send]
    classDef darkStyle fill:#ffffff,stroke:#424242,color:#424242,stroke-width:2px
    class A,B,C darkStyle;
    ```
- **Egress Pod/Container**: 
    ```mermaid
    %%{init: { "themeVariables": { "clusterBkg": "#ffffff", "clusterBorder": "#424242" }}}%%
    graph LR
    A[transport_udp_receive] --> B["filter (可选)"] --> C["protocol_handler (Kafka/UDP)"]
    classDef darkStyle fill:#ffffff,stroke:#424242,color:#424242,stroke-width:2px
    class A,B,C darkStyle;
    ```

配置修改主要通过修改 Helm 的 `values.yaml` 文件或覆盖相应的 Docker 环境变量来实现。