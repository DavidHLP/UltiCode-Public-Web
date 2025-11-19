<script setup lang="ts">
import { Calendar } from '@/components/ui/calendar'
import { SidebarGroup, SidebarGroupContent } from '@/components/ui/sidebar'
import { fetchProblems } from '@/mocks/api/problem'
import { computed } from 'vue'
import { getLocalTimeZone, today } from '@internationalized/date'

const problems = fetchProblems()

const completedDates = computed(() => {
  return problems
    .filter((p) => p.status === 'solved' && p.completedTime)
    .map((p) => {
      const [year, month, day] = p.completedTime!.split('-').map(Number)
      return today(getLocalTimeZone()).set({ year, month, day })
    })
})
</script>

<template>
  <SidebarGroup class="px-0">
    <SidebarGroupContent>
      <Calendar
        :model-value="completedDates"
        multiple
        class="**:[[role=gridcell].bg-accent]:bg-sidebar-primary **:[[role=gridcell].bg-accent]:text-sidebar-primary-foreground **:[[role=gridcell]]:w-[33px]"
      />
    </SidebarGroupContent>
  </SidebarGroup>
</template>
