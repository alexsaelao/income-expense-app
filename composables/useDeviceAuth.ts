export type ProfileAvatarType = 'emoji' | 'icon'

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

const REMEMBER_KEY = 'income-expense-note-auth-remember-v1'
const SESSION_KEY = 'income-expense-note-auth-session-v1'

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

    const storedRememberedProfile = readStorage<AuthProfile>(REMEMBER_KEY)
    const storedSessionProfile = readSession<AuthSession>(SESSION_KEY)

    rememberedProfile.value = storedRememberedProfile
      ? {
          ...storedRememberedProfile,
          avatarValue: normalizeAvatarValue(storedRememberedProfile.avatarType, storedRememberedProfile.avatarValue)
        }
      : null
    sessionProfile.value = storedSessionProfile
      ? {
          ...storedSessionProfile,
          avatarValue: normalizeAvatarValue(storedSessionProfile.avatarType, storedSessionProfile.avatarValue)
        }
      : null
    hydrated.value = true
    authReady.value = true
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
  }

  function setSessionPlan(plan: 'free' | 'pro') {
    if (!sessionProfile.value) return

    sessionProfile.value = {
      ...sessionProfile.value,
      plan
    }

    writeSession(SESSION_KEY, sessionProfile.value)
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
    setProfileAvatar,
    signOut,
    clearRememberedProfile,
    hydrateAuth
  }
}
