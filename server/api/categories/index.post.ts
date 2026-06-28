import { createError, readBody } from 'h3'
import { isBuiltInCategoryName, mapCategoryRow, validateCategoryCreateInput } from '~/server/utils/money-data-db'
import { requireMoneyDataAccess } from '~/server/utils/money-data-api'
import {
  CATEGORIES_TABLE,
  ensureCategoriesTable,
  transactionOwnerKeyForIdentifier
} from '~/server/utils/turso'

export default defineEventHandler(async (event) => {
  const { db, session } = requireMoneyDataAccess(event)
  const ownerKey = transactionOwnerKeyForIdentifier(session.identifier)
  const payload = validateCategoryCreateInput(await readBody(event))

  await ensureCategoriesTable(db)

  const duplicate = await db.execute({
    sql: `
      SELECT category_id
      FROM ${CATEGORIES_TABLE}
      WHERE owner_key = ? AND type = ? AND LOWER(name) = ?
      LIMIT 1
    `,
    args: [ownerKey, payload.type, payload.name.toLowerCase()]
  })

  if (duplicate.rows.length || isBuiltInCategoryName(payload.type, payload.name)) {
    throw createError({ statusCode: 409, statusMessage: 'Category name already exists' })
  }

  const categoryId = `category-${crypto.randomUUID()}`
  const now = new Date().toISOString()

  await db.execute({
    sql: `
      INSERT INTO ${CATEGORIES_TABLE} (
        owner_key, category_id, type, name, emoji, color, enabled, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)
    `,
    args: [
      ownerKey,
      categoryId,
      payload.type,
      payload.name,
      payload.emoji,
      payload.color,
      now,
      now
    ]
  })

  return {
    ok: true,
    category: mapCategoryRow({
      category_id: categoryId,
      type: payload.type,
      name: payload.name,
      emoji: payload.emoji,
      color: payload.color,
      enabled: 1,
      created_at: now,
      updated_at: now
    })
  }
})
