import { createError, readBody } from 'h3'
import {
  ensureAuthTable,
  getTursoClient,
  hashPin,
  normalizeAuthIdentifier,
  AUTH_ACCOUNT_TABLE
} from '~/server/utils/turso'
import { setUserSession } from '~/server/utils/auth-session'

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
  const result = await db.execute({
    sql: `
      SELECT identifier, identifier_type, plan, pin_salt, pin_hash, remember
      FROM ${AUTH_ACCOUNT_TABLE}
      WHERE identifier_normalized = ?
      LIMIT 1
    `,
    args: [normalized]
  })

  const row = result.rows[0] as {
    identifier?: string
    identifier_type?: string
    plan?: string
    pin_salt?: string
    pin_hash?: string
    remember?: number
  } | undefined

  if (!row?.pin_salt || !row?.pin_hash) {
    throw createError({ statusCode: 404, statusMessage: 'Account not found' })
  }

  const nextHash = hashPin(pin, row.pin_salt)
  if (nextHash !== row.pin_hash) {
    throw createError({ statusCode: 401, statusMessage: 'PIN is not correct' })
  }

  setUserSession(
    event,
    row.identifier ?? identifier,
    row.plan === 'pro' ? 'pro' : 'free',
    config.userSessionSecret ?? 'wallet-codesabai-user-secret',
    remember
  )

  return {
    ok: true,
    connected: true,
    account: {
      identifier: row.identifier ?? identifier,
      identifierType: row.identifier_type ?? 'phone',
      remember: Boolean(row.remember),
      plan: row.plan === 'pro' ? 'pro' : 'free'
    }
  }
})
