<script setup lang="ts">
const { selectedLanguage } = useAppLanguage()

useHead(() => ({
  htmlAttrs: {
    lang: selectedLanguage.value
  }
}))
</script>

<template>
  <div class="app-shell relative h-[100dvh] overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(125,211,252,0.20),_transparent_36%),linear-gradient(180deg,_#f8fbff_0%,_#eef4ff_100%)] text-slate-900">
    <main class="relative mx-auto flex h-[100dvh] w-full max-w-md flex-col justify-center overflow-hidden px-4 py-2 sm:py-6">
      <slot />
    </main>
  </div>
</template>
