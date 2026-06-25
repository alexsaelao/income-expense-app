type AdminAuthProfile = {
  identifier: string
  pin: string
  remember: boolean
  updatedAt: string
}

type AdminSession = {
  identifier: string
  signedInAt: string
}

type ServerAdminSessionSnapshot = {
  loaded: boolean
  authenticated: boolean
  session: {
    identifier: string
  } | null
}

const REMEMBER_KEY = 'income-expense-note-admin-auth-remember-v1'
const SESSION_KEY = 'income-expense-note-admin-auth-session-v1'
const SERVER_SESSION_KEY = 'income-expense-note-admin-auth-server-session'

function createServerAdminSessionSnapshot(): ServerAdminSessionSnapshot {
  return {
    loaded: false,
    authenticated: false,
    session: null
  }
}

function readStorage<T>(key: string): T | null {
  if (import.meta.server) return null

  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return null
    return JSON.parse(raw) as T
  }
  catch {
    return null
  }
}

function readSession<T>(key: string): T | null {
  if (import.meta.server) return null

  try {
    const raw = window.sessionStorage.getItem(key)
    if (!raw) return null
    return JSON.parse(raw) as T
  }
  catch {
    return null
  }
}

function writeStorage<T>(key: string, value: T | null) {
  if (import.meta.server) return

  if (value === null) {
    window.localStorage.removeItem(key)
    return
  }

  window.localStorage.setItem(key, JSON.stringify(value))
}

function writeSession<T>(key: string, value: T | null) {
  if (import.meta.server) return

  if (value === null) {
    window.sessionStorage.removeItem(key)
    return
  }

  window.sessionStorage.setItem(key, JSON.stringify(value))
}

export function useAdminDeviceAuth() {
  const authReady = useState('income-expense-note-admin-auth-ready', () => false)
  const hydrated = useState('income-expense-note-admin-auth-hydrated', () => false)
  const hydrating = useState('income-expense-note-admin-auth-hydrating', () => false)
  const rememberedProfile = useState<AdminAuthProfile | null>('income-expense-note-admin-auth-remembered', () => null)
  const sessionProfile = useState<AdminSession | null>('income-expense-note-admin-auth-session', () => null)
  const serverAuthSession = useState<ServerAdminSessionSnapshot>(SERVER_SESSION_KEY, createServerAdminSessionSnapshot)

  async function hydrateAuth(force = false) {
    if (hydrating.value) return
    if (!force && hydrated.value) return

    hydrating.value = true

    try {
      rememberedProfile.value = readStorage<AdminAuthProfile>(REMEMBER_KEY)

      const headers = import.meta.server ? useRequestHeaders(['cookie']) : undefined
      const result = await $fetch<{ authenticated: boolean; admin: { identifier: string } | null }>('/api/admin/me', {
        headers
      })

      serverAuthSession.value = {
        loaded: true,
        authenticated: Boolean(result.authenticated && result.admin),
        session: result.authenticated && result.admin
          ? {
              identifier: result.admin.identifier
            }
          : null
      }

      if (serverAuthSession.value.authenticated && serverAuthSession.value.session) {
        const storedSession = readSession<AdminSession>(SESSION_KEY)
        sessionProfile.value = {
          identifier: serverAuthSession.value.session.identifier,
          signedInAt: storedSession?.identifier === serverAuthSession.value.session.identifier
            ? storedSession.signedInAt
            : new Date().toISOString()
        }
        writeSession(SESSION_KEY, sessionProfile.value)
      }
      else {
        sessionProfile.value = null
        writeSession<AdminSession>(SESSION_KEY, null)
      }
    }
    catch {
      serverAuthSession.value = {
        loaded: true,
        authenticated: false,
        session: null
      }
      sessionProfile.value = null
      writeSession<AdminSession>(SESSION_KEY, null)
    }
    finally {
      hydrated.value = true
      authReady.value = true
      hydrating.value = false
    }
  }

  function ensureHydrated() {
    if (!hydrated.value) {
      void hydrateAuth()
    }
  }

  function setRememberedProfile(identifier: string, pin: string, remember: boolean) {
    const normalizedIdentifier = identifier.trim()
    const normalizedPin = pin.trim()

    if (!remember) return

    const profile: AdminAuthProfile = {
      identifier: normalizedIdentifier,
      pin: normalizedPin,
      remember: true,
      updatedAt: new Date().toISOString()
    }

    rememberedProfile.value = profile
    writeStorage(REMEMBER_KEY, profile)
  }

  function clearRememberedProfile() {
    rememberedProfile.value = null
    writeStorage<AdminAuthProfile>(REMEMBER_KEY, null)
  }

  function signIn(identifier: string, pin: string, remember = true) {
    const normalizedIdentifier = identifier.trim()
    const normalizedPin = pin.trim()

    if (remember) {
      setRememberedProfile(normalizedIdentifier, normalizedPin, true)
    }

    const session: AdminSession = {
      identifier: normalizedIdentifier,
      signedInAt: new Date().toISOString()
    }

    sessionProfile.value = session
    writeSession(SESSION_KEY, session)
    serverAuthSession.value = {
      loaded: true,
      authenticated: true,
      session: {
        identifier: normalizedIdentifier
      }
    }
  }

  async function signOut() {
    sessionProfile.value = null
    writeSession<AdminSession>(SESSION_KEY, null)
    serverAuthSession.value = {
      loaded: true,
      authenticated: false,
      session: null
    }

    try {
      await $fetch('/api/admin/logout', {
        method: 'POST'
      })
    }
    catch {
      // Keep the local admin session cleared even if logout transport fails.
    }
  }

  const isAuthenticated = computed(() => Boolean(sessionProfile.value))
  const rememberedIdentifier = computed(() => rememberedProfile.value?.identifier ?? '')

  return {
    authReady,
    isAuthenticated,
    rememberedIdentifier,
    rememberedProfile,
    sessionProfile,
    signIn,
    signOut,
    clearRememberedProfile,
    hydrateAuth
  }
}
