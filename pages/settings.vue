<script setup lang="ts">
import { currencyOptions, currencySymbols } from '~/composables/useMoneyNote'

const { selectedLanguage } = useAppLanguage()
const {
  enabledCurrencyOptions,
  isCurrencyEnabled,
  toggleCurrencyEnabled,
  clearLocalAccountState,
  isCloudSyncEnabled,
  syncStatus,
  lastSyncedAt,
  syncProgress,
  isOnline
} = useMoneyNote()
const { signOut, sessionProfile, rememberedProfile, setSessionPlan, setProfileAvatar } = useDeviceAuth()
const colorMode = useColorMode()
const { selectedThemeColor, activeTheme, appThemeColorOptions, setThemeColor } = useAppThemeColor()
const router = useRouter()
const isRedeemingPro = ref(false)
const proRedeemModalOpen = ref(false)
const proRedeemKey = ref('')
const proRedeemError = ref('')
const profileAvatarModalOpen = ref(false)
const logoutConfirmModalOpen = ref(false)
const profileAvatarDraftType = ref<'emoji' | 'icon'>('icon')
const profileAvatarDraftEmojiValue = ref('🙂')
const profileAvatarDraftIconValue = ref('i-lucide-user-round')

function normalizeAvatarValue(avatarType: 'emoji' | 'icon', avatarValue?: string | null) {
  const normalizedAvatarValue = avatarValue?.trim() ?? ''
  if (!normalizedAvatarValue) return avatarType === 'icon' ? 'i-lucide-user-round' : '🙂'

  if (avatarType === 'icon') {
    if (normalizedAvatarValue.startsWith('i-')) return normalizedAvatarValue
    if (normalizedAvatarValue.startsWith('lucide-')) return `i-${normalizedAvatarValue}`
    return `i-lucide-${normalizedAvatarValue}`
  }

  return normalizedAvatarValue
}

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
      editProfile: 'ແກ້ໄຂໂປຣໄຟລ໌',
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
      internet: 'ເນັດ',
      internetConnected: 'ເຊື່ອມຕໍ່ແລ້ວ',
      internetDisconnected: 'ບໍ່ມີເນັດ',
      signal: 'ສັນຍານ',
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
      logoutConfirmTitle: 'ຢືນຢັນການອອກ',
      logoutConfirmDesc: 'ການອອກຈາກລະບົບຈະນຳເຄື່ອງນີ້ອອກຈາກບັນຊີປັດຈຸບັນ.',
      logoutConfirmCancel: 'ຍົກເລີກ',
      logoutConfirmAction: 'ອອກຈາກລະບົບ',
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
      activate: 'ເປີດໃຊ້',
      avatarModalTitle: 'ແກ້ໄຂໂປຣໄຟລ໌',
      avatarModalDesc: 'ເລືອກ emoji ຫຼື icon ສຳລັບໂປຣໄຟລ໌.',
      chooseAvatarType: 'ຮູບແບບ',
      emoji: 'ອີໂມຈິ',
      icon: 'ໄອຄອນ',
      saveAvatar: 'ບັນທຶກ'
    }
  }

  return {
    settings: 'Settings',
    profile: 'Profile',
    emailAccount: 'Email account',
    phoneAccount: 'Phone account',
    signedIn: 'Signed in',
    editProfile: 'Edit profile',
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
    internet: 'Internet',
    internetConnected: 'Connected',
    internetDisconnected: 'Offline',
    signal: 'Signal',
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
    logoutConfirmTitle: 'Confirm sign out',
    logoutConfirmDesc: 'Signing out will remove this device from the current account.',
    logoutConfirmCancel: 'Cancel',
    logoutConfirmAction: 'Sign out',
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
    activate: 'Activate',
    avatarModalTitle: 'Edit profile',
    avatarModalDesc: 'Choose an emoji or icon for your profile.',
    chooseAvatarType: 'Style',
    emoji: 'Emoji',
    icon: 'Icon',
    saveAvatar: 'Save'
  }
})

