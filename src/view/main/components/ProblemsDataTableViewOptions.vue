<script setup lang="ts">
import type { Table } from '@tanstack/vue-table'
import type { ProblemCard } from '@/api/problem/problems'
import { computed } from 'vue'
import MixerHorizontalIcon from '~icons/radix-icons/mixer-horizontal'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface ProblemsDataTableViewOptionsProps {
  table: Table<ProblemCard>
}

const props = defineProps<ProblemsDataTableViewOptionsProps>()

const columns = computed(() =>
  props.table
    .getAllColumns()
    .filter((column) => typeof column.accessorFn !== 'undefined' && column.getCanHide()),
)

function getColumnDisplayName(columnId: string): string {
  const nameMap: Record<string, string> = {
    id: 'ID',
    title: '题目',
    difficulty: '难度',
    tags: '标签',
    'stats.timeLimitMs': '时间限制',
    'stats.memoryLimitKb': '内存限制',
    metadata: '统计信息',
    actions: '操作',
  }
  return nameMap[columnId] || columnId
}
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button variant="outline" size="sm" class="ml-auto hidden h-8 lg:flex">
        <MixerHorizontalIcon class="mr-2 h-4 w-4" />
        视图
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" class="w-[200px]">
      <DropdownMenuLabel>显示列</DropdownMenuLabel>
      <DropdownMenuSeparator />

      <DropdownMenuCheckboxItem
        v-for="column in columns"
        :key="column.id"
        class="capitalize"
        :model-value="column.getIsVisible()"
        @update:model-value="(value) => column.toggleVisibility(!!value)"
      >
        {{ getColumnDisplayName(column.id) }}
      </DropdownMenuCheckboxItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
