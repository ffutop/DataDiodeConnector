<script setup>
import { useData, withBase, useRouter } from 'vitepress'
import { computed, ref, onMounted, onUnmounted } from 'vue'
import CustomNavbar from './CustomNavbar.vue'
import CustomFooter from './CustomFooter.vue'

const { site, theme, lang } = useData()
const router = useRouter()

// --- i18n Content Logic ---
const i18n = {
  en: {
    badge: 'v1.0.0 Engineering Ready',
    titlePrefix: 'Data Diode Connector',
    titleSuffix: 'Secure. Unidirectional. Cloud-Native.',
    desc: 'DDC is a Rust-based, high-performance software suite for unidirectional networks. Acts as the intelligent glue between your applications and physical data diodes, handling protocol conversion, flow control, and deep security filtering.',
    btnStart: 'Get Started',
    linkStart: '/en/configuration_reference',
    btnGithub: 'GitHub',
    archTitle: 'How It Works',
    archDesc: 'DDC bridges the gap by normalizing complex application protocols into a streamlined, unidirectional UDP flow, ensuring reliability without back-pressure.',
    nodeIngress: 'Ingress Proxy',
    nodeIngressSub: 'High Security Side',
    nodeEgress: 'Egress Proxy',
    nodeEgressSub: 'Low Security Side',
    labelOneWay: 'One Way',
    labelGap: 'Network Gap',
    compProtocol: 'Protocol Handler',
    compFilter: 'Filter Chain',
    compEncoder: 'UDP Encoder',
    compDecoder: 'UDP Decoder',
    compRebuilder: 'Protocol Rebuilder',
    compDest: 'Destination',
    featTitle: 'Everything you need for secure bridging.',
    featDesc: 'Built for engineers, by engineers. DDC combines strict network isolation with the performance of Rust and the ease of Cloud-Native tools.',
    features: [
      { title: 'Protocol Agnostic', desc: "Don't be limited to raw UDP. Native adapters for Kafka, MQTT, and more allow you to stream application data without modifying your code." },
      { title: 'Blazing Fast', desc: 'Powered by Rust. Utilizes lock-free ring buffers and zero-copy mechanisms to saturate 10Gbps links with minimal latency.' },
      { title: 'Deep Security', desc: 'WAF-grade filtering. Inspect payloads before they leave the secure zone with regex, schema validation, and content sanitization.' },
      { title: 'Cloud Native', desc: 'Deploy effortlessly with Helm Charts on Kubernetes. Full observability with Prometheus metrics and structured logging.' },
      { title: 'Flow Control', desc: 'Prevents silent packet loss. Application-layer rate limiting ensures data integrity even without physical back-pressure.' },
      { title: 'Multi-Architecture', desc: 'Build once, run anywhere. Native support for AMD64 and ARM64 ensures compatibility with servers, cloud instances, and edge gateways.' }
    ]
  },
  'zh-CN': {
    badge: 'v1.0.0 工程就绪',
    titlePrefix: '网闸连接器',
    titleSuffix: '绝对单向 至臻安全',
    desc: '网闸连接器 (Data Diode Connector, DDC) 是一款基于 Rust 编写的、云原生架构的高性能数据单向传输套件。作为物理网闸的智能驱动，解决隔离环境下的 Kafka、UDP 等数据跨网难题。',
    btnStart: '开始使用',
    linkStart: '/zh-CN/configuration_reference',
    btnGithub: 'GitHub',
    archTitle: '工作原理',
    archDesc: '网闸连接器充当应用程序与物理网闸之间的智能粘合剂，处理协议转换、安全过滤与传输可靠性。',
    nodeIngress: '入口代理',
    nodeIngressSub: '高安全区 (High Side)',
    nodeEgress: '出口代理',
    nodeEgressSub: '低安全区 (Low Side)',
    labelOneWay: '单向传输',
    labelGap: '物理隔离 (Air Gap)',
    compProtocol: '协议适配',
    compFilter: '深度过滤',
    compEncoder: '极速编码',
    compDecoder: '极速解码',
    compRebuilder: '协议重组',
    compDest: '目标系统',
    featTitle: '为云原生时代打造的生产级方案。',
    featDesc: '告别脆弱的脚本。网闸连接器将 Rust 的内存安全性与现代基础设施的易用性完美融合。',
    features: [
      { title: '协议无关', desc: '不只是 UDP。网闸连接器内置 Kafka、MQTT 等适配器，将复杂的应用层协议标准化为单向流，无需修改业务代码。' },
      { title: '极致性能', desc: '基于 Rust 构建，利用 RingBuffer 无锁队列与零拷贝技术。单核即可跑满千兆链路，多核轻松应对万兆流量。' },
      { title: '深度防御', desc: '内置 WAF 级过滤器。支持正则匹配、Schema 校验及敏感词脱敏。在数据离开安全区前，进行最后一道严格清洗。' },
      { title: '云原生', desc: '告别手动部署。提供 Helm Charts 与 Docker 镜像，支持 Prometheus 指标监控。像管理微服务一样管理网闸连接。' },
      { title: '流量整形', desc: '内置应用层流控机制，精确控制发送速率，防止因下游处理不及而导致的静默丢包。' },
      { title: '多架构支持', desc: '原生支持 x86_64 和 ARM64。无论是数据中心服务器还是边缘网关，都能稳定运行。' }
    ]
  }
}

