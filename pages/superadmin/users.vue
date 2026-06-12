<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin-auth'
})

const { selectedLanguage } = useAppLanguage()
const { activeTheme } = useAppThemeColor()
const userPage = ref(1)
const userPageSize = ref(10)
const userPageSizeOptions = [10, 20, 50]
const displayTimeZone = 'Asia/Vientiane'
const { data: overview, pending, refresh } = useSuperadminData({
  accountsPage: userPage,
  accountsLimit: userPageSize,
  redeemKeysLimit: 0
})
const detailSheetDragY = ref(0)
const detailSheetDragging = ref(false)
const detailSheetDragStartY = ref(0)
const detailSheetPointerId = ref<number | null>(null)
const detailSheetHandleRef = ref<HTMLElement | null>(null)
const detailOpen = ref(false)
const deleteSheetDragY = ref(0)
const deleteSheetDragging = ref(false)
const deleteSheetDragStartY = ref(0)
const deleteSheetPointerId = ref<number | null>(null)
const deleteSheetHandleRef = ref<HTMLElement | null>(null)
const deleteCloudOpen = ref(false)
const deletingCloud = ref(false)
const updateSheetDragY = ref(0)
const updateSheetDragging = ref(false)
const updateSheetDragStartY = ref(0)
const updateSheetPointerId = ref<number | null>(null)
const updateSheetHandleRef = ref<HTMLElement | null>(null)
const updateUserOpen = ref(false)
const deleteUserSheetDragY = ref(0)
const deleteUserSheetDragging = ref(false)
const deleteUserSheetDragStartY = ref(0)
const deleteUserSheetPointerId = ref<number | null>(null)
const deleteUserSheetHandleRef = ref<HTMLElement | null>(null)
const deleteUserOpen = ref(false)
const updatingUser = ref(false)
const deletingUser = ref(false)
const upgradeUserOpen = ref(false)
const loadingUpgradeKeys = ref(false)
const upgradingUserToPro = ref(false)
const upgradeKeysError = ref('')
const upgradeKeys = ref<{
  code: string
  active: boolean
  redeemedBy: string | null
  redeemedAt: string | null
  createdAt: string
  updatedAt: string
}[]>([])
const selectedUpgradeKey = ref('')
const refreshingUsers = ref(false)
const isUsersLoading = computed(() => pending.value || refreshingUsers.value)
const passwordResetResult = ref<{ identifier: string; pin: string } | null>(null)
const copiedCredentialField = ref<'identifier' | 'pin' | null>(null)
let copiedCredentialTimer: ReturnType<typeof setTimeout> | null = null
const selectedAccount = ref<{
  identifier: string
  identifierType: 'email' | 'phone'
  plan: 'free' | 'pro'
  remember: boolean
  createdAt: string
  updatedAt: string
  proStartedAt: string | null
  cloudClearedCount: number
  cloudClearedAt: string | null
  cloudUpdatedAt: string | null
  walletCount: number
  transactionCount: number
  categoryCount: number
  companyCount: number
  recordCount: number
  cloudSizeBytes: number
} | null>(null)
const availableUpgradeKeys = computed(() => upgradeKeys.value.filter(key => key.active && !key.redeemedBy && !key.redeemedAt))

const centeredSuperadminModalUi = {
  content: '!fixed !inset-auto !top-1/2 !left-1/2 flex !max-h-[calc(100dvh-2rem)] !w-[calc(100vw-1.5rem)] !max-w-[42rem] !-translate-x-1/2 !-translate-y-1/2 flex-col !overflow-hidden !rounded-[1.75rem] !border !border-slate-200/70 !bg-white !shadow-[0_30px_90px_-36px_rgba(15,23,42,0.42)] !ring-1 !ring-slate-200/60 focus:outline-none dark:!border-slate-800 dark:!bg-slate-950 dark:!ring-slate-800 sm:!max-h-[calc(100dvh-4rem)]',
  body: 'p-0',
  header: 'p-0',
  footer: 'p-0',
  overlay: 'fixed inset-0 bg-slate-950/45 backdrop-blur-[10px]'
}

const copy = computed(() => selectedLanguage.value === 'lo'
  ? {
      title: 'Users',
      subtitle: 'ຈັດການ user, plan ແລະ cloud backup ຢູ່ໜ້ານີ້',
      backupStatus: 'Cloud backup',
      userStatus: 'ຜູ້ໃຊ້ທັງໝົດ',
      actions: 'ຈັດການ',
      joined: 'ສ້າງແລ້ວ',
      lastActive: 'ໃຊ້ລ່າສຸດ',
      cloudUpdated: 'ອັບເດດ cloud ລ່າສຸດ',
      proStarted: 'Pro start',
      redeemKey: 'Redeem key',
      cloudClears: 'Cloud clears',
      lastCloudClear: 'Last cloud clear',
      manageUser: 'Manage user',
      updateUser: 'Update user',
      deleteUser: 'Delete user',
      userUpdateTitle: 'Update user',
      userUpdateDesc: 'Change plan and remember state for this account.',
      userUpdatePlan: 'Plan',
      userUpdateRemember: 'Remember this device',
      userUpdateHint: 'Switching to Pro will save the Pro start date automatically.',
      userDeleteTitle: 'Delete user account',
      userDeleteDesc: 'Delete the account and cloud backup. This cannot be undone.',
      userDeleteHint: 'This removes the account from admin records and keeps cloud backup separate.',
      userDeleteConfirm: 'Delete account',
      records: 'Record',
      cloudSize: 'ຂະໜາດຄລາວ',
      details: 'ລາຍລະອຽດ',
      close: 'ປິດ',
      deleteCloudData: 'ລ້າງ transaction cloud',
      deleteCloudTitle: 'ລ້າງ transaction ໃນ cloud',
      deleteCloudDesc: 'ລຶບພຽງ transaction ທີ່ຢູ່ໃນ cloud backup. wallet, category ແລະ company ຍັງຢູ່ຄົງເດີມ.',
      deleteCloudHint: 'ການກະທຳນີ້ຈະລຶບພຽງ transaction ໃນ cloud ເທົ່ານັ້ນ.',
      deleteConfirm: 'ລຶບ transaction',
      freeAccounts: 'Free',
      proAccounts: 'Pro',
      cloudBackups: 'Cloud backups',
      cloudPreserved: 'wallet, category ແລະ company ຍັງຢູ່',
      wallets: 'ກະເປົ໋າ',
      transactions: 'ທຸລະກຳ',
      categories: 'ປະເພດ',
      companies: 'ບໍລິສັດ',
      planFree: 'Free',
      planPro: 'Pro',
      latestBackup: 'Backup ລ່າສຸດ',
      backedUp: 'Backup saved',
      noBackup: 'No backup yet',
      updatePassword: 'ຕັ້ງ PIN ໃໝ່',
      updatePasswordTitle: 'ຕັ້ງ PIN ໃໝ່',
      updatePasswordDesc: 'ລະບົບຈະສ້າງ PIN 6 ຕົວໃໝ່ໃຫ້ user ນີ້ ແລະສະແດງໃຫ້ copy ໄດ້ທັນທີ.',
      updatePasswordHint: 'PIN ເກົ່າຈະໃຊ້ບໍ່ໄດ້ຫຼັງອັບເດດ.',
      updatePasswordConfirm: 'ຢືນຢັນສ້າງ PIN ໃໝ່',
      updatePasswordDone: 'PIN ຖືກອັບເດດແລ້ວ',
      updatePasswordDoneDesc: 'ສຳເນົາ username ແລະ PIN ໃຫ້ user ໄດ້ທັນທີ.',
      upgradeUser: 'ອັບເກຣດເປັນ Pro',
      upgradeUserTitle: 'ອັບເກຣດ user ເປັນ Pro',
      upgradeUserDesc: 'ເລືອກ key ທີ່ຍັງວ່າງແລ້ວກົດ Apply. key ນີ້ຈະຖືກໃຊ້ທັນທີ.',
      upgradeUserHint: 'ລະບົບຈະ auto select key ທີ່ວ່າງຢູ່ຕົວທຳອິດ.',
      upgradeUserSelectKey: 'ເລືອກ key',
      upgradeUserNoKey: 'ບໍ່ມີ key ວ່າງ',
      upgradeUserConfirm: 'Apply ແລະອັບເກຣດ',
      upgradeUserDone: 'ອັບເກຣດເປັນ Pro ແລ້ວ',
      username: 'Username',
      loginType: 'ປະເພດລັອກອິນ',
      password: 'PIN',
      copied: 'ສຳເນົາແລ້ວ',
      copy: 'ສຳເນົາ',
      showing: 'ສະແດງ',
      perPage: 'ຕໍ່ໜ້າ',
      page: 'ໜ້າ',
      of: 'ຈາກ',
      previous: 'ກ່ອນໜ້າ',
      next: 'ຕໍ່ໄປ',
      noData: 'ບໍ່ພົບຂໍ້ມູນ'
    }
  : {
      title: 'Users',
      subtitle: 'Review user plans, join date, activity, records, and cloud backup usage.',
      backupStatus: 'Cloud backup',
      userStatus: 'Total Users',
      actions: 'Actions',
      joined: 'Joined',
      lastActive: 'Last active',
      cloudUpdated: 'Last cloud update',
      proStarted: 'Pro start',
      redeemKey: 'Redeem key',
      cloudClears: 'Cloud clears',
      lastCloudClear: 'Last cloud clear',
      manageUser: 'Manage user',
      updateUser: 'Update user',
      deleteUser: 'Delete user',
      userUpdateTitle: 'Update user',
      userUpdateDesc: 'Change plan and remember state for this account.',
      userUpdatePlan: 'Plan',
      userUpdateRemember: 'Remember this device',
      userUpdateHint: 'Switching to Pro will save the Pro start date automatically.',
      userDeleteTitle: 'Delete user account',
      userDeleteDesc: 'Delete the account and cloud backup. This cannot be undone.',
      userDeleteHint: 'This removes the account from admin records and keeps cloud backup separate.',
      userDeleteConfirm: 'Delete account',
      records: 'Records',
      cloudSize: 'Cloud size',
      details: 'Details',
      close: 'Close',
      deleteCloudData: 'Clear cloud transactions',
      deleteCloudTitle: 'Clear cloud transactions',
      deleteCloudDesc: 'Clear only transactions from the cloud backup. Wallets, categories, and companies stay intact.',
      deleteCloudHint: 'This action removes transaction data only.',
      deleteConfirm: 'Clear transactions',
      freeAccounts: 'Free',
      proAccounts: 'Pro',
      cloudBackups: 'Cloud backups',
      cloudPreserved: 'Wallets, categories, and companies stay',
      wallets: 'Wallets',
      transactions: 'Transactions',
      categories: 'Categories',
      companies: 'Companies',
      planFree: 'Free',
      planPro: 'Pro',
      latestBackup: 'Latest backup',
      backedUp: 'Backup saved',
      noBackup: 'No backup yet',
      updatePassword: 'Reset password',
      updatePasswordTitle: 'Reset password',
      updatePasswordDesc: 'Generate a fresh 6-digit PIN for this user and show it here for copying.',
      updatePasswordHint: 'The previous PIN will stop working immediately after the update.',
      updatePasswordConfirm: 'Generate new PIN',
      updatePasswordDone: 'Password updated',
      updatePasswordDoneDesc: 'Copy the username and new PIN to send to the user.',
      upgradeUser: 'Upgrade to Pro',
      upgradeUserTitle: 'Upgrade user to Pro',
      upgradeUserDesc: 'Choose an unused key and press Apply. The selected key will be consumed right away.',
      upgradeUserHint: 'The first available key is selected automatically.',
      upgradeUserSelectKey: 'Select key',
      upgradeUserNoKey: 'No available keys',
      upgradeUserConfirm: 'Apply and upgrade',
      upgradeUserDone: 'User upgraded to Pro',
      username: 'Username',
      loginType: 'Login type',
      password: 'PIN',
      copied: 'Copied',
      copy: 'Copy',
      showing: 'Showing',
      perPage: 'per page',
      page: 'Page',
      of: 'of',
      previous: 'Previous',
      next: 'Next',
      noData: 'No data yet'
    })

