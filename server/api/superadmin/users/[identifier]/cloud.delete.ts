import { createError, getRouterParam } from 'h3'
import { APP_STATE_TABLE, AUTH_ACCOUNT_TABLE, ensureAuthTable, ensureStateTable, getTursoClient, normalizeAuthIdentifier, stateKeyForIdentifier } from '~/server/utils/turso'
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

  const db = getTursoClient({
    tursoDatabaseUrl: config.tursoDatabaseUrl,
    tursoAuthToken: config.tursoAuthToken
  })

  if (!db) {
    return { ok: false, connected: false, deleted: false }
  }

  await ensureStateTable(db)
  await ensureAuthTable(db)

  const result = await db.execute({
    sql: `DELETE FROM ${APP_STATE_TABLE} WHERE state_key = ?`,
    args: [stateKeyForIdentifier(identifier)]
  })

  const now = new Date().toISOString()
  await db.execute({
    sql: `
      UPDATE ${AUTH_ACCOUNT_TABLE}
      SET cloud_cleared_count = COALESCE(cloud_cleared_count, 0) + ?,
          cloud_cleared_at = ?,
          updated_at = ?
      WHERE identifier_normalized = ?
    `,
    args: [Number(result.rowsAffected ?? 0) > 0 ? 1 : 0, now, now, normalizeAuthIdentifier(identifier)]
  })

  return {
    ok: true,
    connected: true,
    deleted: Number(result.rowsAffected ?? 0) > 0
  }
})
