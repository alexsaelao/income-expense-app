<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin-auth'
})

const { selectedLanguage } = useAppLanguage()
const colorMode = useColorMode()
const router = useRouter()
const { signOut } = useAdminDeviceAuth()
const { selectedThemeColor, activeTheme, appThemeColorOptions, setThemeColor } = useAppThemeColor()
const logoutConfirmModalOpen = ref(false)
const signingOut = ref(false)

const copy = computed(() => selectedLanguage.value === 'lo'
  ? {
      title: 'Settings',
      subtitle: 'ພາສາ ແລະຮູບແບບສຳລັບໜ້າ admin',
      general: 'ທົ່ວໄປ',
      language: 'ພາສາ',
      chooseLanguage: 'ເລືອກພາສາ.',
      appearance: 'ຮູບແບບ',
      themeMode: 'ໂໝດຮູບແບບ.',
      colorTheme: 'ສີຫຼັກ',
      colorThemeDesc: 'ເລືອກສີຫຼັກ ແລະພາບຕົວຢ່າງ.',
      colorThemePreview: 'ພາບຕົວຢ່າງ',
      colorThemeSaved: 'ບັນທຶກໄວ້ຢູ່ເຄື່ອງນີ້.',
      recommended: 'ແນະນຳ',
      dangerZone: 'ເຂດອັນຕະລາຍ',
      dangerDesc: 'ອອກຈາກບັນຊີ admin ນີ້.',
      logout: 'ອອກຈາກລະບົບ',
      logoutConfirmTitle: 'ຢືນຢັນການອອກ',
      logoutConfirmDesc: 'ການອອກຈາກລະບົບຈະອອກຈາກ admin account ໃນເຄື່ອງນີ້.',
      logoutConfirmCancel: 'ຍົກເລີກ',
      logoutConfirmAction: 'ອອກຈາກລະບົບ'
    }
  : {
      title: 'Settings',
      subtitle: 'Language and appearance for the admin console.',
      general: 'General',
      language: 'Language',
      chooseLanguage: 'Choose language.',
      appearance: 'Appearance',
      themeMode: 'Theme mode.',
      colorTheme: 'Color theme',
      colorThemeDesc: 'Choose the main accent and preview.',
      colorThemePreview: 'Theme preview',
      colorThemeSaved: 'Saved on this device.',
      recommended: 'Recommended',
      dangerZone: 'Danger zone',
      dangerDesc: 'Sign out from this admin account.',
      logout: 'Logout',
      logoutConfirmTitle: 'Confirm sign out',
      logoutConfirmDesc: 'Signing out will remove this admin account from this device.',
      logoutConfirmCancel: 'Cancel',
      logoutConfirmAction: 'Sign out'
    })

const languageChoices = computed(() => [
  { label: 'English', value: 'en' as const },
  { label: 'ລາວ', value: 'lo' as const }
])

const themeChoices = computed(() => {
  if (selectedLanguage.value === 'lo') {
    return [
      { label: 'ສະວ່າງ', value: 'light' },
      { label: 'ມືດ', value: 'dark' },
      { label: 'ລະບົບ', value: 'system' }
    ]
  }

  return [
    { label: 'Light', value: 'light' },
    { label: 'Dark', value: 'dark' },
    { label: 'System', value: 'system' }
  ]
})

const selectedThemeModeLabel = computed(() => themeChoices.value.find(choice => choice.value === colorMode.preference)?.label ?? colorMode.preference)

const themeColorChoices = computed(() => {
  const labels = selectedLanguage.value === 'lo'
    ? {
        blue: 'ຟ້າ',
        red: 'ແດງ',
        green: 'ຂຽວ',
        amber: 'ອຳພັນ',
        violet: 'ມ່ວງ',
        rose: 'ຊົມພູ'
      }
    : {
        blue: 'Blue',
        red: 'Red',
        green: 'Green',
        amber: 'Amber',
        violet: 'Violet',
        rose: 'Pink'
      }

  return appThemeColorOptions.map(option => ({
    ...option,
    label: labels[option.value]
  }))
})

const selectedThemeColorLabel = computed(() => themeColorChoices.value.find(choice => choice.value === selectedThemeColor.value)?.label ?? selectedThemeColor.value)

function setThemeMode(value: 'light' | 'dark' | 'system') {
  colorMode.preference = value
}

function setThemeColorPreference(value: typeof selectedThemeColor.value) {
  setThemeColor(value)
}

function setLanguage(language: 'en' | 'lo') {
  selectedLanguage.value = language
}

function handleLogout() {
  logoutConfirmModalOpen.value = true
}

async function confirmLogout() {
  if (signingOut.value) return

  signingOut.value = true
  try {
    await signOut()
    await router.push('/admin-login')
  }
  finally {
    signingOut.value = false
    logoutConfirmModalOpen.value = false
  }
}