const overviewStats = computed(() => overview.value?.stats ?? null)
const accounts = computed(() => overview.value?.accounts ?? [])
const userPagination = computed(() => overview.value?.accountsPagination ?? null)
const userRangeStart = computed(() => {
  if (!userPagination.value?.total || !accounts.value.length) return 0
  return ((userPagination.value.page - 1) * userPagination.value.limit) + 1
})
const userRangeEnd = computed(() => {
  if (!userPagination.value?.total || !accounts.value.length) return 0
  return userRangeStart.value + accounts.value.length - 1
})
const userHasPrevious = computed(() => (userPagination.value?.page ?? 1) > 1)
const userHasNext = computed(() => Boolean(userPagination.value && userPagination.value.totalPages > 0 && userPagination.value.page < userPagination.value.totalPages))

watch(userPageSize, () => {
  userPage.value = 1
})

watch(userPagination, (pagination) => {
  if (pagination && pagination.totalPages > 0 && userPage.value > pagination.totalPages) {
    userPage.value = pagination.totalPages
  }
})

function formatDate(value?: string | null) {
  if (!value) return '—'
  return new Intl.DateTimeFormat(selectedLanguage.value === 'lo' ? 'lo-LA' : 'en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: displayTimeZone
  }).format(new Date(value))
}

function formatBytes(bytes?: number | null) {
  const value = Number(bytes ?? 0)
  if (!value) return '0 B'

  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const index = Math.min(Math.floor(Math.log(value) / Math.log(1024)), units.length - 1)
  const size = value / (1024 ** index)
  return `${size >= 10 || index === 0 ? size.toFixed(0) : size.toFixed(1)} ${units[index]}`
}

function openAccountDetail(account: typeof accounts.value[number]) {
  selectedAccount.value = account
  detailOpen.value = true
  detailSheetDragY.value = 0
  detailSheetDragging.value = false
  detailSheetDragStartY.value = 0
  detailSheetPointerId.value = null
}

function openDeleteCloudConfirm() {
  if (!selectedAccount.value || deletingCloud.value) return
  deleteCloudOpen.value = true
}

function openUpdateUserSheet() {
  if (!selectedAccount.value || updatingUser.value) return
  passwordResetResult.value = null
  copiedCredentialField.value = null
  if (copiedCredentialTimer) {
    clearTimeout(copiedCredentialTimer)
    copiedCredentialTimer = null
  }
  updateUserOpen.value = true
  updateSheetDragY.value = 0
  updateSheetDragging.value = false
  updateSheetDragStartY.value = 0
  updateSheetPointerId.value = null
}

async function loadUpgradeKeys() {
  if (loadingUpgradeKeys.value) return

  loadingUpgradeKeys.value = true
  upgradeKeysError.value = ''

  try {
    const result = await $fetch<{
      keys?: {
        code: string
        active: boolean
        redeemedBy: string | null
        redeemedAt: string | null
        createdAt: string
        updatedAt: string
      }[]
    }>('/api/superadmin/redeem-keys', {
      query: {
        activeOnly: 1,
        limit: 1000
      }
    })

    upgradeKeys.value = Array.isArray(result.keys) ? result.keys : []
  }
  catch (error) {
    upgradeKeys.value = []
    upgradeKeysError.value = error instanceof Error ? error.message : 'Failed to load keys'
  }
  finally {
    loadingUpgradeKeys.value = false

    if (upgradeUserOpen.value) {
      const firstAvailableKey = availableUpgradeKeys.value[0]?.code ?? ''
      if (!selectedUpgradeKey.value || !availableUpgradeKeys.value.some(key => key.code === selectedUpgradeKey.value)) {
        selectedUpgradeKey.value = firstAvailableKey
      }
    }
  }
}

function openUpgradeUserModal() {
  if (!selectedAccount.value || selectedAccount.value.plan === 'pro') return

  upgradeUserOpen.value = true
  selectedUpgradeKey.value = availableUpgradeKeys.value[0]?.code ?? ''
  void loadUpgradeKeys()
}

async function confirmUpgradeUserToPro() {
  const account = selectedAccount.value
  const redeemKey = selectedUpgradeKey.value.trim()

  if (!account || !redeemKey || upgradingUserToPro.value) return

  upgradingUserToPro.value = true
  try {
    await $fetch('/api/auth/upgrade', {
      method: 'POST',
      body: {
        identifier: account.identifier,
        key: redeemKey
      }
    })

    upgradeUserOpen.value = false
    detailOpen.value = false
    selectedAccount.value = null
    selectedUpgradeKey.value = ''
    await refresh()
  }
  finally {
    upgradingUserToPro.value = false
  }
}

