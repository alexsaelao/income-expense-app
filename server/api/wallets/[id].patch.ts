import { createError, getRouterParam, readBody } from 'h3'
import { mapWalletRow, validateWalletUpdateInput } from '~/server/utils/money-data-db'
import { requireMoneyDataAccess } from '~/server/utils/money-data-api'
import {
  ensureWalletsTable,
  transactionOwnerKeyForIdentifier,
  WALLETS_TABLE
} from '~/server/utils/turso'

export default defineEventHandler(async (event) => {
  const { db, session } = requireMoneyDataAccess(event)
  const ownerKey = transactionOwnerKeyForIdentifier(session.identifier)
  const walletId = getRouterParam(event, 'id')?.trim()

  if (!walletId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing wallet id' })
  }

  const payload = validateWalletUpdateInput(await readBody(event))

  await ensureWalletsTable(db)

  const existingResult = await db.execute({
    sql: `
      SELECT wallet_id, name, currency, opening_balance, color, emoji, note, created_at, updated_at
      FROM ${WALLETS_TABLE}
      WHERE owner_key = ? AND wallet_id = ?
      LIMIT 1
    `,
    args: [ownerKey, walletId]
  })

  const existing = existingResult.rows[0] as {
    wallet_id?: string
    name?: string
    currency?: string
    opening_balance?: number | string
    color?: string
    emoji?: string
    note?: string | null
    created_at?: string | null
    updated_at?: string | null
  } | undefined

  if (!existing?.wallet_id) {
    throw createError({ statusCode: 404, statusMessage: 'Wallet not found' })
  }

  const duplicate = await db.execute({
    sql: `
      SELECT wallet_id
      FROM ${WALLETS_TABLE}
      WHERE owner_key = ? AND LOWER(name) = ? AND wallet_id != ?
      LIMIT 1
    `,
    args: [ownerKey, payload.name.toLowerCase(), walletId]
  })

  if (duplicate.rows.length) {
    throw createError({ statusCode: 409, statusMessage: 'Wallet name already exists' })
  }

  const now = new Date().toISOString()

  await db.execute({
    sql: `
      UPDATE ${WALLETS_TABLE}
      SET name = ?, color = ?, emoji = ?, note = ?, updated_at = ?
      WHERE owner_key = ? AND wallet_id = ?
    `,
    args: [
      payload.name,
      payload.color,
      payload.emoji,
      payload.note ?? null,
      now,
      ownerKey,
      walletId
    ]
  })

  return {
    ok: true,
    wallet: mapWalletRow({
      wallet_id: walletId,
      name: payload.name,
      currency: existing.currency,
      opening_balance: existing.opening_balance,
      color: payload.color,
      emoji: payload.emoji,
      note: payload.note ?? null,
      created_at: existing.created_at,
      updated_at: now
    })
  }
})
