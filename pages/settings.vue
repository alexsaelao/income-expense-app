<script setup lang="ts">
import { currencyOptions, currencySymbols } from '~/composables/useMoneyNote'

const { selectedLanguage } = useAppLanguage()
const {
  enabledCurrencyOptions,
  isCurrencyEnabled,
  toggleCurrencyEnabled,
  clearLocalAccountState,
  syncStatus,
  lastSyncedAt,
  syncProgress,
  isOnline
} = useMoneyNote()
const { signOut, sessionProfile, setSessionPlan } = useDeviceAuth()
const colorMode = useColorMode()
const { selectedThemeColor, activeTheme, appThemeColorOptions, setThemeColor } = useAppThemeColor()
const router = useRouter()
const isRedeemingPro = ref(false)
const proRedeemModalOpen = ref(false)
const proRedeemKey = ref('')
const proRedeemError = ref('')

function openCompaniesPage() {
  return navigateTo('/companies')
}

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

const selectedThemeModeLabel = computed(() => {
  return themeChoices.value.find(choice => choice.value === colorMode.preference)?.label ?? colorMode.preference
})

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

const languageChoices = computed(() => {
  return [
    { label: 'English', value: 'en' as const },
    { label: 'ລາວ', value: 'lo' as const }
  ]
})

