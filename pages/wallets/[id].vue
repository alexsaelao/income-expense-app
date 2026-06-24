<script setup lang="ts">
import { nextTick } from 'vue'
import type { WalletColor } from '~/composables/useMoneyNote'
import { useMoneyNote, walletColorOptions } from '~/composables/useMoneyNote'

const route = useRoute()
const router = useRouter()
const { selectedLanguage } = useAppLanguage()
const { activeTheme } = useAppThemeColor()
const {
  wallets,
  getWallet,
  walletMonthTotals,
  formatCurrency,
  formatCurrencyOrDash,
  hasWalletTransactions,
  transactions,
  formatDate,
  typeLabel,
  typeIcon,
  typeTint,
  updateWallet,
  removeWallet,
  canEditMoneyData
} = useMoneyNote()

const wallet = computed(() => getWallet(String(route.params.id)))
const summary = computed(() => wallet.value ? walletMonthTotals(wallet.value.id) : null)
const walletTransactions = computed(() =>
  transactions.value.filter(transaction => transaction.walletId === wallet.value?.id || transaction.toWalletId === wallet.value?.id)
)
const walletTransactionCount = computed(() => walletTransactions.value.length)
const walletHasActivity = computed(() => wallet.value ? hasWalletTransactions(wallet.value.id) : false)
const walletManageOpen = ref(false)
const walletDeleteOpen = ref(false)
const walletFormError = ref('')
const walletForm = reactive({
  name: '',
  emoji: '💳',
  color: 'sky' as WalletColor,
  note: ''
})

const walletAccentMap = Object.fromEntries(walletColorOptions.map(item => [item.value, item.accent])) as Record<WalletColor, string>

function resolveActionErrorMessage(error: unknown) {
  const maybeResponse = error as {
    data?: { statusMessage?: string; message?: string }
    message?: string
    statusMessage?: string
  }

  return maybeResponse?.data?.statusMessage
    || maybeResponse?.data?.message
    || maybeResponse?.statusMessage
    || maybeResponse?.message
    || 'Unable to save wallet'
}

const walletCopy = computed(() => {
  if (selectedLanguage.value === 'lo') {
    return {
      walletNotFound: 'ບໍ່ພົບກະເປົ໋າ',
      walletMissingDesc: 'ກະເປົ໋າອາດຖືກລຶບແລ້ວ ຫຼືລິ້ງບໍ່ຖືກຕ້ອງ.',
      backToWallets: 'ກັບໄປກະເປົ໋າ',
      manageWallet: 'ຈັດການ',
      editWallet: 'ແກ້ໄຂກະເປົ໋າ',
      walletName: 'ຊື່ກະເປົ໋າ',
      emoji: 'ອີໂມຈິ',
      color: 'ສີ',
      note: 'ຫມາຍເຫດ',
      saveChanges: 'ບັນທຶກການແກ້ໄຂ',
      deleteWallet: 'ລຶບກະເປົ໋າ',
      deleteTitle: 'ລຶບກະເປົ໋າ?',
      deleteEmptyDesc: 'ກະເປົ໋ານີ້ວ່າງ ແລະລຶບໄດ້ເລີຍ.',
      deleteWithTxDesc: (count: number) => `ກະເປົ໋ານີ້ມີ ${count} ລາຍການ. ລຶບແລ້ວລາຍການໃນກະເປົ໋ານີ້ຈະຖືກລຶບດ້ວຍ.`,
      confirmDelete: 'ລຶບກະເປົ໋າ',
      currentBalance: 'ຍອດໃນປັດຈຸບັນ',
      income: 'ລາຍຮັບ',
      expense: 'ລາຍຈ່າຍ',
      net: 'ສຸດທິ',
      transactions: 'ທຸລະກຳ',
      items: (count: number) => `${count} ລາຍການ`,
      updateFailed: 'ຊື່ກະເປົ໋າມີຢູ່ແລ້ວ ຫຼືບໍ່ວ່າງ.',
      noWallet: 'ບໍ່ມີກະເປົ໋າ'
    }
  }

  return {
    walletNotFound: 'Wallet not found',
    walletMissingDesc: 'The wallet may have been removed or the link is invalid.',
    backToWallets: 'Back to wallets',
    manageWallet: 'Manage',
    editWallet: 'Edit wallet',
    walletName: 'Wallet name',
    emoji: 'Emoji',
    color: 'Color',
    note: 'Note',
    saveChanges: 'Save changes',
    deleteWallet: 'Delete wallet',
    deleteTitle: 'Delete wallet?',
    deleteEmptyDesc: 'This wallet is empty, so it can be deleted right away.',
    deleteWithTxDesc: (count: number) => `This wallet has ${count} transactions. Deleting it will also remove those transactions from your records.`,
    confirmDelete: 'Delete wallet',
    currentBalance: 'Current balance',
    income: 'Income',
    expense: 'Expense',
    net: 'Net',
    transactions: 'Transactions',
    items: (count: number) => `${count} items`,
    updateFailed: 'Wallet name already exists or is empty.',
    noWallet: 'No wallet'
  }
})

