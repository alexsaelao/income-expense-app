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
  formId?: string
  showActions?: boolean
}>()

const emit = defineEmits<{
  (event: 'submit', payload: TransactionInput): void
  (event: 'delete'): void
}>()

const { wallets, walletEntries, categoryEntriesFor, categoryOptionsFor, enabledCurrencyOptions, companyEntries, companyOptions, hydrated, calculateMoveDestinationAmount } = useMoneyNote()
const { selectedLanguage } = useAppLanguage()
const { activeTheme } = useAppThemeColor()
const formTypeOptions = computed(() => {
  return typeOptions.toSorted((a, b) => {
    const order: Record<string, number> = {
      expense: 0,
      income: 1,
      move: 2,
      loan: 3
    }

    return order[a.value] - order[b.value]
  })
})

const form = reactive({
  type: 'expense' as TransactionType,
  walletId: '',
  toWalletId: '',
  currency: 'LAK' as TransactionInput['currency'],
  amount: '',
  exchangeRate: '',
  category: '',
  note: '',
  date: new Date().toISOString().slice(0, 10),
  company: '',
  counterparty: '',
  loanDirection: 'given' as TransactionInput['loanDirection']
})
const amountDisplay = ref('')
const amountInput = computed({
  get: () => amountDisplay.value,
  set: (value: string | number) => {
    const normalized = normalizeAmountValue(String(value))
    form.amount = normalized
    amountDisplay.value = normalized ? formatAmountValue(normalized) : ''
  }
})
const initialCategory = computed(() => props.initialTransaction?.category?.trim() ?? '')

const currencyLabel = computed(() => {
  return currencySymbols[form.currency]
})

function fallbackCategoryForType(type: TransactionType) {
  return categoryOptionsFor(type)[0] ?? 'Other'
}

function formatWalletLabel(wallet: { emoji?: string; name: string; currency: CurrencyCode }) {
  return `${String(wallet.emoji ?? '💳')} ${String(wallet.name)} (${String(wallet.currency)})`
}

function formatCategoryLabel(category: { emoji?: string; name: string }) {
  return `${String(category.emoji ?? '🏷️')} ${String(category.name)}`
}

function formatCompanyLabel(company: { emoji?: string; name: string }) {
  return `${String(company.emoji ?? '🏢')} ${String(company.name)}`
}

const currencyItems = computed(() => {
  const items = enabledCurrencyOptions.value.map(item => ({
    label: String(item.label),
    value: item.value
  }))

  if (!items.some(item => item.value === form.currency)) {
    items.unshift({
      label: `${String(form.currency)} (Disabled)`,
      value: form.currency
    })
  }

  return items
})

const walletItems = computed(() => walletEntries()
  .filter(wallet => wallet.enabled !== false)
  .map(wallet => ({
    label: formatWalletLabel(wallet),
    value: wallet.id
  })))
const destinationItems = computed(() => wallets.value
  .filter(wallet => wallet.id !== form.walletId)
  .map(wallet => ({
    label: formatWalletLabel(wallet),
    value: wallet.id
  })))
const categoryItems = computed(() => {
  const type = form.type === 'income' || form.type === 'expense' ? form.type : null
  const items = categoryOptionsFor(form.type).map((category) => {
    const matched = type ? categoryEntriesFor(type).find(entry => entry.name === category) : undefined
    return {
      label: matched ? formatCategoryLabel(matched) : String(category),
      value: category
    }
  })

  if (type && props.mode === 'edit' && props.initialTransaction?.type === type && initialCategory.value && !items.some(item => item.value === initialCategory.value)) {
    items.unshift({ label: String(initialCategory.value), value: initialCategory.value })
  }

  return items
})
const hasCategoryItems = computed(() => categoryItems.value.length > 0)
const categoryPlaceholder = computed(() => {
  if (hasCategoryItems.value) return 'Select category'
  return selectedLanguage.value === 'lo' ? 'ສ້າງປະເພດກ່ອນ' : 'Create a category first'
})
const categoryEmptyHint = computed(() => selectedLanguage.value === 'lo'
  ? 'ບໍ່ມີປະເພດໃຫ້ເລືອກ. ສ້າງປະເພດໃໝ່ກ່ອນ.'
  : 'No categories available. Create one first.')
