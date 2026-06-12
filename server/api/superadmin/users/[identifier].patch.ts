import { randomInt } from 'node:crypto'
import { createError, getRouterParam, readBody } from 'h3'
import { AUTH_ACCOUNT_TABLE, createPinSalt, ensureAuthTable, getTursoClient, hashPin, normalizeAuthIdentifier } from '~/server/utils/turso'
import { readAdminSession } from '~/server/utils/admin'

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

  const body = await readBody<{
    plan?: 'free' | 'pro'
    remember?: boolean
    resetPassword?: boolean
    pin?: string
  }>(event)

  const db = getTursoClient({
    tursoDatabaseUrl: config.tursoDatabaseUrl,
    tursoAuthToken: config.tursoAuthToken
  })

  if (!db) {
    return { ok: false, connected: false, updated: false }
  }

  await ensureAuthTable(db)

  const now = new Date().toISOString()
  const normalizedIdentifier = normalizeAuthIdentifier(identifier)
  const currentResult = await db.execute({
    sql: `
      SELECT identifier, identifier_type, plan, remember
      FROM ${AUTH_ACCOUNT_TABLE}
      WHERE identifier_normalized = ?
      LIMIT 1
    `,
    args: [normalizedIdentifier]
  })

  const current = currentResult.rows[0] as {
    identifier?: string
    identifier_type?: string
    plan?: string
    remember?: number
  } | undefined

  if (!current) {
    throw createError({ statusCode: 404, statusMessage: 'Account not found' })
  }

  const nextPlan = body?.plan === 'pro' || body?.plan === 'free' ? body.plan : (current.plan === 'pro' ? 'pro' : 'free')
  const nextRemember = typeof body?.remember === 'boolean' ? body.remember : Boolean(current.remember ?? 1)
  const shouldResetPassword = Boolean(body?.resetPassword || body?.pin)
  const updates: string[] = []
  const args: Array<string | number> = []

  updates.push('plan = ?')
  args.push(nextPlan)
  updates.push('remember = ?')
  args.push(nextRemember ? 1 : 0)

  let nextPin: string | null = null

  if (shouldResetPassword) {
    nextPin = body?.pin?.trim() || String(randomInt(100000, 1000000))
    if (!/^\d{6}$/.test(nextPin)) {
      throw createError({ statusCode: 400, statusMessage: 'PIN must be 6 digits' })
    }

    const nextSalt = createPinSalt()
    const nextHash = hashPin(nextPin, nextSalt)
    updates.push('pin_salt = ?')
    updates.push('pin_hash = ?')
    args.push(nextSalt, nextHash)
  }

  updates.push('pro_started_at = CASE WHEN ? = \'pro\' THEN COALESCE(pro_started_at, ?) ELSE pro_started_at END')
  args.push(nextPlan, now)
  updates.push('updated_at = ?')
  args.push(now)
  args.push(normalizedIdentifier)

  const result = await db.execute({
    sql: `
      UPDATE ${AUTH_ACCOUNT_TABLE}
      SET ${updates.join(', ')}
      WHERE identifier_normalized = ?
    `,
    args
  })

  if (Number(result.rowsAffected ?? 0) === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Account not found' })
  }

  return {
    ok: true,
    connected: true,
    updated: true,
    account: {
      identifier: current.identifier ?? identifier,
      identifierType: current.identifier_type ?? 'phone',
      plan: nextPlan,
      remember: nextRemember
    },
    credentials: nextPin
      ? {
          identifier: current.identifier ?? identifier,
          pin: nextPin
        }
      : null
  }
})
