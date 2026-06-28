import { createError } from 'h3'
import type {
  CategoryItem,
  CategoryType,
  CompanyItem,
  CurrencyCode,
  Wallet,
  WalletColor
} from '~/composables/useMoneyNote'
import { normalizeDbTimestamp } from '~/server/utils/turso'

const CURRENCIES = new Set(['LAK', 'THB', 'USD'])
const CATEGORY_TYPES = new Set(['income', 'expense'])
const WALLET_COLORS = new Set(['sky', 'emerald', 'indigo', 'amber', 'rose', 'violet', 'fuchsia', 'slate'])
const BUILT_IN_CATEGORY_NAMES: Record<CategoryType, Set<string>> = {
  income: new Set(['salary', 'freelance', 'gift', 'cashback', 'other']),
  expense: new Set(['food', 'transport', 'bills', 'shopping', 'health', 'family', 'other'])
}

type WalletRow = {
  wallet_id?: string
  name?: string
  currency?: string
  opening_balance?: number | string
  color?: string
  emoji?: string
  note?: string | null
  created_at?: string | null
  updated_at?: string | null
}

type CategoryRow = {
  category_id?: string
  type?: string
  name?: string
  emoji?: string
  color?: string
  enabled?: number | string | boolean | null
  created_at?: string | null
  updated_at?: string | null
}

type CompanyRow = {
  company_id?: string
  name?: string
  emoji?: string
  color?: string
  enabled?: number | string | boolean | null
  created_at?: string | null
  updated_at?: string | null
}

export function mapWalletRow(row: WalletRow): Wallet {
  const color = normalizeWalletColor(row.color)

  return {
    id: String(row.wallet_id ?? ''),
    name: String(row.name ?? '').trim() || 'Wallet',
    currency: normalizeCurrency(row.currency),
    openingBalance: Number(row.opening_balance ?? 0),
    balance: Number(row.opening_balance ?? 0),
    color,
    accent: accentForWalletColor(color),
    emoji: String(row.emoji ?? '').trim() || '💳',
    note: normalizeOptionalString(row.note),
    updatedAt: normalizeDbTimestamp(row.updated_at) ?? new Date().toISOString()
  }
}

export function mapCategoryRow(row: CategoryRow): CategoryItem {
  return {
    id: String(row.category_id ?? ''),
    type: normalizeCategoryType(row.type),
    name: String(row.name ?? '').trim() || 'Category',
    emoji: String(row.emoji ?? '').trim() || '🏷️',
    color: normalizeWalletColor(row.color),
    enabled: normalizeBoolean(row.enabled, true),
    createdAt: normalizeDbTimestamp(row.created_at) ?? new Date().toISOString(),
    updatedAt: normalizeDbTimestamp(row.updated_at) ?? new Date().toISOString()
  }
}

export function mapCompanyRow(row: CompanyRow): CompanyItem {
  return {
    id: String(row.company_id ?? ''),
    name: String(row.name ?? '').trim() || 'Company',
    emoji: String(row.emoji ?? '').trim() || '🏢',
    color: normalizeWalletColor(row.color),
    enabled: normalizeBoolean(row.enabled, true),
    createdAt: normalizeDbTimestamp(row.created_at) ?? new Date().toISOString(),
    updatedAt: normalizeDbTimestamp(row.updated_at) ?? new Date().toISOString()
  }
}

export function validateWalletCreateInput(payload: unknown) {
  if (!payload || typeof payload !== 'object') {
    throw createError({ statusCode: 400, statusMessage: 'Invalid wallet payload' })
  }

  const input = payload as Record<string, unknown>
  const name = String(input.name ?? '').trim()
  const currency = normalizeCurrency(input.currency)
  const openingBalance = Number(input.openingBalance ?? 0)
  const note = normalizeOptionalString(input.note)
  const color = normalizeWalletColor(input.color)
  const emoji = String(input.emoji ?? '').trim() || '💳'

  if (!name) {
    throw createError({ statusCode: 400, statusMessage: 'Missing wallet name' })
  }

  if (!Number.isFinite(openingBalance)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid opening balance' })
  }

  return {
    name,
    currency,
    openingBalance,
    note,
    color,
    emoji
  }
}

export function validateWalletUpdateInput(payload: unknown) {
  if (!payload || typeof payload !== 'object') {
    throw createError({ statusCode: 400, statusMessage: 'Invalid wallet payload' })
  }

  const input = payload as Record<string, unknown>
  const name = String(input.name ?? '').trim()
  const note = normalizeOptionalString(input.note)
  const color = normalizeWalletColor(input.color)
  const emoji = String(input.emoji ?? '').trim() || '💳'

  if (!name) {
    throw createError({ statusCode: 400, statusMessage: 'Missing wallet name' })
  }

  return {
    name,
    note,
    color,
    emoji
  }
}

