import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'

// https://vitepress.dev/reference/site-config
export default withMermaid(defineConfig({
  title: "Data Diode Connector",
  description: "Secure, high-performance, unidirectional data transfer suite powered by Rust.",

  // Favicon settings
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['link', { rel: 'stylesheet', href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css' }],
    // Google Fonts: Risque
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],
    ['link', { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Risque&display=swap' }]
  ],

  cleanUrls: true,

  // Default Theme Config (Shared)
  themeConfig: {
    // Social Links (Shared)
    socialLinks: [
      { icon: 'github', link: 'https://github.com/ffutop/DataDiodeConnector' }
    ],

    // Search (Shared)
    search: {
      provider: 'local'
    },
  },

  // Locales Configuration
  locales: {
    // ----------------------------------------------------------------//
    // English (Default/Root)
    // ----------------------------------------------------------------//
    root: {
      label: 'English',
      lang: 'en',
      link: '/en/',

      themeConfig: {
        nav: [
          { text: 'Home', link: '/en/' },
          { text: 'Guide', link: '/en/software_architecture' },
          { text: 'Config', link: '/en/configuration_reference' },
          { text: 'Download', link: '/en/download' },
          { text: 'Commercial', link: '/en/commercial' },
        ],

        sidebar: [
          {
            text: 'Architecture',
            collapsed: false,
            items: [
              { text: 'Software Architecture', link: '/en/software_architecture' },
              { text: 'Deployment Topologies', link: '/en/deployment_topologies' },
              { text: 'Security Model', link: '/en/security_model' },
              { text: 'Protocol Specification', link: '/en/protocol' },
            ]
          },
          {
            text: 'Operations & Tuning',
            collapsed: false,
            items: [
              { text: 'Configuration Reference', link: '/en/configuration_reference' },
              { text: 'Operations Guide', link: '/en/operations_guide' },
              { text: 'Flow Control', link: '/en/flow_control' },
              { text: 'Kernel Tuning', link: '/en/kernel_tuning' },
            ]
          },
        ],

        footer: {
          copyright: 'Copyright © 2025 ffutop'
        },

        editLink: {
          pattern: 'https://github.com/ffutop/DataDiodeConnector/edit/master/docs/:path',
          text: 'Edit this page on GitHub'
        }
      }
    },

    // ----------------------------------------------------------------//
    // Chinese (zh-CN)
    // ----------------------------------------------------------------//
    'zh-CN': {
      label: '简体中文',
      lang: 'zh-CN',
      link: '/zh-CN/',

      themeConfig: {
        nav: [
          { text: '首页', link: '/zh-CN/' },
          { text: '指南', link: '/zh-CN/software_architecture' },
          { text: '配置', link: '/zh-CN/configuration_reference' },
          { text: '下载', link: '/zh-CN/download' },
          { text: '商业版', link: '/zh-CN/commercial' },
        ],

        sidebar: [
          {
            text: '架构设计',
            collapsed: false,
            items: [
              { text: '软件架构', link: '/zh-CN/software_architecture' },
              { text: '部署拓扑与高可用', link: '/zh-CN/deployment_topologies' },
              { text: '安全模型', link: '/zh-CN/security_model' },
              { text: '协议规范', link: '/zh-CN/protocol' },
            ]
          },
          {
            text: '运维与调优',
            collapsed: false,
            items: [
              { text: '配置参考手册', link: '/zh-CN/configuration_reference' },
              { text: '运维指南', link: '/zh-CN/operations_guide' },
              { text: '流量控制', link: '/zh-CN/flow_control' },
              { text: '内核调优', link: '/zh-CN/kernel_tuning' },
            ]
          },
        ],

        footer: {
          message: '基于 Apache-2.0 许可发布',
          copyright: '版权所有 © 2020-2025 Ministerie van Defensie & 贡献者'
        },

        editLink: {
          pattern: 'https://github.com/ffutop/DataDiodeConnector/edit/master/docs/:path',
          text: '在 GitHub 上编辑此页'
        },

        // Translate other UI elements
        docFooter: {
          prev: '上一页',
          next: '下一页'
        },
        outline: {
          label: '页面导航'
        },
        lastUpdated: {
          text: '最后更新于'
        },
        returnToTopLabel: '回到顶部',
        sidebarMenuLabel: '菜单',
        darkModeSwitchLabel: '主题',
        lightModeSwitchTitle: '切换到浅色模式',
        darkModeSwitchTitle: '切换到深色模式'
      }
    }
  },
  mermaid: {
    // refer https://mermaid.js.org/config/setup/modules/mermaidAPI.html#mermaidapi-configuration-defaults for options                                                                       
  },
  // optionally set additional config for plugin itself with MermaidPluginConfig                                                                                                             
  mermaidPlugin: {
    class: "mermaid", // set additional css classes for parent container                                                                                                                     
  },
  markdown: {
    math: true,
  },
}));