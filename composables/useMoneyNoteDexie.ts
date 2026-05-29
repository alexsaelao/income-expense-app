type CurrencyCode = 'LAK' | 'THB' | 'USD'

export interface MoneyNoteLocalSnapshot {
  stateJson: string
  selectedCurrency: CurrencyCode
  currencySupportJson: string
  updatedAt: string
}

interface MoneyNoteLocalRecord extends MoneyNoteLocalSnapshot {
  accountKey: string
}

const DB_NAME = 'income-expense-note-db'
const TABLE_NAME = 'money_note_snapshots'
const LEGACY_STATE_KEY_PREFIX = 'income-expense-note-state-v1'
const LEGACY_SELECTED_CURRENCY_KEY = 'money-note-selected-currency'
const LEGACY_CURRENCY_SUPPORT_KEY = 'income-expense-note-currency-support-v1'

let dbPromise: Promise<any> | null = null

function getLegacyStateKey(accountKey: string) {
  return `${LEGACY_STATE_KEY_PREFIX}:${accountKey}`
}

function readLegacySnapshot(accountKey: string): MoneyNoteLocalSnapshot | null {
  if (import.meta.server) return null

  const stateJson = window.localStorage.getItem(getLegacyStateKey(accountKey))
    ?? window.localStorage.getItem(LEGACY_STATE_KEY_PREFIX)

  if (!stateJson) return null

  const selectedCurrency = window.localStorage.getItem(LEGACY_SELECTED_CURRENCY_KEY) as CurrencyCode | null
  const currencySupportJson = window.localStorage.getItem(LEGACY_CURRENCY_SUPPORT_KEY)

  return {
    stateJson,
    selectedCurrency: selectedCurrency ?? 'LAK',
    currencySupportJson: currencySupportJson ?? JSON.stringify({ LAK: true, THB: true, USD: true }),
    updatedAt: new Date().toISOString()
  }
}

function clearLegacySnapshot(accountKey: string) {
  if (import.meta.server) return

  window.localStorage.removeItem(getLegacyStateKey(accountKey))
  window.localStorage.removeItem(LEGACY_STATE_KEY_PREFIX)
  window.localStorage.removeItem(LEGACY_SELECTED_CURRENCY_KEY)
  window.localStorage.removeItem(LEGACY_CURRENCY_SUPPORT_KEY)
}

async function getDb() {
  if (import.meta.server) return null

  if (!dbPromise) {
    dbPromise = import('dexie').then(({ default: Dexie }) => {
      const db = new Dexie(DB_NAME)
      db.version(1).stores({
        [TABLE_NAME]: '&accountKey, updatedAt'
      })
      return db
    })
  }

  return dbPromise
}

export async function readMoneyNoteLocalSnapshot(accountKey: string) {
  const db = await getDb()
  if (!db) return readLegacySnapshot(accountKey)

  const table = db.table(TABLE_NAME)
  const record = await table.get(accountKey) as MoneyNoteLocalRecord | undefined

  if (record?.stateJson) {
    return {
      stateJson: record.stateJson,
      selectedCurrency: record.selectedCurrency ?? 'LAK',
      currencySupportJson: record.currencySupportJson ?? JSON.stringify({ LAK: true, THB: true, USD: true }),
      updatedAt: record.updatedAt ?? new Date().toISOString()
    }
  }

  const legacy = readLegacySnapshot(accountKey)
  if (!legacy) return null

  await table.put({
    accountKey,
    ...legacy
  })
  clearLegacySnapshot(accountKey)
  return legacy
}

export async function writeMoneyNoteLocalSnapshot(accountKey: string, snapshot: MoneyNoteLocalSnapshot) {
  const db = await getDb()
  if (!db) return

  await db.table(TABLE_NAME).put({
    accountKey,
    ...snapshot,
    updatedAt: snapshot.updatedAt ?? new Date().toISOString()
  } satisfies MoneyNoteLocalRecord)
}

export async function deleteMoneyNoteLocalSnapshot(accountKey: string) {
  const db = await getDb()
  if (db) {
    await db.table(TABLE_NAME).delete(accountKey)
  }

  clearLegacySnapshot(accountKey)
}
