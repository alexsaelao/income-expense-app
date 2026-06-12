<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin-auth'
})

const route = useRoute()
const { selectedLanguage } = useAppLanguage()
const { activeTheme } = useAppThemeColor()
const displayTimeZone = 'Asia/Vientiane'
const { data: overview, pending } = useSuperadminData()

const adminCopy = computed(() => selectedLanguage.value === 'lo'
  ? {
      title: 'Super Admin',
      subtitle: 'ໜ້າລວມຂອງລະບົບ ແລະທາງລັດໄປໜ້າຈັດການຕ່າງໆ',
      overview: 'ພາບລວມ',
      connected: 'ເຊື່ອມຕໍ່ແລ້ວ',
      disconnected: 'ບໍ່ເຊື່ອມຕໍ່',
      totalAccounts: 'ຜູ້ໃຊ້ທັງໝົດ',
      proAccounts: 'Pro',
      freeAccounts: 'Free',
      cloudBackups: 'Cloud backups',
      totalBackups: 'Cloud backups',
      latestBackup: 'Backup ລ່າສຸດ',
      openUsers: 'ໄປຫາ Users',
      openKeys: 'ໄປຫາ Keys',
      openSettings: 'ໄປຫາ Settings',
      usersDesc: 'ຈັດການຜູ້ໃຊ້, plan ແລະ cloud backup.',
      keysDesc: 'ສ້າງ Pro key ແລະກວດ key ທີ່ໃຊ້ແລ້ວ.',
      settingsDesc: 'ປັບພາສາ ແລະຮູບແບບໜ້າຕາຂອງແອັບຈັດການ.',
      usersCardTitle: 'Users',
      keysCardTitle: 'Keys',
      settingsCardTitle: 'Settings',
      backupStatus: 'Backup status',
      roleTools: 'ເຄື່ອງມືຈັດການ'
    }
  : {
      title: 'Super Admin',
      subtitle: 'High-level system dashboard with separate pages for managing users, keys, and settings.',
      overview: 'Overview',
      connected: 'Connected',
      disconnected: 'Disconnected',
      totalAccounts: 'Total users',
      proAccounts: 'Pro',
      freeAccounts: 'Free',
      cloudBackups: 'Cloud backups',
      totalBackups: 'Cloud backups',
      latestBackup: 'Latest backup',
      openUsers: 'Open Users',
      openKeys: 'Open Keys',
      openSettings: 'Open Settings',
      usersDesc: 'Manage users, plans, and cloud backup data.',
      keysDesc: 'Create Pro keys and review redeemed keys.',
      settingsDesc: 'Adjust the admin language and appearance here.',
      usersCardTitle: 'Users',
      keysCardTitle: 'Keys',
      settingsCardTitle: 'Settings',
      backupStatus: 'Backup status',
      roleTools: 'Admin tools'
    })

const isConnected = computed(() => Boolean(overview.value?.connected))
const stats = computed(() => overview.value?.stats ?? null)
const recentAccounts = computed(() => (overview.value?.accounts ?? []).slice(0, 4))
const recentKeys = computed(() => (overview.value?.redeemKeys ?? []).slice(0, 4))
function formatDate(value?: string | null) {
  if (!value) return '—'
  return new Intl.DateTimeFormat(selectedLanguage.value === 'lo' ? 'lo-LA' : 'en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: displayTimeZone,
    timeZoneName: 'short'
  }).format(new Date(value))
}

function formatShortDate(value?: string | null) {
  if (!value) return '—'
  return new Intl.DateTimeFormat(selectedLanguage.value === 'lo' ? 'lo-LA' : 'en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: displayTimeZone
  }).format(new Date(value))
}

