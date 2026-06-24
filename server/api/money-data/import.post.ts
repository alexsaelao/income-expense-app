import { readBody } from 'h3'
import type { CategoryItem, CompanyItem, Wallet } from '~/composables/useMoneyNote'
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
  const body = await readBody<{
    wallets?: Wallet[]
    categories?: CategoryItem[]
    companies?: CompanyItem[]
  }>(event)

  const wallets = Array.isArray(body?.wallets) ? body.wallets : []
  const categories = Array.isArray(body?.categories) ? body.categories : []
  const companies = Array.isArray(body?.companies) ? body.companies : []

  await Promise.all([
    ensureWalletsTable(db),
    ensureCategoriesTable(db),
    ensureCompaniesTable(db)
  ])

  for (const wallet of wallets) {
    const createdAt = wallet.updatedAt ?? new Date().toISOString()
    const updatedAt = wallet.updatedAt ?? createdAt

    await db.execute({
      sql: `
        INSERT INTO ${WALLETS_TABLE} (
          owner_key, wallet_id, name, currency, opening_balance, color, emoji, note, created_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(owner_key, wallet_id) DO UPDATE SET
          name = excluded.name,
          currency = excluded.currency,
          opening_balance = excluded.opening_balance,
          color = excluded.color,
          emoji = excluded.emoji,
          note = excluded.note,
          updated_at = excluded.updated_at
      `,
      args: [
        ownerKey,
        wallet.id,
        wallet.name,
        wallet.currency,
        wallet.openingBalance,
        wallet.color,
        wallet.emoji,
        wallet.note ?? null,
        createdAt,
        updatedAt
      ]
    })
  }

  for (const category of categories) {
    const createdAt = category.createdAt ?? category.updatedAt ?? new Date().toISOString()
    const updatedAt = category.updatedAt ?? createdAt

    await db.execute({
      sql: `
        INSERT INTO ${CATEGORIES_TABLE} (
          owner_key, category_id, type, name, emoji, color, enabled, created_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(owner_key, category_id) DO UPDATE SET
          type = excluded.type,
          name = excluded.name,
          emoji = excluded.emoji,
          color = excluded.color,
          enabled = excluded.enabled,
          updated_at = excluded.updated_at
      `,
      args: [
        ownerKey,
        category.id,
        category.type,
        category.name,
        category.emoji,
        category.color,
        category.enabled ? 1 : 0,
        createdAt,
        updatedAt
      ]
    })
  }

  for (const company of companies) {
    if (company.name === 'Other' || company.id.startsWith('company-default-')) {
      continue
    }

    const createdAt = company.createdAt ?? company.updatedAt ?? new Date().toISOString()
    const updatedAt = company.updatedAt ?? createdAt

    await db.execute({
      sql: `
        INSERT INTO ${COMPANIES_TABLE} (
          owner_key, company_id, name, emoji, color, enabled, created_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(owner_key, company_id) DO UPDATE SET
          name = excluded.name,
          emoji = excluded.emoji,
          color = excluded.color,
          enabled = excluded.enabled,
          updated_at = excluded.updated_at
      `,
      args: [
        ownerKey,
        company.id,
        company.name,
        company.emoji,
        company.color,
        company.enabled ? 1 : 0,
        createdAt,
        updatedAt
      ]
    })
  }

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
