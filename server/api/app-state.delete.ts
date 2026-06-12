import { createError, getQuery } from 'h3'
import { ensureStateTable, getTursoClient, stateKeyForIdentifier } from '~/server/utils/turso'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const db = getTursoClient({
    tursoDatabaseUrl: config.tursoDatabaseUrl,
    tursoAuthToken: config.tursoAuthToken
  })

  const query = getQuery<{ identifier?: string }>(event)
  const identifier = query.identifier?.trim()

  if (!db) {
    return { ok: false, connected: false }
  }

  if (!identifier) {
    throw createError({ statusCode: 400, statusMessage: 'Missing identifier' })
  }

  try {
    await ensureStateTable(db)
    await db.execute({
      sql: `DELETE FROM app_state WHERE state_key = ?`,
      args: [stateKeyForIdentifier(identifier)]
    })

    return { ok: true, connected: true }
  }
  catch {
    return { ok: false, connected: false }
  }
})
