import { createError, readBody } from 'h3'
import { mapWalletRow, validateWalletCreateInput } from '~/server/utils/money-data-db'
import { requireMoneyDataAccess } from '~/server/utils/money-data-api'
import {
  ensureWalletsTable,
  transactionOwnerKeyForIdentifier,
  WALLETS_TABLE
} from '~/server/utils/turso'

export default defineEventHandler(async (event) => {
  const { db, session } = requireMoneyDataAccess(event)
  const ownerKey = transactionOwnerKeyForIdentifier(session.identifier)
  const payload = validateWalletCreateInput(await readBody(event))

  await ensureWalletsTable(db)

  const duplicate = await db.execute({
    sql: `
      SELECT wallet_id
      FROM ${WALLETS_TABLE}
      WHERE owner_key = ? AND LOWER(name) = ?
      LIMIT 1
    `,
    args: [ownerKey, payload.name.toLowerCase()]
  })

  if (duplicate.rows.length) {
    throw createError({ statusCode: 409, statusMessage: 'Wallet name already exists' })
  }

  const walletId = `wallet-${crypto.randomUUID()}`
  const now = new Date().toISOString()

  await db.execute({
    sql: `
      INSERT INTO ${WALLETS_TABLE} (
        owner_key, wallet_id, name, currency, opening_balance, color, emoji, note, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    args: [
      ownerKey,
      walletId,
      payload.name,
      payload.currency,
      payload.openingBalance,
      payload.color,
      payload.emoji,
      payload.note ?? null,
      now,
      now
    ]
  })

  return {
    ok: true,
    wallet: mapWalletRow({
      wallet_id: walletId,
      name: payload.name,
      currency: payload.currency,
      opening_balance: payload.openingBalance,
      color: payload.color,
      emoji: payload.emoji,
      note: payload.note ?? null,
      created_at: now,
      updated_at: now
    })
  }
})
