<script setup lang="ts">
const props = withDefaults(defineProps<{
  items: Array<{
    label: string
    value: number
    helper?: string
    formatted?: string
  }>
  centerLabel?: string
  centerValue?: string
}>(), {
  centerLabel: 'Total',
  centerValue: ''
})

const palette = [
  '#0ea5e9',
  '#14b8a6',
  '#22c55e',
  '#f59e0b',
  '#f43f5e',
  '#8b5cf6',
  '#ec4899',
  '#06b6d4',
  '#84cc16',
  '#fb7185'
]

const total = computed(() => props.items.reduce((sum, item) => sum + Math.max(item.value, 0), 0))

const segments = computed(() => {
  const safeTotal = total.value || 1
  let cursor = 0

  return props.items.map((item, index) => {
    const value = Math.max(item.value, 0)
    const share = (value / safeTotal) * 100
    const start = cursor * 3.6
    cursor += share
    const end = cursor * 3.6

    return {
      ...item,
      color: palette[index % palette.length],
      percent: share,
      start,
      end
    }
  })
})

const ringStyle = computed(() => {
  if (!segments.value.length) {
    return {
      background: 'linear-gradient(180deg, rgba(148,163,184,0.18), rgba(148,163,184,0.08))'
    }
  }

  const parts = segments.value.map(segment => `${segment.color} ${segment.start}deg ${segment.end}deg`)
  return {
    background: `conic-gradient(from -90deg, ${parts.join(', ')})`
  }
})

function formattedValue(item: { formatted?: string; value: number }) {
  return item.formatted ?? item.value.toLocaleString()
}
</script>

<template>
  <div class="space-y-4">
    <div class="mx-auto flex aspect-square w-full max-w-56 items-center justify-center">
      <div class="relative flex h-full w-full items-center justify-center rounded-full p-3" :style="ringStyle">
        <div class="flex h-full w-full items-center justify-center rounded-full bg-white shadow-inner ring-1 ring-slate-200 dark:bg-slate-950 dark:ring-slate-800">
          <div class="text-center">
            <p class="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted">
              {{ centerLabel }}
            </p>
            <p class="mt-1 text-xl font-black tracking-tight text-default">
              {{ centerValue || total.toLocaleString() }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <div class="space-y-2.5">
      <div
        v-for="segment in segments"
        :key="segment.label"
        class="space-y-2 rounded-[1rem] bg-slate-50/80 px-3 py-2.5 dark:bg-slate-900/70"
      >
        <div class="flex items-center justify-between gap-3">
          <div class="min-w-0 flex items-center gap-2">
            <span
              class="size-3 shrink-0 rounded-full"
              :style="{ background: segment.color }"
            />
            <div class="min-w-0">
              <p class="truncate text-sm font-bold text-default">{{ segment.label }}</p>
              <p v-if="segment.helper" class="truncate text-xs text-muted">{{ segment.helper }}</p>
            </div>
          </div>
          <p class="shrink-0 text-sm font-black text-default">
            {{ formattedValue(segment) }}
          </p>
        </div>

        <div class="h-2 overflow-hidden rounded-full bg-slate-200/80 dark:bg-slate-800">
          <div
            class="h-full rounded-full transition-all duration-500"
            :style="{ width: `${Math.max(segment.percent, segment.value > 0 ? 8 : 0)}%`, background: segment.color }"
          />
        </div>
      </div>
    </div>
  </div>
</template>
