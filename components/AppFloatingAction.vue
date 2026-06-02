<script setup lang="ts">
const route = useRoute()
const { activeTheme } = useAppThemeColor()
const isAddPage = computed(() => route.path === '/add')
</script>

<template>
  <NuxtLink
    v-if="!isAddPage"
    to="/add"
    class="hidden"
    aria-label="Add transaction"
  >
    <div :class="['flex size-16 items-center justify-center rounded-full bg-gradient-to-br text-white shadow-[0_18px_50px_-16px_rgba(15,23,42,0.35)] transition hover:scale-105 active:scale-95', activeTheme.accent]">
      <UIcon name="i-lucide-plus" class="size-7" />
    </div>
  </NuxtLink>
</template>
