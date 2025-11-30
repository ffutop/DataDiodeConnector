<script setup>
import { useData, withBase } from 'vitepress'
import { computed, ref, onMounted, onUnmounted } from 'vue'

const { site, theme, lang } = useData()

// --- Navbar Logic ---
// Simplify logic: Trust VitePress 'theme' computed property which automatically merges current locale config
const navLinks = computed(() => {
  const currentLocale = lang.value
  const locales = site.value.locales
  let links = []

  // 1. Try specific locale (e.g., 'zh-CN')
  if (locales && locales[currentLocale] && locales[currentLocale].themeConfig?.nav) {
    links = [...locales[currentLocale].themeConfig.nav]
  }
  // 2. Try root locale (usually 'en' or 'root')
  else if (currentLocale === 'en' && locales?.root?.themeConfig?.nav) {
    links = [...locales.root.themeConfig.nav]
  }
  // 3. Fallback to current context theme.nav
  else {
    links = [...(theme.value.nav || [])]
  }
  // 4. Append Language Switcher if multiple locales exist
  if (locales && Object.keys(locales).length > 1) {
    const localeKeys = Object.keys(locales)
    const dropdownItems = localeKeys.map(key => ({
      text: locales[key].label,
      link: locales[key].link
    }))

    const currentLabel = locales[currentLocale]?.label || 'Language'
    links.push({
      text: 'Languages',
      items: dropdownItems
    })
  }
  return links
})

const isScrolled = ref(false)
const handleScroll = () => {
  isScrolled.value = window.scrollY > 20
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <!-- Custom Navbar (Transparent/Glassmorphic) -->
  <nav class="fixed top-0 left-0 right-0 z-50 h-16 transition-all duration-300 border-b"
    :class="isScrolled ? 'bg-white/80 backdrop-blur-md border-zinc-200 shadow-sm' : 'bg-transparent border-transparent'">
    <div class="container max-w-7xl mx-auto px-4 md:px-8 h-full flex items-center justify-between">

      <!-- Logo -->
      <a :href="withBase(lang === 'zh-CN' ? '/zh-CN/' : '/en/')" class="flex items-center gap-2 group">
        <span class="font-['Risque'] text-2xl text-zinc-900 opacity-90 hover:opacity-100">
          Data Diode Connector
        </span>
      </a>

      <!-- Desktop Nav Items -->
      <div class="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-500">

        <!-- Loop through Config Links -->
        <template v-for="item in navLinks" :key="item.text">

          <!-- Simple Link -->
          <a v-if="!item.items" :href="withBase(item.link)" class="hover:text-zinc-900 transition-colors">
            {{ item.text }}
          </a>

          <!-- Dropdown Menu (e.g. Language Switcher) -->
          <div v-else class="relative group h-full flex items-center">
            <button class="hover:text-zinc-900 transition-colors flex items-center gap-1 py-4">
              <!-- Special handling for VitePress-like icon names -->
              <i v-if="item.text === 'Languages'" class="fa-solid vpi-languages text-lg"></i>
              <span v-else>{{ item.text }}</span>
              <i class="fa-solid fa-chevron-down text-[10px] opacity-50"></i>
            </button>

            <!-- Dropdown Panel -->
            <div class="absolute right-0 top-full pt-2 hidden group-hover:block">
              <div
                class="bg-white border border-zinc-200 rounded-lg shadow-xl p-1 min-w-[140px] flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <a v-for="subItem in item.items" :key="subItem.text" :href="withBase(subItem.link)"
                  class="px-4 py-2 text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 text-sm transition-colors text-left block">
                  {{ subItem.text }}
                </a>
              </div>
            </div>
          </div>

        </template>

        <!-- Social Icon (Hardcoded to GitHub) -->
        <a href="https://github.com/ffutop/DataDiodeConnector" target="_blank"
          class="text-zinc-400 hover:text-zinc-900 transition-colors ml-2">
          <i class="fa-brands fa-github text-xl"></i>
        </a>

      </div>

      <!-- Mobile Menu Button (Placeholder) -->
      <button class="md:hidden p-2 text-zinc-500">
        <i class="fa-solid fa-bars text-xl"></i>
      </button>

    </div>
  </nav>
</template>