async function confirmUpdateUser() {
  const account = selectedAccount.value
  if (!account || updatingUser.value) return

  updatingUser.value = true
  try {
    const result = await $fetch<{
      account?: {
        identifier?: string
      }
      credentials?: {
        identifier?: string
        pin?: string
      } | null
    }>(`/api/superadmin/users/${encodeURIComponent(account.identifier)}`, {
      method: 'PATCH',
      body: {
        resetPassword: true
      }
    })

    passwordResetResult.value = {
      identifier: result.credentials?.identifier ?? result.account?.identifier ?? account.identifier,
      pin: result.credentials?.pin ?? ''
    }
    detailOpen.value = false
    selectedAccount.value = null
    await refresh()
  }
  finally {
    updatingUser.value = false
  }
}

async function copyCredential(field: 'identifier' | 'pin') {
  const credential = passwordResetResult.value
  if (!credential) return

  const value = field === 'identifier' ? credential.identifier : credential.pin
  if (!value) return

  try {
    await navigator.clipboard.writeText(value)
    copiedCredentialField.value = field

    if (copiedCredentialTimer) {
      clearTimeout(copiedCredentialTimer)
    }

    copiedCredentialTimer = setTimeout(() => {
      copiedCredentialField.value = null
      copiedCredentialTimer = null
    }, 1200)
  }
  catch {
    copiedCredentialField.value = null
  }
}

function openDeleteUserConfirm() {
  if (!selectedAccount.value || deletingUser.value) return
  deleteUserOpen.value = true
  deleteUserSheetDragY.value = 0
  deleteUserSheetDragging.value = false
  deleteUserSheetDragStartY.value = 0
  deleteUserSheetPointerId.value = null
}

async function confirmDeleteUser() {
  const account = selectedAccount.value
  if (!account || deletingUser.value) return

  deletingUser.value = true
  try {
    await $fetch(`/api/superadmin/users/${encodeURIComponent(account.identifier)}`, {
      method: 'DELETE'
    })

    deleteUserOpen.value = false
    detailOpen.value = false
    selectedAccount.value = null
    await refresh()
  }
  finally {
    deletingUser.value = false
  }
}

async function confirmDeleteCloud() {
  const account = selectedAccount.value
  if (!account || deletingCloud.value) return

  deletingCloud.value = true
  try {
    await $fetch(`/api/superadmin/users/${encodeURIComponent(account.identifier)}/cloud`, {
      method: 'DELETE'
    })

    deleteCloudOpen.value = false
    detailOpen.value = false
    selectedAccount.value = null
    await refresh()
  }
  finally {
    deletingCloud.value = false
  }
}

async function refreshUsers() {
  if (refreshingUsers.value) return

  refreshingUsers.value = true
  try {
    await refresh()
  }
  finally {
    refreshingUsers.value = false
  }
}

function goToPreviousUserPage() {
  if (!userHasPrevious.value) return
  userPage.value -= 1
}

function goToNextUserPage() {
  if (!userHasNext.value) return
  userPage.value += 1
}

function resetDetailSheetDrag() {
  detailSheetDragY.value = 0
  detailSheetDragging.value = false
  detailSheetDragStartY.value = 0
  detailSheetPointerId.value = null
}

function onDetailSheetPointerDown(event: PointerEvent) {
  const target = event.target as HTMLElement | null
  if (target?.closest('button, a, input, select, textarea, [role="button"]')) return
  detailSheetHandleRef.value?.setPointerCapture(event.pointerId)
  detailSheetDragging.value = true
  detailSheetDragStartY.value = event.clientY
  detailSheetPointerId.value = event.pointerId
}

function onDetailSheetPointerMove(event: PointerEvent) {
  if (!detailSheetDragging.value || detailSheetPointerId.value !== event.pointerId) return
  const deltaY = Math.max(0, event.clientY - detailSheetDragStartY.value)
  detailSheetDragY.value = deltaY
}

function onDetailSheetPointerUp(event: PointerEvent) {
  if (!detailSheetDragging.value || detailSheetPointerId.value !== event.pointerId) return
  detailSheetHandleRef.value?.releasePointerCapture(event.pointerId)
  const shouldClose = detailSheetDragY.value > 90
  resetDetailSheetDrag()
  if (shouldClose) {
    detailOpen.value = false
    selectedAccount.value = null
  }
}

function onDetailSheetPointerCancel(event: PointerEvent) {
  if (detailSheetPointerId.value !== null) {
    detailSheetHandleRef.value?.releasePointerCapture(detailSheetPointerId.value)
  }
  resetDetailSheetDrag()
}

function resetDeleteSheetDrag() {
  deleteSheetDragY.value = 0
  deleteSheetDragging.value = false
  deleteSheetDragStartY.value = 0
  deleteSheetPointerId.value = null
}

function onDeleteSheetPointerDown(event: PointerEvent) {
  deleteSheetHandleRef.value?.setPointerCapture(event.pointerId)
  deleteSheetDragging.value = true
  deleteSheetDragStartY.value = event.clientY
  deleteSheetPointerId.value = event.pointerId
}

function onDeleteSheetPointerMove(event: PointerEvent) {
  if (!deleteSheetDragging.value || deleteSheetPointerId.value !== event.pointerId) return
  const deltaY = Math.max(0, event.clientY - deleteSheetDragStartY.value)
  deleteSheetDragY.value = deltaY
}

function onDeleteSheetPointerUp(event: PointerEvent) {
  if (!deleteSheetDragging.value || deleteSheetPointerId.value !== event.pointerId) return
  deleteSheetHandleRef.value?.releasePointerCapture(event.pointerId)
  const shouldClose = deleteSheetDragY.value > 90
  resetDeleteSheetDrag()
  if (shouldClose) {
    deleteCloudOpen.value = false
  }
}

function onDeleteSheetPointerCancel(event: PointerEvent) {
  if (deleteSheetPointerId.value !== null) {
    deleteSheetHandleRef.value?.releasePointerCapture(deleteSheetPointerId.value)
  }
  resetDeleteSheetDrag()
}

function resetUpdateSheetDrag() {
  updateSheetDragY.value = 0
  updateSheetDragging.value = false
  updateSheetDragStartY.value = 0
  updateSheetPointerId.value = null
  passwordResetResult.value = null
  copiedCredentialField.value = null
  if (copiedCredentialTimer) {
    clearTimeout(copiedCredentialTimer)
    copiedCredentialTimer = null
  }
}

function onUpdateSheetPointerDown(event: PointerEvent) {
  updateSheetHandleRef.value?.setPointerCapture(event.pointerId)
  updateSheetDragging.value = true
  updateSheetDragStartY.value = event.clientY
  updateSheetPointerId.value = event.pointerId
}

function onUpdateSheetPointerMove(event: PointerEvent) {
  if (!updateSheetDragging.value || updateSheetPointerId.value !== event.pointerId) return
  const deltaY = Math.max(0, event.clientY - updateSheetDragStartY.value)
  updateSheetDragY.value = deltaY
}

function onUpdateSheetPointerUp(event: PointerEvent) {
  if (!updateSheetDragging.value || updateSheetPointerId.value !== event.pointerId) return
  updateSheetHandleRef.value?.releasePointerCapture(event.pointerId)
  const shouldClose = updateSheetDragY.value > 90
  resetUpdateSheetDrag()
  if (shouldClose) {
    updateUserOpen.value = false
  }
}

function onUpdateSheetPointerCancel(event: PointerEvent) {
  if (updateSheetPointerId.value !== null) {
    updateSheetHandleRef.value?.releasePointerCapture(updateSheetPointerId.value)
  }
  resetUpdateSheetDrag()
}

function resetDeleteUserSheetDrag() {
  deleteUserSheetDragY.value = 0
  deleteUserSheetDragging.value = false
  deleteUserSheetDragStartY.value = 0
  deleteUserSheetPointerId.value = null
}

function onDeleteUserSheetPointerDown(event: PointerEvent) {
  deleteUserSheetHandleRef.value?.setPointerCapture(event.pointerId)
  deleteUserSheetDragging.value = true
  deleteUserSheetDragStartY.value = event.clientY
  deleteUserSheetPointerId.value = event.pointerId
}

function onDeleteUserSheetPointerMove(event: PointerEvent) {
  if (!deleteUserSheetDragging.value || deleteUserSheetPointerId.value !== event.pointerId) return
  const deltaY = Math.max(0, event.clientY - deleteUserSheetDragStartY.value)
  deleteUserSheetDragY.value = deltaY
}

function onDeleteUserSheetPointerUp(event: PointerEvent) {
  if (!deleteUserSheetDragging.value || deleteUserSheetPointerId.value !== event.pointerId) return
  deleteUserSheetHandleRef.value?.releasePointerCapture(event.pointerId)
  const shouldClose = deleteUserSheetDragY.value > 90
  resetDeleteUserSheetDrag()
  if (shouldClose) {
    deleteUserOpen.value = false
  }
}

