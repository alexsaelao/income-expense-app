<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const { selectedLanguage } = useAppLanguage()
const { isStandalone } = usePwaDisplayMode()

useHead(() => ({
  htmlAttrs: {
    lang: selectedLanguage.value
  }
}))

onMounted(() => {
  if (import.meta.server) return

  if (isStandalone.value && route.path !== '/') {
    router.replace('/')
  }
})
</script>

<template>
  <div class="app-shell relative overflow-x-hidden">
    <main class="relative mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pb-[calc(env(safe-area-inset-bottom)+6.75rem)] pt-[calc(env(safe-area-inset-top)+0.75rem)]">
      <AppInstallBanner />
      <slot />
    </main>

    <AppBottomNav />
    <AppFloatingAction />
  </div>
</template>
