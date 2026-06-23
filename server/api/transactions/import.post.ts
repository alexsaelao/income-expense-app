import { createError, readBody } from 'h3'
import { readUserSession } from '~/server/utils/auth-session'
import { mapTransactionRow } from '~/server/utils/transaction-db'
import type { Transaction } from '~/composables/useMoneyNote'
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

  const body = await readBody<{ transactions?: Transaction[] }>(event)
  const transactions = Array.isArray(body?.transactions) ? body.transactions : []
  const ownerKey = transactionOwnerKeyForIdentifier(session.identifier)

  await ensureTransactionsTable(db)

  for (const transaction of transactions) {
    await db.execute({
      sql: `
        INSERT INTO ${TRANSACTIONS_TABLE} (
          owner_key, transaction_id, type, wallet_id, to_wallet_id, currency, amount, exchange_rate, category, note, transaction_date, company, counterparty, loan_direction, created_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(owner_key, transaction_id) DO UPDATE SET
          type = excluded.type,
          wallet_id = excluded.wallet_id,
          to_wallet_id = excluded.to_wallet_id,
          currency = excluded.currency,
          amount = excluded.amount,
          exchange_rate = excluded.exchange_rate,
          category = excluded.category,
          note = excluded.note,
          transaction_date = excluded.transaction_date,
          company = excluded.company,
          counterparty = excluded.counterparty,
          loan_direction = excluded.loan_direction,
          created_at = excluded.created_at,
          updated_at = excluded.updated_at
      `,
      args: [
        ownerKey,
        transaction.id,
        transaction.type,
        transaction.walletId,
        transaction.toWalletId ?? null,
        transaction.currency,
        transaction.amount,
        transaction.exchangeRate ?? null,
        transaction.category,
        transaction.note,
        transaction.date,
        transaction.company ?? null,
        transaction.counterparty ?? null,
        transaction.loanDirection ?? null,
        transaction.createdAt,
        transaction.updatedAt
      ]
    })
  }

  const result = await db.execute({
    sql: `
      SELECT transaction_id, type, wallet_id, to_wallet_id, currency, amount, exchange_rate, category, note, transaction_date, company, counterparty, loan_direction, created_at, updated_at
      FROM ${TRANSACTIONS_TABLE}
      WHERE owner_key = ?
      ORDER BY transaction_date DESC, created_at DESC, updated_at DESC
    `,
    args: [ownerKey]
  })

  return {
    ok: true,
    transactions: result.rows.map((row) => mapTransactionRow(row as never))
  }
})
