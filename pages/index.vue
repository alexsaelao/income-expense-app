<script setup lang="ts">
import { useMoneyNote } from '~/composables/useMoneyNote'
import type { CurrencyCode } from '~/composables/useMoneyNote'

const { selectedLanguage } = useAppLanguage()
const { activeTheme } = useAppThemeColor()
const {
  selectedCurrency,
  totalBalance,
  totalIncome,
  totalExpense,
  totalNet,
  recentTransactions,
  wallets,
  formatCurrency,
  formatCurrencyOrDash,
  hasCurrencyTransactions,
  hasWalletTransactions,
  walletSeries,
  currencyBalances,
  enabledCurrencyOptions,
  canEditMoneyData
} = useMoneyNote()

const activeCurrency = computed(() => selectedCurrency.value)
const walletCards = computed(() => walletSeries(activeCurrency.value))
const currencySummary = computed(() => currencyBalances.value)

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

const homeCopy = computed(() => {
  if (selectedLanguage.value === 'lo') {
    return {
      displayCurrency: 'ເງິນຕາທີ່ແສດງ',
      totalBalance: 'ຍອດລວມ',
      acrossWallets: (count: number) => `ທັງໝົດ ${count} ກະເປົ໋າ`,
      net: 'ສຸດທິ',
      thisMonth: 'ເດືອນນີ້',
      income: 'ລາຍຮັບ',
      expense: 'ລາຍຈ່າຍ',
      quickActions: 'ຄຳສັ່ງດ່ວນ',
      openReports: 'ເປີດລາຍງານ',
      add: 'ເພີ່ມ',
      history: 'ປະຫວັດ',
      wallets: 'ກະເປົ໋າ',
      reports: 'ລາຍງານ',
      newTransaction: 'ລາຍການໃໝ່',
      browseEntries: 'ເບິ່ງລາຍການ',
      balancesAndWallets: 'ຍອດ ແລະ ກະເປົ໋າ',
      chartsAndSummaries: 'ກຣາຟ ແລະ ສະຫຼຸບ',
      walletBalances: 'ຍອດກະເປົ໋າ',
      seeAll: 'ເບິ່ງທັງໝົດ',
      currencyOverview: 'ພາບລວມເງິນຕາ',
      allWallets: 'ທຸກກະເປົ໋າ',
      recentTransactions: 'ທຸລະກຳລ່າສຸດ',
      viewHistory: 'ເບິ່ງປະຫວັດ'
    }
  }

  return {
    displayCurrency: 'Display currency',
    totalBalance: 'Total balance',
    acrossWallets: (count: number) => `Across ${count} wallets`,
    net: 'Net',
    thisMonth: 'This month',
    income: 'Income',
    expense: 'Expense',
    quickActions: 'Quick actions',
    openReports: 'Open reports',
    add: 'Add',
    history: 'History',
    wallets: 'Wallets',
    reports: 'Reports',
    newTransaction: 'New transaction',
    browseEntries: 'Browse entries',
    balancesAndWallets: 'Balances and wallets',
    chartsAndSummaries: 'Charts and summaries',
    walletBalances: 'Wallet balances',
    seeAll: 'See all',
    currencyOverview: 'Currency overview',
    allWallets: 'All wallets',
    recentTransactions: 'Recent transactions',
    viewHistory: 'View history'
  }
})

const quickActions = computed(() => [
  { label: homeCopy.value.add, icon: 'i-lucide-plus', to: canEditMoneyData.value ? '/add' : '/settings', color: 'primary', subtitle: homeCopy.value.newTransaction },
  { label: homeCopy.value.history, icon: 'i-lucide-list-restart', to: '/transactions', color: 'sky', subtitle: homeCopy.value.browseEntries },
  { label: homeCopy.value.wallets, icon: 'i-lucide-wallet', to: '/wallets', color: 'emerald', subtitle: homeCopy.value.balancesAndWallets },
  { label: homeCopy.value.reports, icon: 'i-lucide-chart-column', to: '/reports', color: 'amber', subtitle: homeCopy.value.chartsAndSummaries }
])

</script>

