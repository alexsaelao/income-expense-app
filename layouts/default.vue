<script setup lang="ts">
const route = useRoute()
const { selectedLanguage } = useAppLanguage()
const { authReady, isAuthenticated, hydrateAuth } = useDeviceAuth()

const isAuthPage = computed(() => route.path === '/login' || route.path === '/register')
const showProtectedShell = computed(() => authReady.value && isAuthenticated.value)

useHead(() => ({
  htmlAttrs: {
    lang: selectedLanguage.value
  }
}))

onMounted(() => {
  if (import.meta.server) return

  hydrateAuth()
})

watch([authReady, isAuthenticated, isAuthPage], ([ready, authenticated, authPage]) => {
  if (!ready) return

  if (!authenticated && !authPage) {
    navigateTo('/login', { replace: true })
    return
  }

  if (authenticated && authPage) {
    navigateTo('/', { replace: true })
  }
})
</script>

<template>
  <div class="app-shell relative overflow-x-hidden">
    <main
      v-if="isAuthPage || showProtectedShell"
      class="relative mx-auto flex min-h-screen w-full max-w-md flex-col px-4"
      :class="isAuthPage
        ? 'justify-center pb-8 pt-6'
        : 'pb-[calc(env(safe-area-inset-bottom)+6.75rem)] pt-[calc(env(safe-area-inset-top)+0.75rem)] md:max-w-none md:px-6 lg:max-w-[1024px] lg:px-8'"
    >
      <AppInstallBanner v-if="!isAuthPage" />
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