const companyItems = computed(() => {
  const items = companyEntriesList.value
    .filter(company => company.enabled !== false)
    .map(company => ({
      label: formatCompanyLabel(company),
      value: company.name
    }))

  if (props.mode === 'edit' && props.initialTransaction?.company && !items.some(item => item.value === props.initialTransaction?.company)) {
    const matched = companyEntriesList.value.find(company => company.name === props.initialTransaction?.company)
    items.unshift({
      label: matched ? formatCompanyLabel(matched) : String(props.initialTransaction.company),
      value: props.initialTransaction.company
    })
  }

  return items
})
const hasCompanyItems = computed(() => companyItems.value.length > 0)
const companyPlaceholder = computed(() => hasCompanyItems.value ? 'Select company' : (selectedLanguage.value === 'lo' ? 'ສ້າງບໍລິສັດກ່ອນ' : 'Create a company first'))
const companyEmptyHint = computed(() => selectedLanguage.value === 'lo'
  ? 'ບໍ່ມີບໍລິສັດໃຫ້ເລືອກ. ສ້າງບໍລິສັດໃໝ່ກ່ອນ.'
  : 'No companies available. Create one first.')
const companyEntriesList = computed(() => companyEntries())
const submitText = computed(() => props.submitLabel ?? (props.mode === 'edit' ? 'Save changes' : 'Add transaction'))
const showDestination = computed(() => form.type === 'move')
const showLoanFields = computed(() => form.type === 'loan')
const showLoanDirectionField = computed(() => form.type === 'loan')
const showCompanyField = computed(() => form.type === 'income')
const showCategoryField = computed(() => !showDestination.value && form.type !== 'loan')
const showSingleWalletField = computed(() => showDestination.value || showLoanDirectionField.value)
const lockCurrencySelection = computed(() => true)
const selectedWallet = computed(() => wallets.value.find(wallet => wallet.id === form.walletId))
const destinationWallet = computed(() => wallets.value.find(wallet => wallet.id === form.toWalletId))
const needsExchangeRate = computed(() => {
  if (!showDestination.value) return false
  if (!selectedWallet.value || !destinationWallet.value) return false
  return selectedWallet.value.currency !== destinationWallet.value.currency
})
const moveDestinationCurrencyLabel = computed(() => destinationWallet.value?.currency ?? '_')
const moveDestinationAmountValue = computed(() => {
  if (!showDestination.value) return 0
  return calculateMoveDestinationAmount(
    Number(form.amount || 0),
    selectedWallet.value?.currency,
    destinationWallet.value?.currency,
    Number(form.exchangeRate || 0)
  )
})
const moveDestinationAmountLabel = computed(() => {
  if (!showDestination.value) return ''
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(moveDestinationAmountValue.value)
})
const moveRateGuideLabel = computed(() => {
  if (!selectedWallet.value || !destinationWallet.value) return ''

  const pair = `${selectedWallet.value.currency}->${destinationWallet.value.currency}`
  const rateText = form.exchangeRate ? new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(Number(form.exchangeRate)) : '?'

  if (pair === 'THB->LAK' || pair === 'USD->LAK' || pair === 'USD->THB') {
    return `1 ${selectedWallet.value.currency} = ${rateText} ${destinationWallet.value.currency}`
  }

  if (pair === 'THB->USD' || pair === 'LAK->THB' || pair === 'LAK->USD') {
    return `1 ${destinationWallet.value.currency} = ${rateText} ${selectedWallet.value.currency}`
  }

  return `Rate: ${rateText}`
})
const exchangeRatePlaceholder = computed(() => {
  if (!selectedWallet.value || !destinationWallet.value) return '0'

  const pair = `${selectedWallet.value.currency}->${destinationWallet.value.currency}`
  if (pair === 'THB->LAK' || pair === 'LAK->LAK') return '680'
  if (pair === 'LAK->USD' || pair === 'USD->LAK') return '22000'
  if (pair === 'THB->USD' || pair === 'USD->THB') return '32'

  return '0'
})
const moveDestinationHint = computed(() => {
  if (!showDestination.value) return ''
  if (!selectedWallet.value || !destinationWallet.value) {
    return selectedLanguage.value === 'lo'
      ? 'ເລືອກກະເປົ໋າຕົ້ນທາງແລະປາຍທາງກ່ອນ.'
      : 'Choose source and destination wallets first.'
  }

  if (!form.amount) {
    return selectedLanguage.value === 'lo'
      ? 'ພິມຈຳນວນເພື່ອເບິ່ງຍອດປາຍທາງ.'
      : 'Enter an amount to preview the destination balance.'
  }

  if (selectedLanguage.value === 'lo') {
    return needsExchangeRate.value
      ? 'ໃສ່ອັດຕາແລກປ່ຽນເພື່ອຄຳນວນອັດຕະໂນມັດ.'
      : 'ປາຍທາງຈະໄດ້ຮັບຈຳນວນເທົ່າກັນ.'
  }

  return needsExchangeRate.value
    ? 'Add an exchange rate to auto-calculate the destination amount.'
    : 'The destination wallet gets the same amount.'
})
const canSubmit = computed(() => Boolean(
  form.walletId
  && form.amount
  && (!showCategoryField.value || form.category || fallbackCategoryForType(form.type))
  && (!showDestination.value || form.toWalletId)
  && (!needsExchangeRate.value || (form.exchangeRate && Number(form.exchangeRate) > 0))
))
defineExpose({
  canSubmit
})
const walletLabel = computed(() => (showDestination.value ? 'Source wallet' : 'Wallet'))
const destinationLabel = computed(() => 'Destination wallet')
const selectMenuUi = {
  base: 'h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-[15px] font-semibold text-default shadow-none outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-800 dark:bg-slate-950',
  trailing: 'pointer-events-none'
}

