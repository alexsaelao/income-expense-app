<script setup lang="ts">
type Locale = 'en' | 'lo'
type Theme = 'light' | 'dark'

const moonIcon = `
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401" />
  </svg>
`

const sunIcon = `
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2" />
    <path d="M12 20v2" />
    <path d="m4.93 4.93 1.41 1.41" />
    <path d="m17.66 17.66 1.41 1.41" />
    <path d="M2 12h2" />
    <path d="M20 12h2" />
    <path d="m6.34 17.66-1.41 1.41" />
    <path d="m19.07 4.93-1.41 1.41" />
  </svg>
`

const plusIcon = `
  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M5 12h14" />
    <path d="M12 5v14" />
  </svg>
`

const downloadIcon = `
  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M12 15V3" />
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <path d="m7 10 5 5 5-5" />
  </svg>
`

const arrowRightIcon = `
  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
`

const arrowUpIcon = `
  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M12 19V5" />
    <path d="m5 12 7-7 7 7" />
  </svg>
`

const globeIcon = `
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
    <path d="M2 12h20" />
  </svg>
`

const phoneIcon = `
  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <rect x="7" y="2" width="10" height="20" rx="2.5" />
    <path d="M10 6h4" />
    <path d="M11.5 18h1" />
  </svg>
`

const pocketIcon = `
  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5v9A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-9Z" />
    <path d="M8 9h8" />
    <path d="M8 13h5" />
  </svg>
`

const historyIcon = `
  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M4 6h16" />
    <path d="M4 12h10" />
    <path d="M4 18h16" />
    <path d="M17 8l3 4-3 4" />
  </svg>
`

const cloudIcon = `
  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M17.5 19H8a4 4 0 1 1 0-8 5.5 5.5 0 0 1 10.5 1.7A3.5 3.5 0 0 1 17.5 19Z" />
  </svg>
`

const shieldIcon = `
  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M12 22s7-3.5 7-9.5V6.5L12 3l-7 3.5v6c0 6 7 9.5 7 9.5Z" />
    <path d="M9 12h6" />
    <path d="M12 9v6" />
  </svg>
`

const exportIcon = `
  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <path d="M7 10l5 5 5-5" />
    <path d="M12 15V3" />
  </svg>
`

