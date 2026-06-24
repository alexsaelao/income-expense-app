import { createError, type H3Event } from 'h3'
import { readUserSession } from '~/server/utils/auth-session'
import { getTursoClient } from '~/server/utils/turso'

export function requireMoneyDataAccess(event: H3Event) {
  const config = useRuntimeConfig()
  const session = readUserSession(event, config.userSessionSecret ?? 'wallet-codesabai-user-secret')

  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Authentication required' })
  }

  if (session.plan !== 'pro') {
    throw createError({ statusCode: 403, statusMessage: 'Pro required' })
  }

  const db = getTursoClient({
    tursoDatabaseUrl: config.tursoDatabaseUrl,
    tursoAuthToken: config.tursoAuthToken
  })

  if (!db) {
    throw createError({ statusCode: 503, statusMessage: 'Database not configured' })
  }

  return {
    db,
    session
  }
}
