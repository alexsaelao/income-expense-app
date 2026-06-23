import { computed, onBeforeUnmount, onMounted, watch } from 'vue'

export type CurrencyCode = 'LAK' | 'THB' | 'USD'
export type TransactionType = 'income' | 'expense' | 'move' | 'loan'
export type CategoryType = 'income' | 'expense'
export type LoanDirection = 'given' | 'received'
export type WalletColor = 'sky' | 'emerald' | 'indigo' | 'amber' | 'rose' | 'violet' | 'fuchsia' | 'slate'
type MoneyNoteSnapshot = {
  stateJson: string
  selectedCurrency: CurrencyCode
  currencySupportJson: string
  updatedAt: string
}

export interface Wallet {
  id: string
  name: string
  currency: CurrencyCode
  openingBalance: number
  balance: number
  color: WalletColor
  accent: string
  emoji: string
  note?: string
  updatedAt?: string
}

export interface Transaction {
  id: string
  type: TransactionType
  walletId: string
  toWalletId?: string
  currency: CurrencyCode
  amount: number
  exchangeRate?: number
  category: string
  note: string
  date: string
  company?: string
  counterparty?: string
  loanDirection?: LoanDirection
  createdAt: string
  updatedAt: string
}

export interface MoneyNoteState {
  wallets: Wallet[]
  transactions: Transaction[]
  categories: CategoryItem[]
  companies: CompanyItem[]
  walletOrder: string[]
  pinnedWalletKeys: string[]
  disabledDefaultCategories: string[]
  disabledDefaultCompanies: string[]
  defaultCategoriesEnabled?: boolean
  defaultCompaniesEnabled?: boolean
  categoryOrder: Record<CategoryType, string[]>
  pinnedCategoryKeys: Record<CategoryType, string[]>
  companyOrder: string[]
  pinnedCompanyKeys: string[]
}

export interface MoneyNoteBackupData {
  state: MoneyNoteState
  selectedCurrency: CurrencyCode
  currencySupport: Record<CurrencyCode, boolean>
}

export interface MoneyNoteBackupFile {
  format: 'income-expense-note-backup'
  version: 1
  exportedAt: string
  data: MoneyNoteBackupData
}

export interface TransactionInput {
  type: TransactionType
  walletId: string
  toWalletId?: string
  currency: CurrencyCode
  amount: number
  exchangeRate?: number
  category: string
  note: string
  date: string
  company?: string
  counterparty?: string
  loanDirection?: LoanDirection
}

export interface CategoryItem {
  id: string
  type: CategoryType
  name: string
  emoji: string
  color: WalletColor
  enabled: boolean
  createdAt: string
  updatedAt?: string
}

export interface CompanyItem {
  id: string
  name: string
  emoji: string
  color: WalletColor
  enabled: boolean
  createdAt: string
  updatedAt?: string
}

type SyncSource = 'cloud' | 'unknown'

export interface SyncDebugCloudSnapshot {
  identifier: string
  updatedAt: string | null
  connected: boolean
  state: MoneyNoteState | null
}