const settingsCopy = computed(() => {
  if (selectedLanguage.value === 'lo') {
    return {
      settings: 'ການຕັ້ງຄ່າ',
      profile: 'ໂປຣໄຟລ໌',
      emailAccount: 'ບັນຊີອີເມວ',
      phoneAccount: 'ບັນຊີເບີໂທ',
      signedIn: 'ເຂົ້າລະບົບແລ້ວ',
      free: 'ຟຣີ',
      pro: 'ໂປຣ',
      upgradeToPro: 'ອັບເກຣດເປັນໂປຣ',
      cloudSyncActive: 'ເປີດຊິງກັບຄລາວແລ້ວ',
      cloudSyncLocked: 'ລັອກການຊິງກັບຄລາວ',
      cloudSyncActiveDesc: 'ບັນຊີນີ້ຊິງຂໍ້ມູນຂ້າມເຄື່ອງໄດ້.',
      cloudSyncLockedDesc: 'ໃຊ້ຄີລົດແລກເພື່ອອັບເກຣດ.',
      proSectionTitle: 'ໂປຣ',
      proSectionDesc: 'ໃສ່ຄີລົດແລກເພື່ອເປີດຊິງຄລາວ.',
      proStatusLocked: 'ຊິງຄລາວຖືກລັອກ',
      proStatusActive: 'ຊິງຄລາວເປີດຢູ່',
      proStatusLockedDesc: 'ໃຊ້ຄີລົດແລກເພື່ອອັບເກຣດ.',
      proStatusActiveDesc: 'ບັນຊີນີ້ຊິງຂໍ້ມູນຂ້າມເຄື່ອງໄດ້.',
      upgrade: 'ອັບເກຣດ',
      active: 'ເປີດໃຊ້',
      general: 'ທົ່ວໄປ',
      language: 'ພາສາ',
      chooseLanguage: 'ເລືອກພາສາແອັບ.',
      appearance: 'ຮູບແບບ',
      themeMode: 'ໂໝດຮູບແບບ.',
      colorTheme: 'ສີຫຼັກ',
      colorThemeDesc: 'ເລືອກສີຫຼັກແລະສີໂລໂກ້.',
      colorThemePreview: 'ພາບຕົວຢ່າງໂລໂກ້',
      colorThemeSaved: 'ບັນທຶກໄວ້ໃນເຄື່ອງນີ້ ແລະຊິງກັບບັນຊີແລ້ວ.',
      recommended: 'ແນະນຳ',
      category: 'ໝວດໝູ່',
      categoryDesc: 'ຈັດການປ້າຍກຳກັບທີ່ໃຊ້ໃນທຸລະກຳ.',
      company: 'ບໍລິສັດ',
      companyDesc: 'ຈັດການບໍລິສັດທີ່ໃຊ້ກັບລາຍຮັບ.',
      manage: 'ຈັດການ',
      currency: 'ເງິນຕາ',
      currencyDesc: 'ເປີດໃຊ້ເງິນຕາທີ່ຕ້ອງການ.',
      disabled: 'ປິດໃຊ້ງານ',
      sync: 'ຊິງຄລາວ',
      syncDesc: 'ໃຊ້ງານແບບອອຟລາຍກ່ອນ ແລ້ວຄ່ອຍສຳຮອງຂຶ້ນຄລາວ.',
      offlineMode: 'ໂໝດອອຟລາຍ',
      syncingNow: 'ກຳລັງຊິງ',
      cloudSyncReady: 'ພ້ອມຊິງຄລາວ',
      waitingToSync: 'ລໍຖ້າຊິງ',
      waiting: 'ລໍຖ້າ',
      uploadProgress: 'ຄວາມຄືບໜ້າການອັບໂຫຼດ',
      syncedAll: 'ຂໍ້ມູນໃນເຄື່ອງນີ້ກົງກັບຄລາວແລ້ວ.',
      syncingUpload: 'ກຳລັງອັບໂຫຼດການປ່ຽນແປງຂຶ້ນຄລາວ.',
      waitingUpload: 'ບັນທຶກໄວ້ໃນເຄື່ອງແລ້ວ ກຳລັງລໍສັນຍານ.',
      pendingUpload: 'ການປ່ຽນແປງໃນເຄື່ອງກຳລັງລໍອັບໂຫຼດ.',
      dangerZone: 'ເຂດອັນຕະລາຍ',
      dangerDesc: 'ລ້າງຂໍ້ມູນທົດລອງ ຫຼືອອກຈາກເຄື່ອງນີ້.',
      reset: 'ລ້າງ',
      logout: 'ອອກ',
      upgradeModalTitle: 'ອັບເກຣດເປັນໂປຣ',
      upgradeModalDesc: 'ໃສ່ຄີເພື່ອເປີດໂປຣ ແລະຊິງຄລາວສຳລັບບັນຊີນີ້.',
      account: 'ບັນຊີ',
      keyActivate: 'ຄີນີ້ຈະເປີດໂປຣໃຫ້ບັນຊີທີ່ເຂົ້າລະບົບຢູ່ເທົ່ານັ້ນ.',
      redeemKey: 'ຄີລົດແລກ',
      redeemPlaceholder: 'ໃສ່ຄີໂປຣ',
      noSignedInAccount: 'ບໍ່ພົບບັນຊີທີ່ເຂົ້າລະບົບ.',
      enterRedeemKey: 'ກະລຸນາໃສ່ຄີລົດແລກ.',
      couldNotEnable: 'ບໍ່ສາມາດເປີດໂປຣໄດ້ໃນຕອນນີ້.',
      keyNotFound: 'ບໍ່ພົບຄີ ກະລຸນາກວດອີກຄັ້ງ.',
      keyUsed: 'ຄີນີ້ຖືກໃຊ້ແລ້ວ.',
      couldNotVerify: 'ບໍ່ສາມາດກວດຄີໄດ້ໃນຕອນນີ້.',
      cancel: 'ຍົກເລີກ',
      activate: 'ເປີດໃຊ້'
    }
  }

  return {
    settings: 'Settings',
    profile: 'Profile',
    emailAccount: 'Email account',
    phoneAccount: 'Phone account',
    signedIn: 'Signed in',
    free: 'Free',
    pro: 'Pro',
    upgradeToPro: 'Upgrade to Pro',
    cloudSyncActive: 'Cloud sync active',
    cloudSyncLocked: 'Cloud sync locked',
    cloudSyncActiveDesc: 'This account can sync across devices.',
    cloudSyncLockedDesc: 'Use a redeem key to upgrade.',
    proSectionTitle: 'Pro',
    proSectionDesc: 'Redeem a key to unlock cloud sync.',
    proStatusLocked: 'Cloud sync locked',
    proStatusActive: 'Cloud sync active',
    proStatusLockedDesc: 'Use a redeem key to upgrade.',
    proStatusActiveDesc: 'This account can sync across devices.',
    upgrade: 'Upgrade',
    active: 'Active',
    general: 'General',
    language: 'Language',
    chooseLanguage: 'Choose app language.',
    appearance: 'Appearance',
    themeMode: 'Theme mode.',
    colorTheme: 'Color theme',
    colorThemeDesc: 'Pick the primary accent and logo tint.',
    colorThemePreview: 'Theme logo preview',
    colorThemeSaved: 'Saved on this device and synced with your account.',
    recommended: 'Recommended',
    category: 'Category',
    categoryDesc: 'Manage labels used in transactions.',
    company: 'Company',
    companyDesc: 'Manage the company labels used on income records.',
    manage: 'Manage',
    currency: 'Currency',
    currencyDesc: 'Enable the currencies you want to use.',
    disabled: 'Disabled',
    sync: 'Sync',
    syncDesc: 'Offline-first, cloud backup later.',
    offlineMode: 'Offline mode',
    syncingNow: 'Syncing now',
    cloudSyncReady: 'Cloud sync ready',
    waitingToSync: 'Waiting to sync',
    waiting: 'Waiting',
    uploadProgress: 'Upload progress',
    syncedAll: 'Everything on this device matches the cloud.',
    syncingUpload: 'Uploading changes to cloud now.',
    waitingUpload: 'Saved locally. Waiting for connection to upload.',
    pendingUpload: 'Local changes are waiting to be uploaded.',
    dangerZone: 'Danger zone',
    dangerDesc: 'Reset demo data or sign out from this device.',
    reset: 'Reset',
    logout: 'Logout',
    upgradeModalTitle: 'Upgrade to Pro',
    upgradeModalDesc: 'Enter your redeem key to enable Pro and cloud sync for this account.',
    account: 'Account',
    keyActivate: 'This key will activate Pro on the signed-in account only.',
    redeemKey: 'Redeem key',
    redeemPlaceholder: 'Enter Pro key',
    noSignedInAccount: 'No signed-in account found.',
    enterRedeemKey: 'Please enter your redeem key.',
    couldNotEnable: 'Could not enable Pro right now.',
    keyNotFound: 'Key not found. Please check and try again.',
    keyUsed: 'This key has already been used.',
    couldNotVerify: 'Could not verify the key right now.',
    cancel: 'Cancel',
    activate: 'Activate'
  }
})

