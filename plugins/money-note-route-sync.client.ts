const ROUTES_TO_SYNC = [
  /^\/$/,
  /^\/add(?:\/|$)/,
  /^\/categories(?:\/|$)/,
  /^\/companies(?:\/|$)/,
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
  const router = useRouter()
  const { authReady, sessionProfile } = useDeviceAuth()
  const { refreshCloudState, autoSyncReady, isCloudSyncEnabled } = useMoneyNote()
  let routeSyncTimer: ReturnType<typeof setInterval> | null = null
  let removeAfterEach: (() => void) | null = null
  let lastTriggeredAt = 0

  const triggerSync = (options?: { bypassThrottle?: boolean }) => {
    const now = Date.now()
    if (!options?.bypassThrottle && now - lastTriggeredAt < 15_000) return
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

  const startRouteHook = () => {
    if (removeAfterEach) return

    removeAfterEach = router.afterEach((to) => {
      if (!shouldSyncRoute(to.path)) return
      triggerSync({ bypassThrottle: true })
    })
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
      startRouteHook()
      triggerSync({ bypassThrottle: true })
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
    if (removeAfterEach) {
      removeAfterEach()
      removeAfterEach = null
    }
    window.removeEventListener('focus', handleFocus)
    document.removeEventListener('visibilitychange', handleVisibility)
    window.removeEventListener('online', handleOnline)
  })
})
