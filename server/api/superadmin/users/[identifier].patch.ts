import { createError, getRouterParam, readBody } from 'h3'
import { AUTH_ACCOUNT_TABLE, ensureAuthTable, getTursoClient, normalizeAuthIdentifier } from '~/server/utils/turso'
import { readAdminSession } from '~/server/utils/admin'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const session = readAdminSession(event, config.adminSessionSecret ?? 'income-expense-note-admin-secret')

  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Admin login required' })
  }

  const identifier = decodeURIComponent(getRouterParam(event, 'identifier') ?? '').trim()
  if (!identifier) {
    throw createError({ statusCode: 400, statusMessage: 'Missing identifier' })
  }

  const body = await readBody<{ plan?: 'free' | 'pro'; remember?: boolean }>(event)
  const plan = body?.plan === 'pro' ? 'pro' : 'free'
  const remember = Boolean(body?.remember ?? true)

  const db = getTursoClient({
    tursoDatabaseUrl: config.tursoDatabaseUrl,
    tursoAuthToken: config.tursoAuthToken
  })

  if (!db) {
    return { ok: false, connected: false, updated: false }
  }

  await ensureAuthTable(db)

  const now = new Date().toISOString()
  const normalizedIdentifier = normalizeAuthIdentifier(identifier)
  const result = await db.execute({
    sql: `
      UPDATE ${AUTH_ACCOUNT_TABLE}
      SET plan = ?,
          remember = ?,
          pro_started_at = CASE
            WHEN ? = 'pro' THEN COALESCE(pro_started_at, ?)
            ELSE pro_started_at
          END,
          updated_at = ?
      WHERE identifier_normalized = ?
    `,
    args: [plan, remember ? 1 : 0, plan, now, now, normalizedIdentifier]
  })

  if (Number(result.rowsAffected ?? 0) === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Account not found' })
  }

  return {
    ok: true,
    connected: true,
    updated: true,
    account: {
      identifier,
      plan,
      remember
    }
  }
})
