<script setup lang="ts">
const route = useRoute()
const { selectedLanguage } = useAppLanguage()
const { authReady, isAuthenticated, hydrateAuth } = useAdminDeviceAuth()
const { data: adminSession } = await useAsyncData<{ authenticated?: boolean }>('admin-layout-session', async () => {
  if (import.meta.server) {
    const headers = useRequestHeaders(['cookie'])
    return await $fetch('/api/admin/me', { headers })
  }

  return await $fetch('/api/admin/me')
})
const isAdminLogin = computed(() => route.path === '/admin-login')
const isSuperadminWorkspace = computed(() => route.path.startsWith('/superadmin'))
const showAdminNav = computed(() => {
  const hasServerSession = Boolean(adminSession.value?.authenticated)
  const hasClientSession = import.meta.client && authReady.value && isAuthenticated.value

  return (hasServerSession || hasClientSession) && route.path.startsWith('/superadmin')
})

const adminNavItems = computed(() => {
  if (selectedLanguage.value === 'lo') {
    return [
      { label: 'ພາບລວມ', to: '/superadmin', icon: 'i-lucide-layout-dashboard' },
      { label: 'ຜູ້ໃຊ້', to: '/superadmin/users', icon: 'i-lucide-users-round' },
      { label: 'ຄີ', to: '/superadmin/keys', icon: 'i-lucide-key-round' },
      { label: 'ຕັ້ງຄ່າ', to: '/superadmin/settings', icon: 'i-lucide-settings' }
    ]
  }

  return [
    { label: 'Overview', to: '/superadmin', icon: 'i-lucide-layout-dashboard' },
    { label: 'Users', to: '/superadmin/users', icon: 'i-lucide-users-round' },
    { label: 'Keys', to: '/superadmin/keys', icon: 'i-lucide-key-round' },
    { label: 'Settings', to: '/superadmin/settings', icon: 'i-lucide-settings' }
  ]
})

function isActiveAdminNavItem(path: string) {
  if (path === '/superadmin') {
    return route.path === path
  }

  return route.path === path || route.path.startsWith(`${path}/`)
}

onMounted(() => {
  if (import.meta.client) {
    hydrateAuth()
  }
})
</script>

<template>
  <div class="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top,_rgba(125,211,252,0.16),_transparent_36%),linear-gradient(180deg,_#f8fafc_0%,_#ffffff_100%)] text-slate-900 dark:bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.14),_transparent_34%),linear-gradient(180deg,_#020617_0%,_#0f172a_100%)] dark:text-slate-50">
    <main
      class="mx-auto flex w-full flex-col"
      :class="isAdminLogin
        ? 'max-w-md min-h-screen items-center justify-center px-4 py-4'
        : isSuperadminWorkspace
          ? 'min-h-screen pt-[calc(env(safe-area-inset-top)+0.75rem)] pb-[calc(env(safe-area-inset-bottom)+6.5rem)] md:max-w-[1440px] md:px-6 md:pb-6'
          : 'max-w-md min-h-screen px-4 pt-[calc(env(safe-area-inset-top)+0.75rem)] pb-[calc(env(safe-area-inset-bottom)+6.5rem)]'"
    >
      <template v-if="isAdminLogin">
        <div class="w-full">
          <slot />
        </div>
      </template>

      <template v-else-if="isSuperadminWorkspace">
        <div class="mx-auto flex w-full max-w-md flex-col gap-4 md:max-w-none md:flex-row md:items-start md:gap-6">
          <aside class="hidden md:sticky md:top-6 md:flex md:w-[19rem] md:flex-col md:gap-4">
            <div class="overflow-hidden rounded-[1.6rem] bg-white/90 p-4 shadow-[0_22px_60px_-32px_rgba(15,23,42,0.2)] dark:bg-slate-950/80">
              <div class="flex size-14 items-center justify-center overflow-hidden rounded-[1.4rem] bg-transparent">
                <img src="/wallet-codesabai-mark-plain.svg" alt="" class="h-full w-full object-contain" />
              </div>
              <p class="mt-3 text-[10px] font-semibold uppercase tracking-[0.28em] text-muted">Wallet Code Sabai</p>
              <h1 class="mt-1 text-xl font-black tracking-tight text-default">Super Admin</h1>
              <p class="mt-2 text-sm leading-6 text-muted">
                {{ selectedLanguage === 'lo'
                  ? 'ພື້ນທີ່ສຳລັບແທັບເລັດ ແລະ ເດສກ໌ທັອບ ໃຊ້ຈັດການລະບົບບັນຊີ.'
                  : 'Tablet and desktop workspace for managing the account system.' }}
              </p>
            </div>

            <nav class="overflow-hidden rounded-[1.6rem] border border-slate-200/80 bg-white/90 p-2 shadow-[0_22px_60px_-32px_rgba(15,23,42,0.2)] dark:border-slate-800 dark:bg-slate-950/80">
              <NuxtLink
                v-for="item in adminNavItems"
                :key="item.to"
                :to="item.to"
                class="group flex items-center gap-3 rounded-[1.1rem] px-3 py-3 transition active:scale-[0.99]"
                :class="isActiveAdminNavItem(item.to)
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted hover:bg-slate-100 dark:hover:bg-slate-900'"
              >
                <div
                  class="flex size-10 shrink-0 items-center justify-center rounded-2xl transition"
                  :class="isActiveAdminNavItem(item.to)
                    ? 'bg-primary text-white shadow-[0_14px_28px_-18px_rgba(14,165,233,0.35)]'
                    : 'bg-slate-100 text-slate-500 dark:bg-slate-900 dark:text-slate-300'"
                >
                  <UIcon :name="item.icon" class="size-4.5" />
                </div>
                <div class="min-w-0">
                  <p class="text-sm font-bold leading-none">{{ item.label }}</p>
                  <p class="mt-1 text-[11px] leading-4 opacity-80">
                    {{ selectedLanguage === 'lo' ? `ເປີດ ${item.label}` : `Open ${item.label.toLowerCase()}` }}
                  </p>
                </div>
              </NuxtLink>
            </nav>
          </aside>

          <div class="min-w-0 flex-1">
            <div class="w-full md:rounded-[2rem] md:border md:border-slate-200/80 md:bg-white/80 md:p-5 md:shadow-[0_26px_70px_-36px_rgba(15,23,42,0.24)] md:backdrop-blur-xl dark:md:border-slate-800 dark:md:bg-slate-950/70">
              <slot />
            </div>
          </div>
        </div>
      </template>

      <template v-else>
        <div class="w-full">
          <slot />
        </div>
      </template>
    </main>
    <AdminBottomNav v-if="showAdminNav" class="md:hidden" />
  </div>
</template>