function formatCloudSize(bytes?: number | null) {
  const size = Number(bytes ?? 0)
  if (!Number.isFinite(size) || size <= 0) return '0 B'
  if (size < 1024) return `${size} B`
  const units = ['KB', 'MB', 'GB']
  let value = size / 1024
  let unitIndex = 0
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024
    unitIndex += 1
  }
  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[unitIndex]}`
}

useHead({
  title: 'Super Admin · Overview'
})
</script>

<template>
  <div v-if="route.path === '/superadmin'" class="space-y-4 pb-8 md:space-y-6">
    <section class="relative overflow-hidden rounded-[1.6rem] border border-slate-200/80 bg-white/90 p-4 shadow-[0_22px_60px_-30px_rgba(15,23,42,0.2)] dark:border-slate-800 dark:bg-slate-950/80 md:p-6">
      <div :class="['absolute inset-x-0 top-0 h-1.5', activeTheme.accent]" />
      <div class="absolute -right-10 top-3 size-28 rounded-full bg-sky-400/10 blur-3xl" />
      <div class="absolute -left-8 bottom-0 size-24 rounded-full bg-cyan-400/10 blur-3xl" />

      <div class="relative">
        <div class="min-w-0">
          <p class="text-[10px] font-semibold uppercase tracking-[0.32em] text-muted">{{ adminCopy.overview }}</p>
          <h1 class="mt-1 text-[1.85rem] font-black tracking-tight text-default">{{ adminCopy.title }}</h1>
          <p class="mt-1 max-w-[26rem] text-sm leading-6 text-muted">{{ adminCopy.subtitle }}</p>

          <div class="mt-3.5 flex flex-wrap items-center gap-2">
            <UBadge
              :color="isConnected ? 'emerald' : 'rose'"
              variant="soft"
              class="rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em]"
            >
              {{ isConnected ? adminCopy.connected : adminCopy.disconnected }}
            </UBadge>
            <UBadge color="neutral" variant="soft" class="rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em]">
              {{ adminCopy.roleTools }}
            </UBadge>
          </div>
        </div>
      </div>

      <div class="relative mt-3 grid grid-cols-1 gap-2.5 md:grid-cols-2 xl:grid-cols-4">
        <div class="rounded-[1.1rem] border border-slate-200/80 bg-slate-50 px-3 py-3 dark:border-slate-800 dark:bg-slate-900">
          <p class="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">{{ adminCopy.totalAccounts }}</p>
          <p class="mt-1 text-[1.9rem] font-black leading-none text-default">{{ stats?.totalAccounts ?? 0 }}</p>
        </div>
        <div class="rounded-[1.1rem] border border-slate-200/80 bg-slate-50 px-3 py-3 dark:border-slate-800 dark:bg-slate-900">
          <p class="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">{{ adminCopy.proAccounts }}</p>
          <p class="mt-1 text-[1.9rem] font-black leading-none text-default">{{ stats?.proAccounts ?? 0 }}</p>
        </div>
        <div class="rounded-[1.1rem] border border-slate-200/80 bg-slate-50 px-3 py-3 dark:border-slate-800 dark:bg-slate-900">
          <p class="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">{{ adminCopy.cloudBackups }}</p>
          <p class="mt-1 text-[1.9rem] font-black leading-none text-default">{{ stats?.totalBackups ?? 0 }}</p>
        </div>
        <div class="rounded-[1.1rem] border border-slate-200/80 bg-slate-50 px-3 py-3 dark:border-slate-800 dark:bg-slate-900">
          <p class="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">{{ adminCopy.latestBackup }}</p>
          <p class="mt-1 text-sm font-black leading-none text-default">{{ stats?.latestBackupAt ? formatDate(stats.latestBackupAt) : '—' }}</p>
        </div>
      </div>

      <div class="relative mt-3 grid grid-cols-1 gap-2.5">
        <div class="rounded-[1.15rem] border border-slate-200/80 bg-white/75 px-3 py-3 dark:border-slate-800 dark:bg-slate-950/60">
          <div class="flex items-center justify-between gap-2.5">
            <div class="min-w-0">
              <p class="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">{{ adminCopy.backupStatus }}</p>
              <p class="mt-1 text-sm font-black text-default">{{ isConnected ? adminCopy.connected : adminCopy.disconnected }}</p>
              <p class="mt-1 text-[11px] leading-5 text-muted">
                {{ stats?.latestBackupAt ? formatDate(stats.latestBackupAt) : '—' }}
              </p>
            </div>
            <div class="flex shrink-0 flex-col items-end gap-1">
              <UBadge
                :color="isConnected ? 'emerald' : 'rose'"
                variant="soft"
                class="rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em]"
              >
                {{ isConnected ? adminCopy.connected : adminCopy.disconnected }}
              </UBadge>
              <span class="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">{{ formatShortDate(stats?.latestBackupAt) }}</span>
            </div>
          </div>
        </div>

        <div class="rounded-[1.15rem] border border-slate-200/80 bg-white/75 px-3 py-3 dark:border-slate-800 dark:bg-slate-950/60">
          <div class="flex items-center justify-between gap-2.5">
            <div class="min-w-0">
              <p class="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">{{ adminCopy.latestBackup }}</p>
              <p class="mt-1 text-sm font-black text-default">{{ stats?.latestBackupAt ? formatDate(stats.latestBackupAt) : '—' }}</p>
              <p class="mt-1 text-[11px] leading-5 text-muted">Cloud backup timeline</p>
            </div>
            <div class="flex size-10 items-center justify-center rounded-full border border-slate-200/80 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
              <UIcon name="i-lucide-clock-3" class="size-4.5" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="grid grid-cols-1 gap-2.5 md:grid-cols-3">
      <NuxtLink to="/superadmin/users" class="block rounded-[1.25rem] border border-slate-200/80 bg-white p-4 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.18)] transition active:scale-[0.99] dark:border-slate-800 dark:bg-slate-950/70">
        <div class="flex items-center justify-between gap-2.5">
          <div class="min-w-0">
            <p class="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">{{ adminCopy.usersCardTitle }}</p>
            <p class="mt-1 text-sm font-bold text-default">{{ adminCopy.usersDesc }}</p>
          </div>
          <div class="flex size-10 items-center justify-center rounded-full bg-black text-white shadow-lg dark:bg-white dark:text-black">
            <UIcon name="i-lucide-users-round" class="size-4.5" />
          </div>
        </div>
        <div class="mt-3 flex items-end justify-between">
          <p class="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">{{ adminCopy.totalAccounts }}</p>
          <p class="text-2xl font-black text-default">{{ stats?.totalAccounts ?? 0 }}</p>
        </div>
      </NuxtLink>

      <NuxtLink to="/superadmin/keys" class="block rounded-[1.25rem] border border-slate-200/80 bg-white p-4 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.18)] transition active:scale-[0.99] dark:border-slate-800 dark:bg-slate-950/70">
        <div class="flex items-center justify-between gap-2.5">
          <div class="min-w-0">
            <p class="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">{{ adminCopy.keysCardTitle }}</p>
            <p class="mt-1 text-sm font-bold text-default">{{ adminCopy.keysDesc }}</p>
          </div>
          <div class="flex size-10 items-center justify-center rounded-full bg-black text-white shadow-lg dark:bg-white dark:text-black">
            <UIcon name="i-lucide-key-round" class="size-4.5" />
          </div>
        </div>
        <div class="mt-3 flex items-end justify-between">
          <p class="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">{{ adminCopy.totalBackups }}</p>
          <p class="text-2xl font-black text-default">{{ stats?.totalBackups ?? 0 }}</p>
        </div>
      </NuxtLink>

      <NuxtLink to="/superadmin/settings" class="block rounded-[1.25rem] border border-slate-200/80 bg-white p-4 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.18)] transition active:scale-[0.99] dark:border-slate-800 dark:bg-slate-950/70">
        <div class="flex items-center justify-between gap-2.5">
          <div class="min-w-0">
            <p class="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">{{ adminCopy.settingsCardTitle }}</p>
            <p class="mt-1 text-sm font-bold text-default">{{ adminCopy.settingsDesc }}</p>
          </div>
          <div class="flex size-10 items-center justify-center rounded-full bg-black text-white shadow-lg dark:bg-white dark:text-black">
            <UIcon name="i-lucide-settings" class="size-4.5" />
          </div>
        </div>
        <div class="mt-3 flex items-end justify-between">
          <p class="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">{{ adminCopy.cloudBackups }}</p>
          <p class="text-2xl font-black text-default">{{ stats?.totalBackups ?? 0 }}</p>
        </div>
      </NuxtLink>
    </section>

    <section class="grid grid-cols-1 gap-2.5 md:grid-cols-2 md:gap-4">
      <div class="overflow-hidden rounded-[1.35rem] border border-slate-200/80 bg-white/85 shadow-[0_22px_60px_-32px_rgba(15,23,42,0.2)] dark:border-slate-800 dark:bg-slate-950/75">
        <div class="border-b border-slate-200/80 px-4 py-2.5 dark:border-slate-800">
          <p class="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted">Recent users</p>
          <h2 class="text-sm font-black tracking-tight text-default">Latest account updates</h2>
        </div>

        <div class="divide-y divide-slate-200/80 dark:divide-slate-800">
          <div
            v-for="account in recentAccounts"
            :key="account.identifier"
            class="flex items-center justify-between gap-2.5 px-4 py-2.5"
          >
            <div class="min-w-0">
              <p class="truncate text-sm font-bold text-default">{{ account.identifier }}</p>
              <p class="mt-1 text-[11px] leading-5 text-muted">
                <span class="whitespace-nowrap">{{ account.plan === 'pro' ? 'Pro' : 'Free' }}</span>
                <span class="mx-1">·</span>
                <span class="whitespace-nowrap">Cloud backup</span>
              </p>
            </div>
            <div class="text-right">
              <p class="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">{{ account.cloudSizeBytes ? formatCloudSize(account.cloudSizeBytes) : '0 B' }}</p>
              <p class="mt-1 text-[11px] leading-5 text-muted">{{ formatShortDate(account.updatedAt) }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="overflow-hidden rounded-[1.35rem] border border-slate-200/80 bg-white/85 shadow-[0_22px_60px_-32px_rgba(15,23,42,0.2)] dark:border-slate-800 dark:bg-slate-950/75">
        <div class="border-b border-slate-200/80 px-4 py-2.5 dark:border-slate-800">
          <p class="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted">Recent keys</p>
          <h2 class="text-sm font-black tracking-tight text-default">Latest redeem keys</h2>
        </div>

        <div class="divide-y divide-slate-200/80 dark:divide-slate-800">
          <div
            v-for="key in recentKeys"
            :key="key.code"
            class="flex items-center justify-between gap-2.5 px-4 py-2.5"
          >
            <div class="min-w-0">
              <p class="truncate text-sm font-bold text-default">{{ key.code }}</p>
              <p class="mt-1 text-[11px] leading-5 text-muted">
                <span class="whitespace-nowrap">{{ key.active ? 'Available' : 'Used' }}</span>
                <span class="mx-1">·</span>
                <span class="whitespace-nowrap">{{ key.redeemedBy ? `by ${key.redeemedBy}` : 'not redeemed yet' }}</span>
              </p>
            </div>
            <div class="text-right">
              <p class="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">{{ formatShortDate(key.createdAt) }}</p>
              <p class="mt-1 text-[11px] leading-5 text-muted">{{ key.redeemedAt ? formatShortDate(key.redeemedAt) : '—' }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="overflow-hidden rounded-[1.35rem] border border-slate-200/80 bg-white/85 shadow-[0_22px_60px_-32px_rgba(15,23,42,0.2)] dark:border-slate-800 dark:bg-slate-950/75">
      <div class="px-4 py-3">
        <p class="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted">{{ adminCopy.roleTools }}</p>
        <h2 class="text-sm font-black tracking-tight text-default">{{ adminCopy.title }}</h2>
      </div>

      <div class="space-y-2.5 border-t border-slate-200/80 px-4 py-2.5 dark:border-slate-800">
        <NuxtLink to="/superadmin/users" class="block rounded-[1.15rem] border border-slate-200/80 bg-slate-50 px-3 py-3 transition active:scale-[0.99] dark:border-slate-800 dark:bg-slate-900">
          <div class="flex items-center justify-between gap-2.5">
            <div class="min-w-0">
              <p class="text-sm font-bold text-default">{{ adminCopy.usersCardTitle }}</p>
              <p class="text-xs leading-5 text-muted">{{ adminCopy.usersDesc }}</p>
            </div>
            <div class="flex size-10 items-center justify-center rounded-full bg-black text-white shadow-lg dark:bg-white dark:text-black">
              <UIcon name="i-lucide-users-round" class="size-4.5" />
            </div>
          </div>
        </NuxtLink>

        <NuxtLink to="/superadmin/keys" class="block rounded-[1.15rem] border border-slate-200/80 bg-slate-50 px-3 py-3 transition active:scale-[0.99] dark:border-slate-800 dark:bg-slate-900">
          <div class="flex items-center justify-between gap-2.5">
            <div class="min-w-0">
              <p class="text-sm font-bold text-default">{{ adminCopy.keysCardTitle }}</p>
              <p class="text-xs leading-5 text-muted">{{ adminCopy.keysDesc }}</p>
            </div>
            <div class="flex size-10 items-center justify-center rounded-full bg-black text-white shadow-lg dark:bg-white dark:text-black">
              <UIcon name="i-lucide-key-round" class="size-4.5" />
            </div>
          </div>
        </NuxtLink>

        <NuxtLink to="/superadmin/settings" class="block rounded-[1.15rem] border border-slate-200/80 bg-slate-50 px-3 py-3 transition active:scale-[0.99] dark:border-slate-800 dark:bg-slate-900">
          <div class="flex items-center justify-between gap-2.5">
            <div class="min-w-0">
              <p class="text-sm font-bold text-default">{{ adminCopy.settingsCardTitle }}</p>
              <p class="text-xs leading-5 text-muted">{{ adminCopy.settingsDesc }}</p>
            </div>
            <div class="flex size-10 items-center justify-center rounded-full bg-black text-white shadow-lg dark:bg-white dark:text-black">
              <UIcon name="i-lucide-settings" class="size-4.5" />
            </div>
          </div>
        </NuxtLink>
      </div>
    </section>

    <section class="rounded-[1.35rem] border border-slate-200/80 bg-white/85 p-4 text-xs leading-6 text-muted shadow-[0_22px_60px_-32px_rgba(15,23,42,0.2)] dark:border-slate-800 dark:bg-slate-950/75">
      <p class="font-bold text-default">System snapshot</p>
      <ul class="mt-2 space-y-0.5">
        <li>• Overview, Users, Keys, Settings are separated into their own pages.</li>
        <li>• Use the bottom navigation to jump between admin pages.</li>
        <li>• Check the latest cloud backup from the dashboard cards above.</li>
        <li>• Generate single-use Pro keys from the Keys page and review redeemed keys anytime.</li>
      </ul>
    </section>
  </div>
  <NuxtPage v-else />
</template>
