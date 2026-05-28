import { computed, onMounted, watch } from 'vue'

export type CurrencyCode = 'LAK' | 'THB' | 'USD'
export type TransactionType = 'income' | 'expense' | 'move' | 'loan'
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
}

export interface Transaction {
  id: string
  type: TransactionType
  walletId: string
  toWalletId?: string
  currency: CurrencyCode
  amount: number
  category: string
  note: string
  date: string
  counterparty?: string
  loanDirection?: LoanDirection
  createdAt: string
}

export interface MoneyNoteState {
  wallets: Wallet[]
  transactions: Transaction[]
}

export interface TransactionInput {
  type: TransactionType
  walletId: string
  toWalletId?: string
  currency: CurrencyCode
  amount: number
  category: string
  note: string
  date: string
  counterparty?: string
  loanDirection?: LoanDirection
}

const STORAGE_KEY = 'income-expense-note-state-v1'
const CURRENCY_SUPPORT_STORAGE_KEY = 'income-expense-note-currency-support-v1'

const currencyFormatters: Record<CurrencyCode, Intl.NumberFormat> = {
  LAK: new Intl.NumberFormat('lo-LA', { maximumFractionDigits: 0 }),
  THB: new Intl.NumberFormat('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
  USD: new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export const currencySymbols: Record<CurrencyCode, string> = {
  LAK: '₭',
  THB: '฿',
  USD: '$'
}

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
    note: wallet.note?.trim() || undefined
  }
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

export const loanDirectionOptions: Array<{ label: string; value: LoanDirection }> = [
  { label: 'Given', value: 'given' },
  { label: 'Received', value: 'received' }
]

export const incomeCategories = ['Salary', 'Freelance', 'Gift', 'Cashback', 'Other']
export const expenseCategories = ['Food', 'Transport', 'Bills', 'Shopping', 'Health', 'Family', 'Other']
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
    wallets: [
      {
        id: 'wallet-cash',
        name: 'Everyday Cash',
        currency: 'LAK',
        openingBalance: 24_800_000,
        balance: 0,
        color: 'sky',
        accent: 'from-sky-500 to-cyan-400',
        emoji: '💼',
        note: 'Daily spending wallet'
      },
      {
        id: 'wallet-bank',
        name: 'Breeze Bank',
        currency: 'THB',
        openingBalance: 42_500,
        balance: 0,
        color: 'emerald',
        accent: 'from-emerald-500 to-teal-400',
        emoji: '🏦',
        note: 'Salary and savings'
      },
      {
        id: 'wallet-usd',
        name: 'Travel USD',
        currency: 'USD',
        openingBalance: 1_250,
        balance: 0,
        color: 'indigo',
        accent: 'from-indigo-500 to-violet-400',
        emoji: '✈️',
        note: 'Trips and online payments'
      },
      {
        id: 'wallet-family',
        name: 'Family Support',
        currency: 'LAK',
        openingBalance: 8_200_000,
        balance: 0,
        color: 'amber',
        accent: 'from-amber-500 to-orange-400',
        emoji: '🤝',
        note: 'Shared living costs'
      }
    ],
    transactions: [
      {
        id: 'tx-1',
        type: 'income',
        walletId: 'wallet-cash',
        currency: 'LAK',
        amount: 8_000_000,
        category: 'Salary',
        note: 'Monthly salary from studio',
        date: makeDate(0, 3),
        createdAt: new Date().toISOString()
      },
      {
        id: 'tx-2',
        type: 'expense',
        walletId: 'wallet-cash',
        currency: 'LAK',
        amount: 420_000,
        category: 'Food',
        note: 'Lunch and coffee week',
        date: makeDate(0, 5),
        createdAt: new Date().toISOString()
      },
      {
        id: 'tx-3',
        type: 'move',
        walletId: 'wallet-cash',
        toWalletId: 'wallet-family',
        currency: 'LAK',
        amount: 1_000_000,
        category: 'Transfer',
        note: 'Support for house bills',
        date: makeDate(0, 7),
        createdAt: new Date().toISOString()
      },
      {
        id: 'tx-4',
        type: 'expense',
        walletId: 'wallet-bank',
        currency: 'THB',
        amount: 1_650,
        category: 'Shopping',
        note: 'Work clothes and supplies',
        date: makeDate(0, 8),
        createdAt: new Date().toISOString()
      },
      {
        id: 'tx-5',
        type: 'income',
        walletId: 'wallet-bank',
        currency: 'THB',
        amount: 12_000,
        category: 'Freelance',
        note: 'Design review project',
        date: makeDate(0, 10),
        createdAt: new Date().toISOString()
      },
      {
        id: 'tx-6',
        type: 'loan',
        walletId: 'wallet-usd',
        currency: 'USD',
        amount: 300,
        category: 'Loan',
        note: 'Loan given to friend for 30 days',
        loanDirection: 'given',
        counterparty: 'Dara',
        date: makeDate(0, 11),
        createdAt: new Date().toISOString()
      },
      {
        id: 'tx-7',
        type: 'income',
        walletId: 'wallet-family',
        currency: 'LAK',
        amount: 1_800_000,
        category: 'Gift',
        note: 'Birthday gift from relatives',
        date: makeDate(0, 12),
        createdAt: new Date().toISOString()
      },
      {
        id: 'tx-8',
        type: 'expense',
        walletId: 'wallet-family',
        currency: 'LAK',
        amount: 275_000,
        category: 'Bills',
        note: 'Electricity and water',
        date: makeDate(0, 13),
        createdAt: new Date().toISOString()
      },
      {
        id: 'tx-9',
        type: 'expense',
        walletId: 'wallet-usd',
        currency: 'USD',
        amount: 54.5,
        category: 'Transport',
        note: 'Taxi and airport shuttle',
        date: makeDate(0, 15),
        createdAt: new Date().toISOString()
      }
    ]
  }
}

