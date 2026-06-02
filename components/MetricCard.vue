<script setup lang="ts">
const { activeTheme } = useAppThemeColor()

withDefaults(defineProps<{
  title: string
  value: string
  detail?: string
  icon?: string
  iconText?: string
  accent?: string
  valueClass?: string
}>(), {
  icon: ''
})
</script>

<template>
  <UCard class="overflow-hidden rounded-[1.4rem] border border-white/50 bg-white/85 shadow-[0_18px_50px_-24px_rgba(15,23,42,0.25)] dark:border-white/10 dark:bg-slate-950/80">
    <div class="flex items-start gap-3">
      <div :class="['flex size-11 items-center justify-center rounded-full bg-gradient-to-br text-white shadow-lg', accent ?? activeTheme.accent]">
        <template v-if="iconText">
          <span class="text-lg font-black leading-none tracking-tight">{{ iconText }}</span>
        </template>
        <UIcon v-else :name="icon" class="size-5" />
      </div>
      <div class="min-w-0 flex-1">
        <p class="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
          {{ title }}
        </p>
        <p
          :class="[
            'mt-1 whitespace-nowrap font-extrabold leading-none tracking-[-0.03em] tabular-nums text-default',
            valueClass ?? 'text-[clamp(0.85rem,3vw,1.15rem)]'
          ]"
        >
          {{ value }}
        </p>
        <p v-if="detail" class="mt-1 text-[10px] text-muted">
          {{ detail }}
        </p>
      </div>
    </div>
  </UCard>
</template>
