import { createError, getQuery } from 'h3'
import { ensureAuthTable, ensureProRedeemTable, ensureStateTable, getTursoClient, APP_STATE_TABLE, AUTH_ACCOUNT_TABLE, PRO_REDEEM_TABLE, normalizeDbTimestamp } from '~/server/utils/turso'
import { readAdminSession } from '~/server/utils/admin'

type AccountOverviewRow = {
  identifier?: string
  identifier_type?: string
  plan?: string
  remember?: number
  redeem_key_code?: string | null
  pro_started_at?: string | null
  cloud_cleared_count?: number | string | null
  cloud_cleared_at?: string | null
  created_at?: string
  updated_at?: string
  cloud_updated_at?: string | null
  state_json?: string | null
}

function parsePaginationValue(value: unknown, fallback: number) {
  const numeric = Number(Array.isArray(value) ? value[0] : value)
  if (!Number.isFinite(numeric)) return fallback
  return Math.max(0, Math.floor(numeric))
}

function buildPagination(page: number, limit: number, total: number) {
  if (limit <= 0) {
    return {
      page: 1,
      limit,
      total,
      totalPages: 0
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / limit))

  return {
    page: Math.min(Math.max(page, 1), totalPages),
    limit,
    total,
    totalPages
  }
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const session = readAdminSession(event, config.adminSessionSecret ?? 'income-expense-note-admin-secret')
  const query = getQuery(event)
  const accountsPage = parsePaginationValue(query.accountsPage, 1)
  const accountsLimit = parsePaginationValue(query.accountsLimit, 20)
  const redeemKeysPage = parsePaginationValue(query.redeemKeysPage, 1)
  const redeemKeysLimit = parsePaginationValue(query.redeemKeysLimit, 20)

  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Admin login required' })
  }

  const db = getTursoClient({
    tursoDatabaseUrl: config.tursoDatabaseUrl,
    tursoAuthToken: config.tursoAuthToken
  })

  if (!db) {
    return {
      connected: false,
      stats: null,
      accounts: [],
      redeemKeys: [],
      accountsPagination: null,
      redeemKeysPagination: null
    }
  }

  await ensureAuthTable(db)
  await ensureStateTable(db)
  await ensureProRedeemTable(db)

  const accountStatsResult = await db.execute(`
    SELECT
      COUNT(*) AS total_accounts,
      SUM(CASE WHEN plan = 'pro' THEN 1 ELSE 0 END) AS pro_accounts,
      SUM(CASE WHEN plan != 'pro' THEN 1 ELSE 0 END) AS free_accounts
    FROM ${AUTH_ACCOUNT_TABLE}
  `)

  const backupStatsResult = await db.execute(`
    SELECT
      COUNT(*) AS total_backups,
      MAX(updated_at) AS latest_backup_at
    FROM ${APP_STATE_TABLE}
  `)

  const redeemStatsResult = await db.execute(`
    SELECT
      COUNT(*) AS total_keys,
      SUM(CASE WHEN active = 1 AND redeemed_at IS NULL THEN 1 ELSE 0 END) AS active_keys,
      SUM(CASE WHEN redeemed_at IS NOT NULL OR active = 0 THEN 1 ELSE 0 END) AS used_keys
    FROM ${PRO_REDEEM_TABLE}
  `)

  const accountsResult = await db.execute({
    sql: `
      SELECT
        a.identifier,
        a.identifier_type,
        a.plan,
        a.remember,
        (
          SELECT code
          FROM ${PRO_REDEEM_TABLE}
          WHERE redeemed_by = a.identifier_normalized
          ORDER BY redeemed_at DESC, updated_at DESC
          LIMIT 1
        ) AS redeem_key_code,
        a.pro_started_at,
        a.cloud_cleared_count,
        a.cloud_cleared_at,
        a.created_at,
        a.updated_at,
        s.updated_at AS cloud_updated_at,
        s.state_json
      FROM ${AUTH_ACCOUNT_TABLE} AS a
      LEFT JOIN ${APP_STATE_TABLE} AS s
        ON s.state_key = 'money-note-state-v1:' || a.identifier_normalized
      ORDER BY a.updated_at DESC
      LIMIT ? OFFSET ?
    `,
    args: [accountsLimit, Math.max(accountsPage - 1, 0) * accountsLimit]
  })

  const redeemKeysResult = await db.execute({
    sql: `
      SELECT
        code,
        active,
        redeemed_by,
        redeemed_at,
        created_at,
        updated_at
      FROM ${PRO_REDEEM_TABLE}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `,
    args: [redeemKeysLimit, Math.max(redeemKeysPage - 1, 0) * redeemKeysLimit]
  })

  const accounts = accountsResult.rows.map((row) => {
    const parsedState = typeof row.state_json === 'string'
      ? (() => {
          try {
            return JSON.parse(row.state_json as string) as { wallets?: unknown[]; transactions?: unknown[]; categories?: unknown[]; companies?: unknown[] }
          }
          catch {
            return null
          }
      })()
      : null

    const walletCount = Array.isArray(parsedState?.wallets) ? parsedState?.wallets.length ?? 0 : 0
    const transactionCount = Array.isArray(parsedState?.transactions) ? parsedState?.transactions.length ?? 0 : 0
    const categoryCount = Array.isArray(parsedState?.categories) ? parsedState?.categories.length ?? 0 : 0
    const companyCount = Array.isArray(parsedState?.companies) ? parsedState?.companies.length ?? 0 : 0
    const cloudSizeBytes = typeof row.state_json === 'string'
      ? Buffer.byteLength(row.state_json, 'utf8')
      : 0
    const proStartedAt = normalizeDbTimestamp(row.pro_started_at as string | null | undefined) ?? ((row.plan as string | undefined) === 'pro'
      ? (normalizeDbTimestamp(row.updated_at as string | undefined) ?? normalizeDbTimestamp(row.created_at as string | undefined) ?? null)
      : null)

    return {
      identifier: (row.identifier as string | undefined) ?? '',
      identifierType: (row.identifier_type as string | undefined) ?? 'phone',
      plan: (row.plan as string | undefined) ?? 'free',
      remember: Boolean(row.remember ?? 1),
      redeemKeyCode: (row.redeem_key_code as string | null | undefined) ?? null,
      createdAt: normalizeDbTimestamp(row.created_at as string | undefined) ?? '',
      updatedAt: normalizeDbTimestamp(row.updated_at as string | undefined) ?? '',
      proStartedAt,
      cloudClearedCount: Number(row.cloud_cleared_count ?? 0),
      cloudClearedAt: normalizeDbTimestamp(row.cloud_cleared_at as string | null | undefined),
      cloudUpdatedAt: normalizeDbTimestamp(row.cloud_updated_at as string | null | undefined),
      walletCount,
      transactionCount,
      categoryCount,
      companyCount,
      recordCount: walletCount + transactionCount + categoryCount + companyCount,
      cloudSizeBytes
    }
  })

  const redeemKeys = redeemKeysResult.rows.map((row) => ({
    code: (row.code as string | undefined) ?? '',
    active: Number(row.active ?? 0) === 1,
    redeemedBy: (row.redeemed_by as string | null | undefined) ?? null,
    redeemedAt: normalizeDbTimestamp(row.redeemed_at as string | null | undefined),
    createdAt: normalizeDbTimestamp(row.created_at as string | undefined) ?? '',
    updatedAt: normalizeDbTimestamp(row.updated_at as string | undefined) ?? ''
  }))

  const totalAccounts = Number(accountStatsResult.rows[0]?.total_accounts ?? 0)
  const proAccounts = Number(accountStatsResult.rows[0]?.pro_accounts ?? 0)
  const freeAccounts = Number(accountStatsResult.rows[0]?.free_accounts ?? 0)
  const totalBackups = Number(backupStatsResult.rows[0]?.total_backups ?? 0)
  const latestBackupAt = normalizeDbTimestamp(backupStatsResult.rows[0]?.latest_backup_at as string | undefined)
  const totalKeys = Number(redeemStatsResult.rows[0]?.total_keys ?? 0)
  const activeKeys = Number(redeemStatsResult.rows[0]?.active_keys ?? 0)
  const usedKeys = Number(redeemStatsResult.rows[0]?.used_keys ?? 0)

  return {
    connected: true,
    stats: {
      totalAccounts,
      proAccounts,
      freeAccounts,
      totalBackups,
      latestBackupAt,
      totalKeys,
      activeKeys,
      usedKeys
    },
    accounts,
    redeemKeys,
    accountsPagination: buildPagination(accountsPage, accountsLimit, totalAccounts),
    redeemKeysPagination: buildPagination(redeemKeysPage, redeemKeysLimit, totalKeys)
  }
})
