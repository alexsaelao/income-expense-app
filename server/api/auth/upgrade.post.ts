import { createError, readBody } from 'h3'
import {
  AUTH_ACCOUNT_TABLE,
  ensureAuthTable,
  ensureProRedeemTable,
  getTursoClient,
  normalizeAuthIdentifier,
  normalizeRedeemCode,
  PRO_REDEEM_TABLE
} from '~/server/utils/turso'
import { readUserSession, setUserSession } from '~/server/utils/auth-session'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const db = getTursoClient({
    tursoDatabaseUrl: config.tursoDatabaseUrl,
    tursoAuthToken: config.tursoAuthToken
  })

  const body = await readBody<{ identifier?: string; key?: string }>(event)
  const identifier = body?.identifier?.trim()
  const key = body?.key?.trim()

  if (!db) {
    throw createError({ statusCode: 503, statusMessage: 'Database not configured' })
  }

  if (!identifier || !key) {
    throw createError({ statusCode: 400, statusMessage: 'Missing identifier or key' })
  }

  await ensureAuthTable(db)
  await ensureProRedeemTable(db)

  const normalizedIdentifier = normalizeAuthIdentifier(identifier)
  const normalizedKey = normalizeRedeemCode(key)
  const now = new Date().toISOString()
  const currentSession = readUserSession(event, config.userSessionSecret ?? 'wallet-codesabai-user-secret')

  if (!normalizedKey) {
    throw createError({ statusCode: 400, statusMessage: 'Missing redeem key' })
  }

  const accountResult = await db.execute({
    sql: `SELECT identifier, identifier_type, plan, pro_started_at FROM ${AUTH_ACCOUNT_TABLE} WHERE identifier_normalized = ? LIMIT 1`,
    args: [normalizedIdentifier]
  })

  const accountRow = accountResult.rows[0] as {
    identifier?: string
    identifier_type?: string
    plan?: string
    pro_started_at?: string | null
  } | undefined

  if (!accountRow) {
    throw createError({ statusCode: 404, statusMessage: 'Account not found' })
  }

  if (accountRow.plan === 'pro') {
    const existingProStartedAt = accountRow.pro_started_at ?? null
    if (!existingProStartedAt) {
      await db.execute({
        sql: `
          UPDATE ${AUTH_ACCOUNT_TABLE}
          SET pro_started_at = COALESCE(pro_started_at, ?), updated_at = ?
          WHERE identifier_normalized = ?
        `,
        args: [now, now, normalizedIdentifier]
      })
    }

    if (currentSession?.identifier === normalizedIdentifier) {
      setUserSession(event, normalizedIdentifier, 'pro', config.userSessionSecret ?? 'wallet-codesabai-user-secret', true)
    }

    return {
      ok: true,
      connected: true,
      account: {
        identifier: accountRow.identifier ?? identifier,
        identifierType: accountRow.identifier_type ?? 'phone',
        plan: 'pro' as const,
        proStartedAt: existingProStartedAt ?? now
      }
    }
  }

  const redeemResult = await db.execute({
    sql: `
      SELECT code_normalized, code, active, redeemed_by, redeemed_at
      FROM ${PRO_REDEEM_TABLE}
      WHERE code_normalized = ?
      LIMIT 1
    `,
    args: [normalizedKey]
  })

  const redeemRow = redeemResult.rows[0] as {
    code_normalized?: string
    code?: string
    active?: number
    redeemed_by?: string | null
    redeemed_at?: string | null
  } | undefined

  if (!redeemRow) {
    throw createError({ statusCode: 404, statusMessage: 'Invalid key' })
  }

  if (redeemRow.active === 0 || redeemRow.redeemed_at) {
    throw createError({ statusCode: 409, statusMessage: 'Key already used' })
  }

  await db.execute({
    sql: `
      UPDATE ${AUTH_ACCOUNT_TABLE}
      SET plan = 'pro',
          pro_started_at = COALESCE(pro_started_at, ?),
          updated_at = ?
      WHERE identifier_normalized = ?
    `,
    args: [now, now, normalizedIdentifier]
  })

  await db.execute({
    sql: `
      UPDATE ${PRO_REDEEM_TABLE}
      SET active = 0, redeemed_by = ?, redeemed_at = ?, updated_at = ?
      WHERE code_normalized = ?
    `,
    args: [normalizedIdentifier, now, now, normalizedKey]
  })

  if (currentSession?.identifier === normalizedIdentifier) {
    setUserSession(event, normalizedIdentifier, 'pro', config.userSessionSecret ?? 'wallet-codesabai-user-secret', true)
  }

  return {
    ok: true,
    connected: true,
    account: {
      identifier: accountRow.identifier ?? identifier,
      identifierType: accountRow.identifier_type ?? 'phone',
      plan: 'pro' as const,
      proStartedAt: now
    },
    key: redeemRow.code ?? key
  }
})
