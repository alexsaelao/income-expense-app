<script setup lang="ts">
const route = useRoute()
const { activeTheme } = useAppThemeColor()
const { selectedLanguage } = useAppLanguage()

const items = computed(() => {
  if (selectedLanguage.value === 'lo') {
    return [
      { label: 'ໜ້າຫຼັກ', to: '/', icon: 'i-lucide-home' },
      { label: 'ທຸລະກຳ', to: '/transactions', icon: 'i-lucide-receipt-text' },
      { label: 'ເພີ່ມ', to: '/add', icon: 'i-lucide-plus' },
      { label: 'ກະເປົາ', to: '/wallets', icon: 'i-lucide-wallet' },
      { label: 'ຕັ້ງຄ່າ', to: '/settings', icon: 'i-lucide-settings' }
    ]
  }

  return [
    { label: 'Home', to: '/', icon: 'i-lucide-home' },
    { label: 'Transactions', to: '/transactions', icon: 'i-lucide-receipt-text' },
    { label: 'Add', to: '/add', icon: 'i-lucide-plus' },
    { label: 'Wallets', to: '/wallets', icon: 'i-lucide-wallet' },
    { label: 'Settings', to: '/settings', icon: 'i-lucide-settings' }
  ]
})

function isActive(path: string) {
  if (path === '/') return route.path === '/'
  return route.path === path || route.path.startsWith(`${path}/`)
}
</script>

<template>
  <nav class="fixed inset-x-0 bottom-0 z-30 transform-gpu">
    <div class="relative border-t border-white/60 bg-white/95 pb-[calc(env(safe-area-inset-bottom)+0.35rem)] shadow-[0_-16px_52px_-42px_rgba(15,23,42,0.6)] backdrop-blur-none dark:border-white/10 dark:bg-slate-950/95">
      <div class="grid w-full grid-cols-5 items-end gap-1 px-3 pt-1.5 md:px-6 md:pt-2 lg:mx-auto lg:max-w-[1024px] lg:px-8">
        <NuxtLink
          v-for="item in items.slice(0, 2)"
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
            :class="['absolute inset-x-3 -bottom-0.5 h-1 rounded-full bg-gradient-to-r', activeTheme.accent]"
          />
        </NuxtLink>

        <NuxtLink
          :to="items[2].to"
          class="group relative flex flex-col items-center justify-center gap-0 rounded-2xl px-1 py-1 text-center transition active:scale-95"
          :class="isActive(items[2].to) ? 'text-primary' : 'text-muted'"
          :aria-label="items[2].label"
        >
          <div
            :class="[
              'flex size-13 items-center justify-center rounded-full border-4 border-white/90 text-white shadow-[0_16px_44px_-18px_rgba(15,23,42,0.35)] transition bg-gradient-to-br',
              activeTheme.accent,
              isActive(items[2].to) ? 'scale-100' : 'group-active:scale-95'
            ]"
          >
            <UIcon :name="items[2].icon" class="size-6.5" />
          </div>

          <span
            v-if="isActive(items[2].to)"
            :class="['absolute inset-x-3 -bottom-0.5 h-1 rounded-full bg-gradient-to-r', activeTheme.accent]"
          />
        </NuxtLink>

        <NuxtLink
          v-for="item in items.slice(3)"
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
            :class="['absolute inset-x-3 -bottom-0.5 h-1 rounded-full bg-gradient-to-r', activeTheme.accent]"
          />
        </NuxtLink>
      </div>
    </div>
  </nav>
</template>
