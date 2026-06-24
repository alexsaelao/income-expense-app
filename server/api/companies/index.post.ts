import { createError, readBody } from 'h3'
import { mapCompanyRow, validateCompanyCreateInput } from '~/server/utils/money-data-db'
import { requireMoneyDataAccess } from '~/server/utils/money-data-api'
import {
  COMPANIES_TABLE,
  ensureCompaniesTable,
  transactionOwnerKeyForIdentifier
} from '~/server/utils/turso'

export default defineEventHandler(async (event) => {
  const { db, session } = requireMoneyDataAccess(event)
  const ownerKey = transactionOwnerKeyForIdentifier(session.identifier)
  const payload = validateCompanyCreateInput(await readBody(event))

  await ensureCompaniesTable(db)

  const duplicate = await db.execute({
    sql: `
      SELECT company_id
      FROM ${COMPANIES_TABLE}
      WHERE owner_key = ? AND LOWER(name) = ?
      LIMIT 1
    `,
    args: [ownerKey, payload.name.toLowerCase()]
  })

  if (duplicate.rows.length || payload.name.toLowerCase() === 'other') {
    throw createError({ statusCode: 409, statusMessage: 'Company name already exists' })
  }

  const companyId = `company-${crypto.randomUUID()}`
  const now = new Date().toISOString()

  await db.execute({
    sql: `
      INSERT INTO ${COMPANIES_TABLE} (
        owner_key, company_id, name, emoji, color, enabled, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, 1, ?, ?)
    `,
    args: [
      ownerKey,
      companyId,
      payload.name,
      payload.emoji,
      payload.color,
      now,
      now
    ]
  })

  return {
    ok: true,
    company: mapCompanyRow({
      company_id: companyId,
      name: payload.name,
      emoji: payload.emoji,
      color: payload.color,
      enabled: 1,
      created_at: now,
      updated_at: now
    })
  }
})