function openWalletManager() {
  if (!wallet.value || !canEditMoneyData.value) return

  walletForm.name = wallet.value.name
  walletForm.emoji = wallet.value.emoji
  walletForm.color = wallet.value.color
  walletForm.note = wallet.value.note ?? ''
  walletFormError.value = ''
  walletManageOpen.value = true
}

function closeWalletManager() {
  walletManageOpen.value = false
  walletFormError.value = ''
}

function openDeleteWalletConfirm() {
  walletManageOpen.value = false
  walletDeleteOpen.value = false

  nextTick(() => {
    walletDeleteOpen.value = true
  })
}

function closeDeleteWalletConfirm() {
  walletDeleteOpen.value = false
}

async function submitWalletUpdate() {
  if (!wallet.value || !canEditMoneyData.value) return

  const nextName = walletForm.name.trim()
  if (!nextName) {
    walletFormError.value = walletCopy.value.updateFailed
    return
  }

  const duplicate = wallets.value.some(item => item.id !== wallet.value?.id && item.name.trim().toLowerCase() === nextName.toLowerCase())
  if (duplicate) {
    walletFormError.value = walletCopy.value.updateFailed
    return
  }

  try {
    await updateWallet(wallet.value.id, {
      name: nextName,
      emoji: walletForm.emoji.trim() || wallet.value.emoji,
      color: walletForm.color,
      note: walletForm.note.trim() || undefined
    })

    closeWalletManager()
  }
  catch (error) {
    walletFormError.value = resolveActionErrorMessage(error)
  }
}

async function confirmDeleteWallet() {
  if (!wallet.value || !canEditMoneyData.value) return

  try {
    await removeWallet(wallet.value.id)
    closeDeleteWalletConfirm()
    router.push('/wallets')
  }
  catch (error) {
    walletFormError.value = resolveActionErrorMessage(error)
    walletDeleteOpen.value = false
    walletManageOpen.value = true
  }
}
</script>

