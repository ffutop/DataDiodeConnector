---
layout: pure
outline: deep
---

# 下载与安装

DDC 遵循“云原生优先”的设计理念。在生产环境中，我们强烈建议通过 **Helm Charts** 在 Kubernetes 上进行部署。

## Helm Charts (推荐)

我们已在 ArtifactHub 发布了官方 Helm Charts。您可以独立部署 Ingress（入口）和 Egress（出口）代理。

<div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">

  <!-- Ingress Card -->
  <div class="border border-zinc-200 rounded-xl p-6 bg-zinc-50/50 hover:shadow-md transition-all">
    <div class="flex items-center gap-4 mb-4">
      <div class="h-12 w-12 bg-zinc-900 text-white rounded-lg flex items-center justify-center text-xl">
        <i class="fa-solid fa-cloud-arrow-down"></i>
      </div>
      <div>
        <h3 class="text-lg font-bold m-0! text-zinc-900">Ingress Proxy (入口)</h3>
        <p class="text-sm text-zinc-500 m-0!">部署于高安全区 (发送端)</p>
      </div>
    </div>
    <div class="bg-white border border-zinc-200 rounded p-3 font-mono text-xs text-zinc-600 overflow-x-auto mb-4">
      helm install ddc-ingress ffutop/data-diode-connector-ingress
    </div>
    <a href="https://artifacthub.io/packages/helm/ffutop/data-diode-connector-ingress" target="_blank" class="inline-flex w-full items-center justify-center rounded-md border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50 transition-colors no-underline!">
      访问 ArtifactHub <i class="fa-solid fa-arrow-up-right-from-square ml-2"></i>
    </a>
  </div>

  <!-- Egress Card -->
  <div class="border border-zinc-200 rounded-xl p-6 bg-zinc-50/50 hover:shadow-md transition-all">
    <div class="flex items-center gap-4 mb-4">
      <div class="h-12 w-12 bg-white border border-zinc-200 text-zinc-900 rounded-lg flex items-center justify-center text-xl">
        <i class="fa-solid fa-cloud-arrow-up"></i>
      </div>
      <div>
        <h3 class="text-lg font-bold m-0! text-zinc-900">Egress Proxy (出口)</h3>
        <p class="text-sm text-zinc-500 m-0!">部署于低安全区 (接收端)</p>
      </div>
    </div>
    <div class="bg-white border border-zinc-200 rounded p-3 font-mono text-xs text-zinc-600 overflow-x-auto mb-4">
      helm install ddc-egress ffutop/data-diode-connector-egress
    </div>
    <a href="https://artifacthub.io/packages/helm/ffutop/data-diode-connector-egress" target="_blank" class="inline-flex w-full items-center justify-center rounded-md border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50 transition-colors no-underline!">
      访问 ArtifactHub <i class="fa-solid fa-arrow-up-right-from-square ml-2"></i>
    </a>
  </div>

</div>

## Docker 镜像

对于非 Kubernetes 环境（如 Docker Compose 或边缘设备），您可以直接拉取镜像。

```bash
# 拉取入口代理
docker pull ffutop/ddc-ingress:latest

# 拉取出口代理
docker pull ffutop/ddc-egress:latest
```

## 源代码

为了满足最高级别的安全合规要求，您可以直接从源码构建二进制文件。

[<i class="fa-brands fa-github"></i> 访问 GitHub 仓库](https://github.com/ffutop/DataDiodeConnector){.inline-flex .items-center .justify-center .rounded-md .bg-zinc-100 .px-4 .py-2 .text-sm .font-medium .text-zinc-900 .hover:bg-zinc-200 .transition-colors .no-underline!}