const nativeSelectClass = 'mt-3 h-12 w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-4 text-[16px] font-semibold text-default shadow-none outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-70 dark:border-slate-800 dark:bg-slate-950'
const textInputClass = 'w-full rounded-2xl [&>input]:h-12 [&>input]:w-full [&>input]:rounded-2xl [&>input]:border-0 [&>input]:bg-slate-50 [&>input]:px-4 [&>input]:text-[16px] [&>input]:font-semibold [&>input]:shadow-none dark:[&>input]:bg-slate-950'
const textareaClass = 'w-full rounded-2xl [&>textarea]:min-h-[96px] [&>textarea]:w-full [&>textarea]:rounded-2xl [&>textarea]:border-0 [&>textarea]:bg-slate-50 [&>textarea]:px-4 [&>textarea]:py-3 [&>textarea]:text-[16px] [&>textarea]:font-medium [&>textarea]:leading-6 [&>textarea]:shadow-none dark:[&>textarea]:bg-slate-950'

function normalizeAmountValue(value: string) {
  return value.replace(/\D/g, '')
}

function formatAmountValue(value: string | number) {
  const normalized = normalizeAmountValue(String(value))
  if (!normalized) return ''

  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(Number(normalized))
}

function syncAmountDisplay(value: string | number) {
  const normalized = normalizeAmountValue(String(value))
  form.amount = normalized
  amountDisplay.value = normalized ? formatAmountValue(normalized) : ''
}

function preferredWalletForCreate(currency?: TransactionInput['currency']) {
  const entries = walletEntries()
  const matchingEntries = currency
    ? entries.filter(wallet => wallet.currency === currency)
    : entries

  const preferredEntry = matchingEntries.find(wallet => wallet.pinned) ?? matchingEntries[0] ?? entries[0] ?? null
  if (!preferredEntry) {
    return null
  }

  return wallets.value.find(wallet => wallet.id === preferredEntry.id) ?? null
}

function preferredCategoryForCreate(type: TransactionType) {
  return categoryEntriesFor(type).find(category => category.enabled !== false)?.name ?? ''
}

function preferredCompanyForCreate() {
  const entries = companyEntriesList.value
  const preferredEntry = entries.find(company => company.enabled !== false && company.pinned)
    ?? entries.find(company => company.enabled !== false)
    ?? null

  return preferredEntry?.name ?? ''
}

function applyCreateDefaults(type: TransactionType = form.type) {
  if (props.mode !== 'create') return
  if (type !== 'income' && type !== 'expense') return

  const currentWallet = wallets.value.find(item => item.id === form.walletId)
  const currentWalletMatchesCurrency = Boolean(currentWallet && currentWallet.currency === form.currency)

  if (!currentWalletMatchesCurrency) {
    const preferredWallet = preferredWalletForCreate(form.currency)
    if (preferredWallet) {
      form.currency = preferredWallet.currency
      form.walletId = preferredWallet.id
    }
  }

  const category = preferredCategoryForCreate(type)
  form.category = category || fallbackCategoryForType(type)

  if (type === 'income') {
    const currentCompanyValid = companyItems.value.some(item => item.value === form.company)
    if (!currentCompanyValid || !form.company) {
      const preferredCompany = preferredCompanyForCreate()
      if (preferredCompany) {
        form.company = preferredCompany
      }
    }
  }
}

