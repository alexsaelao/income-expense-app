<script setup lang="ts">
import type { TransactionInput } from '~/composables/useMoneyNote'
import { useMoneyNote } from '~/composables/useMoneyNote'

const router = useRouter()
const { addTransaction, canEditMoneyData } = useMoneyNote()
const transactionFormRef = ref<{ canSubmit: boolean } | null>(null)
const submitError = ref('')

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
    || 'Unable to save transaction'
}

async function handleSubmit(payload: TransactionInput) {
  submitError.value = ''

  try {
    await addTransaction(payload)
    router.push('/transactions')
  }
  catch (error) {
    submitError.value = resolveActionErrorMessage(error)
  }
}
</script>

<template>
  <div class="space-y-4 pb-8">
    <section class="flex items-start justify-between gap-3">
      <div class="min-w-0">
        <h1 class="mt-1 text-3xl font-black tracking-tight text-default">Add transaction</h1>
      </div>

      <div class="flex shrink-0 items-center gap-2">
        <PageReloadButton />

        <UButton
          icon="i-lucide-arrow-left"
          variant="ghost"
          color="neutral"
          size="lg"
          class="rounded-2xl"
          to="/"
        />
      </div>
    </section>

    <template v-if="canEditMoneyData">
      <p v-if="submitError" class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-100">
        {{ submitError }}
      </p>

      <TransactionForm
        ref="transactionFormRef"
        form-id="add-transaction-form"
        mode="create"
        :show-actions="false"
        submit-label="Save transaction"
        @submit="handleSubmit"
      />

      <section
        class="fixed inset-x-0 z-40 border-t border-white/60 bg-white/95 px-4 py-3 shadow-[0_-16px_52px_-42px_rgba(15,23,42,0.45)] backdrop-blur-none dark:border-white/10 dark:bg-slate-950/95"
        style="bottom: calc(env(safe-area-inset-bottom) + 4.25rem); pointer-events: auto; touch-action: manipulation;"
      >
        <div class="mx-auto grid max-w-md gap-2">
          <UButton
            type="submit"
            form="add-transaction-form"
            size="xl"
            block
            :disabled="!transactionFormRef?.canSubmit"
            class="h-12 rounded-full bg-primary text-sm font-extrabold text-white shadow-[0_14px_32px_-18px_rgba(15,23,42,0.28)] transition active:scale-[0.98] sm:h-13 sm:text-base"
          >
            <UIcon name="i-lucide-check" class="size-4" />
            Save transaction
          </UButton>
        </div>
      </section>
    </template>

    <UCard v-else class="overflow-hidden rounded-[1.4rem] border border-amber-200 bg-amber-50/80 p-5 shadow-[0_18px_50px_-24px_rgba(15,23,42,0.15)] dark:border-amber-900/50 dark:bg-amber-950/25">
      <div class="flex items-start gap-3">
        <div class="flex size-11 shrink-0 items-center justify-center rounded-full bg-amber-500 text-white shadow-lg">
          <UIcon name="i-lucide-lock" class="size-5" />
        </div>
        <div class="min-w-0">
          <p class="text-sm font-black text-default">Pro required</p>
          <p class="mt-1 text-sm leading-6 text-muted">
            Free accounts can view data only. Upgrade to Pro to create or edit wallets, categories, companies, and transactions.
          </p>
          <UButton to="/settings" class="mt-4 h-11 rounded-full bg-black px-4 font-bold text-white dark:bg-white dark:text-black">
            Go to Settings
          </UButton>
        </div>
      </div>
    </UCard>
  </div>
</template>
