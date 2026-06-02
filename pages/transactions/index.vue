<script setup lang="ts">
import { typeOptions, useMoneyNote } from '~/composables/useMoneyNote'
import type { CurrencyCode, Transaction } from '~/composables/useMoneyNote'

const { selectedLanguage } = useAppLanguage()
const { activeTheme } = useAppThemeColor()
const { wallets, filterTransactions, groupTransactions, removeTransaction, enabledCurrencyOptions, formatCurrency } = useMoneyNote()

const searchDraft = ref('')
const appliedSearch = ref('')
const selectedType = ref<'all' | typeof typeOptions[number]['value']>('all')
const selectedWallet = ref<'all' | string>('all')
const selectedCurrency = ref<'all' | CurrencyCode>('all')
const fromDate = ref('')
const toDate = ref('')
const deleteConfirmOpen = ref(false)
const deleteTarget = ref<Transaction | null>(null)
const filtersOpen = ref(false)
const transactionsCopy = computed(() => {
  if (selectedLanguage.value === 'lo') {
    return {
      title: 'ທຸລະກຳ',
      searchFilters: 'ຊອກຫາ ແລະ ຕົວກອງ',
      quickDatesAndFilters: 'ຕົວກອງໄວ ແລະ ລາຍການ',
      hide: 'ຊ່ອນ',
      show: 'ແສດງ',
      search: 'ຊອກຫາ',
      searchPlaceholder: 'ຊອກຫາຫມາຍເຫດ, ປະເພດ, ຫຼື ບຸກຄົນ',
      type: 'ປະເພດ',
      wallet: 'ກະເປົ໋າ',
      currency: 'ເງິນຕາ',
      from: 'ຈາກ',
      to: 'ຮອດ',
      allTypes: 'ທຸກປະເພດ',
      allWallets: 'ກະເປົ໋າທັງໝົດ',
      allCurrencies: 'ທຸກເງິນຕາ',
      selectDate: 'ເລືອກວັນທີ',
      customDate: 'ວັນທີກຳນົດເອງ',
      allTime: 'ທຸກຊ່ວງເວລາ',
      today: 'ມື້ນີ້',
      yesterday: 'ວານນີ້',
      thisWeek: 'ອາທິດນີ້',
      lastWeek: 'ອາທິດກ່ອນ',
      thisMonth: 'ເດືອນນີ້',
      lastMonth: 'ເດືອນກ່ອນ',
      clearFilter: 'ລ້າງຕົວກອງ',
      items: 'ລາຍການ',
      noTransactions: 'ບໍ່ພົບທຸລະກຳ',
      addTransaction: 'ເພີ່ມທຸລະກຳ',
      deleteTitle: 'ລຶບທຸລະກຳ',
      deleteConfirmTitle: 'ຢືນຢັນການລຶບ',
      deleteConfirmDesc: 'ການລຶບນີ້ຈະລົບລາຍການທັນທີ ແລະ ປັບຍອດກະເປົ໋າໃຫ້ໃໝ່.',
      emptyStateDesc: 'ລອງປ່ຽນຕົວກອງ ຫຼື ເພີ່ມລາຍການໃໝ່.',
      deleteImpact: 'ການລຶບນີ້ຈະອັບເດດຍອດກະເປົ໋າທີ່ກ່ຽວຂ້ອງທັນທີ.',
      transactionEntry: 'ລາຍການທຸລະກຳ',
      cancel: 'ຍົກເລີກ',
      delete: 'ລຶບ',
      edit: 'ແກ້ໄຂ',
      addIcon: 'ເພີ່ມ',
    quickDates: 'ວັນທີໄວ'
    }
  }

  return {
    title: 'Transactions',
    searchFilters: 'Search & filters',
    quickDatesAndFilters: 'Quick dates & list filters',
    hide: 'Hide',
    show: 'Show',
    search: 'Search',
    searchPlaceholder: 'Search note, category, or person',
    type: 'Type',
    wallet: 'Wallet',
    currency: 'Currency',
    from: 'From',
    to: 'To',
    allTypes: 'All types',
    allWallets: 'All wallets',
    allCurrencies: 'All currencies',
    selectDate: 'Select date',
    customDate: 'Custom date',
    allTime: 'All time',
    today: 'Today',
    yesterday: 'Yesterday',
    thisWeek: 'This week',
    lastWeek: 'Last week',
    thisMonth: 'This month',
    lastMonth: 'Last month',
    clearFilter: 'Clear filter',
    items: 'items',
    noTransactions: 'No transactions found',
    addTransaction: 'Add transaction',
    deleteTitle: 'Delete transaction',
    deleteConfirmTitle: 'Delete transaction',
    deleteConfirmDesc: 'This will remove the record immediately and recalculate wallet balances.',
    emptyStateDesc: 'Try changing the filters or create a new entry.',
    deleteImpact: 'Deleting this transaction will update the linked wallet balances immediately.',
    transactionEntry: 'Transaction entry',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    addIcon: 'Add',
    quickDates: 'Quick dates'
  }
})

