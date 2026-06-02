<script setup lang="ts">
const route = useRoute()
const { authReady, isAuthenticated } = useAdminDeviceAuth()
const isAdminLogin = computed(() => route.path === '/admin-login')
const showAdminNav = computed(() => authReady.value && isAuthenticated.value && route.path.startsWith('/superadmin'))
</script>

<template>
  <div class="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top,_rgba(125,211,252,0.16),_transparent_36%),linear-gradient(180deg,_#f8fafc_0%,_#ffffff_100%)] text-slate-900 dark:bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.14),_transparent_34%),linear-gradient(180deg,_#020617_0%,_#0f172a_100%)] dark:text-slate-50">
    <main
      class="mx-auto flex w-full max-w-md flex-col px-4"
      :class="isAdminLogin
        ? 'min-h-screen items-center justify-center py-4'
        : 'min-h-screen pt-[calc(env(safe-area-inset-top)+0.75rem)] pb-[calc(env(safe-area-inset-bottom)+6.5rem)]'"
    >
      <div class="w-full">
        <slot />
      </div>
    </main>
    <AdminBottomNav v-if="showAdminNav" />
  </div>
</template>
