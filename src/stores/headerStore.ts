import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { HeaderModel } from '@/view/demo/store'

export const useHeaderStore = defineStore('header', () => {
  // 主菜单 headers
  const mainMenuHeaders = ref<HeaderModel[]>([
    { id: 1, index: 0, title: '首页', icon: 'Home' },
    { id: 2, index: 1, title: '设置', icon: 'Settings' },
  ])

  // 用户菜单 headers
  const userMenuHeaders = ref<HeaderModel[]>([
    { id: 4, index: 0, title: '个人中心', icon: 'User' },
    { id: 3, index: 1, title: '系统配置', icon: 'Settings' },
  ])

  // 更新主菜单 headers
  const updateMainMenuHeaders = (newHeaders: HeaderModel[]) => {
    mainMenuHeaders.value = newHeaders.map((header, idx) => ({
      ...header,
      index: idx,
    }))
  }

  // 更新用户菜单 headers
  const updateUserMenuHeaders = (newHeaders: HeaderModel[]) => {
    userMenuHeaders.value = newHeaders.map((header, idx) => ({
      ...header,
      index: idx,
    }))
  }

  return {
    mainMenuHeaders,
    userMenuHeaders,
    updateMainMenuHeaders,
    updateUserMenuHeaders,
  }
})
