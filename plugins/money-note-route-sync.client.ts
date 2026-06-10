const ROUTES_TO_SYNC = [
  /^\/$/,
  /^\/add(?:\/|$)/,
  /^\/settings(?:\/|$)/,
  /^\/transactions(?:\/|$)/,
  /^\/wallets(?:\/|$)/,
  /^\/reports(?:\/|$)/
]

function shouldSyncRoute(path: string) {
  return ROUTES_TO_SYNC.some(pattern => pattern.test(path))
}

export default defineNuxtPlugin(() => {
  const route = useRoute()
  const { authReady, sessionProfile } = useDeviceAuth()
  const { refreshCloudState, autoSyncReady, isCloudSyncEnabled } = useMoneyNote()
  let routeSyncTimer: ReturnType<typeof setInterval> | null = null
  let lastTriggeredAt = 0

  const triggerSync = () => {
    const now = Date.now()
    if (now - lastTriggeredAt < 15_000) return
    lastTriggeredAt = now
    void refreshCloudState({ force: true })
  }

  const stopHeartbeat = () => {
    if (routeSyncTimer) {
      clearInterval(routeSyncTimer)
      routeSyncTimer = null
    }
  }

  const startHeartbeat = () => {
    stopHeartbeat()
    routeSyncTimer = setInterval(() => {
      if (document.visibilityState !== 'visible') return
      if (!shouldSyncRoute(route.path)) return
      triggerSync()
    }, 5 * 60 * 1000)
  }

  const handleFocus = () => {
    if (!shouldSyncRoute(route.path)) return
    triggerSync()
  }

  const handleVisibility = () => {
    if (document.visibilityState !== 'visible') return
    if (!shouldSyncRoute(route.path)) return
    triggerSync()
  }

  const handleOnline = () => {
    if (!shouldSyncRoute(route.path)) return
    triggerSync()
  }

  watch(
    [authReady, autoSyncReady, isCloudSyncEnabled, () => route.path, () => sessionProfile.value?.identifier, () => sessionProfile.value?.plan],
    ([ready, syncReady, cloudSyncEnabled, path, identifier]) => {
      if (!ready) return
      if (!syncReady) return
      if (!cloudSyncEnabled) return
      if (!shouldSyncRoute(path)) return
      if (!identifier) return
      triggerSync()
      startHeartbeat()
    },
    { immediate: true }
  )

  onMounted(() => {
    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', handleVisibility)
    window.addEventListener('online', handleOnline)
  })

  onBeforeUnmount(() => {
    stopHeartbeat()
    window.removeEventListener('focus', handleFocus)
    document.removeEventListener('visibilitychange', handleVisibility)
    window.removeEventListener('online', handleOnline)
  })
})
