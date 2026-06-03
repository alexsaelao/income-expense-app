<script setup lang="ts">
import type { TransactionInput } from '~/composables/useMoneyNote'
import { useMoneyNote } from '~/composables/useMoneyNote'

const router = useRouter()
const { addTransaction } = useMoneyNote()

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

    <TransactionForm mode="create" submit-label="Save transaction" @submit="handleSubmit" />
  </div>
</template>
