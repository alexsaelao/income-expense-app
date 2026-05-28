<script setup lang="ts">
import { useMoneyNote } from '~/composables/useMoneyNote'
import type { CurrencyCode, WalletColor } from '~/composables/useMoneyNote'

const { wallets, currencyBalances, formatCurrency, addWallet, enabledCurrencyOptions, walletColorOptions } = useMoneyNote()
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

const walletModalOpen = ref(false)
const sheetDragY = ref(0)
const sheetDragging = ref(false)
const sheetDragStartY = ref(0)
const sheetPointerId = ref<number | null>(null)
const sheetHandleRef = ref<HTMLElement | null>(null)
const form = reactive({
  name: '',
  currency: 'LAK' as CurrencyCode,
  openingBalance: '',
  note: '',
  emoji: '💳',
  color: 'sky' as WalletColor
})

const currencyCards = computed(() => currencyBalances.value)

watch(
  enabledCurrencyOptions,
  () => {
    if (!enabledCurrencyOptions.value.some(item => item.value === form.currency)) {
      form.currency = enabledCurrencyOptions.value[0]?.value ?? 'LAK'
    }
  },
  { immediate: true }
)

function submitWallet() {
  if (!form.name || !form.openingBalance) return
  addWallet({
    name: form.name,
    currency: form.currency,
    openingBalance: Number(form.openingBalance),
    note: form.note,
    emoji: form.emoji,
    color: form.color
  })

  form.name = ''
  form.currency = 'LAK'
  form.openingBalance = ''
  form.note = ''
  form.emoji = '💳'
  form.color = 'sky'
  walletModalOpen.value = false
}

function resetSheetDrag() {
  sheetDragY.value = 0
  sheetDragging.value = false
  sheetDragStartY.value = 0
  sheetPointerId.value = null
}

function onSheetPointerDown(event: PointerEvent) {
  if (event.pointerType === 'mouse' && event.button !== 0) return

  sheetHandleRef.value?.setPointerCapture(event.pointerId)
  sheetDragging.value = true
  sheetDragStartY.value = event.clientY
  sheetPointerId.value = event.pointerId
}

function onSheetPointerMove(event: PointerEvent) {
  if (!sheetDragging.value || sheetPointerId.value !== event.pointerId) return

  const deltaY = Math.max(0, event.clientY - sheetDragStartY.value)
  sheetDragY.value = deltaY
}

function onSheetPointerUp(event: PointerEvent) {
  if (!sheetDragging.value || sheetPointerId.value !== event.pointerId) return

  sheetHandleRef.value?.releasePointerCapture(event.pointerId)
  const shouldClose = sheetDragY.value > 90
  walletModalOpen.value = !shouldClose
  resetSheetDrag()
}

function onSheetPointerCancel() {
  if (sheetPointerId.value !== null) {
    sheetHandleRef.value?.releasePointerCapture(sheetPointerId.value)
  }
  resetSheetDrag()
}
</script>

