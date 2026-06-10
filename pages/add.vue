<script setup lang="ts">
import type { TransactionInput } from '~/composables/useMoneyNote'
import { useMoneyNote } from '~/composables/useMoneyNote'

const router = useRouter()
const { addTransaction } = useMoneyNote()
const transactionFormRef = ref<{ canSubmit: boolean } | null>(null)

async function handleSubmit(payload: TransactionInput) {
  await addTransaction(payload)
  router.push('/transactions')
}
</script>

<template>
  <div class="space-y-4 pb-8">
    <section class="flex items-start justify-between gap-3">
      <div class="min-w-0">
        <h1 class="mt-1 text-3xl font-black tracking-tight text-default">Add transaction</h1>
      </div>

      <UButton
        icon="i-lucide-arrow-left"
        variant="ghost"
        color="neutral"
        size="lg"
        class="rounded-2xl"
        to="/"
      />
    </section>

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
      style="bottom: calc(env(safe-area-inset-bottom) + 4.75rem); pointer-events: auto; touch-action: manipulation;"
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
  </div>
</template>
