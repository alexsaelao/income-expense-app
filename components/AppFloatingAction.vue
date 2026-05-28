<script setup lang="ts">
const route = useRoute()
const isAddPage = computed(() => route.path === '/add')
</script>

<template>
  <NuxtLink
    v-if="!isAddPage"
    to="/add"
    class="fixed bottom-[calc(env(safe-area-inset-bottom)+4.75rem)] right-4 z-40 hidden md:flex"
    aria-label="Add transaction"
  >
    <div class="flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-cyan-400 text-white shadow-[0_18px_50px_-16px_rgba(14,165,233,0.85)] transition hover:scale-105 active:scale-95">
      <UIcon name="i-lucide-plus" class="size-7" />
    </div>
  </NuxtLink>
</template>
