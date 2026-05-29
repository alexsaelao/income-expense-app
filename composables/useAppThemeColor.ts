const THEME_COLOR_STORAGE_KEY = 'income-expense-note-theme-color-v1'

export type AppThemeColor = 'blue' | 'red' | 'green' | 'amber' | 'violet' | 'rose'

export const appThemeColorOptions: Array<{
  label: string
  value: AppThemeColor
  hex: string
  accent: string
}> = [
  { label: 'Blue', value: 'blue', hex: '#0ea5e9', accent: 'from-sky-500 to-cyan-400' },
  { label: 'Red', value: 'red', hex: '#fb7185', accent: 'from-rose-400 to-pink-300' },
  { label: 'Green', value: 'green', hex: '#4ade80', accent: 'from-emerald-400 to-teal-300' },
  { label: 'Amber', value: 'amber', hex: '#fbbf24', accent: 'from-amber-300 to-yellow-200' },
  { label: 'Violet', value: 'violet', hex: '#a78bfa', accent: 'from-violet-300 to-fuchsia-300' },
  { label: 'Pink', value: 'rose', hex: '#f472b6', accent: 'from-pink-300 to-rose-200' }
]

const themeColorToUiColor: Record<AppThemeColor, string> = {
  blue: 'sky',
  red: 'rose',
  green: 'emerald',
  amber: 'amber',
  violet: 'violet',
  rose: 'pink'
}

let themeSyncStarted = false

function normalizeThemeColor(value?: string | null): AppThemeColor {
  if (value === 'red' || value === 'green' || value === 'amber' || value === 'violet' || value === 'rose') {
    return value
  }

  return 'blue'
}

export function useAppThemeColor() {
  const themeCookie = useCookie<AppThemeColor>(THEME_COLOR_STORAGE_KEY, {
    default: () => 'blue',
    sameSite: 'lax',
    path: '/'
  })
  const selectedThemeColor = useState<AppThemeColor>('income-expense-note-theme-color', () => normalizeThemeColor(themeCookie.value))
  const appConfig = useAppConfig()

  const activeTheme = computed(() => appThemeColorOptions.find(option => option.value === selectedThemeColor.value) ?? appThemeColorOptions[0])

  function setThemeColor(value: AppThemeColor) {
    selectedThemeColor.value = value
  }

  useHead(() => ({
    htmlAttrs: {
      'data-theme-color': selectedThemeColor.value
    },
    meta: [
      { name: 'theme-color', content: activeTheme.value.hex }
    ]
  }))

  if (import.meta.client && !themeSyncStarted) {
    themeSyncStarted = true

    const storedTheme = normalizeThemeColor(localStorage.getItem(THEME_COLOR_STORAGE_KEY))
    selectedThemeColor.value = storedTheme
    themeCookie.value = storedTheme

      watch(
        selectedThemeColor,
        (value) => {
          localStorage.setItem(THEME_COLOR_STORAGE_KEY, value)
          themeCookie.value = value
          appConfig.ui.colors.primary = themeColorToUiColor[value]
          document.documentElement.dataset.themeColor = value
        },
        { immediate: true }
      )
  }
  else if (import.meta.server) {
    appConfig.ui.colors.primary = themeColorToUiColor[selectedThemeColor.value]
  }

  return {
    selectedThemeColor,
    activeTheme,
    appThemeColorOptions,
    setThemeColor
  }
}
