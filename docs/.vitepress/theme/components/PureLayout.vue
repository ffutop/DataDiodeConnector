<script setup>
import { Content } from 'vitepress/client'
import CustomNavbar from './CustomNavbar.vue'
import CustomFooter from './CustomFooter.vue'
</script>

<template>
  <div class="min-h-screen flex flex-col bg-white font-sans antialiased">
    <CustomNavbar />
    
    <main class="flex-1 pt-24 pb-16">
        <div class="container max-w-5xl mx-auto px-4 md:px-8">
             <!-- We use 'vp-doc' class to inherit standard markdown styles from VitePress theme
                  but we wrap it in our own layout constraints -->
             <div class="vp-doc">
                 <Content />
             </div>
        </div>
    </main>
    
    <CustomFooter />
  </div>
</template>
