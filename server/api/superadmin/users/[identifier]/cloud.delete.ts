import { createError, getRouterParam } from 'h3'
import { APP_STATE_TABLE, AUTH_ACCOUNT_TABLE, ensureAuthTable, ensureStateTable, getTursoClient, normalizeAuthIdentifier, stateKeyForIdentifier } from '~/server/utils/turso'
import { readAdminSession } from '~/server/utils/admin'

function clearCloudTransactionsSnapshot(rawSnapshot: unknown) {
  const now = new Date().toISOString()

  if (!rawSnapshot || typeof rawSnapshot !== 'object' || Array.isArray(rawSnapshot)) {
    return { snapshot: rawSnapshot, clearedTransactions: 0 }
  }

  const candidate = rawSnapshot as Record<string, unknown>

  if (typeof candidate.stateJson === 'string') {
    let parsedState: Record<string, unknown> | null = null

    try {
      const parsed = JSON.parse(candidate.stateJson)
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        parsedState = parsed as Record<string, unknown>
      }
    }
    catch {
      parsedState = null
    }

    if (parsedState) {
      const clearedTransactions = Array.isArray(parsedState.transactions) ? parsedState.transactions.length : 0
      return {
        snapshot: {
          ...candidate,
          stateJson: JSON.stringify({
            ...parsedState,
            transactions: []
          }),
          updatedAt: now
        },
        clearedTransactions
      }
    }

    return {
      snapshot: {
        ...candidate,
        updatedAt: now
      },
      clearedTransactions: 0
    }
  }

  if ('state' in candidate) {
    const state = candidate.state
    if (state && typeof state === 'object' && !Array.isArray(state)) {
      const parsedState = state as Record<string, unknown>
      const clearedTransactions = Array.isArray(parsedState.transactions) ? parsedState.transactions.length : 0
      return {
        snapshot: {
          ...candidate,
          state: {
            ...parsedState,
            transactions: []
          },
          updatedAt: now
        },
        clearedTransactions
      }
    }
  }

  const clearedTransactions = Array.isArray((candidate as { transactions?: unknown[] }).transactions)
    ? ((candidate as { transactions?: unknown[] }).transactions?.length ?? 0)
    : 0

  return {
    snapshot: {
      ...candidate,
      transactions: [],
      updatedAt: now
    },
    clearedTransactions
  }
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const session = readAdminSession(event, config.adminSessionSecret ?? 'income-expense-note-admin-secret')

  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Admin login required' })
  }

  const identifier = decodeURIComponent(getRouterParam(event, 'identifier') ?? '').trim()
  if (!identifier) {
    throw createError({ statusCode: 400, statusMessage: 'Missing identifier' })
  }

  const db = getTursoClient({
    tursoDatabaseUrl: config.tursoDatabaseUrl,
    tursoAuthToken: config.tursoAuthToken
  })

  if (!db) {
    return { ok: false, connected: false, deleted: false }
  }

  await ensureStateTable(db)
  await ensureAuthTable(db)

  const stateKey = stateKeyForIdentifier(identifier)
  const existingStateResult = await db.execute({
    sql: `SELECT state_json FROM ${APP_STATE_TABLE} WHERE state_key = ? LIMIT 1`,
    args: [stateKey]
  })

  const existingStateRow = existingStateResult.rows[0] as { state_json?: string } | undefined
  if (!existingStateRow?.state_json) {
    return {
      ok: true,
      connected: true,
      deleted: false,
      clearedTransactions: 0
    }
  }

  let existingState: unknown = null
  try {
    existingState = JSON.parse(existingStateRow.state_json)
  }
  catch {
    existingState = null
  }

  const { snapshot, clearedTransactions } = clearCloudTransactionsSnapshot(existingState)

  await db.execute({
    sql: `
      UPDATE ${APP_STATE_TABLE}
      SET state_json = ?,
          updated_at = ?
      WHERE state_key = ?
    `,
    args: [JSON.stringify(snapshot), new Date().toISOString(), stateKey]
  })

  const now = new Date().toISOString()
  await db.execute({
    sql: `
      UPDATE ${AUTH_ACCOUNT_TABLE}
      SET cloud_cleared_count = COALESCE(cloud_cleared_count, 0) + ?,
          cloud_cleared_at = ?,
          updated_at = ?
      WHERE identifier_normalized = ?
    `,
    args: [1, now, now, normalizeAuthIdentifier(identifier)]
  })

  return {
    ok: true,
    connected: true,
    deleted: true,
    clearedTransactions
  }
})
