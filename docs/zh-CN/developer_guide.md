# 开发者指南

本指南面向希望通过添加新协议支持、创建自定义过滤器或修改核心传输逻辑来扩展网闸连接器的开发人员。

## 项目结构

代码库组织为一个包含多个 crates 的 Rust 工作区 (Workspace)：

*   `framework/`: 所有组件共享的核心库。
    *   `osdd`: 主应用程序运行器和 Trait 定义。
    *   `bip_utils`: 环形缓冲区 (Bipartite Buffer) 的工具库。
    *   `logging`: 集中式日志设置。
*   `protocol_handlers/`: 外部通信插件。
    *   `ph_kafka`: Kafka 生产者/消费者实现。
    *   `ph_udp`: 原始 UDP 套接字处理。
    *   `ph_mock_handler`: 测试桩 (Stub)。
*   `filters/`: 内容检查插件。
    *   `filter`: 基础关键字过滤。
*   `settings/`: 默认配置文件。

## 添加新的协议处理器

要添加对新协议（如 MQTT, HTTP, AMQP）的支持，你需要在 `protocol_handlers/` 中创建一个新的 crate 并实现标准 Traits。

### 1. 创建 Crate
在 `protocol_handlers/` 中生成一个新的库 crate：
```bash
cargo new --lib protocol_handlers/ph_mqtt
```

### 2. 实现 Traits
DDC 使用通用系统，根据配置加载处理器。你需要实现处理初始化和运行循环的结构体。

**需要实现的关键 Traits：**

对于 **Ingress** (读取数据)：
通常创建一个 `struct`，从你的源读取并写入 `BipBufferWriter`。

```rust
// 伪代码结构
pub struct MqttIngress {
    // ... 连接详情
}

impl MqttIngress {
    pub fn run(&mut self, mut writer: BipBufferWriter) {
        loop {
            let message = self.mqtt_client.recv();
            // 将消息序列化为内部二进制格式
            // 写入到 'writer'
        }
    }
}
```

对于 **Egress** (写入数据)：
创建一个 `struct`，从 `BipBufferReader` 读取并写入你的目标。

```rust
// 伪代码结构
pub struct MqttEgress {
    // ... 连接详情
}

impl MqttEgress {
    pub fn run(&mut self, mut reader: BipBufferReader) {
        loop {
            if let Some(data) = reader.read() {
                // 反序列化 'data'
                // 发布到 MQTT broker
            }
        }
    }
}
```

### 3. 注册处理器
你必须更新主工厂逻辑（通常在 `framework/osdd` 或主二进制入口点中），以识别 `Config.toml` 中的新 `type = "ph_mqtt"` 字符串并实例化你的结构体。

## 处理数据格式

DDC 是载荷无关的 (payload-agnostic)，但 `ph_kafka` 使用通过 `bincode` 序列化的特定 `KafkaMessage` 结构体。

如果你要与现有生态系统集成，应该遵循此格式或以类似方式包装你的数据：

```rust
#[derive(Serialize, Deserialize)]
pub struct MyMessage {
    pub payload: Vec<u8>,
    pub metadata: String,
}
```

## 创建自定义过滤器

过滤器是最容易扩展的组件。

1.  查看 `filters/filter/src/lib.rs`。
2.  核心函数签名通常类似于：
    ```rust
    pub fn filtering(
        buffer: &[u8],
        length: usize,
        writer: &mut BipBufferWriter,
        // ... 自定义参数
    )
    ```
3.  **逻辑**：
    *   从 `buffer` 反序列化数据包。
    *   检查内容。
    *   **如果允许**：将其写入 `writer`（下一阶段）。
    *   **如果拒绝**：*不* 写入 `writer`，有效地将其丢弃。增加 `dropped_packets` 统计计数。

## 构建与测试

### 运行测试
使用标准的 Cargo 命令：
```bash
cargo test --workspace
```

### 发布构建 (Release)
```bash
cargo build --release
```

### 交叉编译
项目支持 ARM64（用于边缘设备）。
```bash
cross build --target aarch64-unknown-linux-gnu --release
```
