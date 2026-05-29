type AuthProfile = {
  identifier: string
  pin: string
  remember: boolean
  updatedAt: string
  plan?: 'free' | 'pro'
}

type AuthSession = {
  identifier: string
  signedInAt: string
  plan?: 'free' | 'pro'
}

const REMEMBER_KEY = 'income-expense-note-auth-remember-v1'
const SESSION_KEY = 'income-expense-note-auth-session-v1'

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

export function useDeviceAuth() {
  const authReady = useState('income-expense-note-auth-ready', () => false)
  const hydrated = useState('income-expense-note-auth-hydrated', () => false)
  const rememberedProfile = useState<AuthProfile | null>('income-expense-note-auth-remembered', () => null)
  const sessionProfile = useState<AuthSession | null>('income-expense-note-auth-session', () => null)

  function hydrateAuth() {
    if (hydrated.value || import.meta.server) return

    rememberedProfile.value = readStorage<AuthProfile>(REMEMBER_KEY)
    sessionProfile.value = readSession<AuthSession>(SESSION_KEY)
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

    const profile: AuthProfile = {
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
    writeStorage<AuthProfile>(REMEMBER_KEY, null)
  }

  function signIn(identifier: string, pin: string, remember = true, plan: 'free' | 'pro' = 'free') {
    const normalizedIdentifier = identifier.trim()
    const normalizedPin = pin.trim()

    if (remember) {
      setRememberedProfile(normalizedIdentifier, normalizedPin, true)
    }

    const session: AuthSession = {
      identifier: normalizedIdentifier,
      signedInAt: new Date().toISOString(),
      plan
    }

    sessionProfile.value = session
    writeSession(SESSION_KEY, session)
  }

  function setSessionPlan(plan: 'free' | 'pro') {
    if (!sessionProfile.value) return

    sessionProfile.value = {
      ...sessionProfile.value,
      plan
    }

    writeSession(SESSION_KEY, sessionProfile.value)
  }

  function signOut() {
    sessionProfile.value = null
    writeSession<AuthSession>(SESSION_KEY, null)
  }

  const isAuthenticated = computed(() => Boolean(sessionProfile.value))
  const rememberedIdentifier = computed(() => rememberedProfile.value?.identifier ?? '')

  onMounted(() => {
    ensureHydrated()
  })

  return {
    authReady,
    isAuthenticated,
    rememberedIdentifier,
    rememberedProfile,
    sessionProfile,
    signIn,
    setSessionPlan,
    signOut,
    clearRememberedProfile,
    hydrateAuth
  }
}
