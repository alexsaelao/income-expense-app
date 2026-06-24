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
  isOnline
} = useMoneyNote()
const {
  signOut,
  sessionProfile,
  rememberedProfile,
  authReady,
  setSessionPlan,
  setProfileAvatar,
  updateRememberedPin
} = useDeviceAuth()
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
const currencySettingsError = ref('')
const changePinModalOpen = ref(false)
const changePinBusy = ref(false)
const changePinError = ref('')
const changePinNotice = ref('')
const changePinOldPin = ref('')
const changePinNewPin = ref('')
const changePinConfirmPin = ref('')
const changePinShowOldPin = ref(false)
const changePinShowNewPin = ref(false)
const changePinShowConfirmPin = ref(false)
const changePinOldPinInputRef = ref<{ inputRef?: HTMLInputElement | null } | null>(null)
const changePinSheetDragY = ref(0)
const changePinSheetDragging = ref(false)
const changePinSheetDragStartY = ref(0)
const changePinSheetPointerId = ref<number | null>(null)
const changePinSheetHandleRef = ref<HTMLElement | null>(null)
const clearDataConfirmModalOpen = ref(false)
const isClearingData = ref(false)
const clearDataError = ref('')
const clearDataSlideValue = ref(0)
const clearDataSlideTrackRef = ref<HTMLElement | null>(null)
const clearDataSlideDragging = ref(false)
const clearDataSlidePointerId = ref<number | null>(null)
const clearDataSlideUnlocked = computed(() => clearDataSlideValue.value >= 100)
const clearDataModalDragging = ref(false)
const clearDataModalPointerId = ref<number | null>(null)
const clearDataModalStartX = ref(0)
const clearDataModalStartY = ref(0)
const clearDataModalDragOffset = ref(0)
const networkSignalLevel = ref(4)
const centeredSettingsModalUi = {
  content: '!fixed !inset-auto !top-1/2 !left-1/2 flex !max-h-[calc(100dvh-2rem)] !w-[calc(100vw-2rem)] !max-w-[40rem] !-translate-x-1/2 !-translate-y-1/2 flex-col !overflow-hidden !rounded-[1.75rem] !border !border-slate-200/70 !bg-white !shadow-[0_30px_90px_-36px_rgba(15,23,42,0.42)] !ring-1 !ring-slate-200/60 focus:outline-none dark:!border-slate-800 dark:!bg-slate-950 dark:!ring-slate-800 sm:!max-h-[calc(100dvh-4rem)]',
  body: 'p-0',
  header: 'p-0',
  footer: 'p-0',
  overlay: 'fixed inset-0 bg-slate-950/45 backdrop-blur-[10px]'
}

