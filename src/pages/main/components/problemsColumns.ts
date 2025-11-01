import type { ColumnDef } from '@tanstack/vue-table'
import type { ProblemCard } from '@/api/problem/problems'

import { h } from 'vue'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Activity, HardDrive, Timer } from 'lucide-vue-next'
import DataTableColumnHeader from './DataTableColumnHeader.vue'
import ProblemsDataTableRowActions from './ProblemsDataTableRowActions.vue'

// 难度标签映射
function difficultyLabel(difficulty?: any) {
  if (!difficulty) {
    return '未知'
  }
  if (difficulty.label && difficulty.label.trim().length > 0) {
    return difficulty.label
  }
  const code = difficulty.code?.toLowerCase()
  switch (code) {
    case 'easy':
      return '简单'
    case 'medium':
      return '中等'
    case 'hard':
      return '困难'
    default:
      return '未知'
  }
}

// 难度样式映射
function difficultyClass(code?: string | null) {
  const normalized = code?.toLowerCase()
  switch (normalized) {
    case 'easy':
      return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300'
    case 'medium':
      return 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300'
    case 'hard':
      return 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300'
    default:
      return 'bg-muted text-muted-foreground'
  }
}

// 格式化时间限制
function formatTimeLimit(timeLimitMs?: number | null) {
  if (!timeLimitMs || timeLimitMs <= 0) {
    return '时间限制未配置'
  }
  if (timeLimitMs >= 1000) {
    const seconds = timeLimitMs / 1000
    return Number.isInteger(seconds) ? `${seconds} 秒` : `${seconds.toFixed(1)} 秒`
  }
  return `${timeLimitMs} 毫秒`
}

// 格式化内存限制
function formatMemory(memoryLimitKb?: number | null) {
  if (!memoryLimitKb || memoryLimitKb <= 0) {
    return '内存限制未配置'
  }
  const mb = memoryLimitKb / 1024
  return mb >= 1 ? `${mb.toFixed(mb % 1 === 0 ? 0 : 1)} MB` : `${memoryLimitKb} KB`
}

// 格式化元数据
function formatMetadata(metadata: any) {
  const segments: string[] = []
  if (metadata?.frequency != null) {
    const value = metadata.frequency > 1 ? metadata.frequency : metadata.frequency * 100
    segments.push(`出现频率 ${Math.round(value)}%`)
  }
  if (metadata?.companies?.length > 0) {
    const companies = metadata.companies.slice(0, 2).join('、')
    segments.push(`常见公司 ${companies}`)
  }
  if (metadata?.paidOnly) {
    segments.push('付费题')
  }
  return segments.join(' · ') || '暂无统计信息'
}

