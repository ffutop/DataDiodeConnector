# Kernel-Level Performance Tuning for DDC

While DDC is designed for high performance with its Rust implementation, lock-free buffers, and efficient data handling, achieving maximum throughput, especially at 1Gbps or 10Gbps line rates, often requires tuning the underlying operating system kernel. DDC operates at the user-space application layer, but its performance is fundamentally limited by how efficiently the Linux kernel handles network packets and CPU resources.

This guide focuses on Linux kernel parameters and system configurations that can significantly impact DDC's UDP-based transport performance.

## UDP Socket Buffer Sizes

The most common bottleneck for high-speed UDP applications is the kernel's default buffer sizes for UDP sockets. If the kernel's receive buffer fills up before DDC (or any user-space application) can read the packets, the kernel will silently drop incoming packets. Similarly, a small send buffer can limit how much data DDC can queue for transmission.

### Key `sysctl` Parameters:

- **`net.core.rmem_max`**: Maximum size of the receive buffer in bytes for all types of sockets.
- **`net.core.wmem_max`**: Maximum size of the send buffer in bytes for all types of sockets.
- **`net.core.rmem_default`**: Default size of the receive buffer for all types of sockets.
- **`net.core.wmem_default`**: Default size of the send buffer for all types of sockets.

*Example Recommendation (for 10Gbps+ environments):*

```bash
# Temporarily set (resets on reboot)
sudo sysctl -w net.core.rmem_max=67108864   # 64 MB
sudo sysctl -w net.core.wmem_max=67108864   # 64 MB
sudo sysctl -w net.core.rmem_default=67108864
sudo sysctl -w net.core.wmem_default=67108864

# For permanent change, add to /etc/sysctl.conf
# net.core.rmem_max = 67108864
# net.core.wmem_max = 67108864
# net.core.rmem_default = 67108864
# net.core.wmem_default = 67108864
```

### Monitoring UDP Buffer Overruns:

Use `netstat -su` or `ss -su` to monitor receive and send buffer errors. Look for the "receive buffer errors" or "packets dropped" counts.

```bash
netstat -su
# ...
# Udp:
#     ...
#     65535 packets dropped
#     ...
```

## CPU Affinity and Interrupts

Network packet processing, especially on multi-core systems, can benefit significantly from CPU pinning and interrupt balancing.

### CPU Affinity for DDC Processes:

Dedicate specific CPU cores to the DDC Ingress/Egress processes. This reduces context switching and ensures that DDC has exclusive access to CPU resources.

*Example (pin process to CPU 1 and 2):*

```bash
sudo taskset -c 1,2 <ddc_process_id>
```

### Interrupt Request (IRQ) Affinity:

Ensure that network card interrupts are processed by dedicated CPU cores, ideally different from those running DDC processes. This prevents the DDC application from contending with NIC interrupts for CPU time. Tools like `irqbalance` can automate this, but for critical high-performance setups, manual pinning via `/proc/irq/<IRQ_NUMBER>/smp_affinity` might be necessary.

## Network Interface Card (NIC) Offloading

Modern NICs can offload various tasks from the CPU, significantly improving network performance. However, some offloading features might interfere with deep packet inspection if DDC were to perform such analysis at the raw packet level. For DDC's current model (where protocol handlers process already received application data), offloading is generally beneficial.

### Key `ethtool` Parameters:

- **Generic Receive Offload (GRO)**: Consolidates multiple incoming packets into a larger super-packet before passing them to the kernel. This reduces the number of packets the kernel has to process.
- **Generic Segmentation Offload (GSO)**: Does the opposite for outgoing packets, allowing DDC to send a large data chunk that the NIC then segments into multiple smaller packets.
- **Checksum Offload (Tx/Rx)**: NIC calculates/verifies checksums instead of the CPU.

*Example (check status and enable):*

```bash
# Check current status for an interface (e.g., eth0)
sudo ethtool -k eth0

# Enable GRO/GSO/Checksums (often enabled by default)
sudo ethtool -K eth0 gro on gso on tx-checksum-ip-generic on rx-checksum-ip-generic on
```

## Interrupt Coalescing

Interrupt coalescing groups multiple hardware interrupts from the NIC into a single CPU interrupt. This reduces CPU overhead but can slightly increase latency.

### Key `ethtool` Parameters:

- **`rx-frames`**: Number of received frames before an interrupt is generated.
- **`rx-usecs`**: Microseconds to wait before generating an interrupt.

Adjusting these parameters is a trade-off: higher values (more coalescing) lead to lower CPU utilization but higher latency; lower values (less coalescing) lead to higher CPU utilization but lower latency. For DDC, especially when `send_delay_ms=0`, a balance is key.

*Example (adjust coalescing):*

```bash
# Check current settings
sudo ethtool -c eth0

# Set a custom value (e.g., more aggressive coalescing)
sudo ethtool -C eth0 rx-frames 256 rx-usecs 250
```

## Jumbo Frames

If your entire network path (NICs, switches, routers) supports it, enabling Jumbo Frames (larger MTU, e.g., 9000 bytes instead of 1500) can reduce packet overhead and CPU cycles by allowing more data per packet.

*Example (set MTU to 9000):*

```bash
sudo ip link set dev eth0 mtu 9000
```

> **Warning**: Ensure all devices in the path support the larger MTU, otherwise, packets will be fragmented or dropped, leading to worse performance.

## Monitoring Tools

To effectively tune, continuous monitoring is crucial:

- **`netstat -su` / `ss -su`**: UDP packet statistics, including dropped packets.
- **`sar -n UDP 1`**: Real-time UDP traffic and errors.
- **`mpstat -P ALL 1`**: Per-CPU utilization.
- **`top` / `htop`**: Overall system resource usage.
- **`dmesg`**: Kernel logs for network-related errors.
- **`/proc/interrupts`**: Interrupt counts per CPU.

## Conclusion

Optimizing DDC performance, particularly for high-throughput scenarios, extends beyond application-level configuration. By strategically tuning kernel parameters related to UDP buffering, CPU scheduling, NIC offloading, and interrupt handling, administrators can unlock the full potential of their hardware and achieve reliable, high-speed data transfer across the data diode. Always test changes thoroughly in a controlled environment.
