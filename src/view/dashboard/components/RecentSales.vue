<script setup lang="ts">
import { computed } from 'vue'

import type { RecentSubmission } from '@/api/main/dashboard'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const props = defineProps<{
  submissions: RecentSubmission[]
}>()

const verdictMeta: Record<
  string,
  {
    label: string
    className: string
  }
> = {
  AC: { label: '通过', className: 'text-emerald-500' },
  WA: { label: '答案错误', className: 'text-amber-500' },
  TLE: { label: '超时', className: 'text-orange-500' },
  MLE: { label: '超内存', className: 'text-rose-500' },
  RE: { label: '运行错误', className: 'text-rose-500' },
  CE: { label: '编译失败', className: 'text-sky-500' },
  PD: { label: '判题中', className: 'text-muted-foreground' },
}

function toInitials(name: string) {
  const trimmed = name.trim()
  if (!trimmed) {
    return 'OJ'
  }
  const segments = trimmed.split(/\s+/)
  if (segments.length === 1) {
    return segments[0].slice(0, 2).toUpperCase()
  }
  return (
    segments[0].charAt(0).toUpperCase() + segments[segments.length - 1].charAt(0).toUpperCase()
  )
}

function formatTimestamp(timestamp: string) {
  const date = new Date(timestamp)
  if (Number.isNaN(date.getTime())) {
    return '--'
  }
  return new Intl.DateTimeFormat('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

const items = computed(() =>
  props.submissions.map((submission) => {
    const displayName = submission.displayName || submission.username || '匿名用户'
    const verdict = verdictMeta[submission.verdict] ?? {
      label: submission.verdict,
      className: 'text-muted-foreground',
    }
    return {
      id: submission.id,
      displayName,
      email: submission.email ?? '',
      problemTitle: submission.problemTitle,
      submittedAt: formatTimestamp(submission.submittedAt),
      verdictLabel: verdict.label,
      verdictClass: verdict.className,
      avatarUrl: submission.avatarUrl ?? undefined,
      initials: toInitials(displayName),
    }
  })
)
</script>

<template>
  <div class="space-y-6">
    <template v-if="items.length">
      <div
        v-for="item in items"
        :key="item.id"
        class="flex items-center"
      >
        <Avatar class="h-9 w-9">
          <AvatarImage v-if="item.avatarUrl" :src="item.avatarUrl" :alt="item.displayName" />
          <AvatarFallback>{{ item.initials }}</AvatarFallback>
        </Avatar>
        <div class="ml-4 space-y-1">
          <p class="text-sm font-medium leading-none">{{ item.displayName }}</p>
          <p class="text-xs text-muted-foreground">
            {{ item.problemTitle }}
            <span class="mx-1 text-muted-foreground/50">·</span>
            {{ item.submittedAt }}
          </p>
        </div>
        <div class="ml-auto text-sm font-medium" :class="item.verdictClass">
          {{ item.verdictLabel }}
        </div>
      </div>
    </template>
    <div
      v-else
      class="rounded-md border border-dashed border-muted-foreground/40 p-8 text-center text-sm text-muted-foreground"
    >
      暂无最新提交
    </div>
  </div>
</template>
