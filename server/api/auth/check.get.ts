import { createError, getQuery } from 'h3'
import { ensureAuthTable, getTursoClient, normalizeAuthIdentifier, AUTH_ACCOUNT_TABLE } from '~/server/utils/turso'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const db = getTursoClient({
    tursoDatabaseUrl: config.tursoDatabaseUrl,
    tursoAuthToken: config.tursoAuthToken
  })

  const query = getQuery<{ identifier?: string }>(event)
  const identifier = query.identifier?.trim()

  if (!db) {
    return { connected: false, exists: false, account: null }
  }

  if (!identifier) {
    throw createError({ statusCode: 400, statusMessage: 'Missing identifier' })
  }

  await ensureAuthTable(db)
  const normalized = normalizeAuthIdentifier(identifier)
  const result = await db.execute({
    sql: `SELECT identifier, identifier_type, plan, remember, created_at, updated_at FROM ${AUTH_ACCOUNT_TABLE} WHERE identifier_normalized = ? LIMIT 1`,
    args: [normalized]
  })

  const row = result.rows[0] as {
    identifier?: string
    identifier_type?: string
    plan?: string
    remember?: number
    created_at?: string
    updated_at?: string
  } | undefined

  if (!row) {
    return { connected: true, exists: false, account: null }
  }

  return {
    connected: true,
    exists: true,
    account: {
      identifier: row.identifier ?? identifier,
      identifierType: row.identifier_type ?? 'phone',
      plan: row.plan === 'pro' ? 'pro' : 'free',
      remember: Boolean(row.remember),
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }
  }
})
