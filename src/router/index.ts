import { createRouter, createWebHistory } from 'vue-router'

export const MAIN_ROUTE_NAME = 'main'
export const LOGIN_ROUTE_NAME = 'login'
export const REGISTER_ROUTE_NAME = 'register'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: { name: LOGIN_ROUTE_NAME },
    },
    {
      path: '/login',
      name: LOGIN_ROUTE_NAME,
      component: () => import('@/pages/login/index.vue'),
      meta: { guestOnly: true },
    },
    {
      path: '/register',
      name: REGISTER_ROUTE_NAME,
      component: () => import('@/pages/register/index.vue'),
      meta: { guestOnly: true },
    },
    {
      path: '/main',
      name: MAIN_ROUTE_NAME,
      component: () => import('@/pages/main/index.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/pages/dashboard/index.vue'),
      meta: { requiresAuth: true },
    },
  ],
})

export default router