const selectedThemeColorLabel = computed(() => {
  return themeColorChoices.value.find(choice => choice.value === selectedThemeColor.value)?.label ?? activeTheme.label
})

const profileInitials = computed(() => {
  const identifier = sessionProfile.value?.identifier?.trim() || 'User'
  if (identifier.includes('@')) {
    return identifier.slice(0, 1).toUpperCase()
  }

  const digits = identifier.replace(/\D/g, '')
  if (digits.length >= 2) {
    return digits.slice(-2)
  }

  return identifier.slice(0, 2).toUpperCase()
})

const profileSignedInAt = computed(() => {
  const value = sessionProfile.value?.signedInAt
  if (!value) return ''

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(new Date(value))
})

const profileKind = computed(() => {
  const identifier = sessionProfile.value?.identifier?.trim() ?? ''
  return identifier.includes('@') ? settingsCopy.value.emailAccount : settingsCopy.value.phoneAccount
})

const isProAccount = computed(() => (sessionProfile.value?.plan ?? 'free') === 'pro')
const profilePlanLabel = computed(() => isProAccount.value ? settingsCopy.value.pro : settingsCopy.value.free)

function openProRedeemModal() {
  proRedeemKey.value = ''
  proRedeemError.value = ''
  proRedeemModalOpen.value = true
}

async function submitProRedeem() {
  if (isRedeemingPro.value) return

  const identifier = sessionProfile.value?.identifier?.trim()
  const key = proRedeemKey.value.trim()

  if (!identifier) {
    proRedeemError.value = settingsCopy.value.noSignedInAccount
    return
  }

  if (!key) {
    proRedeemError.value = settingsCopy.value.enterRedeemKey
    return
  }

  isRedeemingPro.value = true
  proRedeemError.value = ''

  try {
    const result = await $fetch<{ account?: { plan?: 'free' | 'pro' } }>('/api/auth/upgrade', {
      method: 'POST',
      body: { identifier, key }
    })

    if (result.account?.plan === 'pro') {
      setSessionPlan('pro')
      proRedeemModalOpen.value = false
      return
    }

    proRedeemError.value = settingsCopy.value.couldNotEnable
  }
  catch (error) {
    const status = typeof error === 'object' && error && 'statusCode' in error ? (error as { statusCode?: number }).statusCode : undefined

    if (status === 404) {
      proRedeemError.value = settingsCopy.value.keyNotFound
    }
    else if (status === 409) {
      proRedeemError.value = settingsCopy.value.keyUsed
    }
    else {
      proRedeemError.value = settingsCopy.value.couldNotVerify
    }
  }
  finally {
    isRedeemingPro.value = false
  }
}

