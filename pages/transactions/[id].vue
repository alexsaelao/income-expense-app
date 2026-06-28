<script setup lang="ts">
import type { TransactionInput } from '~/composables/useMoneyNote'
import { useMoneyNote } from '~/composables/useMoneyNote'

const route = useRoute()
const router = useRouter()
const { transactionsHydrated, getTransaction, updateTransaction, removeTransaction, canEditMoneyData } = useMoneyNote()

const transactionFormRef = ref<{ canSubmit: boolean } | null>(null)
const transaction = computed(() => getTransaction(String(route.params.id)))
const isTransactionReady = computed(() => transactionsHydrated.value)
const pageError = ref('')
const isSubmitting = ref(false)

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
    || 'Unable to save changes'
}

async function handleSubmit(payload: TransactionInput) {
  if (!transaction.value) return
  if (isSubmitting.value) return

  isSubmitting.value = true
  pageError.value = ''

  try {
    await updateTransaction(transaction.value.id, payload)
    await router.push('/transactions')
  }
  catch (error) {
    pageError.value = resolveActionErrorMessage(error)
  }
  finally {
    isSubmitting.value = false
  }
}

async function handleDelete() {
  if (!transaction.value) return
  if (isSubmitting.value) return

  isSubmitting.value = true
  pageError.value = ''

  try {
    await removeTransaction(transaction.value.id)
    await router.push('/transactions')
  }
  catch (error) {
    pageError.value = resolveActionErrorMessage(error)
  }
  finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="space-y-5 pb-4">
    <section class="flex items-start justify-between gap-3">
      <div>
        <p class="text-sm font-medium text-muted">Edit mode</p>
        <h1 class="mt-1 text-3xl font-black tracking-tight text-default">Transaction details</h1>
        <p class="mt-2 text-sm leading-6 text-muted">Update the amount, wallet, note, or type in one place.</p>
      </div>

      <UButton
        icon="i-lucide-arrow-left"
        variant="ghost"
        color="neutral"
        size="lg"
        class="rounded-2xl"
        to="/transactions"
      />
    </section>

    <UCard v-if="!isTransactionReady" class="overflow-hidden border border-white/60 bg-white/85 p-8 text-center shadow-[0_18px_50px_-24px_rgba(15,23,42,0.2)] dark:border-white/10 dark:bg-slate-950/80">
      <div class="mx-auto flex size-14 items-center justify-center rounded-full bg-primary text-white shadow-[0_18px_35px_-22px_rgba(14,165,233,0.65)]">
        <UIcon name="i-lucide-loader-circle" class="size-7 animate-spin" />
      </div>
      <h2 class="mt-4 text-lg font-black text-default">Loading transaction...</h2>
    </UCard>

    <UCard v-else-if="transaction" class="overflow-hidden border border-white/60 bg-white/85 shadow-[0_18px_50px_-24px_rgba(15,23,42,0.2)] dark:border-white/10 dark:bg-slate-950/80">
      <template v-if="canEditMoneyData">
        <p v-if="pageError" class="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-100">
          {{ pageError }}
        </p>

        <div class="mb-5 flex items-center justify-between rounded-[1.5rem] bg-slate-100 p-4 dark:bg-slate-900">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.24em] text-muted">Transaction ID</p>
            <p class="mt-1 font-mono text-sm text-default">{{ transaction.id }}</p>
          </div>
          <UBadge color="primary" variant="soft" class="rounded-full">{{ transaction.currency }}</UBadge>
        </div>

        <TransactionForm
          ref="transactionFormRef"
          form-id="edit-transaction-form"
          mode="edit"
          :initial-transaction="transaction"
          :show-actions="false"
          :submitting="isSubmitting"
          submit-label="Save changes"
          @submit="handleSubmit"
          @delete="handleDelete"
        />
      </template>

      <div v-else class="rounded-[1.5rem] border border-amber-200 bg-amber-50/80 p-5 dark:border-amber-900/50 dark:bg-amber-950/25">
        <div class="flex items-start gap-3">
          <div class="flex size-11 shrink-0 items-center justify-center rounded-full bg-amber-500 text-white shadow-lg">
            <UIcon name="i-lucide-lock" class="size-5" />
          </div>
          <div class="min-w-0">
            <p class="text-sm font-black text-default">View only</p>
            <p class="mt-1 text-sm leading-6 text-muted">
              Upgrade to Pro to edit or delete transactions.
            </p>
          </div>
        </div>
      </div>
    </UCard>

    <UCard v-else class="border border-dashed border-slate-300 bg-white/70 p-8 text-center dark:border-slate-700 dark:bg-slate-950/70">
      <UIcon name="i-lucide-file-question" class="mx-auto size-10 text-muted" />
      <h2 class="mt-4 text-lg font-black text-default">Transaction not found</h2>
      <p class="mt-2 text-sm text-muted">The item may have been deleted already.</p>
      <UButton class="mt-5 rounded-2xl" to="/transactions">Back to history</UButton>
    </UCard>

    <section
      v-if="transaction && canEditMoneyData"
      class="fixed inset-x-0 z-40 border-t border-white/60 bg-white/95 px-4 py-3 shadow-[0_-16px_52px_-42px_rgba(15,23,42,0.45)] backdrop-blur-none dark:border-white/10 dark:bg-slate-950/95"
      style="bottom: calc(env(safe-area-inset-bottom) + 4.25rem); pointer-events: auto; touch-action: manipulation;"
    >
      <div class="mx-auto grid max-w-md gap-2">
        <UButton
          type="submit"
          form="edit-transaction-form"
          size="xl"
          block
          :disabled="!transactionFormRef?.canSubmit || isSubmitting"
          class="h-12 rounded-full bg-primary text-sm font-extrabold text-white shadow-[0_14px_32px_-18px_rgba(15,23,42,0.28)] transition active:scale-[0.98] sm:h-13 sm:text-base"
        >
          <LoadingSpinner v-if="isSubmitting" class="size-4 shrink-0" />
          <UIcon v-else name="i-lucide-check" class="size-4" />
          Save changes
        </UButton>

        <UButton
          type="button"
          variant="soft"
          color="rose"
          size="xl"
          block
          :disabled="isSubmitting"
          class="h-12 rounded-full text-sm font-bold sm:h-13 sm:text-base"
          @click="handleDelete"
        >
          Delete transaction
        </UButton>
      </div>
    </section>
  </div>
</template>
