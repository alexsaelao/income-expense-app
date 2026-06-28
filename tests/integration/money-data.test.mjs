import assert from 'node:assert/strict'
import { createHmac } from 'node:crypto'
import { mkdtemp, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { after, before, test } from 'node:test'
import { createJiti } from 'jiti'
import { createApp, defineEventHandler, toWebHandler } from 'h3'

const rootDir = process.cwd()
const sessionCookieName = 'income-expense-note-auth-session-v1'
const sessionSecret = 'integration-user-secret'
const jiti = createJiti(import.meta.url, {
  interopDefault: true,
  alias: {
    '~': rootDir,
    '@': rootDir
  }
})

let tempDir = ''
let routeHandlers = {}

function sourcePath(relativePath) {
  return path.join(rootDir, relativePath)
}

before(async () => {
  tempDir = await mkdtemp(path.join(os.tmpdir(), 'income-expense-app-test-'))
  globalThis.defineEventHandler = defineEventHandler
  globalThis.useRuntimeConfig = () => ({
    tursoDatabaseUrl: `file:${path.join(tempDir, 'integration.db')}`,
    tursoAuthToken: 'integration-token',
    userSessionSecret: sessionSecret
  })

  routeHandlers = {
    createWallet: (await jiti.import(sourcePath('server/api/wallets/index.post.ts'))).default,
    updateWallet: (await jiti.import(sourcePath('server/api/wallets/[id].patch.ts'))).default,
    deleteWallet: (await jiti.import(sourcePath('server/api/wallets/[id].delete.ts'))).default,
    createCategory: (await jiti.import(sourcePath('server/api/categories/index.post.ts'))).default,
    updateCategory: (await jiti.import(sourcePath('server/api/categories/[id].patch.ts'))).default,
    deleteCategory: (await jiti.import(sourcePath('server/api/categories/[id].delete.ts'))).default,
    createCompany: (await jiti.import(sourcePath('server/api/companies/index.post.ts'))).default,
    updateCompany: (await jiti.import(sourcePath('server/api/companies/[id].patch.ts'))).default,
    deleteCompany: (await jiti.import(sourcePath('server/api/companies/[id].delete.ts'))).default,
    createTransaction: (await jiti.import(sourcePath('server/api/transactions/index.post.ts'))).default,
    listTransactions: (await jiti.import(sourcePath('server/api/transactions/index.get.ts'))).default,
    updateTransaction: (await jiti.import(sourcePath('server/api/transactions/[id].patch.ts'))).default,
    deleteTransaction: (await jiti.import(sourcePath('server/api/transactions/[id].delete.ts'))).default,
    getMoneyData: (await jiti.import(sourcePath('server/api/money-data/index.get.ts'))).default,
    putPreferences: (await jiti.import(sourcePath('server/api/preferences/index.put.ts'))).default,
    getPreferences: (await jiti.import(sourcePath('server/api/preferences/index.get.ts'))).default
  }
})

after(async () => {
  delete globalThis.defineEventHandler
  delete globalThis.useRuntimeConfig
  await rm(tempDir, { recursive: true, force: true })
})

test('wallet CRUD and wallet delete removes linked transactions', async () => {
  const identifier = phoneIdentifier(1)

  const walletA = await createWallet(identifier, {
    name: 'Main Wallet',
    currency: 'LAK',
    openingBalance: 250000,
    color: 'sky',
    emoji: '💳',
    note: 'primary'
  })
  const walletB = await createWallet(identifier, {
    name: 'Savings Wallet',
    currency: 'USD',
    openingBalance: 250,
    color: 'emerald',
    emoji: '🏦',
    note: 'backup'
  })

  const updatedWalletA = await invoke(routeHandlers.updateWallet, `/api/wallets/${walletA.id}`, {
    identifier,
    method: 'PATCH',
    params: { id: walletA.id },
    body: {
      name: 'Main Cash',
      color: 'amber',
      emoji: '💼',
      note: 'updated'
    }
  })

  assert.equal(updatedWalletA.wallet.name, 'Main Cash')
  assert.equal(updatedWalletA.wallet.color, 'amber')
  assert.equal(updatedWalletA.wallet.note, 'updated')

  const createdTransaction = await invoke(routeHandlers.createTransaction, '/api/transactions', {
    identifier,
    method: 'POST',
    body: {
      type: 'expense',
      walletId: walletA.id,
      currency: 'LAK',
      amount: 45000,
      category: 'Food',
      note: 'wallet cascade',
      date: '2026-06-24',
      company: 'Cafe'
    }
  })

  assert.equal(createdTransaction.transaction.walletId, walletA.id)

  await invoke(routeHandlers.deleteWallet, `/api/wallets/${walletA.id}`, {
    identifier,
    method: 'DELETE',
    params: { id: walletA.id }
  })

  const dataAfterDelete = await invoke(routeHandlers.getMoneyData, '/api/money-data', {
    identifier,
    method: 'GET'
  })
  assert.deepEqual(dataAfterDelete.wallets.map(wallet => wallet.id), [walletB.id])

  const transactionsAfterDelete = await invoke(routeHandlers.listTransactions, '/api/transactions', {
    identifier,
    method: 'GET'
  })
  assert.equal(transactionsAfterDelete.transactions.length, 0)

  await invoke(routeHandlers.deleteWallet, `/api/wallets/${walletB.id}`, {
    identifier,
    method: 'DELETE',
    params: { id: walletB.id }
  })

  const finalData = await invoke(routeHandlers.getMoneyData, '/api/money-data', {
    identifier,
    method: 'GET'
  })
  assert.equal(finalData.wallets.length, 0)
})

test('wallet create defaults empty or zero opening balance to 0', async () => {
  const identifier = phoneIdentifier(4)

  const emptyBalanceWallet = await createWallet(identifier, {
    name: 'Zero Start Wallet',
    currency: 'LAK',
    openingBalance: '',
    color: 'sky',
    emoji: '💳',
    note: 'empty input'
  })

  assert.equal(emptyBalanceWallet.openingBalance, 0)
  assert.equal(emptyBalanceWallet.balance, 0)

  const zeroBalanceWallet = await createWallet(identifier, {
    name: 'Explicit Zero Wallet',
    currency: 'USD',
    openingBalance: 0,
    color: 'emerald',
    emoji: '🏦',
    note: 'explicit zero'
  })

  assert.equal(zeroBalanceWallet.openingBalance, 0)
  assert.equal(zeroBalanceWallet.balance, 0)
})

test('category/company CRUD update linked transactions and transaction CRUD works end-to-end', async () => {
  const identifier = phoneIdentifier(2)

  const wallet = await createWallet(identifier, {
    name: 'Daily Wallet',
    currency: 'LAK',
    openingBalance: 100000,
    color: 'indigo',
    emoji: '👛',
    note: 'daily'
  })
  const categoryA = await createCategory(identifier, {
    type: 'expense',
    name: 'Canteen',
    emoji: '🍜',
    color: 'rose'
  })
  const categoryB = await createCategory(identifier, {
    type: 'expense',
    name: 'Travel',
    emoji: '🚌',
    color: 'sky'
  })
  const companyA = await createCompany(identifier, {
    name: 'Cafe',
    emoji: '☕',
    color: 'amber'
  })
  const companyB = await createCompany(identifier, {
    name: 'Taxi',
    emoji: '🚕',
    color: 'violet'
  })

  const createdTransaction = await invoke(routeHandlers.createTransaction, '/api/transactions', {
    identifier,
    method: 'POST',
    body: {
      type: 'expense',
      walletId: wallet.id,
      currency: 'LAK',
      amount: 60000,
      category: categoryA.name,
      note: 'before rename',
      date: '2026-06-25',
      company: companyA.name
    }
  })

  const updatedCategory = await invoke(routeHandlers.updateCategory, `/api/categories/${categoryA.id}`, {
    identifier,
    method: 'PATCH',
    params: { id: categoryA.id },
    body: {
      name: 'Dining',
      emoji: '🍽️',
      color: 'fuchsia',
      enabled: false
    }
  })
  const updatedCompany = await invoke(routeHandlers.updateCompany, `/api/companies/${companyA.id}`, {
    identifier,
    method: 'PATCH',
    params: { id: companyA.id },
    body: {
      name: 'Coffee Club',
      emoji: '🥤',
      color: 'emerald',
      enabled: false
    }
  })

  assert.equal(updatedCategory.category.name, 'Dining')
  assert.equal(updatedCategory.category.enabled, false)
  assert.equal(updatedCompany.company.name, 'Coffee Club')
  assert.equal(updatedCompany.company.enabled, false)

  const transactionsAfterRename = await invoke(routeHandlers.listTransactions, '/api/transactions', {
    identifier,
    method: 'GET'
  })
  assert.equal(transactionsAfterRename.transactions.length, 1)
  assert.equal(transactionsAfterRename.transactions[0].category, 'Dining')
  assert.equal(transactionsAfterRename.transactions[0].company, 'Coffee Club')

  const updatedTransaction = await invoke(routeHandlers.updateTransaction, `/api/transactions/${createdTransaction.transaction.id}`, {
    identifier,
    method: 'PATCH',
    params: { id: createdTransaction.transaction.id },
    body: {
      type: 'expense',
      walletId: wallet.id,
      currency: 'LAK',
      amount: 99000,
      category: categoryB.name,
      note: 'after update',
      date: '2026-06-26',
      company: companyB.name
    }
  })

  assert.equal(updatedTransaction.transaction.amount, 99000)
  assert.equal(updatedTransaction.transaction.note, 'after update')
  assert.equal(updatedTransaction.transaction.category, 'Travel')
  assert.equal(updatedTransaction.transaction.company, 'Taxi')

  await invoke(routeHandlers.deleteTransaction, `/api/transactions/${createdTransaction.transaction.id}`, {
    identifier,
    method: 'DELETE',
    params: { id: createdTransaction.transaction.id }
  })
  await invoke(routeHandlers.deleteCategory, `/api/categories/${categoryA.id}`, {
    identifier,
    method: 'DELETE',
    params: { id: categoryA.id }
  })
  await invoke(routeHandlers.deleteCategory, `/api/categories/${categoryB.id}`, {
    identifier,
    method: 'DELETE',
    params: { id: categoryB.id }
  })
  await invoke(routeHandlers.deleteCompany, `/api/companies/${companyA.id}`, {
    identifier,
    method: 'DELETE',
    params: { id: companyA.id }
  })
  await invoke(routeHandlers.deleteCompany, `/api/companies/${companyB.id}`, {
    identifier,
    method: 'DELETE',
    params: { id: companyB.id }
  })

  const dataAfterDelete = await invoke(routeHandlers.getMoneyData, '/api/money-data', {
    identifier,
    method: 'GET'
  })
  assert.equal(dataAfterDelete.categories.length, 0)
  assert.equal(dataAfterDelete.companies.length, 0)
})

test('preferences API persists toggle and reorder state for wallets, categories, companies, and currencies', async () => {
  const identifier = phoneIdentifier(3)

  const walletA = await createWallet(identifier, {
    name: 'Wallet One',
    currency: 'LAK',
    openingBalance: 1000,
    color: 'sky',
    emoji: '1️⃣',
    note: 'one'
  })
  const walletB = await createWallet(identifier, {
    name: 'Wallet Two',
    currency: 'THB',
    openingBalance: 2000,
    color: 'emerald',
    emoji: '2️⃣',
    note: 'two'
  })
  const incomeCategory = await createCategory(identifier, {
    type: 'income',
    name: 'Bonus',
    emoji: '🎉',
    color: 'emerald'
  })
  const expenseCategory = await createCategory(identifier, {
    type: 'expense',
    name: 'Snacks',
    emoji: '🍪',
    color: 'amber'
  })
  const companyA = await createCompany(identifier, {
    name: 'Mart',
    emoji: '🏪',
    color: 'slate'
  })
  const companyB = await createCompany(identifier, {
    name: 'Fuel',
    emoji: '⛽',
    color: 'rose'
  })

  const payload = {
    walletOrder: [`wallet:${walletB.id}`, `wallet:${walletA.id}`],
    pinnedWalletKeys: [`wallet:${walletB.id}`],
    disabledDefaultCategories: ['income:salary'],
    disabledDefaultCompanies: ['other'],
    categoryOrder: {
      income: [`custom:${incomeCategory.id}`],
      expense: [`custom:${expenseCategory.id}`]
    },
    pinnedCategoryKeys: {
      income: [`custom:${incomeCategory.id}`],
      expense: [`custom:${expenseCategory.id}`]
    },
    companyOrder: [`custom:${companyB.id}`, `custom:${companyA.id}`],
    pinnedCompanyKeys: [`custom:${companyB.id}`],
    currencySupport: {
      LAK: true,
      THB: false,
      USD: true
    }
  }

  const savedPreferences = await invoke(routeHandlers.putPreferences, '/api/preferences', {
    identifier,
    method: 'PUT',
    body: {
      preferences: payload
    }
  })

  assert.deepEqual(savedPreferences.preferences, payload)

  const fetchedPreferences = await invoke(routeHandlers.getPreferences, '/api/preferences', {
    identifier,
    method: 'GET'
  })
  assert.deepEqual(fetchedPreferences.preferences, payload)
})

async function createWallet(identifier, payload) {
  const response = await invoke(routeHandlers.createWallet, '/api/wallets', {
    identifier,
    method: 'POST',
    body: payload
  })
  return response.wallet
}

async function createCategory(identifier, payload) {
  const response = await invoke(routeHandlers.createCategory, '/api/categories', {
    identifier,
    method: 'POST',
    body: payload
  })
  return response.category
}

async function createCompany(identifier, payload) {
  const response = await invoke(routeHandlers.createCompany, '/api/companies', {
    identifier,
    method: 'POST',
    body: payload
  })
  return response.company
}

async function invoke(handler, pathname, { identifier, method = 'GET', body, params } = {}) {
  const app = createApp()
  const wrapped = params
    ? defineEventHandler((event) => {
        event.context.params = params
        return handler(event)
      })
    : handler

  app.use(pathname, wrapped)

  const response = await toWebHandler(app)(new Request(`http://local${pathname}`, {
    method,
    headers: {
      cookie: `${sessionCookieName}=${createSessionToken(identifier, 'pro', sessionSecret)}`,
      ...(body ? { 'content-type': 'application/json' } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  }))

  const text = await response.text()
  const data = text ? JSON.parse(text) : null

  assert.ok(response.ok, `${method} ${pathname} failed with ${response.status}: ${text}`)
  return data
}

function createSessionToken(identifier, plan, secret) {
  const normalizedIdentifier = identifier.trim().replace(/[^\d+]/g, '')
  const payload = `${normalizedIdentifier}:${plan}`
  const signature = createHmac('sha256', secret).update(payload).digest('hex')
  return `${payload}.${signature}`
}

function phoneIdentifier(sequence) {
  return `+85620999900${sequence}`
}
