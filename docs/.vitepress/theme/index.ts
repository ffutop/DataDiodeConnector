import DefaultTheme from 'vitepress/theme'
import HomeLayout from './components/HomeLayout.vue'
import Layout from './Layout.vue'
import './style.css'

export default {
  extends: DefaultTheme,
  Layout: Layout,
  enhanceApp({ app }) {
    app.component('HomeLayout', HomeLayout)
  }
}