const translations = {
  en: {
    pageTitle: 'Wallet Code Sabai',
    description: 'A clean, mobile-first landing page for a wallet app.',
    nav: {
      home: 'Home',
      features: 'Features',
      pricing: 'Pricing',
      faq: 'FAQ',
    },
    language: 'Language',
    installApp: 'Install app',
    getPro: 'Get Pro',
    theme: 'Theme',
    hero: {
      kicker: 'Offline-first money control',
      badge: 'Dark/Light',
      titleTop: 'Modern finance for',
      titleAccent: 'fast mobile money tracking.',
      body:
        'Track wallets, move money, and unlock cloud sync when you are ready.',
      stat1Label: 'Offline',
      stat1Body: 'Works without signal',
      stat2Label: 'Pro',
      stat2Body: 'Cloud backup later',
      stat3Label: 'Language',
      stat3Body: 'EN / ລາວ',
    },
    preview: {
      ready: 'PWA ready',
      localFirst: 'Local first',
      balanceLabel: 'Current balance',
      balanceBody: 'Cash, wallet, and bank in one clean view.',
      entryTitle: 'Fast entry',
      entryBody: 'Add income or expense in seconds.',
      historyTitle: 'Clean history',
      historyBody: 'Read every move without noise.',
      cloudTitle: 'Cloud restore',
      cloudBody: 'Bring data back on Pro devices.',
    },
    features: {
      kicker: 'Features',
      title: 'Everything kept simple',
      body: 'Explain the product fast. Keep it polished and clear.',
      offlineTitle: 'Offline-first PWA',
      offlineBody: 'Open fast, keep using it offline, and return later without losing your flow.',
      walletTitle: 'Wallets and categories',
      walletBody: 'Keep balances clear, budgets tidy, and expenses organized the way people work.',
      historyTitle: 'Transactions with history',
      historyBody: 'See what happened, when it happened, and where the money moved.',
      backupTitle: 'Backup and restore',
      backupBody: 'Export JSON for safe restore and use CSV for spreadsheet analysis.',
      plansTitle: 'Free and Pro',
      plansBody: 'Keep a free local-first plan, then unlock cloud sync and restore on Pro.',
      upgradeTitle: 'Simple upgrade path',
      upgradeBody: 'Redeem codes or entitlement-based Pro activation can unlock the app cleanly.',
    },
    pricing: {
      kicker: 'Pricing',
      badge: 'Dark/Light',
      title: 'Free and Pro',
      body: 'Keep pricing simple so the choice is obvious fast.',
      label: 'Highlight',
      freeBadge: 'Free',
      freeTitle: 'Start without paying',
      freeBody: 'Personal tracking, offline use, and easy exports.',
      freeTerm: '/ forever',
      freeChips: ['Local data', 'Offline-first', 'Export JSON', 'Export CSV'],
      proBadge: 'Pro',
      proTitle: 'Cloud sync and restore',
      proBody: 'Best for people who use more than one device.',
      proTerm: '/ month',
      proSub: 'Redeem code or entitlement can activate Pro without changing the rest of the app.',
      proChips: ['Cloud sync', 'Restore devices', 'Pro unlock', 'Priority backup'],
    },
    faq: {
      kicker: 'FAQ',
      title: 'Questions people ask',
      body: 'Short answers keep the page focused.',
      items: [
        {
          q: 'Is the app free?',
          a: 'Yes. The free plan is free forever for local tracking, offline use, and exporting your data anytime.',
        },
        {
          q: 'What does Pro unlock?',
          a: 'Pro unlocks cloud sync, cross-device restore, and a smoother upgrade path through redeem code or entitlement.',
        },
        {
          q: 'Can I export my data?',
          a: 'Yes. JSON is best for restore, while CSV works well for spreadsheets and sharing.',
        },
        {
          q: 'Is this landing separate from the main app?',
          a: 'Yes. This landing page is isolated so promo updates do not disturb the finance app UI.',
        },
      ],
    },
    cta: {
      kicker: 'Ready to try it?',
      title: 'Install the app or try the demo now.',
      body: 'Simple, direct, and easy to act on.',
      seePricing: 'See pricing',
    },
    footer: 'Made for fast installs and calm finance tracking.',
    footerCopyright: '© 2026 Wallet Code Sabai. All rights reserved.',
  },
  lo: {
    pageTitle: 'Wallet Code Sabai',
    description: 'ໜ້າ landing ສະອາດ ແລະໃຊ້ງ່າຍສຳລັບແອັບການເງິນ.',
    nav: {
      home: 'ໜ້າຫຼັກ',
      features: 'ຟີຈເຈີ',
      pricing: 'ລາຄາ',
      faq: 'ຄຳຖາມ',
    },
    language: 'ພາສາ',
    installApp: 'ຕິດຕັ້ງແອັບ',
    getPro: 'ເອົາ Pro',
    theme: 'ຮູບແບບ',
    hero: {
      kicker: 'ການເງິນແບບອອບລາຍກ່ອນ',
      badge: 'Dark/Light',
      titleTop: 'ການເງິນທັນສະໄໝສຳລັບ',
      titleAccent: 'ການຕິດຕາມເງິນຜ່ານມືຖືຢ່າງໄວ.',
      body:
        'ຕິດຕາມ wallet, ຍ້າຍເງິນ, ແລະປົດລັອກຄຣາວເມື່ອທ່ານພ້ອມ.',
      stat1Label: 'ອອບລາຍ',
      stat1Body: 'ໃຊ້ໄດ້ບໍ່ຕ້ອງມີເນັດ',
      stat2Label: 'Pro',
      stat2Body: 'ສຳຮອງຄລາວພາຍຫຼັງ',
      stat3Label: 'ພາສາ',
      stat3Body: 'EN / ລາວ',
    },
    preview: {
      ready: 'ພ້ອມໃຊ້',
      localFirst: 'ຂໍ້ມູນທ້ອງຖິ່ນ',
      balanceLabel: 'ຍອດປັດຈຸບັນ',
      balanceBody: 'ເງິນສົດ, ກະເປົາ, ແລະ ທະນາຄານຢູ່ໃນໜ້າດຽວ.',
      entryTitle: 'ໃສ່ໄວ',
      entryBody: 'ເພີ່ມລາຍຮັບ/ລາຍຈ່າຍໄດ້ໃນບໍ່ກີ່ວິນາທີ.',
      historyTitle: 'ປະຫວັດຊັດ',
      historyBody: 'ເບິ່ງທຸກການຍ້າຍເງິນໄດ້ງ່າຍ.',
      cloudTitle: 'ກູ້ຄືນຈາກຄລາວ',
      cloudBody: 'ກູ້ຂໍ້ມູນຄືນໄດ້ເມື່ອໃຊ້ Pro.',
    },
    features: {
      kicker: 'ຟີຈເຈີ',
      title: 'ທຸກຢ່າງໃຫ້ງ່າຍໄວ້ກ່ອນ',
      body: 'ອະທິບາຍໄວ ແລະບໍ່ອັດດ້ວຍ card ຊ້ອນ card.',
      offlineTitle: 'PWA ແບບອອບລາຍກ່ອນ',
      offlineBody: 'ເປີດໄດ້ໄວ, ໃຊ້ຕໍ່ໄດ້ແມ່ນເວລາບໍ່ມີເນັດ.',
      walletTitle: 'ກະເປົາ ແລະ ໝວດໝູ່',
      walletBody: 'ໃຫ້ຍອດຊັດເຈນ ແລະ ຈັດລາຍຈ່າຍໃຫ້ເປັນລະບຽບ.',
      historyTitle: 'ທຸລະກຳມີປະຫວັດ',
      historyBody: 'ເບິ່ງວ່າເກີດຫຍັງ, ເມື່ອໃດ, ແລະ ເງິນໄຫຼໄປທາງໃດ.',
      backupTitle: 'ສຳຮອງ ແລະ ກູ້ຄືນ',
      backupBody: 'ສົ່ງອອກ JSON ແລະ CSV ເພື່ອກູ້ຄືນ ຫຼື ວິເຄາະ.',
      plansTitle: 'ຟຣີ ແລະ Pro',
      plansBody: 'ໃຊ້ແຜນຟຣີກ່ອນ ແລ້ວຄ່ອຍເປີດຊິງຄລາວໃນ Pro.',
      upgradeTitle: 'ອັບເກຣດງ່າຍ',
      upgradeBody: 'redeem code ຫຼື entitlement ສາມາດເປີດ Pro ໄດ້ແບບບໍ່ຊັບຊ້ອນ.',
    },
    pricing: {
      kicker: 'ລາຄາ',
      badge: 'Dark/Light',
      title: 'ຟຣີ ແລະ Pro',
      body: 'ຕັ້ງລາຄາໃຫ້ງ່າຍ ແລະເລືອກໄດ້ໄວ.',
      label: 'ຈຸດເດັ່ນ',
      freeBadge: 'ຟຣີ',
      freeTitle: 'ເລີ່ມໃຊ້ໄດ້ທັນທີ',
      freeBody: 'ເໝາະກັບການຈັດການສ່ວນຕົວ.',
      freeTerm: '/ ຕະຫຼອດໄປ',
      freeChips: ['ຂໍ້ມູນທ້ອງຖິ່ນ', 'ອອບລາຍກ່ອນ', 'ສົ່ງອອກ JSON', 'ສົ່ງອອກ CSV'],
      proBadge: 'Pro',
      proTitle: 'ຊິງຄລາວ ແລະ ກູ້ຄືນ',
      proBody: 'ເໝາະກັບຄົນທີ່ໃຊ້ຫຼາຍເຄື່ອງ.',
      proTerm: '/ ເດືອນ',
      proSub: 'redeem code ຫຼື entitlement ສາມາດເປີດ Pro ໄດ້ທັນທີ.',
      proChips: ['ຊິງຄລາວ', 'ກູ້ຄືນຂ້າມເຄື່ອງ', 'ປົດລັອກ Pro', 'ສຳຮອງລຳດັບສູງ'],
    },
    faq: {
      kicker: 'ຄຳຖາມ',
      title: 'ຄຳຖາມທີ່ຄົນມັກຖາມ',
      body: 'ຕອບສັ້ນໆ ໃຫ້ອ່ານໄວ.',
      items: [
        {
          q: 'ແອັບຟຣີບໍ?',
          a: 'ແມ່ນ. ແຜນຟຣີໃຊ້ໄດ້ຟຣີຕະຫຼອດໄປ ສຳລັບບັນທຶກແບບທ້ອງຖິ່ນ ແລະອອບລາຍ.',
        },
        {
          q: 'Pro ໄດ້ຫຍັງແດ່?',
          a: 'Pro ເປີດ cloud sync, ກູ້ຄືນຂ້າມເຄື່ອງ, ແລະທາງອັບເກຣດທີ່ງ່າຍຂຶ້ນ.',
        },
        {
          q: 'ສົ່ງອອກຂໍ້ມູນໄດ້ບໍ?',
          a: 'ໄດ້. JSON ແມ່ນດີສຳລັບກູ້ຄືນ ແລະ CSV ເໝາະກັບ spreadsheet.',
        },
        {
          q: 'landing ນີ້ແຍກຈາກແອັບຫຼັກບໍ?',
          a: 'ແຍກຈາກກັນ. ການອັບເດດ promo ຈຶ່ງບໍ່ກະທົບ UI ແອັບຫຼັກ.',
        },
      ],
    },
    cta: {
      kicker: 'ພ້ອມລອງແລ້ວບໍ?',
      title: 'ຕິດຕັ້ງແອັບ ຫຼື ລອງດູໄດ້ເລີຍ.',
      body: 'ສະອາດ, ຊັດເຈນ, ແລະອ່ານງ່າຍ.',
      seePricing: 'ເບິ່ງລາຄາ',
    },
    footer: 'ສ້າງມາເພື່ອຕິດຕັ້ງໄວ ແລະຈັດການເງິນໄດ້ງ່າຍ.',
    footerCopyright: '© 2026 Wallet Code Sabai. ສະຫງວນລິຂະສິດ.',
  },
} as const

