import { createError, getQuery } from 'h3'
import { ensureProRedeemTable, getTursoClient, PRO_REDEEM_TABLE, normalizeDbTimestamp } from '~/server/utils/turso'
import { readAdminSession } from '~/server/utils/admin'

function parsePaginationValue(value: unknown, fallback: number) {
  const numeric = Number(Array.isArray(value) ? value[0] : value)
  if (!Number.isFinite(numeric)) return fallback
  return Math.max(1, Math.floor(numeric))
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const session = readAdminSession(event, config.adminSessionSecret ?? 'income-expense-note-admin-secret')
  const query = getQuery(event)
  const page = parsePaginationValue(query.page, 1)
  const limit = parsePaginationValue(query.limit, 40)
  const activeOnly = String(Array.isArray(query.activeOnly) ? query.activeOnly[0] : query.activeOnly ?? '')
    .toLowerCase()
    .trim() === '1'

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

  const whereClause = activeOnly
    ? 'WHERE active = 1 AND redeemed_at IS NULL'
    : ''

  const totalResult = await db.execute({
    sql: `
      SELECT COUNT(*) AS total_keys
      FROM ${PRO_REDEEM_TABLE}
      ${whereClause}
    `,
    args: []
  })

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
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `,
    args: [limit, Math.max(page - 1, 0) * limit]
  })

  const total = Number(totalResult.rows[0]?.total_keys ?? 0)
  const totalPages = Math.max(1, Math.ceil(total / limit))

  return {
    connected: true,
    keys: result.rows.map(row => ({
      code: (row.code as string | undefined) ?? '',
      active: Number(row.active ?? 0) === 1,
      redeemedBy: (row.redeemed_by as string | null | undefined) ?? null,
      redeemedAt: normalizeDbTimestamp(row.redeemed_at as string | null | undefined),
      createdAt: normalizeDbTimestamp(row.created_at as string | undefined) ?? '',
      updatedAt: normalizeDbTimestamp(row.updated_at as string | undefined) ?? ''
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages
    }
  }
})
