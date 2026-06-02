<script setup lang="ts">
const route = useRoute()
const { activeTheme } = useAppThemeColor()

const items = [
  { label: 'Overview', to: '/superadmin', icon: 'i-lucide-layout-dashboard' },
  { label: 'Users', to: '/superadmin/users', icon: 'i-lucide-users-round' },
  { label: 'Keys', to: '/superadmin/keys', icon: 'i-lucide-key-round' },
  { label: 'Settings', to: '/superadmin/settings', icon: 'i-lucide-settings' }
]
const currentPath = computed(() => route.path)

function isActive(path: string) {
  if (path === '/superadmin') {
    return currentPath.value === path
  }

  return currentPath.value === path || currentPath.value.startsWith(`${path}/`)
}
</script>

<template>
  <nav class="fixed inset-x-0 bottom-0 z-30 transform-gpu">
    <div class="relative border-t border-white/60 bg-white/95 pb-[calc(env(safe-area-inset-bottom)+0.35rem)] shadow-[0_-16px_52px_-42px_rgba(15,23,42,0.6)] backdrop-blur-none dark:border-white/10 dark:bg-slate-950/95">
      <div class="grid w-full grid-cols-4 items-end gap-1 px-3 pt-1.5 md:mx-auto md:max-w-md">
        <NuxtLink
          v-for="item in items"
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