<template>
  <div class="space-y-5 pb-4">
    <section class="flex items-start justify-between gap-3">
      <div>
        <h1 class="text-3xl font-black tracking-tight text-default">Wallets</h1>
      </div>

      <UButton
        icon="i-lucide-plus"
        size="lg"
        class="rounded-[1.25rem] border-0 bg-gradient-to-r from-sky-500 to-cyan-400 px-4 font-bold text-white shadow-[0_18px_35px_-22px_rgba(14,165,233,0.65)] transition hover:from-sky-600 hover:to-cyan-500 active:scale-95"
        @click="walletModalOpen = true"
      >
        Add wallet
      </UButton>
    </section>

    <section class="space-y-2">
      <div class="flex items-center justify-between">
        <div class="min-w-0">
          <h2 class="text-base font-black tracking-tight text-default">Summary</h2>
          <p class="mt-1 text-[11px] text-muted">Total amount by currency</p>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-3">
      <MetricCard
        v-for="item in currencyCards"
        :key="item.currency"
        :title="item.currency"
        :value="formatCurrency(item.balance, item.currency)"
        detail="Total amount"
        :icon-text="currencySymbols[item.currency]"
        :accent="currencyAccents[item.currency]"
        value-class="text-[clamp(1rem,4vw,1.38rem)]"
      />
      </div>
    </section>

    <section class="space-y-2">
      <div class="flex items-center justify-between">
        <div class="min-w-0">
          <h2 class="text-base font-black tracking-tight text-default">All wallets</h2>
          <p class="mt-1 text-[11px] text-muted">{{ wallets.length }} wallets</p>
        </div>
        <NuxtLink to="/reports" class="text-sm font-semibold text-primary">Reports</NuxtLink>
      </div>

      <div class="space-y-2">
        <WalletCard
          v-for="wallet in wallets"
          :key="wallet.id"
          :wallet="wallet"
          :amount-label="formatCurrency(wallet.balance, wallet.currency)"
          :detail="wallet.note"
          compact
          :href="`/wallets/${wallet.id}`"
        />
      </div>
    </section>

    <USlideover
      v-model:open="walletModalOpen"
      side="bottom"
      :close="false"
      :ui="{
        content: 'w-full data-[state=open]:animate-[slide-in-from-bottom_220ms_ease-out] data-[state=closed]:animate-[slide-out-to-bottom_220ms_ease-in] data-[state=open]:rounded-t-[1.5rem] data-[state=closed]:rounded-t-[1.5rem] overflow-hidden border border-slate-200/80 bg-white shadow-[0_-18px_60px_-30px_rgba(15,23,42,0.35)] dark:border-slate-800 dark:bg-slate-950 md:mx-auto md:mb-4 md:w-[min(30rem,calc(100%-2rem))] md:rounded-[1.5rem]',
        body: 'p-0',
        footer: 'p-0',
        header: 'p-0',
      }"
      @after:leave="resetSheetDrag"
    >
      <template #content="{ close }">
        <div
          class="max-h-[88svh] overflow-hidden"
          :style="{ transform: `translateY(${sheetDragY}px)`, transition: sheetDragging ? 'none' : 'transform 180ms ease-out' }"
        >
          <div class="border-b border-slate-200/80 px-4 pb-3 pt-2 dark:border-slate-800">
            <div
              ref="sheetHandleRef"
              class="touch-none select-none cursor-grab active:cursor-grabbing"
              @pointerdown="onSheetPointerDown"
              @pointermove="onSheetPointerMove"
              @pointerup="onSheetPointerUp"
              @pointercancel="onSheetPointerCancel"
            >
              <div class="mx-auto mb-2 h-1.5 w-12 rounded-full bg-slate-300/80 dark:bg-slate-700" />
            </div>

            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <p class="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Add wallet</p>
                <h2 class="mt-1 text-lg font-black tracking-tight text-default">New wallet</h2>
              </div>

              <button
                type="button"
                class="flex size-9 items-center justify-center rounded-full bg-slate-100 text-muted transition active:scale-95 dark:bg-slate-900"
                aria-label="Close wallet sheet"
                @click="close()"
              >
                <UIcon name="i-lucide-x" class="size-4" />
              </button>
            </div>
          </div>

          <div class="max-h-[calc(88svh-4.5rem)] overflow-y-auto px-4 py-4 pb-[calc(env(safe-area-inset-bottom)+7rem)]">
            <div class="space-y-4">
              <label class="block">
                <div class="mb-2 flex items-center gap-2">
                  <div class="flex size-8 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600 shadow-sm dark:bg-sky-950/40 dark:text-sky-200">
                    <UIcon name="i-lucide-wallet" class="size-3.5" />
                  </div>
                  <span class="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">Wallet name</span>
                </div>
                <div class="flex items-center gap-3">
                  <UInput
                    v-model="form.name"
                    class="w-full rounded-2xl [&>input]:h-12 [&>input]:w-full [&>input]:rounded-2xl [&>input]:border-0 [&>input]:bg-slate-50 [&>input]:px-4 [&>input]:text-[16px] [&>input]:font-semibold [&>input]:shadow-none dark:[&>input]:bg-slate-950"
                    placeholder="Everyday cash"
                  />
                </div>
              </label>

              <label class="block">
                <div class="mb-2 flex items-center gap-2">
                  <div class="flex size-8 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600 shadow-sm dark:bg-sky-950/40 dark:text-sky-200">
                    <UIcon name="i-lucide-coins" class="size-3.5" />
                  </div>
                  <span class="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">Currency</span>
                </div>
                <div class="flex items-center gap-3">
                  <div class="relative min-w-0 flex-1">
                    <select
                      v-model="form.currency"
                      class="h-12 w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-4 pr-11 text-[16px] font-semibold text-default shadow-none outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-800 dark:bg-slate-950"
                    >
                      <option v-for="item in enabledCurrencyOptions" :key="item.value" :value="item.value">{{ item.label }}</option>
                    </select>
                    <UIcon
                      name="i-lucide-chevron-down"
                      class="pointer-events-none absolute end-4 top-1/2 size-4 -translate-y-1/2 text-muted"
                    />
                  </div>
                </div>
              </label>

              <label class="block">
                <div class="mb-2 flex items-center gap-2">
                  <div class="flex size-8 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600 shadow-sm dark:bg-sky-950/40 dark:text-sky-200">
                    <UIcon name="i-lucide-banknote" class="size-3.5" />
                  </div>
                  <span class="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">Opening balance</span>
                </div>
                <div class="flex items-center gap-3">
                  <UInput
                    v-model="form.openingBalance"
                    class="w-full rounded-2xl [&>input]:h-12 [&>input]:w-full [&>input]:rounded-2xl [&>input]:border-0 [&>input]:bg-slate-50 [&>input]:px-4 [&>input]:text-[16px] [&>input]:font-semibold [&>input]:tabular-nums [&>input]:shadow-none dark:[&>input]:bg-slate-950"
                    type="number"
                    inputmode="decimal"
                    step="0.01"
                    placeholder="0"
                  />
                </div>
              </label>

              <div class="block">
                <div class="mb-2 flex items-center gap-2">
                  <div class="flex size-8 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600 shadow-sm dark:bg-sky-950/40 dark:text-sky-200">
                    <UIcon name="i-lucide-palette" class="size-3.5" />
                  </div>
                  <span class="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">Color</span>
                </div>
                <div class="grid grid-cols-4 gap-2 sm:grid-cols-6">
                  <button
                    v-for="item in walletColorOptions"
                    :key="item.value"
                    type="button"
                    class="group relative flex flex-col items-center gap-1.5 rounded-2xl border px-2.5 py-2 text-center transition active:scale-95"
                    :class="form.color === item.value
                      ? 'border-primary bg-primary/10 ring-2 ring-primary/20'
                      : 'border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/60'"
                    @click="form.color = item.value"
                  >
                    <span
                      class="flex size-8 items-center justify-center rounded-full bg-gradient-to-br text-white shadow-sm"
                      :class="item.accent"
                    >
                      <UIcon v-if="form.color === item.value" name="i-lucide-check" class="size-4" />
                    </span>
                    <span class="text-[10px] font-semibold leading-none text-default">{{ item.label }}</span>
                  </button>
                </div>
              </div>

              <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label class="block">
                  <div class="mb-2 flex items-center gap-2">
                    <div class="flex size-8 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600 shadow-sm dark:bg-sky-950/40 dark:text-sky-200">
                      <UIcon name="i-lucide-sparkles" class="size-3.5" />
                    </div>
                    <span class="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">Emoji</span>
                  </div>
                  <div class="flex items-center gap-3">
                  <UInput
                      v-model="form.emoji"
                      class="w-full rounded-2xl [&>input]:h-12 [&>input]:w-full [&>input]:rounded-2xl [&>input]:border-0 [&>input]:bg-slate-50 [&>input]:px-4 [&>input]:text-[16px] [&>input]:font-semibold [&>input]:shadow-none dark:[&>input]:bg-slate-950"
                      autocapitalize="off"
                      autocomplete="off"
                      enterkeyhint="done"
                      inputmode="text"
                      spellcheck="false"
                      lang="en"
                      maxlength="2"
                      placeholder="💳"
                    />
                  </div>
                </label>

                <label class="block">
                  <div class="mb-2 flex items-center gap-2">
                    <div class="flex size-8 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600 shadow-sm dark:bg-sky-950/40 dark:text-sky-200">
                      <UIcon name="i-lucide-sticky-note" class="size-3.5" />
                    </div>
                    <span class="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">Note</span>
                  </div>
                  <div class="flex items-start gap-3">
                  <UTextarea
                      v-model="form.note"
                      class="w-full rounded-2xl [&>textarea]:min-h-[96px] [&>textarea]:w-full [&>textarea]:rounded-2xl [&>textarea]:border-0 [&>textarea]:bg-slate-50 [&>textarea]:px-4 [&>textarea]:py-3 [&>textarea]:text-[16px] [&>textarea]:font-medium [&>textarea]:leading-6 [&>textarea]:shadow-none dark:[&>textarea]:bg-slate-950"
                      :rows="3"
                      autoresize
                      placeholder="Optional note"
                    />
                  </div>
                </label>
              </div>
            </div>

            <div class="h-8" aria-hidden="true" />
          </div>

          <div class="sticky bottom-0 shrink-0 border-t border-slate-200/80 bg-white/96 px-4 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/96">
            <div class="flex w-full gap-3">
              <UButton
                variant="soft"
                color="neutral"
                class="h-12 flex-1 justify-center rounded-full text-center font-bold"
                icon="i-lucide-x"
                @click="close()"
              >
                Cancel
              </UButton>
              <UButton
                class="h-12 flex-1 justify-center rounded-full bg-gradient-to-r from-sky-500 to-cyan-400 text-center font-bold text-white shadow-[0_18px_35px_-22px_rgba(14,165,233,0.55)] transition hover:from-sky-600 hover:to-cyan-500 active:scale-95"
                icon="i-lucide-check"
                @click="submitWallet"
              >
                Save wallet
              </UButton>
            </div>
          </div>
        </div>
      </template>
    </USlideover>
  </div>
</template>