const getInitialTheme = (): Theme => {
  if (!import.meta.client) return 'light'
  const stored = localStorage.getItem('landing-theme')
  if (stored === 'dark' || stored === 'light') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const getInitialLang = (): Locale => {
  if (!import.meta.client) return 'en'
  const stored = localStorage.getItem('landing-lang')
  return stored === 'lo' ? 'lo' : 'en'
}

const language = ref<Locale>(getInitialLang())
const theme = ref<Theme>(getInitialTheme())
const menuOpen = ref(false)
const languageMenuOpen = ref(false)

const copy = computed(() => translations[language.value])
const themeIcon = computed(() => (theme.value === 'dark' ? sunIcon : moonIcon))
const themeButtonLabel = computed(() => copy.value.theme)
const themeModeLabel = computed(() => (theme.value === 'dark' ? 'Dark' : 'Light'))
const languageCode = computed(() => (language.value === 'en' ? 'EN' : 'ລາວ'))
const walletInstallHref = 'http://localhost:3002/install'

const featureCards = computed(() => [
  {
    title: copy.value.features.offlineTitle,
    body: copy.value.features.offlineBody,
    icon: phoneIcon,
    tone: 'from-sky-500 to-cyan-500',
  },
  {
    title: copy.value.features.walletTitle,
    body: copy.value.features.walletBody,
    icon: pocketIcon,
    tone: 'from-emerald-500 to-teal-500',
  },
  {
    title: copy.value.features.historyTitle,
    body: copy.value.features.historyBody,
    icon: historyIcon,
    tone: 'from-violet-600 to-indigo-600',
  },
  {
    title: copy.value.features.backupTitle,
    body: copy.value.features.backupBody,
    icon: exportIcon,
    tone: 'from-slate-700 to-slate-900',
  },
  {
    title: copy.value.features.plansTitle,
    body: copy.value.features.plansBody,
    icon: shieldIcon,
    tone: 'from-pink-500 to-rose-500',
  },
  {
    title: copy.value.features.upgradeTitle,
    body: copy.value.features.upgradeBody,
    icon: plusIcon,
    tone: 'from-amber-500 to-orange-500',
  },
])

const previewRows = computed(() => [
  { title: copy.value.preview.entryTitle, body: copy.value.preview.entryBody, icon: plusIcon, tone: 'text-cyan-300' },
  { title: copy.value.preview.historyTitle, body: copy.value.preview.historyBody, icon: historyIcon, tone: 'text-emerald-300' },
  { title: copy.value.preview.cloudTitle, body: copy.value.preview.cloudBody, icon: cloudIcon, tone: 'text-white' },
])

const faqItems = computed(() => copy.value.faq.items)

const setTheme = (next: Theme) => {
  theme.value = next
}

const setLanguage = (next: Locale) => {
  language.value = next
  menuOpen.value = false
  languageMenuOpen.value = false
}

const selectLanguage = (next: Locale) => {
  setLanguage(next)
}

const scrollToTop = () => {
  if (!import.meta.client) return
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const syncTheme = (next: Theme) => {
  if (!import.meta.client) return
  document.documentElement.classList.toggle('dark', next === 'dark')
  localStorage.setItem('landing-theme', next)
}

const syncLanguage = (next: Locale) => {
  if (!import.meta.client) return
  localStorage.setItem('landing-lang', next)
  document.documentElement.lang = next
}

watch(theme, syncTheme, { immediate: true })
watch(language, syncLanguage, { immediate: true })
watch(menuOpen, (open) => {
  if (!open) languageMenuOpen.value = false
  if (!import.meta.client) return
  document.body.style.overflow = open ? 'hidden' : ''
})

const handleOutsideClick = (event: MouseEvent) => {
  const target = event.target as Node | null
  if (!target) return
  const langMenu = document.querySelector('[data-lang-menu]')
  if (languageMenuOpen.value && langMenu && !langMenu.contains(target)) {
    languageMenuOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleOutsideClick, true)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleOutsideClick, true)
  if (import.meta.client) {
    document.body.style.overflow = ''
  }
})

