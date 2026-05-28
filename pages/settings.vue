<script setup lang="ts">
import { currencyOptions, currencySymbols } from '~/composables/useMoneyNote'

const { selectedLanguage } = useAppLanguage()
const { enabledCurrencyOptions, isCurrencyEnabled, toggleCurrencyEnabled } = useMoneyNote()
const colorMode = useColorMode()

const themeChoices = [
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
  { label: 'System', value: 'system' }
]

const languageChoices = [
  { label: 'English', value: 'en' as const },
  { label: 'Lao', value: 'lo' as const }
]

function setTheme(theme: string) {
  colorMode.preference = theme
}

function setLanguage(language: 'en' | 'lo') {
  selectedLanguage.value = language
}

function resetDemoData() {
  localStorage.removeItem('income-expense-note-state-v1')
  localStorage.removeItem('money-note-selected-currency')
  localStorage.removeItem('income-expense-note-currency-support-v1')
  window.location.reload()
}
</script>

<template>
  <div class="space-y-6 pb-8">
    <section class="space-y-1">
      <h1 class="text-3xl font-black tracking-tight text-default">Settings</h1>
    </section>

    <section class="overflow-hidden rounded-[1.25rem] border border-slate-200/80 bg-white/80 shadow-[0_12px_40px_-28px_rgba(15,23,42,0.2)] dark:border-slate-800 dark:bg-slate-950/70">
      <div class="px-4 py-4">
        <h2 class="text-sm font-black tracking-tight text-default">General</h2>
      </div>

      <div class="space-y-3 border-t border-slate-200/80 px-4 py-4 dark:border-slate-800">
        <div class="flex items-center justify-between gap-3">
          <div class="min-w-0">
            <p class="text-sm font-bold text-default">Language</p>
            <p class="text-xs text-muted">Choose app language.</p>
          </div>
          <UBadge color="neutral" variant="soft" class="rounded-full">
            {{ selectedLanguage === 'lo' ? 'Lao' : 'English' }}
          </UBadge>
        </div>

        <div class="grid grid-cols-2 gap-2 rounded-full bg-slate-100 p-1.5 dark:bg-slate-900">
          <button
            v-for="choice in languageChoices"
            :key="choice.value"
            type="button"
            class="flex min-h-11 items-center justify-center gap-2 rounded-full px-3 py-2 text-left transition active:scale-95"
            :class="selectedLanguage === choice.value ? 'bg-white text-primary shadow-sm dark:bg-slate-800' : 'text-muted'"
            @click="setLanguage(choice.value)"
          >
            <AppLanguageFlag :code="choice.value" />
            <p class="min-w-0 truncate text-sm font-bold leading-none">{{ choice.label }}</p>
          </button>
        </div>
      </div>

      <div class="space-y-3 border-t border-slate-200/80 px-4 py-4 dark:border-slate-800">
        <div class="flex items-center justify-between gap-3">
          <div class="min-w-0">
            <p class="text-sm font-bold text-default">Appearance</p>
            <p class="text-xs text-muted">Theme mode.</p>
          </div>
          <UBadge color="neutral" variant="soft" class="rounded-full">
            {{ colorMode.preference }}
          </UBadge>
        </div>

        <div class="grid grid-cols-3 gap-2 rounded-full bg-slate-100 p-1.5 dark:bg-slate-900">
          <button
            v-for="choice in themeChoices"
            :key="choice.value"
            type="button"
            class="rounded-full px-2 py-2 text-xs font-bold transition active:scale-95"
            :class="colorMode.preference === choice.value ? 'bg-white text-primary shadow-sm dark:bg-slate-800' : 'text-muted'"
            @click="setTheme(choice.value)"
          >
            {{ choice.label }}
          </button>
        </div>
      </div>
    </section>

    <section class="overflow-hidden rounded-[1.25rem] border border-slate-200/80 bg-white/80 shadow-[0_12px_40px_-28px_rgba(15,23,42,0.2)] dark:border-slate-800 dark:bg-slate-950/70 lg:hidden">
      <div class="flex items-center justify-between gap-3 px-4 py-4">
        <div class="min-w-0">
          <h2 class="text-sm font-black tracking-tight text-default">Currency</h2>
          <p class="text-xs text-muted">Enable the currencies you want to use.</p>
        </div>
        <UBadge color="neutral" variant="soft" class="rounded-full">
          {{ enabledCurrencyOptions.length }}/{{ currencyOptions.length }}
        </UBadge>
      </div>

      <div class="border-t border-slate-200/80 px-4 py-2 dark:border-slate-800">
        <div
          v-for="item in currencyOptions"
          :key="item.value"
          class="flex items-center justify-between gap-3 py-3"
          :class="item.value !== currencyOptions[currencyOptions.length - 1].value ? 'border-b border-slate-200/80 dark:border-slate-800' : ''"
        >
          <div class="flex min-w-0 items-center gap-3">
            <div class="flex size-10 items-center justify-center rounded-[0.9rem] bg-slate-100 text-base font-black text-default shadow-sm dark:bg-slate-900">
              {{ currencySymbols[item.value] }}
            </div>
            <div class="min-w-0">
              <p class="text-sm font-bold text-default">{{ item.label }}</p>
              <p class="text-xs text-muted">{{ isCurrencyEnabled(item.value) ? 'Active' : 'Disabled' }}</p>
            </div>
          </div>

          <button
            type="button"
            class="relative inline-flex h-7 w-12 shrink-0 items-center rounded-full p-0.5 transition duration-200 ease-out active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            :class="isCurrencyEnabled(item.value) ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-700'"
            :disabled="isCurrencyEnabled(item.value) && enabledCurrencyOptions.length <= 1"
            :aria-pressed="isCurrencyEnabled(item.value)"
            @click="toggleCurrencyEnabled(item.value)"
          >
            <span
              class="inline-block size-6 rounded-full bg-white shadow-sm ring-1 ring-black/5 transition duration-200 ease-out"
              :class="isCurrencyEnabled(item.value) ? 'translate-x-5' : 'translate-x-0'"
            />
          </button>
        </div>
      </div>
    </section>

    <section class="overflow-hidden rounded-[1.25rem] border border-slate-200/80 bg-white/80 shadow-[0_12px_40px_-28px_rgba(15,23,42,0.2)] dark:border-slate-800 dark:bg-slate-950/70">
      <div class="px-4 py-4">
        <div class="min-w-0">
          <h2 class="text-sm font-black tracking-tight text-default">Danger zone</h2>
          <p class="text-xs text-muted">Reset demo data or sign out from this device.</p>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-2 border-t border-slate-200/80 px-4 py-4 dark:border-slate-800">
        <UButton class="h-12 min-w-0 rounded-2xl px-2 text-xs sm:px-4 sm:text-sm" color="rose" variant="soft" @click="resetDemoData">
          Reset
        </UButton>

        <UButton class="h-12 min-w-0 rounded-2xl px-2 text-xs sm:px-4 sm:text-sm" color="neutral" variant="soft" icon="i-lucide-log-out">
          Logout
        </UButton>
      </div>
    </section>

  </div>
</template>
