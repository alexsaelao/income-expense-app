export default defineNuxtRouteMiddleware(async (to) => {
  const { authReady, isAuthenticated, hydrateAuth } = useAdminDeviceAuth()
  const isAdminLoginPage = to.path === '/admin-login'

  await hydrateAuth(true)

  if (isAuthenticated.value && isAdminLoginPage) {
    return navigateTo('/superadmin', { replace: true })
  }

  if (!isAuthenticated.value && !isAdminLoginPage) {
    return navigateTo('/admin-login', { replace: true })
  }
})
