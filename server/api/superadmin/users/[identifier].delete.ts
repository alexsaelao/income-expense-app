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

  await ensureAuthTable(db)
  await ensureStateTable(db)

  const normalizedIdentifier = normalizeAuthIdentifier(identifier)
  const stateKey = stateKeyForIdentifier(identifier)

  const accountResult = await db.execute({
    sql: `DELETE FROM ${AUTH_ACCOUNT_TABLE} WHERE identifier_normalized = ?`,
    args: [normalizedIdentifier]
  })

  const stateResult = await db.execute({
    sql: `DELETE FROM ${APP_STATE_TABLE} WHERE state_key = ?`,
    args: [stateKey]
  })

  return {
    ok: true,
    connected: true,
    deleted: Number(accountResult.rowsAffected ?? 0) > 0,
    cloudDeleted: Number(stateResult.rowsAffected ?? 0) > 0
  }
})