function syncCreateWalletDefaults() {
  if (props.mode !== 'create') return

  const currentWallet = wallets.value.find(item => item.id === form.walletId)
  if (currentWallet && currentWallet.currency === form.currency) return

  const wallet = preferredWalletForCreate(form.currency)
  if (!wallet) return

  if (form.walletId !== wallet.id) {
    form.walletId = wallet.id
  }

  if (form.currency !== wallet.currency) {
    form.currency = wallet.currency
  }
}

function resetFromTransaction(transaction?: Transaction | null) {
  const currentWallet = transaction?.walletId
    ? wallets.value.find(wallet => wallet.id === transaction.walletId)
    : preferredWalletForCreate(transaction?.currency)

  form.type = transaction?.type ?? 'expense'
  form.walletId = currentWallet?.id ?? ''
  form.toWalletId = transaction?.toWalletId ?? ''
  form.currency = transaction?.currency ?? currentWallet?.currency ?? 'LAK'
  syncAmountDisplay(transaction ? transaction.amount : '')
  form.exchangeRate = transaction?.exchangeRate ? String(transaction.exchangeRate) : ''
  form.category = transaction?.category ?? categoryOptionsFor(transaction?.type ?? form.type)[0] ?? ''
  form.note = transaction?.note ?? ''
  form.date = transaction?.date ?? new Date().toISOString().slice(0, 10)
  form.company = transaction?.company ?? ''
  form.counterparty = transaction?.counterparty ?? ''
  form.loanDirection = transaction?.loanDirection ?? 'given'

  if (!transaction) {
    applyCreateDefaults(form.type)
  }
}

watch(
  hydrated,
  (ready) => {
    if (!ready || props.mode !== 'create' || props.initialTransaction) return
    applyCreateDefaults(form.type)
    syncCreateWalletDefaults()
  },
  { immediate: true }
)

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
    if (type !== 'income') {
      form.company = ''
    }

    if (type !== 'move') {
      form.toWalletId = ''
      form.exchangeRate = ''
    }

    if (type === 'move' && selectedWallet.value) {
      form.currency = selectedWallet.value.currency
    }

    if (type !== 'loan') {
      form.counterparty = ''
      form.loanDirection = 'given'
    }

    applyCreateDefaults(type)
  }
)

watch(
  wallets,
  () => {
    if (props.mode !== 'create') return
    syncCreateWalletDefaults()
    applyCreateDefaults(form.type)
  },
  { immediate: true }
)

watch(
  categoryItems,
  (items) => {
    if (!items.length) {
      if (props.mode === 'create') {
        form.category = fallbackCategoryForType(form.type)
      }
      return
    }

    if (!items.some(item => item.value === form.category)) {
      form.category = items[0]?.value ?? ''
    }
  },
  { immediate: true }
)

watch(
  companyEntriesList,
  () => {
    if (props.mode !== 'create' || form.type !== 'income') return
    if (companyItems.value.some(item => item.value === form.company)) return

    const preferredCompany = preferredCompanyForCreate()
    if (preferredCompany) {
      form.company = preferredCompany
    }
  },
  { immediate: true }
)

watch(
  () => form.currency,
  () => {
    if (props.mode !== 'create' || showDestination.value) return

    const preferredWallet = preferredWalletForCreate(form.currency)
    if (preferredWallet && form.walletId !== preferredWallet.id) {
      form.walletId = preferredWallet.id
    }
  }
)

watch(
  () => form.walletId,
  () => {
    if (!selectedWallet.value) return

    if (selectedWallet.value.currency !== form.currency) {
      form.currency = selectedWallet.value.currency
    }

    if (showDestination.value) {
      if (form.toWalletId === form.walletId) {
        form.toWalletId = ''
      }
      form.exchangeRate = ''
    }
  }
)

watch(
  () => form.toWalletId,
  () => {
    if (!showDestination.value) return
    form.exchangeRate = ''
  }
)

