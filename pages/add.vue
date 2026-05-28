<script setup lang="ts">
import type { TransactionInput } from '~/composables/useMoneyNote'
import { useMoneyNote } from '~/composables/useMoneyNote'

const router = useRouter()
const { addTransaction } = useMoneyNote()

function handleSubmit(payload: TransactionInput) {
  addTransaction(payload)
  router.push('/transactions')
}
</script>

<template>
  <div class="space-y-5 pb-4">
    <section class="flex items-center justify-between gap-3">
      <div>
        <p class="text-sm font-medium text-muted">Quick capture</p>
        <h1 class="mt-1 text-3xl font-black tracking-tight text-default">Add transaction</h1>
        <p class="mt-2 text-sm leading-6 text-muted">Create income, expense, move, or loan records with large mobile-friendly inputs.</p>
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
