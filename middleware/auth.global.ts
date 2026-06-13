import { AUTH_HYDRATED_STATE_KEY, AUTH_SERVER_SESSION_STATE_KEY, type ServerAuthSessionSnapshot } from '~/composables/useDeviceAuth'

const AUTH_PAGES = new Set(['/login', '/register'])
const ADMIN_AUTH_PAGES = new Set(['/admin-login'])

function isPublicPage(path: string) {
  return path === '/offline' || AUTH_PAGES.has(path) || ADMIN_AUTH_PAGES.has(path)
}

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

  if (isPublicPage(to.path)) {
    return
  }

  const serverAuthSession = useState<ServerAuthSessionSnapshot>(AUTH_SERVER_SESSION_STATE_KEY, createEmptyServerAuthSession)
  const authHydrated = useState(AUTH_HYDRATED_STATE_KEY, () => false)

  if (!serverAuthSession.value.loaded) {
    if (import.meta.client && !authHydrated.value) {
      return
    }

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
  }

  const isAuthPage = AUTH_PAGES.has(to.path)

  if (serverAuthSession.value.authenticated && isAuthPage) {
    return navigateTo('/', { replace: true })
  }

  if (!serverAuthSession.value.authenticated && !isAuthPage) {
    if (import.meta.server || !authHydrated.value) {
      return
    }

    return navigateTo('/login', { replace: true })
  }
})