const currencyFormatters: Record<CurrencyCode, Intl.NumberFormat> = {
  LAK: new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }),
  THB: new Intl.NumberFormat('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
  USD: new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export const currencySymbols: Record<CurrencyCode, string> = {
  LAK: '₭',
  THB: '฿',
  USD: '$'
}

const defaultCategoryDefinitions: Record<CategoryType, Array<{ name: string; emoji: string; color: WalletColor }>> = {
  income: [
    { name: 'Salary', emoji: '💼', color: 'sky' },
    { name: 'Freelance', emoji: '🛠️', color: 'indigo' },
    { name: 'Gift', emoji: '🎁', color: 'rose' },
    { name: 'Cashback', emoji: '💸', color: 'emerald' },
    { name: 'Other', emoji: '🏷️', color: 'slate' }
  ],
  expense: [
    { name: 'Food', emoji: '🍜', color: 'rose' },
    { name: 'Transport', emoji: '🚕', color: 'sky' },
    { name: 'Bills', emoji: '🧾', color: 'amber' },
    { name: 'Shopping', emoji: '🛍️', color: 'violet' },
    { name: 'Health', emoji: '🩺', color: 'emerald' },
    { name: 'Family', emoji: '👨‍👩‍👧‍👦', color: 'fuchsia' },
    { name: 'Other', emoji: '🏷️', color: 'slate' }
  ]
}

const defaultCompanyDefinitions: Array<{ name: string; emoji: string; color: WalletColor }> = [
  { name: 'Other', emoji: '🏷️', color: 'slate' }
]

const typeMeta: Record<TransactionType, { label: string; icon: string; tint: string }> = {
  income: { label: 'Income', icon: 'i-lucide-arrow-down-right', tint: 'text-emerald-500' },
  expense: { label: 'Expense', icon: 'i-lucide-arrow-up-right', tint: 'text-rose-500' },
  move: { label: 'Move', icon: 'i-lucide-arrow-left-right', tint: 'text-sky-500' },
  loan: { label: 'Loan', icon: 'i-lucide-circle-dollar-sign', tint: 'text-amber-500' }
}

export const typeOptions: Array<{ label: string; value: TransactionType }> = [
  { label: 'Income', value: 'income' },
  { label: 'Expense', value: 'expense' },
  { label: 'Move', value: 'move' },
  { label: 'Loan', value: 'loan' }
]

export const currencyOptions: Array<{ label: string; value: CurrencyCode }> = [
  { label: 'LAK', value: 'LAK' },
  { label: 'THB', value: 'THB' },
  { label: 'USD', value: 'USD' }
]

export const incomeCategories = defaultCategoryDefinitions.income.map(category => category.name)
export const expenseCategories = defaultCategoryDefinitions.expense.map(category => category.name)

const walletThemeMap: Record<WalletColor, { label: string; accent: string }> = {
  sky: { label: 'Sky', accent: 'from-sky-500 to-cyan-400' },
  emerald: { label: 'Emerald', accent: 'from-emerald-500 to-teal-400' },
  indigo: { label: 'Indigo', accent: 'from-indigo-500 to-violet-400' },
  amber: { label: 'Amber', accent: 'from-amber-500 to-orange-400' },
  rose: { label: 'Rose', accent: 'from-rose-500 to-pink-400' },
  violet: { label: 'Violet', accent: 'from-violet-500 to-fuchsia-400' },
  fuchsia: { label: 'Fuchsia', accent: 'from-fuchsia-500 to-pink-400' },
  slate: { label: 'Slate', accent: 'from-slate-600 to-slate-800' }
}

export const walletColorOptions = (Object.entries(walletThemeMap) as Array<[WalletColor, { label: string; accent: string }]>)
  .map(([value, theme]) => ({ value, label: theme.label, accent: theme.accent }))

function walletAccentForColor(color: WalletColor) {
  return walletThemeMap[color].accent
}

function walletColorForAccent(accent?: string | null): WalletColor {
  const match = (Object.entries(walletThemeMap) as Array<[WalletColor, { label: string; accent: string }]>)
    .find(([, theme]) => theme.accent === accent)

  return match?.[0] ?? 'sky'
}

function safeTimestamp(value?: string | null) {
  const time = value ? new Date(value).getTime() : Number.NaN
  return Number.isFinite(time) ? time : 0
}

function recordTimestamp(record?: { updatedAt?: string | null; createdAt?: string | null }) {
  return record?.updatedAt ?? record?.createdAt ?? new Date().toISOString()
}

function isNewerRecord<T extends { updatedAt?: string | null; createdAt?: string | null }>(candidate: T, current: T) {
  const candidateTime = safeTimestamp(recordTimestamp(candidate))
  const currentTime = safeTimestamp(recordTimestamp(current))

  if (candidateTime !== currentTime) {
    return candidateTime > currentTime
  }

  return recordTimestamp(candidate) > recordTimestamp(current)
}

function mergeKeyList(local: string[] = [], remote: string[] = []) {
  return [...new Set([...local, ...remote])]
}

function mergeRecordLists<T extends { id: string; updatedAt?: string | null; createdAt?: string | null }>(
  local: T[] = [],
  remote: T[] = []
) {
  const merged = new Map<string, T>()

  const ingest = (record: T) => {
    const current = merged.get(record.id)
    if (!current || isNewerRecord(record, current)) {
      merged.set(record.id, record)
    }
  }

  local.forEach(ingest)
  remote.forEach(ingest)

  return [...merged.values()]
}

function normalizeWallet(wallet: Partial<Wallet> & { id: string }): Wallet {
  const color = wallet.color ?? walletColorForAccent(wallet.accent)

  return {
    id: wallet.id,
    name: wallet.name?.trim() || 'Wallet',
    currency: wallet.currency ?? 'LAK',
    openingBalance: Number(wallet.openingBalance ?? 0),
    balance: Number(wallet.balance ?? wallet.openingBalance ?? 0),
    color,
    accent: walletAccentForColor(color),
    emoji: wallet.emoji ?? '💳',
    note: wallet.note?.trim() || undefined,
    updatedAt: wallet.updatedAt ?? wallet.createdAt ?? new Date().toISOString()
  }
}

function normalizeCategory(category: Partial<CategoryItem> & { id: string; type: CategoryType }): CategoryItem {
  const type = category.type === 'expense' ? 'expense' : 'income'

  return {
    id: category.id,
    type,
    name: category.name?.trim() || 'Category',
    emoji: category.emoji?.trim() || '🏷️',
    color: category.color ?? 'sky',
    enabled: typeof category.enabled === 'boolean' ? category.enabled : true,
    createdAt: category.createdAt ?? new Date().toISOString(),
    updatedAt: category.updatedAt ?? category.createdAt ?? new Date().toISOString()
  }
}

function normalizeCompany(company: Partial<CompanyItem> & { id: string }): CompanyItem {
  return {
    id: company.id,
    name: company.name?.trim() || 'Company',
    emoji: company.emoji?.trim() || '🏢',
    color: company.color ?? 'sky',
    enabled: typeof company.enabled === 'boolean' ? company.enabled : true,
    createdAt: company.createdAt ?? new Date().toISOString(),
    updatedAt: company.updatedAt ?? company.createdAt ?? new Date().toISOString()
  }
}

function defaultCategoryKey(type: CategoryType, name: string) {
  return `${type}:${name.toLowerCase()}`
}

function customCategoryKey(id: string) {
  return `custom:${id}`
}

function defaultCompanyKey(name: string) {
  return name.toLowerCase()
}

function customCompanyKey(id: string) {
  return `custom:${id}`
}

function customWalletKey(id: string) {
  return `wallet:${id}`
}

function sortKeysByBaseOrder(keys: string[], baseOrder: string[]) {
  return [...new Set(keys)].sort((a, b) => {
    const indexA = baseOrder.indexOf(a)
    const indexB = baseOrder.indexOf(b)

    if (indexA === -1 && indexB === -1) return a.localeCompare(b)
    if (indexA === -1) return 1
    if (indexB === -1) return -1
    return indexA - indexB
  })
}

function defaultCurrencySupport(): Record<CurrencyCode, boolean> {
  return {
    LAK: true,
    THB: true,
    USD: true
  }
}

function normalizeCurrencySupport(input?: Partial<Record<CurrencyCode, boolean>> | null) {
  const support = defaultCurrencySupport()

  currencyOptions.forEach((option) => {
    const value = input?.[option.value]
    support[option.value] = typeof value === 'boolean' ? value : support[option.value]
  })

  if (!Object.values(support).some(Boolean)) {
    support.LAK = true
  }

  return support
}

function normalizeAccountKey(identifier?: string | null) {
  const value = identifier?.trim()
  if (!value) return 'guest'

  return value.toLowerCase().replace(/[^\w@.+-]/g, '_')
}

function normalizeState(state?: Partial<MoneyNoteState> | null): MoneyNoteState {
  const fallback = defaultState()
  const incomingDisabledDefaults = Array.isArray(state?.disabledDefaultCategories)
    ? state.disabledDefaultCategories.filter((item): item is string => typeof item === 'string')
    : []
  const incomingDisabledDefaultCompanies = Array.isArray(state?.disabledDefaultCompanies)
    ? state.disabledDefaultCompanies.filter((item): item is string => typeof item === 'string')
    : []
  const legacyDisabledDefaults = state?.defaultCategoriesEnabled === false && !incomingDisabledDefaults.length
    ? [
        ...defaultCategoryDefinitions.income.map(category => defaultCategoryKey('income', category.name)),
        ...defaultCategoryDefinitions.expense.map(category => defaultCategoryKey('expense', category.name))
      ]
    : []
  const disabledDefaultCategories = [...new Set([...incomingDisabledDefaults, ...legacyDisabledDefaults])]
  const legacyDisabledCompanies = state?.defaultCompaniesEnabled === false && !incomingDisabledDefaultCompanies.length
    ? defaultCompanyDefinitions.map(company => defaultCompanyKey(company.name))
    : []
  const disabledDefaultCompanies = [...new Set([...incomingDisabledDefaultCompanies, ...legacyDisabledCompanies])]
  const normalizedCategories = state?.categories?.length
    ? state.categories.map(category => normalizeCategory(category as Partial<CategoryItem> & { id: string; type: CategoryType }))
    : fallback.categories
  const normalizedCompanies = state?.companies?.length
    ? state.companies.map(company => normalizeCompany(company as Partial<CompanyItem> & { id: string }))
    : fallback.companies
  const normalizedWallets = state?.wallets?.length
    ? state.wallets.map(wallet => normalizeWallet(wallet as Partial<Wallet> & { id: string }))
    : fallback.wallets
  const baseWalletKeys = [
    ...normalizedWallets.map(wallet => customWalletKey(wallet.id))
  ]

  const baseIncomeKeys = [
    ...normalizedCategories
      .filter(category => category.type === 'income')
      .slice()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map(category => customCategoryKey(category.id)),
    ...defaultCategoryDefinitions.income
      .map(category => defaultCategoryKey('income', category.name))
  ]

  const baseExpenseKeys = [
    ...normalizedCategories
      .filter(category => category.type === 'expense')
      .slice()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map(category => customCategoryKey(category.id)),
    ...defaultCategoryDefinitions.expense
      .map(category => defaultCategoryKey('expense', category.name))
  ]

  const baseCompanyKeys = [
    ...normalizedCompanies
      .slice()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map(company => customCompanyKey(company.id)),
    ...defaultCompanyDefinitions.map(company => defaultCompanyKey(company.name))
  ]

  const normalizeKeyList = (input: unknown, baseKeys: string[]) => {
    const current = Array.isArray(input)
      ? input.filter((item): item is string => typeof item === 'string' && baseKeys.includes(item))
      : []
    const missing = baseKeys.filter(key => !current.includes(key))
    return [...current, ...missing]
  }

  const normalizePinnedKeys = (input: unknown, baseKeys: string[]) => {
    const current = Array.isArray(input)
      ? input.filter((item): item is string => typeof item === 'string' && baseKeys.includes(item))
      : []

    return [...new Set(current)]
  }

  return recalculateBalances({
    walletOrder: normalizeKeyList((state as Partial<MoneyNoteState> | null | undefined)?.walletOrder, baseWalletKeys),
    pinnedWalletKeys: normalizePinnedKeys((state as Partial<MoneyNoteState> | null | undefined)?.pinnedWalletKeys, baseWalletKeys),
    disabledDefaultCategories,
    disabledDefaultCompanies,
    categoryOrder: {
      income: normalizeKeyList((state as Partial<MoneyNoteState> | null | undefined)?.categoryOrder?.income, baseIncomeKeys),
      expense: normalizeKeyList((state as Partial<MoneyNoteState> | null | undefined)?.categoryOrder?.expense, baseExpenseKeys)
    },
    pinnedCategoryKeys: {
      income: normalizePinnedKeys((state as Partial<MoneyNoteState> | null | undefined)?.pinnedCategoryKeys?.income, baseIncomeKeys),
      expense: normalizePinnedKeys((state as Partial<MoneyNoteState> | null | undefined)?.pinnedCategoryKeys?.expense, baseExpenseKeys)
    },
    companyOrder: normalizeKeyList((state as Partial<MoneyNoteState> | null | undefined)?.companyOrder, baseCompanyKeys),
    pinnedCompanyKeys: normalizePinnedKeys((state as Partial<MoneyNoteState> | null | undefined)?.pinnedCompanyKeys, baseCompanyKeys),
    wallets: normalizedWallets,
    transactions: state?.transactions?.length ? state.transactions : fallback.transactions,
    categories: normalizedCategories,
    companies: normalizedCompanies
  })
}

function isPristineState(state: MoneyNoteState) {
  const wallet = state.wallets[0]
  const company = state.companies[0]

  return state.transactions.length === 0
    && state.categories.length === 0
    && state.wallets.length === 1
    && Boolean(wallet)
    && wallet.id === 'wallet-cash'
    && wallet.name === 'Cash'
    && wallet.currency === 'LAK'
    && wallet.openingBalance === 0
    && wallet.balance === 0
    && wallet.color === 'sky'
    && wallet.emoji === '💳'
    && state.companies.length === 1
    && Boolean(company)
    && company.id === 'company-default-other'
    && company.name === 'Other'
    && company.enabled === true
    && state.pinnedWalletKeys.length === 0
    && state.pinnedCategoryKeys.income.length === 0
    && state.pinnedCategoryKeys.expense.length === 0
    && state.pinnedCompanyKeys.length === 0
    && state.disabledDefaultCategories.length === 0
    && state.disabledDefaultCompanies.length === 0
}

function mergeMoneyNoteState(localState: MoneyNoteState, remoteState: MoneyNoteState): MoneyNoteState {
  const local = normalizeState(localState)
  const remote = normalizeState(remoteState)

  const mergedTransactions = mergeRecordLists(local.transactions, remote.transactions)
    .map(transaction => ({
      ...transaction,
      updatedAt: recordTimestamp(transaction),
      createdAt: transaction.createdAt ?? recordTimestamp(transaction)
    }))
    .sort((a, b) => {
      const timeDelta = safeTimestamp(a.updatedAt) - safeTimestamp(b.updatedAt)
      if (timeDelta !== 0) return timeDelta

      const createdDelta = safeTimestamp(a.createdAt) - safeTimestamp(b.createdAt)
      if (createdDelta !== 0) return createdDelta

      return a.id.localeCompare(b.id)
    })

  const mergedWallets = mergeRecordLists(local.wallets, remote.wallets).map(wallet => ({
    ...wallet,
    updatedAt: recordTimestamp(wallet)
  }))

  const mergedCategories = mergeRecordLists(local.categories, remote.categories).map(category => ({
    ...category,
    updatedAt: recordTimestamp(category)
  }))

  const mergedCompanies = mergeRecordLists(local.companies, remote.companies).map(company => ({
    ...company,
    updatedAt: recordTimestamp(company)
  }))

  return recalculateBalances({
    walletOrder: mergeKeyList(local.walletOrder, remote.walletOrder),
    pinnedWalletKeys: mergeKeyList(local.pinnedWalletKeys, remote.pinnedWalletKeys),
    disabledDefaultCategories: mergeKeyList(local.disabledDefaultCategories, remote.disabledDefaultCategories),
    disabledDefaultCompanies: mergeKeyList(local.disabledDefaultCompanies, remote.disabledDefaultCompanies),
    categoryOrder: {
      income: mergeKeyList(local.categoryOrder.income, remote.categoryOrder.income),
      expense: mergeKeyList(local.categoryOrder.expense, remote.categoryOrder.expense)
    },
    pinnedCategoryKeys: {
      income: mergeKeyList(local.pinnedCategoryKeys.income, remote.pinnedCategoryKeys.income),
      expense: mergeKeyList(local.pinnedCategoryKeys.expense, remote.pinnedCategoryKeys.expense)
    },
    companyOrder: mergeKeyList(local.companyOrder, remote.companyOrder),
    pinnedCompanyKeys: mergeKeyList(local.pinnedCompanyKeys, remote.pinnedCompanyKeys),
    wallets: mergedWallets,
    transactions: mergedTransactions,
    categories: mergedCategories,
    companies: mergedCompanies
  })
}

function localizedTypeLabel(type: TransactionType, language: AppLanguage = 'en') {
  if (language === 'lo') {
    const labels: Record<TransactionType, string> = {
      income: 'ລາຍຮັບ',
      expense: 'ລາຍຈ່າຍ',
      move: 'ໂອນ',
      loan: 'ກູ້ຢືມ'
    }

    return labels[type]
  }

  return typeMeta[type].label
}

export const loanDirectionOptions: Array<{ label: string; value: LoanDirection }> = [
  { label: 'Given', value: 'given' },
  { label: 'Received', value: 'received' }
]

export const companyOptions = ['Other']

export const moveCategories = ['Transfer']
export const loanCategories = ['Loan']

function pad(num: number) {
  return num.toString().padStart(2, '0')
}

function toDateKey(date: string | Date) {
  const value = new Date(date)
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`
}

function currentMonthKey(date = new Date()) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`
}

function makeDate(monthOffset = 0, day = 1) {
  const date = new Date()
  date.setMonth(date.getMonth() - monthOffset)
  date.setDate(day)
  return toDateKey(date)
}

function defaultState(): MoneyNoteState {
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
    wallets: [
      {
        id: 'wallet-cash',
        name: 'Cash',
        currency: 'LAK',
        openingBalance: 0,
        balance: 0,
        color: 'sky',
        accent: 'from-sky-500 to-cyan-400',
        emoji: '💳',
        note: 'Default wallet',
        updatedAt: new Date().toISOString()
      }
    ],
    categories: [],
    companies: defaultCompanyDefinitions.map(company => ({
      id: `company-default-${company.name.toLowerCase().replace(/\s+/g, '-')}`,
      name: company.name,
      emoji: company.emoji,
      color: company.color,
      enabled: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })),
    transactions: []
  }
}

