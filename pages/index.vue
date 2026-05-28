<script setup lang="ts">
import { useMoneyNote } from '~/composables/useMoneyNote'

const { selectedCurrency, totalBalance, totalIncome, totalExpense, totalNet, recentTransactions, wallets, formatCurrency, walletSeries, currencyBalances, enabledCurrencyOptions } = useMoneyNote()

const activeCurrency = computed(() => selectedCurrency.value)
const walletCards = computed(() => walletSeries(activeCurrency.value))
const currencySummary = computed(() => currencyBalances.value)

const quickActions = [
  { label: 'Add', icon: 'i-lucide-plus', to: '/add', color: 'primary' },
  { label: 'History', icon: 'i-lucide-list-restart', to: '/transactions', color: 'sky' },
  { label: 'Wallets', icon: 'i-lucide-wallet', to: '/wallets', color: 'emerald' },
  { label: 'Reports', icon: 'i-lucide-chart-column', to: '/reports', color: 'amber' }
]

</script>

<template>
  <div class="space-y-5 pb-8">
    <section class="space-y-3">
      <div class="flex items-center justify-between gap-3">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.24em] text-muted">Display currency</p>
          <p class="text-sm font-bold text-default">{{ activeCurrency }}</p>
        </div>
        <div class="grid grid-cols-3 gap-2 rounded-[1.1rem] bg-slate-100 p-1.5 dark:bg-slate-900">
          <button
            v-for="option in enabledCurrencyOptions"
            :key="option.value"
            type="button"
            class="rounded-[0.95rem] px-2 py-2 text-xs font-bold transition active:scale-95"
            :class="selectedCurrency === option.value ? 'bg-white text-primary shadow-sm dark:bg-slate-800' : 'text-muted'"
            @click="selectedCurrency = option.value"
          >
            {{ option.label }}
          </button>
        </div>
      </div>

      <div class="overflow-hidden rounded-[1.4rem] bg-gradient-to-br from-sky-500 via-blue-500 to-cyan-400 text-white shadow-[0_30px_70px_-28px_rgba(37,99,235,0.55)]">
        <div class="px-4 py-3">
          <div class="min-w-0">
            <p class="text-[8px] font-semibold uppercase tracking-[0.14em] text-white/70">Total balance</p>
            <p class="mt-1 whitespace-nowrap text-[clamp(0.92rem,4.25vw,2.1rem)] font-black leading-none tracking-[-0.055em] tabular-nums">
              {{ formatCurrency(totalBalance, activeCurrency) }}
            </p>
            <p class="mt-1 text-[9px] text-white/80 sm:text-[10px]">Across {{ wallets.filter(wallet => wallet.currency === activeCurrency).length }} wallets</p>
          </div>
        </div>

        <div class="grid grid-cols-3 gap-1 px-4 pb-4">
          <div class="rounded-[1.4rem] bg-white/12 px-2 py-1.5">
            <p class="text-[8px] font-semibold uppercase tracking-[0.12em] text-white/70">Income</p>
            <p class="mt-1 whitespace-nowrap text-[clamp(0.64rem,2.55vw,0.9rem)] font-extrabold leading-none tracking-[-0.04em] tabular-nums">
              {{ formatCurrency(totalIncome, activeCurrency) }}
            </p>
          </div>
          <div class="rounded-[1.4rem] bg-white/12 px-2 py-1.5">
            <p class="text-[8px] font-semibold uppercase tracking-[0.12em] text-white/70">Expense</p>
            <p class="mt-1 whitespace-nowrap text-[clamp(0.64rem,2.55vw,0.9rem)] font-extrabold leading-none tracking-[-0.04em] tabular-nums">
              {{ formatCurrency(totalExpense, activeCurrency) }}
            </p>
          </div>
          <div class="rounded-[1.4rem] bg-white/12 px-2 py-1.5">
            <p class="text-[8px] font-semibold uppercase tracking-[0.12em] text-white/70">Net</p>
            <p class="mt-1 whitespace-nowrap text-[clamp(0.64rem,2.55vw,0.9rem)] font-extrabold leading-none tracking-[-0.04em] tabular-nums">
              {{ formatCurrency(totalNet, activeCurrency, true) }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <section class="grid grid-cols-2 gap-3">
      <MetricCard
        title="Income"
        :value="formatCurrency(totalIncome, activeCurrency)"
        detail="This month"
        icon="i-lucide-trending-up"
        accent="from-emerald-500 to-teal-400"
      />
      <MetricCard
        title="Expense"
        :value="formatCurrency(totalExpense, activeCurrency)"
        detail="This month"
        icon="i-lucide-trending-down"
        accent="from-rose-500 to-pink-400"
      />
    </section>

    <section class="space-y-3">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-black tracking-tight text-default">Quick actions</h2>
        <NuxtLink to="/reports" class="text-sm font-semibold text-primary">Open reports</NuxtLink>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <NuxtLink
          v-for="action in quickActions"
          :key="action.label"
          :to="action.to"
          class="rounded-[1.4rem] border border-white/60 bg-white/80 p-4 shadow-[0_18px_50px_-25px_rgba(15,23,42,0.28)] transition active:scale-[0.98] dark:border-white/10 dark:bg-slate-950/70"
        >
          <div class="flex items-center gap-3">
            <div :class="['flex size-11 items-center justify-center rounded-[1.4rem] bg-gradient-to-br text-white shadow-lg', action.color === 'primary' ? 'from-sky-500 to-cyan-400' : action.color === 'emerald' ? 'from-emerald-500 to-teal-400' : action.color === 'amber' ? 'from-amber-500 to-orange-400' : 'from-violet-500 to-fuchsia-400']">
              <UIcon :name="action.icon" class="size-5" />
            </div>
            <div>
              <p class="font-bold text-default">{{ action.label }}</p>
              <p class="text-sm text-muted">{{ action.label === 'Add' ? 'New transaction' : action.label === 'History' ? 'Browse entries' : action.label === 'Wallets' ? 'Balances and wallets' : 'Charts and summaries' }}</p>
            </div>
          </div>
        </NuxtLink>
      </div>
    </section>

    <section class="space-y-3">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-black tracking-tight text-default">Wallet balances</h2>
        <NuxtLink to="/wallets" class="text-sm font-semibold text-primary">See all</NuxtLink>
      </div>

      <div class="space-y-3">
        <WalletCard
          v-for="wallet in walletCards"
          :key="wallet.wallet.id"
          :wallet="wallet.wallet"
          :amount-label="formatCurrency(wallet.value, wallet.wallet.currency)"
          :detail="wallet.wallet.note"
          compact
          :href="`/wallets/${wallet.wallet.id}`"
        />
      </div>
    </section>

    <section class="space-y-3">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-black tracking-tight text-default">Currency overview</h2>
      </div>

      <div class="grid grid-cols-1 gap-3">
        <MetricCard
          v-for="item in currencySummary"
          :key="item.currency"
          :title="item.currency"
          :value="formatCurrency(item.balance, item.currency)"
          detail="All wallets"
          icon="i-lucide-coins"
          accent="from-sky-500 to-cyan-400"
        />
      </div>
    </section>

    <section class="space-y-3">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-black tracking-tight text-default">Recent transactions</h2>
        <NuxtLink to="/transactions" class="text-sm font-semibold text-primary">View history</NuxtLink>
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
