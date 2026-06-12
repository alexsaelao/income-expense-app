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

  const body = await readBody<{
    identifier?: string
    snapshot?: unknown
    state?: unknown
    updatedAt?: string
  }>(event)
  const identifier = body?.identifier?.trim()
  if (!identifier) {
    throw createError({ statusCode: 400, statusMessage: 'Missing identifier' })
  }

  const payload = body?.snapshot ?? body?.state
  if (!payload) {
    throw createError({ statusCode: 400, statusMessage: 'Missing state payload' })
  }

  try {
    await ensureStateTable(db)
    const updatedAt = typeof body.updatedAt === 'string' && body.updatedAt.trim()
      ? body.updatedAt.trim()
      : new Date().toISOString()
    const snapshot = body?.snapshot ?? {
      state: body?.state,
      selectedCurrency: 'LAK',
      currencySupport: { LAK: true, THB: true, USD: true }
    }
    await db.execute({
      sql: `
        INSERT INTO app_state (state_key, state_json, updated_at)
        VALUES (?, ?, ?)
        ON CONFLICT(state_key) DO UPDATE SET
          state_json = excluded.state_json,
          updated_at = excluded.updated_at
      `,
      args: [stateKeyForIdentifier(identifier), JSON.stringify(snapshot), updatedAt]
    })

    return { ok: true, connected: true }
  }
  catch {
    return { ok: false, connected: false }
  }
})
