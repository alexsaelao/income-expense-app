<script setup lang="ts">
import { useMoneyNote } from '~/composables/useMoneyNote'
import type { CurrencyCode, WalletColor } from '~/composables/useMoneyNote'

const { selectedLanguage } = useAppLanguage()
const { activeTheme } = useAppThemeColor()
const {
  wallets,
  walletEntries,
  currencyBalances,
  walletMonthTotals,
  formatCurrency,
  formatCurrencyOrDash,
  addWallet,
  enabledCurrencyOptions,
  walletColorOptions,
  hasCurrencyTransactions,
  hasWalletTransactions,
  setWalletPinned,
  moveWallet,
  canEditMoneyData
} = useMoneyNote()
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

const walletCopy = computed(() => {
  if (selectedLanguage.value === 'lo') {
    return {
      title: 'ກະເປົ໋າເງິນ',
      addWallet: 'ເພີ່ມກະເປົ໋າ',
      summary: 'ສະຫຼຸບ',
      summaryDesc: 'ຍອດລວມຕາມເງິນຕາ',
      totalAmount: 'ຍອດລວມ',
      allWallets: 'ກະເປົ໋າທັງໝົດ',
      walletCount: (count: number) => `${count} ກະເປົ໋າ`,
      addWalletSheet: 'ເພີ່ມກະເປົ໋າ',
      newWallet: 'ກະເປົ໋າໃໝ່',
      walletName: 'ຊື່ກະເປົ໋າ',
      currency: 'ເງິນຕາ',
      openingBalance: 'ຍອດເລີ່ມຕົ້ນ',
      color: 'ສີ',
      emoji: 'ອີໂມຈິ',
      note: 'ຫມາຍເຫດ',
      pin: 'ປັກໝຸດ',
      unpin: 'ຖອນປັກໝຸດ',
      drag: 'ລາກຈັດລຳດັບ',
      total: 'ຍອດລວມ',
      net: 'ສຸດທິ',
      saveWallet: 'ບັນທຶກກະເປົ໋າ',
      cancel: 'ຍົກເລີກ',
      everydayCash: 'ເງິນສົດປະຈໍາວັນ',
      optionalNote: 'ຫມາຍເຫດເພີ່ມເຕີມ'
    }
  }

  return {
    title: 'Wallets',
    addWallet: 'Add wallet',
    summary: 'Summary',
    summaryDesc: 'Total amount by currency',
    totalAmount: 'Total amount',
    allWallets: 'All wallets',
    walletCount: (count: number) => `${count} wallets`,
    addWalletSheet: 'Add wallet',
    newWallet: 'New wallet',
    walletName: 'Wallet name',
    currency: 'Currency',
    openingBalance: 'Opening balance',
    color: 'Color',
    emoji: 'Emoji',
    note: 'Note',
    pin: 'Pin',
    unpin: 'Unpin',
    drag: 'Drag to sort',
    total: 'Total',
    net: 'Net',
    saveWallet: 'Save wallet',
    cancel: 'Cancel',
    everydayCash: 'Everyday cash',
    optionalNote: 'Optional note'
  }
})

const walletList = computed(() => walletEntries())
const walletModalOpen = ref(false)
const dragState = reactive({
  key: ''
})
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
  if (!canEditMoneyData.value) return
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

function walletKeyForItem(item: any) {
  return item.key ?? `wallet:${item.id}`
}

function walletSummary(walletId: string) {
  return walletMonthTotals(walletId)
}

function togglePinned(item: any) {
  setWalletPinned(item.id, !item.pinned)
}

function onWalletDragStart(item: any, event: DragEvent) {
  if (!event.dataTransfer) return

  dragState.key = walletKeyForItem(item)
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('text/plain', dragState.key)
}

function onWalletDrop(item: any) {
  const fromKey = dragState.key
  const toKey = walletKeyForItem(item)

  if (fromKey && fromKey !== toKey) {
    moveWallet(fromKey, toKey)
  }

  dragState.key = ''
}