function handleSubmit() {
  if (!form.walletId || !form.amount) return
  if (showDestination.value && !form.toWalletId) return
  if (needsExchangeRate.value && (!form.exchangeRate || Number(form.exchangeRate) <= 0)) return

  const exchangeRate = needsExchangeRate.value ? Number(form.exchangeRate) : undefined
  const category = showDestination.value
    ? 'Transfer'
    : showLoanFields.value
      ? 'Loan'
      : form.category || fallbackCategoryForType(form.type)

  emit('submit', {
    type: form.type,
    walletId: form.walletId,
    toWalletId: showDestination.value ? form.toWalletId : undefined,
    currency: form.currency,
    amount: Number(form.amount),
    exchangeRate: exchangeRate && exchangeRate > 0 ? exchangeRate : undefined,
    category,
    note: form.note,
    date: form.date,
    company: showCompanyField.value ? form.company : undefined,
    counterparty: showLoanFields.value ? form.counterparty : undefined,
    loanDirection: showLoanFields.value ? form.loanDirection : undefined
  })
}

function applyAmountMultiplier(multiplier: number) {
  const currentAmount = Number(form.amount || 0)
  const nextAmount = currentAmount > 0 ? currentAmount * multiplier : multiplier

  syncAmountDisplay(Number.isInteger(nextAmount) ? String(nextAmount) : nextAmount.toFixed(2).replace(/\.00$/, ''))
}

function handleAmountFocus() {
  amountDisplay.value = form.amount ? formatAmountValue(form.amount) : ''
}

function handleAmountBlur() {
  amountDisplay.value = form.amount ? formatAmountValue(form.amount) : ''
}

function handleAmountKeydown(event: KeyboardEvent) {
  const allowedKeys = new Set([
    'Backspace',
    'Delete',
    'Tab',
    'Enter',
    'Escape',
    'ArrowLeft',
    'ArrowRight',
    'ArrowUp',
    'ArrowDown',
    'Home',
    'End'
  ])

  if (event.ctrlKey || event.metaKey || allowedKeys.has(event.key)) {
    return
  }

  if (/^\d$/.test(event.key)) {
    return
  }

  event.preventDefault()
}
</script>