const datePresets = computed(() => [
  { label: transactionsCopy.value.today, value: 'today' },
  { label: transactionsCopy.value.yesterday, value: 'yesterday' },
  { label: transactionsCopy.value.thisWeek, value: 'this-week' },
  { label: transactionsCopy.value.lastWeek, value: 'last-week' },
  { label: transactionsCopy.value.thisMonth, value: 'this-month' },
  { label: transactionsCopy.value.lastMonth, value: 'last-month' }
] as const)

const localizedTypeOptions = computed(() => {
  if (selectedLanguage.value === 'lo') {
    return [
      { label: 'ລາຍຮັບ', value: 'income' as const },
      { label: 'ລາຍຈ່າຍ', value: 'expense' as const },
      { label: 'ໂອນ', value: 'move' as const },
      { label: 'ກູ້ຢືມ', value: 'loan' as const }
    ]
  }

  return typeOptions
})

const filterCards = computed(() => groupTransactions(filterTransactions({
  search: appliedSearch.value,
  type: selectedType.value,
  walletId: selectedWallet.value,
  currency: selectedCurrency.value,
  from: fromDate.value || undefined,
  to: toDate.value || undefined
})))

const hasActiveFilters = computed(() => Boolean(
  searchDraft.value.trim()
  || appliedSearch.value
  || selectedType.value !== 'all'
  || selectedWallet.value !== 'all'
  || selectedCurrency.value !== 'all'
  || fromDate.value
  || toDate.value
))

const walletItems = computed(() => [
  { label: transactionsCopy.value.allWallets, value: 'all' },
  ...wallets.value.map(wallet => ({ label: `${wallet.emoji} ${wallet.name}`, value: wallet.id }))
])

const filterSummary = computed(() => {
  const typeLabel = selectedType.value === 'all'
    ? transactionsCopy.value.allTypes
    : (localizedTypeOptions.value.find(item => item.value === selectedType.value)?.label ?? transactionsCopy.value.type)

  const walletLabel = selectedWallet.value === 'all'
    ? transactionsCopy.value.allWallets
    : (wallets.value.find(wallet => wallet.id === selectedWallet.value)?.name ?? transactionsCopy.value.wallet)

  const currencyLabel = selectedCurrency.value === 'all'
    ? transactionsCopy.value.allCurrencies
    : selectedCurrency.value

  const dateLabel = fromDate.value && toDate.value
    ? `${formatDateLabel(fromDate.value)} - ${formatDateLabel(toDate.value)}`
    : (fromDate.value || toDate.value ? transactionsCopy.value.customDate : transactionsCopy.value.allTime)

  return `${typeLabel} · ${walletLabel} · ${currencyLabel} · ${dateLabel}`
})

