export default defineNuxtConfig({
  ssr: false,
  devtools: { enabled: false },
  modules: ['@nuxt/ui'],
  css: ['~/assets/css/main.css'],
  ignore: [
    'dist',
    'dist/**',
    '.output',
    '.output/**'
  ],
  experimental: {
    watcher: 'parcel'
  },
  vite: {
    server: {
      watch: {
        ignored: [
          '**/node_modules/**',
          '**/.git/**',
          '**/.nuxt/**',
          '**/.output/**',
          '**/dist/**'
        ]
      }
    }
  },
  app: {
    head: {
      title: 'Wallet Code Sabai',
      meta: [
        { name: 'description', content: 'Wallet Code Sabai is a clean, offline-first landing page for a modern finance app.' },
        { name: 'theme-color', content: '#f8fafc' },
      ],
      link: [
        { rel: 'icon', href: './wallet-codesabai-mark.svg', type: 'image/svg+xml' },
        { rel: 'apple-touch-icon', href: './wallet-codesabai-mark.svg', type: 'image/svg+xml' },
      ],
    },
  },
})