<template>
  <form :id="props.formId" class="space-y-4 pb-24 sm:pb-20" @submit.prevent="handleSubmit">
    <UCard class="overflow-hidden rounded-[1.4rem] border border-white/60 bg-white/90 shadow-[0_18px_50px_-24px_rgba(15,23,42,0.22)] dark:border-white/10 dark:bg-slate-950/80">
      <template #header>
        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted">Type and amount</p>
            <h2 class="mt-1 text-xl font-black tracking-tight text-default sm:text-2xl">Quick capture</h2>
          </div>
          <div :class="['flex size-10 items-center justify-center rounded-full bg-gradient-to-br text-white shadow-lg', activeTheme.accent]">
            <UIcon name="i-lucide-scan-line" class="size-5" />
          </div>
        </div>
      </template>

      <div class="space-y-4">
        <div class="grid grid-cols-4 gap-2 rounded-full bg-slate-100 p-2 dark:bg-slate-900">
          <button
            v-for="item in formTypeOptions"
            :key="item.value"
            type="button"
            class="rounded-full px-2 py-3 text-[11px] font-bold transition active:scale-95 sm:text-sm"
            :class="form.type === item.value ? 'bg-white text-primary shadow-sm dark:bg-slate-800' : 'text-muted'"
            @click="form.type = item.value"
          >
            {{ item.label }}
          </button>
        </div>

        <div class="space-y-4">
          <div>
            <div class="flex items-center gap-2">
              <div class="flex size-9 items-center justify-center rounded-full bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-200">
                <UIcon name="i-lucide-calendar-range" class="size-4.5" />
              </div>
              <p class="text-[9px] font-semibold uppercase tracking-[0.24em] text-muted sm:text-[10px]">Date</p>
            </div>

            <input
              v-model="form.date"
              type="date"
              class="mt-3 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-[15px] font-semibold text-default shadow-none outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-800 dark:bg-slate-950"
            />
          </div>

          <div v-if="showSingleWalletField" class="space-y-4">
            <div>
              <div class="flex items-center gap-2">
                <div class="flex size-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-200">
                  <UIcon name="i-lucide-wallet" class="size-4.5" />
                </div>
                <p class="text-[9px] font-semibold uppercase tracking-[0.24em] text-muted sm:text-[10px]">{{ walletLabel }}</p>
              </div>

              <select
                :key="`wallet-${form.type}-${form.currency}-${showDestination ? 'move' : 'single'}`"
                v-model="form.walletId"
                class="mt-3 h-12 w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-4 text-[16px] font-semibold text-default shadow-none outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-800 dark:bg-slate-950"
              >
                <option value="" disabled>Select wallet</option>
                <option v-for="item in walletItems" :key="item.value" :value="item.value">
                  {{ item.label }}
                </option>
              </select>
            </div>
          </div>

          <div v-else class="grid gap-4 sm:grid-cols-2">
            <div>
              <div class="flex items-center gap-2">
                <div class="flex size-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-200">
                  <UIcon name="i-lucide-wallet" class="size-4.5" />
                </div>
                <p class="text-[9px] font-semibold uppercase tracking-[0.24em] text-muted sm:text-[10px]">{{ walletLabel }}</p>
              </div>

              <select
                :key="`wallet-${form.type}-${form.currency}-source`"
                v-model="form.walletId"
                class="mt-3 h-12 w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-4 text-[16px] font-semibold text-default shadow-none outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-70 dark:border-slate-800 dark:bg-slate-950"
              >
                <option value="" disabled>Select wallet</option>
                <option v-for="item in walletItems" :key="item.value" :value="item.value">
                  {{ item.label }}
                </option>
              </select>
            </div>

            <div v-if="showCategoryField">
              <div class="flex items-center gap-2">
                <div class="flex size-9 items-center justify-center rounded-full bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-200">
                  <UIcon name="i-lucide-tag" class="size-4.5" />
                </div>
                <p class="text-[9px] font-semibold uppercase tracking-[0.24em] text-muted sm:text-[10px]">Category</p>
              </div>

              <select
                v-model="form.category"
                class="mt-3 h-12 w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-4 text-[16px] font-semibold text-default shadow-none outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-70 dark:border-slate-800 dark:bg-slate-950"
              >
                <option value="" disabled>
                  {{ categoryPlaceholder }}
                </option>
                <option v-for="item in categoryItems" :key="item.value" :value="item.value">
                  {{ item.label }}
                </option>
              </select>
              <p v-if="!hasCategoryItems" class="mt-2 text-[11px] font-medium text-muted">
                {{ categoryEmptyHint }}
              </p>
            </div>
          </div>

          <div v-if="showLoanDirectionField" class="space-y-4">
            <div class="flex items-center gap-2">
              <div class="flex size-9 items-center justify-center rounded-full bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-200">
                <UIcon name="i-lucide-arrow-left-right" class="size-4.5" />
              </div>
              <p class="text-[9px] font-semibold uppercase tracking-[0.24em] text-muted sm:text-[10px]">Loan direction</p>
            </div>

            <div class="grid grid-cols-2 gap-2 rounded-[1.25rem] bg-slate-100 p-2 dark:bg-slate-900">
              <button
                v-for="item in loanDirectionOptions"
                :key="item.value"
                type="button"
                class="rounded-full px-3 py-3 text-sm font-bold transition active:scale-95"
                :class="form.loanDirection === item.value ? 'bg-white text-primary shadow-sm dark:bg-slate-800' : 'text-muted'"
                @click="form.loanDirection = item.value"
              >
                {{ item.label }}
              </button>
            </div>
          </div>

          <div v-if="showCompanyField">
            <div class="flex items-center gap-2">
              <div class="flex size-9 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-200">
                <UIcon name="i-lucide-building-2" class="size-4.5" />
              </div>
              <p class="text-[9px] font-semibold uppercase tracking-[0.24em] text-muted sm:text-[10px]">Company</p>
            </div>

            <select
              v-model="form.company"
              class="mt-3 h-12 w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-4 text-[16px] font-semibold text-default shadow-none outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-70 dark:border-slate-800 dark:bg-slate-950"
            >
              <option value="" disabled>
                {{ companyPlaceholder }}
              </option>
              <option v-for="item in companyItems" :key="item.value" :value="item.value">
                {{ item.label }}
              </option>
            </select>
            <p v-if="!hasCompanyItems" class="mt-2 text-[11px] font-medium text-muted">
              {{ companyEmptyHint }}
            </p>
          </div>

          <div v-if="showDestination" class="space-y-4">
            <div>
              <div class="flex items-center gap-2">
                <div class="flex size-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-200">
                  <UIcon name="i-lucide-arrow-left-right" class="size-4.5" />
                </div>
                <p class="text-[9px] font-semibold uppercase tracking-[0.24em] text-muted sm:text-[10px]">{{ destinationLabel }}</p>
              </div>

              <select
                :key="`wallet-${form.type}-${form.currency}-destination`"
                v-model="form.toWalletId"
                class="mt-3 h-12 w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-4 text-[16px] font-semibold text-default shadow-none outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-800 dark:bg-slate-950"
              >
                <option value="" disabled>Select destination</option>
                <option v-for="item in destinationItems" :key="item.value" :value="item.value">
                  {{ item.label }}
                </option>
              </select>
            </div>

            <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
              <div class="flex items-center justify-between gap-3">
                <div class="flex items-center gap-2">
                  <div class="flex size-8 items-center justify-center rounded-full bg-cyan-100 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-100">
                    <UIcon name="i-lucide-arrow-left-right" class="size-4" />
                  </div>
                  <p class="text-[9px] font-semibold uppercase tracking-[0.24em] text-cyan-700 dark:text-cyan-100 sm:text-[10px]">Exchange rate</p>
                </div>

                <p v-if="selectedWallet && destinationWallet" class="text-[11px] font-semibold text-cyan-700 dark:text-cyan-100">
                  {{ moveRateGuideLabel }}
                </p>
              </div>

              <div v-if="selectedWallet && destinationWallet" class="mt-3">
                <p class="text-[11px] font-semibold text-cyan-700/80 dark:text-cyan-100/80">
                  {{ selectedWallet.currency }} → {{ destinationWallet.currency }} transfer
                </p>

                <UInput
                  v-if="needsExchangeRate"
                  v-model="form.exchangeRate"
                  :key="`${selectedWallet.currency}-${destinationWallet.currency}`"
                  type="text"
                  inputmode="numeric"
                  pattern="[0-9]*"
                  :placeholder="exchangeRatePlaceholder"
                  class="mt-3 w-full rounded-2xl [&>input]:h-12 [&>input]:w-full [&>input]:rounded-2xl [&>input]:border-0 [&>input]:bg-white [&>input]:px-4 [&>input]:text-[16px] [&>input]:font-semibold [&>input]:tabular-nums [&>input]:shadow-none dark:[&>input]:bg-slate-950"
                />

                <div
                  v-else
                  class="mt-3 rounded-2xl border border-emerald-200/70 bg-emerald-50 px-4 py-3 text-[12px] font-semibold text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-100"
                >
                  Same currency transfer. No exchange rate needed.
                </div>
              </div>

              <div v-else class="mt-3 text-[12px] font-semibold text-muted">
                Choose source and destination wallets to show exchange rate.
              </div>
            </div>

          </div>

          <div class="grid grid-cols-[minmax(0,1fr)_7rem] gap-3">
            <div class="min-w-0">
              <div class="flex items-center gap-2">
                <div class="flex size-9 items-center justify-center rounded-full bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-200">
                  <UIcon name="i-lucide-coins" class="size-4.5" />
                </div>
                <p class="text-[9px] font-semibold uppercase tracking-[0.24em] text-muted sm:text-[10px]">Amount</p>
              </div>

