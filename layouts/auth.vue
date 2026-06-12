<script setup lang="ts">
const { selectedLanguage } = useAppLanguage()

useHead(() => ({
  htmlAttrs: {
    lang: selectedLanguage.value
  }
}))
</script>

<template>
  <div class="app-shell relative h-[100dvh] overflow-hidden">
    <main class="relative mx-auto flex h-[100dvh] w-full max-w-md flex-col justify-center overflow-hidden px-4 py-2 sm:py-6">
      <AppOfflineBadge />
      <slot />
    </main>
  </div>
</template>
