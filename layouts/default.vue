<script setup lang="ts">
const route = useRoute()
const { selectedLanguage } = useAppLanguage()
const { authReady, isAuthenticated, hydrateAuth } = useDeviceAuth()

const isAuthPage = computed(() => route.path === '/login' || route.path === '/register')
const showProtectedShell = computed(() => authReady.value && isAuthenticated.value)
const isProtectedPage = computed(() => !isAuthPage.value)

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
      class="relative mx-auto flex min-h-screen w-full max-w-md flex-col px-4"
      :class="isAuthPage
        ? 'justify-center pb-8 pt-6'
        : 'pb-[calc(env(safe-area-inset-bottom)+6.75rem)] pt-[calc(env(safe-area-inset-top)+0.75rem)] md:max-w-none md:px-6 lg:max-w-[1024px] lg:px-8'"
    >
      <div
        v-if="isProtectedPage && !authReady"
        class="mb-4 flex items-center justify-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/10 px-3 py-2 text-xs font-medium text-sky-200 md:mb-6"
      >
        <UIcon name="i-lucide-loader-circle" class="size-4 animate-spin text-sky-400" />
        <span>Restoring session...</span>
      </div>
      <slot />
    </main>

    <AppBottomNav v-if="showProtectedShell" />
    <AppFloatingAction v-if="showProtectedShell" />
  </div>
</template>
