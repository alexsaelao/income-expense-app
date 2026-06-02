<script setup lang="ts">
import {
  currencyOptions,
  currencySymbols,
  parseMoneyNoteBackupFile
} from '~/composables/useMoneyNote'
import type { MoneyNoteBackupFile } from '~/composables/useMoneyNote'

const { selectedLanguage } = useAppLanguage()
const {
  store,
  enabledCurrencyOptions,
  createMoneyNoteBackupFile: buildMoneyNoteBackupFile,
  importMoneyNoteBackupFile,
  isCurrencyEnabled,
  toggleCurrencyEnabled,
  clearLocalAccountState,
  isCloudSyncEnabled,
  syncStatus,
  lastSyncedAt,
  syncProgress,
  isOnline
} = useMoneyNote()
const { signOut, sessionProfile, rememberedProfile, authReady, setSessionPlan, setProfileAvatar } = useDeviceAuth()
const colorMode = useColorMode()
const { selectedThemeColor, activeTheme, appThemeColorOptions, setThemeColor } = useAppThemeColor()
const router = useRouter()
const isRedeemingPro = ref(false)
const isPastingProKey = ref(false)
const proRedeemModalOpen = ref(false)
const proRedeemKey = ref('')
const proRedeemError = ref('')
const proRedeemInputRef = ref<{ inputRef?: HTMLInputElement | null } | null>(null)
const profileAvatarModalOpen = ref(false)
const logoutConfirmModalOpen = ref(false)
const profileAvatarDraftType = ref<'emoji' | 'icon'>('icon')
const profileAvatarDraftEmojiValue = ref('🙂')
const profileAvatarDraftIconValue = ref('i-lucide-user-round')
const storageImportModalOpen = ref(false)
const storageExportModalOpen = ref(false)
const storageExportBusy = ref(false)
const storageExportError = ref('')
const storageImportBusy = ref(false)
const storageImportError = ref('')
const storageImportFileName = ref('')
const storageImportPending = ref<MoneyNoteBackupFile | null>(null)
const storageExportFileName = ref('')
const storageExportPending = ref<MoneyNoteBackupFile | null>(null)
const storageImportInputRef = ref<HTMLInputElement | null>(null)
const storageNotice = ref('')

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
      cloudSyncReady: 'ຊິງຄລາວເເລ້ວ',
      waitingToSync: 'ລໍຖ້າຊິງ',
      waiting: 'ລໍຖ້າ',
      uploadProgress: 'ຄວາມຄືບໜ້າການອັບໂຫຼດ',
      syncedAll: 'ຂໍ້ມູນໃນເຄື່ອງນີ້ກົງກັບຄລາວແລ້ວ.',
      syncingUpload: 'ກຳລັງອັບໂຫຼດການປ່ຽນແປງຂຶ້ນຄລາວ.',
      waitingUpload: 'ບັນທຶກໄວ້ໃນເຄື່ອງແລ້ວ ກຳລັງລໍສັນຍານ.',
      pendingUpload: 'ການປ່ຽນແປງໃນເຄື່ອງກຳລັງລໍອັບໂຫຼດ.',
      storage: 'ສຳຮອງຂໍ້ມູນ',
      storageDesc: 'ສົ່ງອອກແລະນຳເຂົ້າ backup ແບບ JSON ໄດ້.',
      backupRecommended: 'ແນະນຳ JSON',
      backupRecommendedDesc: 'ເໝາະສຳລັບ backup ແບບເຕັມ ແລະ restore ກັບມາໄດ້ຄົບ.',
      exportData: 'ສົ່ງອອກ backup',
      exportModalTitle: 'ເລືອກວິທີສົ່ງອອກ',
      exportModalDesc: 'ດາວໂຫຼດໄຟລ໌ JSON ຫຼືໃຊ້ native share ເພື່ອສົ່ງຕໍ່.',
      exportFileLabel: 'ໄຟລ໌ backup',
      exportIncludedData: 'ຂໍ້ມູນທີ່ຢູ່ໃນ backup',
      exportCountWallets: 'ກະເປົາເງິນ',
      exportCountTransactions: 'ລາຍການ',
      exportCountCategories: 'ໝວດໝູ່',
      exportCountCompanies: 'ບໍລິສັດ',
      exportFileHint: 'Native share ຈະສົ່ງໄຟລ໌ JSON ໄປແອັບອື່ນໄດ້ຖ້າອຸປະກອນຮອງຮັບ.',
      downloadBackup: 'ດາວໂຫຼດ',
      shareBackup: 'Share',
      exportCsv: 'ສົ່ງອອກ CSV',
      exportCsvHint: 'CSV ເໝາະສຳລັບ transactions ແລະເປີດໃນ Excel/Sheets.',
      exportCsvTitle: 'ສົ່ງອອກ transactions.csv',
      exportCsvDesc: 'ໄຟລ໌ CSV ຈະມີແຕ່ລາຍການ transactions ເພື່ອວິເຄາະຕໍ່.',
      exportCsvFileLabel: 'CSV file',
      exportCsvInclude: 'Columns included',
      exportCsvDownload: 'Download CSV',
      importData: 'ນຳເຂົ້າ backup',
      importHint: 'ການນຳເຂົ້າຈະທັບຂໍ້ມູນໃນເຄື່ອງຂອງບັນຊີນີ້.',
      importModalTitle: 'ນຳ backup ເຂົ້າ',
      importModalDesc: 'ການກະທຳນີ້ຈະທັບຂໍ້ມູນປັດຈຸບັນຂອງບັນຊີນີ້.',
      importSelectedFile: 'ໄຟລ໌ທີ່ເລືອກ',
      importExportedAt: 'ສົ່ງອອກເມື່ອ',
      importIncludedData: 'ຂໍ້ມູນທີ່ຢູ່ໃນໄຟລ໌',
      walletsLabel: 'ກະເປົາເງິນ',
      transactionsLabel: 'ລາຍການ',
      categoriesLabel: 'ໝວດໝູ່',
      companiesLabel: 'ບໍລິສັດ',
      exportSuccess: 'ສົ່ງອອກ backup JSON ແລ້ວ.',
      exportFailed: 'ບໍ່ສາມາດສົ່ງອອກ backup ໄດ້.',
      shareNotSupported: 'ອຸປະກອນນີ້ບໍ່ຮອງຮັບ native share.',
      importSuccess: 'ນຳ backup ເຂົ້າສຳເລັດແລ້ວ.',
      importFailed: 'ບໍ່ສາມາດນຳ backup ເຂົ້າໄດ້.',
      invalidBackupFile: 'ໄຟລ໌ນີ້ບໍ່ແມ່ນ backup ທີ່ຖືກຕ້ອງ.',
      unsupportedBackupFile: 'backup ນີ້ບໍ່ຮອງຮັບກັບຟັງຊັນໃນຕອນນີ້.',
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
      paste: 'ວາງ',
      noSignedInAccount: 'ບໍ່ພົບບັນຊີທີ່ເຂົ້າລະບົບ.',
      enterRedeemKey: 'ກະລຸນາໃສ່ຄີລົດແລກ.',
      couldNotEnable: 'ບໍ່ສາມາດເປີດໂປຣໄດ້ໃນຕອນນີ້.',
      couldNotPaste: 'ບໍ່ສາມາດອ່ານ clipboard ໄດ້.',
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
    storage: 'Storage',
    storageDesc: 'Export a JSON backup or restore it later.',
    backupRecommended: 'JSON recommended',
    backupRecommendedDesc: 'Best for a full backup and restore across devices.',
    exportData: 'Export backup',
    exportModalTitle: 'Choose export method',
    exportModalDesc: 'Download the JSON file or use native share to send it to another app.',
    exportFileLabel: 'Backup file',
    exportIncludedData: 'Included in backup',
    exportCountWallets: 'Wallets',
    exportCountTransactions: 'Transactions',
    exportCountCategories: 'Categories',
    exportCountCompanies: 'Companies',
    exportFileHint: 'Native share can send the JSON file to other apps on supported devices.',
    downloadBackup: 'Download',
    shareBackup: 'Share',
    exportCsv: 'Export CSV',
    exportCsvHint: 'CSV is best for transactions and spreadsheet analysis.',
    exportCsvTitle: 'Export transactions.csv',
    exportCsvDesc: 'The CSV contains transactions only so it is easy to analyze.',
    exportCsvFileLabel: 'CSV file',
    exportCsvInclude: 'Columns included',
    exportCsvDownload: 'Download CSV',
    importData: 'Import backup',
    importHint: 'Importing will replace the current local data for this account.',
    importModalTitle: 'Restore backup',
    importModalDesc: 'This will replace the current local data for this account.',
    importSelectedFile: 'Selected file',
    importExportedAt: 'Exported at',
    importIncludedData: 'Included data',
    walletsLabel: 'Wallets',
    transactionsLabel: 'Transactions',
    categoriesLabel: 'Categories',
    companiesLabel: 'Companies',
    exportSuccess: 'JSON backup downloaded.',
    exportFailed: 'Could not export the backup.',
    shareNotSupported: 'Native share is not supported on this device.',
    importSuccess: 'Backup restored successfully.',
    importFailed: 'Could not import the backup.',
    invalidBackupFile: 'This file is not a valid backup.',
    unsupportedBackupFile: 'This backup format is not supported yet.',
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
    paste: 'Paste',
    noSignedInAccount: 'No signed-in account found.',
    enterRedeemKey: 'Please enter your redeem key.',
    couldNotEnable: 'Could not enable Pro right now.',
    couldNotPaste: 'Could not read the clipboard.',
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

