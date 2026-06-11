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
    <main class="min-h-screen w-full">
      <slot />
    </main>
  </div>
</template>