useHead(() => ({
  title: copy.value.pageTitle,
  meta: [
    { name: 'description', content: copy.value.description },
    { name: 'theme-color', content: theme.value === 'dark' ? '#020617' : '#f8fafc' },
  ],
}))
</script>

<template>
  <div class="min-h-dvh overflow-x-hidden bg-slate-50 text-slate-950 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-50">
    <div class="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,.12),transparent_28%),radial-gradient(circle_at_top_right,rgba(16,185,129,.10),transparent_26%),linear-gradient(180deg,#f8fafc_0%,#eef4ff_100%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,.18),transparent_28%),radial-gradient(circle_at_top_right,rgba(16,185,129,.14),transparent_26%),linear-gradient(180deg,#020617_0%,#030712_100%)]"></div>
    <div class="absolute inset-0 -z-10 bg-[linear-gradient(rgba(15,23,42,.035)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,.035)_1px,transparent_1px)] bg-[size:72px_72px] opacity-70 dark:bg-[linear-gradient(rgba(148,163,184,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,.08)_1px,transparent_1px)] dark:opacity-35"></div>

    <header class="fixed inset-x-0 top-0 z-50 border-b border-slate-200/80 bg-white/90 shadow-[0_1px_0_rgba(15,23,42,.04)] backdrop-blur-xl transition-colors duration-300 dark:border-slate-800/80 dark:bg-slate-950/90">
      <div class="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3 md:px-6">
        <a href="#top" class="flex items-center gap-3">
          <span class="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-transparent">
            <img
              src="/wallet-codesabai-mark.svg?v=2"
              alt="Wallet Code Sabai"
              class="h-full w-full object-cover object-center"
            />
          </span>
          <div class="min-w-0">
            <p class="hidden text-[10px] font-bold uppercase tracking-[0.28em] text-sky-600 dark:text-sky-400 md:block">
              {{ copy.hero.kicker }}
            </p>
            <h1 class="truncate text-base font-black tracking-tight sm:text-lg">
              {{ copy.pageTitle }}
            </h1>
          </div>
        </a>

        <nav class="hidden items-center gap-1 md:flex">
          <a
            href="#top"
            class="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            {{ copy.nav.home }}
          </a>
          <a
            href="#features"
            class="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            {{ copy.nav.features }}
          </a>
          <a
            href="#pricing"
            class="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            {{ copy.nav.pricing }}
          </a>
          <a
            href="#faq"
            class="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            {{ copy.nav.faq }}
          </a>
        </nav>

        <div class="hidden items-center gap-2 sm:flex">
          <div class="relative" data-lang-menu>
          <button
            type="button"
            class="inline-flex h-9 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-slate-700 dark:hover:bg-slate-900"
            :aria-label="copy.language"
            aria-haspopup="menu"
            :aria-expanded="languageMenuOpen"
            @click.stop="languageMenuOpen = !languageMenuOpen"
          >
            <span class="inline-flex h-4 w-4 items-center justify-center text-slate-500 dark:text-slate-300" v-html="globeIcon"></span>
            <span class="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              {{ languageCode }}
            </span>
          </button>

            <div
              v-if="languageMenuOpen"
              class="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-[0_18px_40px_-26px_rgba(15,23,42,.28)] dark:border-slate-800 dark:bg-slate-950"
            >
              <div class="px-2 pb-1 pt-1">
                <p class="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500">{{ copy.language }}</p>
              </div>
              <button
                type="button"
                class="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-900"
                @click.stop="selectLanguage('en')"
              >
                <span class="inline-flex h-7 w-7 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-white ring-1 ring-white/70 dark:border-slate-700 dark:bg-slate-950 dark:ring-slate-950">
                  <img src="/flag-english.svg" alt="English" class="h-full w-full scale-[1.32] object-cover object-center" />
                </span>
                <span class="min-w-0 flex-1">
                  <span class="block truncate leading-tight">English</span>
                  <span class="block text-[10px] font-medium uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">EN</span>
                </span>
                <span v-if="language === 'en'" class="text-sky-500">✓</span>
              </button>

              <button
                type="button"
                class="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-900"
                @click.stop="selectLanguage('lo')"
              >
                <span class="inline-flex h-7 w-7 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-white ring-1 ring-white/70 dark:border-slate-700 dark:bg-slate-950 dark:ring-slate-950">
                  <img src="/flag-lao.svg" alt="Lao" class="h-full w-full scale-[1.32] object-cover object-center" />
                </span>
                <span class="min-w-0 flex-1">
                  <span class="block truncate leading-tight">ລາວ</span>
                  <span class="block text-[10px] font-medium uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">LO</span>
                </span>
                <span v-if="language === 'lo'" class="text-sky-500">✓</span>
              </button>
            </div>
          </div>

          <button
            type="button"
            class="group inline-flex h-9 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-slate-700 dark:hover:bg-slate-900"
            :aria-label="themeButtonLabel"
            @click="setTheme(theme === 'dark' ? 'light' : 'dark')"
          >
            <span class="inline-flex h-4 w-4 items-center justify-center text-slate-500 dark:text-slate-300" v-html="themeIcon"></span>
            <span class="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 dark:bg-slate-800 dark:text-slate-400">{{ themeModeLabel }}</span>
          </button>

        </div>

        <button
          type="button"
          class="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 active:scale-95 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-slate-700 dark:hover:bg-slate-900 md:hidden"
          :aria-label="menuOpen ? 'Close menu' : 'Open menu'"
          @click="menuOpen = !menuOpen"
        >
          <svg v-if="!menuOpen" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 6h16" />
            <path d="M4 12h16" />
            <path d="M4 18h16" />
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>

      </div>
    </header>

    <div
      v-if="menuOpen"
      class="fixed inset-x-0 top-[72px] z-[60] border-t border-slate-200 bg-white/98 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/98 md:hidden"
      @click.self="menuOpen = false"
    >
      <div class="pointer-events-none mx-auto flex h-[calc(100dvh-72px)] w-full max-w-7xl flex-col px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4">
        <div class="pointer-events-auto rounded-[1.75rem] border border-slate-200 bg-white p-2 shadow-[0_22px_45px_-28px_rgba(15,23,42,.22)] dark:border-slate-800 dark:bg-slate-900">
          <div class="grid gap-2">
            <a href="#top" class="flex items-center justify-between rounded-[1.2rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800" @click="menuOpen = false">
              <span>{{ copy.nav.home }}</span>
              <span class="text-slate-400 dark:text-slate-500">↗</span>
            </a>
            <a href="#features" class="flex items-center justify-between rounded-[1.2rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800" @click="menuOpen = false">
              <span>{{ copy.nav.features }}</span>
              <span class="text-slate-400 dark:text-slate-500">↗</span>
            </a>
            <a href="#pricing" class="flex items-center justify-between rounded-[1.2rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800" @click="menuOpen = false">
              <span>{{ copy.nav.pricing }}</span>
              <span class="text-slate-400 dark:text-slate-500">↗</span>
            </a>
            <a href="#faq" class="flex items-center justify-between rounded-[1.2rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800" @click="menuOpen = false">
              <span>{{ copy.nav.faq }}</span>
              <span class="text-slate-400 dark:text-slate-500">↗</span>
            </a>
          </div>

          <div class="mt-3 grid grid-cols-2 gap-3">
            <button
              type="button"
              class="inline-flex h-9 items-center justify-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 text-center text-xs font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-slate-700 dark:hover:bg-slate-900"
              @click.stop="selectLanguage(language === 'en' ? 'lo' : 'en')"
            >
              <span class="inline-flex h-4 w-4 items-center justify-center text-slate-500 dark:text-slate-300" v-html="globeIcon"></span>
              <span class="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                {{ languageCode }}
              </span>
            </button>

            <button
              type="button"
              class="group inline-flex h-9 items-center justify-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 text-center text-xs font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-slate-700 dark:hover:bg-slate-900"
              @click="setTheme(theme === 'dark' ? 'light' : 'dark')"
            >
              <span class="inline-flex h-4 w-4 items-center justify-center text-slate-500 dark:text-slate-300" v-html="themeIcon"></span>
              <span class="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                {{ themeModeLabel }}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <main id="top" class="mx-auto w-full max-w-7xl px-4 pb-6 pt-24 md:px-6 md:pb-8 md:pt-28">
      <section class="grid gap-6 lg:grid-cols-[1.06fr_.94fr] lg:items-stretch">
        <div class="p-0 transition-colors duration-300">
          <span class="inline-flex items-center gap-2 rounded-full border border-sky-200/80 bg-sky-50 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300">
            <span class="h-2 w-2 rounded-full bg-emerald-500"></span>
            {{ copy.hero.kicker }}
          </span>

          <h2 class="mt-5 max-w-3xl text-[clamp(2.3rem,6vw,4.8rem)] font-black leading-[0.92] tracking-tight">
            {{ copy.hero.titleTop }}
            <span class="bg-gradient-to-r from-sky-600 to-cyan-500 bg-clip-text text-transparent">{{ copy.hero.titleAccent }}</span>
          </h2>

          <p class="mt-5 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300 md:text-lg">
            {{ copy.hero.body }}
          </p>

          <div class="mt-6 flex flex-wrap gap-3">
            <a
              href="http://localhost:3002"
              target="_blank"
              rel="noreferrer"
              class="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-sky-600 via-blue-600 to-cyan-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_26px_-18px_rgba(14,165,233,.7)] transition hover:-translate-y-0.5 hover:from-sky-500 hover:via-blue-500 hover:to-cyan-400 dark:bg-gradient-to-r dark:from-sky-500 dark:via-blue-500 dark:to-cyan-400 dark:text-slate-950"
            >
              <span v-html="downloadIcon" class="text-white dark:text-slate-950"></span>
              <span>{{ copy.installApp }}</span>
            </a>
            <a
              href="#pricing"
              class="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 dark:bg-white dark:text-slate-950"
            >
              <span v-html="arrowRightIcon"></span>
              <span>{{ copy.getPro }}</span>
            </a>
          </div>

          <div class="mt-5 flex flex-wrap gap-2">
            <span class="inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white/90 px-3 py-1.5 text-[11px] font-medium leading-none tracking-wide text-slate-700 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200">
              <span class="h-1.5 w-1.5 rounded-full bg-sky-500"></span>
              {{ copy.hero.stat1Label }} · {{ copy.hero.stat1Body }}
            </span>
            <span class="inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white/90 px-3 py-1.5 text-[11px] font-medium leading-none tracking-wide text-slate-700 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200">
              <span class="h-1.5 w-1.5 rounded-full bg-violet-500"></span>
              {{ copy.hero.badge }}
            </span>
            <span class="inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white/90 px-3 py-1.5 text-[11px] font-medium leading-none tracking-wide text-slate-700 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200">
              <span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
              {{ copy.hero.stat2Label }} · {{ copy.hero.stat2Body }}
            </span>
            <span class="inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white/90 px-3 py-1.5 text-[11px] font-medium leading-none tracking-wide text-slate-700 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200">
              <span class="h-1.5 w-1.5 rounded-full bg-violet-500"></span>
              {{ copy.hero.stat3Label }} · {{ copy.hero.stat3Body }}
            </span>
          </div>
        </div>

        <div class="relative flex min-h-[580px] items-center justify-center overflow-hidden rounded-3xl bg-transparent px-4 py-8 text-slate-950 transition-colors duration-300 md:min-h-[640px] dark:text-white">

          <div class="relative flex items-center justify-center">
            <span class="mockup-ring mockup-ring--slow left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"></span>
            <span class="mockup-ring mockup-ring--medium left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"></span>
            <span class="mockup-orb mockup-orb--blue left-[-2.5rem] top-20"></span>
            <span class="mockup-orb mockup-orb--green right-[-2rem] bottom-24"></span>
            <span class="mockup-orb mockup-orb--violet left-[3rem] bottom-12"></span>

            <div class="relative h-[560px] w-[16.75rem] rounded-[45px] border-8 border-zinc-900 shadow-none md:h-[600px] md:w-72">
              <div class="absolute top-2 left-1/2 z-20 h-[22px] w-[90px] -translate-x-1/2 rounded-full bg-zinc-900"></div>
              <div class="pointer-events-none absolute -inset-px rounded-[37px] border-[3px] border-zinc-700 border-opacity-40"></div>

              <div class="relative h-full w-full overflow-hidden rounded-[37px] bg-white">
                <img
                  src="/IMG_3844.PNG"
                  alt="Wallet app preview"
                  class="h-full w-full object-cover object-top"
                />
                <div class="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,.12),transparent_18%,transparent_72%,rgba(15,23,42,.03)_100%)] dark:bg-[linear-gradient(180deg,rgba(255,255,255,.08),transparent_18%,transparent_72%,rgba(15,23,42,.03)_100%)]"></div>
              </div>

              <div class="mockup-float mockup-float--cloud -left-12 top-16 z-30 flex scale-[0.82] md:-left-20 md:top-28 md:scale-100">
                <span class="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-300" v-html="cloudIcon"></span>
                <span class="text-[10px] font-semibold text-white/85">Cloud synced</span>
              </div>
              <div class="mockup-float mockup-float--alt -right-10 bottom-12 z-30 flex scale-[0.72] md:-right-16 md:bottom-24 md:scale-100">
                <span class="flex h-7 w-7 items-center justify-center rounded-full bg-sky-400/15 text-sky-300 md:h-8 md:w-8" v-html="historyIcon"></span>
                <span class="text-[10px] font-semibold text-white/85 md:text-[11px]">Fast add</span>
              </div>

              <div class="absolute -left-3 top-20 h-8 w-[6px] rounded-l-md bg-zinc-900 shadow-[0_6px_12px_-10px_rgba(15,23,42,.16)]"></div>
              <div class="absolute -left-3 top-36 h-12 w-[6px] rounded-l-md bg-zinc-900 shadow-[0_6px_12px_-10px_rgba(15,23,42,.16)]"></div>
              <div class="absolute -left-3 top-52 h-12 w-[6px] rounded-l-md bg-zinc-900 shadow-[0_6px_12px_-10px_rgba(15,23,42,.16)]"></div>
              <div class="absolute -right-3 top-36 h-16 w-[6px] rounded-r-md bg-zinc-900 shadow-[0_6px_12px_-10px_rgba(15,23,42,.16)]"></div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" class="mt-6 scroll-mt-[96px] transition-colors duration-300 md:scroll-mt-[112px]">
        <div class="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p class="text-sm font-bold uppercase tracking-[0.24em] text-sky-600 dark:text-sky-400">{{ copy.features.kicker }}</p>
            <h3 class="mt-2 text-3xl font-black tracking-tight text-slate-950 dark:text-white md:text-4xl">{{ copy.features.title }}</h3>
          </div>
          <p class="max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300 md:text-base">
            {{ copy.features.body }}
          </p>
        </div>

        <div class="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <article
            v-for="card in featureCards"
            :key="card.title"
            class="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
          >
            <div class="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br text-white shadow-[0_14px_24px_-18px_rgba(15,23,42,.35)]" :class="card.tone">
              <span v-html="card.icon"></span>
            </div>
            <h4 class="mt-4 text-lg font-extrabold tracking-tight">{{ card.title }}</h4>
            <p class="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">{{ card.body }}</p>
          </article>
        </div>
      </section>

      <section id="pricing" class="mt-6 scroll-mt-[96px] transition-colors duration-300 md:scroll-mt-[112px]">
        <div class="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p class="text-sm font-bold uppercase tracking-[0.24em] text-sky-600 dark:text-sky-400">{{ copy.pricing.kicker }}</p>
            <div class="mt-2 flex flex-wrap items-center gap-3">
              <h3 class="text-3xl font-black tracking-tight text-slate-950 dark:text-white md:text-4xl">{{ copy.pricing.title }}</h3>
              <span class="inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white/90 px-3 py-1.5 text-[11px] font-medium leading-none tracking-wide text-slate-700 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200">
                <span class="h-1.5 w-1.5 rounded-full bg-violet-500"></span>
                {{ copy.pricing.badge }}
              </span>
            </div>
          </div>
          <p class="max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300 md:text-base">
            {{ copy.pricing.body }}
          </p>
        </div>

        <div class="mt-6 grid gap-4 lg:grid-cols-2">
          <article class="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <span class="inline-flex h-10 min-w-[6.5rem] items-center justify-center rounded-full border border-slate-200 bg-slate-50 px-4 text-[11px] font-black uppercase tracking-[0.24em] text-slate-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
              {{ copy.pricing.freeBadge }}
            </span>
            <h4 class="mt-4 text-2xl font-black tracking-tight">{{ copy.pricing.freeTitle }}</h4>
            <p class="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">{{ copy.pricing.freeBody }}</p>
            <div class="mt-5 flex items-end gap-2">
              <div class="text-4xl font-black tracking-tight">₭0</div>
              <div class="pb-1 text-sm font-semibold text-slate-500 dark:text-slate-400">{{ copy.pricing.freeTerm }}</div>
            </div>
            <div class="mt-5 flex flex-wrap gap-1.5 md:gap-2">
              <span
                v-for="chip in copy.pricing.freeChips"
                :key="chip"
                class="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700 md:px-3 md:text-sm dark:bg-slate-800 dark:text-slate-200"
              >
                {{ chip }}
              </span>
            </div>
            <div class="mt-auto pt-6">
              <a
                :href="walletInstallHref"
                target="_blank"
                rel="noreferrer"
                class="inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
              >
                <span v-html="downloadIcon" class="text-slate-700 dark:text-slate-200"></span>
                {{ copy.installApp }}
              </a>
            </div>
          </article>

          <article class="flex h-full flex-col rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-600 to-cyan-500 p-6 text-white shadow-sm">
            <span class="inline-flex h-10 min-w-[6.5rem] items-center justify-center rounded-full border border-white/20 bg-white/10 px-4 text-[11px] font-black uppercase tracking-[0.24em] text-white/90">
              {{ copy.pricing.proBadge }}
            </span>
            <h4 class="mt-4 text-2xl font-black tracking-tight">{{ copy.pricing.proTitle }}</h4>
            <p class="mt-2 text-sm leading-7 text-white/85">{{ copy.pricing.proBody }}</p>
            <div class="mt-5 flex items-end gap-2">
              <div class="text-4xl font-black tracking-tight">₭49,000</div>
              <div class="pb-1 text-sm font-semibold text-white/80">{{ copy.pricing.proTerm }}</div>
            </div>
            <p class="mt-4 text-sm leading-7 text-white/85">
              {{ copy.pricing.proSub }}
            </p>
            <div class="mt-5 flex flex-wrap gap-1.5 md:gap-2">
              <span
                v-for="chip in copy.pricing.proChips"
                :key="chip"
                class="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-white md:px-3 md:text-sm"
              >
                {{ chip }}
              </span>
            </div>
            <div class="mt-auto pt-6">
              <a
                :href="walletInstallHref"
                target="_blank"
                rel="noreferrer"
                class="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5"
              >
                <span v-html="downloadIcon" class="text-slate-950"></span>
                {{ copy.installApp }}
              </a>
            </div>
          </article>
        </div>
      </section>

      <section id="faq" class="mt-6 scroll-mt-[96px] transition-colors duration-300 md:scroll-mt-[112px]">
        <div class="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p class="text-sm font-bold uppercase tracking-[0.24em] text-sky-600 dark:text-sky-400">{{ copy.faq.kicker }}</p>
            <h3 class="mt-2 text-3xl font-black tracking-tight text-slate-950 dark:text-white md:text-4xl">{{ copy.faq.title }}</h3>
          </div>
          <p class="max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300 md:text-base">
            {{ copy.faq.body }}
          </p>
        </div>

        <div class="mt-6 grid gap-4">
          <details
            v-for="item in faqItems"
            :key="item.q"
            class="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
          >
            <summary class="cursor-pointer list-none text-lg font-extrabold tracking-tight">
              <span class="flex items-center justify-between gap-3">
                <span>{{ item.q }}</span>
                <span class="text-slate-400 transition group-open:rotate-45 dark:text-slate-500">+</span>
              </span>
            </summary>
            <p class="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
              {{ item.a }}
            </p>
          </details>
        </div>
      </section>

      <section class="mt-6 rounded-2xl bg-slate-950 px-6 py-8 text-white shadow-sm dark:bg-white dark:text-slate-950 md:px-8">
        <div class="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div class="max-w-2xl">
            <p class="text-sm font-bold uppercase tracking-[0.24em] text-white/65 dark:text-slate-500">{{ copy.cta.kicker }}</p>
            <h3 class="mt-2 text-3xl font-black tracking-tight md:text-4xl">{{ copy.cta.title }}</h3>
            <p class="mt-3 text-sm leading-7 text-white/75 dark:text-slate-700">
              {{ copy.cta.body }}
            </p>
          </div>

          <div class="flex flex-wrap gap-3">
            <a
              :href="walletInstallHref"
              target="_blank"
              rel="noreferrer"
              class="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-sky-600 via-blue-600 to-cyan-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_26px_-18px_rgba(14,165,233,.7)] transition hover:-translate-y-0.5 hover:from-sky-500 hover:via-blue-500 hover:to-cyan-400 dark:bg-gradient-to-r dark:from-sky-500 dark:via-blue-500 dark:to-cyan-400 dark:text-slate-950"
            >
              <span v-html="downloadIcon" class="text-white dark:text-slate-950"></span>
              <span>{{ copy.installApp }}</span>
            </a>
            <a
              href="#pricing"
              class="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/10 dark:border-slate-200 dark:bg-slate-50 dark:text-slate-950 dark:hover:bg-slate-100"
            >
              {{ copy.cta.seePricing }}
            </a>
          </div>
        </div>
      </section>

      <footer class="mx-auto flex max-w-7xl flex-col items-center gap-1 border-t border-slate-200/70 px-1 py-6 text-center text-xs leading-6 text-slate-500 dark:border-slate-800/80 dark:text-slate-400">
        <p class="font-semibold">
          {{ copy.footerCopyright }}
        </p>
        <p class="text-[11px] font-medium tracking-[0.22em] text-slate-400 uppercase dark:text-slate-500">
          Wallet Code Sabai
        </p>
      </footer>
    </main>

    <button
      type="button"
      class="fixed bottom-5 right-5 z-50 inline-flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-r from-sky-600 via-blue-600 to-cyan-500 text-white shadow-[0_16px_28px_-18px_rgba(14,165,233,.8)] transition hover:-translate-y-0.5 hover:from-sky-500 hover:via-blue-500 hover:to-cyan-400 dark:bg-gradient-to-r dark:from-sky-500 dark:via-blue-500 dark:to-cyan-400 dark:text-slate-950"
      :aria-label="copy.nav.home"
      :title="copy.nav.home"
      @click="scrollToTop"
    >
      <span v-html="arrowUpIcon"></span>
    </button>
  </div>
</template>
