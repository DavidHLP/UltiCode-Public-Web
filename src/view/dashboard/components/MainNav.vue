<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

import { cn } from '@/lib/utils'
import { MAIN_ROUTE_NAME } from '@/router'

interface NavItem {
  label: string
  to: RouteLocationRaw
  exact?: boolean
  disabled?: boolean
}

const route = useRoute()

const items: NavItem[] = [
  {
    label: '数据概览',
    to: { name: 'dashboard' },
    exact: true,
  },
  {
    label: '公开题库',
    to: { name: MAIN_ROUTE_NAME },
  },
  {
    label: '比赛中心',
    to: '#',
    disabled: true,
  },
  {
    label: '讨论区',
    to: '#',
    disabled: true,
  },
]

function isActive(item: NavItem) {
  if (item.disabled) {
    return false
  }
  if (typeof item.to === 'object' && 'name' in item.to) {
    return route.name === item.to.name
  }
  if (typeof item.to === 'string') {
    return route.path === item.to
  }
  return false
}

const classes = computed(() =>
  items.map((item) =>
    cn(
      'text-sm font-medium transition-colors hover:text-primary',
      item.disabled && 'cursor-not-allowed text-muted-foreground/60 hover:text-muted-foreground/60',
      !item.disabled && isActive(item) ? 'text-primary' : 'text-muted-foreground'
    )
  )
)
</script>

<template>
  <nav :class="cn('flex items-center space-x-4 lg:space-x-6', $attrs.class ?? '')">
    <template v-for="(item, index) in items" :key="item.label">
      <RouterLink
        v-if="!item.disabled && item.to !== '#'"
        :to="item.to"
        :class="classes[index]"
      >
        {{ item.label }}
      </RouterLink>
      <span v-else :class="classes[index]">
        {{ item.label }}
      </span>
    </template>
  </nav>
</template>