<UInput
              v-model="amountInput"
                type="text"
                inputmode="numeric"
                pattern="[0-9,]*"
                autocomplete="off"
                autocapitalize="off"
                spellcheck="false"
                placeholder="0"
                class="mt-3 w-full rounded-2xl [&>input]:h-12 [&>input]:w-full [&>input]:rounded-2xl [&>input]:border-0 [&>input]:bg-white [&>input]:px-4 [&>input]:text-[16px] [&>input]:font-semibold [&>input]:tabular-nums [&>input]:shadow-none dark:[&>input]:bg-slate-950"
                @focus="handleAmountFocus"
                @blur="handleAmountBlur"
                @keydown="handleAmountKeydown"
              >
                <template #trailing>
                  <span class="text-xs font-bold text-muted sm:text-sm">{{ currencyLabel }}</span>
                </template>
              </UInput>
            </div>

            <div>
              <div class="flex items-center gap-2">
                <div class="flex size-9 items-center justify-center rounded-full bg-cyan-50 text-cyan-600 dark:bg-cyan-950/40 dark:text-cyan-200">
                  <UIcon name="i-lucide-currency" class="size-4.5" />
                </div>
                <p class="text-[9px] font-semibold uppercase tracking-[0.24em] text-muted sm:text-[10px]">Currency</p>
              </div>

              <select
                v-model="form.currency"
                class="mt-3 h-12 w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-4 text-[16px] font-semibold text-default shadow-none outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-70 dark:border-slate-800 dark:bg-slate-950"
                :disabled="lockCurrencySelection || showDestination"
              >
                <option v-for="item in currencyItems" :key="item.value" :value="item.value">
                  {{ item.label }}
                </option>
              </select>
              <p class="mt-1.5 text-[10px] font-medium text-muted">
                {{ selectedLanguage === 'lo'
                  ? 'ຕາມກະເປົ໋າ'
                  : 'Auto from wallet' }}
              </p>
            </div>
          </div>

          <div class="flex items-center justify-start gap-3">
            <button
              type="button"
              class="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-bold text-slate-600 transition active:scale-95 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
              @click="applyAmountMultiplier(1000)"
            >
              <UIcon name="i-lucide-plus" class="size-3.5" />
              x1000
            </button>
          </div>

          <div v-if="showDestination" class="rounded-2xl border border-sky-200/80 bg-sky-50/80 p-4 text-sky-700 dark:border-sky-900/40 dark:bg-sky-950/20 dark:text-sky-100">
            <div class="flex items-center gap-2">
              <div class="flex size-8 items-center justify-center rounded-full bg-white/80 text-sky-600 shadow-sm dark:bg-slate-950/80 dark:text-sky-200">
                <UIcon name="i-lucide-badge-info" class="size-4" />
              </div>
              <p class="text-[9px] font-semibold uppercase tracking-[0.24em] sm:text-[10px]">Destination wallet</p>
            </div>

            <p class="mt-2 text-sm font-bold text-sky-700 dark:text-sky-100">
              Will receive {{ moveDestinationAmountLabel }} {{ moveDestinationCurrencyLabel }}
            </p>
            <p class="mt-1 text-[11px] font-medium text-sky-700/80 dark:text-sky-100/80">
              {{ moveDestinationHint }}
            </p>
          </div>

          <div v-if="showLoanFields" class="space-y-4 border-t border-slate-200/70 pt-4 dark:border-slate-800">
            <div>
              <div class="flex items-center gap-2">
                <div class="flex size-9 items-center justify-center rounded-full bg-pink-50 text-pink-600 dark:bg-pink-950/40 dark:text-pink-200">
                  <UIcon name="i-lucide-user-round" class="size-4.5" />
                </div>
                <p class="text-[9px] font-semibold uppercase tracking-[0.24em] text-muted sm:text-[10px]">Counterparty</p>
              </div>

              <UInput v-model="form.counterparty" placeholder="Name of the person" class="mt-3" :class="textInputClass" />
            </div>
          </div>

          <div>
            <div class="flex items-center gap-2">
              <div class="flex size-9 items-center justify-center rounded-full bg-pink-50 text-pink-600 dark:bg-pink-950/40 dark:text-pink-200">
                <UIcon name="i-lucide-notepad-text" class="size-4.5" />
              </div>
              <p class="text-[9px] font-semibold uppercase tracking-[0.24em] text-muted sm:text-[10px]">Note</p>
            </div>

            <UTextarea
              v-model="form.note"
              placeholder="Add a note, vendor, or short reminder"
              :rows="4"
              autoresize
              class="mt-3 shadow-none"
              :class="textareaClass"
            />
          </div>
          </div>
      </div>
    </UCard>

    <div
      v-if="props.showActions !== false"
      class="fixed inset-x-0 z-50 border-t border-white/60 bg-white/92 px-4 py-3 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/90"
      style="bottom: calc(env(safe-area-inset-bottom) + 6.25rem); pointer-events: auto; touch-action: manipulation;"
    >
      <div class="mx-auto grid max-w-md gap-2">
        <UButton
          type="submit"
          size="xl"
          block
          :disabled="!canSubmit"
          class="h-12 rounded-full bg-primary text-sm font-extrabold text-white shadow-[0_14px_32px_-18px_rgba(15,23,42,0.28)] transition active:scale-[0.98] sm:h-13 sm:text-base"
        >
          <UIcon name="i-lucide-check" class="size-4" />
          {{ submitText }}
        </UButton>

        <UButton
          v-if="mode === 'edit'"
          type="button"
          variant="soft"
          color="rose"
          size="xl"
          block
          class="h-12 rounded-full text-sm font-bold sm:h-13 sm:text-base"
          @click="emit('delete')"
        >
          Delete transaction
        </UButton>
      </div>
    </div>
  </form>
</template>