function setTheme(theme: string) {
  colorMode.preference = theme
}

function setThemeColorPreference(theme: typeof appThemeColorOptions[number]['value']) {
  setThemeColor(theme)
}

function setLanguage(language: 'en' | 'lo') {
  selectedLanguage.value = language
}

async function resetDemoData() {
  await clearLocalAccountState().catch(() => {})

  for (const key of Object.keys(localStorage)) {
    if (key.startsWith('income-expense-note-state-v1')) {
      localStorage.removeItem(key)
    }
  }
  localStorage.removeItem('money-note-selected-currency')
  localStorage.removeItem('income-expense-note-currency-support-v1')
  const identifier = sessionProfile.value?.identifier?.trim()
  if (identifier) {
    void $fetch('/api/app-state', { method: 'DELETE', query: { identifier } }).catch(() => {})
  }
  window.location.reload()
}

function handleLogout() {
  signOut()
  router.replace('/login')
}

const syncStateCopy = computed(() => {
  const copy = settingsCopy.value
  switch (syncStatus.value) {
    case 'offline':
      return {
        label: copy.offlineMode,
        badge: copy.waiting,
        icon: 'i-lucide-wifi-off',
        tone: 'rose',
        message: copy.waitingUpload
      }
    case 'syncing':
      return {
        label: copy.syncingNow,
        badge: copy.syncingNow,
        icon: 'i-lucide-refresh-cw',
        tone: 'sky',
        message: copy.syncingUpload
      }
    case 'synced':
      return {
        label: copy.cloudSyncReady,
        badge: copy.pro,
        icon: 'i-lucide-cloud-check',
        tone: 'emerald',
        message: lastSyncedAt.value
          ? `${copy.cloudSyncReady} ${new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(new Date(lastSyncedAt.value))}.`
          : copy.syncedAll
      }
    default:
      return {
        label: copy.waitingToSync,
        badge: isOnline.value ? copy.waiting : copy.free,
        icon: isOnline.value ? 'i-lucide-cloud-upload' : 'i-lucide-wifi-off',
        tone: isOnline.value ? 'amber' : 'rose',
        message: isOnline.value ? copy.pendingUpload : copy.waitingUpload
      }
  }
})

const syncProgressLabel = computed(() => `${Math.round(syncProgress.value)}%`)
</script>