useHead({
  title: 'Super Admin · Settings'
})
</script>

<template>
  <div class="space-y-4 pb-8 md:space-y-6">
    <section class="overflow-hidden rounded-[1.4rem] border border-slate-200/80 bg-white/85 p-4 shadow-[0_22px_60px_-32px_rgba(15,23,42,0.2)] dark:border-slate-800 dark:bg-slate-950/75 md:p-6">
      <div class="flex items-start justify-between gap-2.5">
        <div class="min-w-0">
          <p class="text-[10px] font-semibold uppercase tracking-[0.28em] text-muted">{{ copy.general }}</p>
          <h1 class="mt-1 text-2xl font-black tracking-tight text-default">{{ copy.title }}</h1>
          <p class="mt-1 text-sm leading-6 text-muted">{{ copy.subtitle }}</p>
        </div>
      </div>
    </section>

    <section class="overflow-hidden rounded-[1.25rem] border border-slate-200/80 bg-white/80 shadow-[0_12px_40px_-28px_rgba(15,23,42,0.2)] dark:border-slate-800 dark:bg-slate-950/70">
      <div class="px-4 py-3">
        <h2 class="text-sm font-black tracking-tight text-default">{{ copy.general }}</h2>
      </div>

      <div class="space-y-2.5 border-t border-slate-200/80 px-4 py-3 dark:border-slate-800">
        <div class="flex items-center justify-between gap-2.5">
          <div class="min-w-0">
            <p class="text-sm font-bold text-default">{{ copy.language }}</p>
            <p class="text-xs text-muted">{{ copy.chooseLanguage }}</p>
          </div>
          <UBadge color="neutral" variant="soft" class="rounded-full">
            {{ selectedLanguage === 'lo' ? 'ລາວ' : 'English' }}
          </UBadge>
        </div>

        <div class="grid grid-cols-2 gap-2 rounded-full bg-slate-100 p-1.5 dark:bg-slate-900">
          <button
            v-for="choice in languageChoices"
            :key="choice.value"
            type="button"
            class="flex min-h-11 items-center justify-center gap-2 rounded-full px-3 py-2 text-left transition active:scale-95"
            :class="selectedLanguage === choice.value ? 'bg-white text-primary shadow-sm dark:bg-slate-800' : 'text-muted'"
            @click="setLanguage(choice.value)"
          >
            <AppLanguageFlag :code="choice.value" />
            <p class="min-w-0 truncate text-sm font-bold leading-none">{{ choice.label }}</p>
          </button>
        </div>
      </div>

      <div class="space-y-2.5 border-t border-slate-200/80 px-4 py-3 dark:border-slate-800">
        <div class="flex items-center justify-between gap-2.5">
          <div class="min-w-0">
            <p class="text-sm font-bold text-default">{{ copy.appearance }}</p>
            <p class="text-xs text-muted">{{ copy.themeMode }}</p>
          </div>
          <UBadge color="neutral" variant="soft" class="rounded-full">
            {{ selectedThemeModeLabel }}
          </UBadge>
        </div>

        <div class="grid grid-cols-3 gap-2 rounded-full bg-slate-100 p-1.5 dark:bg-slate-900">
          <button
            v-for="choice in themeChoices"
            :key="choice.value"
            type="button"
            class="rounded-full px-2 py-2 text-xs font-bold transition active:scale-95"
            :class="colorMode.preference === choice.value ? 'bg-white text-primary shadow-sm dark:bg-slate-800' : 'text-muted'"
            @click="setThemeMode(choice.value as 'light' | 'dark' | 'system')"
          >
            {{ choice.label }}
          </button>
        </div>

        <div class="rounded-[1.1rem] border border-slate-200/80 bg-slate-50 px-3 py-3 dark:border-slate-800 dark:bg-slate-900">
          <div class="flex items-center justify-between gap-2.5">
            <div class="min-w-0">
              <p class="text-sm font-bold text-default">{{ copy.colorTheme }}</p>
              <p class="text-xs text-muted">{{ copy.colorThemeDesc }}</p>
            </div>
            <UBadge color="neutral" variant="soft" class="rounded-full">
              {{ selectedThemeColorLabel }}
            </UBadge>
          </div>

          <div class="mt-3 flex items-center gap-2.5 rounded-[1rem] border border-slate-200/80 bg-white px-3 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div
              :class="['flex size-14 shrink-0 items-center justify-center rounded-[1.25rem] bg-gradient-to-br text-white shadow-[0_14px_28px_-18px_rgba(15,23,42,0.35)]', activeTheme.accent]"
            >
              <UIcon name="i-lucide-shield" class="size-7" />
            </div>

            <div class="min-w-0 flex-1">
              <p class="text-sm font-bold text-default">{{ copy.colorThemePreview }}</p>
              <p class="truncate text-xs text-muted">{{ copy.colorThemeSaved }}</p>
            </div>

            <UBadge color="primary" variant="soft" class="rounded-full text-[10px] font-black uppercase tracking-[0.18em]">
              {{ copy.recommended }}
            </UBadge>
          </div>

          <div class="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
            <button
              v-for="choice in themeColorChoices"
              :key="choice.value"
              type="button"
              class="flex min-h-16 flex-col items-center justify-center gap-2 rounded-[1rem] border px-3 py-3 text-center transition active:scale-95"
              :class="selectedThemeColor === choice.value
                ? 'border-primary bg-white text-primary shadow-sm dark:bg-slate-950'
                : 'border-slate-200 bg-white text-muted dark:border-slate-800 dark:bg-slate-950'"
              @click="setThemeColorPreference(choice.value)"
            >
              <span class="size-4 rounded-full shadow-sm" :style="{ backgroundColor: choice.hex }" />
              <span class="flex items-center gap-1 text-sm font-bold leading-none">
                {{ choice.label }}
                <UIcon v-if="selectedThemeColor === choice.value" name="i-lucide-check" class="size-3.5 text-primary" />
              </span>
            </button>
          </div>
        </div>
      </div>
    </section>

    <section class="overflow-hidden rounded-[1.25rem] border border-slate-200/80 bg-white/80 shadow-[0_12px_40px_-28px_rgba(15,23,42,0.2)] dark:border-slate-800 dark:bg-slate-950/70">
      <div class="px-4 py-3">
        <div class="min-w-0">
          <h2 class="text-sm font-black tracking-tight text-default">{{ copy.dangerZone }}</h2>
          <p class="text-xs text-muted">{{ copy.dangerDesc }}</p>
        </div>
      </div>

      <div class="border-t border-slate-200/80 px-4 py-3 dark:border-slate-800">
        <UButton
          class="h-12 w-full justify-center rounded-2xl bg-gradient-to-r from-rose-500 to-red-400 px-2 text-xs font-bold text-white transition active:scale-95 sm:px-4 sm:text-sm"
          icon="i-lucide-log-out"
          @click="handleLogout"
        >
          {{ copy.logout }}
        </UButton>
      </div>
    </section>

    <UModal
      v-model:open="logoutConfirmModalOpen"
      :title="copy.logoutConfirmTitle"
      :description="copy.logoutConfirmDesc"
      :ui="{
        content: '!fixed !inset-auto !top-1/2 !left-1/2 flex !max-h-[calc(100dvh-2rem)] !w-[calc(100vw-2rem)] !max-w-lg !-translate-x-1/2 !-translate-y-1/2 flex-col !overflow-hidden !rounded-[1.5rem] !border !border-slate-200/80 !bg-white !shadow-[0_24px_80px_-28px_rgba(15,23,42,0.35)] !ring-1 !ring-slate-200/60 focus:outline-none dark:!border-slate-800 dark:!bg-slate-950 dark:!ring-slate-800 sm:!max-h-[calc(100dvh-4rem)]',
        body: 'flex-1 overflow-y-auto p-4 sm:p-6',
        footer: 'flex items-center gap-1.5 p-4 sm:px-6',
        header: 'flex items-center gap-1.5 p-4 sm:px-6 min-h-16',
        overlay: 'fixed inset-0 bg-elevated/75 backdrop-blur-[2px]'
      }"
    >
      <template #body>
        <div class="space-y-4">
          <div class="flex items-start gap-3 rounded-[1rem] border border-rose-200 bg-rose-50 p-4 text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-100">
            <div class="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-red-400 text-white shadow-lg">
              <UIcon name="i-lucide-log-out" class="size-4" />
            </div>
            <div class="min-w-0">
              <p class="text-sm font-bold">{{ copy.logoutConfirmTitle }}</p>
              <p class="mt-1 text-xs leading-5 opacity-90">{{ copy.logoutConfirmDesc }}</p>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <UButton
              class="h-12 w-full justify-center rounded-full border border-slate-200 bg-white px-4 text-sm font-bold text-default shadow-none hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900"
              variant="soft"
              @click="logoutConfirmModalOpen = false"
            >
              {{ copy.logoutConfirmCancel }}
            </UButton>
            <UButton
              class="h-12 w-full justify-center rounded-full bg-gradient-to-r from-rose-500 to-red-400 px-4 text-sm font-bold text-white transition active:scale-95"
              icon="i-lucide-log-out"
              :loading="signingOut"
              @click="confirmLogout"
            >
              {{ copy.logoutConfirmAction }}
            </UButton>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>
