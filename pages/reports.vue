<script setup lang="ts">
import { useMoneyNote } from '~/composables/useMoneyNote'
import type { CurrencyCode } from '~/composables/useMoneyNote'

const { selectedLanguage } = useAppLanguage()

const {
  selectedCurrency,
  walletSeries,
  currencySeries,
  filterTransactions,
  walletOptionsForCurrency,
  formatCurrency,
  enabledCurrencyOptions
} = useMoneyNote()

type ReportPreset = 'all' | 'today' | 'yesterday' | 'thisWeek' | 'lastWeek' | 'thisMonth' | 'lastMonth' | 'custom'

const reportPreset = ref<ReportPreset>('thisMonth')
const reportFrom = ref('')
const reportTo = ref('')
const selectedWalletId = ref<'all' | string>('all')
const filtersOpen = ref(false)

const reportCopy = computed(() => selectedLanguage.value === 'lo'
  ? {
      insights: 'ມຸມມອງ',
      currency: 'ສະກຸນເງິນ',
      filters: 'ຕົວກອງ',
      dateAndWallet: 'ວັນທີ ແລະ ກະເປົ໋າ',
      show: 'ສະແດງ',
      hide: 'ຊ່ອນ',
      from: 'ຈາກ',
      to: 'ຮອດ',
      wallet: 'ກະເປົ໋າ',
      quickDates: 'ວັນທີດ່ວນ',
      allTime: 'ທຸກເວລາ',
      today: 'ມື້ນີ້',
      yesterday: 'ມື້ວານ',
      thisWeek: 'ອາທິດນີ້',
      lastWeek: 'ອາທິດກ່ອນ',
      thisMonth: 'ເດືອນນີ້',
      lastMonth: 'ເດືອນກ່ອນ',
      income: 'ລາຍຮັບ',
      expense: 'ລາຍຈ່າຍ',
      net: 'ຍອດສຸດທິ',
      monthTrend: 'ລາຍຮັບ ແລະ ລາຍຈ່າຍລາຍເດືອນ',
      trendByMonth: 'ແນວໂນ້ມຕາມເດືອນ',
      expenseByCategory: 'ລາຍຈ່າຍຕາມປະເພດ',
      whereMoneyGoes: 'ເງິນໄປໃສ່',
      balanceByWallet: 'ຍອດແຕ່ລະກະເປົ໋າ',
      walletStandings: 'ຈັດອັນດັບກະເປົ໋າ',
      currencySummary: 'ສະຫຼຸບສະກຸນເງິນ',
      portfolioOverview: 'ພາບລວມການເງິນ',
      allWalletsCombined: 'ທຸກກະເປົ໋າລວມກັນ',
      noExpenseRecords: 'ບໍ່ພົບລາຍຈ່າຍສຳລັບສະກຸນເງິນນີ້',
      noWallets: 'ບໍ່ມີກະເປົ໋າໃນສະກຸນເງິນນີ້',
      allWallets: 'ກະເປົ໋າທັງໝົດ',
      customRange: 'ຊ່ວງເວລາກຳນົດເອງ'
    }
  : {
      insights: 'Insights',
      currency: 'Currency',
      filters: 'Filters',
      dateAndWallet: 'Date and wallet',
      show: 'Show',
      hide: 'Hide',
      from: 'From',
      to: 'To',
      wallet: 'Wallet',
      quickDates: 'Quick dates',
      allTime: 'All time',
      today: 'Today',
      yesterday: 'Yesterday',
      thisWeek: 'This week',
      lastWeek: 'Last week',
      thisMonth: 'This month',
      lastMonth: 'Last month',
      income: 'Income',
      expense: 'Expense',
      net: 'Net',
      monthTrend: 'Monthly income vs expense',
      trendByMonth: 'Trend by month',
      expenseByCategory: 'Expense by category',
      whereMoneyGoes: 'Where the money goes',
      balanceByWallet: 'Balance by wallet',
      walletStandings: 'Wallet standings',
      currencySummary: 'Currency summary',
      portfolioOverview: 'Portfolio overview',
      allWalletsCombined: 'All wallets combined',
      noExpenseRecords: 'No expense records for this currency yet.',
      noWallets: 'No wallets in this currency yet.',
      allWallets: 'All wallets',
      customRange: 'Custom range'
    })

const reportPresetOptions = computed<Array<{ label: string; value: ReportPreset }>>(() => [
  { label: reportCopy.value.allTime, value: 'all' },
  { label: reportCopy.value.today, value: 'today' },
  { label: reportCopy.value.yesterday, value: 'yesterday' },
  { label: reportCopy.value.thisWeek, value: 'thisWeek' },
  { label: reportCopy.value.lastWeek, value: 'lastWeek' },
  { label: reportCopy.value.thisMonth, value: 'thisMonth' },
  { label: reportCopy.value.lastMonth, value: 'lastMonth' }
])

