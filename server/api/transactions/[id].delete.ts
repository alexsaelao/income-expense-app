import { createError, getRouterParam } from 'h3'
import { readUserSession } from '~/server/utils/auth-session'
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

  const transactionId = getRouterParam(event, 'id')?.trim()
  if (!transactionId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing transaction id' })
  }

  const db = getTursoClient({
    tursoDatabaseUrl: config.tursoDatabaseUrl,
    tursoAuthToken: config.tursoAuthToken
  })

  if (!db) {
    throw createError({ statusCode: 503, statusMessage: 'Database not configured' })
  }

  await ensureTransactionsTable(db)

  await db.execute({
    sql: `
      DELETE FROM ${TRANSACTIONS_TABLE}
      WHERE owner_key = ? AND transaction_id = ?
    `,
    args: [transactionOwnerKeyForIdentifier(session.identifier), transactionId]
  })

  return { ok: true }
})
