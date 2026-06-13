<script setup lang="ts">
import { useMoneyNote } from '~/composables/useMoneyNote'
import type { CurrencyCode, Transaction } from '~/composables/useMoneyNote'

type ReportViewMode = 'year' | 'month' | 'range'

const { selectedLanguage } = useAppLanguage()
const { activeTheme } = useAppThemeColor()

const {
  selectedCurrency,
  filterTransactions,
  walletOptionsForCurrency,
  formatCurrency,
  enabledCurrencyOptions,
  walletSeries,
  currencySeries
} = useMoneyNote()

const now = new Date()
const selectedWalletId = ref<'all' | string>('all')
const selectedViewMode = ref<ReportViewMode>('year')
const selectedYear = ref(now.getFullYear())
const selectedMonth = ref(formatMonthKey(now))
const rangeFrom = ref(formatDateInput(new Date(now.getFullYear(), now.getMonth(), 1)))
const rangeTo = ref(formatDateInput(now))

function pad2(value: number) {
  return String(value).padStart(2, '0')
}

function formatDateInput(date: Date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`
}

function formatMonthKey(date: Date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}`
}

function parseDateInput(value: string) {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day, 12)
}

function parseMonthKey(value: string) {
  const [year, month] = value.split('-').map(Number)
  return {
    year,
    monthIndex: month - 1
  }
}

const locale = computed(() => (selectedLanguage.value === 'lo' ? 'lo-LA' : 'en-US'))

const reportCopy = computed(() => selectedLanguage.value === 'lo'
  ? {
      title: 'ລາຍງານ',
      subtitle: 'ສະຫຼຸບລາຍຮັບ ລາຍຈ່າຍ ແລະ ກຳໄລຕາມປີ ເດືອນ ແລະ ຊ່ວງວັນທີ.',
      currency: 'ສະກຸນເງິນ',
      year: 'ປີ',
      month: 'ເດືອນ',
      day: 'ວັນ',
      date: 'ວັນທີ',
      wallet: 'ກະເປົ໋າ',
      allWallets: 'ກະເປົ໋າທັງໝົດ',
      income: 'ລາຍຮັບ',
      expense: 'ລາຍຈ່າຍ',
      net: 'ກຳໄລສຸດທິ',
      profit: 'ກຳໄລ',
      monthlyTrend: 'ແນວໂນ້ມລາຍເດືອນ',
      dailyTrend: 'ແນວໂນ້ມລາຍວັນ',
      monthlyTable: 'ຕາຕະລາງລາຍເດືອນ',
      dailyTable: 'ຕາຕະລາງລາຍວັນ',
      topCategories: 'ປະເພດຫຼັກ',
      expenseByCategory: 'ລາຍຈ່າຍຕາມປະເພດ',
      incomeByCategory: 'ລາຍຮັບຕາມປະເພດ',
      loanSummary: 'ສະຫຼຸບກູ້ຢືມ',
      given: 'ໃຫ້ກູ້',
      received: 'ໄດ້ຮັບຄືນ',
      loanNet: 'ຍອດສຸດທິກູ້ຢືມ',
      topWallets: 'ກະເປົ໋າຍອດສູງສຸດ',
      portfolioOverview: 'ພາບລວມສະກຸນເງິນ',
      noData: 'ບໍ່ມີຂໍ້ມູນສຳລັບຊ່ວງນີ້',
      noExpenseRecords: 'ບໍ່ພົບລາຍຈ່າຍສຳລັບປະເພດນີ້',
      noIncomeRecords: 'ບໍ່ພົບລາຍຮັບສຳລັບປະເພດນີ້',
      noWallets: 'ບໍ່ມີກະເປົ໋າໃນສະກຸນເງິນນີ້',
      allWalletsCombined: 'ລວມທຸກກະເປົ໋າ',
      yearView: 'ປີ',
      monthView: 'ເດືອນ',
      rangeView: 'ຊ່ວງວັນທີ',
      period: 'ຊ່ວງ',
      from: 'ຈາກ',
      to: 'ເຖິງ',
      selectedPeriod: 'ຊ່ວງທີ່ເລືອກ',
      filter: 'ຕົວກອງ',
      close: 'ປິດ'
    }
  : {
      title: 'Reports',
      subtitle: 'Compare income, expense, and profit by year, month, or custom date range.',
      currency: 'Currency',
      year: 'Year',
      month: 'Month',
      day: 'Day',
      date: 'Date',
      wallet: 'Wallet',
      allWallets: 'All wallets',
      income: 'Income',
      expense: 'Expense',
      net: 'Net profit',
      profit: 'Profit',
      monthlyTrend: 'Monthly trend',
      dailyTrend: 'Daily trend',
      monthlyTable: 'Monthly table',
      dailyTable: 'Daily table',
      topCategories: 'Top categories',
      expenseByCategory: 'Expense by category',
      incomeByCategory: 'Income by category',
      loanSummary: 'Loan summary',
      given: 'Given',
      received: 'Received',
      loanNet: 'Loan net',
      topWallets: 'Top wallets',
      portfolioOverview: 'Currency overview',
      noData: 'No data found for this period',
      noExpenseRecords: 'No expense records for this category set',
      noIncomeRecords: 'No income records for this category set',
      noWallets: 'No wallets in this currency yet',
      allWalletsCombined: 'All wallets combined',
      yearView: 'Year',
      monthView: 'Month',
      rangeView: 'Range',
      period: 'Period',
      from: 'From',
      to: 'To',
      selectedPeriod: 'Selected period',
      filter: 'Filter',
      close: 'Close'
    })

