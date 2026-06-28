import { createError, getRouterParam } from 'h3'
import { requireMoneyDataAccess } from '~/server/utils/money-data-api'
import {
  ensureTransactionsTable,
  ensureWalletsTable,
  transactionOwnerKeyForIdentifier,
  TRANSACTIONS_TABLE,
  WALLETS_TABLE
} from '~/server/utils/turso'

export default defineEventHandler(async (event) => {
  const walletId = getRouterParam(event, 'id')?.trim()

  try {
    const { db, session } = requireMoneyDataAccess(event)
    const ownerKey = transactionOwnerKeyForIdentifier(session.identifier)

    if (!walletId) {
      throw createError({ statusCode: 400, statusMessage: 'Missing wallet id' })
    }

    await Promise.all([
      ensureWalletsTable(db),
      ensureTransactionsTable(db)
    ])

    const existing = await db.execute({
      sql: `
        SELECT wallet_id
        FROM ${WALLETS_TABLE}
        WHERE owner_key = ? AND wallet_id = ?
        LIMIT 1
      `,
      args: [ownerKey, walletId]
    })

    if (!existing.rows.length) {
      throw createError({ statusCode: 404, statusMessage: 'Wallet not found' })
    }

    await db.execute({
      sql: `
        DELETE FROM ${TRANSACTIONS_TABLE}
        WHERE owner_key = ? AND (wallet_id = ? OR to_wallet_id = ?)
      `,
      args: [ownerKey, walletId, walletId]
    })

    await db.execute({
      sql: `
        DELETE FROM ${WALLETS_TABLE}
        WHERE owner_key = ? AND wallet_id = ?
      `,
      args: [ownerKey, walletId]
    })

    return { ok: true }
  }
  catch (error) {
    const maybeError = error as {
      statusCode?: number
      statusMessage?: string
      message?: string
      data?: { statusMessage?: string; message?: string }
    }

    console.error('[api] delete wallet failed', {
      walletId: walletId ?? '',
      path: event.path,
      statusCode: maybeError?.statusCode,
      statusMessage: maybeError?.statusMessage ?? maybeError?.data?.statusMessage ?? maybeError?.message,
      error
    })
    throw error
  }
})
