const LANGUAGE_STORAGE_KEY = 'income-expense-note-language-v1'

export type AppLanguage = 'en' | 'lo'

export const appLanguageOptions: Array<{ label: string; value: AppLanguage }> = [
  { label: 'English', value: 'en' },
  { label: 'ລາວ', value: 'lo' }
]

let languageSyncStarted = false

export function useAppLanguage() {
  const languageCookie = useCookie<AppLanguage>(LANGUAGE_STORAGE_KEY, {
    default: () => 'en',
    sameSite: 'lax',
    path: '/'
  })

  const selectedLanguage = useState<AppLanguage>('income-expense-note-language', () => languageCookie.value ?? 'en')

  useHead(() => ({
    htmlAttrs: {
      lang: selectedLanguage.value
    }
  }))

  if (import.meta.client && !languageSyncStarted) {
    languageSyncStarted = true

    const storedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY)
    if (storedLanguage === 'en' || storedLanguage === 'lo') {
      selectedLanguage.value = storedLanguage
      languageCookie.value = storedLanguage
    }

    watch(
      selectedLanguage,
      value => {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, value)
        languageCookie.value = value
        document.documentElement.lang = value
      },
      { immediate: true }
    )
  }

  return {
    selectedLanguage
  }
}
