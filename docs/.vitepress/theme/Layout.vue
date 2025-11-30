<script setup>
import DefaultTheme from 'vitepress/theme'
import { useData } from 'vitepress'
import PureLayout from './components/PureLayout.vue'

const { Layout } = DefaultTheme
const { frontmatter } = useData()
</script>

<template>
  <PureLayout v-if="frontmatter.layout === 'pure'" />
  <Layout v-else />
</template>