function onWalletDragEnd() {
  dragState.key = ''
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
        <h1 class="text-3xl font-black tracking-tight text-default">{{ walletCopy.title }}</h1>
      </div>

      <UButton
        icon="i-lucide-plus"
        size="lg"
        :disabled="!canEditMoneyData"
        :to="canEditMoneyData ? undefined : '/settings'"
        :class="['rounded-[1.25rem] border-0 bg-gradient-to-r px-4 font-bold text-white shadow-[0_18px_35px_-22px_rgba(15,23,42,0.28)] transition active:scale-95', activeTheme.accent]"
        @click="walletModalOpen = true"
      >
        {{ walletCopy.addWallet }}
      </UButton>
    </section>

    <section class="space-y-2">
      <div class="flex items-center justify-between">
        <div class="min-w-0">
          <h2 class="text-base font-black tracking-tight text-default">{{ walletCopy.summary }}</h2>
          <p class="mt-1 text-[11px] text-muted">{{ walletCopy.summaryDesc }}</p>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-3">
      <MetricCard
        v-for="item in currencyCards"
        :key="item.currency"
        :title="item.currency"
        :value="formatCurrencyOrDash(item.balance, item.currency, hasCurrencyTransactions(item.currency), true)"
        :detail="walletCopy.totalAmount"
        :icon-text="currencySymbols[item.currency]"
        :accent="currencyAccents[item.currency]"
        value-class="text-[clamp(1rem,4vw,1.38rem)]"
      />
      </div>
    </section>

    <section class="space-y-2">
      <div class="flex items-center justify-between">
        <div class="min-w-0">
          <h2 class="text-base font-black tracking-tight text-default">{{ walletCopy.allWallets }}</h2>
          <p class="mt-1 text-[11px] text-muted">{{ walletCopy.walletCount(wallets.length) }}</p>
        </div>
      </div>

      <div class="space-y-2">
        <article
          v-for="wallet in walletList"
          :key="wallet.id"
          class="flex cursor-pointer items-start justify-between gap-3 rounded-[1.35rem] border border-slate-200/80 bg-white/80 px-4 py-4 shadow-[0_12px_34px_-24px_rgba(15,23,42,0.2)] transition active:scale-[0.99] dark:border-slate-800 dark:bg-slate-950/70"
          draggable="true"
          @click="navigateTo(`/wallets/${wallet.id}`)"
          @dragstart="onWalletDragStart(wallet, $event)"
          @dragover.prevent
          @drop.prevent="onWalletDrop(wallet)"
          @dragend="onWalletDragEnd"
        >
          <div class="flex min-w-0 items-center gap-3">
            <div
              class="flex size-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-white shadow-sm sm:size-12"
              :class="wallet.accent"
            >
              <span class="block translate-y-px text-lg leading-none sm:text-xl">{{ wallet.emoji }}</span>
            </div>

            <div class="min-w-0">
              <p class="truncate text-[15px] font-black text-default">{{ wallet.name }}</p>
              <div class="mt-1 flex flex-wrap items-center gap-1.5">
                <UBadge color="neutral" variant="soft" class="rounded-full px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-[0.14em] leading-none">
                  {{ wallet.currency }}
                </UBadge>
                <p class="truncate text-[10px] text-muted leading-none">{{ wallet.note ?? walletCopy.optionalNote }}</p>
                <UBadge
                  v-if="wallet.pinned"
                  color="primary"
                  variant="soft"
                  class="rounded-full px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-[0.14em] leading-none"
                >
                  {{ walletCopy.pin }}
                </UBadge>
              </div>
              <div class="mt-2 flex flex-wrap items-center gap-2">
                <span class="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                  <span class="uppercase tracking-[0.14em]">{{ walletCopy.total }}</span>
                  <span class="font-black text-[12px] text-default">{{ formatCurrencyOrDash(wallet.balance, wallet.currency, hasWalletTransactions(wallet.id), true) }}</span>
                </span>
                <span class="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2.5 py-1 text-[11px] font-semibold text-sky-700 dark:bg-sky-950/40 dark:text-sky-200">
                  <span class="uppercase tracking-[0.14em]">{{ walletCopy.net }}</span>
                  <span class="font-black text-[12px]">{{ formatCurrency(walletSummary(wallet.id).net, wallet.currency, true) }}</span>
                </span>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-1.5 self-center">
            <button
              type="button"
              class="inline-flex size-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition active:scale-95 dark:bg-slate-900 dark:text-slate-300 sm:size-9"
              :aria-label="wallet.pinned ? walletCopy.unpin : walletCopy.pin"
              @click.stop="togglePinned(wallet)"
            >
              <UIcon :name="wallet.pinned ? 'i-lucide-pin-off' : 'i-lucide-pin'" class="size-3.5 sm:size-4" />
            </button>

            <div
              class="inline-flex size-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-900 dark:text-slate-300 sm:size-9"
              :title="walletCopy.drag"
              @click.stop
            >
              <UIcon name="i-lucide-grip-vertical" class="size-3.5 sm:size-4" />
            </div>
          </div>
        </article>
      </div>
    </section>

    <USlideover
      v-model:open="walletModalOpen"
      side="bottom"
      :close="false"
      :ui="{
        content: 'w-full data-[state=open]:animate-[slide-in-from-bottom_220ms_ease-out] data-[state=closed]:animate-[slide-out-to-bottom_220ms_ease-in] data-[state=open]:rounded-t-[1.5rem] data-[state=closed]:rounded-t-[1.5rem] overflow-hidden border border-slate-200/80 bg-white shadow-[0_-18px_60px_-30px_rgba(15,23,42,0.35)] dark:border-slate-800 dark:bg-slate-950',
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
                <p class="text-xs font-semibold uppercase tracking-[0.18em] text-muted">{{ walletCopy.addWalletSheet }}</p>
                <h2 class="mt-1 text-lg font-black tracking-tight text-default">{{ walletCopy.newWallet }}</h2>
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
                  <span class="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">{{ walletCopy.walletName }}</span>
                </div>
                <div class="flex items-center gap-3">
                  <UInput
                    v-model="form.name"
                    class="w-full rounded-2xl [&>input]:h-12 [&>input]:w-full [&>input]:rounded-2xl [&>input]:border-0 [&>input]:bg-slate-50 [&>input]:px-4 [&>input]:text-[16px] [&>input]:font-semibold [&>input]:shadow-none dark:[&>input]:bg-slate-950"
                    :placeholder="walletCopy.everydayCash"
                  />
                </div>
              </label>

              <label class="block">
                <div class="mb-2 flex items-center gap-2">
                  <div class="flex size-8 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600 shadow-sm dark:bg-sky-950/40 dark:text-sky-200">
                    <UIcon name="i-lucide-coins" class="size-3.5" />
                  </div>
                  <span class="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">{{ walletCopy.currency }}</span>
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
                  <span class="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">{{ walletCopy.openingBalance }}</span>
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
                  <span class="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">{{ walletCopy.color }}</span>
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
                    <span class="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">{{ walletCopy.emoji }}</span>
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
                    <span class="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">{{ walletCopy.note }}</span>
                  </div>
                  <div class="flex items-start gap-3">
                  <UTextarea
                      v-model="form.note"
                      class="w-full rounded-2xl [&>textarea]:min-h-[96px] [&>textarea]:w-full [&>textarea]:rounded-2xl [&>textarea]:border-0 [&>textarea]:bg-slate-50 [&>textarea]:px-4 [&>textarea]:py-3 [&>textarea]:text-[16px] [&>textarea]:font-medium [&>textarea]:leading-6 [&>textarea]:shadow-none dark:[&>textarea]:bg-slate-950"
                      :rows="3"
                      autoresize
                      :placeholder="walletCopy.optionalNote"
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
                {{ walletCopy.cancel }}
              </UButton>
              <UButton
                :class="['h-12 flex-1 justify-center rounded-full bg-gradient-to-r text-center font-bold text-white shadow-[0_18px_35px_-22px_rgba(15,23,42,0.28)] transition active:scale-95', activeTheme.accent]"
                icon="i-lucide-check"
                @click="submitWallet"
              >
                {{ walletCopy.saveWallet }}
              </UButton>
            </div>
          </div>
        </div>
      </template>
    </USlideover>
  </div>
</template>
