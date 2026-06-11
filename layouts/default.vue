<script setup lang="ts">
const route = useRoute()
const { selectedLanguage } = useAppLanguage()
const { authReady, isAuthenticated, hydrateAuth } = useDeviceAuth()
const { refreshCloudState, autoSyncReady, isCloudSyncEnabled } = useMoneyNote()

const isPublicInstallPage = computed(() => route.path === '/install' || route.path.startsWith('/install/'))
const isAuthPage = computed(() => route.path === '/login' || route.path === '/register')
const showProtectedShell = computed(() => authReady.value && isAuthenticated.value)
const shouldSyncRoute = computed(() =>
  ['/', '/add', '/categories', '/companies', '/settings', '/transactions', '/wallets', '/reports']
    .some(path => route.path === path || route.path.startsWith(`${path}/`))
)

useHead(() => ({
  htmlAttrs: {
    lang: selectedLanguage.value
  }
}))

onMounted(() => {
  if (import.meta.server) return

  hydrateAuth()
})

watch([authReady, isAuthenticated, isAuthPage, isPublicInstallPage], ([ready, authenticated, authPage, publicInstallPage]) => {
  if (!ready) return

  if (publicInstallPage) return

  if (!authenticated && !authPage) {
    navigateTo('/login', { replace: true })
    return
  }

  if (authenticated && authPage) {
    navigateTo('/', { replace: true })
  }
})

watch(
  [authReady, isAuthenticated, autoSyncReady, isCloudSyncEnabled, shouldSyncRoute, () => route.fullPath],
  ([ready, authenticated, syncReady, cloudSyncEnabled, syncRoute]) => {
    if (!ready || !authenticated || !syncReady || !cloudSyncEnabled || !syncRoute) return
    void refreshCloudState({ force: true })
  },
  { immediate: true, flush: 'post' }
)
</script>

<template>
  <div class="app-shell relative overflow-x-hidden">
    <main
      v-if="isAuthPage || showProtectedShell || isPublicInstallPage"
      class="relative mx-auto flex min-h-screen w-full max-w-md flex-col px-4"
      :class="isAuthPage
        ? 'justify-center pb-8 pt-6'
        : isPublicInstallPage
          ? 'max-w-none px-0 pb-0 pt-0'
        : 'pb-[calc(env(safe-area-inset-bottom)+6.75rem)] pt-[calc(env(safe-area-inset-top)+0.75rem)] md:max-w-none md:px-6 lg:max-w-[1024px] lg:px-8'"
    >
      <AppInstallBanner v-if="!isAuthPage && !isPublicInstallPage" />
      <slot />
    </main>

    <div v-else class="flex min-h-screen items-center justify-center px-4">
      <div class="flex flex-col items-center gap-4 text-center">
        <div class="flex size-16 items-center justify-center rounded-[1.4rem] bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-[0_16px_36px_-18px_rgba(37,99,235,0.7)] animate-pulse">
          <UIcon name="i-lucide-wallet-cards" class="size-8" />
        </div>
      </div>
    </div>

    <AppBottomNav v-if="showProtectedShell" />
    <AppFloatingAction v-if="showProtectedShell" />
  </div>
</template>
