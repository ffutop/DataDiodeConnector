---
layout: pure
outline: deep
---

# Download & Install

DDC is designed to be Cloud-Native first. The recommended way to deploy is via **Helm Charts** on Kubernetes.

## Helm Charts (Recommended)

We publish official Helm Charts to ArtifactHub. You can deploy Ingress and Egress proxies independently.

<div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">

  <!-- Ingress Card -->
  <div class="border border-zinc-200 rounded-xl p-6 bg-zinc-50/50 hover:shadow-md transition-all">
    <div class="flex items-center gap-4 mb-4">
      <div class="h-12 w-12 bg-zinc-900 text-white rounded-lg flex items-center justify-center text-xl">
        <i class="fa-solid fa-cloud-arrow-down"></i>
      </div>
      <div>
        <h3 class="text-lg font-bold m-0! text-zinc-900">Ingress Proxy</h3>
        <p class="text-sm text-zinc-500 m-0!">For the High Security Side (Sender)</p>
      </div>
    </div>
    <div class="bg-white border border-zinc-200 rounded p-3 font-mono text-xs text-zinc-600 overflow-x-auto mb-4">
      helm install ddc-ingress ffutop/data-diode-connector-ingress
    </div>
    <a href="https://artifacthub.io/packages/helm/ffutop/data-diode-connector-ingress" target="_blank" class="inline-flex w-full items-center justify-center rounded-md border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50 transition-colors no-underline!">
      View on ArtifactHub <i class="fa-solid fa-arrow-up-right-from-square ml-2"></i>
    </a>
  </div>

  <!-- Egress Card -->
  <div class="border border-zinc-200 rounded-xl p-6 bg-zinc-50/50 hover:shadow-md transition-all">
    <div class="flex items-center gap-4 mb-4">
      <div class="h-12 w-12 bg-white border border-zinc-200 text-zinc-900 rounded-lg flex items-center justify-center text-xl">
        <i class="fa-solid fa-cloud-arrow-up"></i>
      </div>
      <div>
        <h3 class="text-lg font-bold m-0! text-zinc-900">Egress Proxy</h3>
        <p class="text-sm text-zinc-500 m-0!">For the Low Security Side (Receiver)</p>
      </div>
    </div>
    <div class="bg-white border border-zinc-200 rounded p-3 font-mono text-xs text-zinc-600 overflow-x-auto mb-4">
      helm install ddc-egress ffutop/data-diode-connector-egress
    </div>
    <a href="https://artifacthub.io/packages/helm/ffutop/data-diode-connector-egress" target="_blank" class="inline-flex w-full items-center justify-center rounded-md border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50 transition-colors no-underline!">
      View on ArtifactHub <i class="fa-solid fa-arrow-up-right-from-square ml-2"></i>
    </a>
  </div>

</div>

## Docker Images

For non-Kubernetes environments (e.g., Docker Compose or Edge Devices), you can pull images directly.

```bash
# Pull Ingress
docker pull ffutop/ddc-ingress:latest

# Pull Egress
docker pull ffutop/ddc-egress:latest
```

## Source Code

For maximum security compliance, you can build binaries from source.

[<i class="fa-brands fa-github"></i> View on GitHub](https://github.com/ffutop/DataDiodeConnector){.inline-flex .items-center .justify-center .rounded-md .bg-zinc-100 .px-4 .py-2 .text-sm .font-medium .text-zinc-900 .hover:bg-zinc-200 .transition-colors .no-underline!}
