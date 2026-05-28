<script setup lang="ts">
import type { Transaction, TransactionInput, TransactionType } from '~/composables/useMoneyNote'
import {
  loanDirectionOptions,
  currencySymbols,
  useMoneyNote,
  typeOptions
} from '~/composables/useMoneyNote'

const props = defineProps<{
  mode: 'create' | 'edit'
  initialTransaction?: Transaction | null
  submitLabel?: string
}>()

const emit = defineEmits<{
  (event: 'submit', payload: TransactionInput): void
  (event: 'delete'): void
}>()

const { wallets, categoryOptionsFor, walletOptionsForCurrency, enabledCurrencyOptions } = useMoneyNote()

const form = reactive({
  type: 'expense' as TransactionType,
  walletId: '',
  toWalletId: '',
  currency: 'LAK' as TransactionInput['currency'],
  amount: '',
  category: 'Food',
  note: '',
  date: new Date().toISOString().slice(0, 10),
  counterparty: '',
  loanDirection: 'given' as TransactionInput['loanDirection']
})

const currencyLabel = computed(() => {
  return currencySymbols[form.currency]
})

const currencyItems = computed(() => {
  const items = [...enabledCurrencyOptions.value]

  if (!items.some(item => item.value === form.currency)) {
    items.unshift({
      label: `${form.currency} (Disabled)`,
      value: form.currency
    })
  }

  return items
})

const walletItems = computed(() => walletOptionsForCurrency(form.currency))
const destinationItems = computed(() => walletOptionsForCurrency(form.currency).filter(item => item.value !== form.walletId))
const categoryItems = computed(() => categoryOptionsFor(form.type).map(category => ({ label: category, value: category })))
const submitText = computed(() => props.submitLabel ?? (props.mode === 'edit' ? 'Save changes' : 'Add transaction'))
const showDestination = computed(() => form.type === 'move')
const showLoanFields = computed(() => form.type === 'loan')
const selectedWallet = computed(() => wallets.value.find(wallet => wallet.id === form.walletId))

function resetFromTransaction(transaction?: Transaction | null) {
  const currentWalletId = transaction?.walletId ?? walletItems.value[0]?.value ?? ''

  form.type = transaction?.type ?? 'expense'
  form.walletId = currentWalletId
  form.toWalletId = transaction?.toWalletId ?? ''
  form.currency = transaction?.currency ?? selectedWallet.value?.currency ?? 'LAK'
  form.amount = transaction ? String(transaction.amount) : ''
  form.category = transaction?.category ?? categoryOptionsFor(transaction?.type ?? form.type)[0] ?? 'Food'
  form.note = transaction?.note ?? ''
  form.date = transaction?.date ?? new Date().toISOString().slice(0, 10)
  form.counterparty = transaction?.counterparty ?? ''
  form.loanDirection = transaction?.loanDirection ?? 'given'
}

watch(
  () => props.initialTransaction,
  (transaction) => {
    resetFromTransaction(transaction)
  },
  { immediate: true }
)

watch(
  enabledCurrencyOptions,
  () => {
    if (props.mode === 'create' && !enabledCurrencyOptions.value.some(item => item.value === form.currency)) {
      form.currency = enabledCurrencyOptions.value[0]?.value ?? 'LAK'
    }
  },
  { immediate: true }
)

watch(
  () => form.type,
  (type) => {
    form.category = categoryOptionsFor(type)[0] ?? form.category

    if (type !== 'move') {
      form.toWalletId = ''
    }

    if (type !== 'loan') {
      form.counterparty = ''
      form.loanDirection = 'given'
    }
  }
)

watch(
  () => form.currency,
  () => {
    const matchingWallet = walletOptionsForCurrency(form.currency).find(item => item.value === form.walletId)
    if (!matchingWallet) {
      form.walletId = walletOptionsForCurrency(form.currency)[0]?.value ?? ''
    }
  }
)

watch(
  () => form.walletId,
  () => {
    if (!showDestination.value && !form.walletId) return
    if (!selectedWallet.value) return
    if (selectedWallet.value.currency !== form.currency) {
      form.currency = selectedWallet.value.currency
    }
  }
)

function handleSubmit() {
  if (!form.walletId || !form.amount || !form.category) return
  if (showDestination.value && !form.toWalletId) return

  emit('submit', {
    type: form.type,
    walletId: form.walletId,
    toWalletId: showDestination.value ? form.toWalletId : undefined,
    currency: form.currency,
    amount: Number(form.amount),
    category: form.category,
    note: form.note,
    date: form.date,
    counterparty: showLoanFields.value ? form.counterparty : undefined,
    loanDirection: showLoanFields.value ? form.loanDirection : undefined
  })
}
</script>

