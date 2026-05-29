import { checkTursoConnection, getTursoClient } from '~/server/utils/turso'

let tursoStatusLogged = false

export default defineNitroPlugin(async () => {
  if (tursoStatusLogged) return
  tursoStatusLogged = true

  const config = useRuntimeConfig()
  const db = getTursoClient({
    tursoDatabaseUrl: config.tursoDatabaseUrl,
    tursoAuthToken: config.tursoAuthToken
  })

  if (!db) {
    console.info('[turso] database status: not configured')
    return
  }

  try {
    await checkTursoConnection(db)
    console.info('[turso] database status: connected')
  }
  catch (error) {
    const message = error instanceof Error ? error.message : 'unknown error'
    console.error(`[turso] database status: connection failed (${message})`)
  }
})