function onDeleteUserSheetPointerCancel(event: PointerEvent) {
  if (deleteUserSheetPointerId.value !== null) {
    deleteUserSheetHandleRef.value?.releasePointerCapture(deleteUserSheetPointerId.value)
  }
  resetDeleteUserSheetDrag()
}

useHead({
  title: 'Super Admin · Users'
})
</script>

<template>
  <div class="space-y-4 pb-8 md:space-y-6">
    <section class="overflow-hidden rounded-[1.4rem] border border-slate-200/80 bg-white/85 p-4 shadow-[0_22px_60px_-32px_rgba(15,23,42,0.2)] dark:border-slate-800 dark:bg-slate-950/75 md:p-6">
      <div class="flex items-start justify-between gap-2.5">
        <div class="min-w-0">
          <p class="text-[10px] font-semibold uppercase tracking-[0.28em] text-muted">{{ copy.userStatus }}</p>
          <h1 class="mt-1 text-2xl font-black tracking-tight text-default">{{ copy.title }}</h1>
          <p class="mt-1 text-sm leading-6 text-muted">{{ copy.subtitle }}</p>
        </div>
      </div>
    </section>

    <section class="grid grid-cols-2 gap-2.5 md:grid-cols-4">
      <div class="rounded-[1.2rem] border border-slate-200/80 bg-white p-3 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.18)] dark:border-slate-800 dark:bg-slate-950/70">
        <p class="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">{{ copy.freeAccounts }}</p>
        <p class="mt-1 text-2xl font-black text-default">{{ overviewStats?.freeAccounts ?? 0 }}</p>
      </div>
      <div class="rounded-[1.2rem] border border-slate-200/80 bg-white p-3 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.18)] dark:border-slate-800 dark:bg-slate-950/70">
        <p class="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">{{ copy.proAccounts }}</p>
        <p class="mt-1 text-2xl font-black text-default">{{ overviewStats?.proAccounts ?? 0 }}</p>
      </div>
      <div class="rounded-[1.2rem] border border-slate-200/80 bg-white p-3 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.18)] dark:border-slate-800 dark:bg-slate-950/70">
        <p class="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">{{ copy.cloudBackups }}</p>
        <p class="mt-1 text-2xl font-black text-default">{{ overviewStats?.totalBackups ?? 0 }}</p>
      </div>
      <div class="rounded-[1.2rem] border border-slate-200/80 bg-white p-3 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.18)] dark:border-slate-800 dark:bg-slate-950/70">
        <p class="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">{{ copy.latestBackup }}</p>
        <p class="mt-1 text-[11px] font-semibold leading-5 text-muted">
          {{ overviewStats?.latestBackupAt ? formatDate(overviewStats.latestBackupAt) : '—' }}
        </p>
      </div>
    </section>

    <section class="overflow-hidden rounded-[1.4rem] border border-slate-200/80 bg-white/70 dark:border-slate-800 dark:bg-slate-950/60 md:rounded-[1.6rem]">
        <div class="flex items-center justify-between gap-2.5 px-4 py-2.5 md:px-5 md:py-4">
        <div class="min-w-0">
          <p class="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted">{{ copy.userStatus }}</p>
          <h2 class="text-sm font-black tracking-tight text-default">{{ copy.title }}</h2>
        </div>
        <div class="flex items-center gap-2">
          <UButton
            :disabled="isUsersLoading"
            class="h-9 gap-2 rounded-full px-3 text-xs font-bold shadow-none transition active:scale-95"
            :style="isUsersLoading ? { backgroundColor: activeTheme.hex, borderColor: activeTheme.hex } : undefined"
            :class="isUsersLoading
              ? 'border-transparent text-white shadow-[0_14px_28px_-18px_rgba(14,165,233,0.35)]'
              : 'border border-slate-200 bg-white text-default hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800'"
            @click="refreshUsers"
            aria-label="Reload"
          >
            <UIcon
              name="i-lucide-refresh-cw"
              class="size-4 shrink-0"
              :class="isUsersLoading ? 'animate-spin text-white' : ''"
            />
            <span :class="isUsersLoading ? 'text-white' : ''">Reload</span>
          </UButton>
          <UBadge color="neutral" variant="soft" class="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em]">
            {{ accounts.length }}
          </UBadge>
        </div>
      </div>

      <div class="border-t border-slate-200/80 dark:border-slate-800">
        <div v-if="isUsersLoading" class="relative h-[3px] overflow-hidden rounded-full bg-slate-200/90 dark:bg-slate-800/85" :style="{ '--superadmin-loading-color': activeTheme.hex }">
          <div class="superadmin-users-loading-bar" />
        </div>
        <div class="relative overflow-x-auto">
          <table class="min-w-[1140px] w-full border-separate border-spacing-0">
            <thead>
              <tr class="text-left">
                <th class="whitespace-nowrap border-b border-slate-200/80 bg-slate-50 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted dark:border-slate-800 dark:bg-slate-900">Account</th>
                <th class="whitespace-nowrap border-b border-slate-200/80 bg-slate-50 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted dark:border-slate-800 dark:bg-slate-900">Plan</th>
                <th class="whitespace-nowrap border-b border-slate-200/80 bg-slate-50 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted dark:border-slate-800 dark:bg-slate-900">{{ copy.proStarted }}</th>
                <th class="whitespace-nowrap border-b border-slate-200/80 bg-slate-50 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted dark:border-slate-800 dark:bg-slate-900">{{ copy.redeemKey }}</th>
                <th class="whitespace-nowrap border-b border-slate-200/80 bg-slate-50 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted dark:border-slate-800 dark:bg-slate-900">{{ copy.cloudClears }}</th>
                <th class="whitespace-nowrap border-b border-slate-200/80 bg-slate-50 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted dark:border-slate-800 dark:bg-slate-900">{{ copy.backupStatus }}</th>
                <th class="whitespace-nowrap border-b border-slate-200/80 bg-slate-50 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted dark:border-slate-800 dark:bg-slate-900">{{ copy.joined }}</th>
                <th class="whitespace-nowrap border-b border-slate-200/80 bg-slate-50 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted dark:border-slate-800 dark:bg-slate-900">{{ copy.lastActive }}</th>
                <th class="whitespace-nowrap border-b border-slate-200/80 bg-slate-50 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted dark:border-slate-800 dark:bg-slate-900">{{ copy.records }}</th>
                <th class="whitespace-nowrap border-b border-slate-200/80 bg-slate-50 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted dark:border-slate-800 dark:bg-slate-900">{{ copy.cloudSize }}</th>
                <th class="whitespace-nowrap border-b border-slate-200/80 bg-slate-50 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted dark:border-slate-800 dark:bg-slate-900">{{ copy.cloudUpdated }}</th>
                <th class="whitespace-nowrap border-b border-slate-200/80 bg-slate-50 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted dark:border-slate-800 dark:bg-slate-900">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="account in accounts"
                :key="account.identifier"
                class="border-b border-slate-200/80 transition last:border-b-0 hover:bg-slate-50/80 dark:border-slate-800 dark:hover:bg-slate-900/70"
              >
                <td class="px-4 py-3.5 align-top">
                  <div class="min-w-0">
                    <p class="truncate text-sm font-black text-default">{{ account.identifier }}</p>
                    <p class="mt-1 whitespace-nowrap text-[10px] leading-4 text-muted">
                      {{ account.identifierType.toUpperCase() }} · {{ account.remember ? 'Remember' : 'One-time' }}
                    </p>
                    <p class="mt-1 whitespace-nowrap text-[10px] leading-4 text-muted">
                      {{ copy.wallets }} {{ account.walletCount }} · {{ copy.transactions }} {{ account.transactionCount }} · {{ copy.categories }} {{ account.categoryCount }} · {{ copy.companies }} {{ account.companyCount }}
                    </p>
                  </div>
                </td>
                <td class="px-4 py-3.5 align-top">
                  <UBadge
                    :color="account.plan === 'pro' ? 'emerald' : 'neutral'"
                    :variant="account.plan === 'pro' ? 'solid' : 'soft'"
                    class="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em]"
                  >
                    {{ account.plan === 'pro' ? copy.planPro : copy.planFree }}
                  </UBadge>
                </td>
                <td class="px-4 py-3.5 align-top">
                  <div class="inline-flex whitespace-nowrap rounded-full border border-slate-200/80 bg-white px-3 py-1.5 text-[11px] font-semibold text-default dark:border-slate-800 dark:bg-slate-950">
                    {{ account.proStartedAt ? formatDate(account.proStartedAt) : '—' }}
                  </div>
                </td>
                <td class="px-4 py-3.5 align-top">
                  <div class="inline-flex whitespace-nowrap rounded-full border border-slate-200/80 bg-white px-3 py-1.5 text-[11px] font-semibold text-default dark:border-slate-800 dark:bg-slate-950">
                    {{ account.redeemKeyCode ?? '—' }}
                  </div>
                </td>
                <td class="px-4 py-3.5 align-top">
                  <div class="inline-flex whitespace-nowrap rounded-full border border-slate-200/80 bg-white px-3 py-1.5 text-[11px] font-black text-default dark:border-slate-800 dark:bg-slate-950">
                    {{ account.cloudClearedCount }}
                  </div>
                </td>
                <td class="px-4 py-3.5 align-top">
                  <div class="inline-flex whitespace-nowrap rounded-full border border-slate-200/80 bg-white px-3 py-1.5 text-[11px] font-bold text-default dark:border-slate-800 dark:bg-slate-950">
                    {{ account.cloudUpdatedAt ? copy.backedUp : copy.noBackup }}
                  </div>
                </td>
                <td class="px-4 py-3.5 align-top">
                  <div class="inline-flex whitespace-nowrap rounded-full border border-slate-200/80 bg-white px-3 py-1.5 text-[11px] font-bold text-default dark:border-slate-800 dark:bg-slate-950">
                    {{ formatDate(account.createdAt) }}
                  </div>
                </td>
                <td class="px-4 py-3.5 align-top">
                  <div class="inline-flex whitespace-nowrap rounded-full border border-slate-200/80 bg-white px-3 py-1.5 text-[11px] font-semibold text-muted dark:border-slate-800 dark:bg-slate-950">
                    {{ formatDate(account.updatedAt) }}
                  </div>
                </td>
                <td class="px-4 py-3.5 align-top">
                  <div class="inline-flex whitespace-nowrap rounded-full border border-slate-200/80 bg-white px-3 py-1.5 text-[11px] font-black text-default dark:border-slate-800 dark:bg-slate-950">
                    {{ copy.records }} {{ account.recordCount }}
                  </div>
                </td>
                <td class="px-4 py-3.5 align-top">
                  <div class="inline-flex whitespace-nowrap rounded-full border border-slate-200/80 bg-white px-3 py-1.5 text-[11px] font-black text-default dark:border-slate-800 dark:bg-slate-950">
                    {{ formatBytes(account.cloudSizeBytes) }}
                  </div>
                </td>
                <td class="px-4 py-3.5 align-top">
                  <div class="inline-flex whitespace-nowrap rounded-full border border-slate-200/80 bg-white px-3 py-1.5 text-[11px] font-semibold text-muted dark:border-slate-800 dark:bg-slate-950">
                    {{ formatDate(account.cloudUpdatedAt) }}
                  </div>
                </td>
                <td class="px-4 py-3.5 align-top">
                  <div class="flex justify-end">
                    <UButton
                      icon="i-lucide-ellipsis-vertical"
                      class="h-9 w-9 justify-center rounded-full border border-slate-200 bg-white p-0 text-default shadow-none transition hover:bg-slate-50 active:scale-95 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800"
                      :aria-label="copy.actions"
                      @click="openAccountDetail(account)"
                    />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="border-t border-slate-200/80 px-4 py-2.5 dark:border-slate-800">
          <p class="text-xs font-semibold text-muted">
            <span class="whitespace-nowrap">{{ copy.showing }}</span>
            <span class="whitespace-nowrap">
              {{ userPagination?.total ? `${userRangeStart || 0}-${userRangeEnd || 0} ${copy.of} ${userPagination.total}` : `0 ${copy.of} 0` }}
            </span>
          </p>

          <div class="mt-1 flex items-center justify-between gap-2">
            <div class="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200/80 bg-slate-50 px-2 py-1.5 dark:border-slate-800 dark:bg-slate-900">
              <span class="whitespace-nowrap text-[8px] font-semibold uppercase tracking-[0.1em] text-muted">{{ copy.perPage }}</span>
              <select
                v-model.number="userPageSize"
                class="h-7 w-[3.5rem] rounded-full border border-slate-200/80 bg-white px-1.5 text-[10px] font-bold text-default outline-none transition focus:border-sky-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              >
                <option v-for="option in userPageSizeOptions" :key="option" :value="option">
                  {{ option }}
                </option>
              </select>
            </div>

            <div class="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200/80 bg-slate-50 px-2 py-1.5 dark:border-slate-800 dark:bg-slate-900">
              <button
                type="button"
                class="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white p-0 text-default shadow-none transition hover:bg-slate-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-black dark:text-white dark:hover:bg-slate-900"
                :disabled="!userHasPrevious || pending || refreshingUsers"
                :aria-label="copy.previous"
                @click="goToPreviousUserPage"
              >
                <UIcon name="i-lucide-chevron-left" class="size-4 shrink-0" />
              </button>

              <span class="min-w-[4.9rem] whitespace-nowrap rounded-full border border-slate-200 bg-white px-2 py-1 text-center text-[9px] font-black text-default dark:border-slate-700 dark:bg-slate-950 dark:text-white">
                {{ copy.page }} {{ userPagination?.page ?? 1 }} {{ copy.of }} {{ userPagination?.totalPages ?? 0 }}
              </span>

              <button
                type="button"
                class="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white p-0 text-default shadow-none transition hover:bg-slate-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-black dark:text-white dark:hover:bg-slate-900"
                :disabled="!userHasNext || pending || refreshingUsers"
                :aria-label="copy.next"
                @click="goToNextUserPage"
              >
                <UIcon name="i-lucide-chevron-right" class="size-4 shrink-0" />
              </button>
            </div>
          </div>
        </div>

        <div v-if="!pending && !accounts.length" class="rounded-[1.1rem] border border-dashed border-slate-300 px-4 py-6 text-center text-sm text-muted dark:border-slate-700">
          {{ copy.noData }}
        </div>
      </div>
    </section>

    <USlideover
      v-model:open="detailOpen"
      side="bottom"
      :close="true"
      :ui="{
        content: 'w-full data-[state=open]:animate-[slide-in-from-bottom_220ms_ease-out] data-[state=closed]:animate-[slide-out-to-bottom_220ms_ease-in] data-[state=open]:rounded-t-[1.5rem] data-[state=closed]:rounded-t-[1.5rem] overflow-hidden border border-slate-200/80 bg-white shadow-[0_-18px_60px_-30px_rgba(15,23,42,0.35)] dark:border-slate-800 dark:bg-slate-950',
        body: 'p-0',
        footer: 'p-0',
        header: 'p-0'
      }"
      @after:leave="resetDetailSheetDrag"
    >
      <template #content="{ close }">
        <div class="flex min-h-[calc(88svh-12rem)] max-h-[88svh] flex-col overflow-hidden" :style="{ transform: `translateY(${detailSheetDragY}px)`, transition: detailSheetDragging ? 'none' : 'transform 180ms ease-out' }">
          <div
            ref="detailSheetHandleRef"
            class="touch-none select-none cursor-grab active:cursor-grabbing border-b border-slate-200/80 px-4 pb-2.5 pt-2 dark:border-slate-800"
            @pointerdown="onDetailSheetPointerDown"
            @pointermove="onDetailSheetPointerMove"
            @pointerup="onDetailSheetPointerUp"
            @pointercancel="onDetailSheetPointerCancel"
          >
            <div class="mx-auto mb-2 h-1.5 w-12 rounded-full bg-slate-300/80 dark:bg-slate-700" />

            <div class="flex items-start justify-between gap-2.5">
              <div class="min-w-0">
                <p class="text-xs font-semibold uppercase tracking-[0.18em] text-muted">{{ copy.details }}</p>
                <h2 class="mt-1 truncate text-lg font-black tracking-tight text-default">{{ selectedAccount?.identifier ?? '—' }}</h2>
                <p class="mt-1 whitespace-nowrap text-[11px] leading-5 text-muted">
                  {{ selectedAccount?.identifierType?.toUpperCase() ?? '—' }} · {{ selectedAccount?.remember ? 'Remember' : 'One-time' }}
                </p>
              </div>

              <button
                type="button"
                class="flex size-9 items-center justify-center rounded-full bg-slate-100 text-muted transition active:scale-95 dark:bg-slate-900"
                :aria-label="copy.close"
                @click="close()"
              >
                <UIcon name="i-lucide-x" class="size-4" />
              </button>
            </div>
          </div>

          <div class="flex-1 overflow-y-auto px-4 py-3.5 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
            <div v-if="selectedAccount" class="grid grid-cols-2 gap-3">
              <div class="rounded-[1.1rem] border border-slate-200/80 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900">
                <p class="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">{{ copy.joined }}</p>
                <p class="mt-1 text-sm font-black text-default">{{ formatDate(selectedAccount.createdAt) }}</p>
              </div>
              <div class="rounded-[1.1rem] border border-slate-200/80 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900">
                <p class="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">{{ copy.lastActive }}</p>
                <p class="mt-1 text-sm font-black text-default">{{ formatDate(selectedAccount.updatedAt) }}</p>
              </div>
              <div class="rounded-[1.1rem] border border-slate-200/80 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900">
                <p class="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">{{ copy.cloudUpdated }}</p>
                <p class="mt-1 text-sm font-black text-default">{{ formatDate(selectedAccount.cloudUpdatedAt) }}</p>
              </div>
              <div class="rounded-[1.1rem] border border-slate-200/80 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900">
                <p class="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">{{ copy.proStarted }}</p>
                <p class="mt-1 text-sm font-black text-default">{{ selectedAccount.proStartedAt ? formatDate(selectedAccount.proStartedAt) : '—' }}</p>
              </div>
              <div class="rounded-[1.1rem] border border-slate-200/80 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900">
                <p class="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">{{ copy.cloudSize }}</p>
                <p class="mt-1 text-sm font-black text-default">{{ formatBytes(selectedAccount.cloudSizeBytes) }}</p>
              </div>
              <div class="rounded-[1.1rem] border border-slate-200/80 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900">
                <p class="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">{{ copy.records }}</p>
                <p class="mt-1 text-sm font-black text-default">{{ selectedAccount.recordCount }}</p>
              </div>
              <div class="rounded-[1.1rem] border border-slate-200/80 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900">
                <p class="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">{{ copy.cloudClears }}</p>
                <p class="mt-1 text-sm font-black text-default">{{ selectedAccount.cloudClearedCount }}</p>
              </div>
              <div class="rounded-[1.1rem] border border-slate-200/80 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900">
                <p class="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">{{ copy.lastCloudClear }}</p>
                <p class="mt-1 text-sm font-black text-default">{{ formatDate(selectedAccount.cloudClearedAt) }}</p>
              </div>
              <div class="rounded-[1.1rem] border border-slate-200/80 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900">
                <p class="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">{{ copy.backupStatus }}</p>
                <p class="mt-1 text-sm font-black text-default">{{ selectedAccount.cloudUpdatedAt ? copy.backedUp : copy.noBackup }}</p>
              </div>
            </div>

            <div v-if="selectedAccount" class="mt-3.5 rounded-[1.1rem] border border-slate-200/80 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900">
              <p class="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">{{ copy.userStatus }}</p>
              <p class="mt-2 whitespace-nowrap text-[11px] leading-5 text-muted">
                {{ copy.wallets }} {{ selectedAccount.walletCount }} · {{ copy.transactions }} {{ selectedAccount.transactionCount }} · {{ copy.categories }} {{ selectedAccount.categoryCount }} · {{ copy.companies }} {{ selectedAccount.companyCount }}
              </p>
            </div>

            <p class="mt-3.5 text-[11px] leading-5 text-muted">
              {{ copy.deleteCloudHint }}
            </p>
          </div>

          <div class="shrink-0 border-t border-slate-200/80 bg-white/95 p-3.5 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
            <div v-if="selectedAccount" class="space-y-2.5">
              <UButton
                v-if="selectedAccount.plan !== 'pro'"
                icon="i-lucide-badge-check"
                class="h-11 w-full justify-center rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 text-center text-sm font-bold text-white shadow-[0_16px_28px_-18px_rgba(16,185,129,0.5)] transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                :loading="loadingUpgradeKeys"
                :disabled="upgradingUserToPro"
                @click="openUpgradeUserModal"
              >
                {{ copy.upgradeUser }}
              </UButton>
              <UButton
                icon="i-lucide-broom"
                class="h-11 w-full justify-center rounded-full bg-gradient-to-r from-rose-500 to-red-500 text-center text-sm font-bold text-white shadow-[0_16px_28px_-18px_rgba(239,68,68,0.58)] transition active:scale-[0.99] hover:from-rose-600 hover:to-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                :disabled="!selectedAccount || deletingCloud"
                @click="openDeleteCloudConfirm"
              >
                {{ copy.deleteCloudData }}
              </UButton>
              <div class="grid grid-cols-2 gap-2.5">
              <UButton
                icon="i-lucide-key-round"
                class="h-11 justify-center rounded-full bg-gradient-to-r from-sky-500 to-cyan-400 text-center text-sm font-bold text-white shadow-[0_16px_28px_-18px_rgba(14,165,233,0.5)] transition active:scale-[0.99]"
                @click="openUpdateUserSheet"
              >
                {{ copy.updatePassword }}
              </UButton>
                <UButton
                  icon="i-lucide-user-x"
                  class="h-11 justify-center rounded-full bg-gradient-to-r from-rose-500 to-red-500 text-center text-sm font-bold text-white shadow-[0_16px_28px_-18px_rgba(239,68,68,0.55)] transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                  :disabled="deletingUser"
                  @click="openDeleteUserConfirm"
                >
                  {{ copy.deleteUser }}
                </UButton>
              </div>
            </div>
          </div>
        </div>
      </template>
    </USlideover>

    <UModal
      v-model:open="upgradeUserOpen"
      :title="copy.upgradeUserTitle"
      :description="copy.upgradeUserDesc"
      :ui="centeredSuperadminModalUi"
    >
      <template #body>
        <div class="px-5 pb-5 pt-3 sm:px-6 sm:pb-6">
          <div class="mx-auto mb-5 flex w-full items-center justify-center gap-2 rounded-[1.15rem] border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-100">
            <UIcon name="i-lucide-badge-check" class="size-4" />
            <span class="text-[10px] font-semibold uppercase tracking-[0.22em]">{{ copy.upgradeUser }}</span>
          </div>

          <div class="space-y-4">
            <div class="rounded-[1.15rem] border border-slate-200/80 bg-gradient-to-br from-slate-50 to-white p-4 shadow-sm dark:border-slate-800 dark:from-slate-900 dark:to-slate-950">
              <p class="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted">{{ copy.username }}</p>
              <p class="mt-1 break-all text-base font-black text-default">{{ selectedAccount?.identifier ?? '—' }}</p>
              <p class="mt-1 text-xs leading-5 text-muted">{{ copy.upgradeUserHint }}</p>
            </div>

            <div class="space-y-2">
              <div class="flex items-center justify-between gap-2">
                <p class="text-sm font-bold text-default">{{ copy.upgradeUserSelectKey }}</p>
                <UBadge color="neutral" variant="soft" class="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em]">
                  {{ availableUpgradeKeys.length }}
                </UBadge>
              </div>

              <div class="rounded-[1.15rem] border border-slate-200/80 bg-white p-3.5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                <select
                  v-model="selectedUpgradeKey"
                  class="h-12 w-full rounded-2xl border border-slate-200/80 bg-slate-50 px-4 text-sm font-semibold text-default outline-none transition focus:border-sky-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  :disabled="loadingUpgradeKeys || !availableUpgradeKeys.length"
                >
                  <option v-if="loadingUpgradeKeys" value="">
                    Loading...
                  </option>
                  <option v-else-if="!availableUpgradeKeys.length" value="">
                    {{ copy.upgradeUserNoKey }}
                  </option>
                  <option v-for="key in availableUpgradeKeys" :key="key.code" :value="key.code">
                    {{ key.code }}
                  </option>
                </select>
              </div>

              <p v-if="upgradeKeysError" class="rounded-[1rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-100">
                {{ upgradeKeysError }}
              </p>

              <p class="text-xs leading-5 text-muted">
                {{ availableUpgradeKeys.length ? copy.upgradeUserHint : copy.upgradeUserNoKey }}
              </p>
            </div>
          </div>
        </div>
      </template>

      <template #footer>
        <div class="sticky bottom-0 shrink-0 border-t border-slate-200/80 bg-white/96 px-5 pb-[calc(env(safe-area-inset-bottom)+0.85rem)] pt-3 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/96 sm:px-6">
          <div class="grid grid-cols-2 gap-3">
            <UButton
              icon="i-lucide-x"
              class="h-11 w-full min-w-0 justify-center rounded-full border border-slate-200 bg-white px-4 text-center text-sm font-bold leading-none whitespace-nowrap text-default shadow-none transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800"
              :disabled="upgradingUserToPro"
              @click="upgradeUserOpen = false"
            >
              {{ copy.close }}
            </UButton>
            <UButton
              icon="i-lucide-badge-check"
              class="h-11 w-full min-w-0 justify-center rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 px-4 text-center text-sm font-bold leading-none whitespace-nowrap text-white shadow-[0_16px_28px_-18px_rgba(16,185,129,0.5)] transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              :loading="upgradingUserToPro"
              :disabled="upgradingUserToPro || !selectedUpgradeKey || !availableUpgradeKeys.length"
              @click="confirmUpgradeUserToPro"
            >
              {{ copy.upgradeUserConfirm }}
            </UButton>
          </div>
        </div>
      </template>
    </UModal>

    <USlideover
      v-model:open="updateUserOpen"
      side="bottom"
      :close="true"
      :ui="{
        content: 'w-full data-[state=open]:animate-[slide-in-from-bottom_220ms_ease-out] data-[state=closed]:animate-[slide-out-to-bottom_220ms_ease-in] data-[state=open]:rounded-t-[1.5rem] data-[state=closed]:rounded-t-[1.5rem] overflow-hidden border border-slate-200/80 bg-white shadow-[0_-18px_60px_-30px_rgba(15,23,42,0.35)] dark:border-slate-800 dark:bg-slate-950 md:mx-auto md:mb-4 md:w-[min(30rem,calc(100%-2rem))] md:rounded-[1.5rem]',
        body: 'p-0',
        footer: 'p-0',
        header: 'p-0'
      }"
      @after:leave="resetUpdateSheetDrag"
    >
      <template #content="{ close }">
        <div class="flex min-h-[calc(88svh-12rem)] max-h-[88svh] flex-col overflow-hidden" :style="{ transform: `translateY(${updateSheetDragY}px)`, transition: updateSheetDragging ? 'none' : 'transform 180ms ease-out' }">
          <div class="border-b border-slate-200/80 px-4 pb-2.5 pt-2 dark:border-slate-800">
            <div
              ref="updateSheetHandleRef"
              class="touch-none select-none cursor-grab active:cursor-grabbing"
              @pointerdown="onUpdateSheetPointerDown"
              @pointermove="onUpdateSheetPointerMove"
              @pointerup="onUpdateSheetPointerUp"
              @pointercancel="onUpdateSheetPointerCancel"
            >
              <div class="mx-auto mb-2 h-1.5 w-12 rounded-full bg-slate-300/80 dark:bg-slate-700" />
            </div>

            <div class="flex items-start justify-between gap-2.5">
              <div class="min-w-0">
                <p class="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                  {{ passwordResetResult ? copy.updatePasswordDone : copy.updatePasswordTitle }}
                </p>
                <h2 class="mt-1 truncate text-lg font-black tracking-tight text-default">
                  {{ selectedAccount?.identifier ?? passwordResetResult?.identifier ?? '—' }}
                </h2>
              </div>

              <button
                type="button"
                class="flex size-9 items-center justify-center rounded-full bg-slate-100 text-muted transition active:scale-95 dark:bg-slate-900"
                :aria-label="copy.close"
                @click="close()"
              >
                <UIcon name="i-lucide-x" class="size-4" />
              </button>
            </div>
          </div>

          <div class="flex-1 overflow-y-auto px-4 py-3.5 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
            <div v-if="!passwordResetResult" class="space-y-3.5">
              <p class="text-sm leading-6 text-muted">{{ copy.updatePasswordDesc }}</p>

              <div class="rounded-[1.15rem] border border-amber-200/80 bg-amber-50 p-4 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100">
                <p class="text-sm font-bold">{{ copy.updatePasswordTitle }}</p>
                <p class="mt-1 text-xs leading-5 opacity-90">{{ copy.updatePasswordHint }}</p>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div class="rounded-[1.1rem] border border-slate-200/80 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900">
                  <p class="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">{{ copy.username }}</p>
                  <p class="mt-1 truncate text-sm font-black text-default">{{ selectedAccount?.identifier ?? '—' }}</p>
                </div>
                <div class="rounded-[1.1rem] border border-slate-200/80 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900">
                  <p class="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">{{ copy.loginType }}</p>
                  <p class="mt-1 text-sm font-black text-default">{{ selectedAccount?.identifierType?.toUpperCase() ?? '—' }}</p>
                </div>
              </div>
            </div>

            <div v-else class="space-y-3.5">
              <div class="rounded-[1.15rem] border border-emerald-200/80 bg-emerald-50 p-4 text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-100">
                <p class="text-sm font-bold">{{ copy.updatePasswordDone }}</p>
                <p class="mt-1 text-xs leading-5 opacity-90">{{ copy.updatePasswordDoneDesc }}</p>
              </div>

              <div class="space-y-2.5">
                <div class="rounded-[1.15rem] border border-slate-200/80 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-950">
                  <div class="flex items-start justify-between gap-3">
                    <div class="min-w-0">
                      <p class="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">{{ copy.username }}</p>
                      <p class="mt-1 truncate text-sm font-black text-default">{{ passwordResetResult.identifier }}</p>
                    </div>
                    <UButton
                      :icon="copiedCredentialField === 'identifier' ? 'i-lucide-check' : 'i-lucide-copy'"
                      class="h-9 shrink-0 justify-center rounded-full border border-slate-200 bg-slate-50 px-3 text-xs font-bold text-default shadow-none transition active:scale-95 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      @click="copyCredential('identifier')"
                    >
                      {{ copiedCredentialField === 'identifier' ? copy.copied : copy.copy }}
                    </UButton>
                  </div>
                </div>

                <div class="rounded-[1.15rem] border border-slate-200/80 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-950">
                  <div class="flex items-start justify-between gap-3">
                    <div class="min-w-0">
                      <p class="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">{{ copy.password }}</p>
                      <p class="mt-1 font-mono text-lg font-black tracking-[0.28em] text-default">{{ passwordResetResult.pin }}</p>
                    </div>
                    <UButton
                      :icon="copiedCredentialField === 'pin' ? 'i-lucide-check' : 'i-lucide-copy'"
                      class="h-9 shrink-0 justify-center rounded-full border border-slate-200 bg-slate-50 px-3 text-xs font-bold text-default shadow-none transition active:scale-95 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      @click="copyCredential('pin')"
                    >
                      {{ copiedCredentialField === 'pin' ? copy.copied : copy.copy }}
                    </UButton>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="shrink-0 border-t border-slate-200/80 bg-white/95 p-3.5 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
            <div class="flex gap-2.5">
              <UButton
                icon="i-lucide-x"
                class="h-11 flex-1 justify-center rounded-full border border-slate-200 bg-white text-center text-sm font-bold text-default shadow-none transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800"
                :disabled="updatingUser"
                @click="close()"
              >
                {{ copy.close }}
              </UButton>
              <UButton
                v-if="!passwordResetResult"
                icon="i-lucide-key-round"
                class="h-11 flex-1 justify-center rounded-full bg-gradient-to-r from-sky-500 to-cyan-400 text-center text-sm font-bold text-white shadow-[0_16px_28px_-18px_rgba(14,165,233,0.45)] transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                :loading="updatingUser"
                :disabled="updatingUser"
                @click="confirmUpdateUser"
              >
                {{ copy.updatePasswordConfirm }}
              </UButton>
              <UButton
                v-else
                icon="i-lucide-copy"
                class="h-11 flex-1 justify-center rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 text-center text-sm font-bold text-white shadow-[0_16px_28px_-18px_rgba(16,185,129,0.45)] transition active:scale-[0.99]"
                @click="copyCredential('pin')"
              >
                {{ copiedCredentialField === 'pin' ? copy.copied : copy.copy }}
              </UButton>
            </div>
          </div>
        </div>
      </template>
    </USlideover>

    <USlideover
      v-model:open="deleteUserOpen"
      side="bottom"
      :close="true"
      :ui="{
        content: 'w-full data-[state=open]:animate-[slide-in-from-bottom_220ms_ease-out] data-[state=closed]:animate-[slide-out-to-bottom_220ms_ease-in] data-[state=open]:rounded-t-[1.5rem] data-[state=closed]:rounded-t-[1.5rem] overflow-hidden border border-slate-200/80 bg-white shadow-[0_-18px_60px_-30px_rgba(15,23,42,0.35)] dark:border-slate-800 dark:bg-slate-950 md:mx-auto md:mb-4 md:w-[min(30rem,calc(100%-2rem))] md:rounded-[1.5rem]',
        body: 'p-0',
        footer: 'p-0',
        header: 'p-0'
      }"
      @after:leave="resetDeleteUserSheetDrag"
    >
      <template #content="{ close }">
        <div class="flex min-h-[calc(88svh-12rem)] max-h-[88svh] flex-col overflow-hidden" :style="{ transform: `translateY(${deleteUserSheetDragY}px)`, transition: deleteUserSheetDragging ? 'none' : 'transform 180ms ease-out' }">
          <div class="border-b border-slate-200/80 px-4 pb-2.5 pt-2 dark:border-slate-800">
            <div
              ref="deleteUserSheetHandleRef"
              class="touch-none select-none cursor-grab active:cursor-grabbing"
              @pointerdown="onDeleteUserSheetPointerDown"
              @pointermove="onDeleteUserSheetPointerMove"
              @pointerup="onDeleteUserSheetPointerUp"
              @pointercancel="onDeleteUserSheetPointerCancel"
            >
              <div class="mx-auto mb-2 h-1.5 w-12 rounded-full bg-slate-300/80 dark:bg-slate-700" />
            </div>

            <div class="flex items-start justify-between gap-2.5">
              <div class="min-w-0">
                <p class="text-xs font-semibold uppercase tracking-[0.18em] text-muted">{{ copy.userDeleteTitle }}</p>
                <h2 class="mt-1 truncate text-lg font-black tracking-tight text-default">{{ selectedAccount?.identifier ?? '—' }}</h2>
              </div>

              <button
                type="button"
                class="flex size-9 items-center justify-center rounded-full bg-slate-100 text-muted transition active:scale-95 dark:bg-slate-900"
                :aria-label="copy.close"
                @click="close()"
              >
                <UIcon name="i-lucide-x" class="size-4" />
              </button>
            </div>
          </div>

          <div class="flex-1 overflow-y-auto px-4 py-3.5 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
            <p class="text-sm leading-6 text-muted">{{ copy.userDeleteDesc }}</p>
            <div class="mt-3.5 rounded-[1.1rem] border border-rose-200/80 bg-rose-50 px-3 py-3 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/50 dark:text-rose-200">
              {{ copy.userDeleteHint }}
            </div>
            <div class="mt-3.5 grid grid-cols-2 gap-2.5">
              <div class="rounded-[1.1rem] border border-slate-200/80 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900">
                <p class="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">{{ copy.planFree }}</p>
                <p class="mt-1 text-sm font-black text-default">{{ selectedAccount?.plan === 'pro' ? copy.planPro : copy.planFree }}</p>
              </div>
              <div class="rounded-[1.1rem] border border-slate-200/80 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900">
                <p class="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">{{ copy.backupStatus }}</p>
                <p class="mt-1 text-sm font-black text-default">{{ selectedAccount?.cloudUpdatedAt ? copy.backedUp : copy.noBackup }}</p>
              </div>
            </div>
          </div>

          <div class="shrink-0 border-t border-slate-200/80 bg-white/95 p-3.5 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
            <div class="flex gap-2.5">
              <UButton
                icon="i-lucide-x"
                class="h-11 flex-1 justify-center rounded-full border border-slate-200 bg-white text-center text-sm font-bold text-default shadow-none transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800"
                :disabled="deletingUser"
                @click="close()"
              >
                {{ copy.close }}
              </UButton>
              <UButton
                icon="i-lucide-user-x"
                class="h-11 flex-1 justify-center rounded-full bg-gradient-to-r from-rose-500 to-red-500 text-center text-sm font-bold text-white shadow-[0_16px_28px_-18px_rgba(239,68,68,0.55)] transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                :loading="deletingUser"
                :disabled="deletingUser"
                @click="confirmDeleteUser"
              >
                {{ copy.userDeleteConfirm }}
              </UButton>
            </div>
          </div>
        </div>
      </template>
    </USlideover>

    <USlideover
      v-model:open="deleteCloudOpen"
      side="bottom"
      :close="true"
      :ui="{
        content: 'w-full data-[state=open]:animate-[slide-in-from-bottom_220ms_ease-out] data-[state=closed]:animate-[slide-out-to-bottom_220ms_ease-in] data-[state=open]:rounded-t-[1.5rem] data-[state=closed]:rounded-t-[1.5rem] overflow-hidden border border-slate-200/80 bg-white shadow-[0_-18px_60px_-30px_rgba(15,23,42,0.35)] dark:border-slate-800 dark:bg-slate-950 md:mx-auto md:mb-4 md:w-[min(30rem,calc(100%-2rem))] md:rounded-[1.5rem]',
        body: 'p-0',
        footer: 'p-0',
        header: 'p-0'
      }"
      @after:leave="resetDeleteSheetDrag"
    >
      <template #content="{ close }">
        <div class="flex max-h-[88svh] flex-col overflow-hidden" :style="{ transform: `translateY(${deleteSheetDragY}px)`, transition: deleteSheetDragging ? 'none' : 'transform 180ms ease-out' }">
          <div class="border-b border-slate-200/80 px-4 pb-3 pt-2 dark:border-slate-800">
            <div
              ref="deleteSheetHandleRef"
              class="touch-none select-none cursor-grab active:cursor-grabbing"
              @pointerdown="onDeleteSheetPointerDown"
              @pointermove="onDeleteSheetPointerMove"
              @pointerup="onDeleteSheetPointerUp"
              @pointercancel="onDeleteSheetPointerCancel"
            >
              <div class="mx-auto mb-2 h-1.5 w-12 rounded-full bg-slate-300/80 dark:bg-slate-700" />
            </div>

            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <p class="text-xs font-semibold uppercase tracking-[0.18em] text-muted">{{ copy.deleteCloudTitle }}</p>
                <h2 class="mt-1 text-lg font-black tracking-tight text-default">{{ selectedAccount?.identifier ?? '—' }}</h2>
              </div>

              <button
                type="button"
                class="flex size-9 items-center justify-center rounded-full bg-slate-100 text-muted transition active:scale-95 dark:bg-slate-900"
                :aria-label="copy.close"
                @click="close()"
              >
                <UIcon name="i-lucide-x" class="size-4" />
              </button>
            </div>
          </div>

          <div class="flex-1 overflow-y-auto px-4 py-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
            <p class="text-sm leading-6 text-muted">{{ copy.deleteCloudDesc }}</p>
            <div class="mt-4 rounded-[1.1rem] border border-rose-200/80 bg-rose-50 px-3 py-3 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/50 dark:text-rose-200">
              {{ copy.deleteCloudHint }}
            </div>
            <p class="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted">{{ copy.cloudPreserved }}</p>
            <div class="mt-4 grid grid-cols-2 gap-3">
              <div class="rounded-[1.1rem] border border-slate-200/80 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900">
                <p class="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">{{ copy.transactions }}</p>
                <p class="mt-1 text-sm font-black text-default">{{ selectedAccount?.transactionCount ?? 0 }}</p>
              </div>
              <div class="rounded-[1.1rem] border border-slate-200/80 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900">
                <p class="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">{{ copy.backupStatus }}</p>
                <p class="mt-1 text-sm font-black text-default">{{ selectedAccount?.cloudUpdatedAt ? copy.backedUp : copy.noBackup }}</p>
              </div>
            </div>
          </div>

          <div class="shrink-0 border-t border-slate-200/80 bg-white/95 p-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
            <div class="flex gap-3">
              <UButton
                icon="i-lucide-x"
                class="h-11 flex-1 justify-center rounded-full border border-slate-200 bg-white text-center text-sm font-bold text-default shadow-none transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800"
                :disabled="deletingCloud"
                @click="close()"
              >
                {{ copy.close }}
              </UButton>
              <UButton
                icon="i-lucide-broom"
                class="h-11 flex-1 justify-center rounded-full bg-gradient-to-r from-rose-500 to-red-500 text-center text-sm font-bold text-white shadow-[0_16px_28px_-18px_rgba(239,68,68,0.55)] transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                :loading="deletingCloud"
                :disabled="deletingCloud || !selectedAccount"
                @click="confirmDeleteCloud"
              >
                {{ copy.deleteConfirm }}
              </UButton>
            </div>
          </div>
        </div>
      </template>
    </USlideover>
  </div>
</template>

<style scoped>
@keyframes superadminUsersLoadingBar {
  0% {
    transform: translateX(-120%);
  }

  100% {
    transform: translateX(320%);
  }
}

.superadmin-users-loading-bar {
  position: absolute;
  inset: 0 auto 0 0;
  width: 32%;
  border-radius: 9999px;
  background-color: var(--superadmin-loading-color, #0ea5e9);
  will-change: transform;
  animation: superadminUsersLoadingBar 1.35s linear infinite;
}
</style>
