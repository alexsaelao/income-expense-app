import { createHmac } from 'node:crypto'
import { deleteCookie, getCookie, setCookie, type H3Event } from 'h3'

export const AUTH_SESSION_COOKIE = 'income-expense-note-auth-session-v1'

export function normalizeSessionIdentifier(identifier: string) {
  const trimmed = identifier.trim()

  if (trimmed.includes('@')) {
    return trimmed.toLowerCase()
  }

  return trimmed.replace(/[^\d+]/g, '')
}

export function createSessionToken(identifier: string, plan: 'free' | 'pro', secret: string) {
  const normalizedIdentifier = normalizeSessionIdentifier(identifier)
  const payload = `${normalizedIdentifier}:${plan}`
  const signature = createHmac('sha256', secret).update(payload).digest('hex')
  return `${payload}.${signature}`
}

export function verifySessionToken(token: string | undefined | null, secret: string) {
  if (!token || !secret) return null

  const [payload, signature] = token.split('.')
  if (!payload || !signature) return null

  const [identifier, plan] = payload.split(':')
  if (!identifier || (plan !== 'free' && plan !== 'pro')) return null

  const expected = createHmac('sha256', secret).update(payload).digest('hex')
  if (expected !== signature) return null

  return {
    identifier,
    plan: plan as 'free' | 'pro'
  }
}

export function readUserSession(event: H3Event, secret: string) {
  return verifySessionToken(getCookie(event, AUTH_SESSION_COOKIE), secret)
}

export function setUserSession(
  event: H3Event,
  identifier: string,
  plan: 'free' | 'pro',
  secret: string,
  remember = true
) {
  const cookieOptions: Parameters<typeof setCookie>[3] = {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/'
  }

  if (remember) {
    cookieOptions.maxAge = 60 * 60 * 24 * 30
  }

  setCookie(event, AUTH_SESSION_COOKIE, createSessionToken(identifier, plan, secret), cookieOptions)
}

export function clearUserSession(event: H3Event) {
  deleteCookie(event, AUTH_SESSION_COOKIE, { path: '/' })
}