export function validateCategoryCreateInput(payload: unknown) {
  if (!payload || typeof payload !== 'object') {
    throw createError({ statusCode: 400, statusMessage: 'Invalid category payload' })
  }

  const input = payload as Record<string, unknown>
  const type = normalizeCategoryType(input.type)
  const name = String(input.name ?? '').trim()
  const emoji = String(input.emoji ?? '').trim() || '🏷️'
  const color = normalizeWalletColor(input.color)

  if (!name) {
    throw createError({ statusCode: 400, statusMessage: 'Missing category name' })
  }

  return {
    type,
    name,
    emoji,
    color
  }
}

export function validateCategoryUpdateInput(payload: unknown) {
  if (!payload || typeof payload !== 'object') {
    throw createError({ statusCode: 400, statusMessage: 'Invalid category payload' })
  }

  const input = payload as Record<string, unknown>
  const name = String(input.name ?? '').trim()
  const emoji = String(input.emoji ?? '').trim() || '🏷️'
  const color = normalizeWalletColor(input.color)
  const enabled = typeof input.enabled === 'boolean' ? input.enabled : undefined

  if (!name) {
    throw createError({ statusCode: 400, statusMessage: 'Missing category name' })
  }

  return {
    name,
    emoji,
    color,
    enabled
  }
}

export function isBuiltInCategoryName(type: CategoryType, name: string) {
  return BUILT_IN_CATEGORY_NAMES[type].has(name.trim().toLowerCase())
}

export function validateCompanyCreateInput(payload: unknown) {
  if (!payload || typeof payload !== 'object') {
    throw createError({ statusCode: 400, statusMessage: 'Invalid company payload' })
  }

  const input = payload as Record<string, unknown>
  const name = String(input.name ?? '').trim()
  const emoji = String(input.emoji ?? '').trim() || '🏢'
  const color = normalizeWalletColor(input.color)

  if (!name) {
    throw createError({ statusCode: 400, statusMessage: 'Missing company name' })
  }

  return {
    name,
    emoji,
    color
  }
}

export function validateCompanyUpdateInput(payload: unknown) {
  if (!payload || typeof payload !== 'object') {
    throw createError({ statusCode: 400, statusMessage: 'Invalid company payload' })
  }

  const input = payload as Record<string, unknown>
  const name = String(input.name ?? '').trim()
  const emoji = String(input.emoji ?? '').trim() || '🏢'
  const color = normalizeWalletColor(input.color)
  const enabled = typeof input.enabled === 'boolean' ? input.enabled : undefined

  if (!name) {
    throw createError({ statusCode: 400, statusMessage: 'Missing company name' })
  }

  return {
    name,
    emoji,
    color,
    enabled
  }
}

export function normalizeCurrency(value: unknown): CurrencyCode {
  if (typeof value === 'string' && CURRENCIES.has(value)) {
    return value as CurrencyCode
  }

  throw createError({ statusCode: 400, statusMessage: 'Invalid currency' })
}

export function normalizeCategoryType(value: unknown): CategoryType {
  if (typeof value === 'string' && CATEGORY_TYPES.has(value)) {
    return value as CategoryType
  }

  throw createError({ statusCode: 400, statusMessage: 'Invalid category type' })
}

export function normalizeWalletColor(value: unknown): WalletColor {
  if (typeof value === 'string' && WALLET_COLORS.has(value)) {
    return value as WalletColor
  }

  return 'sky'
}

export function normalizeOptionalString(value: unknown) {
  if (typeof value !== 'string') return undefined
  const normalized = value.trim()
  return normalized || undefined
}

function normalizeBoolean(value: unknown, fallback: boolean) {
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return value !== 0
  if (typeof value === 'string') return value !== '0' && value.toLowerCase() !== 'false'
  return fallback
}

function accentForWalletColor(color: WalletColor) {
  const accents: Record<WalletColor, string> = {
    sky: 'from-sky-500 to-cyan-400',
    emerald: 'from-emerald-500 to-teal-400',
    indigo: 'from-indigo-500 to-violet-400',
    amber: 'from-amber-500 to-orange-400',
    rose: 'from-rose-500 to-pink-400',
    violet: 'from-violet-500 to-fuchsia-400',
    fuchsia: 'from-fuchsia-500 to-pink-400',
    slate: 'from-slate-600 to-slate-800'
  }

  return accents[color]
}
