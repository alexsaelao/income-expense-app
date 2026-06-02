import { createError, readBody } from 'h3'
import { randomBytes } from 'node:crypto'
import { ensureProRedeemTable, getTursoClient, normalizeRedeemCode, PRO_REDEEM_TABLE } from '~/server/utils/turso'
import { readAdminSession } from '~/server/utils/admin'

function generateRedeemCode() {
  const chunk = randomBytes(6).toString('hex').toUpperCase()
  return `PRO-${chunk.slice(0, 4)}-${chunk.slice(4, 8)}-${chunk.slice(8, 12)}`
}

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
    throw createError({ statusCode: 503, statusMessage: 'Database not configured' })
  }

  await ensureProRedeemTable(db)

  let code = generateRedeemCode()
  let normalized = normalizeRedeemCode(code)
  let tries = 0

  while (tries < 4) {
    const exists = await db.execute({
      sql: `SELECT code_normalized FROM ${PRO_REDEEM_TABLE} WHERE code_normalized = ? LIMIT 1`,
      args: [normalized]
    })

    if (!exists.rows.length) break

    code = generateRedeemCode()
    normalized = normalizeRedeemCode(code)
    tries += 1
  }

  const now = new Date().toISOString()
  await db.execute({
    sql: `
      INSERT INTO ${PRO_REDEEM_TABLE} (
        code_normalized,
        code,
        active,
        created_at,
        updated_at
      ) VALUES (?, ?, 1, ?, ?)
    `,
    args: [normalized, code, now, now]
  })

  return {
    ok: true,
    connected: true,
    key: {
      code,
      active: true,
      redeemedBy: null,
      redeemedAt: null,
      createdAt: now,
      updatedAt: now
    }
  }
})
