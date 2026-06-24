import {
  mapCategoryRow,
  mapCompanyRow,
  mapWalletRow
} from '~/server/utils/money-data-db'
import { requireMoneyDataAccess } from '~/server/utils/money-data-api'
import {
  CATEGORIES_TABLE,
  COMPANIES_TABLE,
  ensureCategoriesTable,
  ensureCompaniesTable,
  ensureWalletsTable,
  transactionOwnerKeyForIdentifier,
  WALLETS_TABLE
} from '~/server/utils/turso'

export default defineEventHandler(async (event) => {
  const { db, session } = requireMoneyDataAccess(event)
  const ownerKey = transactionOwnerKeyForIdentifier(session.identifier)

  await Promise.all([
    ensureWalletsTable(db),
    ensureCategoriesTable(db),
    ensureCompaniesTable(db)
  ])

  const [walletsResult, categoriesResult, companiesResult] = await Promise.all([
    db.execute({
      sql: `
        SELECT wallet_id, name, currency, opening_balance, color, emoji, note, created_at, updated_at
        FROM ${WALLETS_TABLE}
        WHERE owner_key = ?
        ORDER BY created_at DESC, updated_at DESC
      `,
      args: [ownerKey]
    }),
    db.execute({
      sql: `
        SELECT category_id, type, name, emoji, color, enabled, created_at, updated_at
        FROM ${CATEGORIES_TABLE}
        WHERE owner_key = ?
        ORDER BY type ASC, created_at DESC, updated_at DESC
      `,
      args: [ownerKey]
    }),
    db.execute({
      sql: `
        SELECT company_id, name, emoji, color, enabled, created_at, updated_at
        FROM ${COMPANIES_TABLE}
        WHERE owner_key = ?
        ORDER BY created_at DESC, updated_at DESC
      `,
      args: [ownerKey]
    })
  ])

  return {
    ok: true,
    wallets: walletsResult.rows.map(row => mapWalletRow(row as never)),
    categories: categoriesResult.rows.map(row => mapCategoryRow(row as never)),
    companies: companiesResult.rows.map(row => mapCompanyRow(row as never))
  }
})
