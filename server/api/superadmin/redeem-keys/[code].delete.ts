import { createError } from 'h3'
import { ensureProRedeemTable, getTursoClient, normalizeRedeemCode, PRO_REDEEM_TABLE } from '~/server/utils/turso'
import { readAdminSession } from '~/server/utils/admin'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const session = readAdminSession(event, config.adminSessionSecret ?? 'income-expense-note-admin-secret')

  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Admin login required' })
  }

  const codeParam = getRouterParam(event, 'code')
  const normalizedCode = normalizeRedeemCode(codeParam ?? '')

  if (!normalizedCode) {
    throw createError({ statusCode: 400, statusMessage: 'Missing key code' })
  }

  const db = getTursoClient({
    tursoDatabaseUrl: config.tursoDatabaseUrl,
    tursoAuthToken: config.tursoAuthToken
  })

  if (!db) {
    throw createError({ statusCode: 503, statusMessage: 'Database not configured' })
  }

  await ensureProRedeemTable(db)

  const existing = await db.execute({
    sql: `SELECT code_normalized FROM ${PRO_REDEEM_TABLE} WHERE code_normalized = ? LIMIT 1`,
    args: [normalizedCode]
  })

  if (!existing.rows.length) {
    throw createError({ statusCode: 404, statusMessage: 'Key not found' })
  }

  await db.execute({
    sql: `DELETE FROM ${PRO_REDEEM_TABLE} WHERE code_normalized = ?`,
    args: [normalizedCode]
  })

  return {
    ok: true,
    deleted: true
  }
})
