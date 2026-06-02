<script setup lang="ts">
import type { Transaction } from '~/composables/useMoneyNote'
import { useMoneyNote } from '~/composables/useMoneyNote'

const props = defineProps<{
  transaction: Transaction
  showWallet?: boolean
  compact?: boolean
}>()

const { selectedLanguage } = useAppLanguage()
const { formatCurrency, formatDate, typeIcon, typeLabel, typeTint, getWallet, calculateMoveDestinationAmount } = useMoneyNote()

const sourceWallet = computed(() => getWallet(props.transaction.walletId))
const destinationWallet = computed(() => props.transaction.toWalletId ? getWallet(props.transaction.toWalletId) : undefined)
const walletName = computed(() => {
  if (sourceWallet.value?.name) return sourceWallet.value.name

  return selectedLanguage.value === 'lo' ? 'ບໍ່ພົບກະເປົ໋າ' : 'Unknown wallet'
})
const destinationName = computed(() => destinationWallet.value?.name ?? '')
const amountLabel = computed(() => formatCurrency(props.transaction.amount, props.transaction.currency))
const amountClass = computed(() => {
  if (props.transaction.type === 'expense' || (props.transaction.type === 'loan' && props.transaction.loanDirection !== 'received')) {
    return 'text-rose-500'
  }
  return 'text-emerald-500'
})
const moveRateLabel = computed(() => {
  if (props.transaction.type !== 'move') return ''
  if (!sourceWallet.value || !destinationWallet.value) return ''
  if (sourceWallet.value.currency === destinationWallet.value.currency) return ''
  if (!props.transaction.exchangeRate || props.transaction.exchangeRate <= 0) return ''

  const rateText = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(props.transaction.exchangeRate)
  const pair = `${sourceWallet.value.currency}->${destinationWallet.value.currency}`

  if (pair === 'THB->LAK' || pair === 'USD->LAK' || pair === 'USD->THB') {
    return `1 ${sourceWallet.value.currency} = ${rateText} ${destinationWallet.value.currency}`
  }

  if (pair === 'THB->USD' || pair === 'LAK->THB' || pair === 'LAK->USD') {
    return `1 ${destinationWallet.value.currency} = ${rateText} ${sourceWallet.value.currency}`
  }

  return `Rate: ${rateText}`
})
const moveDestinationAmountLabel = computed(() => {
  if (props.transaction.type !== 'move') return ''
  if (!sourceWallet.value || !destinationWallet.value) return ''
  const amount = calculateMoveDestinationAmount(
    props.transaction.amount,
    sourceWallet.value.currency,
    destinationWallet.value.currency,
    props.transaction.exchangeRate
  )

  return formatCurrency(amount, destinationWallet.value.currency)
})
const loanDirectionLabel = computed(() => {
  if (props.transaction.type !== 'loan') return ''
  return props.transaction.loanDirection === 'received' ? 'Received' : 'Given'
})
</script>

<template>
  <UCard class="overflow-hidden rounded-[1.4rem] border border-white/50 bg-white/85 shadow-[0_16px_45px_-25px_rgba(15,23,42,0.25)] transition duration-200 active:scale-[0.99] dark:border-white/10 dark:bg-slate-950/80">
    <div :class="['flex items-start', compact ? 'gap-3' : 'gap-3.5']">
      <div :class="['flex shrink-0 items-center justify-center rounded-[1.4rem] bg-slate-100 shadow-sm dark:bg-slate-900', compact ? 'size-10 text-base' : 'size-11 text-lg', typeTint(transaction.type)]">
        <UIcon :name="typeIcon(transaction.type)" :class="compact ? 'size-4' : 'size-4.5'" />
      </div>

      <div class="min-w-0 flex-1">
        <div :class="['flex items-start justify-between', compact ? 'gap-2.5' : 'gap-3']">
          <div class="min-w-0">
            <p :class="['truncate font-bold text-default', compact ? 'text-[0.92rem]' : '']">{{ transaction.category }}</p>
            <p :class="['mt-0.5 text-muted', compact ? 'text-[12px] leading-4.5' : 'text-[13px] leading-5']">{{ transaction.note }}</p>
          </div>
          <div class="shrink-0 text-right">
            <p :class="['font-extrabold tracking-tight tabular-nums', compact ? 'text-[0.92rem]' : 'text-[1rem] sm:text-lg', amountClass]">{{ transaction.type === 'expense' || (transaction.type === 'loan' && transaction.loanDirection !== 'received') ? '-' : '+' }}{{ amountLabel }}</p>
            <p :class="['text-muted', compact ? 'text-[10px]' : 'text-[11px]']">{{ formatDate(transaction.date) }}</p>
          </div>
        </div>

        <div :class="['flex flex-wrap items-center gap-1.5', compact ? 'mt-2' : 'mt-2.5']">
          <UBadge color="neutral" variant="soft" class="rounded-full">{{ typeLabel(transaction.type) }}</UBadge>
          <UBadge v-if="transaction.type === 'loan'" color="amber" variant="soft" class="rounded-full">{{ loanDirectionLabel }}</UBadge>
          <UBadge color="primary" variant="soft" class="rounded-full">{{ transaction.currency }}</UBadge>
          <span v-if="showWallet" :class="compact ? 'text-[12px] text-muted' : 'text-[13px] text-muted'">{{ walletName }}</span>
          <span v-if="transaction.toWalletId" :class="compact ? 'text-[12px] text-muted' : 'text-[13px] text-muted'">→ {{ destinationName }}</span>
        </div>

        <p
          v-if="moveRateLabel"
          :class="['mt-1.5 text-muted', compact ? 'text-[11px] leading-4' : 'text-[12px] leading-5']"
        >
          {{ moveRateLabel }} · ≈ {{ moveDestinationAmountLabel }}
        </p>
      </div>
    </div>

    <template #footer>
      <div class="flex flex-wrap gap-2">
        <slot name="actions" />
      </div>
    </template>
  </UCard>
</template>
