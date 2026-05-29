<script setup lang="ts">
const route = useRoute()
const { selectedLanguage } = useAppLanguage()
const { activeTheme } = useAppThemeColor()

const navCopy = computed(() => selectedLanguage.value === 'lo'
  ? {
      home: 'ໜ້າຫຼັກ',
      transactions: 'ທຸລະກຳ',
      add: 'ເພີ່ມ',
      wallets: 'ກະເປົ໋າ',
      settings: 'ຕັ້ງຄ່າ'
    }
  : {
      home: 'Home',
      transactions: 'Transactions',
      add: 'Add',
      wallets: 'Wallets',
      settings: 'Settings'
    })

const items = [
  { key: 'home', to: '/', icon: 'i-lucide-home' },
  { key: 'transactions', to: '/transactions', icon: 'i-lucide-receipt-text' },
  { key: 'add', to: '/add', icon: 'i-lucide-plus' },
  { key: 'wallets', to: '/wallets', icon: 'i-lucide-wallet' },
  { key: 'settings', to: '/settings', icon: 'i-lucide-settings' }
]

const localizedItems = computed(() =>
  items.map(item => ({
    ...item,
    label: navCopy.value[item.key as keyof typeof navCopy.value]
  }))
)

function isActive(path: string) {
  if (path === '/') return route.path === '/'
  return route.path === path || route.path.startsWith(`${path}/`)
}
</script>

<template>
  <nav class="fixed inset-x-0 bottom-0 z-30 transform-gpu">
    <div class="relative border-t border-white/50 bg-white/85 pb-[calc(env(safe-area-inset-bottom)+0.35rem)] shadow-[0_-16px_52px_-42px_rgba(15,23,42,0.55)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/90">
      <div class="grid w-full grid-cols-5 items-end gap-1 px-3 pt-1.5 md:mx-auto md:max-w-md">
        <NuxtLink
          v-for="item in localizedItems.slice(0, 2)"
          :key="item.to"
          :to="item.to"
          class="group relative flex flex-col items-center justify-center gap-0.5 rounded-2xl px-1 py-1.5 text-center transition active:scale-95"
          :class="isActive(item.to) ? 'text-primary' : 'text-muted'"
        >
          <div
            class="flex size-8 items-center justify-center rounded-2xl transition"
            :class="isActive(item.to) ? 'bg-primary/10 text-primary' : 'bg-transparent text-muted group-active:bg-slate-200/60 dark:group-active:bg-slate-800/80'"
          >
            <UIcon :name="item.icon" class="size-[18px]" />
          </div>
          <span class="text-[10.5px] font-semibold leading-none">{{ item.label }}</span>

          <span
            v-if="isActive(item.to)"
            class="absolute inset-x-3 -bottom-0.5 h-1 rounded-full bg-primary/75"
          />
        </NuxtLink>

        <NuxtLink
          :to="localizedItems[2].to"
          class="group relative flex flex-col items-center justify-center gap-0 rounded-2xl px-1 py-1 text-center transition active:scale-95"
          :class="isActive(localizedItems[2].to) ? 'text-primary' : 'text-muted'"
          :aria-label="localizedItems[2].label"
        >
          <div
            class="flex size-13 items-center justify-center rounded-full border-4 border-white/90 bg-gradient-to-br text-white shadow-[0_16px_44px_-18px_rgba(15,23,42,0.35)] transition"
            :class="[activeTheme.accent, isActive(localizedItems[2].to) ? 'scale-100' : 'group-active:scale-95']"
          >
            <UIcon :name="localizedItems[2].icon" class="size-6.5" />
          </div>

          <span
            v-if="isActive(localizedItems[2].to)"
            class="absolute inset-x-3 -bottom-0.5 h-1 rounded-full bg-primary/75"
          />
        </NuxtLink>

        <NuxtLink
          v-for="item in localizedItems.slice(3)"
          :key="item.to"
          :to="item.to"
          class="group relative flex flex-col items-center justify-center gap-0.5 rounded-2xl px-1 py-1.5 text-center transition active:scale-95"
          :class="isActive(item.to) ? 'text-primary' : 'text-muted'"
        >
          <div
            class="flex size-8 items-center justify-center rounded-2xl transition"
            :class="isActive(item.to) ? 'bg-primary/10 text-primary' : 'bg-transparent text-muted group-active:bg-slate-200/60 dark:group-active:bg-slate-800/80'"
          >
            <UIcon :name="item.icon" class="size-[18px]" />
          </div>
          <span class="text-[10.5px] font-semibold leading-none">{{ item.label }}</span>

          <span
            v-if="isActive(item.to)"
            class="absolute inset-x-3 -bottom-0.5 h-1 rounded-full bg-primary/75"
          />
        </NuxtLink>
      </div>
    </div>
  </nav>
</template>
