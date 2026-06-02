import { readAdminSession } from '~/server/utils/admin'

export default defineEventHandler((event) => {
  const config = useRuntimeConfig()
  const session = readAdminSession(event, config.adminSessionSecret ?? 'income-expense-note-admin-secret')

  if (!session) {
    return {
      authenticated: false,
      admin: null
    }
  }

  return {
    authenticated: true,
    admin: session
  }
})
