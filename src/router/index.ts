import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/main',
      name: 'main',
      component: () => import('@/pages/main/index.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/pages/login/index.vue'),
    },
  ],
})

export default router
