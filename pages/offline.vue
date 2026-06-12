<script setup lang="ts">
const router = useRouter()
const { isOnline } = useConnectivity()

async function goToLogin() {
  await router.replace('/login')
}

watch(
  isOnline,
  (online) => {
    if (online) {
      void goToLogin()
    }
  },
  { immediate: true }
)
</script>

<template>
  <div class="flex min-h-[70dvh] items-center justify-center px-4 py-8">
    <UCard class="w-full max-w-sm border border-white/60 bg-white/90 shadow-[0_22px_70px_-30px_rgba(15,23,42,0.25)] dark:border-white/10 dark:bg-slate-950/80">
      <div class="text-center">
        <div class="mx-auto inline-flex items-center gap-2 rounded-full border border-rose-200/80 bg-rose-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/50 dark:text-rose-300">
          <UIcon name="i-lucide-wifi-off" class="size-3.5" />
          Offline
        </div>
        <h1 class="mt-4 text-2xl font-black tracking-tight text-default">No internet connection</h1>
        <p class="mt-3 text-sm leading-6 text-muted">
          The app will keep working again as soon as the connection comes back. When you're back online, we'll take you back into the app.
        </p>

        <div class="mt-6 grid gap-3 sm:grid-cols-2">
          <UButton class="h-11 rounded-2xl" @click="goToLogin">Try again</UButton>
          <UButton class="h-11 rounded-2xl" color="neutral" variant="soft" @click="goToLogin">
            Go to login
          </UButton>
        </div>
      </div>
    </UCard>
  </div>
</template>