function formatDateLabel(value: string) {
  if (!value) return transactionsCopy.value.selectDate

  return new Intl.DateTimeFormat(selectedLanguage.value === 'lo' ? 'lo-LA' : 'en-US', {
    day: '2-digit',
    month: 'short'
  }).format(new Date(`${value}T00:00:00`))
}

function applySearch() {
  appliedSearch.value = searchDraft.value.trim()
}

function clearFilters() {
  searchDraft.value = ''
  appliedSearch.value = ''
  selectedType.value = 'all'
  selectedWallet.value = 'all'
  selectedCurrency.value = 'all'
  fromDate.value = ''
  toDate.value = ''
}

function formatDateKey(date: Date) {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')

  return `${year}-${month}-${day}`
}

function startOfWeek(date = new Date()) {
  const value = new Date(date)
  value.setHours(0, 0, 0, 0)
  const day = (value.getDay() + 6) % 7
  value.setDate(value.getDate() - day)
  return value
}

function startOfMonth(date = new Date()) {
  const value = new Date(date)
  value.setHours(0, 0, 0, 0)
  value.setDate(1)
  return value
}

function endOfMonth(date = new Date()) {
  const value = new Date(date)
  value.setHours(0, 0, 0, 0)
  value.setMonth(value.getMonth() + 1, 0)
  return value
}

function getDatePresetRange(preset: typeof datePresets[number]['value']) {
  const today = new Date()
  const todayKey = formatDateKey(today)
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  switch (preset) {
    case 'today':
      return { from: todayKey, to: todayKey }
    case 'yesterday':
      return { from: formatDateKey(yesterday), to: formatDateKey(yesterday) }
    case 'this-week': {
      const weekStart = startOfWeek(today)
      return { from: formatDateKey(weekStart), to: todayKey }
    }
    case 'last-week': {
      const weekStart = startOfWeek(today)
      const lastWeekStart = new Date(weekStart)
      lastWeekStart.setDate(weekStart.getDate() - 7)
      const lastWeekEnd = new Date(lastWeekStart)
      lastWeekEnd.setDate(lastWeekStart.getDate() + 6)
      return { from: formatDateKey(lastWeekStart), to: formatDateKey(lastWeekEnd) }
    }
    case 'this-month':
      return { from: formatDateKey(startOfMonth(today)), to: todayKey }
    case 'last-month': {
      const lastMonthBase = new Date(today)
      lastMonthBase.setMonth(lastMonthBase.getMonth() - 1)
      return {
        from: formatDateKey(startOfMonth(lastMonthBase)),
        to: formatDateKey(endOfMonth(lastMonthBase))
      }
    }
  }
}

function applyDatePreset(preset: typeof datePresets[number]['value']) {
  const range = getDatePresetRange(preset)
  fromDate.value = range?.from ?? ''
  toDate.value = range?.to ?? ''
}

function isDatePresetActive(preset: typeof datePresets[number]['value']) {
  const range = getDatePresetRange(preset)
  return fromDate.value === range?.from && toDate.value === range?.to
}

function openDeleteConfirm(transaction: Transaction) {
  deleteTarget.value = transaction
  deleteConfirmOpen.value = true
}

function confirmDelete() {
  if (!deleteTarget.value) return

  removeTransaction(deleteTarget.value.id)
  deleteTarget.value = null
  deleteConfirmOpen.value = false
}

function closeDeleteConfirm() {
  deleteConfirmOpen.value = false
  deleteTarget.value = null
}
</script>