function clampNumber(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function resolveActionErrorMessage(error: unknown) {
  const maybeResponse = error as {
    data?: { statusMessage?: string; message?: string }
    message?: string
    statusMessage?: string
  }

  return maybeResponse?.data?.statusMessage
    || maybeResponse?.data?.message
    || maybeResponse?.statusMessage
    || maybeResponse?.message
    || (selectedLanguage.value === 'lo' ? 'ບໍ່ສາມາດບັນທຶກການຕັ້ງຄ່າໄດ້' : 'Unable to save settings')
}

async function handleToggleCurrency(currency: (typeof currencyOptions)[number]['value']) {
  currencySettingsError.value = ''

  try {
    await toggleCurrencyEnabled(currency)
  }
  catch (error) {
    currencySettingsError.value = resolveActionErrorMessage(error)
  }
}

function getNetworkSignalLevel() {
  if (!import.meta.client || !isOnline.value) return 0

  const connection = navigator.connection || (navigator as Navigator & { mozConnection?: any; webkitConnection?: any }).mozConnection || (navigator as Navigator & { webkitConnection?: any }).webkitConnection
  const effectiveType = typeof connection?.effectiveType === 'string' ? connection.effectiveType : ''
  const downlink = typeof connection?.downlink === 'number' ? connection.downlink : null

  if (effectiveType === 'slow-2g' || effectiveType === '2g') return 1
  if (effectiveType === '3g') return 2
  if (effectiveType === '4g') return 4

  if (downlink !== null) {
    if (downlink < 0.5) return 1
    if (downlink < 1.5) return 2
    if (downlink < 5) return 3
    return 4
  }

  return 4
}

function updateClearDataSlideValue(clientX: number) {
  const track = clearDataSlideTrackRef.value
  if (!track) return

  const rect = track.getBoundingClientRect()
  if (!rect.width) return

  const nextValue = Math.round(((clientX - rect.left) / rect.width) * 100)
  clearDataSlideValue.value = clampNumber(nextValue, 0, 100)
}

function stopClearDataSlideDrag() {
  clearDataSlideDragging.value = false
  clearDataSlidePointerId.value = null
  window.removeEventListener('pointermove', handleClearDataSlidePointerMove)
  window.removeEventListener('pointerup', handleClearDataSlidePointerUp)
  window.removeEventListener('pointercancel', handleClearDataSlidePointerUp)
}

function stopClearDataModalDrag() {
  clearDataModalDragging.value = false
  clearDataModalPointerId.value = null
  clearDataModalStartX.value = 0
  clearDataModalStartY.value = 0
  clearDataModalDragOffset.value = 0
  window.removeEventListener('pointermove', handleClearDataModalPointerMove)
  window.removeEventListener('pointerup', handleClearDataModalPointerUp)
  window.removeEventListener('pointercancel', handleClearDataModalPointerUp)
}

function handleClearDataSlidePointerMove(event: PointerEvent) {
  if (!clearDataSlideDragging.value || event.pointerId !== clearDataSlidePointerId.value) return
  updateClearDataSlideValue(event.clientX)
}

function handleClearDataSlidePointerUp(event: PointerEvent) {
  if (clearDataSlidePointerId.value !== null && event.pointerId !== clearDataSlidePointerId.value) return
  stopClearDataSlideDrag()
}

function handleClearDataSlidePointerDown(event: PointerEvent) {
  if (isClearingData.value) return

  clearDataSlideDragging.value = true
  clearDataSlidePointerId.value = event.pointerId
  window.addEventListener('pointermove', handleClearDataSlidePointerMove)
  window.addEventListener('pointerup', handleClearDataSlidePointerUp)
  window.addEventListener('pointercancel', handleClearDataSlidePointerUp)
}

function shouldIgnoreClearDataModalDragTarget(target: EventTarget | null) {
  return target instanceof HTMLElement && !!target.closest('button, a, input, textarea, select, [role="slider"]')
}

function handleClearDataModalPointerMove(event: PointerEvent) {
  if (!clearDataModalDragging.value || event.pointerId !== clearDataModalPointerId.value) return

  const deltaY = event.clientY - clearDataModalStartY.value
  const deltaX = Math.abs(event.clientX - clearDataModalStartX.value)

  if (deltaY <= 0 || deltaX > deltaY * 1.2) {
    clearDataModalDragOffset.value = 0
    return
  }

  clearDataModalDragOffset.value = clampNumber(deltaY, 0, 180)
}

function handleClearDataModalPointerUp(event: PointerEvent) {
  if (clearDataModalPointerId.value !== null && event.pointerId !== clearDataModalPointerId.value) return

  const shouldClose = clearDataModalDragOffset.value >= 90
  stopClearDataModalDrag()

  if (shouldClose) {
    clearDataConfirmModalOpen.value = false
  }
}

function handleClearDataModalPointerDown(event: PointerEvent) {
  if (isClearingData.value) return
  if (shouldIgnoreClearDataModalDragTarget(event.target)) return

  clearDataModalDragging.value = true
  clearDataModalPointerId.value = event.pointerId
  clearDataModalStartX.value = event.clientX
  clearDataModalStartY.value = event.clientY
  clearDataModalDragOffset.value = 0
  window.addEventListener('pointermove', handleClearDataModalPointerMove)
  window.addEventListener('pointerup', handleClearDataModalPointerUp)
  window.addEventListener('pointercancel', handleClearDataModalPointerUp)
}

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

if (import.meta.client) {
  const updateNetworkSignal = () => {
    networkSignalLevel.value = getNetworkSignalLevel()
  }

  onMounted(() => {
    updateNetworkSignal()
    window.addEventListener('online', updateNetworkSignal)
    window.addEventListener('offline', updateNetworkSignal)

    const connection = navigator.connection || (navigator as Navigator & { mozConnection?: any; webkitConnection?: any }).mozConnection || (navigator as Navigator & { webkitConnection?: any }).webkitConnection
    connection?.addEventListener?.('change', updateNetworkSignal)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('online', updateNetworkSignal)
    window.removeEventListener('offline', updateNetworkSignal)

    const connection = navigator.connection || (navigator as Navigator & { mozConnection?: any; webkitConnection?: any }).mozConnection || (navigator as Navigator & { webkitConnection?: any }).webkitConnection
    connection?.removeEventListener?.('change', updateNetworkSignal)
  })
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
      security: 'ຄວາມປອດໄພ',
      securityDesc: 'ປ່ຽນ PIN ຂອງບັນຊີນີ້.',
      changePin: 'ປ່ຽນ PIN',
      changePinDesc: 'ໃຊ້ PIN ເກົ່າເພື່ອຕັ້ງ PIN ໃໝ່.',
      changePinModalTitle: 'ປ່ຽນ PIN',
      changePinModalDesc: 'ໃສ່ PIN ເກົ່າ, PIN ໃໝ່, ແລະຢືນຢັນ PIN ໃໝ່.',
      oldPin: 'PIN ເກົ່າ',
      newPin: 'PIN ໃໝ່',
      confirmNewPin: 'ຢືນຢັນ PIN ໃໝ່',
      pinHint: 'PIN ຕ້ອງເປັນ 6 ຕົວເລກ.',
      pinRequired: 'ກະລຸນາໃສ່ PIN ໃຫ້ຄົບ.',
      pinMismatch: 'PIN ໃໝ່ບໍ່ຕົງກັນ.',
      oldPinWrong: 'PIN ເກົ່າບໍ່ຖືກຕ້ອງ.',
      pinUpdated: 'ປ່ຽນ PIN ສຳເລັດແລ້ວ.',
      pinUpdateFailed: 'ບໍ່ສາມາດປ່ຽນ PIN ໄດ້.',
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
      syncDesc: 'ສະຖານະການເຊື່ອມຄລາວຂອງບັນຊີນີ້.',
      internet: 'ເນັດ',
      internetConnected: 'ເຊື່ອມຕໍ່ແລ້ວ',
      internetDisconnected: 'ບໍ່ມີເນັດ',
      signal: 'ສັນຍານ',
      cloudSyncReady: 'ຄລາວພ້ອມແລ້ວ',
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
      clearData: 'ລ້າງຂໍ້ມູນ',
      clearDataDesc: 'ລຶບ cloud data ຂອງບັນຊີນີ້ ແລະກັບໄປ starter data.',
      clearDataButton: 'ລ້າງຂໍ້ມູນ',
      clearDataModalTitle: 'ຢືນຢັນການລ້າງຂໍ້ມູນ',
      clearDataModalDesc: 'ການກະທຳນີ້ຈະລຶບ cloud data ຂອງບັນຊີນີ້.',
      clearDataWarning: 'ຫຼັງຈາກລ້າງ ແອັບຈະໂຫຼດ starter data ຂຶ້ນໃໝ່.',
      clearDataSlideLabel: 'ເລື່ອນເພື່ອຢືນຢັນ',
      clearDataSlideHint: 'ເລື່ອນໄປສຸດຂວາເພື່ອເປີດປຸ່ມລ້າງຂໍ້ມູນ.',
      clearDataSlideUnlocked: 'ພ້ອມແລ້ວ',
      clearDataSlideRequired: 'ກະລຸນາເລື່ອນໃຫ້ສຸດກ່ອນ.',
      clearDataCloudLabel: 'ຂໍ້ມູນຄລາວ',
      clearDataCloudDesc: 'ຖ້າເປີດໃຊ້ງານຊິງຄລາວ ຂໍ້ມູນຢູ່ເຊີບເວີຂອງບັນຊີນີ້ຈະຖືກລຶບອອກດ້ວຍ.',
      clearDataFailed: 'ບໍ່ສາມາດລ້າງຂໍ້ມູນໄດ້.',
      clearDataAction: 'ລ້າງດຽວນີ້',
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
    security: 'Security',
    securityDesc: 'Change this account PIN.',
    changePin: 'Change PIN',
    changePinDesc: 'Use your old PIN to set a new one.',
    changePinModalTitle: 'Change PIN',
    changePinModalDesc: 'Enter your old PIN, new PIN, and confirm the new PIN.',
    oldPin: 'Old PIN',
    newPin: 'New PIN',
    confirmNewPin: 'Confirm new PIN',
    pinHint: 'PIN must be 6 digits.',
    pinRequired: 'Please fill in all PIN fields.',
    pinMismatch: 'The new PINs do not match.',
    oldPinWrong: 'The old PIN is not correct.',
    pinUpdated: 'PIN changed successfully.',
    pinUpdateFailed: 'Could not change the PIN.',
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
    syncDesc: 'Cloud status for this account.',
    internet: 'Internet',
    internetConnected: 'Connected',
    internetDisconnected: 'Offline',
    signal: 'Signal',
    cloudSyncReady: 'Cloud connected',
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
    importHint: 'Importing will replace the current data for this account.',
    importModalTitle: 'Restore backup',
    importModalDesc: 'This will replace the current data for this account.',
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
    dangerDesc: 'Reset cloud data or sign out from this device.',
    clearData: 'Clear data',
    clearDataDesc: 'Delete this account’s cloud data, then restore starter data.',
    clearDataButton: 'Clear data',
    clearDataModalTitle: 'Confirm data clear',
    clearDataModalDesc: 'This will remove the cloud data for this account.',
    clearDataWarning: 'After clearing, the app will reload with starter data.',
    clearDataSlideLabel: 'Slide to confirm',
    clearDataSlideHint: 'Slide all the way to the right to unlock the clear button.',
    clearDataSlideUnlocked: 'Ready',
    clearDataSlideRequired: 'Please slide all the way to confirm.',
    clearDataCloudLabel: 'Cloud data',
    clearDataCloudDesc: 'If cloud sync is active, the server state for this account will also be deleted.',
    clearDataFailed: 'Could not clear the data right now.',
    clearDataAction: 'Clear now',
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

function sanitizeChangePinInput(value: string) {
  return value.replace(/\D/g, '').slice(0, 6)
}

function openChangePinModal() {
  changePinError.value = ''
  changePinNotice.value = ''
  changePinOldPin.value = ''
  changePinNewPin.value = ''
  changePinConfirmPin.value = ''
  changePinShowOldPin.value = false
  changePinShowNewPin.value = false
  changePinShowConfirmPin.value = false
  changePinModalOpen.value = true
  nextTick(() => changePinOldPinInputRef.value?.inputRef?.focus?.())
}

function closeChangePinModal() {
  changePinModalOpen.value = false
  changePinError.value = ''
  changePinBusy.value = false
  changePinShowOldPin.value = false
  changePinShowNewPin.value = false
  changePinShowConfirmPin.value = false
}

function resetChangePinSheetDrag() {
  changePinSheetDragY.value = 0
  changePinSheetDragging.value = false
  changePinSheetDragStartY.value = 0
  changePinSheetPointerId.value = null
}

function onChangePinSheetPointerDown(event: PointerEvent) {
  if (event.pointerType === 'mouse' && event.button !== 0) return

  changePinSheetHandleRef.value?.setPointerCapture(event.pointerId)
  changePinSheetDragging.value = true
  changePinSheetDragStartY.value = event.clientY
  changePinSheetPointerId.value = event.pointerId
}

function onChangePinSheetPointerMove(event: PointerEvent) {
  if (!changePinSheetDragging.value || changePinSheetPointerId.value !== event.pointerId) return

  const deltaY = Math.max(0, event.clientY - changePinSheetDragStartY.value)
  changePinSheetDragY.value = deltaY
}

function onChangePinSheetPointerUp(event: PointerEvent) {
  if (!changePinSheetDragging.value || changePinSheetPointerId.value !== event.pointerId) return

  changePinSheetHandleRef.value?.releasePointerCapture(event.pointerId)
  const shouldClose = changePinSheetDragY.value > 90
  changePinModalOpen.value = !shouldClose
  resetChangePinSheetDrag()
}

function onChangePinSheetPointerCancel() {
  if (changePinSheetPointerId.value !== null) {
    changePinSheetHandleRef.value?.releasePointerCapture(changePinSheetPointerId.value)
  }
  resetChangePinSheetDrag()
}

async function submitChangePin() {
  if (changePinBusy.value) return

  const oldPin = changePinOldPin.value.trim()
  const newPin = changePinNewPin.value.trim()
  const confirmNewPin = changePinConfirmPin.value.trim()

  if (!oldPin || !newPin || !confirmNewPin) {
    changePinError.value = settingsCopy.value.pinRequired
    return
  }

  if (oldPin.length !== 6 || newPin.length !== 6 || confirmNewPin.length !== 6) {
    changePinError.value = settingsCopy.value.pinHint
    return
  }

  if (newPin !== confirmNewPin) {
    changePinError.value = settingsCopy.value.pinMismatch
    return
  }

  const identifier = sessionProfile.value?.identifier?.trim()
  if (!identifier) {
    changePinError.value = settingsCopy.value.pinUpdateFailed
    return
  }

  changePinBusy.value = true
  changePinError.value = ''
  changePinNotice.value = ''

  try {
    await $fetch('/api/auth/change-pin', {
      method: 'POST',
      body: {
        oldPin,
        newPin,
        confirmNewPin
      }
    })

    updateRememberedPin(identifier, newPin)
    changePinNotice.value = settingsCopy.value.pinUpdated
    changePinModalOpen.value = false
  }
  catch (error) {
    const status = (error as { statusCode?: number; response?: { status?: number; _data?: { statusMessage?: string } } } | null)?.statusCode
      ?? (error as { response?: { status?: number } } | null)?.response?.status
    const statusMessage = (error as { response?: { _data?: { statusMessage?: string } } } | null)?.response?._data?.statusMessage

    if (status === 401 && statusMessage === 'Old PIN is not correct') {
      changePinError.value = settingsCopy.value.oldPinWrong
    }
    else if (status === 400 && statusMessage === 'New PINs do not match') {
      changePinError.value = settingsCopy.value.pinMismatch
    }
    else if (status === 400) {
      changePinError.value = settingsCopy.value.pinRequired
    }
    else {
      changePinError.value = settingsCopy.value.pinUpdateFailed
    }
  }
  finally {
    changePinBusy.value = false
  }
}

function openUpgradeForProAction() {
  if (isProAccount.value) return false

  openProRedeemModal()
  return true
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
      await setSessionPlan('pro')
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

function openClearDataConfirmModal() {
  if (openUpgradeForProAction()) return

  clearDataError.value = ''
  clearDataSlideValue.value = 0
  stopClearDataSlideDrag()
  stopClearDataModalDrag()
  clearDataConfirmModalOpen.value = true
}

async function clearAccountData() {
  if (isClearingData.value) return

  if (!clearDataSlideUnlocked.value) {
    clearDataError.value = settingsCopy.value.clearDataSlideRequired
    return
  }

  if (isCloudSyncEnabled.value && !isOnline.value) {
    clearDataError.value = settingsCopy.value.clearDataCloudOffline
    return
  }

  isClearingData.value = true
  clearDataError.value = ''

  try {
    if (isCloudSyncEnabled.value) {
      await $fetch('/api/money-data/clear', { method: 'DELETE' })
    }

    await clearLocalAccountState().catch(() => {})

    clearDataConfirmModalOpen.value = false
    window.location.reload()
  }
  catch {
    clearDataError.value = settingsCopy.value.clearDataFailed
  }
  finally {
    isClearingData.value = false
  }
}

watch(clearDataConfirmModalOpen, (open) => {
  if (open) {
    clearDataError.value = ''
    clearDataSlideValue.value = 0
    clearDataModalDragOffset.value = 0
  }
  else if (!isClearingData.value) {
    clearDataSlideValue.value = 0
    stopClearDataSlideDrag()
    stopClearDataModalDrag()
  }
})

watch(changePinModalOpen, (open) => {
  if (open) {
    changePinError.value = ''
    changePinNotice.value = ''
    nextTick(() => changePinOldPinInputRef.value?.inputRef?.focus?.())
  }
  else if (!changePinBusy.value) {
    changePinOldPin.value = ''
    changePinNewPin.value = ''
    changePinConfirmPin.value = ''
    changePinShowOldPin.value = false
    changePinShowNewPin.value = false
    changePinShowConfirmPin.value = false
  }
})

onBeforeUnmount(() => {
  stopClearDataSlideDrag()
  stopClearDataModalDrag()
  onChangePinSheetPointerCancel()
})

function handleLogout() {
  logoutConfirmModalOpen.value = true
}

async function confirmLogout() {
  logoutConfirmModalOpen.value = false
  await signOut()
  window.location.replace('/login')
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
  if (openUpgradeForProAction()) return

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
  if (openUpgradeForProAction()) return

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
    <section class="flex items-center justify-between gap-3">
      <h1 class="min-w-0 text-3xl font-black tracking-tight text-default">{{ settingsCopy.settings }}</h1>

      <div class="flex shrink-0 items-center gap-2">
        <PageReloadButton />

        <UButton
          class="h-9 justify-center rounded-full bg-gradient-to-r from-rose-500 to-red-400 px-3 text-xs font-bold text-white shadow-[0_12px_24px_-16px_rgba(239,68,68,0.55)] transition active:scale-95 sm:h-10 sm:px-4 sm:text-sm"
          icon="i-lucide-log-out"
          @click="handleLogout"
        >
          {{ settingsCopy.logout }}
        </UButton>
      </div>
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
      <div class="flex items-center justify-between gap-3 px-4 py-4">
        <div class="min-w-0">
          <h2 class="text-sm font-black tracking-tight text-default">{{ settingsCopy.security }}</h2>
          <p class="text-xs text-muted">{{ settingsCopy.securityDesc }}</p>
        </div>

        <UButton
          type="button"
          icon="i-lucide-lock-keyhole"
          :class="[
            'h-10 rounded-full bg-gradient-to-r px-4 text-sm font-bold text-white shadow-[0_14px_28px_-18px_rgba(15,23,42,0.35)] transition active:scale-95',
            activeTheme.accent
          ]"
          @click="openChangePinModal"
        >
          {{ settingsCopy.changePin }}
        </UButton>
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
                  v-for="(heightClass, index) in ['h-2', 'h-3', 'h-4', 'h-5']"
                  :key="index"
                  class="block w-1 rounded-full transition-all"
                  :class="[
                    heightClass,
                    isOnline && networkSignalLevel >= index + 1
                      ? 'bg-emerald-500 shadow-[0_0_0_1px_rgba(16,185,129,0.12)]'
                      : 'bg-slate-300 dark:bg-slate-700'
                  ]"
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
          <UBadge v-if="authReady && !isCloudSyncEnabled" color="neutral" variant="soft" icon="i-lucide-key-round" class="min-w-max whitespace-nowrap rounded-full px-3">
            {{ settingsCopy.cloudSyncLocked }}
          </UBadge>
          <UBadge v-else color="neutral" variant="soft" class="rounded-full px-3 opacity-70">
            ...
          </UBadge>
        </div>

        <template v-if="authReady && isCloudSyncEnabled">
          <div class="mt-3 flex items-center gap-3 rounded-[1.1rem] border border-emerald-200/80 bg-emerald-50 px-3 py-3 dark:border-emerald-900/60 dark:bg-emerald-950/30">
            <div class="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-400 text-white shadow-lg">
              <UIcon name="i-lucide-cloud-check" class="size-4" />
            </div>

            <div class="min-w-0">
              <p class="text-sm font-bold text-emerald-700 dark:text-emerald-200">{{ settingsCopy.cloudSyncReady }}</p>
              <p class="text-xs leading-5 text-emerald-700/80 dark:text-emerald-200/80">{{ settingsCopy.cloudSyncActiveDesc }}</p>
            </div>
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
        <p v-if="currencySettingsError" class="mb-3 mt-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-100">
          {{ currencySettingsError }}
        </p>

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
            @click="handleToggleCurrency(item.value)"
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

      <div class="space-y-4 border-t border-slate-200/80 px-4 py-4 dark:border-slate-800">
        <div class="rounded-[1.1rem] border border-rose-200 bg-rose-50 p-4 text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-100">
          <div class="flex items-start gap-3">
            <div class="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-red-400 text-white shadow-lg">
              <UIcon name="i-lucide-trash-2" class="size-4" />
            </div>

            <div class="min-w-0">
              <p class="text-sm font-bold text-default">{{ settingsCopy.clearData }}</p>
              <p class="mt-1 text-xs leading-5 opacity-90">{{ settingsCopy.clearDataDesc }}</p>
            </div>
          </div>

          <UButton
            class="mt-4 h-11 w-full justify-center rounded-full bg-gradient-to-r from-rose-500 to-red-400 px-4 text-sm font-bold text-white shadow-[0_14px_28px_-18px_rgba(239,68,68,0.5)] transition active:scale-95 hover:opacity-95"
            icon="i-lucide-eraser"
            :loading="isClearingData"
            :disabled="isClearingData"
            @click="openClearDataConfirmModal"
          >
            {{ settingsCopy.clearDataButton }}
          </UButton>
        </div>

        <UButton class="h-12 w-full justify-center rounded-2xl bg-gradient-to-r from-rose-500 to-red-400 px-2 text-xs font-bold text-white shadow-[0_14px_28px_-18px_rgba(239,68,68,0.5)] transition active:scale-95 sm:px-4 sm:text-sm" icon="i-lucide-log-out" @click="handleLogout">
          {{ settingsCopy.logout }}
        </UButton>
      </div>
    </section>

    <UModal
      v-model:open="logoutConfirmModalOpen"
      :title="settingsCopy.logoutConfirmTitle"
      :description="settingsCopy.logoutConfirmDesc"
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

    <UModal
      v-model:open="clearDataConfirmModalOpen"
      :close="false"
      :ui="{
        content: '!fixed !inset-auto !top-1/2 !left-1/2 flex !max-h-[calc(100dvh-2rem)] !w-[calc(100vw-2rem)] !max-w-lg !-translate-x-1/2 !-translate-y-1/2 flex-col !overflow-hidden !rounded-[1.5rem] !border !border-slate-200/80 !bg-white !shadow-[0_24px_80px_-28px_rgba(15,23,42,0.35)] !ring-1 !ring-slate-200/60 focus:outline-none dark:!border-slate-800 dark:!bg-slate-950 dark:!ring-slate-800 sm:!max-h-[calc(100dvh-4rem)]',
        body: 'flex-1 overflow-y-auto p-0',
        footer: 'flex items-center gap-1.5 p-0',
        header: 'flex items-center gap-1.5 p-0 min-h-16',
        overlay: 'fixed inset-0 bg-elevated/75 backdrop-blur-[2px]'
      }"
    >
      <template #content="{ close }">
        <div
          class="flex max-h-[86svh] flex-col overflow-hidden"
          :class="clearDataModalDragging ? 'transition-none' : 'transition-transform duration-150 ease-out'"
          :style="{
            transform: clearDataModalDragOffset ? `translateY(${clearDataModalDragOffset}px)` : undefined
          }"
        >
          <div
            class="shrink-0 touch-none border-b border-slate-200/80 px-4 pb-4 pt-2 dark:border-slate-800"
            @pointerdown="handleClearDataModalPointerDown"
          >
            <div class="mx-auto mb-2 h-1.5 w-12 rounded-full bg-slate-300/80 dark:bg-slate-700" />

            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <p class="text-xs font-semibold uppercase tracking-[0.18em] text-muted">{{ settingsCopy.clearDataModalTitle }}</p>
                <p class="mt-1 text-[11px] text-muted">{{ settingsCopy.clearDataModalDesc }}</p>
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
              <div class="rounded-[1rem] border border-rose-200 bg-rose-50 p-4 text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-100">
                <p class="text-[10px] font-semibold uppercase tracking-[0.22em]">{{ settingsCopy.clearDataWarning }}</p>
                <p class="mt-1 text-xs leading-5 opacity-90">{{ settingsCopy.clearDataModalDesc }}</p>
              </div>

              <div class="grid gap-3 sm:grid-cols-1">
                <div class="rounded-[1rem] border border-slate-200/80 bg-slate-50 px-3 py-3 dark:border-slate-800 dark:bg-slate-900">
                  <p class="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">{{ settingsCopy.clearDataCloudLabel }}</p>
                  <p class="mt-1 text-sm font-bold text-default">{{ settingsCopy.clearDataCloudDesc }}</p>
                </div>
              </div>

              <div class="rounded-[1.1rem] border border-slate-200/80 bg-slate-100/80 px-3 py-3 dark:border-slate-800 dark:bg-slate-900/80">
                <div class="flex items-center justify-between gap-3">
                  <div class="min-w-0">
                    <p class="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">{{ settingsCopy.clearDataSlideLabel }}</p>
                    <p class="mt-1 text-xs leading-5 text-muted">{{ settingsCopy.clearDataSlideHint }}</p>
                  </div>
                  <UBadge
                    class="shrink-0 rounded-full"
                    :color="clearDataSlideUnlocked ? 'primary' : 'neutral'"
                    variant="soft"
                  >
                    {{ clearDataSlideUnlocked ? settingsCopy.clearDataSlideUnlocked : '0%' }}
                  </UBadge>
                </div>

                <div
                  ref="clearDataSlideTrackRef"
                  class="mt-3 relative h-12 select-none rounded-full border border-slate-200 bg-slate-200/80 p-1 dark:border-slate-700 dark:bg-slate-800"
                  role="slider"
                  tabindex="0"
                  :aria-label="settingsCopy.clearDataSlideLabel"
                  :aria-valuemin="0"
                  :aria-valuemax="100"
                  :aria-valuenow="clearDataSlideValue"
                  :aria-valuetext="clearDataSlideUnlocked ? settingsCopy.clearDataSlideUnlocked : `${clearDataSlideValue}%`"
                  @pointerdown.prevent="handleClearDataSlidePointerDown"
                >
                  <div
                    class="absolute inset-y-1 left-1 rounded-full bg-gradient-to-r from-rose-500 to-red-400 transition-[width] duration-75 ease-out"
                    :style="{ width: `${clearDataSlideValue}%` }"
                  />
                  <div
                    class="absolute top-1/2 z-10 h-7 w-7 -translate-y-1/2 rounded-full border-2 border-rose-500 bg-white shadow-[0_10px_24px_-12px_rgba(244,63,94,0.55)] transition-[left] duration-75 ease-out"
                    :style="{ left: `calc(${clearDataSlideValue}% - 0.875rem)` }"
                  />
                  <div class="relative flex h-full items-center justify-between px-4 text-[10px] font-bold uppercase tracking-[0.18em] drop-shadow-[0_1px_1px_rgba(15,23,42,0.45)]">
                    <span
                      class="transition-colors duration-150"
                      :class="clearDataSlideValue > 0 ? 'text-white' : 'text-slate-800 dark:text-slate-200'"
                    >
                      0%
                    </span>
                    <span
                      class="transition-colors duration-150"
                      :class="clearDataSlideValue >= 100 ? 'text-white' : 'text-slate-800 dark:text-slate-200'"
                    >
                      100%
                    </span>
                  </div>
                </div>
              </div>

              <p v-if="clearDataError" class="text-sm font-semibold text-rose-600 dark:text-rose-300">
                {{ clearDataError }}
              </p>
            </div>
          </div>

          <div class="shrink-0 border-t border-slate-200/80 bg-white/96 px-4 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/96">
            <div class="grid grid-cols-2 gap-3">
              <UButton
                class="h-12 w-full justify-center rounded-full border border-slate-200 bg-white px-4 text-sm font-bold whitespace-nowrap text-default shadow-none hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900"
                variant="soft"
                :disabled="isClearingData"
                @click="close()"
              >
                {{ settingsCopy.cancel }}
              </UButton>
              <UButton
                :loading="isClearingData"
                icon="i-lucide-eraser"
                class="h-12 w-full justify-center rounded-full bg-gradient-to-r from-rose-500 to-red-400 px-4 text-sm font-bold whitespace-nowrap text-white shadow-[0_14px_28px_-18px_rgba(239,68,68,0.5)] transition hover:opacity-95 active:scale-95"
                :disabled="isClearingData || !clearDataSlideUnlocked"
                @click="clearAccountData"
              >
                {{ settingsCopy.clearDataAction }}
              </UButton>
            </div>
          </div>
        </div>
      </template>
    </UModal>

    <UModal
      v-model:open="profileAvatarModalOpen"
      :close="false"
      :ui="centeredSettingsModalUi"
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
    </UModal>

    <UModal
      v-model:open="proRedeemModalOpen"
      :title="settingsCopy.upgradeModalTitle"
      :description="settingsCopy.upgradeModalDesc"
      :ui="centeredSettingsModalUi"
    >
      <template #body>
        <div class="px-4 pb-4 pt-2 sm:px-5 sm:pb-5">
          <div class="mx-auto mb-4 flex w-fit items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1.5 text-sky-700 dark:border-sky-900/60 dark:bg-sky-950/30 dark:text-sky-100">
            <UIcon name="i-lucide-badge-check" class="size-4" />
            <span class="text-[10px] font-semibold uppercase tracking-[0.22em]">{{ settingsCopy.upgradeToPro }}</span>
          </div>

          <div class="space-y-4">
            <div class="rounded-[1.1rem] border border-slate-200/80 bg-gradient-to-br from-slate-50 to-white p-4 shadow-sm dark:border-slate-800 dark:from-slate-900 dark:to-slate-950">
              <p class="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted">{{ settingsCopy.account }}</p>
              <p class="mt-1 break-all text-base font-black text-default">{{ sessionProfile?.identifier }}</p>
              <p class="mt-1 text-xs leading-5 text-muted">{{ settingsCopy.keyActivate }}</p>
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

            <p v-if="proRedeemError" class="rounded-[0.9rem] border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-600 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300">
              {{ proRedeemError }}
            </p>
          </div>
        </div>
      </template>

      <template #footer>
        <div class="grid grid-cols-2 gap-3 border-t border-slate-200/80 bg-white/96 px-4 pb-[calc(env(safe-area-inset-bottom)+0.8rem)] pt-3 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/96 sm:px-5">
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
      v-model:open="changePinModalOpen"
      side="bottom"
      :close="true"
      :ui="{
        content: 'w-full data-[state=open]:animate-[slide-in-from-bottom_220ms_ease-out] data-[state=closed]:animate-[slide-out-to-bottom_220ms_ease-in] data-[state=open]:rounded-t-[1.5rem] data-[state=closed]:rounded-t-[1.5rem] overflow-hidden border border-slate-200/80 bg-white shadow-[0_-18px_60px_-30px_rgba(15,23,42,0.35)] dark:border-slate-800 dark:bg-slate-950',
        body: 'p-0',
        footer: 'p-0',
        header: 'p-0'
      }"
      @after:leave="resetChangePinSheetDrag"
    >
      <template #content="{ close }">
        <div
          class="max-h-[88svh] overflow-hidden"
          :style="{ transform: `translateY(${changePinSheetDragY}px)`, transition: changePinSheetDragging ? 'none' : 'transform 180ms ease-out' }"
        >
          <div class="flex max-h-[88svh] flex-col overflow-hidden">
            <div class="border-b border-slate-200/80 px-4 pb-3 pt-2 dark:border-slate-800">
              <div
                ref="changePinSheetHandleRef"
                class="touch-none select-none cursor-grab active:cursor-grabbing"
                @pointerdown="onChangePinSheetPointerDown"
                @pointermove="onChangePinSheetPointerMove"
                @pointerup="onChangePinSheetPointerUp"
                @pointercancel="onChangePinSheetPointerCancel"
              >
                <div class="mx-auto mb-2 h-1.5 w-12 rounded-full bg-slate-300/80 dark:bg-slate-700" />
              </div>
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <p class="text-xs font-semibold uppercase tracking-[0.18em] text-muted">{{ settingsCopy.changePinModalTitle }}</p>
                  <h2 class="mt-1 text-lg font-black tracking-tight text-default">{{ settingsCopy.changePin }}</h2>
                  <p class="mt-1 text-[11px] text-muted">{{ settingsCopy.changePinModalDesc }}</p>
                </div>

                <button
                  type="button"
                  class="flex size-9 items-center justify-center rounded-full bg-slate-100 text-muted transition active:scale-95 dark:bg-slate-900"
                  :aria-label="settingsCopy.cancel"
                  @click="closeChangePinModal(); close()"
                >
                  <UIcon name="i-lucide-x" class="size-4" />
                </button>
              </div>
            </div>

            <div class="min-h-0 flex-1 overflow-y-auto px-4 py-4 pb-[calc(env(safe-area-inset-bottom)+7rem)]">
              <div class="space-y-4">
                <div class="rounded-[1rem] border border-slate-200/80 bg-slate-50 px-3 py-3 dark:border-slate-800 dark:bg-slate-900">
                  <div class="flex items-start gap-3">
                    <div class="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-cyan-400 text-white shadow-lg">
                      <UIcon name="i-lucide-lock-keyhole" class="size-4" />
                    </div>

                    <div class="min-w-0">
                      <p class="text-sm font-bold text-default">{{ sessionProfile?.identifier }}</p>
                      <p class="mt-1 text-xs leading-5 text-muted">{{ settingsCopy.pinHint }}</p>
                    </div>
                  </div>
                </div>

                <label class="block">
                  <div class="mb-2 flex items-center gap-2">
                    <div class="flex size-8 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600 shadow-sm dark:bg-sky-950/40 dark:text-sky-200">
                      <UIcon name="i-lucide-key-round" class="size-3.5" />
                    </div>
                    <span class="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">{{ settingsCopy.oldPin }}</span>
                  </div>
                  <UInput
                    ref="changePinOldPinInputRef"
                    :model-value="changePinOldPin"
                    :placeholder="settingsCopy.oldPin"
                    class="w-full"
                    :ui="{
                      root: 'w-full',
                      base: 'h-12 w-full rounded-2xl border-0 bg-slate-50 px-4 pe-11 text-[16px] font-semibold shadow-none outline-none transition focus:ring-2 focus:ring-primary/20 dark:bg-slate-950',
                      trailing: 'absolute inset-y-0 end-0 flex items-center pe-1.5'
                    }"
                    :type="changePinShowOldPin ? 'text' : 'password'"
                    inputmode="numeric"
                    autocomplete="current-password"
                    autocapitalize="off"
                    autocorrect="off"
                    spellcheck="false"
                    @update:model-value="value => changePinOldPin = sanitizeChangePinInput(String(value ?? ''))"
                    @keyup.enter="submitChangePin"
                  >
                    <template #trailing>
                      <UButton
                        type="button"
                        variant="ghost"
                        color="neutral"
                        class="h-9 rounded-full px-2 text-muted hover:bg-slate-100 dark:hover:bg-slate-900"
                        :aria-label="changePinShowOldPin ? 'Hide PIN' : 'Show PIN'"
                        @click="changePinShowOldPin = !changePinShowOldPin"
                      >
                        <UIcon :name="changePinShowOldPin ? 'i-lucide-eye-off' : 'i-lucide-eye'" class="size-4.5" />
                      </UButton>
                    </template>
                  </UInput>
                </label>

                <label class="block">
                  <div class="mb-2 flex items-center gap-2">
                    <div class="flex size-8 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600 shadow-sm dark:bg-sky-950/40 dark:text-sky-200">
                      <UIcon name="i-lucide-lock-keyhole" class="size-3.5" />
                    </div>
                    <span class="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">{{ settingsCopy.newPin }}</span>
                  </div>
                  <UInput
                    :model-value="changePinNewPin"
                    :placeholder="settingsCopy.newPin"
                    class="w-full"
                    :ui="{
                      root: 'w-full',
                      base: 'h-12 w-full rounded-2xl border-0 bg-slate-50 px-4 pe-11 text-[16px] font-semibold shadow-none outline-none transition focus:ring-2 focus:ring-primary/20 dark:bg-slate-950',
                      trailing: 'absolute inset-y-0 end-0 flex items-center pe-1.5'
                    }"
                    :type="changePinShowNewPin ? 'text' : 'password'"
                    inputmode="numeric"
                    autocomplete="new-password"
                    autocapitalize="off"
                    autocorrect="off"
                    spellcheck="false"
                    @update:model-value="value => changePinNewPin = sanitizeChangePinInput(String(value ?? ''))"
                    @keyup.enter="submitChangePin"
                  >
                    <template #trailing>
                      <UButton
                        type="button"
                        variant="ghost"
                        color="neutral"
                        class="h-9 rounded-full px-2 text-muted hover:bg-slate-100 dark:hover:bg-slate-900"
                        :aria-label="changePinShowNewPin ? 'Hide PIN' : 'Show PIN'"
                        @click="changePinShowNewPin = !changePinShowNewPin"
                      >
                        <UIcon :name="changePinShowNewPin ? 'i-lucide-eye-off' : 'i-lucide-eye'" class="size-4.5" />
                      </UButton>
                    </template>
                  </UInput>
                </label>

                <label class="block">
                  <div class="mb-2 flex items-center gap-2">
                    <div class="flex size-8 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600 shadow-sm dark:bg-sky-950/40 dark:text-sky-200">
                      <UIcon name="i-lucide-check-circle-2" class="size-3.5" />
                    </div>
                    <span class="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">{{ settingsCopy.confirmNewPin }}</span>
                  </div>
                  <UInput
                    :model-value="changePinConfirmPin"
                    :placeholder="settingsCopy.confirmNewPin"
                    class="w-full"
                    :ui="{
                      root: 'w-full',
                      base: 'h-12 w-full rounded-2xl border-0 bg-slate-50 px-4 pe-11 text-[16px] font-semibold shadow-none outline-none transition focus:ring-2 focus:ring-primary/20 dark:bg-slate-950',
                      trailing: 'absolute inset-y-0 end-0 flex items-center pe-1.5'
                    }"
                    :type="changePinShowConfirmPin ? 'text' : 'password'"
                    inputmode="numeric"
                    autocomplete="new-password"
                    autocapitalize="off"
                    autocorrect="off"
                    spellcheck="false"
                    @update:model-value="value => changePinConfirmPin = sanitizeChangePinInput(String(value ?? ''))"
                    @keyup.enter="submitChangePin"
                  >
                    <template #trailing>
                      <UButton
                        type="button"
                        variant="ghost"
                        color="neutral"
                        class="h-9 rounded-full px-2 text-muted hover:bg-slate-100 dark:hover:bg-slate-900"
                        :aria-label="changePinShowConfirmPin ? 'Hide PIN' : 'Show PIN'"
                        @click="changePinShowConfirmPin = !changePinShowConfirmPin"
                      >
                        <UIcon :name="changePinShowConfirmPin ? 'i-lucide-eye-off' : 'i-lucide-eye'" class="size-4.5" />
                      </UButton>
                    </template>
                  </UInput>
                </label>

                <p v-if="changePinNotice" class="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-100">
                  {{ changePinNotice }}
                </p>

                <p v-if="changePinError" class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-100">
                  {{ changePinError }}
                </p>
              </div>
            </div>

            <div class="sticky bottom-0 shrink-0 border-t border-slate-200/80 bg-white/92 px-4 py-3 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/90">
              <div class="grid gap-2">
                <UButton
                  variant="soft"
                  color="neutral"
                  class="h-12 justify-center rounded-full text-center font-bold"
                  icon="i-lucide-x"
                  :disabled="changePinBusy"
                  @click="closeChangePinModal(); close()"
                >
                  {{ settingsCopy.cancel }}
                </UButton>
                <UButton
                  :loading="changePinBusy"
                  :class="['h-12 justify-center rounded-full bg-gradient-to-r text-center font-bold text-white shadow-[0_18px_35px_-22px_rgba(15,23,42,0.28)] transition active:scale-95', activeTheme.accent]"
                  icon="i-lucide-lock-keyhole"
                  @click="submitChangePin"
                >
                  {{ settingsCopy.changePin }}
                </UButton>
              </div>
            </div>
          </div>
        </div>
      </template>
    </USlideover>

    <UModal
      v-model:open="storageExportModalOpen"
      :close="false"
      :ui="centeredSettingsModalUi"
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
    </UModal>

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