const viewModeOptions = computed(() => [
  {
    value: 'year' as const,
    label: reportCopy.value.yearView,
    icon: 'i-lucide-calendar-range'
  },
  {
    value: 'month' as const,
    label: reportCopy.value.monthView,
    icon: 'i-lucide-calendar-days'
  },
  {
    value: 'range' as const,
    label: reportCopy.value.rangeView,
    icon: 'i-lucide-calendar-search'
  }
])

const walletOptions = computed(() => [
  { label: reportCopy.value.allWallets, value: 'all' as const },
  ...walletOptionsForCurrency(selectedCurrency.value)
])

const baseTransactions = computed(() => filterTransactions({
  currency: selectedCurrency.value,
  walletId: selectedWalletId.value === 'all' ? undefined : selectedWalletId.value
}))

const availableYears = computed(() => {
  const years = new Set<number>()

  baseTransactions.value.forEach((transaction) => {
    years.add(parseDateInput(transaction.date).getFullYear())
  })

  years.add(now.getFullYear())

  return [...years].sort((a, b) => b - a)
})

watch(
  availableYears,
  (years) => {
    if (!years.includes(selectedYear.value)) {
      selectedYear.value = years[0] ?? now.getFullYear()
    }
  },
  { immediate: true }
)

watch(selectedCurrency, () => {
  if (selectedWalletId.value !== 'all' && !walletOptions.value.some(option => option.value === selectedWalletId.value)) {
    selectedWalletId.value = 'all'
  }
})

watch(selectedYear, () => {
  if (selectedViewMode.value === 'month') {
    const { monthIndex } = parseMonthKey(selectedMonth.value)
    selectedMonth.value = `${selectedYear.value}-${pad2(monthIndex + 1)}`
  }
})

watch(selectedViewMode, (mode) => {
  if (mode === 'month') {
    const { year, monthIndex } = parseMonthKey(selectedMonth.value)
    if (year !== selectedYear.value) {
      selectedMonth.value = `${selectedYear.value}-${pad2(monthIndex + 1)}`
    }
  }

  if (mode === 'range' && parseDateInput(rangeFrom.value) > parseDateInput(rangeTo.value)) {
    const temp = rangeFrom.value
    rangeFrom.value = rangeTo.value
    rangeTo.value = temp
  }
})

const selectedPeriodLabel = computed(() => {
  if (selectedViewMode.value === 'year') {
    return `${reportCopy.value.year} ${selectedYear.value}`
  }

  if (selectedViewMode.value === 'month') {
    const { year, monthIndex } = parseMonthKey(selectedMonth.value)
    return new Date(year, monthIndex, 1).toLocaleDateString(locale.value, {
      month: 'long',
      year: 'numeric'
    })
  }

  const start = parseDateInput(rangeFrom.value)
  const end = parseDateInput(rangeTo.value)

  return `${start.toLocaleDateString(locale.value, { day: 'numeric', month: 'short', year: 'numeric' })} - ${end.toLocaleDateString(locale.value, { day: 'numeric', month: 'short', year: 'numeric' })}`
})

const filteredTransactionsByPeriod = computed(() => {
  if (selectedViewMode.value === 'year') {
    return baseTransactions.value.filter(transaction => parseDateInput(transaction.date).getFullYear() === selectedYear.value)
  }

  if (selectedViewMode.value === 'month') {
    const { year, monthIndex } = parseMonthKey(selectedMonth.value)
    return baseTransactions.value.filter((transaction) => {
      const date = parseDateInput(transaction.date)
      return date.getFullYear() === year && date.getMonth() === monthIndex
    })
  }

  const start = parseDateInput(rangeFrom.value)
  const end = parseDateInput(rangeTo.value)
  const min = start <= end ? start : end
  const max = start <= end ? end : start

  return baseTransactions.value.filter((transaction) => {
    const time = parseDateInput(transaction.date).getTime()
    return time >= min.getTime() && time <= max.getTime()
  })
})

function isIncome(transaction: Transaction) {
  return transaction.type === 'income'
}

function isExpense(transaction: Transaction) {
  return transaction.type === 'expense'
}