<template>
  <div class="space-y-5 pb-8">
    <section class="space-y-3">
      <div class="flex items-end justify-between gap-3">
        <div class="min-w-0">
          <p class="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted">{{ homeCopy.displayCurrency }}</p>
          <div class="mt-1 inline-flex items-center rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-primary shadow-sm dark:border-slate-800 dark:bg-slate-900">
            {{ activeCurrency }}
          </div>
        </div>
        <div class="grid grid-cols-3 gap-1.5 rounded-full bg-slate-100 p-1 dark:bg-slate-900">
          <button
            v-for="option in enabledCurrencyOptions"
            :key="option.value"
            type="button"
            class="rounded-full px-3 py-2.5 text-[12px] font-bold transition active:scale-95 sm:px-3 sm:py-2 sm:text-xs"
            :class="selectedCurrency === option.value ? 'bg-white text-primary shadow-sm dark:bg-slate-800' : 'text-muted'"
            @click="selectedCurrency = option.value"
          >
            {{ option.label }}
          </button>
        </div>
      </div>

      <div class="relative overflow-hidden rounded-[1.4rem] border border-slate-200/80 bg-white shadow-[0_22px_55px_-30px_rgba(15,23,42,0.22)] dark:border-slate-800 dark:bg-slate-950/80">
        <div class="mascot-bob absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-1/2">
          <div class="flex size-12 items-center justify-center rounded-full border border-white/80 bg-white shadow-[0_16px_30px_-14px_rgba(15,23,42,0.35)] dark:border-slate-700 dark:bg-slate-900">
            <svg viewBox="0 0 64 64" class="size-10" aria-hidden="true">
              <defs>
                <linearGradient id="mascot-face" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stop-color="#7dd3fc" />
                  <stop offset="100%" stop-color="#3b82f6" />
                </linearGradient>
              </defs>
              <path d="M18 25L12 14L24 20Z" fill="#93c5fd" />
              <path d="M46 25L52 14L40 20Z" fill="#60a5fa" />
              <circle cx="32" cy="34" r="20" fill="url(#mascot-face)" />
              <circle cx="24" cy="31" r="2.3" fill="#eff6ff" />
              <circle cx="40" cy="31" r="2.3" fill="#eff6ff" />
              <path d="M27.5 40C29.5 42 34.5 42 36.5 40" fill="none" stroke="#eff6ff" stroke-linecap="round" stroke-width="2.4" />
              <circle cx="24" cy="38" r="1.8" fill="#bfdbfe" opacity="0.9" />
              <circle cx="40" cy="38" r="1.8" fill="#bfdbfe" opacity="0.9" />
              <path d="M20 48C21.8 45.5 24.5 44 27.5 44H36.5C39.5 44 42.2 45.5 44 48" fill="none" stroke="#eff6ff" stroke-linecap="round" stroke-width="2.4" />
            </svg>
          </div>
        </div>
        <div class="px-4 py-4">
          <div class="min-w-0">
            <p class="text-[8px] font-semibold uppercase tracking-[0.14em] text-muted">{{ homeCopy.totalBalance }}</p>
            <div class="mt-1 flex items-center gap-3">
              <div :class="['flex size-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-white shadow-lg', activeTheme.accent]">
                <UIcon name="i-lucide-wallet" class="size-5" />
              </div>
              <p class="whitespace-nowrap text-[clamp(1.12rem,6.2vw,2.45rem)] font-black leading-none tracking-[-0.06em] tabular-nums text-default">
                {{ formatCurrencyOrDash(totalBalance, activeCurrency, hasCurrencyTransactions(activeCurrency), true) }}
              </p>
            </div>
            <p class="mt-1 text-[9px] text-muted sm:text-[10px]">{{ homeCopy.acrossWallets(wallets.filter(wallet => wallet.currency === activeCurrency).length) }}</p>
          </div>
        </div>

        <div class="px-4 pb-4">
          <div class="rounded-[1.4rem] border border-slate-200 bg-slate-50 px-3 py-2.5 dark:border-slate-800 dark:bg-slate-900">
            <div class="flex items-center justify-between gap-3">
              <div>
                <p class="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted sm:text-[11px]">{{ homeCopy.net }}</p>
                <p class="text-[11px] text-muted sm:text-xs">{{ homeCopy.thisMonth }}</p>
              </div>
              <p class="whitespace-nowrap text-[clamp(0.98rem,4.5vw,1.28rem)] font-extrabold leading-none tracking-[-0.04em] tabular-nums text-default">
                {{ formatCurrency(totalNet, activeCurrency, true) }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="grid grid-cols-2 gap-3">
        <MetricCard
        :title="homeCopy.income"
        :value="formatCurrency(totalIncome, activeCurrency)"
        :detail="homeCopy.thisMonth"
        icon="i-lucide-trending-up"
        accent="from-emerald-500 to-teal-400"
      />
      <MetricCard
        :title="homeCopy.expense"
        :value="formatCurrency(totalExpense, activeCurrency)"
        :detail="homeCopy.thisMonth"
        icon="i-lucide-trending-down"
        accent="from-rose-500 to-pink-400"
      />
    </section>

    <section class="space-y-3">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-black tracking-tight text-default">{{ homeCopy.quickActions }}</h2>
        <NuxtLink to="/reports" class="text-sm font-semibold text-primary">{{ homeCopy.openReports }}</NuxtLink>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <NuxtLink
          v-for="action in quickActions"
          :key="action.label"
          :to="action.to"
          class="h-full rounded-[1.4rem] border border-white/60 bg-white/80 p-4 shadow-[0_18px_50px_-25px_rgba(15,23,42,0.28)] transition active:scale-[0.98] dark:border-white/10 dark:bg-slate-950/70"
        >
          <div class="flex items-center gap-3">
            <div :class="['flex size-12 shrink-0 aspect-square items-center justify-center rounded-full text-white shadow-lg', action.color === 'primary' ? 'bg-primary' : action.color === 'emerald' ? 'bg-emerald-500' : action.color === 'amber' ? 'bg-amber-500' : 'bg-violet-500']">
              <UIcon :name="action.icon" class="size-5" />
            </div>
            <div>
              <p class="font-bold text-default">{{ action.label }}</p>
              <p class="text-sm text-muted">{{ action.subtitle }}</p>
            </div>
          </div>
        </NuxtLink>
      </div>
    </section>

    <section class="space-y-3">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-black tracking-tight text-default">{{ homeCopy.walletBalances }}</h2>
        <NuxtLink to="/wallets" class="text-sm font-semibold text-primary">{{ homeCopy.seeAll }}</NuxtLink>
      </div>

      <div class="space-y-3">
        <WalletCard
          v-for="wallet in walletCards"
          :key="wallet.wallet.id"
          :wallet="wallet.wallet"
          :amount-label="formatCurrencyOrDash(wallet.value, wallet.wallet.currency, hasWalletTransactions(wallet.wallet.id), true)"
          :detail="wallet.wallet.note"
          compact
          :href="`/wallets/${wallet.wallet.id}`"
        />
      </div>
    </section>

    <section class="space-y-3">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-black tracking-tight text-default">{{ homeCopy.currencyOverview }}</h2>
      </div>

      <div class="grid grid-cols-1 gap-3">
        <MetricCard
          v-for="item in currencySummary"
          :key="item.currency"
          :title="item.currency"
          :value="formatCurrencyOrDash(item.balance, item.currency, hasCurrencyTransactions(item.currency), true)"
          :detail="homeCopy.allWallets"
          :icon-text="currencySymbols[item.currency]"
          :accent="currencyAccents[item.currency]"
          value-class="text-[clamp(1rem,4vw,1.38rem)]"
        />
      </div>
    </section>

    <section class="space-y-3">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-black tracking-tight text-default">{{ homeCopy.recentTransactions }}</h2>
        <NuxtLink to="/transactions" class="text-sm font-semibold text-primary">{{ homeCopy.viewHistory }}</NuxtLink>
      </div>

      <div class="space-y-3">
        <TransactionCard
          v-for="transaction in recentTransactions"
          :key="transaction.id"
          :transaction="transaction"
          show-wallet
        />
      </div>
    </section>

  </div>
</template>