async function pasteProRedeemKey() {
  if (isPastingProKey.value) return
  if (!navigator.clipboard?.readText) return

  isPastingProKey.value = true
  proRedeemError.value = ''

  try {
    const clipboardText = await navigator.clipboard.readText()
    const value = clipboardText.trim()
    if (!value) return

    proRedeemKey.value = value
    await nextTick()
    proRedeemInputRef.value?.inputRef?.focus()
  }
  catch {
    proRedeemError.value = settingsCopy.value.couldNotPaste
  }
  finally {
    isPastingProKey.value = false
  }
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

function formatBackupDate(value?: string) {
  if (!value) return ''

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(date)
}

const storageImportSummary = computed(() => {
  const backup = storageImportPending.value
  if (!backup) return null

  const data = backup.data

  return {
    exportedAt: formatBackupDate(backup.exportedAt),
    wallets: data.state.wallets?.length ?? 0,
    transactions: data.state.transactions?.length ?? 0,
    categories: data.state.categories?.length ?? 0,
    companies: data.state.companies?.length ?? 0
  }
})

const storageExportSummary = computed(() => {
  const backup = storageExportPending.value
  if (!backup) return null

  const data = backup.data

  return {
    exportedAt: formatBackupDate(backup.exportedAt),
    wallets: data.state.wallets?.length ?? 0,
    transactions: data.state.transactions?.length ?? 0,
    categories: data.state.categories?.length ?? 0,
    companies: data.state.companies?.length ?? 0
  }
})

function resetStorageImportState() {
  storageImportPending.value = null
  storageImportFileName.value = ''
  storageImportError.value = ''
}

function resetStorageExportState() {
  storageExportPending.value = null
  storageExportFileName.value = ''
  storageExportError.value = ''
}

function triggerStorageImportPicker() {
  storageNotice.value = ''
  storageImportError.value = ''
  storageImportInputRef.value?.click()
}

function buildStorageBackupFileName(backup: MoneyNoteBackupFile) {
  return `income-expense-backup-${backup.exportedAt.slice(0, 10)}.json`
}

function buildTransactionsCsvFileName() {
  return `income-expense-transactions-${new Date().toISOString().slice(0, 10)}.csv`
}

function csvEscape(value: unknown) {
  const text = `${value ?? ''}`
  return `"${text.replace(/"/g, '""')}"`
}

function walletLabelById(walletId?: string) {
  if (!walletId) return ''
  return store.value.wallets.find(wallet => wallet.id === walletId)?.name ?? walletId
}

function buildTransactionsCsv() {
  const headers = [
    'id',
    'type',
    'date',
    'createdAt',
    'walletId',
    'walletName',
    'toWalletId',
    'toWalletName',
    'currency',
    'amount',
    'exchangeRate',
    'category',
    'note',
    'company',
    'counterparty',
    'loanDirection'
  ]

  const rows = [
    headers.join(','),
    ...store.value.transactions.map(transaction => [
      transaction.id,
      transaction.type,
      transaction.date,
      transaction.createdAt,
      transaction.walletId,
      walletLabelById(transaction.walletId),
      transaction.toWalletId ?? '',
      walletLabelById(transaction.toWalletId),
      transaction.currency,
      transaction.amount,
      transaction.exchangeRate ?? '',
      transaction.category,
      transaction.note,
      transaction.company ?? '',
      transaction.counterparty ?? '',
      transaction.loanDirection ?? ''
    ].map(csvEscape).join(','))
  ]

  return `\ufeff${rows.join('\n')}`
}

function downloadCsvText(text: string, fileName: string) {
  const blob = new Blob([text], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = fileName
  link.rel = 'noopener'
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

function openStorageExportModal() {
  storageNotice.value = ''
  storageExportError.value = ''
  storageExportPending.value = buildMoneyNoteBackupFile()
  storageExportFileName.value = buildStorageBackupFileName(storageExportPending.value)
  storageExportModalOpen.value = true
}

function downloadMoneyNoteBackup(backup: MoneyNoteBackupFile, fileName = buildStorageBackupFileName(backup)) {
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = fileName
  link.rel = 'noopener'
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

function createStorageShareFile(backup: MoneyNoteBackupFile, fileName = buildStorageBackupFileName(backup)) {
  return new File(
    [JSON.stringify(backup, null, 2)],
    fileName,
    { type: 'text/plain;charset=utf-8' }
  )
}

function handleStorageExportCsv() {
  const fileName = buildTransactionsCsvFileName()
  downloadCsvText(buildTransactionsCsv(), fileName)
  storageNotice.value = settingsCopy.value.exportCsv
  storageExportModalOpen.value = false
  resetStorageExportState()
}

async function shareMoneyNoteBackup(backup: MoneyNoteBackupFile, fileName = buildStorageBackupFileName(backup)) {
  const shareApi = navigator.share
  const file = createStorageShareFile(backup, fileName)
  const sharePayload = {
    title: fileName,
    text: settingsCopy.value.exportSuccess,
    files: [file]
  }

  if (!shareApi) {
    throw new Error('share-not-supported')
  }

  if (typeof navigator.canShare === 'function') {
    const canShareFiles = navigator.canShare(sharePayload)

    if (canShareFiles) {
      await shareApi.call(navigator, sharePayload)
      return
    }
  }

  await shareApi.call(navigator, {
    title: fileName,
    text: `${settingsCopy.value.exportSuccess}\n${fileName}`
  })
}

function handleStorageExportDownload() {
  const backup = storageExportPending.value ?? buildMoneyNoteBackupFile()
  const fileName = storageExportFileName.value || buildStorageBackupFileName(backup)

  downloadMoneyNoteBackup(backup, fileName)
  storageNotice.value = settingsCopy.value.exportSuccess
  storageExportModalOpen.value = false
  resetStorageExportState()
}

async function handleStorageExportShare() {
  const backup = storageExportPending.value ?? buildMoneyNoteBackupFile()
  const fileName = storageExportFileName.value || buildStorageBackupFileName(backup)

  if (storageExportBusy.value) return

  storageExportBusy.value = true
  storageExportError.value = ''

  try {
    await shareMoneyNoteBackup(backup, fileName)
    storageNotice.value = settingsCopy.value.exportSuccess
    storageExportModalOpen.value = false
    resetStorageExportState()
  }
  catch (error) {
    const code = error instanceof Error ? error.message : ''
    if (code === 'share-not-supported') {
      storageExportError.value = settingsCopy.value.shareNotSupported
      return
    }

    storageExportError.value = settingsCopy.value.exportFailed
  }
  finally {
    storageExportBusy.value = false
  }
}

function resolveStorageImportError(error: unknown) {
  const code = error instanceof Error ? error.message : ''

  if (code === 'invalid-backup-file') return settingsCopy.value.invalidBackupFile
  if (code === 'unsupported-backup-file') return settingsCopy.value.unsupportedBackupFile

  return settingsCopy.value.importFailed
}

async function handleStorageFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  input.value = ''
  if (!file) return

  storageImportError.value = ''
  storageNotice.value = ''

  try {
    const fileText = await file.text()
    const backup = parseMoneyNoteBackupFile(JSON.parse(fileText) as unknown)

    storageImportPending.value = backup
    storageImportFileName.value = file.name
    storageImportModalOpen.value = true
  }
  catch (error) {
    storageImportError.value = resolveStorageImportError(error)
  }
}

async function confirmStorageImport() {
  if (!storageImportPending.value || storageImportBusy.value) return

  storageImportBusy.value = true
  storageImportError.value = ''

  try {
    await importMoneyNoteBackupFile(storageImportPending.value)
    storageImportModalOpen.value = false
    storageNotice.value = settingsCopy.value.importSuccess
    resetStorageImportState()
  }
  catch (error) {
    storageImportError.value = resolveStorageImportError(error)
  }
  finally {
    storageImportBusy.value = false
  }
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
          <UBadge v-if="authReady && isCloudSyncEnabled" color="neutral" variant="soft" class="rounded-full">
            {{ syncStateCopy.badge }}
          </UBadge>
          <UBadge v-else-if="authReady" color="neutral" variant="soft" icon="i-lucide-key-round" class="min-w-max whitespace-nowrap rounded-full px-3">
            {{ settingsCopy.cloudSyncLocked }}
          </UBadge>
          <UBadge v-else color="neutral" variant="soft" class="rounded-full px-3 opacity-70">
            ...
          </UBadge>
        </div>

        <template v-if="authReady && isCloudSyncEnabled">
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
              <UBadge v-if="syncStatus === 'syncing'" color="neutral" variant="soft" class="rounded-full text-[10px] font-bold uppercase tracking-[0.16em]">
                {{ syncProgressLabel }}
              </UBadge>
              <UBadge v-else color="neutral" variant="soft" class="rounded-full text-[10px] font-bold uppercase tracking-[0.16em]">
                {{ syncStatus === 'synced' ? syncStateCopy.badge : syncStateCopy.badge }}
              </UBadge>
            </div>

            <div v-if="syncStatus === 'syncing'" class="mt-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                class="h-full rounded-full bg-gradient-to-r from-sky-500 via-blue-500 to-cyan-400 transition-all duration-300"
                :style="{ width: `${syncProgress}%` }"
              />
            </div>

            <p class="mt-2 text-[11px] leading-5 text-muted">
              {{
                syncStatus === 'synced'
                  ? (lastSyncedAt ? `${settingsCopy.cloudSyncReady} ${new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(new Date(lastSyncedAt))}.` : settingsCopy.syncedAll)
                  : syncStatus === 'syncing'
                    ? settingsCopy.syncingUpload
                    : syncStatus === 'offline'
                      ? settingsCopy.waitingUpload
                      : settingsCopy.pendingUpload
              }}
            </p>
          </div>
        </template>
        <div v-else-if="authReady" class="mt-3 rounded-[1.1rem] border border-slate-200/80 bg-slate-50 px-3 py-3 opacity-90 dark:border-slate-800 dark:bg-slate-900">
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
        <div v-else class="mt-3 rounded-[1.1rem] border border-slate-200/80 bg-slate-50 px-3 py-3 dark:border-slate-800 dark:bg-slate-900">
          <div class="flex items-center gap-3">
            <div class="size-10 shrink-0 rounded-full bg-slate-200/80 dark:bg-slate-800/80 animate-pulse" />
            <div class="min-w-0 flex-1 space-y-2">
              <div class="h-4 w-32 rounded-full bg-slate-200/80 dark:bg-slate-800/80 animate-pulse" />
              <div class="h-3 w-48 rounded-full bg-slate-200/60 dark:bg-slate-800/60 animate-pulse" />
            </div>
          </div>
          <div class="mt-3 h-10 w-full rounded-full bg-slate-200/80 dark:bg-slate-800/80 animate-pulse" />
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
      <div class="flex items-center justify-between gap-3 px-4 py-4">
        <div class="min-w-0">
          <h2 class="text-sm font-black tracking-tight text-default">{{ settingsCopy.storage }}</h2>
          <p class="text-xs text-muted">{{ settingsCopy.storageDesc }}</p>
        </div>

        <UBadge color="primary" variant="soft" class="rounded-full">
          {{ settingsCopy.backupRecommended }}
        </UBadge>
      </div>

      <div class="space-y-3 border-t border-slate-200/80 px-4 py-4 dark:border-slate-800">
        <div class="rounded-[1.1rem] border border-slate-200/80 bg-slate-50 px-3 py-3 dark:border-slate-800 dark:bg-slate-900">
          <div class="flex items-start gap-3">
            <div class="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-cyan-400 text-white shadow-lg">
              <UIcon name="i-lucide-database" class="size-4" />
            </div>

            <div class="min-w-0">
              <p class="text-sm font-bold text-default">{{ settingsCopy.backupRecommended }}</p>
              <p class="mt-1 text-xs leading-5 text-muted">{{ settingsCopy.backupRecommendedDesc }}</p>
            </div>
          </div>
        </div>

        <div v-if="storageNotice" class="rounded-[1rem] border border-emerald-200 bg-emerald-50 px-3 py-3 text-sm font-semibold text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-100">
          {{ storageNotice }}
        </div>

        <div v-if="storageImportError" class="rounded-[1rem] border border-rose-200 bg-rose-50 px-3 py-3 text-sm font-semibold text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-100">
          {{ storageImportError }}
        </div>

        <div class="grid grid-cols-2 gap-3">
          <UButton
            icon="i-lucide-download"
            class="h-11 w-full justify-center rounded-full bg-gradient-to-r from-sky-500 to-cyan-400 px-4 text-sm font-bold text-white shadow-[0_14px_28px_-18px_rgba(14,165,233,0.45)] transition active:scale-95"
            @click="openStorageExportModal"
          >
            {{ settingsCopy.exportData }}
          </UButton>

          <UButton
            icon="i-lucide-upload"
            variant="soft"
            color="neutral"
            class="h-11 w-full justify-center rounded-full border border-slate-200 bg-white px-4 text-sm font-bold text-default shadow-none hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900"
            @click="triggerStorageImportPicker"
          >
            {{ settingsCopy.importData }}
          </UButton>
        </div>

        <p class="text-[11px] leading-5 text-muted">
          {{ settingsCopy.importHint }}
        </p>

        <input
          ref="storageImportInputRef"
          type="file"
          accept=".json,application/json"
          class="hidden"
          @change="handleStorageFileChange"
        >
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
              ref="proRedeemInputRef"
              v-model="proRedeemKey"
              :placeholder="settingsCopy.redeemPlaceholder"
              variant="none"
              inputmode="text"
              autocomplete="off"
              autocapitalize="characters"
              autocorrect="off"
              spellcheck="false"
              class="w-full"
              :ui="{
                root: 'w-full',
                base: 'h-12 w-full rounded-full border border-slate-200/80 bg-white ps-4 pe-24 text-sm font-semibold text-default shadow-sm outline-none transition placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50',
                trailing: 'absolute inset-y-0 end-0 flex items-center pe-1.5',
                trailingIcon: 'size-5'
              }"
              @keyup.enter="submitProRedeem"
            >
              <template #trailing>
                <UButton
                  type="button"
                  variant="soft"
                  color="neutral"
                  :loading="isPastingProKey"
                  icon="i-lucide-clipboard-paste"
                  class="me-1.5 h-9 rounded-full border border-slate-200 bg-slate-100 px-3 text-xs font-bold text-default shadow-none hover:bg-slate-200/70 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                  @click="pasteProRedeemKey"
                >
                  {{ settingsCopy.paste }}
                </UButton>
              </template>
            </UInput>
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

    <USlideover
      v-model:open="storageExportModalOpen"
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
                <p class="text-xs font-semibold uppercase tracking-[0.18em] text-muted">{{ settingsCopy.exportModalTitle }}</p>
                <p class="mt-1 text-[11px] text-muted">{{ settingsCopy.exportModalDesc }}</p>
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
          </div>

          <div class="flex-1 overflow-y-auto px-4 py-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
            <div class="space-y-4">
              <div class="rounded-[1rem] border border-sky-200 bg-sky-50 p-4 text-sky-800 dark:border-sky-900/60 dark:bg-sky-950/30 dark:text-sky-100">
                <p class="text-[10px] font-semibold uppercase tracking-[0.22em]">{{ settingsCopy.exportFileLabel }}</p>
                <p class="mt-1 break-all text-sm font-black">{{ storageExportFileName }}</p>
                <p class="mt-1 text-xs leading-5 opacity-90">{{ settingsCopy.exportModalDesc }}</p>
              </div>

              <div v-if="storageExportSummary" class="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <div class="rounded-[0.95rem] border border-slate-200/80 bg-slate-50 px-3 py-3 dark:border-slate-800 dark:bg-slate-900">
                  <p class="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">{{ settingsCopy.exportCountWallets }}</p>
                  <p class="mt-1 text-lg font-black text-default">{{ storageExportSummary.wallets }}</p>
                </div>
                <div class="rounded-[0.95rem] border border-slate-200/80 bg-slate-50 px-3 py-3 dark:border-slate-800 dark:bg-slate-900">
                  <p class="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">{{ settingsCopy.exportCountTransactions }}</p>
                  <p class="mt-1 text-lg font-black text-default">{{ storageExportSummary.transactions }}</p>
                </div>
                <div class="rounded-[0.95rem] border border-slate-200/80 bg-slate-50 px-3 py-3 dark:border-slate-800 dark:bg-slate-900">
                  <p class="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">{{ settingsCopy.exportCountCategories }}</p>
                  <p class="mt-1 text-lg font-black text-default">{{ storageExportSummary.categories }}</p>
                </div>
                <div class="rounded-[0.95rem] border border-slate-200/80 bg-slate-50 px-3 py-3 dark:border-slate-800 dark:bg-slate-900">
                  <p class="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">{{ settingsCopy.exportCountCompanies }}</p>
                  <p class="mt-1 text-lg font-black text-default">{{ storageExportSummary.companies }}</p>
                </div>
              </div>

              <div v-if="storageExportSummary?.exportedAt" class="rounded-[1rem] border border-slate-200/80 bg-slate-50 px-3 py-3 text-sm text-default dark:border-slate-800 dark:bg-slate-900">
                <p class="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">{{ settingsCopy.importExportedAt }}</p>
                <p class="mt-1 font-bold">{{ storageExportSummary.exportedAt }}</p>
              </div>

              <div class="rounded-[1rem] border border-slate-200/80 bg-slate-50 px-3 py-3 text-sm text-default dark:border-slate-800 dark:bg-slate-900">
                <p class="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">{{ settingsCopy.exportCsvFileLabel }}</p>
                <p class="mt-1 font-bold">{{ settingsCopy.exportCsvTitle }}</p>
                <p class="mt-1 text-xs leading-5 text-muted">{{ settingsCopy.exportCsvHint }}</p>
              </div>

              <div v-if="storageExportError" class="rounded-[1rem] border border-rose-200 bg-rose-50 px-3 py-3 text-sm font-semibold text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-100">
                {{ storageExportError }}
              </div>

              <p class="text-[11px] leading-5 text-muted">
                {{ settingsCopy.exportFileHint }}
              </p>
            </div>
          </div>

          <div class="shrink-0 border-t border-slate-200/80 bg-white/96 px-4 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/96">
            <div class="space-y-3">
              <UButton
                variant="soft"
                color="neutral"
                class="h-12 w-full justify-center rounded-full text-center font-bold whitespace-nowrap"
                icon="i-lucide-x"
                @click="close()"
              >
                {{ settingsCopy.cancel }}
              </UButton>
              <div class="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <UButton
                  icon="i-lucide-download"
                  class="h-12 w-full justify-center rounded-full bg-sky-600 px-4 text-sm font-bold whitespace-nowrap text-white shadow-[0_14px_28px_-18px_rgba(14,165,233,0.45)] transition active:scale-95 hover:bg-sky-500 disabled:opacity-60"
                  :disabled="storageExportBusy"
                  @click="handleStorageExportDownload"
                >
                  {{ settingsCopy.downloadBackup }}
                </UButton>
                <UButton
                  icon="i-lucide-share-2"
                  :loading="storageExportBusy"
                  class="h-12 w-full justify-center rounded-full bg-black px-4 text-sm font-bold whitespace-nowrap text-white shadow-[0_14px_28px_-18px_rgba(15,23,42,0.45)] transition hover:bg-black/90 active:scale-95 dark:bg-white dark:text-slate-950 dark:shadow-[0_14px_28px_-18px_rgba(255,255,255,0.18)] dark:hover:bg-white/90 disabled:opacity-60"
                  :disabled="storageExportBusy"
                  @click="handleStorageExportShare"
                >
                  {{ settingsCopy.shareBackup }}
                </UButton>
                <UButton
                  icon="i-lucide-file-spreadsheet"
                  class="h-12 w-full justify-center rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 px-4 text-sm font-bold whitespace-nowrap text-white shadow-[0_14px_28px_-18px_rgba(16,185,129,0.45)] transition active:scale-95 hover:opacity-95 disabled:opacity-60"
                  :disabled="storageExportBusy"
                  @click="handleStorageExportCsv"
                >
                  {{ settingsCopy.exportCsv }}
                </UButton>
              </div>
            </div>
          </div>
        </div>
      </template>
    </USlideover>

    <UModal
      v-model:open="storageImportModalOpen"
      :title="settingsCopy.importModalTitle"
      :description="settingsCopy.importModalDesc"
    >
      <template #body>
        <div class="space-y-4">
          <div class="rounded-[1rem] border border-amber-200 bg-amber-50 p-4 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-100">
            <p class="text-[10px] font-semibold uppercase tracking-[0.22em]">{{ settingsCopy.importSelectedFile }}</p>
            <p class="mt-1 break-all text-sm font-black">{{ storageImportFileName }}</p>
            <p class="mt-1 text-xs leading-5 opacity-90">{{ settingsCopy.importHint }}</p>
          </div>

          <div v-if="storageImportSummary" class="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <div class="rounded-[0.95rem] border border-slate-200/80 bg-slate-50 px-3 py-3 dark:border-slate-800 dark:bg-slate-900">
              <p class="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">{{ settingsCopy.walletsLabel }}</p>
              <p class="mt-1 text-lg font-black text-default">{{ storageImportSummary.wallets }}</p>
            </div>
            <div class="rounded-[0.95rem] border border-slate-200/80 bg-slate-50 px-3 py-3 dark:border-slate-800 dark:bg-slate-900">
              <p class="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">{{ settingsCopy.transactionsLabel }}</p>
              <p class="mt-1 text-lg font-black text-default">{{ storageImportSummary.transactions }}</p>
            </div>
            <div class="rounded-[0.95rem] border border-slate-200/80 bg-slate-50 px-3 py-3 dark:border-slate-800 dark:bg-slate-900">
              <p class="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">{{ settingsCopy.categoriesLabel }}</p>
              <p class="mt-1 text-lg font-black text-default">{{ storageImportSummary.categories }}</p>
            </div>
            <div class="rounded-[0.95rem] border border-slate-200/80 bg-slate-50 px-3 py-3 dark:border-slate-800 dark:bg-slate-900">
              <p class="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">{{ settingsCopy.companiesLabel }}</p>
              <p class="mt-1 text-lg font-black text-default">{{ storageImportSummary.companies }}</p>
            </div>
          </div>

          <div v-if="storageImportSummary?.exportedAt" class="rounded-[1rem] border border-slate-200/80 bg-slate-50 px-3 py-3 text-sm text-default dark:border-slate-800 dark:bg-slate-900">
            <p class="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">{{ settingsCopy.importExportedAt }}</p>
            <p class="mt-1 font-bold">{{ storageImportSummary.exportedAt }}</p>
          </div>

          <p v-if="storageImportError" class="text-sm font-semibold text-rose-600 dark:text-rose-300">
            {{ storageImportError }}
          </p>
        </div>
      </template>

      <template #footer>
        <div class="grid grid-cols-2 gap-3">
          <UButton
            class="h-12 w-full justify-center rounded-full border border-slate-200 bg-white px-4 text-sm font-bold text-default shadow-none hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900"
            variant="soft"
            :disabled="storageImportBusy"
            @click="storageImportModalOpen = false"
          >
            {{ settingsCopy.cancel }}
          </UButton>
          <UButton
            :loading="storageImportBusy"
            icon="i-lucide-download"
            class="h-12 w-full justify-center rounded-full bg-black px-4 text-sm font-bold text-white shadow-[0_14px_28px_-18px_rgba(15,23,42,0.45)] transition hover:bg-black/90 active:scale-95 dark:bg-white dark:text-slate-950 dark:shadow-[0_14px_28px_-18px_rgba(255,255,255,0.18)] dark:hover:bg-white/90"
            @click="confirmStorageImport"
          >
            {{ settingsCopy.importData }}
          </UButton>
        </div>
      </template>
    </UModal>

  </div>
</template>
