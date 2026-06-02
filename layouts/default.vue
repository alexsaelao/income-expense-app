<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const { selectedLanguage } = useAppLanguage()
const { authReady, isAuthenticated, hydrateAuth } = useDeviceAuth()

const isAuthPage = computed(() => route.path === '/login' || route.path === '/register')

useHead(() => ({
  htmlAttrs: {
    lang: selectedLanguage.value
  }
}))

onMounted(() => {
  if (import.meta.server) return

  hydrateAuth()
})

watchEffect(() => {
  if (!authReady.value) return

  if (!isAuthenticated.value && !isAuthPage.value) {
    router.replace('/login')
    return
  }

  if (isAuthenticated.value && isAuthPage.value) {
    router.replace('/')
    return
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
      <AppInstallBanner v-if="!isAuthPage" />
      <slot />
    </main>

    <AppBottomNav v-if="!isAuthPage" />
    <AppFloatingAction v-if="!isAuthPage" />
  </div>
</template>
