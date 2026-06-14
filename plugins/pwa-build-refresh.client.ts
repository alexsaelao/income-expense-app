const BUILD_CACHE_KEY = 'income-expense-note-build-id'

export default defineNuxtPlugin(async () => {
  if (!import.meta.client) return

  const config = useRuntimeConfig()
  const currentBuildId = String(config.public?.appBuildId ?? '').trim()
  if (!currentBuildId) return

  const storedBuildId = window.localStorage.getItem(BUILD_CACHE_KEY)
  if (storedBuildId === currentBuildId) return

  window.localStorage.setItem(BUILD_CACHE_KEY, currentBuildId)

  try {
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations()
      await Promise.all(registrations.map(registration => registration.unregister()))
    }

    if ('caches' in window) {
      const cacheKeys = await caches.keys()
      await Promise.all(cacheKeys.map(key => caches.delete(key)))
    }
  }
  catch {
    // Ignore cache cleanup failures and continue booting the current build.
  }

  if (storedBuildId && storedBuildId !== currentBuildId) {
    window.location.reload()
  }
})
