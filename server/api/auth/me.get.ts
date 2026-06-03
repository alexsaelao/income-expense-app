import { readUserSession } from '~/server/utils/auth-session'

export default defineEventHandler((event) => {
  const config = useRuntimeConfig()
  const session = readUserSession(event, config.userSessionSecret ?? 'wallet-codesabai-user-secret')

  return {
    authenticated: Boolean(session),
    session: session
      ? {
          identifier: session.identifier,
          plan: session.plan
        }
      : null
  }
})