function groupByCategory(items: Transaction[]) {
  const grouped = new Map<string, number>()

  items.forEach((transaction) => {
    const key = transaction.category?.trim() || (selectedLanguage.value === 'lo' ? 'ອື່ນໆ' : 'Other')
    grouped.set(key, (grouped.get(key) ?? 0) + transaction.amount)
  })

  return [...grouped.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
}

function monthLabel(monthIndex: number) {
  return new Date(selectedYear.value, monthIndex, 1).toLocaleDateString(locale.value, {
    month: 'short'
  })
}

function buildTimelineRows() {
  if (selectedViewMode.value === 'month') {
    const { year, monthIndex } = parseMonthKey(selectedMonth.value)
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()

    return Array.from({ length: daysInMonth }, (_, index) => {
      const date = new Date(year, monthIndex, index + 1, 12)
      const items = filteredTransactionsByPeriod.value.filter((transaction) => {
        const transactionDate = parseDateInput(transaction.date)
        return transactionDate.getFullYear() === year
          && transactionDate.getMonth() === monthIndex
          && transactionDate.getDate() === date.getDate()
      })

      const income = items.filter(isIncome).reduce((sum, transaction) => sum + transaction.amount, 0)
      const expense = items.filter(isExpense).reduce((sum, transaction) => sum + transaction.amount, 0)

      return {
        key: formatDateInput(date),
        label: String(date.getDate()),
        secondaryLabel: date.toLocaleDateString(locale.value, { month: 'short' }),
        income,
        expense,
        net: income - expense,
        count: items.length
      }
    })
  }

  if (selectedViewMode.value === 'range') {
    const start = parseDateInput(rangeFrom.value)
    const end = parseDateInput(rangeTo.value)
    const min = start <= end ? start : end
    const max = start <= end ? end : start
    const dayCount = Math.max(Math.round((max.getTime() - min.getTime()) / 86400000) + 1, 0)

    return Array.from({ length: dayCount }, (_, index) => {
      const date = new Date(min.getFullYear(), min.getMonth(), min.getDate() + index, 12)
      const items = filteredTransactionsByPeriod.value.filter((transaction) => {
        const transactionDate = parseDateInput(transaction.date)
        return transactionDate.getFullYear() === date.getFullYear()
          && transactionDate.getMonth() === date.getMonth()
          && transactionDate.getDate() === date.getDate()
      })

      const income = items.filter(isIncome).reduce((sum, transaction) => sum + transaction.amount, 0)
      const expense = items.filter(isExpense).reduce((sum, transaction) => sum + transaction.amount, 0)

      return {
        key: formatDateInput(date),
        label: date.toLocaleDateString(locale.value, { day: 'numeric', month: 'short' }),
        secondaryLabel: date.toLocaleDateString(locale.value, { weekday: 'short' }),
        income,
        expense,
        net: income - expense,
        count: items.length
      }
    })
  }

  return Array.from({ length: 12 }, (_, monthIndex) => {
    const items = filteredTransactionsByPeriod.value.filter((transaction) => {
      const transactionDate = parseDateInput(transaction.date)
      return transactionDate.getMonth() === monthIndex
    })

    const income = items.filter(isIncome).reduce((sum, transaction) => sum + transaction.amount, 0)
    const expense = items.filter(isExpense).reduce((sum, transaction) => sum + transaction.amount, 0)

    return {
      key: `${selectedYear.value}-${pad2(monthIndex + 1)}`,
      label: monthLabel(monthIndex),
      secondaryLabel: String(selectedYear.value),
      income,
      expense,
      net: income - expense,
      count: items.length
    }
  })
}

const timelineRows = computed(() => buildTimelineRows())
const chartLabels = computed(() => timelineRows.value.map(row => row.label))
const chartSeries = computed(() => [
  {
    label: reportCopy.value.income,
    color: '#10b981',
    values: timelineRows.value.map(row => row.income)
  },
  {
    label: reportCopy.value.expense,
    color: '#ff4d93',
    values: timelineRows.value.map(row => row.expense)
  },
  {
    label: reportCopy.value.net,
    color: '#f59e0b',
    values: timelineRows.value.map(row => row.net)
  }
])

const expenseCategoryData = computed(() => groupByCategory(filteredTransactionsByPeriod.value.filter(isExpense)).slice(0, 6))
const incomeCategoryData = computed(() => groupByCategory(filteredTransactionsByPeriod.value.filter(isIncome)).slice(0, 6))

const expenseCategoryTotal = computed(() => expenseCategoryData.value.reduce((sum, item) => sum + item.value, 0))
const incomeCategoryTotal = computed(() => incomeCategoryData.value.reduce((sum, item) => sum + item.value, 0))

const loanSummary = computed(() => {
  const loanTransactions = filteredTransactionsByPeriod.value.filter(transaction => transaction.type === 'loan')

  const given = loanTransactions
    .filter(transaction => transaction.loanDirection !== 'received')
    .reduce((sum, transaction) => sum + transaction.amount, 0)

  const received = loanTransactions
    .filter(transaction => transaction.loanDirection === 'received')
    .reduce((sum, transaction) => sum + transaction.amount, 0)

  return {
    given,
    received,
    net: received - given
  }
})

const summaryIncome = computed(() => timelineRows.value.reduce((sum, item) => sum + item.income, 0))
const summaryExpense = computed(() => timelineRows.value.reduce((sum, item) => sum + item.expense, 0))
const summaryNet = computed(() => summaryIncome.value - summaryExpense.value)

const topWallets = computed(() => walletSeries(selectedCurrency.value).slice(0, 5))
const currencyOverview = computed(() => currencySeries())

const topWalletMax = computed(() => Math.max(...topWallets.value.map(item => item.value), 1))

const selectedWalletLabel = computed(() => {
  if (selectedWalletId.value === 'all') return reportCopy.value.allWallets
  return walletOptions.value.find(option => option.value === selectedWalletId.value)?.label ?? reportCopy.value.allWallets
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

const chartTitle = computed(() => selectedViewMode.value === 'year' ? reportCopy.value.monthlyTrend : reportCopy.value.dailyTrend)
const tableTitle = computed(() => selectedViewMode.value === 'year' ? reportCopy.value.monthlyTable : reportCopy.value.dailyTable)
const tablePrimaryLabel = computed(() => selectedViewMode.value === 'year' ? reportCopy.value.month : reportCopy.value.date)
const tableProfitLabel = computed(() => reportCopy.value.profit)
const chartValueFormatter = (value: number) => formatCurrency(value, selectedCurrency.value, true)
const chartAxisFormatter = (value: number) => {
  const formatted = formatCurrency(Math.abs(value), selectedCurrency.value)
  return value < 0 ? `-${formatted}` : formatted
}
const chartCompactCurrencyFormatter = (value: number) => {
  const sign = value < 0 ? '-' : ''
  const absoluteValue = Math.abs(value)
  const compactNumber = new Intl.NumberFormat(locale.value, {
    notation: 'compact',
    maximumFractionDigits: absoluteValue >= 1_000_000 ? 0 : 1
  }).format(absoluteValue)

  return `${sign}${currencySymbols[selectedCurrency.value]} ${compactNumber}`
}

const hasPeriodData = computed(() => filteredTransactionsByPeriod.value.length > 0)
const hasCategoryExpenseData = computed(() => expenseCategoryData.value.length > 0)
const hasCategoryIncomeData = computed(() => incomeCategoryData.value.length > 0)
const reportFiltersOpen = ref(false)
</script>

<template>
  <div class="space-y-5 pb-10">
    <section class="flex items-start justify-between gap-3">
      <div class="min-w-0 space-y-1">
        <p class="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted">{{ reportCopy.selectedPeriod }}</p>
        <h1 class="text-3xl font-black tracking-tight text-default">{{ reportCopy.title }}</h1>
        <p class="max-w-2xl text-sm leading-6 text-muted">
          {{ reportCopy.subtitle }}
        </p>
      </div>

      <UButton icon="i-lucide-arrow-left" variant="ghost" color="neutral" size="lg" class="rounded-2xl" to="/" />
    </section>

    <div class="flex items-center justify-between gap-3 md:hidden">
      <div class="flex min-w-0 flex-wrap gap-2 text-[11px] font-semibold text-muted">
        <span class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 dark:border-slate-800 dark:bg-slate-900">
          <UIcon name="i-lucide-calendar-range" class="size-4" />
          {{ selectedPeriodLabel }}
        </span>
        <span class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 dark:border-slate-800 dark:bg-slate-900">
          <UIcon name="i-lucide-wallet" class="size-4" />
          {{ selectedWalletLabel }}
        </span>
      </div>

      <UButton
        size="sm"
        color="neutral"
        variant="soft"
        class="shrink-0 rounded-full"
        :icon="reportFiltersOpen ? 'i-lucide-x' : 'i-lucide-sliders-horizontal'"
        @click="reportFiltersOpen = !reportFiltersOpen"
      >
        {{ reportFiltersOpen ? reportCopy.close : reportCopy.filter }}
      </UButton>
    </div>

    <div v-if="reportFiltersOpen" class="space-y-3 rounded-[1.25rem] border border-slate-200/80 bg-white/90 px-4 py-4 shadow-[0_18px_50px_-24px_rgba(15,23,42,0.18)] dark:border-slate-800 dark:bg-slate-950/80 md:hidden">
      <div class="grid grid-cols-1 gap-3">
        <label class="space-y-1.5">
          <span class="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted">{{ reportCopy.period }}</span>
          <div class="grid grid-cols-3 gap-2 rounded-[1rem] bg-slate-100 p-1 dark:bg-slate-900">
            <button
              v-for="item in viewModeOptions"
              :key="item.value"
              type="button"
              class="inline-flex items-center justify-center gap-2 rounded-[0.9rem] px-3 py-2 text-[11px] font-bold transition active:scale-95"
              :class="selectedViewMode === item.value ? 'bg-white text-primary shadow-sm dark:bg-slate-800' : 'text-muted'"
              @click="selectedViewMode = item.value"
            >
              <UIcon :name="item.icon" class="size-4" />
              <span class="whitespace-nowrap">{{ item.label }}</span>
            </button>
          </div>
        </label>

        <label v-if="selectedViewMode === 'year'" class="space-y-1.5">
          <span class="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted">{{ reportCopy.year }}</span>
          <select
            v-model="selectedYear"
            class="h-12 w-full rounded-[1rem] border border-slate-200 bg-white px-3 text-sm font-semibold text-default outline-none transition focus:border-primary dark:border-slate-800 dark:bg-slate-900"
          >
            <option v-for="year in availableYears" :key="year" :value="year">
              {{ year }}
            </option>
          </select>
        </label>

        <label v-else-if="selectedViewMode === 'month'" class="space-y-1.5">
          <span class="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted">{{ reportCopy.month }}</span>
          <input
            v-model="selectedMonth"
            type="month"
            class="h-12 w-full rounded-[1rem] border border-slate-200 bg-white px-3 text-sm font-semibold text-default outline-none transition focus:border-primary dark:border-slate-800 dark:bg-slate-900"
          >
        </label>

        <div v-else class="grid grid-cols-2 gap-3">
          <label class="space-y-1.5">
            <span class="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted">{{ reportCopy.from }}</span>
            <input
              v-model="rangeFrom"
              type="date"
              class="h-12 w-full rounded-[1rem] border border-slate-200 bg-white px-3 text-sm font-semibold text-default outline-none transition focus:border-primary dark:border-slate-800 dark:bg-slate-900"
            >
          </label>
          <label class="space-y-1.5">
            <span class="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted">{{ reportCopy.to }}</span>
            <input
              v-model="rangeTo"
              type="date"
              class="h-12 w-full rounded-[1rem] border border-slate-200 bg-white px-3 text-sm font-semibold text-default outline-none transition focus:border-primary dark:border-slate-800 dark:bg-slate-900"
            >
          </label>
        </div>

        <label class="space-y-1.5">
          <span class="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted">{{ reportCopy.wallet }}</span>
          <select
            v-model="selectedWalletId"
            class="h-12 w-full rounded-[1rem] border border-slate-200 bg-white px-3 text-sm font-semibold text-default outline-none transition focus:border-primary dark:border-slate-800 dark:bg-slate-900"
          >
            <option v-for="option in walletOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </label>

        <div class="space-y-1.5">
          <span class="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted">{{ reportCopy.currency }}</span>
          <div class="grid grid-cols-3 gap-2 rounded-[1rem] bg-slate-100 p-1 dark:bg-slate-900">
            <button
              v-for="item in enabledCurrencyOptions"
              :key="item.value"
              type="button"
              class="rounded-[0.9rem] px-3 py-2 text-[11px] font-bold transition active:scale-95"
              :class="selectedCurrency === item.value ? 'bg-white text-primary shadow-sm dark:bg-slate-800' : 'text-muted'"
              @click="selectedCurrency = item.value"
            >
              {{ item.label }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <UCard class="hidden overflow-hidden rounded-[1.5rem] border border-white/60 bg-white/90 shadow-[0_18px_50px_-24px_rgba(15,23,42,0.22)] dark:border-white/10 dark:bg-slate-950/80 md:block">
      <div class="space-y-4">
        <div class="grid gap-3 md:grid-cols-[repeat(3,minmax(0,1fr))]">
          <div class="space-y-1.5 md:col-span-3">
            <span class="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted">{{ reportCopy.period }}</span>
            <div class="grid grid-cols-3 gap-2 rounded-[1rem] bg-slate-100 p-1 dark:bg-slate-900">
              <button
                v-for="item in viewModeOptions"
                :key="item.value"
                type="button"
                class="inline-flex items-center justify-center gap-2 rounded-[0.9rem] px-3 py-2 text-[11px] font-bold transition active:scale-95"
                :class="selectedViewMode === item.value ? 'bg-white text-primary shadow-sm dark:bg-slate-800' : 'text-muted'"
                @click="selectedViewMode = item.value"
              >
                <UIcon :name="item.icon" class="size-4" />
                <span class="whitespace-nowrap">{{ item.label }}</span>
              </button>
            </div>
          </div>

          <label v-if="selectedViewMode === 'year'" class="space-y-1.5">
            <span class="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted">{{ reportCopy.year }}</span>
            <select
              v-model="selectedYear"
              class="h-12 w-full rounded-[1rem] border border-slate-200 bg-white px-3 text-sm font-semibold text-default outline-none transition focus:border-primary dark:border-slate-800 dark:bg-slate-900"
            >
              <option v-for="year in availableYears" :key="year" :value="year">
                {{ year }}
              </option>
            </select>
          </label>

          <label v-else-if="selectedViewMode === 'month'" class="space-y-1.5 md:col-span-2">
            <span class="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted">{{ reportCopy.month }}</span>
            <input
              v-model="selectedMonth"
              type="month"
              class="h-12 w-full rounded-[1rem] border border-slate-200 bg-white px-3 text-sm font-semibold text-default outline-none transition focus:border-primary dark:border-slate-800 dark:bg-slate-900"
            >
          </label>

          <div v-else class="grid grid-cols-2 gap-3 md:col-span-2">
            <label class="space-y-1.5">
              <span class="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted">{{ reportCopy.from }}</span>
              <input
                v-model="rangeFrom"
                type="date"
                class="h-12 w-full rounded-[1rem] border border-slate-200 bg-white px-3 text-sm font-semibold text-default outline-none transition focus:border-primary dark:border-slate-800 dark:bg-slate-900"
              >
            </label>
            <label class="space-y-1.5">
              <span class="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted">{{ reportCopy.to }}</span>
              <input
                v-model="rangeTo"
                type="date"
                class="h-12 w-full rounded-[1rem] border border-slate-200 bg-white px-3 text-sm font-semibold text-default outline-none transition focus:border-primary dark:border-slate-800 dark:bg-slate-900"
              >
            </label>
          </div>

          <label class="space-y-1.5">
            <span class="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted">{{ reportCopy.wallet }}</span>
            <select
              v-model="selectedWalletId"
              class="h-12 w-full rounded-[1rem] border border-slate-200 bg-white px-3 text-sm font-semibold text-default outline-none transition focus:border-primary dark:border-slate-800 dark:bg-slate-900"
            >
              <option v-for="option in walletOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </label>

          <div class="space-y-1.5">
            <span class="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted">{{ reportCopy.currency }}</span>
            <div class="grid grid-cols-3 gap-2 rounded-[1rem] bg-slate-100 p-1 dark:bg-slate-900">
              <button
                v-for="item in enabledCurrencyOptions"
                :key="item.value"
                type="button"
                class="rounded-[0.9rem] px-3 py-2 text-[11px] font-bold transition active:scale-95"
                :class="selectedCurrency === item.value ? 'bg-white text-primary shadow-sm dark:bg-slate-800' : 'text-muted'"
                @click="selectedCurrency = item.value"
              >
                {{ item.label }}
              </button>
            </div>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-2 text-xs font-semibold text-muted">
          <span class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 dark:border-slate-800 dark:bg-slate-900">
            <UIcon name="i-lucide-calendar-range" class="size-4" />
            {{ selectedPeriodLabel }}
          </span>
          <span class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 dark:border-slate-800 dark:bg-slate-900">
            <UIcon name="i-lucide-wallet" class="size-4" />
            {{ selectedWalletLabel }}
          </span>
        </div>
      </div>
    </UCard>

    <section class="grid gap-3 md:grid-cols-3">
      <MetricCard
        :title="reportCopy.income"
        :value="formatCurrency(summaryIncome, selectedCurrency)"
        :detail="selectedPeriodLabel"
        icon="i-lucide-trending-up"
        accent="from-emerald-500 to-teal-400"
        value-class="text-[clamp(1rem,4vw,1.38rem)]"
      />
      <MetricCard
        :title="reportCopy.expense"
        :value="formatCurrency(summaryExpense, selectedCurrency)"
        :detail="selectedPeriodLabel"
        icon="i-lucide-trending-down"
        accent="from-rose-500 to-pink-400"
        value-class="text-[clamp(1rem,4vw,1.38rem)]"
      />
      <MetricCard
        :title="reportCopy.net"
        :value="formatCurrency(summaryNet, selectedCurrency, true)"
        :detail="selectedPeriodLabel"
        icon="i-lucide-badge-dollar-sign"
        :accent="summaryNet >= 0 ? 'from-sky-500 to-cyan-400' : 'from-amber-500 to-orange-400'"
        value-class="text-[clamp(1rem,4vw,1.38rem)]"
      />
    </section>

    <section class="md:hidden -mx-4 space-y-3 sm:-mx-6">
      <div class="px-4 sm:px-6">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <p class="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted">{{ chartTitle }}</p>
            <h2 class="mt-1 text-xl font-black tracking-tight text-default">{{ selectedPeriodLabel }}</h2>
          </div>
          <div :class="['flex size-9 items-center justify-center rounded-full bg-gradient-to-br text-white shadow-lg', activeTheme.accent]">
            <UIcon name="i-lucide-chart-column" class="size-4" />
          </div>
        </div>
      </div>

      <div class="px-4 sm:px-6">
        <TrendLineChart
          :labels="chartLabels"
          :series="chartSeries"
          :height="260"
          :axis-formatter="chartAxisFormatter"
          :mobile-axis-formatter="chartCompactCurrencyFormatter"
          :mobile-legend-formatter="chartCompactCurrencyFormatter"
          :value-formatter="chartValueFormatter"
          mobile-fullscreen
        />
      </div>
    </section>

    <section class="hidden gap-4 md:grid">
      <UCard class="overflow-hidden rounded-[1.5rem] border border-white/60 bg-white/90 shadow-[0_18px_50px_-24px_rgba(15,23,42,0.22)] dark:border-white/10 dark:bg-slate-950/80">
        <template #header>
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <p class="text-sm font-medium text-muted">{{ chartTitle }}</p>
              <h2 class="mt-1 text-2xl font-black tracking-tight text-default">{{ selectedPeriodLabel }}</h2>
            </div>
            <div :class="['flex size-10 items-center justify-center rounded-full bg-gradient-to-br text-white shadow-lg', activeTheme.accent]">
              <UIcon name="i-lucide-chart-column" class="size-5" />
            </div>
          </div>
        </template>

        <div class="hidden gap-2 sm:grid sm:grid-cols-3">
          <div class="rounded-[1rem] border border-slate-200/80 bg-slate-50/80 px-3 py-3 dark:border-slate-800 dark:bg-slate-900/70">
            <p class="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted">{{ reportCopy.income }}</p>
            <p class="mt-1 text-lg font-black tracking-tight text-default">{{ formatCurrency(summaryIncome, selectedCurrency) }}</p>
          </div>
          <div class="rounded-[1rem] border border-slate-200/80 bg-slate-50/80 px-3 py-3 dark:border-slate-800 dark:bg-slate-900/70">
            <p class="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted">{{ reportCopy.expense }}</p>
            <p class="mt-1 text-lg font-black tracking-tight text-default">{{ formatCurrency(summaryExpense, selectedCurrency) }}</p>
          </div>
          <div class="rounded-[1rem] border border-slate-200/80 bg-slate-50/80 px-3 py-3 dark:border-slate-800 dark:bg-slate-900/70">
            <p class="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted">{{ reportCopy.net }}</p>
            <p class="mt-1 text-lg font-black tracking-tight text-default">{{ formatCurrency(summaryNet, selectedCurrency, true) }}</p>
          </div>
        </div>

        <TrendLineChart
          :labels="chartLabels"
          :series="chartSeries"
          :height="340"
          :axis-formatter="chartAxisFormatter"
          :mobile-axis-formatter="chartCompactCurrencyFormatter"
          :mobile-legend-formatter="chartCompactCurrencyFormatter"
          :value-formatter="chartValueFormatter"
        />
      </UCard>

      <UCard class="overflow-hidden rounded-[1.5rem] border border-white/60 bg-white/90 shadow-[0_18px_50px_-24px_rgba(15,23,42,0.22)] dark:border-white/10 dark:bg-slate-950/80">
        <template #header>
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <p class="text-sm font-medium text-muted">{{ tableTitle }}</p>
              <h2 class="mt-1 text-2xl font-black tracking-tight text-default">{{ selectedPeriodLabel }}</h2>
            </div>
            <div class="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-400 text-white shadow-lg">
              <UIcon name="i-lucide-table-2" class="size-5" />
            </div>
          </div>
        </template>

        <div class="overflow-x-auto rounded-[1.2rem] border border-slate-200/80 dark:border-slate-800">
          <div>
            <div class="grid grid-cols-[minmax(4rem,5.25rem)_repeat(3,minmax(7rem,1fr))] gap-x-5 bg-slate-50 px-4 py-3 text-[9px] font-semibold uppercase tracking-[0.16em] text-muted dark:bg-slate-900 sm:grid-cols-[minmax(4.25rem,0.52fr)_repeat(3,minmax(0,1fr))] sm:gap-x-7 sm:px-6 sm:text-[10px] sm:tracking-[0.22em] lg:gap-x-8 lg:px-7">
              <span class="min-w-0 whitespace-nowrap">{{ tablePrimaryLabel }}</span>
              <span class="min-w-0 whitespace-nowrap text-right">{{ reportCopy.income }}</span>
              <span class="min-w-0 whitespace-nowrap text-right">{{ reportCopy.expense }}</span>
              <span class="min-w-0 whitespace-nowrap text-right">{{ tableProfitLabel }}</span>
            </div>

            <div class="divide-y divide-slate-200/80 dark:divide-slate-800">
              <div
                v-for="row in timelineRows"
                :key="row.key"
                class="grid grid-cols-[minmax(4rem,5.25rem)_repeat(3,minmax(7rem,1fr))] items-center gap-x-5 px-4 py-4 text-[13px] sm:grid-cols-[minmax(4.25rem,0.52fr)_repeat(3,minmax(0,1fr))] sm:gap-x-7 sm:px-6 sm:py-5 sm:text-sm lg:gap-x-8 lg:px-7"
              >
                <div class="min-w-0 pr-2">
                  <p class="whitespace-nowrap font-bold leading-5 text-default">{{ row.label }}</p>
                  <p class="whitespace-nowrap text-[11px] text-muted sm:text-[11px]">{{ row.secondaryLabel }} · {{ row.count }} tx</p>
                </div>
                <p class="min-w-0 whitespace-nowrap px-3 text-right font-semibold text-default tabular-nums sm:px-4 lg:px-5">{{ formatCurrency(row.income, selectedCurrency) }}</p>
                <p class="min-w-0 whitespace-nowrap px-3 text-right font-semibold text-default tabular-nums sm:px-4 lg:px-5">{{ formatCurrency(row.expense, selectedCurrency) }}</p>
                <p class="min-w-0 whitespace-nowrap px-3 text-right font-black tabular-nums sm:px-4 lg:px-5" :class="row.net >= 0 ? 'text-emerald-500' : 'text-rose-500'">
                  {{ formatCurrency(row.net, selectedCurrency, true) }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </UCard>
    </section>

    <section class="grid gap-4 xl:grid-cols-2">
      <UCard class="overflow-hidden rounded-[1.5rem] border border-white/60 bg-white/90 shadow-[0_18px_50px_-24px_rgba(15,23,42,0.22)] dark:border-white/10 dark:bg-slate-950/80">
        <template #header>
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-sm font-medium text-muted">{{ reportCopy.topCategories }}</p>
              <h2 class="mt-1 text-2xl font-black tracking-tight text-default">{{ reportCopy.expenseByCategory }}</h2>
            </div>
            <div :class="['flex size-10 items-center justify-center rounded-full bg-gradient-to-br text-white shadow-lg', activeTheme.accent]">
              <UIcon name="i-lucide-pie-chart" class="size-5" />
            </div>
          </div>
        </template>

        <DonutChart
          v-if="hasCategoryExpenseData"
          :items="expenseCategoryData.map(item => ({
            label: item.label,
            value: item.value,
            formatted: formatCurrency(item.value, selectedCurrency)
          }))"
          :center-label="reportCopy.expenseByCategory"
          :center-value="formatCurrency(expenseCategoryTotal, selectedCurrency)"
        />
        <p v-else class="py-8 text-center text-sm text-muted">{{ reportCopy.noExpenseRecords }}</p>
      </UCard>

      <UCard class="overflow-hidden rounded-[1.5rem] border border-white/60 bg-white/90 shadow-[0_18px_50px_-24px_rgba(15,23,42,0.22)] dark:border-white/10 dark:bg-slate-950/80">
        <template #header>
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-sm font-medium text-muted">{{ reportCopy.topCategories }}</p>
              <h2 class="mt-1 text-2xl font-black tracking-tight text-default">{{ reportCopy.incomeByCategory }}</h2>
            </div>
            <div :class="['flex size-10 items-center justify-center rounded-full bg-gradient-to-br text-white shadow-lg', activeTheme.accent]">
              <UIcon name="i-lucide-pie-chart" class="size-5" />
            </div>
          </div>
        </template>

        <DonutChart
          v-if="hasCategoryIncomeData"
          :items="incomeCategoryData.map(item => ({
            label: item.label,
            value: item.value,
            formatted: formatCurrency(item.value, selectedCurrency)
          }))"
          :center-label="reportCopy.incomeByCategory"
          :center-value="formatCurrency(incomeCategoryTotal, selectedCurrency)"
        />
        <p v-else class="py-8 text-center text-sm text-muted">{{ reportCopy.noIncomeRecords }}</p>
      </UCard>
    </section>

    <section class="grid gap-4 xl:grid-cols-3">
      <UCard class="overflow-hidden rounded-[1.5rem] border border-white/60 bg-white/90 shadow-[0_18px_50px_-24px_rgba(15,23,42,0.22)] dark:border-white/10 dark:bg-slate-950/80 xl:col-span-1">
        <template #header>
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-sm font-medium text-muted">{{ reportCopy.loanSummary }}</p>
              <h2 class="mt-1 text-2xl font-black tracking-tight text-default">{{ reportCopy.given }} / {{ reportCopy.received }}</h2>
            </div>
            <div class="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-400 text-white shadow-lg">
              <UIcon name="i-lucide-circle-dollar-sign" class="size-5" />
            </div>
          </div>
        </template>

        <div class="grid gap-3">
          <MetricCard
            :title="reportCopy.given"
            :value="formatCurrency(loanSummary.given, selectedCurrency)"
            :detail="selectedPeriodLabel"
            icon="i-lucide-arrow-up-right"
            accent="from-amber-500 to-orange-400"
            value-class="text-[clamp(1rem,4vw,1.38rem)]"
          />
          <MetricCard
            :title="reportCopy.received"
            :value="formatCurrency(loanSummary.received, selectedCurrency)"
            :detail="selectedPeriodLabel"
            icon="i-lucide-arrow-down-right"
            accent="from-emerald-500 to-teal-400"
            value-class="text-[clamp(1rem,4vw,1.38rem)]"
          />
          <MetricCard
            :title="reportCopy.loanNet"
            :value="formatCurrency(loanSummary.net, selectedCurrency, true)"
            :detail="selectedPeriodLabel"
            icon="i-lucide-badge-dollar-sign"
            :accent="loanSummary.net >= 0 ? 'from-sky-500 to-cyan-400' : 'from-amber-500 to-orange-400'"
            value-class="text-[clamp(1rem,4vw,1.38rem)]"
          />
        </div>
      </UCard>

      <UCard class="overflow-hidden rounded-[1.5rem] border border-white/60 bg-white/90 shadow-[0_18px_50px_-24px_rgba(15,23,42,0.22)] dark:border-white/10 dark:bg-slate-950/80 xl:col-span-1">
        <template #header>
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-sm font-medium text-muted">{{ reportCopy.topWallets }}</p>
              <h2 class="mt-1 text-2xl font-black tracking-tight text-default">{{ reportCopy.wallet }}</h2>
            </div>
            <div class="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-400 text-white shadow-lg">
              <UIcon name="i-lucide-wallet" class="size-5" />
            </div>
          </div>
        </template>

        <div v-if="topWallets.length" class="space-y-3">
          <div
            v-for="(item, index) in topWallets"
            :key="item.wallet.id"
            class="space-y-2 rounded-[1.2rem] bg-slate-50/80 px-3 py-3 dark:bg-slate-900/70"
          >
            <div class="flex items-center justify-between gap-3">
              <div class="min-w-0">
                <div class="flex items-center gap-2">
                  <span class="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-white text-[10px] font-black text-muted shadow-sm ring-1 ring-slate-200 dark:bg-slate-950 dark:ring-slate-800">
                    #{{ index + 1 }}
                  </span>
                  <p class="truncate text-sm font-bold text-default">{{ item.label }}</p>
                </div>
                <p v-if="item.wallet.note" class="mt-1 truncate text-xs text-muted">{{ item.wallet.note }}</p>
              </div>
              <p class="shrink-0 text-sm font-black tracking-tight text-default">
                {{ formatCurrency(item.value, selectedCurrency) }}
              </p>
            </div>

            <div class="h-2 overflow-hidden rounded-full bg-slate-200/80 dark:bg-slate-800">
              <div
                class="h-full rounded-full bg-gradient-to-r transition-all duration-500"
                :class="activeTheme.accent"
                :style="{ width: `${Math.max((item.value / topWalletMax) * 100, item.value > 0 ? 10 : 0)}%` }"
              />
            </div>
          </div>
        </div>
        <p v-else class="py-8 text-center text-sm text-muted">{{ reportCopy.noWallets }}</p>
      </UCard>

      <UCard class="overflow-hidden rounded-[1.5rem] border border-white/60 bg-white/90 shadow-[0_18px_50px_-24px_rgba(15,23,42,0.22)] dark:border-white/10 dark:bg-slate-950/80 xl:col-span-1">
        <template #header>
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-sm font-medium text-muted">{{ reportCopy.portfolioOverview }}</p>
              <h2 class="mt-1 text-2xl font-black tracking-tight text-default">{{ reportCopy.allWalletsCombined }}</h2>
            </div>
            <div :class="['flex size-10 items-center justify-center rounded-full bg-gradient-to-br text-white shadow-lg', activeTheme.accent]">
              <UIcon name="i-lucide-coins" class="size-5" />
            </div>
          </div>
        </template>

        <div class="grid grid-cols-1 gap-3">
          <MetricCard
            v-for="item in currencyOverview"
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

    <UAlert
      v-if="!hasPeriodData"
      color="neutral"
      variant="soft"
      icon="i-lucide-info"
      :title="reportCopy.noData"
      :description="reportCopy.subtitle"
      class="rounded-[1.2rem] border border-slate-200/80 bg-white/90 shadow-sm dark:border-slate-800 dark:bg-slate-950/80"
    />
  </div>
</template>
