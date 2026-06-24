import { createError, getRouterParam } from 'h3'
import { requireMoneyDataAccess } from '~/server/utils/money-data-api'
import {
  COMPANIES_TABLE,
  ensureCompaniesTable,
  transactionOwnerKeyForIdentifier
} from '~/server/utils/turso'

export default defineEventHandler(async (event) => {
  const { db, session } = requireMoneyDataAccess(event)
  const ownerKey = transactionOwnerKeyForIdentifier(session.identifier)
  const companyId = getRouterParam(event, 'id')?.trim()

  if (!companyId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing company id' })
  }

  await ensureCompaniesTable(db)

  const existing = await db.execute({
    sql: `
      SELECT company_id
      FROM ${COMPANIES_TABLE}
      WHERE owner_key = ? AND company_id = ?
      LIMIT 1
    `,
    args: [ownerKey, companyId]
  })

  if (!existing.rows.length) {
    throw createError({ statusCode: 404, statusMessage: 'Company not found' })
  }

  await db.execute({
    sql: `
      DELETE FROM ${COMPANIES_TABLE}
      WHERE owner_key = ? AND company_id = ?
    `,
    args: [ownerKey, companyId]
  })

  return { ok: true }
})