function cloneState(state: MoneyNoteState): MoneyNoteState {
  return {
    walletOrder: [...state.walletOrder],
    pinnedWalletKeys: [...state.pinnedWalletKeys],
    disabledDefaultCategories: [...state.disabledDefaultCategories],
    disabledDefaultCompanies: [...state.disabledDefaultCompanies],
    categoryOrder: {
      income: [...state.categoryOrder.income],
      expense: [...state.categoryOrder.expense]
    },
    pinnedCategoryKeys: {
      income: [...state.pinnedCategoryKeys.income],
      expense: [...state.pinnedCategoryKeys.expense]
    },
    companyOrder: [...state.companyOrder],
    pinnedCompanyKeys: [...state.pinnedCompanyKeys],
    wallets: state.wallets.map(wallet => ({ ...wallet })),
    transactions: state.transactions.map(transaction => ({ ...transaction })),
    categories: state.categories.map(category => ({ ...category })),
    companies: state.companies.map(company => ({ ...company }))
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function createMoneyNoteBackupFile(state: {
  store: MoneyNoteState
  selectedCurrency: CurrencyCode
  currencySupport: Record<CurrencyCode, boolean>
}): MoneyNoteBackupFile {
  return {
    format: 'income-expense-note-backup',
    version: 1,
    exportedAt: new Date().toISOString(),
    data: {
      state: cloneState(state.store),
      selectedCurrency: state.selectedCurrency,
      currencySupport: {
        LAK: state.currencySupport.LAK,
        THB: state.currencySupport.THB,
        USD: state.currencySupport.USD
      }
    }
  }
}

export function parseMoneyNoteBackupFile(input: unknown): MoneyNoteBackupFile {
  if (!isRecord(input)) {
    throw new Error('invalid-backup-file')
  }

  if (input.format !== 'income-expense-note-backup' || input.version !== 1) {
    throw new Error('unsupported-backup-file')
  }

  if (!isRecord(input.data)) {
    throw new Error('invalid-backup-file')
  }

  return input as MoneyNoteBackupFile
}

function defaultCategoryKeyForEntry(type: CategoryType, name: string) {
  return defaultCategoryKey(type, name)
}

function categoryEntryKey(entry: { id: string; type: CategoryType; name: string; isDefault?: boolean }) {
  return entry.isDefault ? defaultCategoryKeyForEntry(entry.type, entry.name) : customCategoryKey(entry.id)
}

function companyEntryKey(entry: { id: string; name: string; isDefault?: boolean }) {
  return entry.isDefault ? defaultCompanyKey(entry.name) : customCompanyKey(entry.id)
}

function calculateMoveDestinationAmount(
  amount: number,
  sourceCurrency?: CurrencyCode,
  targetCurrency?: CurrencyCode,
  exchangeRate?: number
) {
  if (!sourceCurrency || !targetCurrency) return amount
  if (sourceCurrency === targetCurrency) return amount

  const rate = Number(exchangeRate ?? 0)
  if (!rate || rate <= 0) return amount

  const pair = `${sourceCurrency}->${targetCurrency}`

  if (pair === 'THB->LAK' || pair === 'USD->LAK' || pair === 'USD->THB') {
    return amount * rate
  }

  if (pair === 'THB->USD' || pair === 'LAK->THB' || pair === 'LAK->USD') {
    return amount / rate
  }

  return amount / rate
}

function moveDestinationAmount(transaction: Transaction, source?: Wallet, target?: Wallet) {
  return calculateMoveDestinationAmount(
    transaction.amount,
    source?.currency,
    target?.currency,
    transaction.exchangeRate
  )
}

function applyTransactionEffect(wallets: Wallet[], transaction: Transaction, direction = 1) {
  const source = wallets.find(wallet => wallet.id === transaction.walletId)
  const target = transaction.toWalletId ? wallets.find(wallet => wallet.id === transaction.toWalletId) : undefined
  const delta = transaction.amount * direction

  if (transaction.type === 'income') {
    if (source) source.balance += delta
  }
  else if (transaction.type === 'expense') {
    if (source) source.balance -= delta
  }
  else if (transaction.type === 'move') {
    if (source) source.balance -= delta
    if (target) target.balance += moveDestinationAmount(transaction, source, target) * direction
  }
  else if (transaction.type === 'loan') {
    const loanDirection = transaction.loanDirection ?? 'given'
    if (loanDirection === 'given') {
      if (source) source.balance -= delta
    }
    else if (source) {
      source.balance += delta
    }
  }
}

function recalculateBalances(state: MoneyNoteState) {
  state.wallets = state.wallets.map(wallet => ({
    ...wallet,
    balance: wallet.openingBalance
  }))

  state.transactions
    .slice()
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .forEach(transaction => applyTransactionEffect(state.wallets, transaction, 1))

  return state
}

function sortWalletsByPriority(walletsList: Wallet[], order: string[], pinnedKeys: string[]) {
  const pinned = new Set(pinnedKeys)

  return [...walletsList].sort((a, b) => {
    const keyA = customWalletKey(a.id)
    const keyB = customWalletKey(b.id)
    const pinA = pinned.has(keyA) ? 0 : 1
    const pinB = pinned.has(keyB) ? 0 : 1

    if (pinA !== pinB) return pinA - pinB

    const orderA = order.indexOf(keyA)
    const orderB = order.indexOf(keyB)
    const normalizedA = orderA === -1 ? Number.MAX_SAFE_INTEGER : orderA
    const normalizedB = orderB === -1 ? Number.MAX_SAFE_INTEGER : orderB

    if (normalizedA !== normalizedB) return normalizedA - normalizedB

    return a.name.localeCompare(b.name)
  })
}

function createDateRange(months = 6) {
  const ranges: Array<{ key: string; label: string }> = []
  const now = new Date()

  for (let offset = months - 1; offset >= 0; offset -= 1) {
    const date = new Date(now)
    date.setMonth(date.getMonth() - offset)
    ranges.push({
      key: `${date.getFullYear()}-${pad(date.getMonth() + 1)}`,
      label: date.toLocaleDateString('en-US', { month: 'short' })
    })
  }

  return ranges
}

function matchesCurrency(transaction: Transaction, currency?: CurrencyCode) {
  return !currency || transaction.currency === currency
}

function matchesWallet(transaction: Transaction, walletId?: string) {
  if (!walletId) return true
  return transaction.walletId === walletId || transaction.toWalletId === walletId
}

function matchesDateRange(transaction: Transaction, from?: string, to?: string) {
  if (from && transaction.date < from) return false
  if (to && transaction.date > to) return false
  return true
}

export function useMoneyNote() {
  const store = useState<MoneyNoteState>('money-note-store', () => recalculateBalances(defaultState()))
  const selectedCurrency = useState<CurrencyCode>('money-note-selected-currency', () => 'LAK')
  const currencySupport = useState<Record<CurrencyCode, boolean>>(
    'money-note-currency-support',
    () => defaultCurrencySupport()
  )
  const hydrated = useState('money-note-hydrated', () => false)
  const transactionsHydrated = useState('money-note-transactions-hydrated', () => false)
  const hydratedAccountKey = useState('money-note-hydrated-account-key', () => '')
  const hydratedCloudSyncEnabled = useState('money-note-hydrated-cloud-sync-enabled', () => false)
  const hydratedSnapshotWasPristine = useState('money-note-hydrated-snapshot-pristine', () => true)
  const lastSyncSource = useState<SyncSource>('money-note-last-sync-source', () => 'unknown')
  const hydrating = useState('money-note-hydrating', () => false)
  const autoSyncReady = useState('money-note-auto-sync-ready', () => false)
  const initialHydratedSignature = useState('money-note-initial-hydrated-signature', () => '')
  const syncInFlight = useState('money-note-sync-in-flight', () => false)
  const queuedForceSync = useState('money-note-queued-force-sync', () => false)
  const { selectedLanguage } = useAppLanguage()
  const { authReady, sessionProfile } = useDeviceAuth()
  const { isOnline } = useConnectivity()
  let remoteSaveTimer: ReturnType<typeof setTimeout> | null = null
  const syncStatus = useState<'offline' | 'syncing' | 'synced' | 'waiting'>('money-note-sync-status', () => 'waiting')
  const lastSyncedAt = useState('money-note-last-synced-at', () => '')
  const syncProgress = useState('money-note-sync-progress', () => 0)
  const syncError = useState('money-note-sync-error', () => '')
  const syncDebugCloudSnapshot = useState<SyncDebugCloudSnapshot | null>('money-note-sync-debug-cloud', () => null)
  const syncDebugLoading = useState('money-note-sync-debug-loading', () => false)
  const syncDebugError = useState('money-note-sync-debug-error', () => '')
  const defaultCategoriesEnabled = computed(() => store.value.disabledDefaultCategories.length === 0)

  const activeAccountIdentifier = computed(() => sessionProfile.value?.identifier ?? '')
  const activeAccountKey = computed(() => normalizeAccountKey(activeAccountIdentifier.value))
  const isCloudSyncEnabled = computed(() => (sessionProfile.value?.plan ?? 'free') === 'pro')
  const canEditMoneyData = computed(() => isCloudSyncEnabled.value)

  const buildStateSignature = (
    stateValue: MoneyNoteState = store.value,
    selectedCurrencyValue: CurrencyCode = selectedCurrency.value,
    currencySupportValue: Record<CurrencyCode, boolean> = currencySupport.value
  ) => JSON.stringify({
    stateJson: JSON.stringify(stateValue),
    selectedCurrency: selectedCurrencyValue,
    currencySupportJson: JSON.stringify(currencySupportValue)
  })

  const buildLocalSnapshot = (
    updatedAt = new Date().toISOString(),
    stateValue: MoneyNoteState = store.value,
    selectedCurrencyValue: CurrencyCode = selectedCurrency.value,
    currencySupportValue: Record<CurrencyCode, boolean> = currencySupport.value
  ): MoneyNoteSnapshot => ({
    stateJson: JSON.stringify(stateValue),
    selectedCurrency: selectedCurrencyValue,
    currencySupportJson: JSON.stringify(currencySupportValue),
    updatedAt
  })

  const buildLocalSnapshotSignature = () => buildStateSignature()

  function logSyncDebug(step: string, details?: Record<string, unknown>) {
    if (!import.meta.client) return

    if (details) {
      console.debug(`[money-note][sync] ${step}`, details)
      return
    }

    console.debug(`[money-note][sync] ${step}`)
  }

  async function refreshSyncDebugData() {
    if (!import.meta.client || !authReady.value) return false

    syncDebugLoading.value = true
    syncDebugError.value = ''

    try {
      const accountKey = activeAccountKey.value
      const identifier = activeAccountIdentifier.value.trim()

      if (!identifier || accountKey === 'guest') {
        syncDebugCloudSnapshot.value = null
        return true
      }

      const remote = await $fetch<{
        state: Partial<MoneyNoteState> | null
        snapshot?: {
          state?: Partial<MoneyNoteState> | null
          selectedCurrency?: unknown
          currencySupport?: unknown
          updatedAt?: string | null
        } | null
        updatedAt?: string | null
        connected?: boolean
      }>('/api/app-state', {
        query: { identifier }
      })

      if (remote?.connected === false) {
        syncDebugCloudSnapshot.value = null
        return true
      }

      const cloudSnapshot = remote?.snapshot ?? remote?.state ?? null
      syncDebugCloudSnapshot.value = {
        identifier,
        updatedAt: remote?.updatedAt ?? null,
        connected: true,
        state: cloudSnapshot
          ? parseSnapshotState(cloudSnapshot).state
          : null
      }

      logSyncDebug('debug: read cloud snapshot', {
        identifier,
        hasRemoteState: Boolean(cloudSnapshot),
        remoteUpdatedAt: remote?.updatedAt ?? null
      })

      return true
    }
    catch (error) {
      const message = resolveSyncErrorMessage(error)
      syncDebugError.value = message
      logSyncDebug('debug: failed to refresh snapshot data', {
        error: message
      })
      return false
    }
    finally {
      syncDebugLoading.value = false
    }
  }

  function parseSnapshotState(
    snapshot?: MoneyNoteSnapshot | {
      state?: Partial<MoneyNoteState> | null
      selectedCurrency?: unknown
      currencySupport?: unknown
      updatedAt?: string | null
    } | null
  ) {
    if (!snapshot) {
      return {
        state: normalizeState(defaultState()),
        selectedCurrency: 'LAK' as CurrencyCode,
        currencySupport: defaultCurrencySupport(),
        updatedAt: new Date().toISOString()
      }
    }

    let parsedState = normalizeState(defaultState())
    let parsedCurrency = 'LAK' as CurrencyCode
    let parsedSupport = defaultCurrencySupport()

    if ('stateJson' in snapshot) {
      try {
        parsedState = normalizeState(JSON.parse(snapshot.stateJson) as Partial<MoneyNoteState>)
      }
      catch {
        parsedState = normalizeState(defaultState())
      }

      try {
        parsedSupport = normalizeCurrencySupport(JSON.parse(snapshot.currencySupportJson) as Partial<Record<CurrencyCode, boolean>>)
      }
      catch {
        parsedSupport = defaultCurrencySupport()
      }

      if (currencyOptions.some(option => option.value === snapshot.selectedCurrency)) {
        parsedCurrency = snapshot.selectedCurrency
      }
    }
    else if (
      ('wallets' in snapshot || 'transactions' in snapshot || 'categories' in snapshot || 'companies' in snapshot)
      && !('state' in snapshot)
    ) {
      try {
        parsedState = normalizeState(snapshot as Partial<MoneyNoteState>)
      }
      catch {
        parsedState = normalizeState(defaultState())
      }

      parsedCurrency = 'LAK'
      parsedSupport = defaultCurrencySupport()
    }
    else {
      try {
        parsedState = normalizeState(snapshot.state ?? defaultState())
      }
      catch {
        parsedState = normalizeState(defaultState())
      }

      try {
        parsedSupport = normalizeCurrencySupport(snapshot.currencySupport as Partial<Record<CurrencyCode, boolean>>)
      }
      catch {
        parsedSupport = defaultCurrencySupport()
      }

      if (currencyOptions.some(option => option.value === snapshot.selectedCurrency)) {
        parsedCurrency = snapshot.selectedCurrency
      }
    }

    return {
      state: parsedState,
      selectedCurrency: parsedCurrency,
      currencySupport: parsedSupport,
      updatedAt: snapshot.updatedAt ?? new Date().toISOString()
    }
  }

  async function pushCloudState(identifier: string, state: MoneyNoteState, updatedAt?: string) {
    const result = await $fetch<{ ok: boolean; connected?: boolean }>('/api/app-state', {
      method: 'POST',
      body: {
        identifier,
        snapshot: buildLocalSnapshot(
          updatedAt,
          state,
          selectedCurrency.value,
          currencySupport.value
        ),
        updatedAt
      }
    })

    if (result?.connected === false) {
      throw new Error('cloud-unavailable')
    }

    return result
  }

  function resolveSyncErrorMessage(error: unknown) {
    if (!error) return 'Unknown sync error'

    if (typeof error === 'string') {
      return error.trim() || 'Unknown sync error'
    }

    if (error instanceof Error) {
      return error.message || 'Unknown sync error'
    }

    const maybeResponse = error as {
      data?: { statusMessage?: string; message?: string }
      message?: string
      statusMessage?: string
    }

    return maybeResponse.data?.statusMessage
      || maybeResponse.data?.message
      || maybeResponse.statusMessage
      || maybeResponse.message
      || 'Unknown sync error'
  }

  function latestTimestamp(...values: Array<string | null | undefined>) {
    const timestamps = values.filter((value): value is string => typeof value === 'string' && Boolean(value.trim()))
    if (!timestamps.length) return new Date().toISOString()

    return timestamps.sort((a, b) => new Date(a).getTime() - new Date(b).getTime()).at(-1) ?? new Date().toISOString()
  }

  function isRemoteSnapshotNewer(localUpdatedAt?: string | null, remoteUpdatedAt?: string | null) {
    if (!remoteUpdatedAt) return false
    if (!localUpdatedAt) return true

    return new Date(remoteUpdatedAt).getTime() >= new Date(localUpdatedAt).getTime()
  }

  const saveState = (options?: { force?: boolean }) => {
    if (!import.meta.client || !hydrated.value || hydrating.value || !autoSyncReady.value) return

    const snapshotSignature = buildLocalSnapshotSignature()
    if (!options?.force && snapshotSignature === initialHydratedSignature.value) return

    hydratedSnapshotWasPristine.value = false

    if (!isCloudSyncEnabled.value) {
      syncStatus.value = 'waiting'
      syncProgress.value = 0
      return
    }

    if (!isOnline.value) {
      syncStatus.value = 'offline'
      syncProgress.value = 0
      return
    }

    if (remoteSaveTimer) {
      clearTimeout(remoteSaveTimer)
    }

    const identifier = activeAccountIdentifier.value.trim()
    if (!identifier || activeAccountKey.value === 'guest') {
      syncStatus.value = 'waiting'
      syncProgress.value = 0
      return
    }

    if (syncInFlight.value) {
      queuedForceSync.value = true
      return
    }

    remoteSaveTimer = setTimeout(() => {
      remoteSaveTimer = null
      void refreshCloudState({ force: true })
    }, 250)
  }

  function flushSnapshotOnUnload() {
    if (!import.meta.client || !hydrated.value || hydrating.value || !autoSyncReady.value || !isCloudSyncEnabled.value) return

    const identifier = activeAccountIdentifier.value.trim()
    if (!identifier || activeAccountKey.value === 'guest') return

    try {
      const payload = JSON.stringify({
        identifier,
        snapshot: buildLocalSnapshot(),
        updatedAt: new Date().toISOString()
      })

      if (navigator.sendBeacon) {
        const blob = new Blob([payload], { type: 'application/json' })
        navigator.sendBeacon('/api/app-state', blob)
      }
    }
    catch {
      // Best-effort only. Normal sync will continue on the next load.
    }
  }

  function clearPendingSaveTimers() {
    if (remoteSaveTimer) {
      clearTimeout(remoteSaveTimer)
      remoteSaveTimer = null
    }
  }

  async function importMoneyNoteBackupFile(input: unknown) {
    if (!import.meta.client || !authReady.value) return

    const backup = parseMoneyNoteBackupFile(input)
    const importedState = normalizeState(backup.data.state)
    const importedCurrencySupport = normalizeCurrencySupport(backup.data.currencySupport)
    const importedCurrency = currencyOptions.some(option => option.value === backup.data.selectedCurrency)
      ? backup.data.selectedCurrency
      : 'LAK'
    const identifier = activeAccountIdentifier.value.trim()
    const accountKey = activeAccountKey.value

    clearPendingSaveTimers()
    autoSyncReady.value = false
    hydrating.value = true
    hydrated.value = false
    transactionsHydrated.value = false

    try {
      syncError.value = ''
      store.value = importedState
      selectedCurrency.value = importedCurrency
      currencySupport.value = importedCurrencySupport
      lastSyncSource.value = 'cloud'

      hydratedAccountKey.value = accountKey
      hydratedCloudSyncEnabled.value = isCloudSyncEnabled.value
      hydrated.value = true
      const importedSnapshot = buildLocalSnapshot()
      initialHydratedSignature.value = buildLocalSnapshotSignature()
      hydratedSnapshotWasPristine.value = false

      await nextTick()

      if (!isCloudSyncEnabled.value) {
        syncStatus.value = 'waiting'
        syncProgress.value = 0
        return
      }

      if (!isOnline.value) {
        syncStatus.value = 'offline'
        syncProgress.value = 0
        return
      }

      if (!identifier || accountKey === 'guest') {
        syncStatus.value = 'waiting'
        syncProgress.value = 0
        return
      }

      syncStatus.value = 'syncing'
      syncProgress.value = 72

      await pushCloudState(identifier, store.value, importedSnapshot.updatedAt)

      syncStatus.value = 'synced'
      syncProgress.value = 100
      lastSyncedAt.value = new Date().toISOString()
      initialHydratedSignature.value = buildLocalSnapshotSignature()
    }
    catch (error) {
      const message = resolveSyncErrorMessage(error)
      console.error('[money-note] import sync failed', error)
      syncError.value = message
      syncStatus.value = isOnline.value ? 'waiting' : 'offline'
      syncProgress.value = isOnline.value ? 35 : 0
      throw error
    }
    finally {
      hydrating.value = false
      autoSyncReady.value = true
    }
  }

  async function refreshCloudState(options?: { force?: boolean }) {
    if (!import.meta.client || !authReady.value || hydrating.value || !autoSyncReady.value) return false

    if (!isCloudSyncEnabled.value) {
      syncError.value = ''
      syncStatus.value = 'waiting'
      syncProgress.value = 0
      return false
    }

    if (!isOnline.value) {
      syncError.value = ''
      syncStatus.value = 'offline'
      syncProgress.value = 0
      return false
    }

    const identifier = activeAccountIdentifier.value.trim()
    const accountKey = activeAccountKey.value
    if (!identifier || accountKey === 'guest') {
      syncError.value = ''
      syncStatus.value = 'waiting'
      syncProgress.value = 0
      return false
    }

    if (syncInFlight.value) {
      if (options?.force) {
        queuedForceSync.value = true
      }
      return false
    }

    if (!options?.force && buildLocalSnapshotSignature() !== initialHydratedSignature.value) {
      return false
    }

    try {
      syncError.value = ''
      if (remoteSaveTimer) {
        clearTimeout(remoteSaveTimer)
        remoteSaveTimer = null
      }

      syncInFlight.value = true
      queuedForceSync.value = false
      syncStatus.value = 'syncing'
      syncProgress.value = 72

      const remote = await $fetch<{
        state: Partial<MoneyNoteState> | null
        snapshot?: {
          state?: Partial<MoneyNoteState> | null
          selectedCurrency?: unknown
          currencySupport?: unknown
          updatedAt?: string | null
        } | null
        updatedAt?: string | null
        connected?: boolean
      }>('/api/app-state', {
        query: { identifier }
      })

      if (remote?.connected === false) {
        syncError.value = ''
        syncStatus.value = 'waiting'
        syncProgress.value = 0
        return false
      }

      logSyncDebug('refreshCloudState: fetched cloud snapshot', {
        accountKey,
        identifier,
        hasRemoteState: Boolean(remote?.snapshot?.state ?? remote?.state),
        remoteUpdatedAt: remote?.updatedAt ?? null
      })

      const localSnapshotParsed = parseSnapshotState(buildLocalSnapshot())
      logSyncDebug('refreshCloudState: read current snapshot', {
        accountKey,
        localUpdatedAt: localSnapshotParsed.updatedAt
      })
      const remoteSnapshotParsed = remote?.snapshot ? parseSnapshotState(remote.snapshot) : null
      const remoteState = remoteSnapshotParsed?.state ?? (remote?.state ? normalizeState(remote.state) : null)
      const hasRemoteState = Boolean(remoteState)
      const remoteUpdatedAt = remoteSnapshotParsed?.updatedAt ?? remote?.updatedAt ?? null
      const useRemoteMetadata = isRemoteSnapshotNewer(localSnapshotParsed.updatedAt, remoteUpdatedAt)
      const remoteSignature = hasRemoteState
        ? buildStateSignature(
            remoteState,
            useRemoteMetadata
              ? (remoteSnapshotParsed?.selectedCurrency ?? localSnapshotParsed.selectedCurrency)
              : localSnapshotParsed.selectedCurrency,
            useRemoteMetadata
              ? (remoteSnapshotParsed?.currencySupport ?? localSnapshotParsed.currencySupport)
              : localSnapshotParsed.currencySupport
          )
        : ''
      const resolvedState = hasRemoteState && remoteState
        ? mergeMoneyNoteState(localSnapshotParsed.state, remoteState)
        : localSnapshotParsed.state
      const resolvedSelectedCurrency = useRemoteMetadata
        ? (remoteSnapshotParsed?.selectedCurrency ?? localSnapshotParsed.selectedCurrency)
        : localSnapshotParsed.selectedCurrency
      const resolvedCurrencySupport = useRemoteMetadata
        ? (remoteSnapshotParsed?.currencySupport ?? localSnapshotParsed.currencySupport)
        : localSnapshotParsed.currencySupport
      const resolvedUpdatedAt = hasRemoteState
        ? latestTimestamp(localSnapshotParsed.updatedAt, remote?.updatedAt, remoteSnapshotParsed?.updatedAt)
        : localSnapshotParsed.updatedAt ?? new Date().toISOString()
      const syncSource = 'cloud'

      if (hasRemoteState) {
        logSyncDebug('refreshCloudState: merge current + cloud', {
          accountKey,
          identifier,
          localUpdatedAt: localSnapshotParsed.updatedAt,
          remoteUpdatedAt: remote?.updatedAt ?? null,
          resolvedUpdatedAt,
          localWallets: localSnapshotParsed.state.wallets.length,
          remoteWallets: remoteState.wallets.length,
          resolvedWallets: resolvedState.wallets.length,
          localTransactions: localSnapshotParsed.state.transactions.length,
          remoteTransactions: remoteState.transactions.length,
          resolvedTransactions: resolvedState.transactions.length
        })
      }

      hydrating.value = true
      selectedCurrency.value = resolvedSelectedCurrency
      currencySupport.value = resolvedCurrencySupport
      store.value = resolvedState
      lastSyncSource.value = syncSource
      hydratedAccountKey.value = accountKey
      hydratedCloudSyncEnabled.value = isCloudSyncEnabled.value
      hydrated.value = true

      await hydrateTransactionsFromDatabase(resolvedState.transactions)

      const currentResolvedSignature = buildStateSignature(
        store.value,
        resolvedSelectedCurrency,
        resolvedCurrencySupport
      )
      const shouldPushRemote = !hasRemoteState || currentResolvedSignature !== remoteSignature

      if (shouldPushRemote) {
        logSyncDebug('refreshCloudState: write merged state to cloud', {
          identifier,
          updatedAt: resolvedUpdatedAt
        })
        syncProgress.value = 88
        await pushCloudState(identifier, resolvedState, resolvedUpdatedAt)
      }

      hydratedSnapshotWasPristine.value = false
      syncStatus.value = 'synced'
      syncProgress.value = 100
      lastSyncedAt.value = new Date().toISOString()
      initialHydratedSignature.value = buildStateSignature(
        store.value,
        resolvedSelectedCurrency,
        resolvedCurrencySupport
      )

      return true
    }
    catch (error) {
      const message = resolveSyncErrorMessage(error)
      console.error('[money-note] cloud sync failed', error)
      syncError.value = message
      syncStatus.value = isOnline.value ? 'waiting' : 'offline'
      syncProgress.value = isOnline.value ? 35 : 0
      return false
    }
    finally {
      syncInFlight.value = false
      hydrating.value = false
      autoSyncReady.value = true

      if (queuedForceSync.value && import.meta.client) {
        queuedForceSync.value = false
        queueMicrotask(() => {
          void refreshCloudState({ force: true })
        })
      }
    }
  }

  function applyTransactionsFromDatabase(transactions: Transaction[]) {
    store.value = recalculateBalances({
      ...cloneState(store.value),
      transactions: transactions.map(transaction => ({ ...transaction }))
    })
  }

  async function hydrateTransactionsFromDatabase(fallbackTransactions: Transaction[] = []) {
    if (!import.meta.client || !authReady.value) {
      transactionsHydrated.value = true
      return false
    }

    transactionsHydrated.value = false

    try {
      const result = await $fetch<{ connected: boolean; transactions: Transaction[] }>('/api/transactions')
      const databaseTransactions = Array.isArray(result.transactions) ? result.transactions : []

      if (!databaseTransactions.length && fallbackTransactions.length) {
        const imported = await $fetch<{ ok: boolean; transactions: Transaction[] }>('/api/transactions/import', {
          method: 'POST',
          body: {
            transactions: fallbackTransactions
          }
        })

        applyTransactionsFromDatabase(imported.transactions ?? [])
        return true
      }

      applyTransactionsFromDatabase(databaseTransactions)
      return true
    }
    catch (error) {
      if (fallbackTransactions.length) {
        applyTransactionsFromDatabase(fallbackTransactions)
      }

      console.error('[money-note] transactions database hydrate failed', error)
      return false
    }
    finally {
      transactionsHydrated.value = true
    }
  }

  const loadState = async () => {
    if (!import.meta.client || !authReady.value) return

    const accountKey = activeAccountKey.value
    if (
      hydrated.value
      && hydratedAccountKey.value === accountKey
      && hydratedCloudSyncEnabled.value === isCloudSyncEnabled.value
    ) return

    autoSyncReady.value = false
    hydrating.value = true
    hydrated.value = false
    let localSnapshotParsed = parseSnapshotState(buildLocalSnapshot())

    try {
      logSyncDebug('loadState: initialize current snapshot', {
        updatedAt: localSnapshotParsed.updatedAt
      })

      hydratedSnapshotWasPristine.value = isPristineState(localSnapshotParsed.state)
      store.value = localSnapshotParsed.state
      selectedCurrency.value = localSnapshotParsed.selectedCurrency
      currencySupport.value = localSnapshotParsed.currencySupport
      lastSyncSource.value = 'cloud'
      syncError.value = ''

      hydratedAccountKey.value = accountKey
      hydrated.value = true
      initialHydratedSignature.value = buildLocalSnapshotSignature()
      await nextTick()
    }
    finally {
      hydrating.value = false
      autoSyncReady.value = true
    }

    await hydrateTransactionsFromDatabase(localSnapshotParsed.state.transactions)

    if (!isCloudSyncEnabled.value) {
      syncError.value = ''
      syncStatus.value = 'waiting'
      syncProgress.value = 0
      return
    }

    if (!isOnline.value) {
      syncError.value = ''
      syncStatus.value = 'offline'
      syncProgress.value = 0
      return
    }

    void refreshCloudState({ force: true })
  }

  watch(
    [authReady, activeAccountIdentifier, isCloudSyncEnabled],
    () => {
      void loadState()
    },
    { immediate: true }
  )

  watch(
    store,
    () => {
      saveState()
    },
    { deep: true }
  )

  watch(
    isOnline,
    (online) => {
      if (!autoSyncReady.value) {
        if (!online) {
          syncStatus.value = 'offline'
          syncProgress.value = 0
        }
        return
      }

      if (!online) {
        syncStatus.value = 'offline'
        syncProgress.value = 0
        return
      }

      if (!isCloudSyncEnabled.value) {
        syncStatus.value = 'waiting'
        syncProgress.value = 0
        return
      }

      if (online && hydrated.value) {
        void refreshCloudState({ force: true })
      }
    },
    { immediate: false }
  )

  watch(
    selectedCurrency,
    () => {
      saveState()
    },
    { flush: 'post' }
  )

  watch(
    currencySupport,
    () => {
      if (!currencySupport.value[selectedCurrency.value]) {
        selectedCurrency.value = enabledCurrencyOptions.value[0]?.value ?? 'LAK'
      }

      saveState()
    },
    { deep: true, flush: 'post' }
  )

  const handlePageHide = () => {
    flushSnapshotOnUnload()
  }

  const handleVisibilityChange = () => {
    if (document.visibilityState === 'hidden') {
      flushSnapshotOnUnload()
      return
    }

    if (document.visibilityState === 'visible' && autoSyncReady.value && isCloudSyncEnabled.value && hydrated.value) {
      void refreshCloudState({ force: true })
    }
  }

  const handleFocus = () => {
    if (!autoSyncReady.value || !isCloudSyncEnabled.value || !hydrated.value) return
    void refreshCloudState({ force: true })
  }

  onMounted(() => {
    if (!import.meta.client) return

    window.addEventListener('pagehide', handlePageHide)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)
  })

  onBeforeUnmount(() => {
    if (!import.meta.client) return

    window.removeEventListener('pagehide', handlePageHide)
    document.removeEventListener('visibilitychange', handleVisibilityChange)
    window.removeEventListener('focus', handleFocus)
  })

  const transactions = computed(() => [...store.value.transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()))
  const wallets = computed(() => sortWalletsByPriority(store.value.wallets, store.value.walletOrder ?? [], store.value.pinnedWalletKeys ?? []))
  const walletMap = computed<Record<string, Wallet>>(() => Object.fromEntries(wallets.value.map(wallet => [wallet.id, wallet])))
  const recentTransactions = computed(() => transactions.value.slice(0, 5))
  const monthKey = currentMonthKey()
  const currentMonthTransactions = computed(() => transactions.value.filter(transaction => transaction.date.startsWith(monthKey)))
  const selectedCurrencyWallets = computed(() => wallets.value.filter(wallet => wallet.currency === selectedCurrency.value))
  const totalBalance = computed(() => selectedCurrencyWallets.value.reduce((sum, wallet) => sum + wallet.balance, 0))
  const totalIncome = computed(() => currentMonthTransactions.value.filter(transaction => transaction.type === 'income' && transaction.currency === selectedCurrency.value).reduce((sum, transaction) => sum + transaction.amount, 0))
  const totalExpense = computed(() => currentMonthTransactions.value.filter(transaction => transaction.type === 'expense' && transaction.currency === selectedCurrency.value).reduce((sum, transaction) => sum + transaction.amount, 0))
  const totalNet = computed(() => totalIncome.value - totalExpense.value)

  const enabledCurrencyOptions = computed(() => currencyOptions.filter(option => currencySupport.value[option.value]))

  const currencyBalances = computed(() => enabledCurrencyOptions.value.map(option => ({
    currency: option.value,
    balance: wallets.value.filter(wallet => wallet.currency === option.value).reduce((sum, wallet) => sum + wallet.balance, 0)
  })))

  const transactionTypeCounts = computed(() => typeOptions.map(option => ({
    type: option.value,
    count: transactions.value.filter(transaction => transaction.type === option.value).length
  })))

  function getWallet(walletId: string) {
    return walletMap.value[walletId]
  }

  function walletEntries() {
    const order = store.value.walletOrder ?? []
    const pinned = new Set(store.value.pinnedWalletKeys ?? [])

    return wallets.value.map(wallet => {
      const key = customWalletKey(wallet.id)
      return {
        ...wallet,
        key,
        pinned: pinned.has(key)
      }
    }).sort((a, b) => {
      const pinA = a.pinned ? 0 : 1
      const pinB = b.pinned ? 0 : 1
      if (pinA !== pinB) return pinA - pinB

      const orderA = order.indexOf(a.key)
      const orderB = order.indexOf(b.key)
      const normalizedA = orderA === -1 ? Number.MAX_SAFE_INTEGER : orderA
      const normalizedB = orderB === -1 ? Number.MAX_SAFE_INTEGER : orderB

      if (normalizedA !== normalizedB) return normalizedA - normalizedB

      return a.name.localeCompare(b.name)
    })
  }

  function getTransaction(transactionId: string) {
    return store.value.transactions.find(transaction => transaction.id === transactionId)
  }

  function formatCurrency(amount: number, currency: CurrencyCode, signed = false) {
    const formatter = currencyFormatters[currency]
    const absoluteValue = formatter.format(Math.abs(amount))
    const value = `${currencySymbols[currency]} ${absoluteValue}`

    if (!signed) return value
    return `${amount >= 0 ? '+' : '-'}${value}`
  }

  function formatCurrencyOrDash(amount: number, currency: CurrencyCode, hasActivity: boolean, signed = false) {
    if (amount === 0) return formatCurrency(0, currency)

    return formatCurrency(amount, currency, signed)
  }

  function hasWalletTransactions(walletId: string) {
    return transactions.value.some(transaction => transaction.walletId === walletId || transaction.toWalletId === walletId)
  }

  function hasCurrencyTransactions(currency: CurrencyCode) {
    return transactions.value.some(transaction => transaction.currency === currency)
  }

  function formatLaoDate(value: Date, includeYear = true) {
    const weekdayNames = [
      'ວັນອາທິດ',
      'ວັນຈັນ',
      'ວັນອັງຄານ',
      'ວັນພຸດ',
      'ວັນພະຫັດ',
      'ວັນສຸກ',
      'ວັນເສົາ'
    ]
    const monthNames = [
      'ມັງກອນ',
      'ກຸມພາ',
      'ມີນາ',
      'ເມສາ',
      'ພຶດສະພາ',
      'ມິຖຸນາ',
      'ກໍລະກົດ',
      'ສິງຫາ',
      'ກັນຍາ',
      'ຕຸລາ',
      'ພະຈິກ',
      'ທັນວາ'
    ]

    const weekday = weekdayNames[value.getDay()]
    const day = value.getDate()
    const month = monthNames[value.getMonth()]

    return includeYear
      ? `${weekday}, ${day} ${month} ${value.getFullYear()}`
      : `${weekday}, ${day} ${month}`
  }

  function formatDate(date: string) {
    const value = new Date(date)
    if (selectedLanguage.value === 'lo') {
      return formatLaoDate(value)
    }

    return value.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  function formatDateGroup(date: string) {
    const value = new Date(date)
    const today = new Date()
    const diffDays = Math.round((today.setHours(0, 0, 0, 0) - value.setHours(0, 0, 0, 0)) / 86400000)

    if (diffDays === 0) return selectedLanguage.value === 'lo' ? 'ມື້ນີ້' : 'Today'
    if (diffDays === 1) return selectedLanguage.value === 'lo' ? 'ວານນີ້' : 'Yesterday'

    if (selectedLanguage.value === 'lo') {
      return formatLaoDate(value, false)
    }

    return value.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    })
  }

  function typeLabel(type: TransactionType) {
    return localizedTypeLabel(type, selectedLanguage.value)
  }

  function typeIcon(type: TransactionType) {
    return typeMeta[type].icon
  }

  function typeTint(type: TransactionType) {
    return typeMeta[type].tint
  }

  function categoryOptionsFor(type: TransactionType) {
    if (type === 'income') {
      const entries = categoryEntriesFor('income')
      return entries.filter(category => category.enabled !== false).map(category => category.name)
    }
    if (type === 'expense') {
      const entries = categoryEntriesFor('expense')
      return entries.filter(category => category.enabled !== false).map(category => category.name)
    }
    if (type === 'move') return moveCategories
    return loanCategories
  }

  function categoryEntriesFor(type: CategoryType) {
    const defaults = defaultCategoryDefinitions[type].map(category => ({
      id: `default-${type}-${category.name.toLowerCase().replace(/\s+/g, '-')}`,
      type,
      name: category.name,
      emoji: category.emoji,
      color: category.color,
      isDefault: true,
      enabled: !store.value.disabledDefaultCategories.includes(defaultCategoryKey(type, category.name)),
      key: defaultCategoryKey(type, category.name),
      pinned: (store.value.pinnedCategoryKeys[type] ?? []).includes(defaultCategoryKey(type, category.name)),
      count: transactions.value.filter(transaction => transaction.type === type && transaction.category === category.name).length
    }))

    const custom = store.value.categories
      .filter(category => category.type === type)
      .slice()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map(category => ({
        ...category,
        isDefault: false,
        enabled: category.enabled !== false,
        key: customCategoryKey(category.id),
        pinned: (store.value.pinnedCategoryKeys[type] ?? []).includes(customCategoryKey(category.id)),
        count: transactions.value.filter(transaction => transaction.type === type && transaction.category === category.name).length
      }))

    const order = store.value.categoryOrder[type] ?? []
    const pinned = new Set(store.value.pinnedCategoryKeys[type] ?? [])
    const entries = [...custom, ...defaults]

    return entries.sort((a, b) => {
      const pinA = pinned.has(a.key) ? 0 : 1
      const pinB = pinned.has(b.key) ? 0 : 1
      if (pinA !== pinB) return pinA - pinB

      const orderA = order.indexOf(a.key)
      const orderB = order.indexOf(b.key)
      const normalizedA = orderA === -1 ? Number.MAX_SAFE_INTEGER : orderA
      const normalizedB = orderB === -1 ? Number.MAX_SAFE_INTEGER : orderB

      if (normalizedA !== normalizedB) return normalizedA - normalizedB

      return a.name.localeCompare(b.name)
    })
  }

  function companyEntries() {
    const defaults = defaultCompanyDefinitions.map(company => ({
      id: `default-company-${company.name.toLowerCase().replace(/\s+/g, '-')}`,
      name: company.name,
      emoji: company.emoji,
      color: company.color,
      isDefault: true,
      enabled: !store.value.disabledDefaultCompanies.includes(defaultCompanyKey(company.name)),
      key: defaultCompanyKey(company.name),
      pinned: (store.value.pinnedCompanyKeys ?? []).includes(defaultCompanyKey(company.name)),
      count: transactions.value.filter(transaction => transaction.company === company.name).length
    }))

    const custom = store.value.companies
      .slice()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map(company => ({
        ...company,
        isDefault: false,
        enabled: company.enabled !== false,
        key: customCompanyKey(company.id),
        pinned: (store.value.pinnedCompanyKeys ?? []).includes(customCompanyKey(company.id)),
        count: transactions.value.filter(transaction => transaction.company === company.name).length
      }))

    const order = store.value.companyOrder ?? []
    const pinned = new Set(store.value.pinnedCompanyKeys ?? [])
    const entries = [...custom, ...defaults]

    return entries.sort((a, b) => {
      const pinA = pinned.has(a.key) ? 0 : 1
      const pinB = pinned.has(b.key) ? 0 : 1
      if (pinA !== pinB) return pinA - pinB

      const orderA = order.indexOf(a.key)
      const orderB = order.indexOf(b.key)
      const normalizedA = orderA === -1 ? Number.MAX_SAFE_INTEGER : orderA
      const normalizedB = orderB === -1 ? Number.MAX_SAFE_INTEGER : orderB

      if (normalizedA !== normalizedB) return normalizedA - normalizedB

      return a.name.localeCompare(b.name)
    })
  }

  const companyOptions = computed(() => companyEntries().filter(company => company.enabled !== false).map(company => company.name))

function addCategory(payload: { type: CategoryType; name: string; emoji?: string; color?: WalletColor }) {
  if (!canEditMoneyData.value) return false
  const name = payload.name.trim()
  if (!name) return false
  const now = new Date().toISOString()

    const normalizedType = payload.type === 'expense' ? 'expense' : 'income'
    const exists = [
      ...defaultCategoryDefinitions[normalizedType].map(category => category.name),
      ...store.value.categories.filter(category => category.type === normalizedType).map(category => category.name)
    ].some(category => category.toLowerCase() === name.toLowerCase())
    if (exists) return false

    store.value.categories = [
      {
        id: `category-${crypto.randomUUID()}`,
        type: normalizedType,
        name,
        emoji: payload.emoji?.trim() || '🏷️',
        color: payload.color ?? 'sky',
        enabled: true,
        createdAt: now,
        updatedAt: now
      },
      ...store.value.categories
    ]

    const nextCustomKey = customCategoryKey(store.value.categories[0].id)
    const nextOrder = [nextCustomKey, ...(store.value.categoryOrder[normalizedType] ?? []).filter(key => key !== nextCustomKey)]
    store.value.categoryOrder = {
      ...store.value.categoryOrder,
      [normalizedType]: nextOrder
    }

    store.value = recalculateBalances(cloneState(store.value))
    return true
  }

  function removeCategory(categoryId: string) {
    if (!canEditMoneyData.value) return
    store.value.categories = store.value.categories.filter(category => category.id !== categoryId)
    const customKey = customCategoryKey(categoryId)
    store.value.categoryOrder = {
      income: store.value.categoryOrder.income.filter(key => key !== customKey),
      expense: store.value.categoryOrder.expense.filter(key => key !== customKey)
    }
    store.value.pinnedCategoryKeys = {
      income: store.value.pinnedCategoryKeys.income.filter(key => key !== customKey),
      expense: store.value.pinnedCategoryKeys.expense.filter(key => key !== customKey)
    }
    store.value = recalculateBalances(cloneState(store.value))
  }

function updateCategory(categoryId: string, payload: { name: string; emoji?: string; color?: WalletColor }) {
  if (!canEditMoneyData.value) return false
  const current = store.value.categories.find(category => category.id === categoryId)
  if (!current) return false
  const now = new Date().toISOString()

    const nextName = payload.name.trim()
    if (!nextName) return false

    const exists = [
      ...defaultCategoryDefinitions[current.type].map(category => category.name),
      ...store.value.categories
        .filter(category => category.type === current.type && category.id !== categoryId)
        .map(category => category.name)
    ].some(category => category.toLowerCase() === nextName.toLowerCase())

    if (exists) return false

    const previousName = current.name

    store.value.categories = store.value.categories.map(category => (
      category.id === categoryId
        ? {
            ...category,
            name: nextName,
            emoji: payload.emoji?.trim() || category.emoji,
            color: payload.color ?? category.color,
            updatedAt: now
          }
        : category
    ))

    store.value.transactions = store.value.transactions.map(transaction => (
      transaction.category === previousName && transaction.type === current.type
        ? { ...transaction, category: nextName }
        : transaction
    ))

    store.value = recalculateBalances(cloneState(store.value))
    return true
  }

  function setDefaultCategoryEnabled(type: CategoryType, name: string, enabled: boolean) {
    if (!canEditMoneyData.value) return
    const key = defaultCategoryKey(type, name)
    const current = new Set(store.value.disabledDefaultCategories)

    if (enabled) {
      current.delete(key)
    }
    else {
      current.add(key)
    }

    store.value.disabledDefaultCategories = [...current]
    store.value = recalculateBalances(cloneState(store.value))
  }

  function setCustomCategoryEnabled(categoryId: string, enabled: boolean) {
    if (!canEditMoneyData.value) return
    store.value.categories = store.value.categories.map(category => (
      category.id === categoryId
        ? { ...category, enabled }
        : category
    ))
    store.value = recalculateBalances(cloneState(store.value))
  }

  function setCategoryPinned(type: CategoryType, key: string, pinned: boolean) {
    if (!canEditMoneyData.value) return
    const list = new Set(store.value.pinnedCategoryKeys[type] ?? [])
    if (pinned) {
      list.add(key)
    }
    else {
      list.delete(key)
    }

    store.value.pinnedCategoryKeys = {
      ...store.value.pinnedCategoryKeys,
      [type]: [...list]
    }
    store.value = recalculateBalances(cloneState(store.value))
  }

function addCompany(payload: { name: string; emoji?: string; color?: WalletColor }) {
  if (!canEditMoneyData.value) return false
  const name = payload.name.trim()
  if (!name) return false
  const now = new Date().toISOString()

    const exists = [
      ...defaultCompanyDefinitions.map(company => company.name),
      ...store.value.companies.map(company => company.name)
    ].some(company => company.toLowerCase() === name.toLowerCase())

    if (exists) return false

    store.value.companies = [
      {
        id: `company-${crypto.randomUUID()}`,
        name,
        emoji: payload.emoji?.trim() || '🏢',
        color: payload.color ?? 'sky',
        enabled: true,
        createdAt: now,
        updatedAt: now
      },
      ...store.value.companies
    ]

    const nextCustomKey = customCompanyKey(store.value.companies[0].id)
    const nextOrder = [nextCustomKey, ...(store.value.companyOrder ?? []).filter(key => key !== nextCustomKey)]
    store.value.companyOrder = nextOrder

    store.value = recalculateBalances(cloneState(store.value))
    return true
  }

function updateCompany(companyId: string, payload: { name: string; emoji?: string; color?: WalletColor }) {
  if (!canEditMoneyData.value) return false
  const current = store.value.companies.find(company => company.id === companyId)
  if (!current) return false
  const now = new Date().toISOString()

    const nextName = payload.name.trim()
    if (!nextName) return false

    const exists = [
      ...defaultCompanyDefinitions.map(company => company.name),
      ...store.value.companies
        .filter(company => company.id !== companyId)
        .map(company => company.name)
    ].some(company => company.toLowerCase() === nextName.toLowerCase())

    if (exists) return false

    const previousName = current.name

    store.value.companies = store.value.companies.map(company => (
      company.id === companyId
        ? {
            ...company,
            name: nextName,
            emoji: payload.emoji?.trim() || company.emoji,
            color: payload.color ?? company.color,
            updatedAt: now
          }
        : company
    ))

    store.value.transactions = store.value.transactions.map(transaction => (
      transaction.company === previousName
        ? { ...transaction, company: nextName }
        : transaction
    ))

    store.value = recalculateBalances(cloneState(store.value))
    return true
  }

  function removeCompany(companyId: string) {
    if (!canEditMoneyData.value) return
    store.value.companies = store.value.companies.filter(company => company.id !== companyId)
    const customKey = customCompanyKey(companyId)
    store.value.companyOrder = (store.value.companyOrder ?? []).filter(key => key !== customKey)
    store.value.pinnedCompanyKeys = (store.value.pinnedCompanyKeys ?? []).filter(key => key !== customKey)
    store.value = recalculateBalances(cloneState(store.value))
  }

  function setDefaultCompanyEnabled(name: string, enabled: boolean) {
    if (!canEditMoneyData.value) return
    const key = defaultCompanyKey(name)
    const current = new Set(store.value.disabledDefaultCompanies)

    if (enabled) {
      current.delete(key)
    }
    else {
      current.add(key)
    }

    store.value.disabledDefaultCompanies = [...current]
    store.value = recalculateBalances(cloneState(store.value))
  }

  function setCustomCompanyEnabled(companyId: string, enabled: boolean) {
    if (!canEditMoneyData.value) return
    store.value.companies = store.value.companies.map(company => (
      company.id === companyId
        ? { ...company, enabled }
        : company
    ))
    store.value = recalculateBalances(cloneState(store.value))
  }

  function setCompanyPinned(key: string, pinned: boolean) {
    if (!canEditMoneyData.value) return
    const list = new Set(store.value.pinnedCompanyKeys ?? [])
    if (pinned) {
      list.add(key)
    }
    else {
      list.delete(key)
    }

    store.value.pinnedCompanyKeys = [...list]
    store.value = recalculateBalances(cloneState(store.value))
  }

  function moveCompany(fromKey: string, toKey: string) {
    if (!canEditMoneyData.value) return
    if (fromKey === toKey) return

    const list = [...(store.value.companyOrder ?? [])]
    const fromIndex = list.indexOf(fromKey)
    const toIndex = list.indexOf(toKey)

    if (fromIndex < 0 || toIndex < 0) return

    list.splice(fromIndex, 1)
    list.splice(toIndex, 0, fromKey)

    store.value.companyOrder = list
    store.value = recalculateBalances(cloneState(store.value))
  }

  function moveCategory(type: CategoryType, fromKey: string, toKey: string) {
    if (!canEditMoneyData.value) return
    if (fromKey === toKey) return

    const list = [...(store.value.categoryOrder[type] ?? [])]
    const fromIndex = list.indexOf(fromKey)
    const toIndex = list.indexOf(toKey)

    if (fromIndex < 0 || toIndex < 0) return

    list.splice(fromIndex, 1)
    list.splice(toIndex, 0, fromKey)

    store.value.categoryOrder = {
      ...store.value.categoryOrder,
      [type]: list
    }
    store.value = recalculateBalances(cloneState(store.value))
  }

  function walletOptionsForCurrency(currency: CurrencyCode) {
    return wallets.value
      .filter(wallet => wallet.currency === currency)
      .map(wallet => ({
        label: `${wallet.emoji} ${wallet.name} (${wallet.currency})`,
        value: wallet.id
      }))
  }

  function groupTransactions(list: Transaction[]) {
    const groups = new Map<string, Transaction[]>()

    list.forEach(transaction => {
      const key = transaction.date
      if (!groups.has(key)) {
        groups.set(key, [])
      }

      groups.get(key)!.push(transaction)
    })

    return [...groups.entries()].map(([date, items]) => ({
      date,
      label: formatDateGroup(date),
      items
    }))
  }

  function filterTransactions(filters: {
    search?: string
    type?: TransactionType | 'all'
    walletId?: string | 'all'
    currency?: CurrencyCode | 'all'
    from?: string
    to?: string
  }) {
    const search = filters.search?.trim().toLowerCase() ?? ''
    return transactions.value
      .filter((transaction) => {
      const matchSearch = !search || [transaction.note, transaction.category, transaction.counterparty, typeLabel(transaction.type)]
        .concat(transaction.company ?? [])
        .filter(Boolean)
        .some(value => value!.toLowerCase().includes(search))
      const matchType = !filters.type || filters.type === 'all' || transaction.type === filters.type
      const matchWallet = !filters.walletId || filters.walletId === 'all' || matchesWallet(transaction, filters.walletId)
      const matchCurrency = !filters.currency || filters.currency === 'all' || matchesCurrency(transaction, filters.currency)
      const matchDate = matchesDateRange(transaction, filters.from, filters.to)

      return matchSearch && matchType && matchWallet && matchCurrency && matchDate
      })
      .sort((a, b) => {
        const createdDelta = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        if (createdDelta !== 0) return createdDelta

        const updatedDelta = new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        if (updatedDelta !== 0) return updatedDelta

        return new Date(b.date).getTime() - new Date(a.date).getTime()
      })
  }

  async function persistSnapshotAfterMutation() {
    if (!import.meta.client || !hydrated.value || hydrating.value || !autoSyncReady.value) return

    saveState()
  }

  function applySingleTransaction(transaction: Transaction) {
    store.value.transactions = [
      transaction,
      ...store.value.transactions.filter(item => item.id !== transaction.id)
    ]
    store.value = recalculateBalances(cloneState(store.value))
  }

  async function addTransaction(payload: TransactionInput) {
    if (!canEditMoneyData.value) return
    const result = await $fetch<{ ok: boolean; transaction: Transaction }>('/api/transactions', {
      method: 'POST',
      body: payload
    })
    applySingleTransaction(result.transaction)
    await persistSnapshotAfterMutation()
  }

  async function updateTransaction(transactionId: string, payload: TransactionInput) {
    if (!canEditMoneyData.value) return
    const result = await $fetch<{ ok: boolean; transaction: Transaction }>(`/api/transactions/${transactionId}`, {
      method: 'PATCH',
      body: payload
    })
    applySingleTransaction(result.transaction)
    await persistSnapshotAfterMutation()
  }

  async function removeTransaction(transactionId: string) {
    if (!canEditMoneyData.value) return
    await $fetch<{ ok: boolean }>(`/api/transactions/${transactionId}`, {
      method: 'DELETE'
    })
    store.value.transactions = store.value.transactions.filter(transaction => transaction.id !== transactionId)
    store.value = recalculateBalances(cloneState(store.value))
    await persistSnapshotAfterMutation()
  }

function addWallet(payload: { name: string; currency: CurrencyCode; openingBalance: number; note?: string; color?: WalletColor; accent?: string; emoji?: string }) {
  if (!canEditMoneyData.value) return
  const color = payload.color ?? walletColorForAccent(payload.accent)
  const now = new Date().toISOString()
  const wallet: Wallet = {
    id: `wallet-${crypto.randomUUID()}`,
    name: payload.name.trim(),
    currency: payload.currency,
    openingBalance: Number(payload.openingBalance),
    balance: Number(payload.openingBalance),
    note: payload.note?.trim(),
    color,
    accent: walletAccentForColor(color),
    emoji: payload.emoji ?? '💳',
    updatedAt: now
  }

    store.value.wallets = [wallet, ...store.value.wallets]
    const newKey = customWalletKey(wallet.id)
    store.value.walletOrder = [newKey, ...(store.value.walletOrder ?? []).filter(key => key !== newKey)]
    store.value = recalculateBalances(cloneState(store.value))
  }

  function updateWallet(walletId: string, payload: Partial<Wallet>) {
    if (!canEditMoneyData.value) return
    const now = new Date().toISOString()
    store.value.wallets = store.value.wallets.map((wallet) => {
      if (wallet.id !== walletId) return wallet

      const color = payload.color ?? wallet.color ?? walletColorForAccent(payload.accent ?? wallet.accent)
      return {
        ...wallet,
        ...payload,
        color,
        accent: walletAccentForColor(color),
        updatedAt: now
      }
    })
    store.value = recalculateBalances(cloneState(store.value))
  }

  function removeWallet(walletId: string) {
    if (!canEditMoneyData.value) return
    store.value.wallets = store.value.wallets.filter(wallet => wallet.id !== walletId)
    store.value.transactions = store.value.transactions.filter(
      transaction => transaction.walletId !== walletId && transaction.toWalletId !== walletId
    )
    const customKey = customWalletKey(walletId)
    store.value.walletOrder = (store.value.walletOrder ?? []).filter(key => key !== customKey)
    store.value.pinnedWalletKeys = (store.value.pinnedWalletKeys ?? []).filter(key => key !== customKey)
    store.value = recalculateBalances(cloneState(store.value))
  }

  function setWalletPinned(walletId: string, pinned: boolean) {
    if (!canEditMoneyData.value) return
    const key = customWalletKey(walletId)
    const list = new Set(store.value.pinnedWalletKeys ?? [])

    if (pinned) {
      list.add(key)
    }
    else {
      list.delete(key)
    }

    store.value.pinnedWalletKeys = [...list]
    store.value = recalculateBalances(cloneState(store.value))
  }

  function moveWallet(fromKey: string, toKey: string) {
    if (!canEditMoneyData.value) return
    if (fromKey === toKey) return

    const list = [...(store.value.walletOrder ?? [])]
    const fromIndex = list.indexOf(fromKey)
    const toIndex = list.indexOf(toKey)

    if (fromIndex < 0 || toIndex < 0) return

    list.splice(fromIndex, 1)
    list.splice(toIndex, 0, fromKey)

    store.value.walletOrder = list
    store.value = recalculateBalances(cloneState(store.value))
  }

  function walletMonthTotals(walletId: string) {
    const wallet = getWallet(walletId)
    const walletTransactions = transactions.value.filter(transaction => transaction.walletId === walletId || transaction.toWalletId === walletId)
    const income = walletTransactions
      .filter(transaction => transaction.type === 'income' || (transaction.type === 'loan' && transaction.loanDirection === 'received'))
      .reduce((sum, transaction) => sum + transaction.amount, 0)
      + walletTransactions
        .filter(transaction => transaction.type === 'move' && transaction.toWalletId === walletId)
        .reduce((sum, transaction) => {
          const source = getWallet(transaction.walletId)
          const target = getWallet(walletId)
          return sum + moveDestinationAmount(transaction, source, target)
        }, 0)

    const expense = walletTransactions
      .filter(transaction => transaction.type === 'expense' || (transaction.type === 'loan' && transaction.loanDirection !== 'received'))
      .reduce((sum, transaction) => sum + transaction.amount, 0)
      + walletTransactions
        .filter(transaction => transaction.type === 'move' && transaction.walletId === walletId)
        .reduce((sum, transaction) => sum + transaction.amount, 0)

    return {
      wallet,
      income,
      expense,
      net: income - expense,
      transactions: walletTransactions
    }
  }

  function monthlySeries(currency: CurrencyCode, months = 6) {
    const range = createDateRange(months)

    return range.map(({ key, label }) => {
      const items = transactions.value.filter(transaction => transaction.date.startsWith(key) && transaction.currency === currency)
      const income = items.filter(transaction => transaction.type === 'income' || (transaction.type === 'loan' && transaction.loanDirection === 'received'))
        .reduce((sum, transaction) => sum + transaction.amount, 0)
      const expense = items.filter(transaction => transaction.type === 'expense' || (transaction.type === 'loan' && transaction.loanDirection !== 'received'))
        .reduce((sum, transaction) => sum + transaction.amount, 0)

      return {
        key,
        label,
        income,
        expense,
        net: income - expense
      }
    })
  }

  function categorySeries(currency: CurrencyCode) {
    const items = transactions.value.filter(transaction => transaction.currency === currency && (transaction.type === 'expense' || (transaction.type === 'loan' && transaction.loanDirection !== 'received')))
    const grouped = new Map<string, number>()

    items.forEach((transaction) => {
      grouped.set(transaction.category, (grouped.get(transaction.category) ?? 0) + transaction.amount)
    })

    return [...grouped.entries()]
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
  }

  function walletSeries(currency: CurrencyCode) {
    return wallets.value
      .filter(wallet => wallet.currency === currency)
      .map(wallet => ({
        label: wallet.name,
        value: wallet.balance,
        wallet
      }))
      .sort((a, b) => b.value - a.value)
  }

  function currencySeries() {
    return currencyBalances.value.map(item => ({ ...item }))
  }

  function isCurrencyEnabled(currency: CurrencyCode) {
    return currencySupport.value[currency]
  }

  function setCurrencyEnabled(currency: CurrencyCode, enabled: boolean) {
    if (!canEditMoneyData.value) return
    const next = normalizeCurrencySupport({
      ...currencySupport.value,
      [currency]: enabled
    })

    if (!enabled && Object.values(next).every(value => !value)) {
      return
    }

    currencySupport.value = next
  }

  async function clearLocalAccountState() {
    clearPendingSaveTimers()
  }

  async function syncCloudNow() {
    clearPendingSaveTimers()
    return await refreshCloudState({ force: true })
  }

  function toggleCurrencyEnabled(currency: CurrencyCode) {
    if (!canEditMoneyData.value) return
    if (currencySupport.value[currency] && enabledCurrencyOptions.value.length <= 1) {
      return
    }

    setCurrencyEnabled(currency, !currencySupport.value[currency])
  }

  return {
    store,
    hydrated,
    transactionsHydrated,
    wallets,
    transactions,
    walletMap,
    selectedCurrency,
    currencySupport,
    recentTransactions,
    currentMonthTransactions,
    totalBalance,
    totalIncome,
    totalExpense,
    totalNet,
    enabledCurrencyOptions,
    currencyBalances,
    transactionTypeCounts,
    getWallet,
    walletEntries,
    getTransaction,
    formatCurrency,
    formatCurrencyOrDash,
    hasWalletTransactions,
    hasCurrencyTransactions,
    formatDate,
    formatDateGroup,
    typeLabel,
    typeIcon,
    typeTint,
    categoryOptionsFor,
    categoryEntriesFor,
    companyEntries,
    companyOptions,
    addCategory,
    removeCategory,
    updateCategory,
    addCompany,
    updateCompany,
    removeCompany,
    walletOptionsForCurrency,
    groupTransactions,
    filterTransactions,
    addTransaction,
    updateTransaction,
    removeTransaction,
    addWallet,
    updateWallet,
    removeWallet,
    setWalletPinned,
    moveWallet,
    walletMonthTotals,
    monthlySeries,
    categorySeries,
    walletSeries,
    currencySeries,
    calculateMoveDestinationAmount,
    defaultCategoriesEnabled,
    isCloudSyncEnabled,
    canEditMoneyData,
    syncStatus,
    lastSyncedAt,
    lastSyncSource,
    syncProgress,
    syncError,
    syncDebugCloudSnapshot,
    syncDebugLoading,
    syncDebugError,
    isOnline,
    refreshCloudState,
    refreshSyncDebugData,
    isCurrencyEnabled,
    setCurrencyEnabled,
    setDefaultCategoryEnabled,
    setCustomCategoryEnabled,
    setCategoryPinned,
    setDefaultCompanyEnabled,
    setCustomCompanyEnabled,
    setCompanyPinned,
    moveCategory,
    moveCompany,
    createMoneyNoteBackupFile: () => createMoneyNoteBackupFile({
      store: store.value,
      selectedCurrency: selectedCurrency.value,
      currencySupport: currencySupport.value
    }),
    importMoneyNoteBackupFile,
    clearLocalAccountState,
    syncCloudNow,
    toggleCurrencyEnabled,
    walletColorOptions
  }
}
