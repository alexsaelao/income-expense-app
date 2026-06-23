import { createError } from 'h3'
import { readUserSession } from '~/server/utils/auth-session'
import { mapTransactionRow } from '~/server/utils/transaction-db'
import {
  ensureTransactionsTable,
  getTursoClient,
  transactionOwnerKeyForIdentifier,
  TRANSACTIONS_TABLE
} from '~/server/utils/turso'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const session = readUserSession(event, config.userSessionSecret ?? 'wallet-codesabai-user-secret')

  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Authentication required' })
  }

  const db = getTursoClient({
    tursoDatabaseUrl: config.tursoDatabaseUrl,
    tursoAuthToken: config.tursoAuthToken
  })

  if (!db) {
    throw createError({ statusCode: 503, statusMessage: 'Database not configured' })
  }

  await ensureTransactionsTable(db)

  const result = await db.execute({
    sql: `
      SELECT transaction_id, type, wallet_id, to_wallet_id, currency, amount, exchange_rate, category, note, transaction_date, company, counterparty, loan_direction, created_at, updated_at
      FROM ${TRANSACTIONS_TABLE}
      WHERE owner_key = ?
      ORDER BY transaction_date DESC, created_at DESC, updated_at DESC
    `,
    args: [transactionOwnerKeyForIdentifier(session.identifier)]
  })

  return {
    connected: true,
    transactions: result.rows.map((row) => mapTransactionRow(row as never))
  }
})
