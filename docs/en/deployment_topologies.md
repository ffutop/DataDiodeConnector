---
title: DDC Deployment Topologies - High Availability (HA) & Scale
description: Deployment patterns for Data Diode Connector. Covers strict 1:1 pairing rule, redundant links (Active-Active), Kafka consumer group failover, and Cold Standby strategies for high availability.
head:
  - - meta
    - name: keywords
      content: Deployment Topology, High Availability, HA Strategy, Kafka Failover, Active-Active, Redundant Link, One-to-One Pairing
seo:
  proficiencyLevel: Advanced
  keywords:
    - Deployment Topologies
    - High Availability
    - Active-Active Replication
    - Kafka Failover
    - Redundant Link
---

# Deployment Topologies & High Availability

In enterprise environments, deploying the Data Diode Connector (DDC) must follow a **strict one-to-one binding principle**. This document outlines architectural patterns and **High Availability (HA)** strategies based on this core constraint.

## Core Architecture Principle: Single Logical Processing Unit

According to the [Protocol Design](/en/protocol) of the Data Diode Connector, the **Ingress Proxy and Egress Proxy constitute a single logical processing unit**.

- **Strict One-to-One Mapping**: Every Ingress Proxy instance must correspond to a dedicated Egress Proxy instance.
- **No Reuse**: It does **NOT** support multiple Ingress instances sending to the same Egress instance, nor does it support one Ingress distributing to multiple Egress instances.

