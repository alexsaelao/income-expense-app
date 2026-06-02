import { clearAdminSession } from '~/server/utils/admin'

export default defineEventHandler((event) => {
  clearAdminSession(event)

  return { ok: true }
})
