import { createError, readBody } from 'h3'
import {
  ensureAdminTable,
  getTursoClient,
  hashPin,
  normalizeAuthIdentifier,
  ADMIN_ACCOUNT_TABLE
} from '~/server/utils/turso'
import { setAdminSession } from '~/server/utils/admin'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const db = getTursoClient({
    tursoDatabaseUrl: config.tursoDatabaseUrl,
    tursoAuthToken: config.tursoAuthToken
  })

  const body = await readBody<{ identifier?: string; pin?: string }>(event)
  const identifier = body?.identifier?.trim()
  const pin = body?.pin?.trim()

  if (!db) {
    throw createError({ statusCode: 503, statusMessage: 'Database not configured' })
  }

  if (!identifier || !pin) {
    throw createError({ statusCode: 400, statusMessage: 'Missing identifier or PIN' })
  }

  if (!/^\d{6}$/.test(pin)) {
    throw createError({ statusCode: 400, statusMessage: 'PIN must be 6 digits' })
  }

  await ensureAdminTable(db, {
    adminLoginIdentifier: config.adminLoginIdentifier,
    adminLoginPin: config.adminLoginPin
  })

  const normalized = normalizeAuthIdentifier(identifier)
  const result = await db.execute({
    sql: `
      SELECT identifier, identifier_type, pin_salt, pin_hash
      FROM ${ADMIN_ACCOUNT_TABLE}
      WHERE identifier_normalized = ?
      LIMIT 1
    `,
    args: [normalized]
  })

  const row = result.rows[0] as {
    identifier?: string
    identifier_type?: string
    pin_salt?: string
    pin_hash?: string
  } | undefined

  if (!row?.pin_salt || !row?.pin_hash) {
    throw createError({ statusCode: 404, statusMessage: 'Admin not found' })
  }

  const nextHash = hashPin(pin, row.pin_salt)
  if (nextHash !== row.pin_hash) {
    throw createError({ statusCode: 401, statusMessage: 'PIN is not correct' })
  }

  setAdminSession(event, row.identifier ?? identifier, config.adminSessionSecret ?? 'income-expense-note-admin-secret')

  return {
    ok: true,
    connected: true,
    admin: {
      identifier: row.identifier ?? identifier,
      identifierType: row.identifier_type ?? 'phone'
    }
  }
})
