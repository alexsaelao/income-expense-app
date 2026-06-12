<script setup lang="ts">
type ChartSeries = {
  label: string
  values: number[]
  color: string
  helper?: string
  area?: boolean
  areaOpacity?: number
  lineWidth?: number
  pointRadius?: number
}

const props = withDefaults(defineProps<{
  labels: string[]
  series: ChartSeries[]
  height?: number
  valueFormatter?: (value: number) => string
}>(), {
  height: 280
})

const viewBoxWidth = 1000
const viewBoxHeight = 380
const viewportWidth = ref(1024)

const chartPadding = computed(() => ({
  top: viewportWidth.value < 640 ? 18 : 20,
  right: viewportWidth.value < 640 ? 14 : 24,
  bottom: viewportWidth.value < 640 ? 46 : 54,
  left: viewportWidth.value < 640 ? 78 : 56
}))

const compactLabels = computed(() => props.labels.length > 12)
const isMobile = computed(() => viewportWidth.value < 640)
const innerWidth = computed(() => viewBoxWidth - chartPadding.value.left - chartPadding.value.right)
const innerHeight = computed(() => viewBoxHeight - chartPadding.value.top - chartPadding.value.bottom)

function updateViewportWidth() {
  if (typeof window === 'undefined') return
  viewportWidth.value = window.innerWidth
}

function formatCompactNumber(value: number) {
  const normalized = Math.abs(value) < 0.5 ? 0 : value
  const abs = Math.abs(normalized)
  const sign = normalized < 0 ? '-' : ''

  if (abs === 0) return '0'

  if (abs >= 1_000_000_000) return `${sign}${(abs / 1_000_000_000).toFixed(abs >= 10_000_000_000 ? 0 : 1)}B`
  if (abs >= 1_000_000) return `${sign}${(abs / 1_000_000).toFixed(abs >= 10_000_000 ? 0 : 1)}M`
  if (abs >= 1_000) return `${sign}${(abs / 1_000).toFixed(abs >= 10_000 ? 0 : 1)}K`

  return `${sign}${Math.round(abs).toLocaleString()}`
}

function formatValue(value: number) {
  return props.valueFormatter ? props.valueFormatter(value) : formatCompactNumber(value)
}

const allValues = computed(() => props.series.flatMap(series => series.values))

const domain = computed(() => {
  const values = allValues.value
  if (!values.length) {
    return { min: 0, max: 1 }
  }

  const rawMin = Math.min(0, ...values)
  const rawMax = Math.max(0, ...values)

  if (rawMin === rawMax) {
    const base = Math.abs(rawMax) || 1
    return {
      min: rawMin - base * 0.35,
      max: rawMax + base * 0.35
    }
  }

  const padding = (rawMax - rawMin) * 0.14
  return {
    min: rawMin - padding,
    max: rawMax + padding
  }
})

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function getX(index: number) {
  if (props.labels.length <= 1) {
    return chartPadding.value.left + innerWidth.value / 2
  }

  return chartPadding.value.left + (index / (props.labels.length - 1)) * innerWidth.value
}

function getY(value: number) {
  const range = domain.value.max - domain.value.min || 1
  const normalized = (value - domain.value.min) / range
  return chartPadding.value.top + (1 - clamp(normalized, 0, 1)) * innerHeight.value
}

function buildLinePath(values: number[]) {
  return values
    .map((value, index) => `${index === 0 ? 'M' : 'L'} ${getX(index).toFixed(2)} ${getY(value).toFixed(2)}`)
    .join(' ')
}

function buildAreaPath(values: number[]) {
  if (!values.length) return ''

  const startX = getX(0)
  const endX = getX(Math.max(values.length - 1, 0))
  const baseline = getY(Math.min(0, domain.value.min))
  const line = buildLinePath(values)

  return `${line} L ${endX.toFixed(2)} ${baseline.toFixed(2)} L ${startX.toFixed(2)} ${baseline.toFixed(2)} Z`
}

function yTicks() {
  const count = isMobile.value ? 3 : 4
  return Array.from({ length: count + 1 }, (_, index) => {
    const ratio = index / count
    const value = domain.value.max - ratio * (domain.value.max - domain.value.min)
    return {
      value,
      y: chartPadding.value.top + ratio * innerHeight.value
    }
  })
}

function showLabel(index: number) {
  if (isMobile.value) {
    return index % 2 === 0
  }

  if (!compactLabels.value) return true
  return index % 2 === 0
}

function seriesAreaPath(series: ChartSeries) {
  return series.area ? buildAreaPath(series.values) : ''
}

function seriesLinePath(series: ChartSeries) {
  return buildLinePath(series.values)
}

function seriesPointRadius(series: ChartSeries) {
  return series.pointRadius ? Math.max(series.pointRadius * 5, 4) : 5
}