const t = computed(() => {
  return i18n[lang.value] || i18n.en
})

</script>

<template>
  <div class="home-container antialiased bg-white min-h-screen flex flex-col">
    
    <CustomNavbar />

    <!-- Hero Section -->
    <section class="relative space-y-6 pb-8 pt-24 md:pb-12 md:pt-32 lg:py-40 overflow-hidden">
        <!-- Background Gradient Effect -->
        <div class="absolute inset-0 -z-10 h-full w-full bg-white bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-100 via-white to-white"></div>

        <div class="container max-w-5xl mx-auto px-4 md:px-8 flex flex-col items-center gap-6 text-center">
            
            <div class="inline-flex items-center rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-800 shadow-sm">
                <span class="flex h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                {{ t.badge }}
            </div>

            <h1 class="font-bold text-4xl sm:text-6xl md:text-7xl tracking-tighter text-zinc-900 max-w-4xl">
                {{ t.titlePrefix }} <br class="hidden sm:inline" />
                <span class="text-zinc-500">{{ t.titleSuffix }}</span>
            </h1>

            <p class="max-w-[42rem] leading-normal text-zinc-500 sm:text-xl sm:leading-8">
                {{ t.desc }}
            </p>

            <div class="flex flex-wrap items-center justify-center gap-4 mt-6">
                <a :href="withBase(t.linkStart)" class="inline-flex h-11 items-center justify-center rounded-md bg-zinc-900 px-8 text-sm font-medium text-white shadow transition-colors hover:bg-zinc-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                    {{ t.btnStart }}
                </a>
                <a href="https://github.com/ffutop/DataDiodeConnector" target="_blank" class="inline-flex h-11 items-center justify-center rounded-md border border-zinc-200 bg-white px-8 text-sm font-medium shadow-sm transition-colors hover:bg-zinc-50 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                    <i class="fa-brands fa-github mr-2"></i> {{ t.btnGithub }}
                </a>
            </div>
        </div>
    </section>

    <!-- Architecture Section -->
    <section id="architecture" class="container max-w-7xl mx-auto px-4 md:px-8 py-24">
        <div class="mb-16 text-center">
            <h2 class="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl mb-4">{{ t.archTitle }}</h2>
            <p class="text-lg text-zinc-500 max-w-2xl mx-auto">
                {{ t.archDesc }}
            </p>
        </div>

        <!-- Modern Diagram -->
        <div class="relative bg-zinc-50/50 border border-zinc-200 rounded-xl p-8 md:p-16 overflow-hidden">
            <!-- Background Grid Pattern -->
            <div class="absolute inset-0 opacity-[0.03]" style="background-image: radial-gradient(#000 1px, transparent 1px); background-size: 24px 24px;"></div>

            <div class="relative flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16">
                
                <!-- Ingress Node -->
                <div class="flex flex-col items-center gap-4 z-10 w-full lg:w-auto lg:flex-1">
                    <div class="w-full bg-white rounded-xl border border-zinc-200 shadow-sm p-6 hover:shadow-md transition-shadow">
                        <div class="flex items-center gap-3 mb-4">
                            <div class="p-2 bg-zinc-100 rounded-lg">
                                <i class="fa-solid fa-cloud-arrow-down text-zinc-700"></i>
                            </div>
                            <div>
                                <h3 class="font-semibold text-sm text-zinc-900">{{ t.nodeIngress }}</h3>
                                <p class="text-xs text-zinc-500">{{ t.nodeIngressSub }}</p>
                            </div>
                        </div>
                        <div class="flex flex-wrap justify-center sm:justify-start gap-2">
                            <div class="bg-zinc-50 border border-dashed border-zinc-200 rounded flex items-center justify-center px-3 py-2 text-xs text-zinc-500 flex-grow">
                                <i class="fa-brands fa-docker mr-2"></i> {{ t.compProtocol }}
                            </div>
                            <div class="bg-zinc-50 border border-dashed border-zinc-200 rounded flex items-center justify-center px-3 py-2 text-xs text-zinc-500 flex-grow">
                                <i class="fa-solid fa-filter mr-2"></i> {{ t.compFilter }}
                            </div>
                            <div class="bg-zinc-900 text-white rounded flex items-center justify-center px-3 py-2 text-xs font-mono flex-grow">
                                <i class="fa-solid fa-compress-alt mr-2"></i> {{ t.compEncoder }}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Diode Link -->
                <div class="flex flex-col items-center gap-2 z-10">
                    <div class="text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1">{{ t.labelOneWay }}</div>
                    <div class="flex items-center gap-[-1px]">
                        <div class="w-16 h-[2px] bg-zinc-300"></div>
                        <div class="h-12 w-12 bg-white border-2 border-zinc-900 rounded-full flex items-center justify-center shadow-xl z-20">
                            <i class="fa-solid fa-arrow-right text-zinc-900"></i>
                        </div>
                        <div class="w-16 h-[2px] bg-zinc-300"></div>
                    </div>
                    <div class="text-xs font-medium text-zinc-500 mt-2">{{ t.labelGap }}</div>
                </div>

                <!-- Egress Node -->
                <div class="flex flex-col items-center gap-4 z-10 w-full lg:w-auto lg:flex-1">
                    <div class="w-full bg-white rounded-xl border border-zinc-200 shadow-sm p-6 hover:shadow-md transition-shadow">
                        <div class="flex items-center gap-3 mb-4">
                            <div class="p-2 bg-zinc-100 rounded-lg">
                                <i class="fa-solid fa-cloud-arrow-up text-zinc-700"></i>
                            </div>
                            <div>
                                <h3 class="font-semibold text-sm text-zinc-900">{{ t.nodeEgress }}</h3>
                                <p class="text-xs text-zinc-500">{{ t.nodeEgressSub }}</p>
                            </div>
                        </div>
                        <div class="flex flex-wrap justify-center sm:justify-start gap-2">
                            <div class="bg-zinc-900 text-white rounded flex items-center justify-center px-3 py-2 text-xs font-mono flex-grow">
                                <i class="fa-solid fa-expand-alt mr-2"></i> {{ t.compDecoder }}
                            </div>
                            <div class="bg-zinc-50 border border-dashed border-zinc-200 rounded flex items-center justify-center px-3 py-2 text-xs text-zinc-500 flex-grow">
                                <i class="fa-solid fa-rotate mr-2"></i> {{ t.compRebuilder }}
                            </div>
                            <div class="bg-zinc-50 border border-dashed border-zinc-200 rounded flex items-center justify-center px-3 py-2 text-xs text-zinc-500 flex-grow">
                                <i class="fa-solid fa-paper-plane mr-2"></i> {{ t.compDest }}
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </section>

    <!-- Features Section -->
    <section id="features" class="container max-w-7xl mx-auto px-4 md:px-8 py-24">
        <div class="mb-16 text-center max-w-3xl mx-auto">
            <h2 class="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl mb-4">{{ t.featTitle }}</h2>
            <p class="text-lg text-zinc-500">
                {{ t.featDesc }}
            </p>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            <div v-for="(feat, index) in t.features" :key="index" class="rounded-xl border border-zinc-200 bg-white text-zinc-900 shadow-sm p-6 hover:bg-zinc-50/50 transition-colors">
                <div class="h-10 w-10 rounded-lg bg-zinc-100 flex items-center justify-center mb-4">
                    <!-- Icons map -->
                    <i v-if="index === 0" class="fa-solid fa-shield-cat text-zinc-900"></i>
                    <i v-if="index === 1" class="fa-brands fa-docker text-zinc-900"></i>
                    <i v-if="index === 2" class="fa-solid fa-filter text-zinc-900"></i>
                    <i v-if="index === 3" class="fa-solid fa-bolt text-zinc-900"></i>
                    <i v-if="index === 4" class="fa-solid fa-chart-line text-zinc-900"></i>
                    <i v-if="index === 5" class="fa-brands fa-linux text-zinc-900"></i>
                </div>
                <h3 class="font-semibold text-lg mb-2">{{ feat.title }}</h3>
                <p class="text-zinc-500 text-sm">
                    {{ feat.desc }}
                </p>
            </div>

        </div>
    </section>

    <CustomFooter />

  </div>
</template>

<style scoped>
.home-container {
    font-family: 'Inter', sans-serif;
}
</style>
