---
layout: pure
outline: false
---

# 商业授权与定价

网闸连接器 (DDC) 致力于在保持开源核心活力的同时，为关键基础设施提供企业级的可靠性保障。

<div class="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">

  <!-- Community Plan -->
  <div class="flex flex-col p-8 bg-white border border-zinc-200 rounded-2xl shadow-sm">
    <div class="mb-4">
      <h3 class="text-2xl font-bold text-zinc-900">社区版 (Community)</h3>
      <p class="text-zinc-500 mt-2">适用于开发者和非关键业务负载。</p>
    </div>
    <div class="text-4xl font-bold text-zinc-900 mb-6">免费 <span class="text-lg font-normal text-zinc-400">/ 永久</span></div>
    <ul class="space-y-3 mb-8 flex-1">
      <li class="flex items-center gap-3 text-sm text-zinc-700">
        <i class="fa-solid fa-check text-green-500"></i> 核心 UDP 传输引擎
      </li>
      <li class="flex items-center gap-3 text-sm text-zinc-700">
        <i class="fa-solid fa-check text-green-500"></i> Kafka 入口/出口适配器
      </li>
      <li class="flex items-center gap-3 text-sm text-zinc-700">
        <i class="fa-solid fa-check text-green-500"></i> 基础过滤器 (正则、关键字)
      </li>
      <li class="flex items-center gap-3 text-sm text-zinc-700">
        <i class="fa-solid fa-check text-green-500"></i> 社区支持 (GitHub Issues)
      </li>
    </ul>
    <a href="/zh-CN/download" class="inline-flex w-full items-center justify-center rounded-lg border border-zinc-200 bg-white px-6 py-3 text-sm font-medium text-zinc-900 hover:bg-zinc-50 transition-colors no-underline!">
      立即下载
    </a>
  </div>

  <!-- Enterprise Plan -->
  <div class="flex flex-col p-8 bg-zinc-900 border border-zinc-900 rounded-2xl shadow-xl relative overflow-hidden">
    <!-- Badge -->
    <div class="absolute top-0 right-0 bg-white/10 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">推荐</div>
    <div class="mb-4">
      <h3 class="text-2xl font-bold text-white">企业版 (Enterprise)</h3>
      <p class="text-zinc-400 mt-2">适用于关键基础设施与合规场景。</p>
    </div>
    <div class="text-4xl font-bold text-white mb-6">联系询价</div>
    <ul class="space-y-3 mb-8 flex-1">
      <li class="flex items-center gap-3 text-sm text-zinc-300">
        <i class="fa-solid fa-check text-white"></i> <strong>包含社区版所有功能</strong>
      </li>
      <li class="flex items-center gap-3 text-sm text-zinc-300">
        <i class="fa-solid fa-check text-white"></i> 长期支持 (LTS) 二进制版本
      </li>
      <li class="flex items-center gap-3 text-sm text-zinc-300">
        <i class="fa-solid fa-check text-white"></i> 7x24小时 关键SLA支持
      </li>
      <li class="flex items-center gap-3 text-sm text-zinc-300">
        <i class="fa-solid fa-check text-white"></i> 高级 DPI & Schema 校验
      </li>
      <li class="flex items-center gap-3 text-sm text-zinc-300">
        <i class="fa-solid fa-check text-white"></i> 认证硬件兼容性保证
      </li>
    </ul>
    <a href="mailto:sales@datadiodeconnector.com" class="inline-flex w-full items-center justify-center rounded-lg bg-white px-6 py-3 text-sm font-bold text-zinc-900 hover:bg-zinc-100 transition-colors no-underline!">
      获取报价
    </a>
  </div>

</div>

## 功能对比详情

| 功能特性 | 社区版 (Community) | 企业版 (Enterprise) |
| :--- | :---: | :---: |
| **核心引擎** | | |
| Rust 高性能传输 | ✅ | ✅ |
| 10Gbps 线速支持 | ✅ | ✅ |
| 流量控制机制 | ✅ | ✅ |
| **协议支持** | | |
| Kafka (标准协议) | ✅ | ✅ |
| UDP / TCP | ✅ | ✅ |
| 定制私有协议适配 | ❌ | ✅ |
| **安全过滤** | | |
| 基础过滤 (正则/关键字) | ✅ | ✅ |
| 深度包检测 (DPI) | ❌ | ✅ |
| 业务 Schema 校验 (Avro/JSON) | ❌ | ✅ |
| **技术支持** | | |
| 支持渠道 | GitHub Issues | 专属工单门户 / Slack |
| 响应时间 (SLA) | 尽力而为 | < 1 小时 (严重级) |
| 长期支持版本 (LTS) | ❌ | ✅ |

## 申请试用

我们为企业用户提供 **30天全功能免费试用**，用于概念验证 (POC) 部署。

请发送您的项目需求至 [sales@datadiodeconnector.com](mailto:sales@datadiodeconnector.com) 获取试用授权许可。
