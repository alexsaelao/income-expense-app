import { createError, readBody } from 'h3'
import {
  authIdentifierType,
  createPinSalt,
  ensureAuthTable,
  getTursoClient,
  hashPin,
  normalizeAuthIdentifier,
  AUTH_ACCOUNT_TABLE
} from '~/server/utils/turso'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const db = getTursoClient({
    tursoDatabaseUrl: config.tursoDatabaseUrl,
    tursoAuthToken: config.tursoAuthToken
  })

  const body = await readBody<{ identifier?: string; pin?: string; remember?: boolean }>(event)
  const identifier = body?.identifier?.trim()
  const pin = body?.pin?.trim()
  const remember = Boolean(body?.remember ?? true)

  if (!db) {
    throw createError({ statusCode: 503, statusMessage: 'Database not configured' })
  }

  if (!identifier || !pin) {
    throw createError({ statusCode: 400, statusMessage: 'Missing identifier or PIN' })
  }

  if (!/^\d{6}$/.test(pin)) {
    throw createError({ statusCode: 400, statusMessage: 'PIN must be 6 digits' })
  }

  await ensureAuthTable(db)

  const normalized = normalizeAuthIdentifier(identifier)
  const exists = await db.execute({
    sql: `SELECT identifier_normalized FROM ${AUTH_ACCOUNT_TABLE} WHERE identifier_normalized = ? LIMIT 1`,
    args: [normalized]
  })

  if (exists.rows.length) {
    throw createError({ statusCode: 409, statusMessage: 'Account already exists' })
  }

  const now = new Date().toISOString()
  const salt = createPinSalt()
  const pinHash = hashPin(pin, salt)

  await db.execute({
    sql: `
      INSERT INTO ${AUTH_ACCOUNT_TABLE} (
        identifier_normalized,
        identifier,
        identifier_type,
        plan,
        pin_salt,
        pin_hash,
        remember,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    args: [
      normalized,
      identifier,
      authIdentifierType(identifier),
      'free',
      salt,
      pinHash,
      remember ? 1 : 0,
      now,
      now
    ]
  })

  return {
    ok: true,
    connected: true,
    account: {
      identifier,
      identifierType: authIdentifierType(identifier),
      remember,
      plan: 'free'
    }
  }
})
