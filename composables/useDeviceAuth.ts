export type ProfileAvatarType = 'emoji' | 'icon'

export const AUTH_SERVER_SESSION_STATE_KEY = 'income-expense-note-auth-server-session'
export const AUTH_HYDRATED_STATE_KEY = 'income-expense-note-auth-hydrated'

export type ServerAuthSessionSnapshot = {
  loaded: boolean
  authenticated: boolean
  session: {
    identifier: string
    plan: 'free' | 'pro'
  } | null
}

type AuthProfile = {
  identifier: string
  pin: string
  remember: boolean
  updatedAt: string
  plan?: 'free' | 'pro'
  avatarType?: ProfileAvatarType
  avatarValue?: string
}

type AuthSession = {
  identifier: string
  signedInAt: string
  plan?: 'free' | 'pro'
  avatarType?: ProfileAvatarType
  avatarValue?: string
}

export type StoredAuthSession = AuthSession

const REMEMBER_KEY = 'income-expense-note-auth-remember-v1'
const SESSION_KEY = 'income-expense-note-auth-session-v1'

function createServerAuthSnapshot(): ServerAuthSessionSnapshot {
  return {
    loaded: false,
    authenticated: false,
    session: null
  }
}

function normalizeAvatarValue(avatarType: ProfileAvatarType | undefined, avatarValue: string | undefined) {
  const normalizedAvatarValue = avatarValue?.trim() ?? ''
  if (!normalizedAvatarValue) return ''

  if (avatarType === 'icon') {
    if (normalizedAvatarValue.startsWith('i-')) return normalizedAvatarValue
    if (normalizedAvatarValue.startsWith('lucide-')) return `i-${normalizedAvatarValue}`
    return `i-lucide-${normalizedAvatarValue}`
  }

  return normalizedAvatarValue
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

export function readStoredAuthSession() {
  return readSession<StoredAuthSession>(SESSION_KEY)
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
  const hydrated = useState(AUTH_HYDRATED_STATE_KEY, () => false)
  const hydrating = useState('income-expense-note-auth-hydrating', () => false)
  const rememberedProfile = useState<AuthProfile | null>('income-expense-note-auth-remembered', () => null)
  const sessionProfile = useState<AuthSession | null>('income-expense-note-auth-session', () => null)
  const serverAuthSession = useState<ServerAuthSessionSnapshot>(AUTH_SERVER_SESSION_STATE_KEY, createServerAuthSnapshot)

  if (!import.meta.server && !rememberedProfile.value) {
    const storedRememberedProfile = readStorage<AuthProfile>(REMEMBER_KEY)
    rememberedProfile.value = storedRememberedProfile
      ? {
          ...storedRememberedProfile,
          avatarValue: normalizeAvatarValue(storedRememberedProfile.avatarType, storedRememberedProfile.avatarValue)
        }
      : null
  }

  if (serverAuthSession.value.loaded) {
    if (serverAuthSession.value.authenticated) {
      applyServerAuthSession(serverAuthSession.value, rememberedProfile.value)
    }
    else {
      sessionProfile.value = null
      writeSession<AuthSession>(SESSION_KEY, null)
    }
    hydrated.value = true
    authReady.value = true
  }

  function applyServerAuthSession(session: ServerAuthSessionSnapshot, remembered: AuthProfile | null) {
    if (!session.authenticated || !session.session) {
      sessionProfile.value = null
      writeSession<AuthSession>(SESSION_KEY, null)
      return
    }

    const storedSessionProfile = readSession<AuthSession>(SESSION_KEY)
    const avatarSource = remembered?.identifier === session.session.identifier
      ? remembered
      : storedSessionProfile?.identifier === session.session.identifier
        ? storedSessionProfile
        : null

    sessionProfile.value = {
      identifier: session.session.identifier,
      signedInAt: storedSessionProfile?.identifier === session.session.identifier
        ? storedSessionProfile.signedInAt
        : new Date().toISOString(),
      plan: session.session.plan,
      avatarType: avatarSource?.avatarType,
      avatarValue: normalizeAvatarValue(avatarSource?.avatarType, avatarSource?.avatarValue) || undefined
    }
    writeSession(SESSION_KEY, sessionProfile.value)
  }

  async function hydrateAuth() {
    if (hydrated.value || hydrating.value || import.meta.server) return

    hydrating.value = true

    try {
      const storedRememberedProfile = readStorage<AuthProfile>(REMEMBER_KEY)

      rememberedProfile.value = storedRememberedProfile
        ? {
            ...storedRememberedProfile,
            avatarValue: normalizeAvatarValue(storedRememberedProfile.avatarType, storedRememberedProfile.avatarValue)
          }
        : null

      const serverSession = await $fetch<{ authenticated: boolean; session: { identifier: string; plan: 'free' | 'pro' } | null }>('/api/auth/me')
      serverAuthSession.value = {
        loaded: true,
        authenticated: Boolean(serverSession.authenticated && serverSession.session),
        session: serverSession.authenticated && serverSession.session
          ? {
              identifier: serverSession.session.identifier,
              plan: serverSession.session.plan
            }
          : null
      }

      if (serverAuthSession.value.authenticated) {
        applyServerAuthSession(serverAuthSession.value, rememberedProfile.value)
      }
      else {
        sessionProfile.value = null
        writeSession<AuthSession>(SESSION_KEY, null)
      }
    }
    catch {
      serverAuthSession.value = {
        loaded: true,
        authenticated: false,
        session: null
      }
      sessionProfile.value = null
      writeSession<AuthSession>(SESSION_KEY, null)
    }
    finally {
      hydrated.value = true
      authReady.value = true
      hydrating.value = false
    }
  }

  function ensureHydrated() {
    if (!hydrated.value) {
      hydrateAuth()
    }
  }

  function setRememberedProfile(
    identifier: string,
    pin: string,
    remember: boolean,
    avatarType?: ProfileAvatarType,
    avatarValue?: string
  ) {
    const normalizedIdentifier = identifier.trim()
    const normalizedPin = pin.trim()
    const normalizedAvatarValue = normalizeAvatarValue(avatarType, avatarValue)

    if (!remember) return

    const profile: AuthProfile = {
      identifier: normalizedIdentifier,
      pin: normalizedPin,
      remember: true,
      updatedAt: new Date().toISOString(),
      avatarType,
      avatarValue: normalizedAvatarValue || undefined
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
    const rememberedAvatarType = rememberedProfile.value?.identifier === normalizedIdentifier
      ? rememberedProfile.value.avatarType
      : undefined
    const rememberedAvatarValue = rememberedProfile.value?.identifier === normalizedIdentifier
      ? normalizeAvatarValue(rememberedProfile.value.avatarType, rememberedProfile.value.avatarValue)
      : undefined

    if (remember) {
      setRememberedProfile(
        normalizedIdentifier,
        normalizedPin,
        true,
        rememberedAvatarType,
        rememberedAvatarValue
      )
    }

    const session: AuthSession = {
      identifier: normalizedIdentifier,
      signedInAt: new Date().toISOString(),
      plan,
      avatarType: rememberedAvatarType,
      avatarValue: rememberedAvatarValue || undefined
    }

    sessionProfile.value = session
    writeSession(SESSION_KEY, session)
    serverAuthSession.value = {
      loaded: true,
      authenticated: true,
      session: {
        identifier: normalizedIdentifier,
        plan
      }
    }
  }

  function setSessionPlan(plan: 'free' | 'pro') {
    if (!sessionProfile.value) return

    sessionProfile.value = {
      ...sessionProfile.value,
      plan
    }

    writeSession(SESSION_KEY, sessionProfile.value)
    serverAuthSession.value = {
      loaded: true,
      authenticated: true,
      session: {
        identifier: sessionProfile.value.identifier,
        plan
      }
    }
  }

  function setProfileAvatar(avatarType: ProfileAvatarType, avatarValue: string) {
    const normalizedAvatarValue = normalizeAvatarValue(avatarType, avatarValue)
    if (!normalizedAvatarValue) return

    if (rememberedProfile.value) {
      rememberedProfile.value = {
        ...rememberedProfile.value,
        avatarType,
        avatarValue: normalizedAvatarValue
      }
      writeStorage(REMEMBER_KEY, rememberedProfile.value)
    }

    if (sessionProfile.value) {
      sessionProfile.value = {
        ...sessionProfile.value,
        avatarType,
        avatarValue: normalizedAvatarValue
      }
      writeSession(SESSION_KEY, sessionProfile.value)
    }
  }

  function updateRememberedPin(identifier: string, pin: string) {
    const normalizedIdentifier = identifier.trim()
    const normalizedPin = pin.trim()

    if (!rememberedProfile.value || rememberedProfile.value.identifier !== normalizedIdentifier) return

    rememberedProfile.value = {
      ...rememberedProfile.value,
      pin: normalizedPin,
      updatedAt: new Date().toISOString()
    }

    writeStorage(REMEMBER_KEY, rememberedProfile.value)
  }

  async function signOut() {
    sessionProfile.value = null
    serverAuthSession.value = {
      loaded: true,
      authenticated: false,
      session: null
    }
    writeSession<AuthSession>(SESSION_KEY, null)

    try {
      await $fetch('/api/auth/logout', {
        method: 'POST'
      })
    }
    catch {
      // Ignore logout transport failures and keep the local session cleared.
    }
  }

  const isAuthenticated = computed(() => Boolean(sessionProfile.value))
  const rememberedIdentifier = computed(() => rememberedProfile.value?.identifier ?? '')

  onMounted(() => {
    ensureHydrated()
  })

  if (!import.meta.server) {
    void hydrateAuth()
  }

  return {
    authReady,
    isAuthenticated,
    rememberedIdentifier,
    rememberedProfile,
    sessionProfile,
    signIn,
    setSessionPlan,
    setProfileAvatar,
    updateRememberedPin,
    signOut,
    clearRememberedProfile,
    hydrateAuth
  }
}
