<script setup lang="ts">
import type { Table } from '@tanstack/vue-table'
import type { ProblemCard } from '@/api/problem/problems'
import { computed } from 'vue'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Cross2Icon from '~icons/radix-icons/cross-2'
import ProblemsDataTableFacetedFilter from './ProblemsDataTableFacetedFilter.vue'
import ProblemsDataTableViewOptions from './ProblemsDataTableViewOptions.vue'

interface ProblemsDataTableToolbarProps {
  table: Table<ProblemCard>
}

const props = defineProps<ProblemsDataTableToolbarProps>()

const isFiltered = computed(() => props.table.getState().columnFilters.length > 0)

// 难度选项
const difficultyOptions = [
  { label: '简单', value: 'easy', icon: null },
  { label: '中等', value: 'medium', icon: null },
  { label: '困难', value: 'hard', icon: null },
]

// 从数据中提取标签选项
const tagOptions = computed(() => {
  const tags = new Map()
  const rows = props.table.getCoreRowModel().rows

  rows.forEach((row) => {
    const problem = row.original
    problem.tags?.forEach((tag) => {
      if (tag.name && !tags.has(tag.slug ?? tag.id)) {
        tags.set(tag.slug ?? tag.id, {
          label: tag.name,
          value: tag.slug ?? tag.id,
          icon: null,
        })
      }
    })
  })

  return Array.from(tags.values()).slice(0, 20) // 限制最多20个标签
})
</script>

<template>
  <div class="flex items-center justify-between">
    <div class="flex flex-1 items-center space-x-2">
      <!-- 搜索输入 -->
      <Input
        placeholder="搜索题目名称或ID..."
        :model-value="(table.getColumn('title')?.getFilterValue() as string) ?? ''"
        class="h-8 w-[150px] lg:w-[250px]"
        @input="table.getColumn('title')?.setFilterValue($event.target.value)"
      />

      <!-- 难度过滤 -->
      <ProblemsDataTableFacetedFilter
        v-if="table.getColumn('difficulty')"
        :column="table.getColumn('difficulty')"
        title="难度"
        :options="difficultyOptions"
      />

      <!-- 标签过滤 -->
      <ProblemsDataTableFacetedFilter
        v-if="table.getColumn('tags') && tagOptions.length > 0"
        :column="table.getColumn('tags')"
        title="标签"
        :options="tagOptions"
      />

      <!-- 清除过滤按钮 -->
      <Button
        v-if="isFiltered"
        variant="ghost"
        class="h-8 px-2 lg:px-3"
        @click="table.resetColumnFilters()"
      >
        清除过滤
        <Cross2Icon class="ml-2 h-4 w-4" />
      </Button>
    </div>

    <!-- 视图选项 -->
    <ProblemsDataTableViewOptions :table="table" />
  </div>
</template>
