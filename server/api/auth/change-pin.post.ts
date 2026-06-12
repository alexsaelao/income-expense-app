import { createError, readBody } from 'h3'
import {
  createPinSalt,
  ensureAuthTable,
  getTursoClient,
  hashPin,
  AUTH_ACCOUNT_TABLE
} from '~/server/utils/turso'
import { readUserSession } from '~/server/utils/auth-session'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const db = getTursoClient({
    tursoDatabaseUrl: config.tursoDatabaseUrl,
    tursoAuthToken: config.tursoAuthToken
  })
  const session = readUserSession(event, config.userSessionSecret ?? 'wallet-codesabai-user-secret')
  const body = await readBody<{
    oldPin?: string
    newPin?: string
    confirmNewPin?: string
  }>(event)

  if (!db) {
    throw createError({ statusCode: 503, statusMessage: 'Database not configured' })
  }

  if (!session?.identifier) {
    throw createError({ statusCode: 401, statusMessage: 'Login required' })
  }

  const oldPin = body?.oldPin?.trim()
  const newPin = body?.newPin?.trim()
  const confirmNewPin = body?.confirmNewPin?.trim()

  if (!oldPin || !newPin || !confirmNewPin) {
    throw createError({ statusCode: 400, statusMessage: 'Missing PIN fields' })
  }

  if (!/^\d{6}$/.test(oldPin) || !/^\d{6}$/.test(newPin) || !/^\d{6}$/.test(confirmNewPin)) {
    throw createError({ statusCode: 400, statusMessage: 'PIN must be 6 digits' })
  }

  if (newPin !== confirmNewPin) {
    throw createError({ statusCode: 400, statusMessage: 'New PINs do not match' })
  }

  await ensureAuthTable(db)

  const result = await db.execute({
    sql: `
      SELECT identifier, pin_salt, pin_hash
      FROM ${AUTH_ACCOUNT_TABLE}
      WHERE identifier_normalized = ?
      LIMIT 1
    `,
    args: [session.identifier]
  })

  const row = result.rows[0] as {
    identifier?: string
    pin_salt?: string
    pin_hash?: string
  } | undefined

  if (!row?.pin_salt || !row?.pin_hash) {
    throw createError({ statusCode: 404, statusMessage: 'Account not found' })
  }

  if (hashPin(oldPin, row.pin_salt) !== row.pin_hash) {
    throw createError({ statusCode: 401, statusMessage: 'Old PIN is not correct' })
  }

  const salt = createPinSalt()
  const nextHash = hashPin(newPin, salt)
  const now = new Date().toISOString()

  await db.execute({
    sql: `
      UPDATE ${AUTH_ACCOUNT_TABLE}
      SET pin_salt = ?, pin_hash = ?, updated_at = ?
      WHERE identifier_normalized = ?
    `,
    args: [
      salt,
      nextHash,
      now,
      session.identifier
    ]
  })

  return {
    ok: true,
    account: {
      identifier: row.identifier ?? session.identifier
    }
  }
})
