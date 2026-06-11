<script setup lang="ts">
const route = useRoute()
const { activeTheme } = useAppThemeColor()
const { refreshCloudState, autoSyncReady, isCloudSyncEnabled, canEditMoneyData } = useMoneyNote()
const isAddPage = computed(() => route.path === '/add')
const addTarget = computed(() => (canEditMoneyData.value ? '/add' : '/settings'))

function syncOnNavigate() {
  if (!autoSyncReady.value || !isCloudSyncEnabled.value) return
  void refreshCloudState({ force: true })
}
</script>

<template>
  <NuxtLink
    v-if="!isAddPage"
    :to="addTarget"
    class="hidden"
    aria-label="Add transaction"
    @click="syncOnNavigate"
  >
    <div :class="['flex size-16 items-center justify-center rounded-full bg-gradient-to-br text-white shadow-[0_18px_50px_-16px_rgba(15,23,42,0.35)] transition hover:scale-105 active:scale-95', activeTheme.accent]">
      <UIcon name="i-lucide-plus" class="size-7" />
    </div>
  </NuxtLink>
</template>
