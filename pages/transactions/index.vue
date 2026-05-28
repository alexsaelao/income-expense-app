<script setup lang="ts">
import { typeOptions, useMoneyNote } from '~/composables/useMoneyNote'
import type { CurrencyCode, Transaction } from '~/composables/useMoneyNote'

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
const datePresets = [
  { label: 'Today', value: 'today' },
  { label: 'Yesterday', value: 'yesterday' },
  { label: 'This week', value: 'this-week' },
  { label: 'Last week', value: 'last-week' },
  { label: 'This month', value: 'this-month' },
  { label: 'Last month', value: 'last-month' }
] as const

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
  { label: 'All wallets', value: 'all' },
  ...wallets.value.map(wallet => ({ label: `${wallet.emoji} ${wallet.name}`, value: wallet.id }))
])

function formatDateLabel(value: string) {
  if (!value) return 'Select date'

  return new Intl.DateTimeFormat('en-US', {
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

function applyDatePreset(preset: typeof datePresets[number]['value']) {
  const today = new Date()
  const todayKey = formatDateKey(today)
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  switch (preset) {
    case 'today':
      fromDate.value = todayKey
      toDate.value = todayKey
      break
    case 'yesterday':
      fromDate.value = formatDateKey(yesterday)
      toDate.value = formatDateKey(yesterday)
      break
    case 'this-week': {
      const weekStart = startOfWeek(today)
      fromDate.value = formatDateKey(weekStart)
      toDate.value = todayKey
      break
    }
    case 'last-week': {
      const weekStart = startOfWeek(today)
      const lastWeekStart = new Date(weekStart)
      lastWeekStart.setDate(weekStart.getDate() - 7)
      const lastWeekEnd = new Date(lastWeekStart)
      lastWeekEnd.setDate(lastWeekStart.getDate() + 6)
      fromDate.value = formatDateKey(lastWeekStart)
      toDate.value = formatDateKey(lastWeekEnd)
      break
    }
    case 'this-month':
      fromDate.value = formatDateKey(startOfMonth(today))
      toDate.value = todayKey
      break
    case 'last-month': {
      const lastMonthBase = new Date(today)
      lastMonthBase.setMonth(lastMonthBase.getMonth() - 1)
      fromDate.value = formatDateKey(startOfMonth(lastMonthBase))
      toDate.value = formatDateKey(endOfMonth(lastMonthBase))
      break
    }
  }
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
        <h1 class="mt-1 text-3xl font-black tracking-tight text-default">Transactions</h1>
      </div>
    </section>

    <UCard class="overflow-hidden rounded-[1.4rem] border border-white/50 bg-white/85 shadow-[0_18px_50px_-24px_rgba(15,23,42,0.25)] dark:border-white/10 dark:bg-slate-950/80">
      <div class="space-y-4">
        <div>
          <h2 class="text-sm font-black tracking-tight text-default">Search & filters</h2>
          <p class="text-[11px] text-muted">Refine the transaction list</p>
        </div>

        <label class="block">
          <div class="mb-2 flex items-center gap-2">
            <div class="flex size-8 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600 shadow-sm dark:bg-sky-950/40 dark:text-sky-200">
              <UIcon name="i-lucide-search" class="size-3.5" />
            </div>
            <span class="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">Search</span>
          </div>
          <UInput
            v-model="searchDraft"
            size="lg"
            placeholder="Search note, category, or person"
            class="w-full rounded-2xl [&>input]:h-12 [&>input]:w-full [&>input]:rounded-2xl [&>input]:border-0 [&>input]:bg-slate-50 [&>input]:px-4 [&>input]:text-[16px] [&>input]:font-semibold [&>input]:shadow-none dark:[&>input]:bg-slate-950"
            @keyup.enter="applySearch"
          />
        </label>

        <div class="grid gap-3">
          <label class="block">
            <div class="mb-2 flex items-center gap-2">
              <div class="flex size-8 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600 shadow-sm dark:bg-sky-950/40 dark:text-sky-200">
                <UIcon name="i-lucide-sliders-horizontal" class="size-3.5" />
              </div>
              <span class="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">Type</span>
            </div>
            <select
              v-model="selectedType"
              class="h-12 w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-4 text-[16px] font-semibold text-default shadow-none outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-800 dark:bg-slate-950"
            >
              <option value="all">All types</option>
              <option v-for="item in typeOptions" :key="item.value" :value="item.value">{{ item.label }}</option>
            </select>
          </label>

          <label class="block">
            <div class="mb-2 flex items-center gap-2">
              <div class="flex size-8 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600 shadow-sm dark:bg-sky-950/40 dark:text-sky-200">
                <UIcon name="i-lucide-wallet" class="size-3.5" />
              </div>
              <span class="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">Wallet</span>
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
              <div class="flex size-8 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600 shadow-sm dark:bg-sky-950/40 dark:text-sky-200">
                <UIcon name="i-lucide-coins" class="size-3.5" />
              </div>
              <span class="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">Currency</span>
            </div>
            <select
              v-model="selectedCurrency"
              class="h-12 w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-4 text-[16px] font-semibold text-default shadow-none outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-800 dark:bg-slate-950"
            >
              <option value="all">All currencies</option>
              <option v-for="item in enabledCurrencyOptions" :key="item.value" :value="item.value">{{ item.label }}</option>
            </select>
          </label>

          <div class="grid grid-cols-2 gap-2">
            <label class="block">
              <div class="mb-1.5 flex items-center gap-1.5">
                <div class="flex size-7 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600 shadow-sm dark:bg-sky-950/40 dark:text-sky-200">
                  <UIcon name="i-lucide-calendar-range" class="size-3" />
                </div>
                <span class="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">From</span>
              </div>
              <div class="relative h-11 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 px-3 shadow-none transition focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 dark:border-slate-800 dark:bg-slate-950">
                <div class="pointer-events-none flex h-full items-center justify-between gap-2">
                  <span :class="['truncate text-[15px] font-semibold', fromDate ? 'text-default' : 'text-muted']">
                    {{ fromDate ? formatDateLabel(fromDate) : 'Select date' }}
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
                <div class="flex size-7 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600 shadow-sm dark:bg-sky-950/40 dark:text-sky-200">
                  <UIcon name="i-lucide-calendar-range" class="size-3" />
                </div>
                <span class="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">To</span>
              </div>
              <div class="relative h-11 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 px-3 shadow-none transition focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 dark:border-slate-800 dark:bg-slate-950">
                <div class="pointer-events-none flex h-full items-center justify-between gap-2">
                  <span :class="['truncate text-[15px] font-semibold', toDate ? 'text-default' : 'text-muted']">
                    {{ toDate ? formatDateLabel(toDate) : 'Select date' }}
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
            Clear filter
          </UButton>
        </div>
      </div>
    </UCard>

    <section class="space-y-2">
      <div class="flex items-center justify-between gap-3">
        <h2 class="text-sm font-black tracking-tight text-default">Quick dates</h2>
        <p class="text-[11px] text-muted">Tap to fill the date range</p>
      </div>

      <div class="w-full max-w-full min-w-0 overflow-x-auto overflow-y-hidden overscroll-x-contain pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" style="touch-action: pan-x; -webkit-overflow-scrolling: touch;">
        <div class="flex min-w-max flex-nowrap gap-2 pr-1">
          <UButton
            v-for="preset in datePresets"
            :key="preset.value"
            size="sm"
            color="neutral"
            variant="soft"
            class="shrink-0 whitespace-nowrap rounded-full border border-slate-200 bg-white px-3 py-2 text-[11px] font-bold text-default shadow-none hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900"
            @click="applyDatePreset(preset.value)"
          >
            {{ preset.label }}
          </UButton>
        </div>
      </div>
    </section>

    <div v-if="filterCards.length" class="space-y-4.5">
      <section v-for="group in filterCards" :key="group.date" class="space-y-2.5">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-black tracking-tight text-default">{{ group.label }}</h2>
          <span class="text-sm text-muted">{{ group.items.length }} items</span>
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
                Edit
              </UButton>
              <UButton
                size="sm"
                color="rose"
                variant="soft"
                icon="i-lucide-trash-2"
                @click="openDeleteConfirm(transaction)"
              >
                Delete
              </UButton>
            </template>
          </TransactionCard>
        </div>
      </section>
    </div>

    <UCard v-else class="overflow-hidden rounded-[1.4rem] border border-white/50 bg-white/85 p-8 text-center shadow-[0_18px_50px_-24px_rgba(15,23,42,0.25)] dark:border-white/10 dark:bg-slate-950/80">
      <UIcon name="i-lucide-search-x" class="mx-auto size-10 text-muted" />
      <h2 class="mt-4 text-lg font-black text-default">No transactions found</h2>
      <p class="mt-2 text-sm text-muted">Try changing the filters or create a new entry.</p>
      <UButton
        to="/add"
        icon="i-lucide-plus"
        class="mt-5 rounded-[1.4rem] bg-gradient-to-r from-sky-500 to-cyan-400 px-5 py-3 font-bold text-white shadow-[0_18px_35px_-22px_rgba(14,165,233,0.65)] transition hover:from-sky-600 hover:to-cyan-500 active:scale-95"
      >
        Add transaction
      </UButton>
    </UCard>

    <UModal
      v-model:open="deleteConfirmOpen"
      title="Delete transaction"
      description="This action cannot be undone."
    >
      <template #body>
        <div v-if="deleteTarget" class="space-y-4">
          <div class="flex items-start gap-3 rounded-[1.2rem] bg-slate-100/80 p-4 dark:bg-slate-900">
            <div class="flex size-11 shrink-0 items-center justify-center rounded-[1rem] bg-rose-500 text-white shadow-sm">
              <UIcon name="i-lucide-trash-2" class="size-5" />
            </div>

            <div class="min-w-0">
              <p class="text-sm font-black text-default">{{ deleteTarget.category }}</p>
              <p class="mt-0.5 text-sm text-muted">{{ deleteTarget.note || 'Transaction entry' }}</p>
              <p class="mt-2 text-[0.95rem] font-extrabold tracking-[-0.03em] text-default">
                {{ formatCurrency(deleteTarget.amount, deleteTarget.currency, true) }}
              </p>
            </div>
          </div>

          <div class="rounded-[1.2rem] border border-rose-200 bg-rose-50/80 p-4 text-sm leading-6 text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-200">
            Deleting this transaction will update the linked wallet balances immediately.
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
            Cancel
          </UButton>
          <UButton
            type="button"
            color="rose"
            size="xl"
            icon="i-lucide-trash-2"
            class="h-12 rounded-2xl bg-rose-500 text-base font-extrabold text-white shadow-[0_16px_30px_-18px_rgba(244,63,94,0.65)] hover:bg-rose-600 justify-center text-center"
            @click="confirmDelete"
          >
            Delete
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>
