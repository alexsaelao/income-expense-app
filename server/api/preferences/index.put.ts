import { readBody } from 'h3'
import { normalizeMoneyPreferencesPayload } from '~/server/utils/money-preferences-db'
import { requireMoneyDataAccess } from '~/server/utils/money-data-api'
import {
  ensureUserPreferencesTable,
  transactionOwnerKeyForIdentifier,
  USER_PREFERENCES_TABLE
} from '~/server/utils/turso'

export default defineEventHandler(async (event) => {
  const { db, session } = requireMoneyDataAccess(event)
  const ownerKey = transactionOwnerKeyForIdentifier(session.identifier)
  const body = await readBody<{ preferences?: unknown }>(event)
  const preferences = normalizeMoneyPreferencesPayload(body?.preferences)
  const now = new Date().toISOString()

  await ensureUserPreferencesTable(db)

  await db.execute({
    sql: `
      INSERT INTO ${USER_PREFERENCES_TABLE} (owner_key, preferences_json, updated_at)
      VALUES (?, ?, ?)
      ON CONFLICT(owner_key) DO UPDATE SET
        preferences_json = excluded.preferences_json,
        updated_at = excluded.updated_at
    `,
    args: [ownerKey, JSON.stringify(preferences), now]
  })

  return {
    ok: true,
    preferences,
    updatedAt: now
  }
})
