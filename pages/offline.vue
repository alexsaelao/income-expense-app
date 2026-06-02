<script setup lang="ts">
const { activeTheme } = useAppThemeColor()

function reload() {
  window.location.reload()
}
</script>

<template>
  <div class="flex min-h-[70dvh] items-center justify-center pb-10 pt-6">
    <UCard class="w-full border border-white/60 bg-white/85 shadow-[0_22px_70px_-30px_rgba(15,23,42,0.25)] dark:border-white/10 dark:bg-slate-950/80">
      <div class="text-center">
        <div :class="['mx-auto flex size-16 items-center justify-center rounded-[1.5rem] bg-gradient-to-br text-3xl text-white shadow-lg', activeTheme.accent]">
          💸
        </div>
        <h1 class="mt-5 text-3xl font-black tracking-tight text-default">You're offline</h1>
        <p class="mt-3 text-sm leading-6 text-muted">
          Cached screens are still available, and your data will keep syncing once the connection returns.
        </p>

        <div class="mt-6 grid gap-3 sm:grid-cols-2">
          <UButton class="h-12 rounded-2xl" @click="reload">Try again</UButton>
          <UButton class="h-12 rounded-2xl" color="neutral" variant="soft" to="/">Go home</UButton>
        </div>
      </div>
    </UCard>
  </div>
</template>
