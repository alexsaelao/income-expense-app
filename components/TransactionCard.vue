<script setup lang="ts">
import type { Transaction } from '~/composables/useMoneyNote'
import { useMoneyNote } from '~/composables/useMoneyNote'

const props = defineProps<{
  transaction: Transaction
  showWallet?: boolean
}>()

const { formatCurrency, formatDate, typeIcon, typeLabel, typeTint, getWallet } = useMoneyNote()

const walletName = computed(() => getWallet(props.transaction.walletId)?.name ?? 'Unknown wallet')
const destinationName = computed(() => props.transaction.toWalletId ? getWallet(props.transaction.toWalletId)?.name ?? 'Unknown wallet' : '')
const amountLabel = computed(() => formatCurrency(props.transaction.amount, props.transaction.currency))
const amountClass = computed(() => {
  if (props.transaction.type === 'expense' || (props.transaction.type === 'loan' && props.transaction.loanDirection !== 'received')) {
    return 'text-rose-500'
  }
  return 'text-emerald-500'
})
</script>

<template>
  <UCard class="overflow-hidden rounded-[1.4rem] border border-white/50 bg-white/85 shadow-[0_16px_45px_-25px_rgba(15,23,42,0.25)] transition duration-200 active:scale-[0.99] dark:border-white/10 dark:bg-slate-950/80">
    <div class="flex items-start gap-3.5">
      <div :class="['flex size-11 shrink-0 items-center justify-center rounded-[1.4rem] bg-slate-100 text-lg shadow-sm dark:bg-slate-900', typeTint(transaction.type)]">
        <UIcon :name="typeIcon(transaction.type)" class="size-4.5" />
      </div>

      <div class="min-w-0 flex-1">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <p class="truncate font-bold text-default">{{ transaction.category }}</p>
            <p class="mt-0.5 text-[13px] leading-5 text-muted">{{ transaction.note }}</p>
          </div>
          <div class="shrink-0 text-right">
            <p :class="['text-[1rem] font-extrabold tracking-tight sm:text-lg', amountClass]">{{ transaction.type === 'expense' || (transaction.type === 'loan' && transaction.loanDirection !== 'received') ? '-' : '+' }}{{ amountLabel }}</p>
            <p class="text-[11px] text-muted">{{ formatDate(transaction.date) }}</p>
          </div>
        </div>

        <div class="mt-2.5 flex flex-wrap items-center gap-1.5">
          <UBadge color="neutral" variant="soft" class="rounded-full">{{ typeLabel(transaction.type) }}</UBadge>
          <UBadge color="primary" variant="soft" class="rounded-full">{{ transaction.currency }}</UBadge>
          <span v-if="showWallet" class="text-[13px] text-muted">{{ walletName }}</span>
          <span v-if="transaction.toWalletId" class="text-[13px] text-muted">→ {{ destinationName }}</span>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex flex-wrap gap-2">
        <slot name="actions" />
      </div>
    </template>
  </UCard>
</template>
