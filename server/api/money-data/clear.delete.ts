import { requireMoneyDataAccess } from '~/server/utils/money-data-api'
import {
  APP_STATE_TABLE,
  CATEGORIES_TABLE,
  COMPANIES_TABLE,
  ensureCategoriesTable,
  ensureCompaniesTable,
  ensureStateTable,
  ensureTransactionsTable,
  ensureUserPreferencesTable,
  ensureWalletsTable,
  stateKeyForIdentifier,
  transactionOwnerKeyForIdentifier,
  TRANSACTIONS_TABLE,
  USER_PREFERENCES_TABLE,
  WALLETS_TABLE
} from '~/server/utils/turso'

export default defineEventHandler(async (event) => {
  const { db, session } = requireMoneyDataAccess(event)
  const ownerKey = transactionOwnerKeyForIdentifier(session.identifier)
  const stateKey = stateKeyForIdentifier(session.identifier)

  await Promise.all([
    ensureTransactionsTable(db),
    ensureWalletsTable(db),
    ensureCategoriesTable(db),
    ensureCompaniesTable(db),
    ensureUserPreferencesTable(db),
    ensureStateTable(db)
  ])

  await Promise.all([
    db.execute({
      sql: `DELETE FROM ${TRANSACTIONS_TABLE} WHERE owner_key = ?`,
      args: [ownerKey]
    }),
    db.execute({
      sql: `DELETE FROM ${WALLETS_TABLE} WHERE owner_key = ?`,
      args: [ownerKey]
    }),
    db.execute({
      sql: `DELETE FROM ${CATEGORIES_TABLE} WHERE owner_key = ?`,
      args: [ownerKey]
    }),
    db.execute({
      sql: `DELETE FROM ${COMPANIES_TABLE} WHERE owner_key = ?`,
      args: [ownerKey]
    }),
    db.execute({
      sql: `DELETE FROM ${USER_PREFERENCES_TABLE} WHERE owner_key = ?`,
      args: [ownerKey]
    }),
    db.execute({
      sql: `DELETE FROM ${APP_STATE_TABLE} WHERE state_key = ?`,
      args: [stateKey]
    })
  ])

  return { ok: true }
})
