<script setup lang="ts">
import type { Wallet } from '~/composables/useMoneyNote'

const props = defineProps<{
  wallet: Wallet
  amountLabel: string
  detail?: string
  href?: string
  compact?: boolean
}>()

const { selectedLanguage } = useAppLanguage()

const walletCopy = computed(() => {
  if (selectedLanguage.value === 'lo') {
    return {
      defaultNote: 'ກະເປົ໋າ',
      currentBalance: 'ຍອດໃນປັດຈຸບັນ'
    }
  }

  return {
    defaultNote: 'Wallet',
    currentBalance: 'Current balance'
  }
})

const accentClass = computed(() => props.wallet.accent)
</script>

<template>
  <UCard class="relative overflow-hidden rounded-[1.4rem] border border-slate-200/80 bg-white/88 shadow-[0_18px_50px_-28px_rgba(15,23,42,0.22)] dark:border-slate-800 dark:bg-slate-950/80">
    <div :class="['absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b', accentClass]" aria-hidden="true" />

    <NuxtLink
      v-if="href"
      :to="href"
      :class="props.compact ? 'block px-2.5 py-2.5' : 'block px-4 py-4'"
    >
      <div :class="['flex items-start', props.compact ? 'gap-2.5' : 'gap-3']">
        <div :class="[
          'flex shrink-0 items-center justify-center rounded-[1.25rem] bg-gradient-to-br shadow-lg',
          props.compact ? 'size-9 rounded-[0.9rem] text-lg' : 'size-12 text-2xl',
          accentClass
        ]">
          {{ wallet.emoji }}
        </div>

        <div class="min-w-0 flex-1">
          <div :class="['flex items-start justify-between', props.compact ? 'gap-2' : 'gap-3']">
            <div class="min-w-0">
              <p :class="['truncate font-extrabold leading-tight text-default', props.compact ? 'text-[13px]' : 'text-[15px]']">{{ wallet.name }}</p>
              <div :class="['mt-0.5 flex flex-wrap items-center', props.compact ? 'gap-1.5' : 'gap-2']">
                <UBadge color="neutral" variant="soft" class="rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em]">
                  {{ wallet.currency }}
                </UBadge>
                <p :class="['truncate text-muted', props.compact ? 'text-[11px]' : 'text-xs']">{{ wallet.note ?? walletCopy.defaultNote }}</p>
              </div>
            </div>

            <UIcon name="i-lucide-chevron-right" class="mt-0.5 size-4 shrink-0 text-muted" />
          </div>

          <div :class="['flex items-end justify-between gap-3', props.compact ? 'mt-1.5' : 'mt-3']">
            <div class="min-w-0">
              <p v-if="!props.compact" class="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
                {{ walletCopy.currentBalance }}
              </p>
              <p :class="[
                'whitespace-nowrap font-black leading-none tracking-[-0.04em] tabular-nums text-default',
                props.compact ? 'text-[clamp(0.95rem,4vw,1.2rem)]' : 'mt-1 text-[clamp(1rem,4.2vw,1.4rem)]'
              ]">
                {{ amountLabel }}
              </p>
            </div>

            <p v-if="detail && !props.compact" class="max-w-[42%] truncate text-right text-xs text-muted">
              {{ detail }}
            </p>
          </div>
        </div>
      </div>
    </NuxtLink>

    <div
      v-else
      :class="props.compact ? 'px-2.5 py-2.5' : 'px-4 py-4'"
    >
      <div :class="['flex items-start', props.compact ? 'gap-2.5' : 'gap-3']">
        <div :class="[
          'flex shrink-0 items-center justify-center rounded-[1.25rem] bg-gradient-to-br shadow-lg',
          props.compact ? 'size-9 rounded-[0.9rem] text-lg' : 'size-12 text-2xl',
          accentClass
        ]">
          {{ wallet.emoji }}
        </div>

        <div class="min-w-0 flex-1">
          <div :class="['flex items-start justify-between', props.compact ? 'gap-2' : 'gap-3']">
            <div class="min-w-0">
              <p :class="['truncate font-extrabold leading-tight text-default', props.compact ? 'text-[13px]' : 'text-[15px]']">{{ wallet.name }}</p>
              <div :class="['mt-0.5 flex flex-wrap items-center', props.compact ? 'gap-1.5' : 'gap-2']">
                <UBadge color="neutral" variant="soft" class="rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em]">
                  {{ wallet.currency }}
                </UBadge>
                <p :class="['truncate text-muted', props.compact ? 'text-[11px]' : 'text-xs']">{{ wallet.note ?? walletCopy.defaultNote }}</p>
              </div>
            </div>

            <UIcon name="i-lucide-chevron-right" class="mt-0.5 size-4 shrink-0 text-muted" />
          </div>

          <div :class="['flex items-end justify-between gap-3', props.compact ? 'mt-1.5' : 'mt-3']">
            <div class="min-w-0">
              <p v-if="!props.compact" class="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
                {{ walletCopy.currentBalance }}
              </p>
              <p :class="[
                'whitespace-nowrap font-black leading-none tracking-[-0.04em] tabular-nums text-default',
                props.compact ? 'text-[clamp(0.95rem,4vw,1.2rem)]' : 'mt-1 text-[clamp(1rem,4.2vw,1.4rem)]'
              ]">
                {{ amountLabel }}
              </p>
            </div>

            <p v-if="detail && !props.compact" class="max-w-[42%] truncate text-right text-xs text-muted">
              {{ detail }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </UCard>
</template>
