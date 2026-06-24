import { createError, getRouterParam } from 'h3'
import { requireMoneyDataAccess } from '~/server/utils/money-data-api'
import {
  CATEGORIES_TABLE,
  ensureCategoriesTable,
  transactionOwnerKeyForIdentifier
} from '~/server/utils/turso'

export default defineEventHandler(async (event) => {
  const { db, session } = requireMoneyDataAccess(event)
  const ownerKey = transactionOwnerKeyForIdentifier(session.identifier)
  const categoryId = getRouterParam(event, 'id')?.trim()

  if (!categoryId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing category id' })
  }

  await ensureCategoriesTable(db)

  const existing = await db.execute({
    sql: `
      SELECT category_id
      FROM ${CATEGORIES_TABLE}
      WHERE owner_key = ? AND category_id = ?
      LIMIT 1
    `,
    args: [ownerKey, categoryId]
  })

  if (!existing.rows.length) {
    throw createError({ statusCode: 404, statusMessage: 'Category not found' })
  }

  await db.execute({
    sql: `
      DELETE FROM ${CATEGORIES_TABLE}
      WHERE owner_key = ? AND category_id = ?
    `,
    args: [ownerKey, categoryId]
  })

  return { ok: true }
})
