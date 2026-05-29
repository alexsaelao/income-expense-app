export function useConnectivity() {
  const isOnline = useState('money-note-online', () => true)
  const listenersAttached = useState('money-note-online-listeners', () => false)

  function syncOnlineStatus() {
    if (!import.meta.client) return
    isOnline.value = window.navigator.onLine
  }

  onMounted(() => {
    if (!import.meta.client || listenersAttached.value) return

    syncOnlineStatus()
    window.addEventListener('online', syncOnlineStatus)
    window.addEventListener('offline', syncOnlineStatus)
    listenersAttached.value = true
  })

  return {
    isOnline,
    syncOnlineStatus
  }
}
