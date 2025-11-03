<script setup lang="ts">
import type { ProblemCard } from '@/api/problem/problems'
import { computed } from 'vue'
import MoreHorizontalIcon from '~icons/lucide/more-horizontal'
import EyeIcon from '~icons/lucide/eye'
import PlayIcon from '~icons/lucide/play'
import BookmarkIcon from '~icons/lucide/bookmark'
import ShareIcon from '~icons/lucide/share'
import CodeIcon from '~icons/lucide/code'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface ProblemsDataTableRowActionsProps {
  problem: ProblemCard
}

const props = defineProps<ProblemsDataTableRowActionsProps>()

const emit = defineEmits<{
  view: [problem: ProblemCard]
  solve: [problem: ProblemCard]
  bookmark: [problem: ProblemCard]
  share: [problem: ProblemCard]
  code: [problem: ProblemCard]
}>()

const difficultyLabel = computed(() => {
  if (!props.problem.difficulty) return '未知'
  if (props.problem.difficulty.label) return props.problem.difficulty.label

  const code = props.problem.difficulty.code?.toLowerCase()
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
})

function handleView() {
  emit('view', props.problem)
}

function handleSolve() {
  emit('solve', props.problem)
}

function handleBookmark() {
  emit('bookmark', props.problem)
}

function handleShare() {
  emit('share', props.problem)
}

function handleCode() {
  emit('code', props.problem)
}
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button variant="ghost" class="flex h-8 w-8 p-0 data-[state=open]:bg-muted">
        <MoreHorizontalIcon class="h-4 w-4" />
        <span class="sr-only">打开菜单</span>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" class="w-[160px]">
      <DropdownMenuLabel>操作</DropdownMenuLabel>
      <DropdownMenuItem @click="handleView">
        <EyeIcon class="mr-2 h-4 w-4" />
        查看详情
      </DropdownMenuItem>
      <DropdownMenuItem @click="handleSolve">
        <PlayIcon class="mr-2 h-4 w-4" />
        开始解题
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem @click="handleBookmark">
        <BookmarkIcon class="mr-2 h-4 w-4" />
        收藏题目
      </DropdownMenuItem>
      <DropdownMenuItem @click="handleShare">
        <ShareIcon class="mr-2 h-4 w-4" />
        分享题目
      </DropdownMenuItem>
      <DropdownMenuItem @click="handleCode">
        <CodeIcon class="mr-2 h-4 w-4" />
        查看题解
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
