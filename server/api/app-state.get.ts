import { createError, getQuery } from 'h3'
import { ensureStateTable, getTursoClient, stateKeyForIdentifier, normalizeDbTimestamp } from '~/server/utils/turso'

const DEFAULT_CURRENCY_SUPPORT = { LAK: true, THB: true, USD: true }

function isCurrencyCode(value: unknown): value is 'LAK' | 'THB' | 'USD' {
  return value === 'LAK' || value === 'THB' || value === 'USD'
}

function normalizeCurrencySupport(value: unknown) {
  const support = { ...DEFAULT_CURRENCY_SUPPORT }

  if (!value || typeof value !== 'object') {
    return support
  }

  const candidate = value as Record<string, unknown>
  support.LAK = typeof candidate.LAK === 'boolean' ? candidate.LAK : support.LAK
  support.THB = typeof candidate.THB === 'boolean' ? candidate.THB : support.THB
  support.USD = typeof candidate.USD === 'boolean' ? candidate.USD : support.USD

  if (!Object.values(support).some(Boolean)) {
    support.LAK = true
  }

  return support
}

function parseStoredSnapshot(value: unknown) {
  if (!value || typeof value !== 'object') return null

  const candidate = value as Record<string, unknown>

  if (typeof candidate.stateJson === 'string') {
    let parsedState: unknown = null
    let parsedCurrencySupport: unknown = DEFAULT_CURRENCY_SUPPORT

    try {
      parsedState = JSON.parse(candidate.stateJson)
    }
    catch {
      parsedState = null
    }

    if (typeof candidate.currencySupportJson === 'string') {
      try {
        parsedCurrencySupport = JSON.parse(candidate.currencySupportJson)
      }
      catch {
        parsedCurrencySupport = DEFAULT_CURRENCY_SUPPORT
      }
    }
    else if ('currencySupport' in candidate) {
      parsedCurrencySupport = candidate.currencySupport
    }

    return {
      snapshot: {
        stateJson: candidate.stateJson,
        selectedCurrency: isCurrencyCode(candidate.selectedCurrency) ? candidate.selectedCurrency : 'LAK',
        currencySupportJson: typeof candidate.currencySupportJson === 'string'
          ? candidate.currencySupportJson
          : JSON.stringify(normalizeCurrencySupport(parsedCurrencySupport)),
        updatedAt: typeof candidate.updatedAt === 'string' ? candidate.updatedAt : new Date().toISOString()
      },
      state: parsedState,
      selectedCurrency: isCurrencyCode(candidate.selectedCurrency) ? candidate.selectedCurrency : 'LAK',
      currencySupport: normalizeCurrencySupport(parsedCurrencySupport)
    }
  }

  if ('state' in candidate) {
    const parsedState = candidate.state ?? null
    const selectedCurrency = isCurrencyCode(candidate.selectedCurrency) ? candidate.selectedCurrency : 'LAK'
    const currencySupport = normalizeCurrencySupport(candidate.currencySupport)

    return {
      snapshot: {
        state: parsedState,
        selectedCurrency,
        currencySupport,
        updatedAt: typeof candidate.updatedAt === 'string' ? candidate.updatedAt : new Date().toISOString()
      },
      state: parsedState,
      selectedCurrency,
      currencySupport
    }
  }

  return {
    snapshot: {
      state: candidate,
      selectedCurrency: 'LAK',
      currencySupport: DEFAULT_CURRENCY_SUPPORT,
      updatedAt: new Date().toISOString()
    },
    state: candidate,
    selectedCurrency: 'LAK',
    currencySupport: DEFAULT_CURRENCY_SUPPORT
  }
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const db = getTursoClient({
    tursoDatabaseUrl: config.tursoDatabaseUrl,
    tursoAuthToken: config.tursoAuthToken
  })

  const query = getQuery<{ identifier?: string }>(event)
  const identifier = query.identifier?.trim()

  if (!db) {
    return { state: null, connected: false }
  }

  if (!identifier) {
    throw createError({ statusCode: 400, statusMessage: 'Missing identifier' })
  }

  try {
    await ensureStateTable(db)

    const result = await db.execute({
      sql: `SELECT state_json, updated_at FROM app_state WHERE state_key = ?`,
      args: [stateKeyForIdentifier(identifier)]
    })

    const row = result.rows[0] as { state_json?: string; updated_at?: string } | undefined
    if (!row?.state_json) {
      return { state: null, connected: true }
    }

    try {
      const parsed = JSON.parse(row.state_json)
      const snapshot = parseStoredSnapshot(parsed)

      if (snapshot) {
        return {
          state: snapshot.state,
          snapshot: snapshot.snapshot,
          updatedAt: normalizeDbTimestamp(row.updated_at),
          connected: true
        }
      }

      return {
        state: parsed,
        snapshot: {
          state: parsed,
          selectedCurrency: 'LAK',
          currencySupport: DEFAULT_CURRENCY_SUPPORT
        },
        updatedAt: normalizeDbTimestamp(row.updated_at),
        connected: true
      }
    }
    catch {
      return { state: null, updatedAt: normalizeDbTimestamp(row.updated_at), connected: true }
    }
  }
  catch {
    return { state: null, connected: false }
  }
})
