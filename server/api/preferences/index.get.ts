import { defaultMoneyPreferences, normalizeMoneyPreferencesPayload } from '~/server/utils/money-preferences-db'
import { requireMoneyDataAccess } from '~/server/utils/money-data-api'
import {
  ensureUserPreferencesTable,
  transactionOwnerKeyForIdentifier,
  USER_PREFERENCES_TABLE
} from '~/server/utils/turso'

export default defineEventHandler(async (event) => {
  const { db, session } = requireMoneyDataAccess(event)
  const ownerKey = transactionOwnerKeyForIdentifier(session.identifier)

  await ensureUserPreferencesTable(db)

  const result = await db.execute({
    sql: `
      SELECT preferences_json, updated_at
      FROM ${USER_PREFERENCES_TABLE}
      WHERE owner_key = ?
      LIMIT 1
    `,
    args: [ownerKey]
  })

  const row = result.rows[0] as {
    preferences_json?: string | null
    updated_at?: string | null
  } | undefined

  if (!row?.preferences_json) {
    return {
      ok: true,
      preferences: null,
      updatedAt: null
    }
  }

  try {
    return {
      ok: true,
      preferences: normalizeMoneyPreferencesPayload(JSON.parse(row.preferences_json)),
      updatedAt: row.updated_at ?? null
    }
  }
  catch {
    return {
      ok: true,
      preferences: defaultMoneyPreferences(),
      updatedAt: row.updated_at ?? null
    }
  }
})
