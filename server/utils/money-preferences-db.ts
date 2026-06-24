type CategoryType = 'income' | 'expense'
type CurrencyCode = 'LAK' | 'THB' | 'USD'

export type MoneyPreferencesPayload = {
  walletOrder: string[]
  pinnedWalletKeys: string[]
  disabledDefaultCategories: string[]
  disabledDefaultCompanies: string[]
  categoryOrder: Record<CategoryType, string[]>
  pinnedCategoryKeys: Record<CategoryType, string[]>
  companyOrder: string[]
  pinnedCompanyKeys: string[]
  currencySupport: Record<CurrencyCode, boolean>
}

const DEFAULT_PREFERENCES: MoneyPreferencesPayload = {
  walletOrder: [],
  pinnedWalletKeys: [],
  disabledDefaultCategories: [],
  disabledDefaultCompanies: [],
  categoryOrder: {
    income: [],
    expense: []
  },
  pinnedCategoryKeys: {
    income: [],
    expense: []
  },
  companyOrder: [],
  pinnedCompanyKeys: [],
  currencySupport: {
    LAK: true,
    THB: true,
    USD: true
  }
}

export function defaultMoneyPreferences(): MoneyPreferencesPayload {
  return {
    walletOrder: [],
    pinnedWalletKeys: [],
    disabledDefaultCategories: [],
    disabledDefaultCompanies: [],
    categoryOrder: {
      income: [],
      expense: []
    },
    pinnedCategoryKeys: {
      income: [],
      expense: []
    },
    companyOrder: [],
    pinnedCompanyKeys: [],
    currencySupport: {
      LAK: true,
      THB: true,
      USD: true
    }
  }
}

export function normalizeMoneyPreferencesPayload(input: unknown): MoneyPreferencesPayload {
  if (!input || typeof input !== 'object') {
    return defaultMoneyPreferences()
  }

  const candidate = input as Record<string, unknown>
  const payload = defaultMoneyPreferences()

  payload.walletOrder = normalizeStringList(candidate.walletOrder)
  payload.pinnedWalletKeys = normalizeStringList(candidate.pinnedWalletKeys)
  payload.disabledDefaultCategories = normalizeStringList(candidate.disabledDefaultCategories)
  payload.disabledDefaultCompanies = normalizeStringList(candidate.disabledDefaultCompanies)
  payload.companyOrder = normalizeStringList(candidate.companyOrder)
  payload.pinnedCompanyKeys = normalizeStringList(candidate.pinnedCompanyKeys)

  payload.categoryOrder = {
    income: normalizeStringList(readNestedRecord(candidate.categoryOrder, 'income')),
    expense: normalizeStringList(readNestedRecord(candidate.categoryOrder, 'expense'))
  }

  payload.pinnedCategoryKeys = {
    income: normalizeStringList(readNestedRecord(candidate.pinnedCategoryKeys, 'income')),
    expense: normalizeStringList(readNestedRecord(candidate.pinnedCategoryKeys, 'expense'))
  }

  payload.currencySupport = normalizeCurrencySupport(candidate.currencySupport)

  return payload
}

export function hasNonDefaultMoneyPreferences(input: MoneyPreferencesPayload) {
  const defaults = DEFAULT_PREFERENCES

  return JSON.stringify(input) !== JSON.stringify(defaults)
}

function normalizeStringList(value: unknown) {
  if (!Array.isArray(value)) return []
  return [...new Set(value.filter((item): item is string => typeof item === 'string' && Boolean(item.trim())).map(item => item.trim()))]
}

function normalizeCurrencySupport(value: unknown): Record<CurrencyCode, boolean> {
  const support = { ...DEFAULT_PREFERENCES.currencySupport }

  if (!value || typeof value !== 'object') {
    return support
  }

  const candidate = value as Record<string, unknown>
  support.LAK = typeof candidate.LAK === 'boolean' ? candidate.LAK : support.LAK
  support.THB = typeof candidate.THB === 'boolean' ? candidate.THB : support.THB
  support.USD = typeof candidate.USD === 'boolean' ? candidate.USD : support.USD

  if (!Object.values(support).some(Boolean)) {
    support.LAK = true
  }

  return support
}

function readNestedRecord(value: unknown, key: string) {
  if (!value || typeof value !== 'object') return undefined
  return (value as Record<string, unknown>)[key]
}
