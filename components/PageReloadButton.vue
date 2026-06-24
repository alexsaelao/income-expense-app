<script setup lang="ts">
const isReloading = ref(false)

withDefaults(defineProps<{
  label?: string
}>(), {
  label: 'Reload'
})

async function reloadPage() {
  if (!import.meta.client || isReloading.value) return

  isReloading.value = true
  await nextTick()

  window.requestAnimationFrame(() => {
    window.location.reload()
  })
}
</script>

<template>
  <button
    type="button"
    :aria-label="label"
    :title="label"
    class="inline-flex shrink-0 items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-[11px] font-bold text-default shadow-sm transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-800 dark:bg-slate-900"
    :disabled="isReloading"
    @click="reloadPage"
  >
    <UIcon name="i-lucide-refresh-cw" class="size-3.5" :class="isReloading ? 'animate-spin' : ''" />
    <slot>{{ label }}</slot>
  </button>
</template>
