import type { MaybeRefOrGetter } from 'vue'

type AdminAccount = {
  identifier: string
  identifierType: 'email' | 'phone'
  plan: 'free' | 'pro'
  remember: boolean
  redeemKeyCode: string | null
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
}

type AdminRedeemKey = {
  code: string
  active: boolean
  redeemedBy: string | null
  redeemedAt: string | null
  createdAt: string
  updatedAt: string
}

type AdminOverview = {
  connected: boolean
  stats: {
    totalAccounts: number
    proAccounts: number
    freeAccounts: number
    totalBackups: number
    latestBackupAt: string | null
    totalKeys: number
    activeKeys: number
    usedKeys: number
  } | null
  accounts: AdminAccount[]
  redeemKeys: AdminRedeemKey[]
  accountsPagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  } | null
  redeemKeysPagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  } | null
}

type SuperadminDataOptions = {
  accountsPage?: MaybeRefOrGetter<number | null | undefined>
  accountsLimit?: MaybeRefOrGetter<number | null | undefined>
  redeemKeysPage?: MaybeRefOrGetter<number | null | undefined>
  redeemKeysLimit?: MaybeRefOrGetter<number | null | undefined>
}

export type { AdminAccount, AdminOverview, AdminRedeemKey }

function resolvePaginationValue(value: MaybeRefOrGetter<number | null | undefined> | undefined) {
  if (value === undefined) return null
  const numeric = Number(unref(value ?? 0))
  if (!Number.isFinite(numeric)) return 0
  return Math.max(0, Math.floor(numeric))
}

export function useSuperadminData(options: SuperadminDataOptions = {}) {
  const serverHeaders = import.meta.server ? useRequestHeaders(['cookie']) : undefined

  const query = computed(() => {
    const params = new URLSearchParams()

    const accountsPage = resolvePaginationValue(options.accountsPage)
    const accountsLimit = resolvePaginationValue(options.accountsLimit)
    const redeemKeysPage = resolvePaginationValue(options.redeemKeysPage)
    const redeemKeysLimit = resolvePaginationValue(options.redeemKeysLimit)

    if (accountsPage !== null) params.set('accountsPage', String(accountsPage))
    if (accountsLimit !== null) params.set('accountsLimit', String(accountsLimit))
    if (redeemKeysPage !== null) params.set('redeemKeysPage', String(redeemKeysPage))
    if (redeemKeysLimit !== null) params.set('redeemKeysLimit', String(redeemKeysLimit))

    return params.toString()
  })

  return useAsyncData<AdminOverview>(computed(() => `superadmin-overview:${query.value || 'default'}`), () => {
    const queryString = query.value ? `?${query.value}` : ''
    return $fetch<AdminOverview>(`/api/superadmin/overview${queryString}`, serverHeaders ? { headers: serverHeaders } : undefined)
  }, {
    watch: [query],
    dedupe: 'defer',
    default: () => ({
      connected: false,
      stats: null,
      accounts: [],
      redeemKeys: [],
      accountsPagination: null,
      redeemKeysPagination: null
    })
  })
}
