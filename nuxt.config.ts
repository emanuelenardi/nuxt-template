// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@nuxtjs/i18n',
    '@nuxtjs/seo',
    '@nuxt/a11y',
    '@vueuse/nuxt'
  ],

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  // Read by the Nuxt SEO modules: sitemap, robots, canonical and hreflang links, absolute OG URLs
  site: {
    url: 'https://nuxt-template.example.workers.dev',
    name: 'Nuxt Template'
  },

  compatibilityDate: '2026-11-01',

  // Every page is prerendered by `nuxt generate`, following the links from the home pages
  nitro: {
    prerender: {
      routes: ['/', '/en'],
      crawlLinks: true
    }
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },

  // Italian lives at the root, English under /en
  i18n: {
    defaultLocale: 'it',
    strategy: 'prefix_except_default',
    detectBrowserLanguage: {
      useCookie: false,
      redirectOn: 'root'
    },
    locales: [
      {
        code: 'it',
        language: 'it-IT',
        name: 'Italiano',
        file: 'it.json'
      },
      {
        code: 'en',
        language: 'en-US',
        name: 'English',
        file: 'en.json'
      }
    ]
  },

  // Generated OG images need @nuxt/fonts 1.0, while Nuxt UI 4.12 brings 0.14: off until it does
  ogImage: false,

  // A static site has no older deployment to serve
  skewProtection: false
})
