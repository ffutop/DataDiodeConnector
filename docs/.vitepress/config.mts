import { defineConfig, HeadConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'

const hostname = 'https://data-diode-connector.ffutop.com'

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
    ['link', { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Risque&display=swap' }],

    // Google Analytics 4 (GA4)
    [
      'script',
      { async: '', src: 'https://www.googletagmanager.com/gtag/js?id=G-CXJFXYK0H6' }
    ],
    [
      'script',
      {},
      `window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-CXJFXYK0H6');`
    ]
  ],

  cleanUrls: true,
  lastUpdated: true,

  transformHead: ({ pageData }) => {
    const head: HeadConfig[] = []
    
    // 1. Canonical URL
    // Remove leading slash from relativePath if exists
    const cleanPath = pageData.relativePath.replace(/((^|\/)index)?\.md$/, '$2')
    const canonicalUrl = `${hostname}/${cleanPath}`
      .replace(/\/$/, '') // remove trailing slash

    head.push(['link', { rel: 'canonical', href: canonicalUrl }])

    // 2. Hreflang (Multi-language SEO)
    let alternatePath = ''
    let currentLang = ''
    let alternateLang = ''

    if (pageData.relativePath.startsWith('en/')) {
      currentLang = 'en'
      alternateLang = 'zh-CN'
      alternatePath = pageData.relativePath.replace(/^en\//, 'zh-CN/')
    } else if (pageData.relativePath.startsWith('zh-CN/')) {
      currentLang = 'zh-CN'
      alternateLang = 'en'
      alternatePath = pageData.relativePath.replace(/^zh-CN\//, 'en/')
    }

    if (alternatePath) {
      const altCleanPath = alternatePath.replace(/((^|\/)index)?\.md$/, '$2')
      const altUrl = `${hostname}/${altCleanPath}`.replace(/\/$/, '')
      
      head.push(['link', { rel: 'alternate', hreflang: alternateLang, href: altUrl }])
      head.push(['link', { rel: 'alternate', hreflang: currentLang, href: canonicalUrl }])
    }

    // 3. Open Graph / Social Metadata
    head.push(['meta', { property: 'og:site_name', content: 'Data Diode Connector' }])
    head.push(['meta', { property: 'og:title', content: pageData.frontmatter.title ? `${pageData.frontmatter.title} | Data Diode Connector` : 'Data Diode Connector' }])
    head.push(['meta', { property: 'og:description', content: pageData.frontmatter.description || "Secure, high-performance, unidirectional data transfer suite powered by Rust." }])
    head.push(['meta', { property: 'og:url', content: canonicalUrl }])
    
    const ogImage = pageData.frontmatter.image || '/og-image.png' 
    if (ogImage) {
        head.push(['meta', { property: 'og:image', content: `${hostname}${ogImage}` }])
        head.push(['meta', { name: 'twitter:image', content: `${hostname}${ogImage}` }])
    }

    // 4. Twitter Card
    head.push(['meta', { name: 'twitter:card', content: 'summary_large_image' }])
    head.push(['meta', { name: 'twitter:title', content: pageData.frontmatter.title || 'Data Diode Connector' }])
    head.push(['meta', { name: 'twitter:description', content: pageData.frontmatter.description || "Secure, high-performance, unidirectional data transfer suite powered by Rust." }])

    // 5. JSON-LD Structured Data
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "TechArticle",
      "headline": pageData.frontmatter.title || "Data Diode Connector Documentation",
      "image": [`${hostname}${ogImage}`],
      "datePublished": "2025-11-28T08:00:00+08:00", // Ideally fetch from git creation time if possible, or omit
      "dateModified": pageData.lastUpdated ? new Date(pageData.lastUpdated).toISOString() : new Date().toISOString(),
      "author": {
        "@type": "Person",
        "name": "ffutop",
        "url": hostname
      }
    }
    head.push(['script', { type: 'application/ld+json' }, JSON.stringify(jsonLd)])

    return head
  },

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
  sitemap: {
    hostname: 'https://data-diode-connector.ffutop.com',
    lastmodDateOnly: false,
  },
}));