<template>
  <form class="space-y-5" @submit.prevent="handleSubmit">
    <UCard class="border border-white/60 bg-white/90 shadow-[0_18px_50px_-24px_rgba(15,23,42,0.22)] dark:border-white/10 dark:bg-slate-950/80">
      <div class="grid grid-cols-4 gap-2 rounded-[1.35rem] bg-slate-100 p-2 dark:bg-slate-900">
        <button
          v-for="item in typeOptions"
          :key="item.value"
          type="button"
          class="rounded-[1rem] px-2 py-3 text-sm font-bold transition active:scale-95"
          :class="form.type === item.value ? 'bg-white text-primary shadow-sm dark:bg-slate-800' : 'text-muted'"
          @click="form.type = item.value"
        >
          {{ item.label }}
        </button>
      </div>

      <div class="mt-5">
        <p class="text-xs font-semibold uppercase tracking-[0.26em] text-muted">Amount</p>
        <UInput
          v-model="form.amount"
          type="number"
          inputmode="decimal"
          step="0.01"
          placeholder="0"
          class="mt-2 text-4xl font-extrabold tracking-tight"
          size="xl"
        >
          <template #trailing>
            <span class="text-sm font-bold text-muted">{{ currencyLabel }}</span>
          </template>
        </UInput>
      </div>
    </UCard>

    <div class="grid gap-4">
      <UFormField label="Wallet" help="Choose the wallet that should receive or pay the money.">
        <USelectMenu
          v-model="form.walletId"
          :items="walletItems"
          value-attribute="value"
          option-attribute="label"
          placeholder="Select wallet"
          class="w-full"
          :ui="{ trailing: 'pointer-events-none' }"
        />
      </UFormField>

      <UFormField label="Currency">
        <USelectMenu
          v-model="form.currency"
          :items="currencyItems"
          value-attribute="value"
          option-attribute="label"
          class="w-full"
        />
      </UFormField>

      <UFormField label="Category">
        <USelectMenu
          v-model="form.category"
          :items="categoryItems"
          value-attribute="value"
          option-attribute="label"
          class="w-full"
        />
      </UFormField>

      <UFormField label="Date">
        <input
          v-model="form.date"
          type="date"
          class="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-base text-default shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-800 dark:bg-slate-950"
        />
      </UFormField>

      <UFormField label="Note">
        <UTextarea
          v-model="form.note"
          placeholder="Add a note, vendor, or short reminder"
          :rows="4"
          autoresize
        />
      </UFormField>

      <UCard v-if="showDestination || showLoanFields" class="border border-white/60 bg-white/90 dark:border-white/10 dark:bg-slate-950/80">
        <div v-if="showDestination" class="space-y-4">
          <UFormField label="Destination wallet">
            <USelectMenu
              v-model="form.toWalletId"
              :items="destinationItems"
              value-attribute="value"
              option-attribute="label"
              placeholder="Select destination"
              class="w-full"
            />
          </UFormField>
          <p class="text-sm text-muted">This creates a transfer between two wallets with the same currency.</p>
        </div>

        <div v-if="showLoanFields" class="space-y-4">
          <UFormField label="Loan direction">
            <div class="grid grid-cols-2 gap-2 rounded-[1.25rem] bg-slate-100 p-2 dark:bg-slate-900">
              <button
                v-for="item in loanDirectionOptions"
                :key="item.value"
                type="button"
                class="rounded-[1rem] px-3 py-3 text-sm font-bold transition active:scale-95"
                :class="form.loanDirection === item.value ? 'bg-white text-primary shadow-sm dark:bg-slate-800' : 'text-muted'"
                @click="form.loanDirection = item.value"
              >
                {{ item.label }}
              </button>
            </div>
          </UFormField>

          <UFormField label="Counterparty">
            <UInput v-model="form.counterparty" placeholder="Name of the person" />
          </UFormField>
        </div>
      </UCard>
    </div>

    <div class="sticky bottom-0 z-20 -mx-4 border-t border-white/60 bg-white/85 px-4 py-4 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/85">
      <div class="mx-auto grid max-w-md gap-3">
        <UButton
          type="submit"
          size="xl"
          block
          class="h-14 rounded-2xl text-base font-extrabold"
        >
          {{ submitText }}
        </UButton>

        <UButton
          v-if="mode === 'edit'"
          type="button"
          variant="soft"
          color="rose"
          size="xl"
          block
          class="h-14 rounded-2xl text-base font-bold"
          @click="emit('delete')"
        >
          Delete transaction
        </UButton>
      </div>
    </div>
  </form>
</template>