### Rationale
The Ingress and Egress proxies maintain a state machine for a single data stream (including [sequence number tracking](/en/protocol#header-fields) and fragmentation/reassembly state). If multiple Ingress proxies send data to the same Egress proxy, it causes sequence number conflicts and state confusion at the receiver, leading to severe packet loss and reassembly failures.

Therefore, all scaling and high-availability designs must be based on **paired Ingress and Egress proxies**.

## Deployment Patterns

The Data Diode Connector supports Kubernetes and Docker Compose deployments, but you must strictly adhere to the pairing principle mentioned above.

### Single Link Pair Pattern

The most basic deployment unit.

```mermaid
%%{init: { "themeVariables": { "clusterBkg": "#ffffff", "clusterBorder": "#424242" }}}%%
graph LR
    A["Source Application"] --> B["Ingress Proxy"]
    B --> C(("Data Diode"))
    C --> D["Egress Proxy"] --> E["Target Application"]
    classDef darkStyle fill:#ffffff,stroke:#424242,color:#424242,stroke-width:2px
    class A,B,C,D,E darkStyle;
```

- **Configuration**:
    - The [Ingress Proxy](/en/configuration_reference#ingress-proxy-configuration) is configured with a unique destination UDP address/port.
    - The [Egress Proxy](/en/configuration_reference#egress-proxy-configuration) listens on the corresponding UDP port.

### Multi-Link Pair Pattern

The Multi-Link Pair pattern is suitable for scenarios requiring simultaneous processing of multiple data streams, where each link pair is responsible for independent traffic isolation.

```mermaid
%%{init: { "themeVariables": { "clusterBkg": "#ffffff", "clusterBorder": "#424242" }}}%%
graph LR
    C(("Data Diode"))

    subgraph "Link Pair 1"
    A1["Source Application"]
    B1["Ingress Proxy"]
    D1["Egress Proxy"]
    E1["Target Application"]
    end
    subgraph "Link Pair 2"
    A2["Source Application"]
    B2["Ingress Proxy"]
    D2["Egress Proxy"]
    E2["Target Application"]
    end
    A1 --> B1 --> C --> D1 --> E1
    A2 --> B2 --> C --> D2 --> E2

    classDef darkStyle fill:#ffffff,stroke:#424242,color:#424242,stroke-width:2px
    class A1,A2,B1,B2,C,D1,D2,E1,E2 darkStyle;
```

- **Configuration**:
    - The Ingress Proxy of each link pair is configured with a unique destination UDP address/port.
    - Each Egress Proxy listens on its corresponding UDP port.

## High Availability (HA) Strategies

Given the 1:1 restriction, High Availability cannot be achieved through simple "backend cluster load balancing"; it must adopt a **multi-link parallel** strategy.

### Redundant Link Mode (Active-Active Replication)

This is the recommended architecture for **maximum reliability**, tolerating failures of any component (including physical data diode hardware).

```mermaid
%%{init: { "themeVariables": { "clusterBkg": "#ffffff", "clusterBorder": "#424242" }}}%%
graph LR
    A["Source Application"]
    E["Target Application"]

    subgraph "Link Pair"
    B1["Ingress Proxy"]
    C1(("Data Diode"))
    D1["Egress Proxy"]
    end
    subgraph "Redundant Link Pair"
    B2["Redundant Ingress Proxy"]
    C2(("Data Diode"))
    D2["Redundant Egress Proxy"]
    end
    A --> B1 --> C1 --> D1 --> E
    A --> B2 --> C2 --> D2 --> E

    classDef darkStyle fill:#ffffff,stroke:#424242,color:#424242,stroke-width:2px
    class A,B1,B2,C1,C2,D1,D2,E darkStyle;
```

- **Traffic Flow**:
    - **Source**: The business application sends the same data to both the Ingress Proxy and the Redundant Ingress Proxy simultaneously (Traffic Mirroring).
    - **Transmission**: The two links transmit data independently.
    - **Destination**: The target application receives two copies of the data (from the Redundant Egress Proxy and the Egress Proxy respectively).
- **Deduplication Requirement**: The target business system must have **deduplication logic** (e.g., based on unique IDs in the business data) to handle duplicate data packets arriving from both paths.

### Kafka Consumer Group Failover Mode (Active-Active Sharding)

Leverages Kafka's consumer group mechanism to achieve automatic load distribution and failover, while maintaining the singularity of the Ingress output stream.

```mermaid
%%{init: { "themeVariables": { "clusterBkg": "#ffffff", "clusterBorder": "#424242" }}}%%
graph LR
    A["Source Kafka Cluster"]
    C(("Data Diode"))
    E["Target Kafka Cluster"]

    subgraph "Link Pair 1"
    B1["Ingress Proxy"]
    D1["Egress Proxy"]
    end

    subgraph "Link Pair 2"
    B2["Ingress Proxy"]
    D2["Egress Proxy"]
    end

    A --"Same Consumer Group"--> B1 --> C --> D1 --> E
    A --"Same Consumer Group"--> B2 --> C --> D2 --> E
    classDef darkStyle fill:#ffffff,stroke:#424242,color:#424242,stroke-width:2px
    class A,B1,B2,C,D1,D2,E darkStyle;
```

- **Failover Process**:
    - Under normal circumstances, Kafka distributes Partitions to the Ingress Proxies of Link Pair 1 and Link Pair 2.
    - If the Ingress Proxy of Link Pair 1 crashes, Kafka triggers a Rebalance, reassigning the Partitions originally belonging to Link Pair 1 to the Ingress Proxy of Link Pair 2.
    - At this point, the Ingress Proxy of Link Pair 2 carries double the traffic, but for the Egress Proxy of Link Pair 2, it still receives valid sequential data from a single source (Link Pair 2's Ingress), **complying with the 1:1 protocol requirement**.
- **Prerequisites**:
    - The Ingress Proxy of each link pair must run as a [Kafka Consumer](/en/configuration_reference#kafka-mode-protocolhandlerkafka).
    - Sufficient physical channels (ports) must be planned for use by each Ingress-Egress pair.

### Cold Standby Mode (Active-Passive)

Suitable for scenarios where momentary downtime (seconds) is acceptable.

- **Mechanism**:
    - Use Kubernetes `Deployment` (Replicas=1).
    - Or Docker Compose with `restart: always`.
- **Failure Recovery**: When an Ingress or Egress proxy process crashes, the container orchestration platform automatically restarts the instance.
- **Limitations**: Data transmission is interrupted during the restart.

## The "Blind Sender" Problem & Monitoring

In a unidirectional network, each Ingress Proxy **cannot know** if its corresponding Egress Proxy is functioning correctly.

### Mitigation Strategies
Since we now adopt a strict pairing pattern, monitoring becomes more explicit:

1. **Out-of-Band Monitoring**:
    - If conditions permit (e.g., existence of a management network segment), an external monitoring system should be established to check the health status of all Ingress and Egress proxies simultaneously.
    - If any Egress Proxy is found to be down, an automated script should stop the corresponding Ingress Proxy, forcing the upstream (e.g., Kafka) to shift traffic to a healthy link.

2. **Heartbeat Detection**:
    - The protocol includes `HeartBeat` messages. The Egress Proxy should monitor the receipt of heartbeats. If no heartbeat is received from the Ingress Proxy for a long time, it should raise an alarm indicating "Link Interrupted".

## Summary Recommendations

| Requirement | Recommended Architecture | Key Configuration |
| :--- | :--- | :--- |
| **Standard Production** | **Kafka Group Mode** | Multiple Ingress Proxies consume as the same group; each Ingress binds to an independent Egress; relies on Kafka Rebalance for fault tolerance. |
| **Maximum Reliability** | **Redundant Link (Dual Send)** | Source sends dual traffic; deploy two independent links; destination handles deduplication. |
| **Resource Constrained/Simple** | **K8s Cold Standby** | Single Pod pair; relies on K8s auto-restart. |

**Note**: Whenever scaling, you must increase both Ingress and Egress proxies simultaneously and configure independent communication ports/channels. Multi-to-one topology is strictly prohibited.