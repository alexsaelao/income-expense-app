<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const { $pwa } = useNuxtApp()
const { isStandalone } = usePwaDisplayMode()
const { activeTheme } = useAppThemeColor()

const bannerStyle = computed(() => ({
  backgroundImage: `linear-gradient(135deg, ${activeTheme.value.hex} 0%, ${activeTheme.value.hex}E6 100%)`
}))

const installButtonStyle = computed(() => ({
  color: activeTheme.value.hex
}))

const installAvailable = computed(() => Boolean($pwa?.showInstallPrompt?.value))
const installHelpOpen = ref(false)
const bannerDismissed = ref(import.meta.client ? sessionStorage.getItem('money-note-install-banner-dismissed') === '1' : false)
const installLabel = computed(() => (installAvailable.value ? 'Install app' : 'How to install'))
const bannerVisible = computed(() => !isStandalone.value && !bannerDismissed.value)
const appName = 'Wallet Code Sabai'

async function installApp() {
  if (route.path !== '/') {
    sessionStorage.setItem('money-note-install-after-home', '1')
    await router.push('/')
    return
  }

  if (installAvailable.value) {
    await $pwa?.install()
    return
  }

  installHelpOpen.value = true
}

function dismissBanner() {
  bannerDismissed.value = true
  installHelpOpen.value = false
  sessionStorage.setItem('money-note-install-banner-dismissed', '1')
}

onMounted(() => {
  const pendingInstall = sessionStorage.getItem('money-note-install-after-home')
  if (pendingInstall) {
    sessionStorage.removeItem('money-note-install-after-home')

    if (installAvailable.value) {
      void installApp()
    } else {
      installHelpOpen.value = true
    }
  }
})
</script>

<template>
  <template v-if="bannerVisible">
    <section
      :class="[
        'fixed inset-x-0 top-0 z-40 overflow-hidden border-y border-white/20 text-white shadow-[0_18px_50px_-24px_rgba(14,165,233,0.5)] lg:hidden'
      ]"
      :style="bannerStyle"
    >
      <div class="flex flex-nowrap items-center gap-2 px-4 py-[0.55rem] pt-[calc(env(safe-area-inset-top)+0.55rem)]">
        <div class="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-[1.15rem] bg-white/15 p-1.5 text-white shadow-[0_10px_20px_-14px_rgba(15,23,42,0.35)]">
          <img src="/wallet-codesabai-mark.svg" alt="" class="h-full w-full" />
        </div>

        <div class="min-w-0 flex-1 pr-1">
          <p class="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/75 sm:text-xs">Install</p>
          <p class="truncate text-[12px] font-bold leading-tight sm:text-sm">Add {{ appName }} to your device</p>
          <p class="hidden truncate text-[11px] text-white/80 sm:block">Open like an app without browser tabs.</p>
        </div>

        <div class="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
          <UButton
            class="h-8 shrink-0 whitespace-nowrap rounded-2xl border-0 bg-white px-2.5 text-[10px] font-bold shadow-sm hover:bg-slate-50 sm:px-3 sm:text-[11px]"
            :style="installButtonStyle"
            color="neutral"
            variant="solid"
            :icon="installAvailable ? 'i-lucide-square-arrow-out-up-right' : 'i-lucide-smartphone'"
            @click="installApp"
          >
            {{ installLabel }}
          </UButton>

          <button
            type="button"
            class="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/15 text-white transition active:scale-95"
            aria-label="Close install banner"
            @click="dismissBanner"
          >
            <UIcon name="i-lucide-x" class="size-4" />
          </button>
        </div>
      </div>
    </section>

    <div class="h-[calc(env(safe-area-inset-top)+3.6rem)] lg:hidden" aria-hidden="true" />

    <UModal
      v-model:open="installHelpOpen"
      title="Install app"
      description="Use these steps if the browser does not show an install button."
    >
      <template #body>
        <div class="space-y-4 text-sm leading-6 text-muted">
          <div class="rounded-[1rem] bg-slate-100/80 p-3 dark:bg-slate-900">
            <p class="font-semibold text-default">Quick steps</p>
            <ol class="mt-2 list-decimal space-y-2 pl-5">
              <li>Open the browser menu or share menu.</li>
              <li>Choose <span class="font-semibold text-default">Install app</span> if you see it.</li>
              <li>
                <span><span class="font-semibold text-default">If you use iPhone</span>, choose <span class="font-semibold text-default">Add to Home Screen</span>.</span>
              </li>
              <li>Then open the app from the new icon on your home screen.</li>
            </ol>
          </div>
        </div>
      </template>

      <template #footer>
        <div class="flex w-full">
          <UButton class="h-12 w-full rounded-2xl" @click="installHelpOpen = false">
            Got it
          </UButton>
        </div>
      </template>
    </UModal>
  </template>
</template>