const selectedThemeColorLabel = computed(() => {
  return themeColorChoices.value.find(choice => choice.value === selectedThemeColor.value)?.label ?? activeTheme.label
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
const profileAvatarType = computed(() => sessionProfile.value?.avatarType ?? rememberedProfile.value?.avatarType ?? 'icon')
const profileAvatarValue = computed(() => normalizeAvatarValue(
  profileAvatarType.value,
  sessionProfile.value?.avatarValue ?? rememberedProfile.value?.avatarValue ?? 'i-lucide-user-round'
))
const profileAvatarIsEmoji = computed(() => profileAvatarType.value === 'emoji')
const profileAvatarEmojiOptions = [
  '🙂',
  '😎',
  '🥳',
  '🤩',
  '😇',
  '😁',
  '😊',
  '😌',
  '🧑',
  '👩',
  '🧔',
  '🧒',
  '👦',
  '👧',
  '👨',
  '👩‍🦰',
  '👨‍🦰',
  '👨‍👩‍👧‍👦',
  '🧑‍🤝‍🧑',
  '🧑‍💻',
  '👩‍💻',
  '🧑‍🎓',
  '🧑‍🚀',
  '🧑‍✈️',
  '🧑‍🏫',
  '🧑‍🍳',
  '🧑‍🔧',
  '🧑‍🎨',
  '🧑‍🚒',
  '🐶',
  '🐱',
  '🐻',
  '🦊',
  '🐰',
  '🐼',
  '🐨',
  '🦁',
  '🐯',
  '🐵',
  '🐸',
  '🦄',
  '🐥',
  '🦉',
  '🐷',
  '🐮',
  '🐹',
  '🐻‍❄️',
  '🐙',
  '🐬',
  '🐝',
  '🐼',
  '✨',
  '💎',
  '🎯',
  '🎮',
  '🎨',
  '🎧',
  '📚',
  '💼',
  '☕',
  '🫶',
  '👋',
  '💙',
  '💜',
  '🩷',
  '💚',
  '🧡',
  '🔥'
]
const profileAvatarIconOptions = [
  'i-lucide-baby',
  'i-lucide-person-standing',
  'i-lucide-angry',
  'i-lucide-badge-dollar-sign',
  'i-lucide-banknote',
  'i-lucide-book-minus',
  'i-lucide-book-open',
  'i-lucide-award',
  'i-lucide-alarm-clock',
  'i-lucide-backpack',
  'i-lucide-battery-charging',
  'i-lucide-chess-queen',
  'i-lucide-cat',
  'i-lucide-chart-spline',
  'i-lucide-dog',
  'i-lucide-handbag',
  'i-lucide-ghost',
  'i-lucide-frown',
  'i-lucide-fingerprint',
  'i-lucide-brain',
  'i-lucide-crown',
  'i-lucide-heart',
  'i-lucide-sparkles',
  'i-lucide-rocket',
  'i-lucide-shield-user',
  'i-lucide-shield-check',
  'i-lucide-globe',
  'i-lucide-music',
  'i-lucide-coffee',
  'i-lucide-camera',
  'i-lucide-car-front',
  'i-lucide-clipboard-list',
  'i-lucide-cloud',
  'i-lucide-dice-5',
  'i-lucide-gift',
  'i-lucide-laptop',
  'i-lucide-pizza',
  'i-lucide-shirt',
  'i-lucide-wallet',
  'i-lucide-building-2',
  'i-lucide-megaphone',
  'i-lucide-gamepad-2',
  'i-lucide-alien',
  'i-lucide-award',
  'i-lucide-balloon',
  'i-lucide-binoculars',
  'i-lucide-book-user',
  'i-lucide-brush',
  'i-lucide-bus-front',
  'i-lucide-cake',
  'i-lucide-cake-slice',
  'i-lucide-compass',
  'i-lucide-hand-heart',
  'i-lucide-handshake',
  'i-lucide-headphones',
  'i-lucide-graduation-cap',
  'i-lucide-key-round',
  'i-lucide-leaf',
  'i-lucide-medal',
  'i-lucide-mic',
  'i-lucide-pen-tool',
  'i-lucide-stethoscope',
  'i-lucide-tractor',
  'i-lucide-umbrella',
  'i-lucide-wand-sparkles',
  'i-lucide-house',
  'i-lucide-shirt'
]

function openProfileAvatarModal() {
  profileAvatarDraftType.value = profileAvatarType.value
  if (profileAvatarType.value === 'emoji') {
    profileAvatarDraftEmojiValue.value = profileAvatarValue.value
    profileAvatarDraftIconValue.value = 'i-lucide-user-round'
  }
  else {
    profileAvatarDraftIconValue.value = normalizeAvatarValue('icon', profileAvatarValue.value)
    profileAvatarDraftEmojiValue.value = '🙂'
  }
  profileAvatarModalOpen.value = true
}

function saveProfileAvatar() {
  setProfileAvatar(
    profileAvatarDraftType.value,
    profileAvatarDraftType.value === 'emoji'
      ? profileAvatarDraftEmojiValue.value
      : profileAvatarDraftIconValue.value
  )
  profileAvatarModalOpen.value = false
}

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
  logoutConfirmModalOpen.value = true
}

function confirmLogout() {
  logoutConfirmModalOpen.value = false
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
const internetStatusCopy = computed(() => {
  if (selectedLanguage.value === 'lo') {
    return {
      title: settingsCopy.value.internet,
      label: isOnline.value ? settingsCopy.value.internetConnected : settingsCopy.value.internetDisconnected,
      signal: settingsCopy.value.signal
    }
  }

  return {
    title: settingsCopy.value.internet,
    label: isOnline.value ? settingsCopy.value.internetConnected : settingsCopy.value.internetDisconnected,
    signal: settingsCopy.value.signal
  }
})
</script>

<template>
  <div class="space-y-6 pb-8">
    <section class="space-y-1">
      <h1 class="text-3xl font-black tracking-tight text-default">{{ settingsCopy.settings }}</h1>
    </section>

    <section class="overflow-hidden rounded-[1.25rem] border border-slate-200/80 bg-white shadow-[0_12px_40px_-28px_rgba(15,23,42,0.2)] dark:border-slate-800 dark:bg-slate-950/70">
      <div class="flex items-start gap-4 px-4 py-4">
        <button
          type="button"
          class="group relative flex size-14 shrink-0 items-center justify-center rounded-[1.35rem] bg-gradient-to-br text-white shadow-[0_14px_28px_-18px_rgba(15,23,42,0.3)] transition active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          :class="activeTheme.accent"
          :aria-label="settingsCopy.editProfile"
          @click="openProfileAvatarModal"
        >
          <span v-if="profileAvatarIsEmoji" class="text-[1.75rem] leading-none">{{ profileAvatarValue }}</span>
          <UIcon v-else :name="profileAvatarValue" class="size-7" />

          <span
            :class="['absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br text-white shadow-[0_10px_18px_-10px_rgba(15,23,42,0.35)]', activeTheme.accent]"
          >
            <UIcon name="i-lucide-pencil" class="size-3" />
          </span>
        </button>

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

    <section class="overflow-hidden rounded-[1.25rem] border border-slate-200/80 bg-white/80 shadow-[0_12px_40px_-28px_rgba(15,23,42,0.2)] dark:border-slate-800 dark:bg-slate-950/70">
      <div class="px-4 py-4">
        <div class="mb-3 rounded-[1.1rem] border border-slate-200/80 bg-slate-50 px-3 py-3 dark:border-slate-800 dark:bg-slate-900">
          <div class="flex items-center justify-between gap-3">
            <div class="flex min-w-0 items-center gap-3">
              <div :class="['flex size-10 shrink-0 items-center justify-center rounded-full text-white shadow-lg', isOnline ? 'bg-gradient-to-br from-emerald-500 to-teal-400' : 'bg-gradient-to-br from-rose-500 to-pink-400']">
                <UIcon :name="isOnline ? 'i-lucide-wifi' : 'i-lucide-wifi-off'" class="size-4" />
              </div>

              <div class="min-w-0">
                <p class="text-sm font-bold text-default">{{ internetStatusCopy.title }}</p>
                <p class="text-xs leading-5 text-muted">{{ internetStatusCopy.label }}</p>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <UBadge :color="isOnline ? 'emerald' : 'rose'" variant="soft" class="rounded-full text-[10px] font-bold uppercase tracking-[0.16em]">
                {{ isOnline ? internetStatusCopy.label : internetStatusCopy.label }}
              </UBadge>

              <div class="flex items-end gap-0.5" :aria-label="internetStatusCopy.signal">
                <span
                  class="block w-1 rounded-full transition-all"
                  :class="isOnline ? 'h-2.5 bg-emerald-500' : 'h-1.5 bg-rose-400'"
                />
                <span
                  class="block w-1 rounded-full transition-all"
                  :class="isOnline ? 'h-4 bg-emerald-500/90' : 'h-2.5 bg-rose-400/80'"
                />
                <span
                  class="block w-1 rounded-full transition-all"
                  :class="isOnline ? 'h-5 bg-emerald-500' : 'h-3.5 bg-rose-400/60'"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-between gap-3">
          <div class="min-w-0">
            <h2 class="text-sm font-black tracking-tight text-default">{{ settingsCopy.sync }}</h2>
            <p class="text-xs text-muted">{{ settingsCopy.syncDesc }}</p>
          </div>
          <UBadge v-if="isCloudSyncEnabled" color="neutral" variant="soft" class="rounded-full">
            {{ syncStateCopy.badge }}
          </UBadge>
          <UBadge v-else color="neutral" variant="soft" icon="i-lucide-key-round" class="min-w-max whitespace-nowrap rounded-full px-3">
            {{ settingsCopy.cloudSyncLocked }}
          </UBadge>
        </div>

        <template v-if="isCloudSyncEnabled">
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
        </template>
        <div v-else class="mt-3 rounded-[1.1rem] border border-slate-200/80 bg-slate-50 px-3 py-3 opacity-90 dark:border-slate-800 dark:bg-slate-900">
          <div class="flex items-center gap-3">
            <div class="flex size-10 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
              <UIcon name="i-lucide-key-round" class="size-4" />
            </div>
            <div class="min-w-0">
              <p class="text-sm font-bold text-default">{{ settingsCopy.cloudSyncLocked }}</p>
              <p class="text-xs leading-5 text-muted">{{ settingsCopy.cloudSyncLockedDesc }}</p>
            </div>
          </div>

          <UButton
            icon="i-lucide-badge-plus"
            class="mt-3 h-10 w-full justify-center rounded-full bg-black px-4 text-sm font-bold text-white shadow-[0_14px_28px_-18px_rgba(15,23,42,0.45)] transition hover:bg-black/90 active:scale-95 dark:bg-white dark:text-black dark:shadow-[0_14px_28px_-18px_rgba(255,255,255,0.2)] dark:hover:bg-white/90"
            @click="openProRedeemModal"
          >
            {{ settingsCopy.upgradeToPro }}
          </UButton>
        </div>
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
              :class="['flex size-14 shrink-0 items-center justify-center rounded-[1.25rem] bg-gradient-to-br text-white shadow-[0_14px_28px_-18px_rgba(15,23,42,0.35)]', activeTheme.accent]"
            >
              <span v-if="profileAvatarIsEmoji" class="text-[1.75rem] leading-none">{{ profileAvatarValue }}</span>
              <UIcon v-else :name="profileAvatarValue" class="size-7" />
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
          :class="[
            'h-10 rounded-full bg-gradient-to-r px-4 text-sm font-bold text-white shadow-[0_14px_28px_-18px_rgba(15,23,42,0.35)] transition active:scale-95',
            activeTheme.accent
          ]"
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
          :class="[
            'h-10 rounded-full bg-gradient-to-r px-4 text-sm font-bold text-white shadow-[0_14px_28px_-18px_rgba(15,23,42,0.35)] transition active:scale-95',
            activeTheme.accent
          ]"
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
        <div class="min-w-0">
          <h2 class="text-sm font-black tracking-tight text-default">{{ settingsCopy.dangerZone }}</h2>
          <p class="text-xs text-muted">{{ settingsCopy.dangerDesc }}</p>
        </div>
      </div>

      <div class="border-t border-slate-200/80 px-4 py-4 dark:border-slate-800">
        <UButton class="h-12 w-full justify-center rounded-2xl bg-gradient-to-r from-rose-500 to-red-400 px-2 text-xs font-bold text-white shadow-[0_14px_28px_-18px_rgba(239,68,68,0.5)] transition active:scale-95 sm:px-4 sm:text-sm" icon="i-lucide-log-out" @click="handleLogout">
          {{ settingsCopy.logout }}
        </UButton>
      </div>
    </section>

    <UModal
      v-model:open="logoutConfirmModalOpen"
      :title="settingsCopy.logoutConfirmTitle"
      :description="settingsCopy.logoutConfirmDesc"
    >
      <template #body>
        <div class="space-y-4">
          <div class="flex items-start gap-3 rounded-[1rem] border border-rose-200 bg-rose-50 p-4 text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-100">
            <div class="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-red-400 text-white shadow-lg">
              <UIcon name="i-lucide-log-out" class="size-4" />
            </div>
            <div class="min-w-0">
              <p class="text-sm font-bold">{{ settingsCopy.logoutConfirmTitle }}</p>
              <p class="mt-1 text-xs leading-5 opacity-90">{{ settingsCopy.logoutConfirmDesc }}</p>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <UButton
              class="h-12 w-full justify-center rounded-full border border-slate-200 bg-white px-4 text-sm font-bold text-default shadow-none hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900"
              variant="soft"
              @click="logoutConfirmModalOpen = false"
            >
              {{ settingsCopy.logoutConfirmCancel }}
            </UButton>
            <UButton
              class="h-12 w-full justify-center rounded-full bg-gradient-to-r from-rose-500 to-red-400 px-4 text-sm font-bold text-white shadow-[0_14px_28px_-18px_rgba(239,68,68,0.5)] transition active:scale-95"
              icon="i-lucide-log-out"
              @click="confirmLogout"
            >
              {{ settingsCopy.logoutConfirmAction }}
            </UButton>
          </div>
        </div>
      </template>
    </UModal>

    <USlideover
      v-model:open="profileAvatarModalOpen"
      side="bottom"
      :close="false"
      :ui="{
        content: 'w-full overflow-hidden rounded-t-[1.5rem] border border-slate-200/80 bg-white shadow-[0_-18px_60px_-30px_rgba(15,23,42,0.35)] dark:border-slate-800 dark:bg-slate-950 data-[state=open]:animate-[slide-in-from-bottom_220ms_ease-out] data-[state=closed]:animate-[slide-out-to-bottom_220ms_ease-in] md:mx-auto md:mb-4 md:w-[min(42rem,calc(100%-2rem))] md:rounded-[1.5rem]',
        body: 'p-0',
        header: 'p-0',
        footer: 'p-0'
      }"
    >
      <template #content="{ close }">
        <div class="flex max-h-[86svh] flex-col overflow-hidden">
          <div class="shrink-0 border-b border-slate-200/80 px-4 pb-4 pt-2 dark:border-slate-800">
            <div class="mx-auto mb-2 h-1.5 w-12 rounded-full bg-slate-300/80 dark:bg-slate-700" />

            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <p class="text-xs font-semibold uppercase tracking-[0.18em] text-muted">{{ settingsCopy.avatarModalTitle }}</p>
                <p class="mt-1 text-[11px] text-muted">{{ settingsCopy.avatarModalDesc }}</p>
              </div>

              <button
                type="button"
                class="flex size-9 items-center justify-center rounded-full bg-slate-100 text-muted transition active:scale-95 dark:bg-slate-900"
                :aria-label="settingsCopy.cancel"
                @click="close()"
              >
                <UIcon name="i-lucide-x" class="size-4" />
              </button>
            </div>

            <div class="mt-4 flex items-center justify-center">
              <div :class="['flex size-20 items-center justify-center rounded-[1.5rem] bg-gradient-to-br text-white shadow-[0_16px_30px_-18px_rgba(14,165,233,0.6)]', activeTheme.accent]">
                <span v-if="profileAvatarDraftType === 'emoji'" class="text-[2.2rem] leading-none">{{ profileAvatarDraftEmojiValue }}</span>
                <UIcon v-else :name="profileAvatarDraftIconValue" class="size-10" />
              </div>
            </div>

            <div class="mt-4 grid grid-cols-2 gap-2 rounded-full bg-slate-100 p-1.5 dark:bg-slate-900">
              <button
                type="button"
                class="rounded-full px-3 py-2.5 text-sm font-bold transition active:scale-95"
                :class="profileAvatarDraftType === 'emoji' ? 'bg-white text-primary shadow-sm dark:bg-slate-800' : 'text-muted'"
                @click="profileAvatarDraftType = 'emoji'"
              >
                {{ settingsCopy.emoji }}
              </button>
              <button
                type="button"
                class="rounded-full px-3 py-2.5 text-sm font-bold transition active:scale-95"
                :class="profileAvatarDraftType === 'icon' ? 'bg-white text-primary shadow-sm dark:bg-slate-800' : 'text-muted'"
                @click="profileAvatarDraftType = 'icon'"
              >
                {{ settingsCopy.icon }}
              </button>
            </div>
          </div>

          <div class="flex-1 overflow-y-auto px-4 py-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
            <div v-if="profileAvatarDraftType === 'emoji'" class="grid grid-cols-4 gap-2">
              <button
                v-for="item in profileAvatarEmojiOptions"
                :key="item"
                type="button"
                class="flex h-14 items-center justify-center rounded-[1rem] border border-slate-200 bg-white text-2xl transition active:scale-95 dark:border-slate-800 dark:bg-slate-950"
                :class="profileAvatarDraftEmojiValue === item ? 'border-primary ring-2 ring-primary/20' : ''"
                @click="profileAvatarDraftEmojiValue = item"
              >
                {{ item }}
              </button>
            </div>

            <div v-else class="grid grid-cols-4 gap-2">
              <button
                v-for="item in profileAvatarIconOptions"
                :key="item"
                type="button"
                class="flex h-14 items-center justify-center rounded-[1rem] border border-slate-200 bg-white text-slate-700 transition active:scale-95 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                :class="profileAvatarDraftIconValue === item ? 'border-primary ring-2 ring-primary/20' : ''"
                @click="profileAvatarDraftIconValue = item"
              >
                <UIcon :name="item" class="size-6" />
              </button>
            </div>
          </div>

          <div class="shrink-0 border-t border-slate-200/80 bg-white/96 px-4 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/96">
            <div class="grid grid-cols-2 gap-3">
              <UButton
                class="h-12 w-full justify-center rounded-full border border-slate-200 bg-white px-4 text-sm font-bold text-default shadow-none hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900"
                variant="soft"
                @click="close()"
              >
                {{ settingsCopy.cancel }}
              </UButton>
              <UButton
                :class="['h-12 w-full justify-center rounded-full bg-gradient-to-r px-4 text-sm font-bold text-white shadow-[0_14px_28px_-18px_rgba(14,165,233,0.65)] transition active:scale-95 dark:text-white', activeTheme.accent]"
                icon="i-lucide-check"
                @click="saveProfileAvatar(); close()"
              >
                {{ settingsCopy.saveAvatar }}
              </UButton>
            </div>
          </div>
        </div>
      </template>
    </USlideover>

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
            class="h-12 w-full justify-center rounded-full bg-black px-4 text-sm font-bold text-white shadow-[0_14px_28px_-18px_rgba(15,23,42,0.45)] transition hover:bg-black/90 active:scale-95 focus-visible:ring-2 focus-visible:ring-slate-400/30 dark:bg-white dark:text-slate-950 dark:shadow-[0_14px_28px_-18px_rgba(255,255,255,0.18)] dark:hover:bg-white/90 dark:focus-visible:ring-white/30"
            @click="submitProRedeem"
          >
            {{ settingsCopy.activate }}
          </UButton>
        </div>
      </template>
    </UModal>

  </div>
</template>
