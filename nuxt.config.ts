export default defineNuxtConfig({
  modules: ['@nuxt/ui', '@vite-pwa/nuxt'],
  css: ['~/assets/css/main.css'],
  devtools: { enabled: false },
  runtimeConfig: {
    tursoDatabaseUrl: process.env.TURSO_DATABASE_URL ?? '',
    tursoAuthToken: process.env.TURSO_AUTH_TOKEN ?? '',
    adminLoginIdentifier: process.env.ADMIN_LOGIN_IDENTIFIER ?? process.env.ADMIN_LOGIN_EMAIL ?? 'admin@local',
    adminLoginPin: process.env.ADMIN_LOGIN_PIN ?? '123456',
    adminSessionSecret: process.env.ADMIN_SESSION_SECRET ?? 'wallet-codesabai-admin-secret',
    userSessionSecret: process.env.USER_SESSION_SECRET ?? 'wallet-codesabai-user-secret'
  },
  app: {
    head: {
      title: 'Wallet Code Sabai',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover, interactive-widget=overlays-content' },
        { name: 'application-name', content: 'Wallet Code Sabai' },
        { name: 'description', content: 'Wallet Code Sabai is a mobile-first PWA for tracking wallets, transactions, and financial reports.' },
        { name: 'theme-color', content: '#0ea5e9' },
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
        { name: 'format-detection', content: 'telephone=no' }
      ],
      link: [
        { rel: 'manifest', href: '/manifest.webmanifest' },
        { rel: 'icon', type: 'image/svg+xml', href: '/wallet-codesabai-mark.svg' },
        { rel: 'icon', type: 'image/png', href: '/pwa-192x192.png' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' }
      ]
    },
    pageTransition: { name: 'page', mode: 'out-in' },
    layoutTransition: { name: 'layout', mode: 'out-in' }
  },
  ui: {
    theme: {
      colors: ['primary', 'secondary', 'success', 'info', 'warning', 'error', 'neutral']
    }
  },
  pwa: {
    registerType: 'autoUpdate',
    client: {
      installPrompt: true
    },
    includeAssets: ['offline.html', 'wallet-codesabai-mark.svg', 'apple-touch-icon.png', 'pwa-192x192.png', 'pwa-512x512.png', 'pwa-maskable-512x512.png'],
    manifest: {
      id: '/',
      name: 'Wallet Code Sabai',
      short_name: 'Wallet Sabai',
      description: 'A mobile-first personal finance PWA for recording income, expenses, transfers, loans, wallets, and reports.',
      theme_color: '#0ea5e9',
      background_color: '#0f172a',
      display_override: ['fullscreen', 'standalone'],
      display: 'standalone',
      orientation: 'portrait-primary',
      start_url: '/',
      scope: '/',
      lang: 'th',
      dir: 'ltr',
      launch_handler: {
        client_mode: 'focus-existing'
      },
      icons: [
        {
          src: '/wallet-codesabai-mark.svg',
          sizes: 'any',
          type: 'image/svg+xml',
          purpose: 'any'
        },
        {
          src: '/pwa-192x192.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'any'
        },
        {
          src: '/pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any'
        },
        {
          src: '/pwa-maskable-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable'
        }
      ]
    },
    workbox: {
      navigateFallback: '/offline',
      globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,webmanifest,json}'],
      cleanupOutdatedCaches: true,
    }
  }
})
