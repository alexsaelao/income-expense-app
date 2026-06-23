import { createError, readBody } from 'h3'
import { readUserSession } from '~/server/utils/auth-session'
import { mapTransactionRow, validateTransactionInput } from '~/server/utils/transaction-db'
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

  if (session.plan !== 'pro') {
    throw createError({ statusCode: 403, statusMessage: 'Pro required' })
  }

  const db = getTursoClient({
    tursoDatabaseUrl: config.tursoDatabaseUrl,
    tursoAuthToken: config.tursoAuthToken
  })

  if (!db) {
    throw createError({ statusCode: 503, statusMessage: 'Database not configured' })
  }

  const payload = validateTransactionInput(await readBody(event))
  const ownerKey = transactionOwnerKeyForIdentifier(session.identifier)
  const transactionId = `tx-${crypto.randomUUID()}`
  const now = new Date().toISOString()

  await ensureTransactionsTable(db)
  await db.execute({
    sql: `
      INSERT INTO ${TRANSACTIONS_TABLE} (
        owner_key, transaction_id, type, wallet_id, to_wallet_id, currency, amount, exchange_rate, category, note, transaction_date, company, counterparty, loan_direction, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    args: [
      ownerKey,
      transactionId,
      payload.type,
      payload.walletId,
      payload.toWalletId ?? null,
      payload.currency,
      payload.amount,
      payload.exchangeRate ?? null,
      payload.category,
      payload.note,
      payload.date,
      payload.company ?? null,
      payload.counterparty ?? null,
      payload.loanDirection ?? null,
      now,
      now
    ]
  })

  return {
    ok: true,
    transaction: mapTransactionRow({
      transaction_id: transactionId,
      type: payload.type,
      wallet_id: payload.walletId,
      to_wallet_id: payload.toWalletId ?? null,
      currency: payload.currency,
      amount: payload.amount,
      exchange_rate: payload.exchangeRate ?? null,
      category: payload.category,
      note: payload.note,
      transaction_date: payload.date,
      company: payload.company ?? null,
      counterparty: payload.counterparty ?? null,
      loan_direction: payload.loanDirection ?? null,
      created_at: now,
      updated_at: now
    })
  }
})
