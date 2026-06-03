import { createError, readBody } from 'h3'
import { readUserSession, setUserSession } from '~/server/utils/auth-session'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const session = readUserSession(event, config.userSessionSecret ?? 'wallet-codesabai-user-secret')

  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Login required' })
  }

  const body = await readBody<{ plan?: 'free' | 'pro'; remember?: boolean }>(event)
  const plan = body?.plan === 'pro' ? 'pro' : 'free'
  const remember = Boolean(body?.remember ?? true)

  setUserSession(event, session.identifier, plan, config.userSessionSecret ?? 'wallet-codesabai-user-secret', remember)

  return {
    ok: true,
    session: {
      identifier: session.identifier,
      plan
    }
  }
})
