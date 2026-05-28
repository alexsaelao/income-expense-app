export function usePwaDisplayMode() {
  const detectStandalone = () => {
    if (import.meta.server) return false

    const navigatorStandalone = (window.navigator as Navigator & { standalone?: boolean }).standalone === true

    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.matchMedia('(display-mode: fullscreen)').matches ||
      navigatorStandalone
    )
  }

  const isStandalone = ref(import.meta.client ? detectStandalone() : false)

  if (import.meta.client) {
    const syncStandalone = () => {
      isStandalone.value = detectStandalone()
    }

    onMounted(() => {
      syncStandalone()
      window.matchMedia('(display-mode: standalone)').addEventListener?.('change', syncStandalone)
      window.matchMedia('(display-mode: fullscreen)').addEventListener?.('change', syncStandalone)
    })
  }

  return { isStandalone }
}