function cloneState(state: MoneyNoteState): MoneyNoteState {
  return {
    wallets: state.wallets.map(wallet => ({ ...wallet })),
    transactions: state.transactions.map(transaction => ({ ...transaction }))
  }
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
    if (target) target.balance += delta
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

  const saveState = () => {
    if (!import.meta.client || !hydrated.value) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store.value))
  }

  const loadState = () => {
    if (!import.meta.client || hydrated.value) return

    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as MoneyNoteState
        store.value = recalculateBalances({
          wallets: parsed.wallets?.length ? parsed.wallets.map(wallet => normalizeWallet(wallet as Partial<Wallet> & { id: string })) : defaultState().wallets,
          transactions: parsed.transactions?.length ? parsed.transactions : defaultState().transactions
        })
      }
      catch {
        store.value = recalculateBalances(defaultState())
      }
    }

    hydrated.value = true
  }

  onMounted(loadState)

  watch(
    store,
    () => {
      saveState()
    },
    { deep: true }
  )

  watch(
    selectedCurrency,
    () => {
      if (import.meta.client) {
        localStorage.setItem('money-note-selected-currency', selectedCurrency.value)
      }
    },
    { flush: 'post' }
  )

  watch(
    currencySupport,
    () => {
      if (!import.meta.client) return
      localStorage.setItem(CURRENCY_SUPPORT_STORAGE_KEY, JSON.stringify(currencySupport.value))

      if (!currencySupport.value[selectedCurrency.value]) {
        selectedCurrency.value = enabledCurrencyOptions.value[0]?.value ?? 'LAK'
      }
    },
    { deep: true, flush: 'post' }
  )

  onMounted(() => {
    if (!import.meta.client) return

    const savedCurrencySupport = localStorage.getItem(CURRENCY_SUPPORT_STORAGE_KEY)
    if (savedCurrencySupport) {
      try {
        currencySupport.value = normalizeCurrencySupport(JSON.parse(savedCurrencySupport) as Partial<Record<CurrencyCode, boolean>>)
      }
      catch {
        currencySupport.value = defaultCurrencySupport()
      }
    }

    const savedCurrency = localStorage.getItem('money-note-selected-currency') as CurrencyCode | null
    if (savedCurrency && currencyOptions.some(option => option.value === savedCurrency)) {
      selectedCurrency.value = savedCurrency
    }

    if (!currencySupport.value[selectedCurrency.value]) {
      selectedCurrency.value = enabledCurrencyOptions.value[0]?.value ?? 'LAK'
    }
  })

  const transactions = computed(() => [...store.value.transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()))
  const wallets = computed(() => store.value.wallets)
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

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  function formatDateGroup(date: string) {
    const value = new Date(date)
    const today = new Date()
    const diffDays = Math.round((today.setHours(0, 0, 0, 0) - value.setHours(0, 0, 0, 0)) / 86400000)

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'

    return value.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    })
  }

  function typeLabel(type: TransactionType) {
    return typeMeta[type].label
  }

  function typeIcon(type: TransactionType) {
    return typeMeta[type].icon
  }

  function typeTint(type: TransactionType) {
    return typeMeta[type].tint
  }

  function categoryOptionsFor(type: TransactionType) {
    if (type === 'income') return incomeCategories
    if (type === 'expense') return expenseCategories
    if (type === 'move') return moveCategories
    return loanCategories
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

    return [...groups.entries()]
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([date, items]) => ({
        date,
        label: formatDateGroup(date),
        items: items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
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
    return transactions.value.filter((transaction) => {
      const matchSearch = !search || [transaction.note, transaction.category, transaction.counterparty, typeLabel(transaction.type)]
        .filter(Boolean)
        .some(value => value!.toLowerCase().includes(search))
      const matchType = !filters.type || filters.type === 'all' || transaction.type === filters.type
      const matchWallet = !filters.walletId || filters.walletId === 'all' || matchesWallet(transaction, filters.walletId)
      const matchCurrency = !filters.currency || filters.currency === 'all' || matchesCurrency(transaction, filters.currency)
      const matchDate = matchesDateRange(transaction, filters.from, filters.to)

      return matchSearch && matchType && matchWallet && matchCurrency && matchDate
    })
  }

  function applyTransactionPayload(payload: TransactionInput, id?: string) {
    const baseTransaction: Transaction = {
      id: id ?? `tx-${crypto.randomUUID()}`,
      type: payload.type,
      walletId: payload.walletId,
      toWalletId: payload.toWalletId,
      currency: payload.currency,
      amount: Number(payload.amount),
      category: payload.category,
      note: payload.note.trim(),
      date: payload.date,
      counterparty: payload.counterparty?.trim() || undefined,
      loanDirection: payload.loanDirection,
      createdAt: new Date().toISOString()
    }

    return baseTransaction
  }

  function addTransaction(payload: TransactionInput) {
    store.value.transactions = [applyTransactionPayload(payload), ...store.value.transactions]
    store.value = recalculateBalances(cloneState(store.value))
  }

  function updateTransaction(transactionId: string, payload: TransactionInput) {
    store.value.transactions = store.value.transactions.map(transaction =>
      transaction.id === transactionId ? { ...applyTransactionPayload(payload, transactionId), createdAt: transaction.createdAt } : transaction
    )
    store.value = recalculateBalances(cloneState(store.value))
  }

  function removeTransaction(transactionId: string) {
    store.value.transactions = store.value.transactions.filter(transaction => transaction.id !== transactionId)
    store.value = recalculateBalances(cloneState(store.value))
  }

  function addWallet(payload: { name: string; currency: CurrencyCode; openingBalance: number; note?: string; color?: WalletColor; accent?: string; emoji?: string }) {
    const color = payload.color ?? walletColorForAccent(payload.accent)
    const wallet: Wallet = {
      id: `wallet-${crypto.randomUUID()}`,
      name: payload.name.trim(),
      currency: payload.currency,
      openingBalance: Number(payload.openingBalance),
      balance: Number(payload.openingBalance),
      note: payload.note?.trim(),
      color,
      accent: walletAccentForColor(color),
      emoji: payload.emoji ?? '💳'
    }

    store.value.wallets = [wallet, ...store.value.wallets]
    store.value = recalculateBalances(cloneState(store.value))
  }

  function updateWallet(walletId: string, payload: Partial<Wallet>) {
    store.value.wallets = store.value.wallets.map((wallet) => {
      if (wallet.id !== walletId) return wallet

      const color = payload.color ?? wallet.color ?? walletColorForAccent(payload.accent ?? wallet.accent)
      return {
        ...wallet,
        ...payload,
        color,
        accent: walletAccentForColor(color)
      }
    })
    store.value = recalculateBalances(cloneState(store.value))
  }

  function walletMonthTotals(walletId: string) {
    const wallet = getWallet(walletId)
    const walletTransactions = transactions.value.filter(transaction => transaction.walletId === walletId || transaction.toWalletId === walletId)
    const income = walletTransactions.filter(transaction => transaction.type === 'income' || (transaction.type === 'loan' && transaction.loanDirection === 'received') || (transaction.type === 'move' && transaction.toWalletId === walletId))
      .reduce((sum, transaction) => sum + transaction.amount, 0)
    const expense = walletTransactions.filter(transaction => transaction.type === 'expense' || (transaction.type === 'loan' && transaction.loanDirection !== 'received') || (transaction.type === 'move' && transaction.walletId === walletId))
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
    const next = normalizeCurrencySupport({
      ...currencySupport.value,
      [currency]: enabled
    })

    if (!enabled && Object.values(next).every(value => !value)) {
      return
    }

    currencySupport.value = next
  }

  function toggleCurrencyEnabled(currency: CurrencyCode) {
    if (currencySupport.value[currency] && enabledCurrencyOptions.value.length <= 1) {
      return
    }

    setCurrencyEnabled(currency, !currencySupport.value[currency])
  }

  return {
    store,
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
    getTransaction,
    formatCurrency,
    formatDate,
    formatDateGroup,
    typeLabel,
    typeIcon,
    typeTint,
    categoryOptionsFor,
    walletOptionsForCurrency,
    groupTransactions,
    filterTransactions,
    addTransaction,
    updateTransaction,
    removeTransaction,
    addWallet,
    updateWallet,
    walletMonthTotals,
    monthlySeries,
    categorySeries,
    walletSeries,
    currencySeries,
    isCurrencyEnabled,
    setCurrencyEnabled,
    toggleCurrencyEnabled,
    walletColorOptions
  }
}
