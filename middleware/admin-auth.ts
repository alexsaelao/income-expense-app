export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path === '/admin-login') return

  const { isAuthenticated, hydrateAuth, signOut } = useAdminDeviceAuth()

  if (import.meta.client) {
    hydrateAuth()
    if (!isAuthenticated.value) {
      return navigateTo('/admin-login')
    }

    try {
      const result = await $fetch<{ authenticated?: boolean }>('/api/admin/me')

      if (!result.authenticated) {
        signOut()
        return navigateTo('/admin-login')
      }
    }
    catch {
      signOut()
      return navigateTo('/admin-login')
    }

    return
  }

  try {
    const headers = useRequestHeaders(['cookie'])
    const result = await $fetch<{ authenticated?: boolean }>('/api/admin/me', { headers })

    if (!result.authenticated) {
      return navigateTo('/admin-login')
    }
  }
  catch {
    return navigateTo('/admin-login')
  }
})
