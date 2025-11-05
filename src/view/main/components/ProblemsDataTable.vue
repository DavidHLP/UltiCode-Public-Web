<script setup lang="ts">
import type {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
} from '@tanstack/vue-table'
import {
  FlexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useVueTable,
} from '@tanstack/vue-table'
import type { ProblemCard } from '@/api/problem/problems'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { valueUpdater } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import ProblemsDataTableToolbar from './ProblemsDataTableToolbar.vue'
import ProblemsDataTablePagination from './ProblemsDataTablePagination.vue'
import { defaultVisibleColumns } from './problemsData'

interface DataTableProps {
  columns: ColumnDef<ProblemCard, any>[]
  data: ProblemCard[]
}

const props = defineProps<DataTableProps>()

const router = useRouter()

const sorting = ref<SortingState>([])
const columnFilters = ref<ColumnFiltersState>([])
const columnVisibility = ref<VisibilityState>({})
const rowSelection = ref({})

const table = useVueTable({
  get data() {
    return props.data
  },
  get columns() {
    return props.columns
  },
  state: {
    get sorting() {
      return sorting.value
    },
    get columnFilters() {
      return columnFilters.value
    },
    get columnVisibility() {
      return columnVisibility.value
    },
    get rowSelection() {
      return rowSelection.value
    },
  },
  enableRowSelection: true,
  onSortingChange: (updaterOrValue) => valueUpdater(updaterOrValue, sorting),
  onColumnFiltersChange: (updaterOrValue) => valueUpdater(updaterOrValue, columnFilters),
  onColumnVisibilityChange: (updaterOrValue) => valueUpdater(updaterOrValue, columnVisibility),
  onRowSelectionChange: (updaterOrValue) => valueUpdater(updaterOrValue, rowSelection),
  getCoreRowModel: getCoreRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFacetedRowModel: getFacetedRowModel(),
  getFacetedUniqueValues: getFacetedUniqueValues(),
})

// 初始化默认可见列
if (Object.keys(columnVisibility.value).length === 0) {
  const defaultVisibility: VisibilityState = {}
  defaultVisibleColumns.forEach((col) => {
    defaultVisibility[col] = true
  })
  columnVisibility.value = defaultVisibility
}

function handleRowClick(problem: ProblemCard) {
  if (!problem?.slug) {
    return
  }
  router.push({ name: 'problem-editor', params: { slug: problem.slug } }).catch(() => {
    /* 路由跳转失败时忽略 */
  })
}
</script>

<template>
  <div class="space-y-4">
    <!-- 工具栏 -->
    <ProblemsDataTableToolbar :table="table" />

    <!-- 表格 -->
    <div class="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
            <TableHead v-for="header in headerGroup.headers" :key="header.id">
              <FlexRender
                v-if="!header.isPlaceholder"
                :render="header.column.columnDef.header"
                :props="header.getContext()"
              />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <template v-if="table.getRowModel().rows?.length">
            <TableRow
              v-for="row in table.getRowModel().rows"
              :key="row.id"
              :data-state="row.getIsSelected() && 'selected'"
              class="hover:bg-muted/50 cursor-pointer transition-colors"
              @click="handleRowClick(row.original)"
            >
              <TableCell v-for="cell in row.getVisibleCells()" :key="cell.id">
                <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
              </TableCell>
            </TableRow>
          </template>

          <TableRow v-else>
            <TableCell :colspan="columns.length" class="h-24 text-center">
              <div class="flex flex-col items-center justify-center space-y-2">
                <p class="text-sm font-medium text-muted-foreground">没有找到匹配的题目</p>
                <p class="text-xs text-muted-foreground">请尝试调整搜索条件或清除过滤</p>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <!-- 分页 -->
    <ProblemsDataTablePagination :table="table" />
  </div>
</template>