<template>
  <div class="space-y-6 pb-8">
    <section class="space-y-1">
      <h1 class="text-3xl font-black tracking-tight text-default">{{ settingsCopy.settings }}</h1>
    </section>

    <section class="overflow-hidden rounded-[1.25rem] border border-slate-200/80 bg-white shadow-[0_12px_40px_-28px_rgba(15,23,42,0.2)] dark:border-slate-800 dark:bg-slate-950/70">
      <div class="flex items-start gap-4 px-4 py-4">
        <div class="flex size-14 shrink-0 items-center justify-center rounded-[1.35rem] bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 text-lg font-black tracking-tight text-white shadow-[0_14px_28px_-18px_rgba(15,23,42,0.3)]">
          {{ profileInitials }}
        </div>

        <div class="min-w-0 flex-1">
          <div class="flex items-center justify-between gap-3">
            <div class="min-w-0">
              <p class="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted">{{ settingsCopy.profile }}</p>
              <h2 class="truncate text-lg font-black tracking-tight text-default">{{ sessionProfile?.identifier }}</h2>
            </div>

            <UBadge
              :color="isProAccount ? 'emerald' : 'neutral'"
              :variant="isProAccount ? 'solid' : 'soft'"
              :icon="isProAccount ? 'i-lucide-badge-check' : 'i-lucide-user-round'"
              class="rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] shadow-sm"
            >
              {{ profilePlanLabel }}
            </UBadge>
          </div>

          <p class="mt-1 text-sm text-muted">{{ profileKind }}</p>

          <div class="mt-3 flex flex-wrap gap-2">
            <UBadge color="neutral" variant="soft" class="rounded-full text-[10px] font-bold uppercase tracking-[0.16em]">
              {{ settingsCopy.signedIn }}
            </UBadge>
            <UBadge v-if="profileSignedInAt" color="neutral" variant="soft" class="rounded-full text-[10px] font-bold uppercase tracking-[0.16em]">
              {{ profileSignedInAt }}
            </UBadge>
          </div>

          <div class="mt-4 flex flex-wrap items-center gap-2">
            <UBadge v-if="isProAccount" color="emerald" variant="solid" icon="i-lucide-badge-check" class="rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] shadow-sm">
              {{ settingsCopy.pro }}
            </UBadge>
            <UBadge v-else color="neutral" variant="soft" icon="i-lucide-user-round" class="rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] shadow-sm">
              {{ settingsCopy.free }}
            </UBadge>
          </div>
        </div>
      </div>
    </section>

    <section class="overflow-hidden rounded-[1.25rem] border border-slate-200/80 bg-white shadow-[0_12px_40px_-28px_rgba(15,23,42,0.2)] dark:border-slate-800 dark:bg-slate-950/70">
      <div class="flex items-center justify-between gap-3 px-4 py-3">
        <div class="min-w-0">
          <h2 class="text-sm font-black tracking-tight text-default">{{ settingsCopy.proSectionTitle }}</h2>
          <p class="text-xs text-muted">{{ settingsCopy.proSectionDesc }}</p>
        </div>

        <UBadge
          :color="isProAccount ? 'emerald' : 'neutral'"
          :variant="isProAccount ? 'solid' : 'soft'"
          :icon="isProAccount ? 'i-lucide-badge-check' : 'i-lucide-key-round'"
          class="rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] shadow-sm"
        >
          {{ isProAccount ? settingsCopy.pro : settingsCopy.free }}
        </UBadge>
      </div>

      <div class="flex items-center justify-between gap-3 border-t border-slate-200/80 px-4 py-3 dark:border-slate-800">
        <div class="flex min-w-0 items-center gap-3">
          <div class="flex size-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700 shadow-sm dark:bg-slate-800 dark:text-slate-200">
            <UIcon :name="isProAccount ? 'i-lucide-cloud-check' : 'i-lucide-key-round'" class="size-4" />
          </div>

          <div class="min-w-0">
          <p class="text-sm font-bold text-default">
            {{ isProAccount ? settingsCopy.cloudSyncActive : settingsCopy.cloudSyncLocked }}
          </p>
            <p class="truncate text-xs text-muted">
              {{ isProAccount ? settingsCopy.cloudSyncActiveDesc : settingsCopy.cloudSyncLockedDesc }}
            </p>
          </div>
        </div>

        <UButton
          v-if="!isProAccount"
          icon="i-lucide-key-round"
          class="h-10 min-w-28 shrink-0 justify-center rounded-full bg-slate-900 px-4 text-sm font-bold text-white shadow-[0_14px_28px_-18px_rgba(15,23,42,0.55)] transition active:scale-95 dark:bg-white dark:text-slate-950"
          @click="openProRedeemModal"
        >
          {{ settingsCopy.upgrade }}
        </UButton>

        <UBadge v-else color="emerald" variant="solid" icon="i-lucide-cloud-check" class="rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] shadow-sm">
          {{ settingsCopy.active }}
        </UBadge>
      </div>
    </section>

    <section class="overflow-hidden rounded-[1.25rem] border border-slate-200/80 bg-white/80 shadow-[0_12px_40px_-28px_rgba(15,23,42,0.2)] dark:border-slate-800 dark:bg-slate-950/70">
      <div class="px-4 py-4">
        <h2 class="text-sm font-black tracking-tight text-default">{{ settingsCopy.general }}</h2>
      </div>

      <div class="space-y-3 border-t border-slate-200/80 px-4 py-4 dark:border-slate-800">
        <div class="flex items-center justify-between gap-3">
          <div class="min-w-0">
            <p class="text-sm font-bold text-default">{{ settingsCopy.language }}</p>
            <p class="text-xs text-muted">{{ settingsCopy.chooseLanguage }}</p>
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

      <div class="space-y-3 border-t border-slate-200/80 px-4 py-4 dark:border-slate-800">
        <div class="flex items-center justify-between gap-3">
          <div class="min-w-0">
            <p class="text-sm font-bold text-default">{{ settingsCopy.appearance }}</p>
            <p class="text-xs text-muted">{{ settingsCopy.themeMode }}</p>
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
            @click="setTheme(choice.value)"
          >
            {{ choice.label }}
          </button>
        </div>

        <div class="rounded-[1.1rem] border border-slate-200/80 bg-slate-50 px-3 py-3 dark:border-slate-800 dark:bg-slate-900">
          <div class="flex items-center justify-between gap-3">
            <div class="min-w-0">
              <p class="text-sm font-bold text-default">{{ settingsCopy.colorTheme }}</p>
              <p class="text-xs text-muted">{{ settingsCopy.colorThemeDesc }}</p>
            </div>
            <UBadge color="neutral" variant="soft" class="rounded-full">
              {{ selectedThemeColorLabel }}
            </UBadge>
          </div>

          <div class="mt-3 flex items-center gap-3 rounded-[1rem] border border-slate-200/80 bg-white px-3 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div
              :class="['flex size-14 shrink-0 items-center justify-center rounded-[1.25rem] text-white shadow-[0_14px_28px_-18px_rgba(15,23,42,0.35)]', activeTheme.accent]"
            >
              <span class="text-[1.6rem] leading-none">💸</span>
            </div>

            <div class="min-w-0 flex-1">
              <p class="text-sm font-bold text-default">{{ settingsCopy.colorThemePreview }}</p>
              <p class="truncate text-xs text-muted">{{ settingsCopy.colorThemeSaved }}</p>
            </div>

            <UBadge color="primary" variant="soft" class="rounded-full text-[10px] font-black uppercase tracking-[0.18em]">
              {{ settingsCopy.recommended }}
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
      <div class="flex items-center justify-between gap-3 px-4 py-4">
        <div class="min-w-0">
          <h2 class="text-sm font-black tracking-tight text-default">{{ settingsCopy.category }}</h2>
          <p class="text-xs text-muted">{{ settingsCopy.categoryDesc }}</p>
        </div>

        <UButton
          to="/categories"
          icon="i-lucide-tags"
          class="h-10 rounded-full bg-gradient-to-r from-sky-500 to-cyan-400 px-4 text-sm font-bold text-white shadow-[0_14px_28px_-18px_rgba(14,165,233,0.65)] transition active:scale-95"
        >
          {{ settingsCopy.manage }}
        </UButton>
      </div>
    </section>

    <section class="overflow-hidden rounded-[1.25rem] border border-slate-200/80 bg-white/80 shadow-[0_12px_40px_-28px_rgba(15,23,42,0.2)] dark:border-slate-800 dark:bg-slate-950/70">
      <div class="flex items-center justify-between gap-3 px-4 py-4">
        <div class="min-w-0">
          <h2 class="text-sm font-black tracking-tight text-default">{{ settingsCopy.company }}</h2>
          <p class="text-xs text-muted">{{ settingsCopy.companyDesc }}</p>
        </div>

        <UButton
          type="button"
          icon="i-lucide-building-2"
          class="h-10 rounded-full bg-gradient-to-r from-indigo-500 to-violet-400 px-4 text-sm font-bold text-white shadow-[0_14px_28px_-18px_rgba(99,102,241,0.65)] transition active:scale-95"
          @click="openCompaniesPage"
        >
          {{ settingsCopy.manage }}
        </UButton>
      </div>
    </section>

    <section class="overflow-hidden rounded-[1.25rem] border border-slate-200/80 bg-white/80 shadow-[0_12px_40px_-28px_rgba(15,23,42,0.2)] dark:border-slate-800 dark:bg-slate-950/70">
      <div class="flex items-center justify-between gap-3 px-4 py-4">
        <div class="min-w-0">
          <h2 class="text-sm font-black tracking-tight text-default">{{ settingsCopy.currency }}</h2>
          <p class="text-xs text-muted">{{ settingsCopy.currencyDesc }}</p>
        </div>
        <UBadge color="neutral" variant="soft" class="rounded-full">
          {{ enabledCurrencyOptions.length }}/{{ currencyOptions.length }}
        </UBadge>
      </div>

      <div class="border-t border-slate-200/80 px-4 py-2 dark:border-slate-800">
        <div
          v-for="item in currencyOptions"
          :key="item.value"
          class="flex items-center justify-between gap-3 py-3"
          :class="item.value !== currencyOptions[currencyOptions.length - 1].value ? 'border-b border-slate-200/80 dark:border-slate-800' : ''"
        >
          <div class="flex min-w-0 items-center gap-3">
            <div class="flex size-10 items-center justify-center rounded-[0.9rem] bg-slate-100 text-base font-black text-default shadow-sm dark:bg-slate-900">
              {{ currencySymbols[item.value] }}
            </div>
            <div class="min-w-0">
              <p class="text-sm font-bold text-default">{{ item.label }}</p>
              <p class="text-xs text-muted">{{ isCurrencyEnabled(item.value) ? settingsCopy.active : settingsCopy.disabled }}</p>
            </div>
          </div>

          <button
            type="button"
            class="relative inline-flex h-7 w-12 shrink-0 items-center rounded-full p-0.5 transition duration-200 ease-out active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            :class="isCurrencyEnabled(item.value) ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-700'"
            :disabled="isCurrencyEnabled(item.value) && enabledCurrencyOptions.length <= 1"
            :aria-pressed="isCurrencyEnabled(item.value)"
            @click="toggleCurrencyEnabled(item.value)"
          >
            <span
              class="inline-block size-6 rounded-full bg-white shadow-sm ring-1 ring-black/5 transition duration-200 ease-out"
              :class="isCurrencyEnabled(item.value) ? 'translate-x-5' : 'translate-x-0'"
            />
          </button>
        </div>
      </div>
    </section>

    <section class="overflow-hidden rounded-[1.25rem] border border-slate-200/80 bg-white/80 shadow-[0_12px_40px_-28px_rgba(15,23,42,0.2)] dark:border-slate-800 dark:bg-slate-950/70">
      <div class="px-4 py-4">
        <div class="flex items-center justify-between gap-3">
          <div class="min-w-0">
            <h2 class="text-sm font-black tracking-tight text-default">{{ settingsCopy.sync }}</h2>
            <p class="text-xs text-muted">{{ settingsCopy.syncDesc }}</p>
          </div>
          <UBadge color="neutral" variant="soft" class="rounded-full">
          {{ syncStateCopy.badge }}
          </UBadge>
        </div>

        <div class="mt-3 flex items-center gap-3 rounded-[1.1rem] border border-slate-200/80 bg-slate-50 px-3 py-3 dark:border-slate-800 dark:bg-slate-900">
          <div :class="['flex size-10 shrink-0 items-center justify-center rounded-full text-white shadow-lg', syncStateCopy.tone === 'emerald' ? 'bg-gradient-to-br from-emerald-500 to-teal-400' : syncStateCopy.tone === 'sky' ? 'bg-gradient-to-br from-sky-500 to-cyan-400' : syncStateCopy.tone === 'amber' ? 'bg-gradient-to-br from-amber-500 to-orange-400' : 'bg-gradient-to-br from-rose-500 to-pink-400']">
            <UIcon :name="syncStateCopy.icon" class="size-4" />
          </div>

          <div class="min-w-0">
            <p class="text-sm font-bold text-default">{{ syncStateCopy.label }}</p>
            <p class="text-xs leading-5 text-muted">{{ syncStateCopy.message }}</p>
          </div>
        </div>

        <div class="mt-3 rounded-[1.1rem] border border-slate-200/80 bg-white px-3 py-3 dark:border-slate-800 dark:bg-slate-950">
          <div class="flex items-center justify-between gap-3">
            <p class="text-xs font-bold uppercase tracking-[0.16em] text-muted">{{ settingsCopy.uploadProgress }}</p>
            <UBadge color="neutral" variant="soft" class="rounded-full text-[10px] font-bold uppercase tracking-[0.16em]">
              {{ syncProgressLabel }}
            </UBadge>
          </div>

          <div class="mt-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              class="h-full rounded-full bg-gradient-to-r from-sky-500 via-blue-500 to-cyan-400 transition-all duration-300"
              :style="{ width: `${syncProgress}%` }"
            />
          </div>

          <p class="mt-2 text-[11px] leading-5 text-muted">
            {{ syncStatus === 'synced' ? settingsCopy.syncedAll : syncStatus === 'syncing' ? settingsCopy.syncingUpload : syncStatus === 'offline' ? settingsCopy.waitingUpload : settingsCopy.pendingUpload }}
          </p>
        </div>
      </div>
    </section>

    <section class="overflow-hidden rounded-[1.25rem] border border-slate-200/80 bg-white/80 shadow-[0_12px_40px_-28px_rgba(15,23,42,0.2)] dark:border-slate-800 dark:bg-slate-950/70">
      <div class="px-4 py-4">
        <div class="min-w-0">
          <h2 class="text-sm font-black tracking-tight text-default">{{ settingsCopy.dangerZone }}</h2>
          <p class="text-xs text-muted">{{ settingsCopy.dangerDesc }}</p>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-2 border-t border-slate-200/80 px-4 py-4 dark:border-slate-800">
        <UButton class="h-12 min-w-0 rounded-2xl px-2 text-xs sm:px-4 sm:text-sm" color="rose" variant="soft" @click="resetDemoData">
          {{ settingsCopy.reset }}
        </UButton>

        <UButton class="h-12 min-w-0 rounded-2xl px-2 text-xs sm:px-4 sm:text-sm" color="neutral" variant="soft" icon="i-lucide-log-out" @click="handleLogout">
          {{ settingsCopy.logout }}
        </UButton>
      </div>
    </section>

    <UModal
      v-model:open="proRedeemModalOpen"
      :title="settingsCopy.upgradeModalTitle"
      :description="settingsCopy.upgradeModalDesc"
    >
      <template #body>
        <div class="space-y-4">
          <div class="rounded-[1rem] border border-slate-200/80 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900">
            <p class="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted">{{ settingsCopy.account }}</p>
            <p class="mt-1 break-all text-sm font-black text-default">{{ sessionProfile?.identifier }}</p>
            <p class="mt-1 text-xs text-muted">{{ settingsCopy.keyActivate }}</p>
          </div>

          <div class="space-y-2">
            <p class="text-sm font-bold text-default">{{ settingsCopy.redeemKey }}</p>
            <UInput
              v-model="proRedeemKey"
              :placeholder="settingsCopy.redeemPlaceholder"
              inputmode="text"
              autocomplete="off"
              autocapitalize="characters"
              autocorrect="off"
              spellcheck="false"
              class="w-full rounded-2xl"
              size="lg"
              @keyup.enter="submitProRedeem"
            />
          </div>

          <p v-if="proRedeemError" class="text-sm font-semibold text-rose-600 dark:text-rose-300">
            {{ proRedeemError }}
          </p>
        </div>
      </template>

      <template #footer>
        <div class="grid grid-cols-2 gap-3">
          <UButton
            class="h-12 w-full justify-center rounded-full border border-slate-200 bg-white px-4 text-sm font-bold text-default shadow-none hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900"
            variant="soft"
            @click="proRedeemModalOpen = false"
          >
            {{ settingsCopy.cancel }}
          </UButton>
          <UButton
            :loading="isRedeemingPro"
            icon="i-lucide-badge-check"
            class="h-12 w-full justify-center rounded-full bg-gradient-to-r from-sky-500 to-cyan-400 px-4 text-sm font-bold text-white shadow-[0_14px_28px_-18px_rgba(14,165,233,0.65)] transition active:scale-95 dark:text-white"
            @click="submitProRedeem"
          >
            {{ settingsCopy.activate }}
          </UButton>
        </div>
      </template>
    </UModal>

  </div>
</template>