<template>
  <div class="space-y-4 pb-4">
    <section class="flex items-start justify-between gap-3">
      <div>
        <h1 class="mt-1 text-3xl font-black tracking-tight text-default">{{ transactionsCopy.title }}</h1>
      </div>
    </section>

    <UCard class="overflow-hidden rounded-[1.4rem] border border-white/60 bg-white/90 shadow-[0_18px_50px_-24px_rgba(15,23,42,0.22)] dark:border-white/10 dark:bg-slate-950/80">
      <template #header>
        <button
          type="button"
          class="flex w-full items-center justify-between gap-3 text-left"
          @click="filtersOpen = !filtersOpen"
        >
          <div class="min-w-0">
            <p class="text-sm font-medium text-muted">{{ transactionsCopy.searchFilters }}</p>
            <h2 class="mt-1 truncate font-black tracking-tight text-default" :class="filtersOpen ? 'text-lg sm:text-xl' : 'text-base sm:text-lg'">
              {{ transactionsCopy.quickDatesAndFilters }}
            </h2>
            <div v-if="!filtersOpen" class="mt-2">
              <span
                class="inline-flex max-w-full items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-[10px] font-bold text-sky-700 shadow-sm dark:border-sky-900/60 dark:bg-sky-950/40 dark:text-sky-200"
              >
                <UIcon name="i-lucide-calendar-range" class="size-3.5 shrink-0" />
                <span class="truncate">{{ filterSummary }}</span>
              </span>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span
              class="hidden rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-bold text-muted dark:border-slate-800 dark:bg-slate-900 sm:inline-flex"
            >
              {{ filtersOpen ? transactionsCopy.hide : transactionsCopy.show }}
            </span>
            <div :class="['flex size-9 items-center justify-center rounded-full bg-gradient-to-br text-white shadow-lg', activeTheme.accent]">
              <UIcon name="i-lucide-filter" class="size-4.5 transition-transform duration-200" :class="filtersOpen ? 'rotate-180' : ''" />
            </div>
          </div>
        </button>
      </template>

      <div v-show="filtersOpen" class="space-y-4 pt-1">
        <label class="block">
          <div class="mb-2 flex items-center gap-2">
            <div :class="['flex size-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm', activeTheme.accent]">
              <UIcon name="i-lucide-search" class="size-3.5" />
            </div>
            <span class="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">{{ transactionsCopy.search }}</span>
          </div>
          <UInput
            v-model="searchDraft"
            size="lg"
            :placeholder="transactionsCopy.searchPlaceholder"
            class="w-full rounded-2xl [&>input]:h-12 [&>input]:w-full [&>input]:rounded-2xl [&>input]:border-0 [&>input]:bg-slate-50 [&>input]:px-4 [&>input]:text-[16px] [&>input]:font-semibold [&>input]:shadow-none dark:[&>input]:bg-slate-950"
            @keyup.enter="applySearch"
          />
        </label>

        <div class="grid gap-3">
          <label class="block">
            <div class="mb-2 flex items-center gap-2">
              <div :class="['flex size-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm', activeTheme.accent]">
                <UIcon name="i-lucide-sliders-horizontal" class="size-3.5" />
              </div>
              <span class="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">{{ transactionsCopy.type }}</span>
            </div>
            <select
              v-model="selectedType"
              class="h-12 w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-4 text-[16px] font-semibold text-default shadow-none outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-800 dark:bg-slate-950"
            >
              <option value="all">{{ transactionsCopy.allTypes }}</option>
              <option v-for="item in localizedTypeOptions" :key="item.value" :value="item.value">{{ item.label }}</option>
            </select>
          </label>

          <label class="block">
            <div class="mb-2 flex items-center gap-2">
              <div :class="['flex size-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm', activeTheme.accent]">
                <UIcon name="i-lucide-wallet" class="size-3.5" />
              </div>
              <span class="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">{{ transactionsCopy.wallet }}</span>
            </div>
            <select
              v-model="selectedWallet"
              class="h-12 w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-4 text-[16px] font-semibold text-default shadow-none outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-800 dark:bg-slate-950"
            >
              <option v-for="item in walletItems" :key="item.value" :value="item.value">{{ item.label }}</option>
            </select>
          </label>

          <label class="block">
            <div class="mb-2 flex items-center gap-2">
              <div :class="['flex size-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm', activeTheme.accent]">
                <UIcon name="i-lucide-coins" class="size-3.5" />
              </div>
              <span class="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">{{ transactionsCopy.currency }}</span>
            </div>
            <select
              v-model="selectedCurrency"
              class="h-12 w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-4 text-[16px] font-semibold text-default shadow-none outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-800 dark:bg-slate-950"
            >
              <option value="all">{{ transactionsCopy.allCurrencies }}</option>
              <option v-for="item in enabledCurrencyOptions" :key="item.value" :value="item.value">{{ item.label }}</option>
            </select>
          </label>

          <div class="grid grid-cols-2 gap-2">
            <label class="block">
              <div class="mb-1.5 flex items-center gap-1.5">
                <div :class="['flex size-7 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm', activeTheme.accent]">
                  <UIcon name="i-lucide-calendar-range" class="size-3" />
                </div>
                <span class="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">{{ transactionsCopy.from }}</span>
              </div>
              <div class="relative h-11 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 px-3 shadow-none transition focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 dark:border-slate-800 dark:bg-slate-950">
                <div class="pointer-events-none flex h-full items-center justify-between gap-2">
                  <span :class="['truncate text-[15px] font-semibold', fromDate ? 'text-default' : 'text-muted']">
                    {{ fromDate ? formatDateLabel(fromDate) : transactionsCopy.selectDate }}
                  </span>
                  <UIcon name="i-lucide-calendar-range" class="size-4 shrink-0 text-muted" />
                </div>
                <input
                  v-model="fromDate"
                  type="date"
                  class="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                >
              </div>
            </label>

            <label class="block">
              <div class="mb-1.5 flex items-center gap-1.5">
                <div :class="['flex size-7 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm', activeTheme.accent]">
                  <UIcon name="i-lucide-calendar-range" class="size-3" />
                </div>
                <span class="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">{{ transactionsCopy.to }}</span>
              </div>
              <div class="relative h-11 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 px-3 shadow-none transition focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 dark:border-slate-800 dark:bg-slate-950">
                <div class="pointer-events-none flex h-full items-center justify-between gap-2">
                  <span :class="['truncate text-[15px] font-semibold', toDate ? 'text-default' : 'text-muted']">
                    {{ toDate ? formatDateLabel(toDate) : transactionsCopy.selectDate }}
                  </span>
                  <UIcon name="i-lucide-calendar-range" class="size-4 shrink-0 text-muted" />
                </div>
                <input
                  v-model="toDate"
                  type="date"
                  class="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                >
              </div>
            </label>
          </div>

          <div class="space-y-2">
            <p class="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted">{{ transactionsCopy.quickDates }}</p>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="preset in datePresets"
                :key="preset.value"
                type="button"
                class="rounded-full border px-3 py-2 text-[11px] font-bold transition active:scale-95"
                :class="isDatePresetActive(preset.value) ? 'border-primary bg-primary text-white shadow-sm' : 'border-slate-200 bg-white text-default shadow-none dark:border-slate-800 dark:bg-slate-950'"
                @click="applyDatePreset(preset.value)"
              >
                {{ preset.label }}
              </button>
            </div>
          </div>
        </div>
        <div class="pt-1">
          <UButton
            size="sm"
            color="neutral"
            variant="soft"
            icon="i-lucide-eraser"
            class="w-full justify-center rounded-full px-4 font-bold sm:w-auto sm:justify-start"
            :disabled="!hasActiveFilters"
            @click="clearFilters"
          >
            {{ transactionsCopy.clearFilter }}
          </UButton>
        </div>
      </div>
    </UCard>

    <div v-if="filterCards.length" class="space-y-4.5">
      <section v-for="group in filterCards" :key="group.date" class="space-y-2.5">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-black tracking-tight text-default">{{ group.label }}</h2>
          <span class="text-sm text-muted">{{ group.items.length }} {{ transactionsCopy.items }}</span>
        </div>

        <div class="space-y-2.5">
          <TransactionCard v-for="transaction in group.items" :key="transaction.id" :transaction="transaction" show-wallet>
            <template #actions>
              <UButton
                size="sm"
                color="neutral"
                variant="soft"
                icon="i-lucide-pencil"
                :to="`/transactions/${transaction.id}`"
              >
                {{ transactionsCopy.edit }}
              </UButton>
              <UButton
                size="sm"
                color="rose"
                variant="soft"
                icon="i-lucide-trash-2"
                @click="openDeleteConfirm(transaction)"
              >
                {{ transactionsCopy.delete }}
              </UButton>
            </template>
          </TransactionCard>
        </div>
      </section>
    </div>

    <UCard v-else class="overflow-hidden rounded-[1.4rem] border border-white/50 bg-white/85 p-8 text-center shadow-[0_18px_50px_-24px_rgba(15,23,42,0.25)] dark:border-white/10 dark:bg-slate-950/80">
      <UIcon name="i-lucide-search-x" class="mx-auto size-10 text-muted" />
      <h2 class="mt-4 text-lg font-black text-default">{{ transactionsCopy.noTransactions }}</h2>
      <p class="mt-2 text-sm text-muted">{{ transactionsCopy.emptyStateDesc }}</p>
      <UButton
        to="/add"
        icon="i-lucide-plus"
        :class="['mt-5 rounded-[1.4rem] px-5 py-3 font-bold text-white shadow-[0_18px_35px_-22px_rgba(14,165,233,0.65)] transition active:scale-95', activeTheme.accent]"
      >
        {{ transactionsCopy.addTransaction }}
      </UButton>
    </UCard>

    <UModal
      v-model:open="deleteConfirmOpen"
      :title="transactionsCopy.deleteTitle"
      :description="selectedLanguage === 'lo' ? 'ການກະທຳນີ້ບໍ່ສາມາດຍົກເລີກໄດ້.' : 'This action cannot be undone.'"
    >
      <template #body>
        <div v-if="deleteTarget" class="space-y-4">
          <div class="flex items-start gap-3 rounded-[1.2rem] bg-slate-100/80 p-4 dark:bg-slate-900">
            <div class="flex size-11 shrink-0 items-center justify-center rounded-[1rem] bg-rose-500 text-white shadow-sm">
              <UIcon name="i-lucide-trash-2" class="size-5" />
            </div>

            <div class="min-w-0">
              <p class="text-sm font-black text-default">{{ deleteTarget.category }}</p>
              <p class="mt-0.5 text-sm text-muted">{{ deleteTarget.note || transactionsCopy.transactionEntry }}</p>
              <p class="mt-2 text-[0.95rem] font-extrabold tracking-[-0.03em] text-default">
                {{ formatCurrency(deleteTarget.amount, deleteTarget.currency, true) }}
              </p>
            </div>
          </div>

          <div class="rounded-[1.2rem] border border-rose-200 bg-rose-50/80 p-4 text-sm leading-6 text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-200">
                {{ transactionsCopy.deleteImpact }}
          </div>
        </div>
      </template>

      <template #footer>
        <div class="grid w-full grid-cols-2 gap-3">
          <UButton
            type="button"
            variant="soft"
            color="neutral"
            size="xl"
            class="h-12 rounded-2xl text-base font-bold justify-center text-center"
            @click="closeDeleteConfirm"
          >
            {{ selectedLanguage === 'lo' ? 'ຍົກເລີກ' : 'Cancel' }}
          </UButton>
          <UButton
            type="button"
            color="rose"
            size="xl"
            icon="i-lucide-trash-2"
            class="h-12 rounded-2xl bg-rose-500 text-base font-extrabold text-white shadow-[0_16px_30px_-18px_rgba(244,63,94,0.65)] hover:bg-rose-600 justify-center text-center"
            @click="confirmDelete"
          >
                {{ transactionsCopy.delete }}
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>
