<script setup lang="ts">
import { useMoneyNote } from '~/composables/useMoneyNote'

const { selectedCurrency, monthlySeries, categorySeries, walletSeries, currencySeries, formatCurrency, enabledCurrencyOptions } = useMoneyNote()

const monthlyData = computed(() => monthlySeries(selectedCurrency.value))
const categoryData = computed(() => categorySeries(selectedCurrency.value))
const walletData = computed(() => walletSeries(selectedCurrency.value))
const currencyData = computed(() => currencySeries())
const monthMax = computed(() => Math.max(...monthlyData.value.flatMap(item => [item.income, item.expense, 1])))
</script>

<template>
  <div class="space-y-5 pb-4">
    <section class="flex items-start justify-between gap-3">
      <div>
        <p class="text-sm font-medium text-muted">Insights</p>
        <h1 class="mt-1 text-3xl font-black tracking-tight text-default">Reports</h1>
        <p class="mt-2 text-sm leading-6 text-muted">See the month trend, wallet balance, category spend, and currency totals.</p>
      </div>

      <UButton icon="i-lucide-arrow-left" variant="ghost" color="neutral" size="lg" class="rounded-2xl" to="/" />
    </section>

    <section class="flex items-center justify-between gap-3">
      <div>
        <p class="text-xs font-semibold uppercase tracking-[0.24em] text-muted">Currency</p>
        <p class="text-sm font-bold text-default">{{ selectedCurrency }}</p>
      </div>

      <div class="flex gap-2 rounded-2xl bg-white/70 p-1 shadow-sm dark:bg-slate-950/60">
        <button
          v-for="item in enabledCurrencyOptions"
          :key="item.value"
          type="button"
          class="rounded-xl px-3 py-2 text-sm font-bold transition"
          :class="selectedCurrency === item.value ? 'bg-primary text-white shadow-md' : 'text-muted'"
          @click="selectedCurrency = item.value"
        >
          {{ item.label }}
        </button>
      </div>
    </section>

    <UCard class="border border-white/60 bg-white/90 shadow-[0_18px_50px_-24px_rgba(15,23,42,0.22)] dark:border-white/10 dark:bg-slate-950/80">
      <template #header>
        <div>
          <p class="text-sm font-medium text-muted">Monthly income vs expense</p>
          <h2 class="mt-1 text-2xl font-black tracking-tight text-default">Trend line by month</h2>
        </div>
      </template>

      <div class="space-y-5">
        <div v-for="item in monthlyData" :key="item.key" class="space-y-3">
          <div class="flex items-center justify-between gap-3">
            <div>
              <p class="text-sm font-bold text-default">{{ item.label }}</p>
              <p class="text-xs text-muted">{{ formatCurrency(item.net, selectedCurrency, true) }}</p>
            </div>
            <p class="text-sm text-muted">{{ formatCurrency(item.income, selectedCurrency) }} / {{ formatCurrency(item.expense, selectedCurrency) }}</p>
          </div>

          <div class="space-y-2">
            <div class="flex items-center gap-3">
              <span class="w-16 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-500">Income</span>
              <div class="h-3 flex-1 overflow-hidden rounded-full bg-slate-200/80 dark:bg-slate-800">
                <div
                  class="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                  :style="{ width: `${Math.max((item.income / monthMax) * 100, item.income > 0 ? 8 : 0)}%` }"
                />
              </div>
            </div>
            <div class="flex items-center gap-3">
              <span class="w-16 text-xs font-semibold uppercase tracking-[0.22em] text-rose-500">Expense</span>
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

    <UCard class="border border-white/60 bg-white/90 shadow-[0_18px_50px_-24px_rgba(15,23,42,0.22)] dark:border-white/10 dark:bg-slate-950/80">
      <template #header>
        <div>
          <p class="text-sm font-medium text-muted">Expense by category</p>
          <h2 class="mt-1 text-2xl font-black tracking-tight text-default">Where the money goes</h2>
        </div>
      </template>

      <SimpleBarChart
        v-if="categoryData.length"
        :items="categoryData"
        :total="Math.max(...categoryData.map(item => item.value), 1)"
      />
      <p v-else class="py-8 text-center text-sm text-muted">No expense records for this currency yet.</p>
    </UCard>

    <div class="grid gap-4 lg:grid-cols-2">
      <UCard class="border border-white/60 bg-white/90 shadow-[0_18px_50px_-24px_rgba(15,23,42,0.22)] dark:border-white/10 dark:bg-slate-950/80">
        <template #header>
          <div>
            <p class="text-sm font-medium text-muted">Balance by wallet</p>
            <h2 class="mt-1 text-2xl font-black tracking-tight text-default">Wallet standings</h2>
          </div>
        </template>

        <SimpleBarChart
          v-if="walletData.length"
          :items="walletData.map(item => ({ label: item.label, value: item.value, helper: item.wallet.note }))"
        />
        <p v-else class="py-8 text-center text-sm text-muted">No wallets in this currency yet.</p>
      </UCard>

      <UCard class="border border-white/60 bg-white/90 shadow-[0_18px_50px_-24px_rgba(15,23,42,0.22)] dark:border-white/10 dark:bg-slate-950/80">
        <template #header>
          <div>
            <p class="text-sm font-medium text-muted">Currency summary</p>
            <h2 class="mt-1 text-2xl font-black tracking-tight text-default">Portfolio overview</h2>
          </div>
        </template>

        <div class="space-y-3">
          <div
            v-for="item in currencyData"
            :key="item.currency"
            class="flex items-center justify-between rounded-[1.25rem] bg-slate-100 px-4 py-4 dark:bg-slate-900"
          >
            <div>
              <p class="text-sm font-bold text-default">{{ item.currency }}</p>
              <p class="text-xs text-muted">All wallets combined</p>
            </div>
            <p class="text-lg font-black text-default">{{ formatCurrency(item.balance, item.currency) }}</p>
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>
