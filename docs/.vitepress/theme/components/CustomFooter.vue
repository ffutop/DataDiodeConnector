<script setup>
import { useData, withBase } from 'vitepress'
import { computed } from 'vue'

const { lang } = useData()

const i18n = {
  en: {
    copyrightText: 'Data Diode Connector © 2025 ffutop',
    footerDocs: 'Documentation',
    footerLinkDocs: '/en/software_architecture',
    friendLinksLabel: 'Friends:',
    friendLinks: [
      { text: 'Modbus Gateway', link: 'https://www.ffutop.com/modbus-gateway/' }
    ]
  },
  'zh-CN': {
    copyrightText: '网闸连接器 © 2025 ffutop',
    footerDocs: '文档',
    footerLinkDocs: '/zh-CN/software_architecture',
    friendLinksLabel: '友链:',
    friendLinks: [
      { text: 'Modbus Gateway', link: 'https://www.ffutop.com/modbus-gateway/' }
    ]
  }
}

const t = computed(() => {
  return i18n[lang.value] || i18n.en
})
</script>

<template>
    <footer class="border-t border-zinc-200 bg-zinc-50 mt-auto">
        <div class="container max-w-7xl mx-auto px-4 md:px-8 py-12">
            <div class="flex flex-col md:flex-row items-center gap-8 text-sm">
                
                <!-- Left: Friend Links -->
                <div class="flex flex-wrap gap-2 order-2 md:order-1 flex-1 justify-center md:justify-start">
                    <a v-for="(friend, index) in t.friendLinks" 
                       :key="index" 
                       :href="friend.link" 
                       target="_blank" 
                       class="group flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-full border border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 hover:border-zinc-300 transition-all no-underline"
                    >
                        {{ friend.text }}
                        <i class="fa-solid fa-arrow-up-right-from-square text-[9px] opacity-40 group-hover:opacity-100 transition-opacity"></i>
                    </a>
                </div>

                <!-- Center: Copyright -->
                <div class="text-zinc-500 font-medium order-1 md:order-2 flex-grow-0 text-center">
                    {{ t.copyrightText }}
                </div>

                <!-- Right: Primary Navigation -->
                <div class="flex gap-6 font-medium text-zinc-600 order-3 md:order-3 flex-1 justify-center md:justify-end">
                    <a href="https://github.com/ffutop/DataDiodeConnector" class="hover:text-zinc-900 transition-colors">GitHub</a>
                    <a :href="withBase(t.footerLinkDocs)" class="hover:text-zinc-900 transition-colors">{{ t.footerDocs }}</a>
                </div>

            </div>
        </div>
    </footer>
</template>


