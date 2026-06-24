import { createError, getRouterParam, readBody } from 'h3'
import { mapCategoryRow, validateCategoryUpdateInput } from '~/server/utils/money-data-db'
import { requireMoneyDataAccess } from '~/server/utils/money-data-api'
import {
  CATEGORIES_TABLE,
  ensureCategoriesTable,
  ensureTransactionsTable,
  transactionOwnerKeyForIdentifier,
  TRANSACTIONS_TABLE
} from '~/server/utils/turso'

export default defineEventHandler(async (event) => {
  const { db, session } = requireMoneyDataAccess(event)
  const ownerKey = transactionOwnerKeyForIdentifier(session.identifier)
  const categoryId = getRouterParam(event, 'id')?.trim()

  if (!categoryId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing category id' })
  }

  const payload = validateCategoryUpdateInput(await readBody(event))

  await Promise.all([
    ensureCategoriesTable(db),
    ensureTransactionsTable(db)
  ])

  const existingResult = await db.execute({
    sql: `
      SELECT category_id, type, name, emoji, color, enabled, created_at, updated_at
      FROM ${CATEGORIES_TABLE}
      WHERE owner_key = ? AND category_id = ?
      LIMIT 1
    `,
    args: [ownerKey, categoryId]
  })

  const existing = existingResult.rows[0] as {
    category_id?: string
    type?: string
    name?: string
    emoji?: string
    color?: string
    enabled?: number | string | boolean | null
    created_at?: string | null
    updated_at?: string | null
  } | undefined

  if (!existing?.category_id) {
    throw createError({ statusCode: 404, statusMessage: 'Category not found' })
  }

  const duplicate = await db.execute({
    sql: `
      SELECT category_id
      FROM ${CATEGORIES_TABLE}
      WHERE owner_key = ? AND type = ? AND LOWER(name) = ? AND category_id != ?
      LIMIT 1
    `,
    args: [ownerKey, existing.type, payload.name.toLowerCase(), categoryId]
  })

  if (duplicate.rows.length) {
    throw createError({ statusCode: 409, statusMessage: 'Category name already exists' })
  }

  const now = new Date().toISOString()

  await db.execute({
    sql: `
      UPDATE ${CATEGORIES_TABLE}
      SET name = ?, emoji = ?, color = ?, enabled = ?, updated_at = ?
      WHERE owner_key = ? AND category_id = ?
    `,
    args: [
      payload.name,
      payload.emoji,
      payload.color,
      typeof payload.enabled === 'boolean' ? (payload.enabled ? 1 : 0) : existing.enabled,
      now,
      ownerKey,
      categoryId
    ]
  })

  await db.execute({
    sql: `
      UPDATE ${TRANSACTIONS_TABLE}
      SET category = ?, updated_at = ?
      WHERE owner_key = ? AND type = ? AND category = ?
    `,
    args: [
      payload.name,
      now,
      ownerKey,
      existing.type,
      existing.name
    ]
  })

  return {
    ok: true,
    category: mapCategoryRow({
      category_id: categoryId,
      type: existing.type,
      name: payload.name,
      emoji: payload.emoji,
      color: payload.color,
      enabled: typeof payload.enabled === 'boolean' ? (payload.enabled ? 1 : 0) : existing.enabled,
      created_at: existing.created_at,
      updated_at: now
    })
  }
})
