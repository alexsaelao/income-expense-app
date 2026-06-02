import { createClient, type Client } from '@libsql/client'
import { createHash, randomBytes } from 'node:crypto'

let client: Client | null = null
let clientKey = ''

export const APP_STATE_KEY = 'money-note-state-v1'
export const APP_STATE_TABLE = 'app_state'
export const AUTH_ACCOUNT_TABLE = 'auth_accounts'
export const ADMIN_ACCOUNT_TABLE = 'admin_accounts'
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
      pro_started_at TEXT,
      cloud_cleared_count INTEGER NOT NULL DEFAULT 0,
      cloud_cleared_at TEXT,
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

  const hasProStartedAtColumn = columns.rows.some(row => {
    const name = row.name as string | undefined
    return name === 'pro_started_at'
  })

  if (!hasProStartedAtColumn) {
    await db.execute(`ALTER TABLE ${AUTH_ACCOUNT_TABLE} ADD COLUMN pro_started_at TEXT`)
  }

  const hasCloudClearedCountColumn = columns.rows.some(row => {
    const name = row.name as string | undefined
    return name === 'cloud_cleared_count'
  })

  if (!hasCloudClearedCountColumn) {
    await db.execute(`ALTER TABLE ${AUTH_ACCOUNT_TABLE} ADD COLUMN cloud_cleared_count INTEGER NOT NULL DEFAULT 0`)
  }

  const hasCloudClearedAtColumn = columns.rows.some(row => {
    const name = row.name as string | undefined
    return name === 'cloud_cleared_at'
  })

  if (!hasCloudClearedAtColumn) {
    await db.execute(`ALTER TABLE ${AUTH_ACCOUNT_TABLE} ADD COLUMN cloud_cleared_at TEXT`)
  }

  await db.execute({
    sql: `
      UPDATE ${AUTH_ACCOUNT_TABLE}
      SET pro_started_at = COALESCE(pro_started_at, created_at, updated_at)
      WHERE plan = 'pro' AND pro_started_at IS NULL
    `,
    args: []
  })
}

export async function ensureAdminTable(db: Client, config: { adminLoginIdentifier?: string; adminLoginPin?: string }) {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS ${ADMIN_ACCOUNT_TABLE} (
      identifier_normalized TEXT PRIMARY KEY,
      identifier TEXT NOT NULL,
      identifier_type TEXT NOT NULL,
      pin_salt TEXT NOT NULL,
      pin_hash TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `)

  const identifier = (config.adminLoginIdentifier?.trim() ?? 'admin@local') || 'admin@local'
  const pin = (config.adminLoginPin?.trim() ?? '123456') || '123456'
  const normalizedIdentifier = normalizeAuthIdentifier(identifier)
  const pinSalt = createPinSalt()
  const pinHash = hashPin(pin, pinSalt)

  await db.execute({
    sql: `
      INSERT INTO ${ADMIN_ACCOUNT_TABLE} (identifier_normalized, identifier, identifier_type, pin_salt, pin_hash, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(identifier_normalized) DO UPDATE SET
        identifier = excluded.identifier,
        identifier_type = excluded.identifier_type,
        pin_salt = excluded.pin_salt,
        pin_hash = excluded.pin_hash,
        updated_at = excluded.updated_at
    `,
    args: [
      normalizedIdentifier,
      identifier,
      authIdentifierType(identifier),
      pinSalt,
      pinHash,
      new Date().toISOString(),
      new Date().toISOString()
    ]
  })
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
