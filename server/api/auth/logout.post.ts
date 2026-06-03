import { clearUserSession } from '~/server/utils/auth-session'

export default defineEventHandler((event) => {
  clearUserSession(event)

  return {
    ok: true
  }
})
