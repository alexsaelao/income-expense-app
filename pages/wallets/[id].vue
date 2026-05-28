<script setup lang="ts">
import { useMoneyNote } from '~/composables/useMoneyNote'

const route = useRoute()
const { getWallet, walletMonthTotals, formatCurrency, transactions, formatDate, typeLabel, typeIcon, typeTint } = useMoneyNote()

const wallet = computed(() => getWallet(String(route.params.id)))
const summary = computed(() => wallet.value ? walletMonthTotals(wallet.value.id) : null)
const walletTransactions = computed(() =>
  transactions.value.filter(transaction => transaction.walletId === wallet.value?.id || transaction.toWalletId === wallet.value?.id)
)
</script>

<template>
  <div class="space-y-5 pb-4">
    <section class="flex items-start justify-between gap-3">
      <div>
        <h1 class="mt-1 text-3xl font-black tracking-tight text-default">{{ wallet?.name ?? 'Wallet not found' }}</h1>
      </div>

      <UButton icon="i-lucide-arrow-left" variant="ghost" color="neutral" size="lg" class="rounded-2xl" to="/wallets" />
    </section>

    <UCard v-if="wallet" class="overflow-hidden rounded-[1.4rem] border border-white/60 bg-white/90 shadow-[0_18px_50px_-24px_rgba(15,23,42,0.22)] dark:border-white/10 dark:bg-slate-950/80">
      <div class="flex items-center gap-4">
        <div :class="['flex size-16 items-center justify-center rounded-[1.5rem] bg-gradient-to-br text-3xl shadow-lg', wallet.accent]">{{ wallet.emoji }}</div>
        <div class="min-w-0 flex-1">
          <p class="text-xs font-semibold uppercase tracking-[0.26em] text-muted">Current balance</p>
          <p class="mt-1 text-[clamp(1.4rem,4.6vw,2.05rem)] font-black tracking-tight text-default">{{ formatCurrency(wallet.balance, wallet.currency) }}</p>
          <p class="mt-2 text-sm text-muted">{{ wallet.note }}</p>
        </div>
      </div>

      <div class="mt-5 grid grid-cols-1 gap-3">
        <MetricCard title="Income" :value="formatCurrency(summary?.income ?? 0, wallet.currency)" icon="i-lucide-trending-up" accent="from-emerald-500 to-teal-400" />
        <MetricCard title="Expense" :value="formatCurrency(summary?.expense ?? 0, wallet.currency)" icon="i-lucide-trending-down" accent="from-rose-500 to-pink-400" />
        <MetricCard title="Net" :value="formatCurrency(summary?.net ?? 0, wallet.currency, true)" icon="i-lucide-badge-dollar-sign" accent="from-sky-500 to-cyan-400" />
      </div>
    </UCard>

    <section class="space-y-3">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-black tracking-tight text-default">Transactions</h2>
        <span class="text-sm text-muted">{{ walletTransactions.length }} items</span>
      </div>

      <div class="space-y-3">
        <TransactionCard
          v-for="transaction in walletTransactions"
          :key="transaction.id"
          :transaction="transaction"
          show-wallet
        >
          <template #actions>
            <UBadge color="neutral" variant="soft" class="rounded-full">{{ typeLabel(transaction.type) }}</UBadge>
            <span class="text-sm text-muted">{{ formatDate(transaction.date) }}</span>
          </template>
        </TransactionCard>
      </div>
    </section>

    <UCard v-if="!wallet" class="border border-dashed border-slate-300 bg-white/70 p-8 text-center dark:border-slate-700 dark:bg-slate-950/70">
      <UIcon name="i-lucide-wallet-off" class="mx-auto size-10 text-muted" />
      <h2 class="mt-4 text-lg font-black text-default">Wallet not found</h2>
      <p class="mt-2 text-sm text-muted">The wallet may have been removed or the link is invalid.</p>
      <UButton class="mt-5 rounded-2xl" to="/wallets">Back to wallets</UButton>
    </UCard>
  </div>
</template>
