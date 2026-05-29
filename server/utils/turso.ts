import { createClient, type Client } from '@libsql/client'
import { createHash, randomBytes } from 'node:crypto'

let client: Client | null = null
let clientKey = ''

export const APP_STATE_KEY = 'money-note-state-v1'
export const APP_STATE_TABLE = 'app_state'
export const AUTH_ACCOUNT_TABLE = 'auth_accounts'
export const PRO_REDEEM_TABLE = 'pro_redeem_keys'

export function getTursoClient(config: { tursoDatabaseUrl?: string; tursoAuthToken?: string }) {
  const url = config.tursoDatabaseUrl?.trim()
  const authToken = config.tursoAuthToken?.trim()

  if (!url || !authToken) return null

  const nextKey = `${url}:${authToken}`
  if (!client || clientKey !== nextKey) {
    client = createClient({ url, authToken })
    clientKey = nextKey
  }

  return client
}

export async function ensureStateTable(db: Client) {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS ${APP_STATE_TABLE} (
      state_key TEXT PRIMARY KEY,
      state_json TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `)
}

export async function checkTursoConnection(db: Client) {
  await db.execute('SELECT 1 AS ok')
  return true
}

export async function ensureAuthTable(db: Client) {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS ${AUTH_ACCOUNT_TABLE} (
      identifier_normalized TEXT PRIMARY KEY,
      identifier TEXT NOT NULL,
      identifier_type TEXT NOT NULL,
      plan TEXT NOT NULL DEFAULT 'free',
      pin_salt TEXT NOT NULL,
      pin_hash TEXT NOT NULL,
      remember INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `)

  const columns = await db.execute({
    sql: `PRAGMA table_info(${AUTH_ACCOUNT_TABLE})`,
    args: []
  })

  const hasPlanColumn = columns.rows.some(row => {
    const name = row.name as string | undefined
    return name === 'plan'
  })

  if (!hasPlanColumn) {
    await db.execute(`ALTER TABLE ${AUTH_ACCOUNT_TABLE} ADD COLUMN plan TEXT NOT NULL DEFAULT 'free'`)
  }
}

export async function ensureProRedeemTable(db: Client) {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS ${PRO_REDEEM_TABLE} (
      code_normalized TEXT PRIMARY KEY,
      code TEXT NOT NULL,
      active INTEGER NOT NULL DEFAULT 1,
      redeemed_by TEXT,
      redeemed_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `)
}

export function normalizeAuthIdentifier(identifier: string) {
  const trimmed = identifier.trim()
  if (trimmed.includes('@')) {
    return trimmed.toLowerCase()
  }

  return trimmed.replace(/[^\d+]/g, '')
}

export function authIdentifierType(identifier: string) {
  return identifier.includes('@') ? 'email' : 'phone'
}

export function normalizeRedeemCode(code: string) {
  return code.trim().toUpperCase().replace(/[^A-Z0-9]/g, '')
}

export function createPinSalt() {
  return randomBytes(16).toString('hex')
}

export function hashPin(pin: string, salt: string) {
  return createHash('sha256').update(`${salt}:${pin.trim()}`).digest('hex')
}

export function stateKeyForIdentifier(identifier: string) {
  return `${APP_STATE_KEY}:${normalizeAuthIdentifier(identifier)}`
}
