import { computed, watch } from 'vue'

export type CurrencyCode = 'LAK' | 'THB' | 'USD'
export type TransactionType = 'income' | 'expense' | 'move' | 'loan'
export type CategoryType = 'income' | 'expense'
export type LoanDirection = 'given' | 'received'
export type WalletColor = 'sky' | 'emerald' | 'indigo' | 'amber' | 'rose' | 'violet' | 'fuchsia' | 'slate'
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

const SELECTED_CURRENCY_STORAGE_KEY = 'money-note-selected-currency-v1'

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

function isBuiltInCompany(company: { id?: string; name?: string | null }) {
  const normalizedName = company.name?.trim().toLowerCase() ?? ''
  return company.id?.startsWith('company-default-') || defaultCompanyDefinitions.some(item => item.name.toLowerCase() === normalizedName)
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

function defaultPreferencePayload(currencySupport: Partial<Record<CurrencyCode, boolean>> = defaultCurrencySupport()) {
  return {
    walletOrder: [] as string[],
    pinnedWalletKeys: [] as string[],
    disabledDefaultCategories: [] as string[],
    disabledDefaultCompanies: [] as string[],
    categoryOrder: {
      income: [] as string[],
      expense: [] as string[]
    },
    pinnedCategoryKeys: {
      income: [] as string[],
      expense: [] as string[]
    },
    companyOrder: [] as string[],
    pinnedCompanyKeys: [] as string[],
    currencySupport: normalizeCurrencySupport(currencySupport)
  }
}

function normalizeSelectedCurrency(value: unknown): CurrencyCode {
  return currencyOptions.some(option => option.value === value)
    ? value as CurrencyCode
    : 'LAK'
}

function readSelectedCurrencyPreference() {
  if (!import.meta.client) return 'LAK' as CurrencyCode

  try {
    return normalizeSelectedCurrency(window.localStorage.getItem(SELECTED_CURRENCY_STORAGE_KEY))
  }
  catch {
    return 'LAK'
  }
}

function persistSelectedCurrencyPreference(value: CurrencyCode) {
  if (!import.meta.client) return

  try {
    window.localStorage.setItem(SELECTED_CURRENCY_STORAGE_KEY, value)
  }
  catch {
    // Ignore storage failures and keep the in-memory selection.
  }
}

function clearSelectedCurrencyPreference() {
  if (!import.meta.client) return

  try {
    window.localStorage.removeItem(SELECTED_CURRENCY_STORAGE_KEY)
  }
  catch {
    // Ignore storage failures and continue clearing in-memory state.
  }
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
    ? state.companies
      .map(company => normalizeCompany(company as Partial<CompanyItem> & { id: string }))
      .filter(company => !isBuiltInCompany(company))
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
    companies: [],
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
  const hydrating = useState('money-note-hydrating', () => false)
  const { selectedLanguage } = useAppLanguage()
  const { authReady, sessionProfile } = useDeviceAuth()
  const { isOnline } = useConnectivity()
  const defaultCategoriesEnabled = computed(() => store.value.disabledDefaultCategories.length === 0)

  const activeAccountIdentifier = computed(() => sessionProfile.value?.identifier ?? '')
  const activeAccountKey = computed(() => normalizeAccountKey(activeAccountIdentifier.value))
  const isCloudSyncEnabled = computed(() => (sessionProfile.value?.plan ?? 'free') === 'pro')
  const canEditMoneyData = computed(() => isCloudSyncEnabled.value)

  function currentPreferencesPayload() {
    return {
      walletOrder: [...(store.value.walletOrder ?? [])],
      pinnedWalletKeys: [...(store.value.pinnedWalletKeys ?? [])],
      disabledDefaultCategories: [...store.value.disabledDefaultCategories],
      disabledDefaultCompanies: [...store.value.disabledDefaultCompanies],
      categoryOrder: {
        income: [...(store.value.categoryOrder?.income ?? [])],
        expense: [...(store.value.categoryOrder?.expense ?? [])]
      },
      pinnedCategoryKeys: {
        income: [...(store.value.pinnedCategoryKeys?.income ?? [])],
        expense: [...(store.value.pinnedCategoryKeys?.expense ?? [])]
      },
      companyOrder: [...(store.value.companyOrder ?? [])],
      pinnedCompanyKeys: [...(store.value.pinnedCompanyKeys ?? [])],
      currencySupport: normalizeCurrencySupport(currencySupport.value)
    }
  }

  function applyPreferencesPayload(payload: ReturnType<typeof currentPreferencesPayload>) {
    store.value = recalculateBalances({
      ...cloneState(store.value),
      walletOrder: [...payload.walletOrder],
      pinnedWalletKeys: [...payload.pinnedWalletKeys],
      disabledDefaultCategories: [...payload.disabledDefaultCategories],
      disabledDefaultCompanies: [...payload.disabledDefaultCompanies],
      categoryOrder: {
        income: [...payload.categoryOrder.income],
        expense: [...payload.categoryOrder.expense]
      },
      pinnedCategoryKeys: {
        income: [...payload.pinnedCategoryKeys.income],
        expense: [...payload.pinnedCategoryKeys.expense]
      },
      companyOrder: [...payload.companyOrder],
      pinnedCompanyKeys: [...payload.pinnedCompanyKeys]
    })
    currencySupport.value = normalizeCurrencySupport(payload.currencySupport)
  }

  function fallbackPreferencesPayload(
    fallbackState: MoneyNoteState,
    fallbackCurrencySupport: Record<CurrencyCode, boolean>
  ) {
    return {
      walletOrder: [...(fallbackState.walletOrder ?? [])],
      pinnedWalletKeys: [...(fallbackState.pinnedWalletKeys ?? [])],
      disabledDefaultCategories: [...fallbackState.disabledDefaultCategories],
      disabledDefaultCompanies: [...fallbackState.disabledDefaultCompanies],
      categoryOrder: {
        income: [...(fallbackState.categoryOrder?.income ?? [])],
        expense: [...(fallbackState.categoryOrder?.expense ?? [])]
      },
      pinnedCategoryKeys: {
        income: [...(fallbackState.pinnedCategoryKeys?.income ?? [])],
        expense: [...(fallbackState.pinnedCategoryKeys?.expense ?? [])]
      },
      companyOrder: [...(fallbackState.companyOrder ?? [])],
      pinnedCompanyKeys: [...(fallbackState.pinnedCompanyKeys ?? [])],
      currencySupport: normalizeCurrencySupport(fallbackCurrencySupport)
    }
  }

  function hasNonDefaultPreferences(payload: ReturnType<typeof currentPreferencesPayload>) {
    const defaults = defaultPreferencePayload()
    return JSON.stringify(payload) !== JSON.stringify(defaults)
  }

  async function persistPreferences(payload = currentPreferencesPayload()) {
    const result = await $fetch<{
      ok: boolean
      preferences: ReturnType<typeof currentPreferencesPayload>
    }>('/api/preferences', {
      method: 'PUT',
      body: {
        preferences: payload
      }
    })

    applyPreferencesPayload(result.preferences)
    await persistSnapshotAfterMutation()
    return result.preferences
  }

  async function hydratePreferencesFromDatabase(
    fallbackState: MoneyNoteState,
    fallbackCurrencySupport: Record<CurrencyCode, boolean>
  ) {
    if (!import.meta.client || !authReady.value) {
      return false
    }

    try {
      const result = await $fetch<{
        ok: boolean
        preferences: ReturnType<typeof currentPreferencesPayload> | null
      }>('/api/preferences')

      if (!result.preferences) {
        const fallbackPayload = fallbackPreferencesPayload(fallbackState, fallbackCurrencySupport)
        if (hasNonDefaultPreferences(fallbackPayload)) {
          const imported = await persistPreferences(fallbackPayload)
          applyPreferencesPayload(imported)
          return true
        }

        applyPreferencesPayload(defaultPreferencePayload())
        return true
      }

      applyPreferencesPayload(result.preferences)
      return true
    }
    catch (error) {
      console.error('[money-note] preferences database hydrate failed', error)
      return false
    }
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

  async function importMoneyNoteBackupFile(input: unknown) {
    if (!import.meta.client || !authReady.value) return

    assertMoneyMutationReady()
    const backup = parseMoneyNoteBackupFile(input)
    const importedState = normalizeState(backup.data.state)
    const importedCurrencySupport = normalizeCurrencySupport(backup.data.currencySupport)
    const importedCurrency = normalizeSelectedCurrency(backup.data.selectedCurrency)
    const previousState = cloneState(store.value)
    const previousCurrency = selectedCurrency.value
    const previousCurrencySupport = normalizeCurrencySupport(currencySupport.value)

    hydrating.value = true
    transactionsHydrated.value = false

    try {
      selectedCurrency.value = importedCurrency
      persistSelectedCurrencyPreference(importedCurrency)

      await $fetch('/api/money-data/import', {
        method: 'POST',
        body: {
          wallets: importedState.wallets,
          categories: importedState.categories,
          companies: importedState.companies
        }
      })
      await $fetch('/api/preferences', {
        method: 'PUT',
        body: {
          preferences: fallbackPreferencesPayload(importedState, importedCurrencySupport)
        }
      })
      await $fetch('/api/transactions/import', {
        method: 'POST',
        body: {
          transactions: importedState.transactions
        }
      })

      await hydratePreferencesFromDatabase(importedState, importedCurrencySupport)
      await hydrateStructuredDataFromDatabase(importedState)
      await hydrateTransactionsFromDatabase(importedState.transactions)
    }
    catch (error) {
      store.value = recalculateBalances(previousState)
      selectedCurrency.value = previousCurrency
      currencySupport.value = previousCurrencySupport
      persistSelectedCurrencyPreference(previousCurrency)
      console.error('[money-note] import database failed', error)
      throw error
    }
    finally {
      hydrated.value = true
      hydratedAccountKey.value = activeAccountKey.value
      hydrating.value = false
    }
  }

  function applyTransactionsFromDatabase(transactions: Transaction[]) {
    store.value = recalculateBalances({
      ...cloneState(store.value),
      transactions: transactions.map(transaction => ({ ...transaction }))
    })
  }

  function applyStructuredDataFromDatabase(payload: {
    wallets: Wallet[]
    categories: CategoryItem[]
    companies: CompanyItem[]
  }) {
    store.value = recalculateBalances({
      ...cloneState(store.value),
      wallets: payload.wallets.map(wallet => ({ ...wallet })),
      categories: payload.categories.map(category => ({ ...category })),
      companies: payload.companies
        .filter(company => !isBuiltInCompany(company))
        .map(company => ({ ...company }))
    })
  }

  async function hydrateStructuredDataFromDatabase(fallbackState: MoneyNoteState) {
    if (!import.meta.client || !authReady.value) {
      return false
    }

    try {
      const result = await $fetch<{ ok: boolean; wallets: Wallet[]; categories: CategoryItem[]; companies: CompanyItem[] }>('/api/money-data')
      const databaseWallets = Array.isArray(result.wallets) ? result.wallets : []
      const databaseCategories = Array.isArray(result.categories) ? result.categories : []
      const databaseCompanies = Array.isArray(result.companies) ? result.companies : []

      if (!databaseWallets.length && !databaseCategories.length && !databaseCompanies.length) {
        const fallbackCompanies = fallbackState.companies.filter(company => !isBuiltInCompany(company))
        const shouldImportFallback = Boolean(
          fallbackState.wallets.length
          || fallbackState.categories.length
          || fallbackCompanies.length
        )

        if (shouldImportFallback) {
          const imported = await $fetch<{ ok: boolean; wallets: Wallet[]; categories: CategoryItem[]; companies: CompanyItem[] }>('/api/money-data/import', {
            method: 'POST',
            body: {
              wallets: fallbackState.wallets,
              categories: fallbackState.categories,
              companies: fallbackCompanies
            }
          })

          applyStructuredDataFromDatabase({
            wallets: imported.wallets ?? [],
            categories: imported.categories ?? [],
            companies: imported.companies ?? []
          })
          return true
        }
      }

      applyStructuredDataFromDatabase({
        wallets: databaseWallets,
        categories: databaseCategories,
        companies: databaseCompanies
      })
      return true
    }
    catch (error) {
      console.error('[money-note] structured data database hydrate failed', error)
      return false
    }
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
    if (hydrated.value && hydratedAccountKey.value === accountKey) return

    hydrating.value = true
    hydrated.value = false
    transactionsHydrated.value = false

    try {
      const fallbackState = normalizeState(defaultState())
      const fallbackCurrency = readSelectedCurrencyPreference()
      const fallbackCurrencySupport = defaultCurrencySupport()

      store.value = recalculateBalances(fallbackState)
      selectedCurrency.value = fallbackCurrency
      currencySupport.value = fallbackCurrencySupport
      hydratedAccountKey.value = accountKey
      hydrated.value = true

      if (!isCloudSyncEnabled.value || !isOnline.value || accountKey === 'guest' || !activeAccountIdentifier.value.trim()) {
        transactionsHydrated.value = true
        return
      }

      await hydratePreferencesFromDatabase(fallbackState, fallbackCurrencySupport)
      await hydrateStructuredDataFromDatabase(fallbackState)
      await hydrateTransactionsFromDatabase([])
    }
    finally {
      hydrating.value = false
      if (!transactionsHydrated.value) {
        transactionsHydrated.value = true
      }
    }
  }

  watch(
    [authReady, activeAccountIdentifier, isCloudSyncEnabled],
    () => {
      void loadState()
    },
    { immediate: true }
  )

  watch(
    selectedCurrency,
    (value) => {
      persistSelectedCurrencyPreference(value)
    },
    { flush: 'post' }
  )

  watch(
    currencySupport,
    () => {
      if (!currencySupport.value[selectedCurrency.value]) {
        selectedCurrency.value = enabledCurrencyOptions.value[0]?.value ?? 'LAK'
      }
    },
    { deep: true, flush: 'post' }
  )

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

  function applySingleCategory(category: CategoryItem) {
    store.value.categories = [
      category,
      ...store.value.categories.filter(item => item.id !== category.id)
    ]

    const nextCustomKey = customCategoryKey(category.id)
    store.value.categoryOrder = {
      ...store.value.categoryOrder,
      [category.type]: [nextCustomKey, ...(store.value.categoryOrder[category.type] ?? []).filter(key => key !== nextCustomKey)]
    }
    store.value = recalculateBalances(cloneState(store.value))
  }

  async function addCategory(payload: { type: CategoryType; name: string; emoji?: string; color?: WalletColor }) {
    assertMoneyMutationReady()
    const result = await $fetch<{ ok: boolean; category: CategoryItem }>('/api/categories', {
      method: 'POST',
      body: {
        type: payload.type,
        name: payload.name,
        emoji: payload.emoji?.trim() || '🏷️',
        color: payload.color ?? 'sky'
      }
    })
    applySingleCategory(result.category)
    await persistSnapshotAfterMutation()
    return result.category
  }

  async function removeCategory(categoryId: string) {
    assertMoneyMutationReady()
    await $fetch<{ ok: boolean }>(`/api/categories/${categoryId}`, {
      method: 'DELETE'
    })
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
    await persistSnapshotAfterMutation()
  }

  async function updateCategory(categoryId: string, payload: { name: string; emoji?: string; color?: WalletColor }) {
    assertMoneyMutationReady()
    const current = store.value.categories.find(category => category.id === categoryId)
    if (!current) {
      throw new Error('Category not found')
    }

    const result = await $fetch<{ ok: boolean; category: CategoryItem }>(`/api/categories/${categoryId}`, {
      method: 'PATCH',
      body: {
        name: payload.name,
        emoji: payload.emoji?.trim() || current.emoji,
        color: payload.color ?? current.color
      }
    })

    const previousName = current.name
    store.value.categories = store.value.categories.map(category => (
      category.id === categoryId
        ? result.category
        : category
    ))
    store.value.transactions = store.value.transactions.map(transaction => (
      transaction.category === previousName && transaction.type === current.type
        ? { ...transaction, category: result.category.name }
        : transaction
    ))
    store.value = recalculateBalances(cloneState(store.value))
    await persistSnapshotAfterMutation()
    return result.category
  }

  async function setDefaultCategoryEnabled(type: CategoryType, name: string, enabled: boolean) {
    assertMoneyMutationReady()
    const key = defaultCategoryKey(type, name)
    const current = new Set(store.value.disabledDefaultCategories)

    if (enabled) {
      current.delete(key)
    }
    else {
      current.add(key)
    }

    await persistPreferences({
      ...currentPreferencesPayload(),
      disabledDefaultCategories: [...current]
    })
  }

  async function setCustomCategoryEnabled(categoryId: string, enabled: boolean) {
    assertMoneyMutationReady()
    const current = store.value.categories.find(category => category.id === categoryId)
    if (!current) {
      throw new Error('Category not found')
    }

    const result = await $fetch<{ ok: boolean; category: CategoryItem }>(`/api/categories/${categoryId}`, {
      method: 'PATCH',
      body: {
        name: current.name,
        emoji: current.emoji,
        color: current.color,
        enabled
      }
    })

    store.value.categories = store.value.categories.map(category => (
      category.id === categoryId
        ? result.category
        : category
    ))
    store.value = recalculateBalances(cloneState(store.value))
    await persistSnapshotAfterMutation()
  }

  async function setCategoryPinned(type: CategoryType, key: string, pinned: boolean) {
    assertMoneyMutationReady()
    const list = new Set(store.value.pinnedCategoryKeys[type] ?? [])
    if (pinned) {
      list.add(key)
    }
    else {
      list.delete(key)
    }

    await persistPreferences({
      ...currentPreferencesPayload(),
      pinnedCategoryKeys: {
        ...currentPreferencesPayload().pinnedCategoryKeys,
        [type]: [...list]
      }
    })
  }

  function applySingleCompany(company: CompanyItem) {
    store.value.companies = [
      company,
      ...store.value.companies.filter(item => item.id !== company.id)
    ]

    const nextCustomKey = customCompanyKey(company.id)
    store.value.companyOrder = [nextCustomKey, ...(store.value.companyOrder ?? []).filter(key => key !== nextCustomKey)]
    store.value = recalculateBalances(cloneState(store.value))
  }

  async function addCompany(payload: { name: string; emoji?: string; color?: WalletColor }) {
    assertMoneyMutationReady()
    const result = await $fetch<{ ok: boolean; company: CompanyItem }>('/api/companies', {
      method: 'POST',
      body: {
        name: payload.name,
        emoji: payload.emoji?.trim() || '🏢',
        color: payload.color ?? 'sky'
      }
    })
    applySingleCompany(result.company)
    await persistSnapshotAfterMutation()
    return result.company
  }

  async function updateCompany(companyId: string, payload: { name: string; emoji?: string; color?: WalletColor }) {
    assertMoneyMutationReady()
    const current = store.value.companies.find(company => company.id === companyId)
    if (!current) {
      throw new Error('Company not found')
    }

    const result = await $fetch<{ ok: boolean; company: CompanyItem }>(`/api/companies/${companyId}`, {
      method: 'PATCH',
      body: {
        name: payload.name,
        emoji: payload.emoji?.trim() || current.emoji,
        color: payload.color ?? current.color
      }
    })

    const previousName = current.name
    store.value.companies = store.value.companies.map(company => (
      company.id === companyId
        ? result.company
        : company
    ))
    store.value.transactions = store.value.transactions.map(transaction => (
      transaction.company === previousName
        ? { ...transaction, company: result.company.name }
        : transaction
    ))
    store.value = recalculateBalances(cloneState(store.value))
    await persistSnapshotAfterMutation()
    return result.company
  }

  async function removeCompany(companyId: string) {
    assertMoneyMutationReady()
    await $fetch<{ ok: boolean }>(`/api/companies/${companyId}`, {
      method: 'DELETE'
    })
    store.value.companies = store.value.companies.filter(company => company.id !== companyId)
    const customKey = customCompanyKey(companyId)
    store.value.companyOrder = (store.value.companyOrder ?? []).filter(key => key !== customKey)
    store.value.pinnedCompanyKeys = (store.value.pinnedCompanyKeys ?? []).filter(key => key !== customKey)
    store.value = recalculateBalances(cloneState(store.value))
    await persistSnapshotAfterMutation()
  }

  async function setDefaultCompanyEnabled(name: string, enabled: boolean) {
    assertMoneyMutationReady()
    const key = defaultCompanyKey(name)
    const current = new Set(store.value.disabledDefaultCompanies)

    if (enabled) {
      current.delete(key)
    }
    else {
      current.add(key)
    }

    await persistPreferences({
      ...currentPreferencesPayload(),
      disabledDefaultCompanies: [...current]
    })
  }

  async function setCustomCompanyEnabled(companyId: string, enabled: boolean) {
    assertMoneyMutationReady()
    const current = store.value.companies.find(company => company.id === companyId)
    if (!current) {
      throw new Error('Company not found')
    }

    const result = await $fetch<{ ok: boolean; company: CompanyItem }>(`/api/companies/${companyId}`, {
      method: 'PATCH',
      body: {
        name: current.name,
        emoji: current.emoji,
        color: current.color,
        enabled
      }
    })

    store.value.companies = store.value.companies.map(company => (
      company.id === companyId
        ? result.company
        : company
    ))
    store.value = recalculateBalances(cloneState(store.value))
    await persistSnapshotAfterMutation()
  }

  async function setCompanyPinned(key: string, pinned: boolean) {
    assertMoneyMutationReady()
    const list = new Set(store.value.pinnedCompanyKeys ?? [])
    if (pinned) {
      list.add(key)
    }
    else {
      list.delete(key)
    }

    await persistPreferences({
      ...currentPreferencesPayload(),
      pinnedCompanyKeys: [...list]
    })
  }

  async function moveCompany(fromKey: string, toKey: string) {
    assertMoneyMutationReady()
    if (fromKey === toKey) return

    const list = [...(store.value.companyOrder ?? [])]
    const fromIndex = list.indexOf(fromKey)
    const toIndex = list.indexOf(toKey)

    if (fromIndex < 0 || toIndex < 0) return

    list.splice(fromIndex, 1)
    list.splice(toIndex, 0, fromKey)

    await persistPreferences({
      ...currentPreferencesPayload(),
      companyOrder: list
    })
  }

  async function moveCategory(type: CategoryType, fromKey: string, toKey: string) {
    assertMoneyMutationReady()
    if (fromKey === toKey) return

    const list = [...(store.value.categoryOrder[type] ?? [])]
    const fromIndex = list.indexOf(fromKey)
    const toIndex = list.indexOf(toKey)

    if (fromIndex < 0 || toIndex < 0) return

    list.splice(fromIndex, 1)
    list.splice(toIndex, 0, fromKey)

    await persistPreferences({
      ...currentPreferencesPayload(),
      categoryOrder: {
        ...currentPreferencesPayload().categoryOrder,
        [type]: list
      }
    })
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
    persistSelectedCurrencyPreference(selectedCurrency.value)
  }

  function assertMoneyMutationReady() {
    if (!canEditMoneyData.value) {
      throw new Error('Pro required')
    }

    if (!isOnline.value) {
      throw new Error(selectedLanguage.value === 'lo'
        ? 'ຕ້ອງເຊື່ອມຕໍ່ອິນເຕີເນັດກ່ອນຈຶ່ງຈະບັນທຶກໄດ້'
        : 'Internet connection is required to save changes')
    }
  }

  function applySingleTransaction(transaction: Transaction) {
    store.value.transactions = [
      transaction,
      ...store.value.transactions.filter(item => item.id !== transaction.id)
    ]
    store.value = recalculateBalances(cloneState(store.value))
  }

  async function addTransaction(payload: TransactionInput) {
    assertMoneyMutationReady()
    const result = await $fetch<{ ok: boolean; transaction: Transaction }>('/api/transactions', {
      method: 'POST',
      body: payload
    })
    applySingleTransaction(result.transaction)
    await persistSnapshotAfterMutation()
  }

  async function updateTransaction(transactionId: string, payload: TransactionInput) {
    assertMoneyMutationReady()
    const result = await $fetch<{ ok: boolean; transaction: Transaction }>(`/api/transactions/${transactionId}`, {
      method: 'PATCH',
      body: payload
    })
    applySingleTransaction(result.transaction)
    await persistSnapshotAfterMutation()
  }

  async function removeTransaction(transactionId: string) {
    assertMoneyMutationReady()
    await $fetch<{ ok: boolean }>(`/api/transactions/${transactionId}`, {
      method: 'DELETE'
    })
    store.value.transactions = store.value.transactions.filter(transaction => transaction.id !== transactionId)
    store.value = recalculateBalances(cloneState(store.value))
    await persistSnapshotAfterMutation()
  }

  function applySingleWallet(wallet: Wallet) {
    store.value.wallets = [
      wallet,
      ...store.value.wallets.filter(item => item.id !== wallet.id)
    ]
    const newKey = customWalletKey(wallet.id)
    store.value.walletOrder = [newKey, ...(store.value.walletOrder ?? []).filter(key => key !== newKey)]
    store.value = recalculateBalances(cloneState(store.value))
  }

  async function addWallet(payload: { name: string; currency: CurrencyCode; openingBalance: number | string | null | undefined; note?: string; color?: WalletColor; accent?: string; emoji?: string }) {
    assertMoneyMutationReady()
    const color = payload.color ?? walletColorForAccent(payload.accent)
    const openingBalance = payload.openingBalance === '' || payload.openingBalance === null || payload.openingBalance === undefined
      ? 0
      : Number(payload.openingBalance)
    const result = await $fetch<{ ok: boolean; wallet: Wallet }>('/api/wallets', {
      method: 'POST',
      body: {
        name: payload.name,
        currency: payload.currency,
        openingBalance,
        note: payload.note,
        color,
        emoji: payload.emoji ?? '💳'
      }
    })
    applySingleWallet(result.wallet)
    await persistSnapshotAfterMutation()
    return result.wallet
  }

  async function updateWallet(walletId: string, payload: Partial<Wallet>) {
    assertMoneyMutationReady()
    const existingWallet = store.value.wallets.find(wallet => wallet.id === walletId)
    const color = payload.color ?? existingWallet?.color ?? walletColorForAccent(payload.accent ?? existingWallet?.accent)
    const result = await $fetch<{ ok: boolean; wallet: Wallet }>(`/api/wallets/${walletId}`, {
      method: 'PATCH',
      body: {
        name: payload.name,
        note: payload.note,
        color,
        emoji: payload.emoji ?? existingWallet?.emoji ?? '💳'
      }
    })
    applySingleWallet(result.wallet)
    await persistSnapshotAfterMutation()
    return result.wallet
  }

  async function removeWallet(walletId: string) {
    assertMoneyMutationReady()
    await $fetch<{ ok: boolean }>(`/api/wallets/${walletId}`, {
      method: 'DELETE'
    })
    store.value.wallets = store.value.wallets.filter(wallet => wallet.id !== walletId)
    store.value.transactions = store.value.transactions.filter(
      transaction => transaction.walletId !== walletId && transaction.toWalletId !== walletId
    )
    const customKey = customWalletKey(walletId)
    store.value.walletOrder = (store.value.walletOrder ?? []).filter(key => key !== customKey)
    store.value.pinnedWalletKeys = (store.value.pinnedWalletKeys ?? []).filter(key => key !== customKey)
    store.value = recalculateBalances(cloneState(store.value))
    await persistSnapshotAfterMutation()
  }

  async function setWalletPinned(walletId: string, pinned: boolean) {
    assertMoneyMutationReady()
    const key = customWalletKey(walletId)
    const list = new Set(store.value.pinnedWalletKeys ?? [])

    if (pinned) {
      list.add(key)
    }
    else {
      list.delete(key)
    }

    await persistPreferences({
      ...currentPreferencesPayload(),
      pinnedWalletKeys: [...list]
    })
  }

  async function moveWallet(fromKey: string, toKey: string) {
    assertMoneyMutationReady()
    if (fromKey === toKey) return

    const list = [...(store.value.walletOrder ?? [])]
    const fromIndex = list.indexOf(fromKey)
    const toIndex = list.indexOf(toKey)

    if (fromIndex < 0 || toIndex < 0) return

    list.splice(fromIndex, 1)
    list.splice(toIndex, 0, fromKey)

    await persistPreferences({
      ...currentPreferencesPayload(),
      walletOrder: list
    })
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

  async function setCurrencyEnabled(currency: CurrencyCode, enabled: boolean) {
    assertMoneyMutationReady()
    const next = normalizeCurrencySupport({
      ...currencySupport.value,
      [currency]: enabled
    })

    if (!enabled && Object.values(next).every(value => !value)) {
      return
    }

    await persistPreferences({
      ...currentPreferencesPayload(),
      currencySupport: next
    })
  }

  async function clearLocalAccountState() {
    store.value = recalculateBalances(defaultState())
    selectedCurrency.value = 'LAK'
    currencySupport.value = defaultCurrencySupport()
    hydrated.value = false
    transactionsHydrated.value = true
    hydratedAccountKey.value = ''
    clearSelectedCurrencyPreference()
  }

  async function toggleCurrencyEnabled(currency: CurrencyCode) {
    assertMoneyMutationReady()
    if (currencySupport.value[currency] && enabledCurrencyOptions.value.length <= 1) {
      return
    }

    await setCurrencyEnabled(currency, !currencySupport.value[currency])
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
    isOnline,
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
    toggleCurrencyEnabled,
    walletColorOptions
  }
}