<template>
  <div class="space-y-5 pb-4">
    <section class="flex items-start justify-between gap-3">
      <div class="min-w-0">
        <h1 class="mt-1 text-3xl font-black tracking-tight text-default">{{ wallet?.name ?? walletCopy.walletNotFound }}</h1>
      </div>

      <div class="flex shrink-0 items-center gap-2">
        <UButton icon="i-lucide-arrow-left" variant="ghost" color="neutral" size="lg" class="rounded-2xl" to="/wallets" />
      </div>
    </section>

    <UCard v-if="wallet" class="overflow-hidden rounded-[1.4rem] border border-white/60 bg-white/90 shadow-[0_18px_50px_-24px_rgba(15,23,42,0.22)] dark:border-white/10 dark:bg-slate-950/80">
      <div class="flex items-start gap-4">
        <div :class="['flex size-16 items-center justify-center rounded-[1.5rem] bg-gradient-to-br text-3xl shadow-lg', wallet.accent]">{{ wallet.emoji }}</div>
        <div class="min-w-0 flex-1">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <p class="text-xs font-semibold uppercase tracking-[0.26em] text-muted">{{ walletCopy.currentBalance }}</p>
              <p class="mt-1 text-[clamp(1.4rem,4.6vw,2.05rem)] font-black tracking-tight text-default">{{ formatCurrencyOrDash(wallet.balance, wallet.currency, walletHasActivity, true) }}</p>
            </div>

            <UButton
              v-if="canEditMoneyData"
              icon="i-lucide-pencil-line"
              size="sm"
              :class="['h-9 shrink-0 rounded-full bg-gradient-to-r px-3 text-xs font-bold text-white shadow-[0_14px_28px_-18px_rgba(14,165,233,0.65)] transition active:scale-95', activeTheme.accent]"
              @click="openWalletManager"
            >
              {{ walletCopy.manageWallet }}
            </UButton>
            <UBadge v-else color="neutral" variant="soft" class="rounded-full px-3">
              View only
            </UBadge>
          </div>

          <p class="mt-2 text-sm text-muted">{{ wallet.note }}</p>
        </div>
      </div>

      <div class="mt-5 grid grid-cols-1 gap-3">
        <MetricCard :title="walletCopy.income" :value="formatCurrency(summary?.income ?? 0, wallet.currency)" icon="i-lucide-trending-up" accent="from-emerald-500 to-teal-400" />
        <MetricCard :title="walletCopy.expense" :value="formatCurrency(summary?.expense ?? 0, wallet.currency)" icon="i-lucide-trending-down" accent="from-rose-500 to-pink-400" />
        <MetricCard :title="walletCopy.net" :value="formatCurrency(summary?.net ?? 0, wallet.currency, true)" icon="i-lucide-badge-dollar-sign" />
      </div>
    </UCard>

    <section class="space-y-3">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-black tracking-tight text-default">{{ walletCopy.transactions }}</h2>
        <span class="text-sm text-muted">{{ walletCopy.items(walletTransactions.length) }}</span>
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
      <h2 class="mt-4 text-lg font-black text-default">{{ walletCopy.walletNotFound }}</h2>
      <p class="mt-2 text-sm text-muted">{{ walletCopy.walletMissingDesc }}</p>
      <UButton class="mt-5 rounded-2xl" to="/wallets">{{ walletCopy.backToWallets }}</UButton>
    </UCard>

    <USlideover
      v-model:open="walletManageOpen"
      side="bottom"
      :close="true"
      :ui="{
        content: 'w-full data-[state=open]:animate-[slide-in-from-bottom_220ms_ease-out] data-[state=closed]:animate-[slide-out-to-bottom_220ms_ease-in] data-[state=open]:rounded-t-[1.5rem] data-[state=closed]:rounded-t-[1.5rem] overflow-hidden border border-slate-200/80 bg-white shadow-[0_-18px_60px_-30px_rgba(15,23,42,0.35)] dark:border-slate-800 dark:bg-slate-950',
        body: 'p-0',
        footer: 'p-0',
        header: 'p-0'
      }"
    >
      <template #content="{ close }">
        <div class="flex max-h-[88svh] flex-col overflow-hidden">
          <div class="border-b border-slate-200/80 px-4 pb-3 pt-2 dark:border-slate-800">
            <div class="mx-auto mb-2 h-1.5 w-12 rounded-full bg-slate-300/80 dark:bg-slate-700" />
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <p class="text-xs font-semibold uppercase tracking-[0.18em] text-muted">{{ walletCopy.manageWallet }}</p>
                <h2 class="mt-1 text-lg font-black tracking-tight text-default">{{ wallet?.name ?? walletCopy.noWallet }}</h2>
                <p class="mt-1 text-[11px] text-muted">{{ walletCopy.editWallet }}</p>
              </div>

              <button
                type="button"
                class="flex size-9 items-center justify-center rounded-full bg-slate-100 text-muted transition active:scale-95 dark:bg-slate-900"
                :aria-label="walletCopy.manageWallet"
                @click="closeWalletManager(); close()"
              >
                <UIcon name="i-lucide-x" class="size-4" />
              </button>
            </div>
          </div>

          <div class="min-h-0 flex-1 overflow-y-auto px-4 py-4 pb-4">
            <div class="space-y-4">
              <div>
                <div class="flex items-center gap-2">
                  <div class="flex size-9 items-center justify-center rounded-full bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-200">
                    <UIcon name="i-lucide-wallet" class="size-4.5" />
                  </div>
                  <p class="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted sm:text-[11px]">{{ walletCopy.walletName }}</p>
                </div>

                <UInput
                  v-model="walletForm.name"
                  :placeholder="walletCopy.walletName"
                  class="mt-3 w-full rounded-2xl [&>input]:h-12 [&>input]:w-full [&>input]:rounded-2xl [&>input]:border-0 [&>input]:bg-slate-50 [&>input]:px-4 [&>input]:text-[16px] [&>input]:font-semibold [&>input]:shadow-none dark:[&>input]:bg-slate-950"
                />
              </div>

              <div>
                <div class="flex items-center gap-2">
                  <div class="flex size-9 items-center justify-center rounded-full bg-cyan-50 text-cyan-600 dark:bg-cyan-950/40 dark:text-cyan-200">
                    <UIcon name="i-lucide-smile-plus" class="size-4.5" />
                  </div>
                  <p class="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted sm:text-[11px]">{{ walletCopy.emoji }}</p>
                </div>

                <UInput
                  v-model="walletForm.emoji"
                  class="mt-3 w-full rounded-2xl [&>input]:h-12 [&>input]:w-full [&>input]:rounded-2xl [&>input]:border-0 [&>input]:bg-slate-50 [&>input]:px-4 [&>input]:text-[16px] [&>input]:font-semibold [&>input]:shadow-none dark:[&>input]:bg-slate-950"
                />
              </div>

              <div>
                <div class="flex items-center gap-2">
                  <div class="flex size-9 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-200">
                    <UIcon name="i-lucide-palette" class="size-4.5" />
                  </div>
                  <p class="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted sm:text-[11px]">{{ walletCopy.color }}</p>
                </div>

                <div class="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-4">
                  <button
                    v-for="item in walletColorOptions"
                    :key="item.value"
                    type="button"
                    class="flex flex-col items-center gap-1.5 rounded-[1rem] border px-2 py-2 text-[11px] font-semibold transition active:scale-[0.98]"
                    :class="walletForm.color === item.value ? 'border-primary bg-primary/10 text-primary' : 'border-slate-200 bg-white text-muted dark:border-slate-800 dark:bg-slate-950'"
                    @click="walletForm.color = item.value"
                  >
                    <span class="flex size-7 items-center justify-center rounded-full bg-gradient-to-br text-white" :class="walletAccentMap[item.value]">
                      <UIcon name="i-lucide-swatch-book" class="size-3.5" />
                    </span>
                    {{ item.label }}
                  </button>
                </div>
              </div>

              <div>
                <div class="flex items-center gap-2">
                  <div class="flex size-9 items-center justify-center rounded-full bg-pink-50 text-pink-600 dark:bg-pink-950/40 dark:text-pink-200">
                    <UIcon name="i-lucide-notepad-text" class="size-4.5" />
                  </div>
                  <p class="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted sm:text-[11px]">{{ walletCopy.note }}</p>
                </div>

                <UTextarea
                  v-model="walletForm.note"
                  :placeholder="walletCopy.note"
                  :rows="4"
                  autoresize
                  class="mt-3 shadow-none"
                  :class="'w-full rounded-2xl [&>textarea]:min-h-[96px] [&>textarea]:w-full [&>textarea]:rounded-2xl [&>textarea]:border-0 [&>textarea]:bg-slate-50 [&>textarea]:px-4 [&>textarea]:py-3 [&>textarea]:text-[16px] [&>textarea]:font-medium [&>textarea]:leading-6 [&>textarea]:shadow-none dark:[&>textarea]:bg-slate-950'"
                />
              </div>

              <p v-if="walletFormError" class="rounded-[1rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-100">
                {{ walletFormError }}
              </p>
            </div>
          </div>

          <div class="border-t border-slate-200/80 bg-white/92 px-4 py-3 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/90">
            <div class="grid gap-2">
              <UButton
                v-if="canEditMoneyData"
                :class="['h-12 justify-center rounded-full bg-gradient-to-r text-center text-sm font-extrabold text-white shadow-[0_14px_32px_-18px_rgba(14,165,233,0.75)] transition active:scale-[0.98]', activeTheme.accent]"
                icon="i-lucide-check"
                @click="submitWalletUpdate"
              >
                {{ walletCopy.saveChanges }}
              </UButton>

              <UButton
                v-if="canEditMoneyData"
                color="rose"
                variant="soft"
                class="h-12 justify-center rounded-full text-center text-sm font-bold"
                icon="i-lucide-trash-2"
                @click="openDeleteWalletConfirm"
              >
                {{ walletCopy.deleteWallet }}
              </UButton>
            </div>
          </div>
        </div>
      </template>
    </USlideover>

    <UModal v-model="walletDeleteOpen">
      <template #body>
        <div v-if="wallet" class="space-y-4">
          <div class="flex items-start gap-3">
            <div class="flex size-11 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-200">
              <UIcon name="i-lucide-trash-2" class="size-5" />
            </div>
            <div class="min-w-0">
              <p class="text-xs font-semibold uppercase tracking-[0.18em] text-muted">{{ walletCopy.deleteTitle }}</p>
              <h3 class="mt-1 text-lg font-black tracking-tight text-default">{{ wallet.name }}</h3>
              <p class="mt-1 text-[12px] text-muted">
                {{ walletTransactionCount > 0 ? walletCopy.deleteWithTxDesc(walletTransactionCount) : walletCopy.deleteEmptyDesc }}
              </p>
            </div>
          </div>
        </div>
      </template>

      <template #footer>
        <div class="flex w-full gap-3">
          <UButton
            variant="soft"
            color="neutral"
            class="h-12 flex-1 justify-center rounded-full text-center font-bold"
            icon="i-lucide-x"
            @click="walletDeleteOpen = false"
          >
            {{ walletCopy.backToWallets }}
          </UButton>
          <UButton
            color="rose"
            class="h-12 flex-1 justify-center rounded-full text-center font-bold text-white"
            icon="i-lucide-trash-2"
            @click="confirmDeleteWallet"
          >
            {{ walletCopy.confirmDelete }}
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>
