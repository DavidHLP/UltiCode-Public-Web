import type { Router } from 'vue-router'
import type { Pinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { LOGIN_ROUTE_NAME, MAIN_ROUTE_NAME } from '@/router/index'

export function setupRouterGuards(router: Router, pinia: Pinia) {
  router.beforeEach((to, _from, next) => {
    const authStore = useAuthStore(pinia)
    const isAuthenticated = authStore.isAuthenticated

    if (to.meta.requiresAuth && !isAuthenticated) {
      next({ name: LOGIN_ROUTE_NAME, query: { redirect: to.fullPath } })
      return
    }

    if (to.meta.guestOnly && isAuthenticated) {
      next({ name: MAIN_ROUTE_NAME })
      return
    }

    next()
  })
}
