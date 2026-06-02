import { createError, getQuery } from 'h3'
import { ensureStateTable, getTursoClient, stateKeyForIdentifier, normalizeDbTimestamp } from '~/server/utils/turso'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const db = getTursoClient({
    tursoDatabaseUrl: config.tursoDatabaseUrl,
    tursoAuthToken: config.tursoAuthToken
  })

  const query = getQuery<{ identifier?: string }>(event)
  const identifier = query.identifier?.trim()

  if (!db) {
    return { state: null, connected: false }
  }

  if (!identifier) {
    throw createError({ statusCode: 400, statusMessage: 'Missing identifier' })
  }

  await ensureStateTable(db)

  const result = await db.execute({
    sql: `SELECT state_json, updated_at FROM app_state WHERE state_key = ?`,
    args: [stateKeyForIdentifier(identifier)]
  })

  const row = result.rows[0] as { state_json?: string; updated_at?: string } | undefined
  if (!row?.state_json) {
    return { state: null, connected: true }
  }

  try {
    return {
      state: JSON.parse(row.state_json),
      updatedAt: normalizeDbTimestamp(row.updated_at),
      connected: true
    }
  }
  catch {
    return { state: null, updatedAt: normalizeDbTimestamp(row.updated_at), connected: true }
  }
})
