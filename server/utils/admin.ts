import { createHmac } from 'node:crypto'
import { deleteCookie, getCookie, setCookie, type H3Event } from 'h3'

export const ADMIN_SESSION_COOKIE = 'income-expense-note-admin-session-v1'

export function normalizeAdminIdentifier(identifier: string) {
  const trimmed = identifier.trim()
  if (trimmed.includes('@')) {
    return trimmed.toLowerCase()
  }

  return trimmed.replace(/[^\d+]/g, '')
}

export function createAdminSessionToken(identifier: string, secret: string) {
  const normalized = normalizeAdminIdentifier(identifier)
  const signature = createHmac('sha256', secret).update(normalized).digest('hex')
  return `${normalized}.${signature}`
}

export function verifyAdminSessionToken(token: string | undefined | null, secret: string) {
  if (!token || !secret) return null

  const [email, signature] = token.split('.')
  if (!email || !signature) return null

  const expected = createHmac('sha256', secret).update(email).digest('hex')
  if (expected !== signature) return null

  return email
}

export function readAdminSession(event: H3Event, secret: string) {
  const token = getCookie(event, ADMIN_SESSION_COOKIE)
  const identifier = verifyAdminSessionToken(token, secret)

  return identifier ? { identifier } : null
}

export function setAdminSession(event: H3Event, identifier: string, secret: string) {
  setCookie(event, ADMIN_SESSION_COOKIE, createAdminSessionToken(identifier, secret), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 30
  })
}

export function clearAdminSession(event: H3Event) {
  deleteCookie(event, ADMIN_SESSION_COOKIE, { path: '/' })
}
