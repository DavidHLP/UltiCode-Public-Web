<script setup lang="ts">
import type { SidebarProps } from '@/components/ui/sidebar'
import Calendars from '@/layout/Calendars.vue'
import { fetchProblemLists } from '@/api/problem-list'
import DatePicker from '@/layout/DatePicker.vue'
import NavUser from '@/layout/NavUser.vue'
import { onMounted, ref } from 'vue'
import type { ProblemList } from '@/mocks/schema/problem-list'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarSeparator,
} from '@/components/ui/sidebar'

const props = defineProps<SidebarProps>()
// This is sample data.
const data = {
  user: {
    name: 'shadcn',
    email: 'm@example.com',
    avatar: '/avatars/shadcn.jpg',
  },
}

const problemLists = ref<ProblemList[]>([])

onMounted(async () => {
  try {
    problemLists.value = await fetchProblemLists()
  } catch (error) {
    console.error('Failed to load problem lists', error)
    problemLists.value = []
  }
})
</script>

<template>
  <Sidebar v-bind="props">
    <SidebarHeader class="h-16 border-b border-sidebar-border">
      <NavUser :user="data.user" />
    </SidebarHeader>
    <SidebarContent>
      <DatePicker />
      <SidebarSeparator class="mx-0" />
      <Calendars :problemLists="problemLists" />
    </SidebarContent>
    <SidebarFooter>
      <!-- TODO: Implement new calendar feature -->
    </SidebarFooter>
    <SidebarRail />
  </Sidebar>
</template>
