<script setup lang="ts">
const { selectedLanguage } = useAppLanguage()

useHead(() => ({
  htmlAttrs: {
    lang: selectedLanguage.value
  }
}))
</script>

<template>
  <div class="app-shell relative overflow-x-hidden">
    <main class="relative mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-6 sm:py-8">
      <slot />
    </main>
  </div>
</template>