const reportWalletOptions = computed(() => [
  { label: reportCopy.value.allWallets, value: 'all' as const },
  ...walletOptionsForCurrency(selectedCurrency.value)
])

function pad(num: number) {
  return String(num).padStart(2, '0')
}

function toDateKey(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function startOfDay(date: Date) {
  const value = new Date(date)
  value.setHours(0, 0, 0, 0)
  return value
}

function endOfDay(date: Date) {
  const value = new Date(date)
  value.setHours(23, 59, 59, 999)
  return value
}

function addDays(date: Date, days: number) {
  const value = new Date(date)
  value.setDate(value.getDate() + days)
  return value
}

function startOfWeek(date: Date) {
  const value = startOfDay(date)
  const day = value.getDay() === 0 ? 6 : value.getDay() - 1
  value.setDate(value.getDate() - day)
  return value
}

function endOfWeek(date: Date) {
  return endOfDay(addDays(startOfWeek(date), 6))
}

function startOfMonth(date: Date) {
  const value = startOfDay(date)
  value.setDate(1)
  return value
}

function endOfMonth(date: Date) {
  const value = new Date(date)
  value.setMonth(value.getMonth() + 1, 0)
  value.setHours(23, 59, 59, 999)
  return value
}

function monthLabel(key: string) {
  const [year, month] = key.split('-').map(Number)
  return new Date(year, month - 1, 1).toLocaleDateString(selectedLanguage.value === 'lo' ? 'lo-LA' : 'en-US', {
    month: 'short',
    year: 'numeric'
  })
}

function formatReadableDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString(selectedLanguage.value === 'lo' ? 'lo-LA' : 'en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

function transactionWindow(preset: ReportPreset) {
  const now = new Date()

  if (preset === 'today') {
    const from = startOfDay(now)
    const to = endOfDay(now)
    return { from: toDateKey(from), to: toDateKey(to), label: reportCopy.value.today }
  }

  if (preset === 'yesterday') {
    const day = addDays(now, -1)
    const from = startOfDay(day)
    const to = endOfDay(day)
    return { from: toDateKey(from), to: toDateKey(to), label: reportCopy.value.yesterday }
  }

  if (preset === 'thisWeek') {
    return { from: toDateKey(startOfWeek(now)), to: toDateKey(endOfDay(now)), label: reportCopy.value.thisWeek }
  }

  if (preset === 'lastWeek') {
    const thisWeekStart = startOfWeek(now)
    const from = startOfWeek(addDays(thisWeekStart, -1))
    const to = endOfWeek(addDays(thisWeekStart, -1))
    return { from: toDateKey(from), to: toDateKey(to), label: reportCopy.value.lastWeek }
  }

  if (preset === 'thisMonth') {
    return { from: toDateKey(startOfMonth(now)), to: toDateKey(endOfDay(now)), label: reportCopy.value.thisMonth }
  }

  if (preset === 'lastMonth') {
    const lastMonth = new Date(now)
    lastMonth.setMonth(lastMonth.getMonth() - 1)
    return {
      from: toDateKey(startOfMonth(lastMonth)),
      to: toDateKey(endOfMonth(lastMonth)),
      label: reportCopy.value.lastMonth
    }
  }

  return { from: undefined, to: undefined, label: reportCopy.value.allTime }
}

function applyPreset(preset: ReportPreset) {
  reportPreset.value = preset

  const window = transactionWindow(preset)
  reportFrom.value = window.from ?? ''
  reportTo.value = window.to ?? ''
}

applyPreset('thisMonth')

watch(selectedCurrency, () => {
  if (selectedWalletId.value !== 'all' && !reportWalletOptions.value.some(option => option.value === selectedWalletId.value)) {
    selectedWalletId.value = 'all'
  }
})

const reportTransactions = computed(() => filterTransactions({
  currency: selectedCurrency.value,
  walletId: selectedWalletId.value === 'all' ? undefined : selectedWalletId.value,
  from: reportFrom.value || undefined,
  to: reportTo.value || undefined
}))

const monthlyData = computed(() => {
  const grouped = new Map<string, { income: number; expense: number }>()

  reportTransactions.value.forEach((transaction) => {
    const key = transaction.date.slice(0, 7)
    if (!grouped.has(key)) {
      grouped.set(key, { income: 0, expense: 0 })
    }

    const bucket = grouped.get(key)!
    const isIncome = transaction.type === 'income' || (transaction.type === 'loan' && transaction.loanDirection === 'received')
    const isExpense = transaction.type === 'expense' || (transaction.type === 'loan' && transaction.loanDirection !== 'received')

    if (isIncome) bucket.income += transaction.amount
    if (isExpense) bucket.expense += transaction.amount
  })

  return [...grouped.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([key, totals]) => ({
      key,
      label: monthLabel(key),
      income: totals.income,
      expense: totals.expense,
      net: totals.income - totals.expense
    }))
})

const categoryData = computed(() => {
  const items = reportTransactions.value.filter(transaction => transaction.type === 'expense' || (transaction.type === 'loan' && transaction.loanDirection !== 'received'))
  const grouped = new Map<string, number>()

  items.forEach((transaction) => {
    grouped.set(transaction.category, (grouped.get(transaction.category) ?? 0) + transaction.amount)
  })

  return [...grouped.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
})
const walletData = computed(() => walletSeries(selectedCurrency.value))
const currencyData = computed(() => currencySeries())
const monthMax = computed(() => Math.max(...monthlyData.value.flatMap(item => [item.income, item.expense, 1]), 1))
const summaryIncome = computed(() => monthlyData.value.reduce((sum, item) => sum + item.income, 0))
const summaryExpense = computed(() => monthlyData.value.reduce((sum, item) => sum + item.expense, 0))
const summaryNet = computed(() => summaryIncome.value - summaryExpense.value)
const summaryRangeLabel = computed(() => {
  if (!reportFrom.value && !reportTo.value) return reportCopy.value.allTime
  if (reportFrom.value && reportTo.value) return `${formatReadableDate(reportFrom.value)} - ${formatReadableDate(reportTo.value)}`
  if (reportFrom.value) return `${reportCopy.value.from} ${formatReadableDate(reportFrom.value)}`
  if (reportTo.value) return `${reportCopy.value.to} ${formatReadableDate(reportTo.value)}`
  return reportCopy.value.customRange
})
const reportFiltersSummary = computed(() => {
  const walletLabel = selectedWalletId.value === 'all'
    ? reportCopy.value.allWallets
    : (reportWalletOptions.value.find(option => option.value === selectedWalletId.value)?.label ?? reportCopy.value.wallet)

  return `${reportPresetOptions.value.find(item => item.value === reportPreset.value)?.label ?? reportCopy.value.allTime} · ${walletLabel}`
})

const currencySymbols: Record<CurrencyCode, string> = {
  LAK: '₭',
  THB: '฿',
  USD: '$'
}

const currencyAccents: Record<CurrencyCode, string> = {
  LAK: 'from-sky-500 to-cyan-400',
  THB: 'from-emerald-500 to-teal-400',
  USD: 'from-amber-500 to-orange-400'
}
</script>

<template>
  <div class="space-y-5 pb-8">
    <section class="flex items-start justify-between gap-3">
      <h1 class="text-3xl font-black tracking-tight text-default">{{ reportCopy.insights }}</h1>

      <UButton icon="i-lucide-arrow-left" variant="ghost" color="neutral" size="lg" class="rounded-2xl" to="/" />
    </section>

    <section class="space-y-3">
      <div class="flex items-end justify-between gap-3">
        <div>
          <p class="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted">{{ reportCopy.currency }}</p>
          <p class="mt-0.5 text-sm font-bold text-default">{{ selectedCurrency }}</p>
        </div>

        <div class="grid grid-cols-3 gap-1.5 rounded-full bg-slate-100 p-1 dark:bg-slate-900">
          <button
            v-for="item in enabledCurrencyOptions"
            :key="item.value"
            type="button"
            class="rounded-full px-3 py-2.5 text-[12px] font-bold transition active:scale-95 sm:px-3 sm:py-2 sm:text-xs"
            :class="selectedCurrency === item.value ? 'bg-white text-primary shadow-sm dark:bg-slate-800' : 'text-muted'"
            @click="selectedCurrency = item.value"
          >
            {{ item.label }}
          </button>
        </div>
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
            <p class="text-sm font-medium text-muted">Filters</p>
            <h2 class="mt-1 truncate font-black tracking-tight text-default" :class="filtersOpen ? 'text-lg sm:text-xl' : 'text-base sm:text-lg'">
              Date and wallet
            </h2>
            <div v-if="!filtersOpen" class="mt-2">
              <span
                class="inline-flex max-w-full items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-[10px] font-bold text-sky-700 shadow-sm dark:border-sky-900/60 dark:bg-sky-950/40 dark:text-sky-200"
              >
                <UIcon name="i-lucide-calendar-range" class="size-3.5 shrink-0" />
                <span class="truncate">{{ reportFiltersSummary }}</span>
              </span>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span
              class="hidden rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-bold text-muted dark:border-slate-800 dark:bg-slate-900 sm:inline-flex"
            >
              {{ filtersOpen ? reportCopy.hide : reportCopy.show }}
            </span>
            <div class="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-cyan-400 text-white shadow-lg">
              <UIcon name="i-lucide-filter" class="size-4.5 transition-transform duration-200" :class="filtersOpen ? 'rotate-180' : ''" />
            </div>
          </div>
        </button>
      </template>

      <div v-show="filtersOpen" class="space-y-4 pt-1">
        <div class="grid grid-cols-2 gap-2">
          <label class="min-w-0 space-y-1">
            <span class="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted">{{ reportCopy.from }}</span>
            <input
              v-model="reportFrom"
              type="date"
              class="h-11 w-full min-w-0 rounded-[1rem] border border-slate-200 bg-white px-2.5 text-[12px] font-semibold text-default shadow-none outline-none transition placeholder:text-muted focus:border-primary dark:border-slate-800 dark:bg-slate-900"
            >
          </label>

          <label class="min-w-0 space-y-1">
            <span class="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted">{{ reportCopy.to }}</span>
            <input
              v-model="reportTo"
              type="date"
              class="h-11 w-full min-w-0 rounded-[1rem] border border-slate-200 bg-white px-2.5 text-[12px] font-semibold text-default shadow-none outline-none transition placeholder:text-muted focus:border-primary dark:border-slate-800 dark:bg-slate-900"
            >
          </label>
        </div>

        <label class="block space-y-1.5">
          <span class="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted">{{ reportCopy.wallet }}</span>
          <select
            v-model="selectedWalletId"
            class="h-12 w-full rounded-[1rem] border border-slate-200 bg-white px-3 text-sm font-semibold text-default shadow-none outline-none transition focus:border-primary dark:border-slate-800 dark:bg-slate-900"
          >
            <option v-for="option in reportWalletOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </label>

        <div class="space-y-2">
          <p class="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted">{{ reportCopy.quickDates }}</p>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="item in reportPresetOptions"
              :key="item.value"
              type="button"
              class="rounded-full border px-3 py-2 text-[11px] font-bold transition active:scale-95"
              :class="reportPreset === item.value ? 'border-primary bg-primary text-white shadow-sm' : 'border-slate-200 bg-white text-muted dark:border-slate-800 dark:bg-slate-900'"
              @click="applyPreset(item.value)"
            >
              {{ item.label }}
            </button>
          </div>
        </div>
      </div>
    </UCard>

    <section class="grid grid-cols-1 gap-3">
      <MetricCard
        :title="reportCopy.income"
        :value="formatCurrency(summaryIncome, selectedCurrency)"
        :detail="summaryRangeLabel"
        icon="i-lucide-trending-up"
        accent="from-emerald-500 to-teal-400"
        value-class="text-[clamp(1rem,4vw,1.38rem)]"
      />
      <MetricCard
        :title="reportCopy.expense"
        :value="formatCurrency(summaryExpense, selectedCurrency)"
        :detail="summaryRangeLabel"
        icon="i-lucide-trending-down"
        accent="from-rose-500 to-pink-400"
        value-class="text-[clamp(1rem,4vw,1.38rem)]"
      />
      <MetricCard
        :title="reportCopy.net"
        :value="formatCurrency(summaryNet, selectedCurrency, true)"
        :detail="summaryRangeLabel"
        icon="i-lucide-badge-dollar-sign"
        accent="from-sky-500 to-cyan-400"
        value-class="text-[clamp(1rem,4vw,1.38rem)]"
      />
    </section>

    <section class="space-y-4">
      <UCard class="overflow-hidden rounded-[1.4rem] border border-white/60 bg-white/90 shadow-[0_18px_50px_-24px_rgba(15,23,42,0.22)] dark:border-white/10 dark:bg-slate-950/80">
        <template #header>
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-sm font-medium text-muted">{{ reportCopy.monthTrend }}</p>
              <h2 class="mt-1 text-2xl font-black tracking-tight text-default">{{ reportCopy.trendByMonth }}</h2>
            </div>
            <div class="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-cyan-400 text-white shadow-lg">
              <UIcon name="i-lucide-chart-column" class="size-5" />
            </div>
          </div>
        </template>

        <div class="space-y-4">
          <div v-for="item in monthlyData" :key="item.key" class="space-y-3 rounded-[1.2rem] bg-slate-50/80 px-3 py-3 dark:bg-slate-900/70">
            <div class="flex items-center justify-between gap-3">
              <div class="min-w-0">
                <p class="text-sm font-bold text-default">{{ item.label }}</p>
                <p class="text-xs text-muted">{{ formatCurrency(item.net, selectedCurrency, true) }}</p>
              </div>
              <p class="shrink-0 text-xs font-semibold text-muted sm:text-sm">
                {{ formatCurrency(item.income, selectedCurrency) }} / {{ formatCurrency(item.expense, selectedCurrency) }}
              </p>
            </div>

            <div class="space-y-2">
              <div class="flex items-center gap-3">
                <span class="w-16 shrink-0 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-500">{{ reportCopy.income }}</span>
                <div class="h-3 flex-1 overflow-hidden rounded-full bg-slate-200/80 dark:bg-slate-800">
                  <div
                    class="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                    :style="{ width: `${Math.max((item.income / monthMax) * 100, item.income > 0 ? 8 : 0)}%` }"
                  />
                </div>
              </div>
              <div class="flex items-center gap-3">
                <span class="w-16 shrink-0 text-xs font-semibold uppercase tracking-[0.22em] text-rose-500">{{ reportCopy.expense }}</span>
                <div class="h-3 flex-1 overflow-hidden rounded-full bg-slate-200/80 dark:bg-slate-800">
                  <div
                    class="h-full rounded-full bg-gradient-to-r from-rose-500 to-pink-400 transition-all duration-500"
                    :style="{ width: `${Math.max((item.expense / monthMax) * 100, item.expense > 0 ? 8 : 0)}%` }"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </UCard>

      <UCard class="overflow-hidden rounded-[1.4rem] border border-white/60 bg-white/90 shadow-[0_18px_50px_-24px_rgba(15,23,42,0.22)] dark:border-white/10 dark:bg-slate-950/80">
        <template #header>
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-sm font-medium text-muted">{{ reportCopy.expenseByCategory }}</p>
              <h2 class="mt-1 text-2xl font-black tracking-tight text-default">{{ reportCopy.whereMoneyGoes }}</h2>
            </div>
            <div class="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-pink-400 text-white shadow-lg">
              <UIcon name="i-lucide-pie-chart" class="size-5" />
            </div>
          </div>
        </template>

        <SimpleBarChart
          v-if="categoryData.length"
          :items="categoryData"
          :total="Math.max(...categoryData.map(item => item.value), 1)"
        />
        <p v-else class="py-8 text-center text-sm text-muted">{{ reportCopy.noExpenseRecords }}</p>
      </UCard>
    </section>

    <section class="space-y-4">
      <UCard class="overflow-hidden rounded-[1.4rem] border border-white/60 bg-white/90 shadow-[0_18px_50px_-24px_rgba(15,23,42,0.22)] dark:border-white/10 dark:bg-slate-950/80">
        <template #header>
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-sm font-medium text-muted">{{ reportCopy.balanceByWallet }}</p>
              <h2 class="mt-1 text-2xl font-black tracking-tight text-default">{{ reportCopy.walletStandings }}</h2>
            </div>
            <div class="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-400 text-white shadow-lg">
              <UIcon name="i-lucide-wallet" class="size-5" />
            </div>
          </div>
        </template>

        <SimpleBarChart
          v-if="walletData.length"
          :items="walletData.map(item => ({ label: item.label, value: item.value, helper: item.wallet.note }))"
        />
        <p v-else class="py-8 text-center text-sm text-muted">{{ reportCopy.noWallets }}</p>
      </UCard>

      <UCard class="overflow-hidden rounded-[1.4rem] border border-white/60 bg-white/90 shadow-[0_18px_50px_-24px_rgba(15,23,42,0.22)] dark:border-white/10 dark:bg-slate-950/80">
        <template #header>
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-sm font-medium text-muted">{{ reportCopy.currencySummary }}</p>
              <h2 class="mt-1 text-2xl font-black tracking-tight text-default">{{ reportCopy.portfolioOverview }}</h2>
            </div>
            <div class="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-cyan-400 text-white shadow-lg">
              <UIcon name="i-lucide-coins" class="size-5" />
            </div>
          </div>
        </template>

        <div class="grid grid-cols-1 gap-3">
          <MetricCard
            v-for="item in currencyData"
            :key="item.currency"
            :title="item.currency"
            :value="formatCurrency(item.balance, item.currency)"
            :detail="reportCopy.allWalletsCombined"
            :icon-text="currencySymbols[item.currency]"
            :accent="currencyAccents[item.currency]"
            value-class="text-[clamp(1rem,4vw,1.38rem)]"
          />
        </div>
      </UCard>
    </section>
  </div>
</template>
