import { createError, getRouterParam, readBody } from 'h3'
import { mapCompanyRow, validateCompanyUpdateInput } from '~/server/utils/money-data-db'
import { requireMoneyDataAccess } from '~/server/utils/money-data-api'
import {
  COMPANIES_TABLE,
  ensureCompaniesTable,
  ensureTransactionsTable,
  transactionOwnerKeyForIdentifier,
  TRANSACTIONS_TABLE
} from '~/server/utils/turso'

export default defineEventHandler(async (event) => {
  const { db, session } = requireMoneyDataAccess(event)
  const ownerKey = transactionOwnerKeyForIdentifier(session.identifier)
  const companyId = getRouterParam(event, 'id')?.trim()

  if (!companyId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing company id' })
  }

  const payload = validateCompanyUpdateInput(await readBody(event))

  await Promise.all([
    ensureCompaniesTable(db),
    ensureTransactionsTable(db)
  ])

  const existingResult = await db.execute({
    sql: `
      SELECT company_id, name, emoji, color, enabled, created_at, updated_at
      FROM ${COMPANIES_TABLE}
      WHERE owner_key = ? AND company_id = ?
      LIMIT 1
    `,
    args: [ownerKey, companyId]
  })

  const existing = existingResult.rows[0] as {
    company_id?: string
    name?: string
    emoji?: string
    color?: string
    enabled?: number | string | boolean | null
    created_at?: string | null
    updated_at?: string | null
  } | undefined

  if (!existing?.company_id) {
    throw createError({ statusCode: 404, statusMessage: 'Company not found' })
  }

  const duplicate = await db.execute({
    sql: `
      SELECT company_id
      FROM ${COMPANIES_TABLE}
      WHERE owner_key = ? AND LOWER(name) = ? AND company_id != ?
      LIMIT 1
    `,
    args: [ownerKey, payload.name.toLowerCase(), companyId]
  })

  if (duplicate.rows.length || payload.name.toLowerCase() === 'other') {
    throw createError({ statusCode: 409, statusMessage: 'Company name already exists' })
  }

  const now = new Date().toISOString()

  await db.execute({
    sql: `
      UPDATE ${COMPANIES_TABLE}
      SET name = ?, emoji = ?, color = ?, enabled = ?, updated_at = ?
      WHERE owner_key = ? AND company_id = ?
    `,
    args: [
      payload.name,
      payload.emoji,
      payload.color,
      typeof payload.enabled === 'boolean' ? (payload.enabled ? 1 : 0) : existing.enabled,
      now,
      ownerKey,
      companyId
    ]
  })

  await db.execute({
    sql: `
      UPDATE ${TRANSACTIONS_TABLE}
      SET company = ?, updated_at = ?
      WHERE owner_key = ? AND company = ?
    `,
    args: [
      payload.name,
      now,
      ownerKey,
      existing.name
    ]
  })

  return {
    ok: true,
    company: mapCompanyRow({
      company_id: companyId,
      name: payload.name,
      emoji: payload.emoji,
      color: payload.color,
      enabled: typeof payload.enabled === 'boolean' ? (payload.enabled ? 1 : 0) : existing.enabled,
      created_at: existing.created_at,
      updated_at: now
    })
  }
})