<style scoped>
.clear-data-range {
  accent-color: rgb(244 63 94);
}

.clear-data-range:focus-visible {
  outline: none;
}

.clear-data-range::-webkit-slider-runnable-track {
  height: 0.75rem;
  border-radius: 9999px;
  background: linear-gradient(90deg, rgba(244, 63, 94, 0.22) 0%, rgba(248, 113, 113, 0.42) 100%);
}

.clear-data-range::-webkit-slider-thumb {
  appearance: none;
  width: 1.5rem;
  height: 1.5rem;
  margin-top: -0.375rem;
  border: 2px solid rgb(244 63 94);
  border-radius: 9999px;
  background: #fff;
  box-shadow: 0 10px 20px rgba(244, 63, 94, 0.22);
}

.clear-data-range::-moz-range-track {
  height: 0.75rem;
  border: 0;
  border-radius: 9999px;
  background: linear-gradient(90deg, rgba(244, 63, 94, 0.22) 0%, rgba(248, 113, 113, 0.42) 100%);
}

.clear-data-range::-moz-range-progress {
  height: 0.75rem;
  border-radius: 9999px;
  background: linear-gradient(90deg, rgb(244 63 94) 0%, rgb(248 113 113) 100%);
}

.clear-data-range::-moz-range-thumb {
  width: 1.5rem;
  height: 1.5rem;
  border: 2px solid rgb(244 63 94);
  border-radius: 9999px;
  background: #fff;
  box-shadow: 0 10px 20px rgba(244, 63, 94, 0.22);
}

.sync-progress-shell {
  position: relative;
}

.sync-progress-fill {
  position: relative;
  z-index: 1;
}

.sync-progress-shimmer {
  position: absolute;
  inset: 0;
  z-index: 2;
  width: 40%;
  border-radius: inherit;
  animation: sync-progress-shimmer 1.25s linear infinite;
  pointer-events: none;
}

@keyframes sync-progress-shimmer {
  0% {
    transform: translateX(-120%);
  }

  100% {
    transform: translateX(260%);
  }
}
</style>
