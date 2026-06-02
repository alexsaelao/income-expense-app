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

const REMEMBER_KEY = 'income-expense-note-admin-auth-remember-v1'
const SESSION_KEY = 'income-expense-note-admin-auth-session-v1'

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
  const rememberedProfile = useState<AdminAuthProfile | null>('income-expense-note-admin-auth-remembered', () => null)
  const sessionProfile = useState<AdminSession | null>('income-expense-note-admin-auth-session', () => null)

  function hydrateAuth() {
    if (hydrated.value || import.meta.server) return

    rememberedProfile.value = readStorage<AdminAuthProfile>(REMEMBER_KEY)
    sessionProfile.value = readSession<AdminSession>(SESSION_KEY)
    hydrated.value = true
    authReady.value = true
  }

  function ensureHydrated() {
    if (!hydrated.value) {
      hydrateAuth()
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
  }

  function signOut() {
    sessionProfile.value = null
    writeSession<AdminSession>(SESSION_KEY, null)
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
