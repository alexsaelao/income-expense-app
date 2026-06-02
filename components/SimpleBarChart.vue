<script setup lang="ts">
const { activeTheme } = useAppThemeColor()

const props = defineProps<{
  items: Array<{ label: string; value: number; helper?: string }>
  total?: number
  colorClass?: string
}>()

const maxValue = computed(() => props.total ?? Math.max(...props.items.map(item => item.value), 1))
</script>

<template>
  <div class="space-y-4">
    <div v-for="item in items" :key="item.label" class="space-y-2">
      <div class="flex items-center justify-between gap-3">
        <div class="min-w-0">
          <p class="truncate text-sm font-semibold text-default">{{ item.label }}</p>
          <p v-if="item.helper" class="text-xs text-muted">{{ item.helper }}</p>
        </div>
        <p class="shrink-0 text-sm font-bold text-default">
          {{ item.value.toLocaleString() }}
        </p>
      </div>
      <div class="h-2.5 overflow-hidden rounded-full bg-slate-200/80 dark:bg-slate-800">
        <div
          class="h-full rounded-full bg-gradient-to-r transition-all duration-500"
          :class="[colorClass ?? activeTheme.accent]"
          :style="{ width: `${Math.max((item.value / maxValue) * 100, item.value > 0 ? 8 : 0)}%` }"
        />
      </div>
    </div>
  </div>
</template>
