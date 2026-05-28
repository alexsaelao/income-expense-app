import type { Ref } from 'vue'

export {}

declare module '#app' {
  interface NuxtApp {
    $pwa?: {
      showInstallPrompt?: Ref<boolean>
      needRefresh?: Ref<boolean>
      install?: () => Promise<void>
      updateServiceWorker?: () => Promise<void>
    }
  }
}
