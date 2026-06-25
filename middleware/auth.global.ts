import { AUTH_SERVER_SESSION_STATE_KEY, type ServerAuthSessionSnapshot } from '~/composables/useDeviceAuth'

const AUTH_PAGES = new Set(['/login', '/register'])

function createEmptyServerAuthSession(): ServerAuthSessionSnapshot {
  return {
    loaded: false,
    authenticated: false,
    session: null
  }
}

export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path.startsWith('/admin') || to.path.startsWith('/superadmin')) {
    return
  }

  const serverAuthSession = useState<ServerAuthSessionSnapshot>(AUTH_SERVER_SESSION_STATE_KEY, createEmptyServerAuthSession)

  try {
    const headers = import.meta.server ? useRequestHeaders(['cookie']) : undefined
    const result = await $fetch<{ authenticated: boolean; session: { identifier: string; plan: 'free' | 'pro' } | null }>('/api/auth/me', {
      headers
    })

    serverAuthSession.value = {
      loaded: true,
      authenticated: Boolean(result.authenticated && result.session),
      session: result.authenticated && result.session
        ? {
            identifier: result.session.identifier,
            plan: result.session.plan
          }
        : null
    }
  }
  catch {
    serverAuthSession.value = {
      loaded: true,
      authenticated: false,
      session: null
    }
  }

  const isAuthPage = AUTH_PAGES.has(to.path)

  if (serverAuthSession.value.authenticated && isAuthPage) {
    return navigateTo('/', { replace: true })
  }

  if (!serverAuthSession.value.authenticated && !isAuthPage) {
    return navigateTo('/login', { replace: true })
  }
})
