---
title: DDC Configuration Reference - Helm & Docker
description: Comprehensive configuration guide for Data Diode Connector (DDC). Explains Helm values.yaml and Docker environment variables for Kafka/UDP adapters, flow control, security filters, and logging.
head:
  - - meta
    - name: keywords
      content: DDC Configuration, Helm Chart, Docker Compose, Kafka Config, UDP Config, Flow Control Params, Security Filters, Logging Config
seo:
  proficiencyLevel: Intermediate
  keywords:
    - Configuration Reference
    - Helm Values
    - Docker Environment Variables
    - Protocol Handler
    - Transport Layer
---

# Configuration Reference

The recommended deployment method for this project is now **Kubernetes (Helm)** or **Docker Compose**.

This document explains the configuration based on the `values.yaml` structure of the Helm Chart. These parameters define the behavior of the various microservice components ([Ingress/Egress](/en/software_architecture), Protocol Handler, Transport Layer). When using Docker Compose, these parameters are typically mapped to environment variables or startup command arguments.

You can find the corresponding Helm Charts on ArtifactHub:
- [Ingress Proxy Helm Chart](https://artifacthub.io/packages/helm/ffutop/data-diode-connector-ingress)
- [Egress Proxy Helm Chart](https://artifacthub.io/packages/helm/ffutop/data-diode-connector-egress)

## Ingress Proxy Configuration

The [Ingress proxy](/en/software_architecture#ingress-proxy-sender) is deployed on the sending side of the data diode (High Security Zone/Source), responsible for receiving data from the source system, performing optional filtering, and sending it unidirectionally to the diode via UDP.

### Core Protocol Configuration (`protocolHandler`)

Determines how the Ingress side "ingests" data from external systems. Select the mode via `protocolHandler.type`.

**Common Parameters:**
- `type`: Protocol type, available options are `"kafka"` or `"udp"`.

#### Kafka Mode (`protocolHandler.kafka`)
Applicable for consuming data from Kafka topics.

| Parameter (Key) | Default Value | Description |
| :--- | :--- | :--- |
| `hostKafkaServer` | `"kafka.kafka.svc.cluster.local"` | Address of the source Kafka Broker. |
| `portKafkaServer` | `9092` | Port of the source Kafka Broker. |
| `topicName` | `"TestTopic"` | Name of the Kafka topic to subscribe to/consume. |
| `maxBytesPerPartition` | `1000000` | Maximum bytes to fetch per partition from Kafka. |
| `bipBufferElementCount` | `2` | Size of the internal [ring buffer](/en/software_architecture#lock-free-buffering-bipbuffer) (unit: number of elements, approx 1MB per element). |
| `statsServerAddress` | `"0.0.0.0"` | [StatsD](/en/operations_guide#metrics-statsd) statistics server address. |
| `statsServerPort` | `8081` | StatsD statistics server port. |

#### UDP Mode (`protocolHandler.udp`)
Applicable for receiving raw UDP packets.

| Parameter (Key) | Default Value | Description |
| :--- | :--- | :--- |
| `listeningPort` | `1235` | Local port listening for external UDP data input. |
| `bipBufferElementCount` | `10` | Size of the internal ring buffer. |

### Transport Layer Send Configuration (`transportUdpSend`)

Configures how data is encapsulated and sent over the unidirectional link.

| Parameter (Key) | Default Value | Description |
| :--- | :--- | :--- |
| `senderAddress` | `"0.0.0.0"` | Local IP bound by the sending process. |
| `senderPort` | `33333` | Local port bound by the sending process. |
| `receiverAddress` | `"0.0.0.0"` | **Target IP**: The receiving IP of the Egress proxy (across the diode) or the physical diode device. |
| `receiverPort` | `1234` | **Target Port**: The receiving port on the other side of the diode. |
| `sendDelayMs` | `5` | **[Flow Control Delay](/en/flow_control)**: Wait time (milliseconds) after sending each UDP packet. Used to prevent overwhelming the physical diode or receiver. |
| `bipBufferElementCount` | `10` | Transport layer buffer size. |

### Filter Configuration (`filters`)

Optional [security filtering layer](/en/security_model); multiple filters can be configured.

| Parameter (Key) | Default Value | Description |
| :--- | :--- | :--- |
| `enabled` | `false` | Whether to enable this filter. |
| `wordToFilter` | `"secret"` | Keyword filtering: Packets containing this string will be dropped. |
| `maxMessageSize` | `1050000` | Maximum allowed message size (bytes); larger messages will be dropped. |

## Egress Proxy Configuration

The [Egress proxy](/en/software_architecture#egress-proxy-receiver) is deployed on the receiving side of the data diode (Low Security Zone/Destination), responsible for listening to UDP traffic from the diode, reassembling packets, and forwarding them to the target system.

### Transport Layer Receive Configuration (`transportUdpReceive`)

Responsible for receiving the raw unidirectional UDP stream and reassembling it.

| Parameter (Key) | Default Value | Description |
| :--- | :--- | :--- |
| `receiverAddress` | `"0.0.0.0"` | Local IP bound for listening. |
| `receiverPort` | `1234` | **Listening Port**: Must match the `receiverPort` configured on the Ingress side (mapped via the diode). |
| `bipBufferElementCount` | `10` | Reassembly buffer size; needs to be large enough to handle fragment reassembly. |

### Core Protocol Configuration (`protocolHandler`)

Determines how the Egress side "forwards" data to the target system. Select the mode via `protocolHandler.type`.

**Common Parameters:**
- `type`: Protocol type, available options are `"kafka"` or `"udp"`.

#### Kafka Mode (`protocolHandler.kafka`)
Applicable for writing data to a target Kafka cluster.

| Parameter (Key) | Default Value | Description |
| :--- | :--- | :--- |
| `hostKafkaServer` | `"kafka.kafka.svc.cluster.local"` | Address of the target Kafka Broker. |
| `portKafkaServer` | `9092` | Port of the target Kafka Broker. |
| `inReplacement` | `"TestTopic"` | (Optional) Source topic remapping match string. |
| `outReplacement` | `"FinalTestTopic"` | (Optional) Actual topic name when writing to the target Kafka. |

#### UDP Mode (`protocolHandler.udp`)
Applicable for forwarding data as UDP packets to backend services.

| Parameter (Key) | Default Value | Description |
| :--- | :--- | :--- |
| `udpReceiverHost` | `"127.0.0.1"` | IP address of the backend target service. |
| `udpReceiverPort` | `8125` | Port of the backend target service. |


## General Operations Configuration

The following parameters apply to all components of both the Ingress and Egress proxies:

| Parameter (Key) | Default Value | Description |
| :--- | :--- | :--- |
| `logLevel` | `"Warn"` | Logging level. Options: `Trace`, `Debug`, `Info`, `Warn`, `Error`. |
| `fromHostSysLog` | `"0.0.0.0"` | Source binding address for sending [Syslog](/en/operations_guide#syslog). |
| `toHostSysLog` | `"127.0.0.1"` | Centralized Syslog server address. |
| `toPortSysLog` | `8082` | Centralized Syslog server port. |
| `images.<component>.repository` | - | Docker image repository address for each component. |
| `images.<component>.tag` | `"latest"` | Image tag version. |

## Deployment Architecture Reference

In a typical Kubernetes or Docker Compose deployment, the service mapping relationship is as follows:

- **Ingress Pod/Container**:

    ```mermaid
    %%{init: { "themeVariables": { "clusterBkg": "#ffffff", "clusterBorder": "#424242" }}}%%
    graph LR
    A["protocol_handler (Kafka/UDP)"] -->B["filter (Optional)"] --> C[transport_udp_send]
    classDef darkStyle fill:#ffffff,stroke:#424242,color:#424242,stroke-width:2px
    class A,B,C darkStyle;
    ```
- **Egress Pod/Container**: 
    ```mermaid
    %%{init: { "themeVariables": { "clusterBkg": "#ffffff", "clusterBorder": "#424242" }}}%%
    graph LR
    A[transport_udp_receive] --> B["filter (Optional)"] --> C["protocol_handler (Kafka/UDP)"]
    classDef darkStyle fill:#ffffff,stroke:#424242,color:#424242,stroke-width:2px
    class A,B,C darkStyle;
    ```

Configuration changes are primarily achieved by modifying the Helm `values.yaml` file or overriding the corresponding Docker environment variables.
