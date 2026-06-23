import { createError } from 'h3'
import type { Transaction, TransactionInput } from '~/composables/useMoneyNote'
import { normalizeDbTimestamp } from '~/server/utils/turso'

const TRANSACTION_TYPES = new Set(['income', 'expense', 'move', 'loan'])
const CURRENCIES = new Set(['LAK', 'THB', 'USD'])
const LOAN_DIRECTIONS = new Set(['given', 'received'])

type TransactionRow = {
  transaction_id?: string
  type?: string
  wallet_id?: string
  to_wallet_id?: string | null
  currency?: string
  amount?: number | string
  exchange_rate?: number | string | null
  category?: string
  note?: string | null
  transaction_date?: string
  company?: string | null
  counterparty?: string | null
  loan_direction?: string | null
  created_at?: string | null
  updated_at?: string | null
}

export function mapTransactionRow(row: TransactionRow): Transaction {
  return {
    id: String(row.transaction_id ?? ''),
    type: normalizeTransactionType(row.type),
    walletId: String(row.wallet_id ?? ''),
    toWalletId: normalizeOptionalString(row.to_wallet_id),
    currency: normalizeCurrency(row.currency),
    amount: Number(row.amount ?? 0),
    exchangeRate: normalizeOptionalNumber(row.exchange_rate),
    category: String(row.category ?? ''),
    note: String(row.note ?? ''),
    date: String(row.transaction_date ?? ''),
    company: normalizeOptionalString(row.company),
    counterparty: normalizeOptionalString(row.counterparty),
    loanDirection: normalizeLoanDirection(row.loan_direction),
    createdAt: normalizeDbTimestamp(row.created_at) ?? new Date().toISOString(),
    updatedAt: normalizeDbTimestamp(row.updated_at) ?? new Date().toISOString()
  }
}

export function validateTransactionInput(payload: unknown): TransactionInput {
  if (!payload || typeof payload !== 'object') {
    throw createError({ statusCode: 400, statusMessage: 'Invalid transaction payload' })
  }

  const input = payload as Record<string, unknown>
  const type = normalizeTransactionType(input.type)
  const walletId = String(input.walletId ?? '').trim()
  const currency = normalizeCurrency(input.currency)
  const amount = Number(input.amount ?? 0)
  const date = String(input.date ?? '').trim()
  const category = String(input.category ?? '').trim()
  const note = String(input.note ?? '').trim()
  const toWalletId = normalizeOptionalString(input.toWalletId)
  const exchangeRate = normalizeOptionalNumber(input.exchangeRate)
  const company = normalizeOptionalString(input.company)
  const counterparty = normalizeOptionalString(input.counterparty)
  const loanDirection = normalizeLoanDirection(input.loanDirection)

  if (!walletId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing walletId' })
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'Amount must be greater than 0' })
  }

  if (!date) {
    throw createError({ statusCode: 400, statusMessage: 'Missing date' })
  }

  if (!category) {
    throw createError({ statusCode: 400, statusMessage: 'Missing category' })
  }

  if (type === 'move' && !toWalletId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing destination wallet' })
  }

  if (type === 'loan' && !loanDirection) {
    throw createError({ statusCode: 400, statusMessage: 'Missing loan direction' })
  }

  return {
    type,
    walletId,
    toWalletId,
    currency,
    amount,
    exchangeRate,
    category,
    note,
    date,
    company,
    counterparty,
    loanDirection
  }
}

function normalizeTransactionType(value: unknown): Transaction['type'] {
  if (typeof value === 'string' && TRANSACTION_TYPES.has(value)) {
    return value as Transaction['type']
  }

  throw createError({ statusCode: 400, statusMessage: 'Invalid transaction type' })
}

function normalizeCurrency(value: unknown): Transaction['currency'] {
  if (typeof value === 'string' && CURRENCIES.has(value)) {
    return value as Transaction['currency']
  }

  throw createError({ statusCode: 400, statusMessage: 'Invalid currency' })
}

function normalizeLoanDirection(value: unknown): Transaction['loanDirection'] {
  if (typeof value !== 'string' || !value.trim()) {
    return undefined
  }

  if (LOAN_DIRECTIONS.has(value)) {
    return value as Transaction['loanDirection']
  }

  throw createError({ statusCode: 400, statusMessage: 'Invalid loan direction' })
}

function normalizeOptionalString(value: unknown) {
  if (typeof value !== 'string') return undefined
  const normalized = value.trim()
  return normalized || undefined
}

function normalizeOptionalNumber(value: unknown) {
  if (value === null || typeof value === 'undefined' || value === '') {
    return undefined
  }

  const normalized = Number(value)
  if (!Number.isFinite(normalized) || normalized <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid numeric value' })
  }

  return normalized
}