function axisFontSize() {
  return isMobile.value ? 14 : 20
}

function xLabelFontSize() {
  return isMobile.value ? 13 : 20
}

function yLabelX() {
  return isMobile.value ? chartPadding.value.left - 8 : chartPadding.value.left - 14
}

onMounted(() => {
  updateViewportWidth()
  window.addEventListener('resize', updateViewportWidth, { passive: true })
})

onBeforeUnmount(() => {
  if (typeof window === 'undefined') return
  window.removeEventListener('resize', updateViewportWidth)
})
</script>

<template>
  <div class="space-y-4">
    <div class="overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-gradient-to-b from-slate-50 via-white to-white p-4 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.25)] dark:border-slate-800 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 sm:p-5">
      <div class="flex items-center justify-between gap-3 pb-3">
        <div class="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted">
          <span class="size-2 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 shadow-[0_0_18px_rgba(34,211,238,0.35)]" />
          <span>Responsive line chart</span>
        </div>
        <div class="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
          SVG powered
        </div>
      </div>

      <div class="overflow-hidden rounded-[1.35rem] border border-slate-200/80 bg-slate-50/70 px-2 py-2 dark:border-slate-800 dark:bg-slate-950/70 sm:px-3 sm:py-3">
        <svg
          :viewBox="`0 0 ${viewBoxWidth} ${viewBoxHeight}`"
          :style="{ height: `${height}px` }"
          class="h-full w-full"
          role="img"
          aria-label="Line chart"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="chart-grid-fade" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stop-color="rgba(148, 163, 184, 0.18)" />
              <stop offset="100%" stop-color="rgba(148, 163, 184, 0.05)" />
            </linearGradient>
            <linearGradient
              v-for="series in props.series"
              :id="`series-fill-${series.label.replace(/[^a-zA-Z0-9_-]/g, '')}`"
              :key="series.label"
              x1="0"
              x2="0"
              y1="0"
              y2="1"
            >
              <stop offset="0%" :stop-color="series.color" :stop-opacity="(series.areaOpacity ?? 0.12) + 0.10" />
              <stop offset="100%" :stop-color="series.color" stop-opacity="0" />
            </linearGradient>
          </defs>

          <g>
            <line
              v-for="tick in yTicks()"
              :key="tick.y"
              :x1="chartPadding.left"
              :x2="viewBoxWidth - chartPadding.right"
              :y1="tick.y"
              :y2="tick.y"
              stroke="url(#chart-grid-fade)"
              stroke-width="2"
              stroke-linecap="round"
            />
          </g>

          <g class="select-none">
            <text
              v-for="tick in yTicks()"
              :key="`label-${tick.y}`"
              :x="yLabelX()"
              :y="tick.y + 4"
              fill="rgba(148, 163, 184, 0.95)"
              :font-size="axisFontSize()"
              font-weight="700"
              text-anchor="end"
            >
              {{ formatCompactNumber(tick.value) }}
            </text>
          </g>

          <g v-for="series in props.series" :key="series.label">
            <path
              v-if="series.area"
              :d="seriesAreaPath(series)"
              :fill="`url(#series-fill-${series.label.replace(/[^a-zA-Z0-9_-]/g, '')})`"
            />
            <path
              :d="seriesLinePath(series)"
              fill="none"
              :stroke="series.color"
              :stroke-width="series.lineWidth ?? 4"
              stroke-linecap="round"
              stroke-linejoin="round"
            />

            <circle
              v-for="(value, index) in series.values"
              :key="`${series.label}-${index}`"
              :cx="getX(index)"
              :cy="getY(value)"
              :r="seriesPointRadius(series)"
              :fill="series.color"
              stroke="#ffffff"
              stroke-width="4"
            >
              <title>{{ `${series.label}: ${formatValue(value)} (${props.labels[index] ?? ''})` }}</title>
            </circle>
          </g>

          <g class="select-none">
            <text
              v-for="(label, index) in props.labels"
              :key="label + index"
              v-show="showLabel(index)"
              :x="getX(index)"
              :y="viewBoxHeight - (isMobile ? 16 : 18)"
              fill="rgba(148, 163, 184, 0.95)"
              :font-size="xLabelFontSize()"
              font-weight="700"
              text-anchor="middle"
            >
              {{ label }}
            </text>
          </g>
        </svg>
      </div>

      <div class="mt-4 flex flex-wrap items-center gap-2">
        <div
          v-for="item in series"
          :key="item.label"
          class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-default shadow-sm dark:border-slate-800 dark:bg-slate-950"
        >
          <span class="size-2.5 rounded-full" :style="{ backgroundColor: item.color }" />
          <span>{{ item.label }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
