import { readBody } from 'h3'
import { createError } from 'h3'
import { ensureStateTable, getTursoClient, stateKeyForIdentifier } from '~/server/utils/turso'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const db = getTursoClient({
    tursoDatabaseUrl: config.tursoDatabaseUrl,
    tursoAuthToken: config.tursoAuthToken
  })

  if (!db) {
    return { ok: false, connected: false }
  }

  const body = await readBody<{ identifier?: string; state?: unknown }>(event)
  const identifier = body?.identifier?.trim()
  if (!identifier) {
    throw createError({ statusCode: 400, statusMessage: 'Missing identifier' })
  }

  if (!body?.state) {
    throw createError({ statusCode: 400, statusMessage: 'Missing state payload' })
  }

  await ensureStateTable(db)
  const now = new Date().toISOString()
  await db.execute({
    sql: `
      INSERT INTO app_state (state_key, state_json, updated_at)
      VALUES (?, ?, ?)
      ON CONFLICT(state_key) DO UPDATE SET
        state_json = excluded.state_json,
        updated_at = excluded.updated_at
    `,
    args: [stateKeyForIdentifier(identifier), JSON.stringify(body.state), now]
  })

  return { ok: true, connected: true }
})