export const problemsColumns: ColumnDef<ProblemCard>[] = [
  {
    id: 'select',
    header: ({ table }) =>
      h(Checkbox, {
        modelValue:
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate'),
        'onUpdate:modelValue': (value) => table.toggleAllPageRowsSelected(!!value),
        ariaLabel: 'Select all',
        class: 'translate-y-0.5',
      }),
    cell: ({ row }) =>
      h(Checkbox, {
        modelValue: row.getIsSelected(),
        'onUpdate:modelValue': (value) => row.toggleSelected(!!value),
        ariaLabel: 'Select row',
        class: 'translate-y-0.5',
      }),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'id',
    header: ({ column }) => h(DataTableColumnHeader, { column, title: 'ID' }),
    cell: ({ row }) => h('div', { class: 'w-20 font-mono text-sm' }, row.getValue('id')),
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: 'title',
    header: ({ column }) => h(DataTableColumnHeader, { column, title: '题目' }),
    cell: ({ row }) => {
      const problem = row.original
      return h('div', { class: 'flex flex-col space-y-1' }, [
        h('div', { class: 'font-medium' }, problem.title),
        h('div', { class: 'text-xs text-muted-foreground' }, problem.slug)
      ])
    },
    filterFn: (row, id, value) => {
      const title = row.getValue(id) as string
      const slug = (row.original as any).slug as string
      const searchValue = value.toLowerCase()
      return title.toLowerCase().includes(searchValue) ||
             slug.toLowerCase().includes(searchValue)
    },
  },
  {
    accessorKey: 'difficulty',
    header: ({ column }) => h(DataTableColumnHeader, { column, title: '难度' }),
    cell: ({ row }) => {
      const difficulty = row.original.difficulty
      const label = difficultyLabel(difficulty)
      const className = difficultyClass(difficulty?.code)

      return h(Badge, {
        variant: 'secondary',
        class: className
      }, label)
    },
    filterFn: (row, id, value) => {
      const difficulty = row.getValue(id) as any
      if (!difficulty?.code) return false
      return value.includes(difficulty.code.toLowerCase())
    },
  },
  {
    accessorKey: 'tags',
    header: ({ column }) => h(DataTableColumnHeader, { column, title: '标签' }),
    cell: ({ row }) => {
      const tags = row.original.tags || []
      return h('div', { class: 'flex flex-wrap gap-1' },
        tags.slice(0, 3).map(tag =>
          h(Badge, {
            variant: 'outline',
            class: 'text-xs'
          }, tag.name)
        )
      )
    },
  },
  {
    accessorKey: 'stats.timeLimitMs',
    header: ({ column }) => h(DataTableColumnHeader, { column, title: '时间限制' }),
    cell: ({ row }) => {
      const timeLimit = row.original.stats?.timeLimitMs
      const formatted = formatTimeLimit(timeLimit)
      return h('div', { class: 'flex items-center space-x-1' }, [
        h(Timer, { class: 'h-3 w-3 text-muted-foreground' }),
        h('span', { class: 'text-sm' }, formatted)
      ])
    },
  },
  {
    accessorKey: 'stats.memoryLimitKb',
    header: ({ column }) => h(DataTableColumnHeader, { column, title: '内存限制' }),
    cell: ({ row }) => {
      const memoryLimit = row.original.stats?.memoryLimitKb
      const formatted = formatMemory(memoryLimit)
      return h('div', { class: 'flex items-center space-x-1' }, [
        h(HardDrive, { class: 'h-3 w-3 text-muted-foreground' }),
        h('span', { class: 'text-sm' }, formatted)
      ])
    },
  },
  {
    accessorKey: 'metadata',
    header: ({ column }) => h(DataTableColumnHeader, { column, title: '统计信息' }),
    cell: ({ row }) => {
      const metadata = row.original.metadata
      const formatted = formatMetadata(metadata)
      return h('div', { class: 'flex items-center space-x-1' }, [
        h(Activity, { class: 'h-3 w-3 text-muted-foreground' }),
        h('span', { class: 'text-sm text-muted-foreground' }, formatted)
      ])
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const problem = row.original
      return h(ProblemsDataTableRowActions, {
        problem,
        onView: (problem: ProblemCard) => {
          console.log('View problem:', problem.id)
          // 这里可以添加路由跳转逻辑
          // router.push(`/problems/${problem.id}`)
        },
        onSolve: (problem: ProblemCard) => {
          console.log('Start solving problem:', problem.id)
          // 这里可以添加开始解题的逻辑
          // router.push(`/problems/${problem.id}/solve`)
        },
        onBookmark: (problem: ProblemCard) => {
          console.log('Bookmark problem:', problem.id)
          // 这里可以添加收藏逻辑
        },
        onShare: (problem: ProblemCard) => {
          console.log('Share problem:', problem.id)
          // 这里可以添加分享逻辑
          // navigator.share?.({ title: problem.title, text: problem.slug })
        },
        onCode: (problem: ProblemCard) => {
          console.log('View solutions:', problem.id)
          // 这里可以添加查看题解逻辑
          // router.push(`/problems/${problem.id}/solutions`)
        }
      })
    },
  },
]