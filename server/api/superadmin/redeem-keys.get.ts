import { createError } from 'h3'
import { ensureProRedeemTable, getTursoClient, PRO_REDEEM_TABLE, normalizeDbTimestamp } from '~/server/utils/turso'
import { readAdminSession } from '~/server/utils/admin'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const session = readAdminSession(event, config.adminSessionSecret ?? 'income-expense-note-admin-secret')

  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Admin login required' })
  }

  const db = getTursoClient({
    tursoDatabaseUrl: config.tursoDatabaseUrl,
    tursoAuthToken: config.tursoAuthToken
  })

  if (!db) {
    return { connected: false, keys: [] }
  }

  await ensureProRedeemTable(db)

  const result = await db.execute({
    sql: `
      SELECT
        code,
        active,
        redeemed_by,
        redeemed_at,
        created_at,
        updated_at
      FROM ${PRO_REDEEM_TABLE}
      ORDER BY created_at DESC
      LIMIT 40
    `,
    args: []
  })

  return {
    connected: true,
    keys: result.rows.map(row => ({
      code: (row.code as string | undefined) ?? '',
      active: Number(row.active ?? 0) === 1,
      redeemedBy: (row.redeemed_by as string | null | undefined) ?? null,
      redeemedAt: normalizeDbTimestamp(row.redeemed_at as string | null | undefined),
      createdAt: normalizeDbTimestamp(row.created_at as string | undefined) ?? '',
      updatedAt: normalizeDbTimestamp(row.updated_at as string | undefined) ?? ''
    }))
  }
})
