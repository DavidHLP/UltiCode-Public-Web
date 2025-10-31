<script lang="ts">
export const description = 'A sidebar with a calendar.'
export const iframeHeight = '800px'
</script>

<script setup lang="ts">
import {onMounted, ref} from 'vue'
import AppSidebar from '@/components/AppSidebar.vue'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import {Activity, HardDrive, Timer} from 'lucide-vue-next'
import {
  fetchPublicProblems,
  type ProblemCard,
  type ProblemMetadata,
  type DifficultyInfo,
} from '@/api/problem/problems'

const loading = ref(false)
const errorMessage = ref<string | null>(null)
const problems = ref<ProblemCard[]>([])

async function loadProblems() {
  loading.value = true
  errorMessage.value = null
  try {
    const response = await fetchPublicProblems({page: 1, size: 20, lang: 'zh-CN'})
    problems.value = response.items
  } catch (error) {
    if (error instanceof Error) {
      errorMessage.value = error.message || '题目加载失败，请稍后重试。'
    } else {
      errorMessage.value = '题目加载失败，请稍后重试。'
    }
  } finally {
    loading.value = false
  }
}

function difficultyLabel(difficulty?: DifficultyInfo | null) {
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

function formatMemory(memoryLimitKb?: number | null) {
  if (!memoryLimitKb || memoryLimitKb <= 0) {
    return '内存限制未配置'
  }
  const mb = memoryLimitKb / 1024
  return mb >= 1 ? `${mb.toFixed(mb % 1 === 0 ? 0 : 1)} MB` : `${memoryLimitKb} KB`
}

function formatMetadata(metadata: ProblemMetadata) {
  const segments: string[] = []
  if (metadata.frequency != null) {
    const value = metadata.frequency > 1 ? metadata.frequency : metadata.frequency * 100
    segments.push(`出现频率 ${Math.round(value)}%`)
  }
  if (metadata.companies.length > 0) {
    const companies = metadata.companies.slice(0, 2).join('、')
    segments.push(`常见公司 ${companies}`)
  }
  if (metadata.paidOnly) {
    segments.push('付费题')
  }
  return segments.join(' · ') || '暂无统计信息'
}

onMounted(() => {
  void loadProblems()
})
</script>

<template>
  <SidebarProvider>
    <AppSidebar />
    <SidebarInset>
      <header
        class="sticky top-0 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4"
      >
        <SidebarTrigger class="-ml-1" />
        <Separator orientation="vertical" class="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>October 2024</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>
      <div class="flex flex-1 flex-col gap-4 p-4">
        <div class="grid auto-rows-min gap-4 md:grid-cols-5">
          <template v-if="loading">
            <div
              v-for="i in 10"
              :key="`loading-${i}`"
              class="aspect-square rounded-xl bg-muted/40"
            >
              <div class="flex h-full w-full animate-pulse rounded-xl bg-muted/60"/>
            </div>
          </template>
          <template v-else-if="errorMessage">
            <div
              class="col-span-full flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed border-destructive/40 bg-destructive/10 px-6 py-10 text-center text-destructive"
            >
              <p class="text-sm font-medium">题目加载失败</p>
              <p class="mt-2 text-sm text-destructive/80">
                {{ errorMessage }}
              </p>
              <button
                class="mt-4 rounded-md border border-destructive/40 px-4 py-2 text-sm font-medium shadow-sm transition hover:border-destructive hover:bg-destructive hover:text-destructive-foreground"
                type="button"
                @click="loadProblems"
              >
                重试
              </button>
            </div>
          </template>
          <template v-else-if="problems.length === 0">
            <div
              class="col-span-full flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed border-muted-foreground/40 bg-muted/20 px-6 py-10 text-center text-muted-foreground"
            >
              <p class="text-sm font-medium">暂时没有可展示的公开题目</p>
              <p class="mt-2 text-sm">请稍后再来看看，或尝试刷新页面。</p>
            </div>
          </template>
          <div
            v-for="problem in problems"
            v-else
            :key="problem.id"
            class="aspect-square rounded-xl border border-muted bg-card/80 p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-muted/60"
          >
            <div class="flex h-full flex-col gap-3">
              <div class="flex items-start justify-between gap-2">
                <div class="flex min-w-0 flex-col gap-1">
                  <span class="text-xs uppercase tracking-wide text-muted-foreground/80">
                    {{ problem.slug }}
                  </span>
                  <h3 class="text-sm font-semibold leading-snug text-foreground line-clamp-2">
                    {{ problem.title }}
                  </h3>
                </div>
                <span
                  :class="difficultyClass(problem.difficulty?.code)"
                  class="rounded-full px-2 py-0.5 text-xs font-medium"
                >
                  {{ difficultyLabel(problem.difficulty) }}
                </span>
              </div>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="tag in problem.tags"
                  :key="`${problem.id}-${tag.slug ?? tag.id}`"
                  class="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
                >
                  {{ tag.name }}
                </span>
              </div>
              <div class="mt-auto space-y-2 text-xs text-muted-foreground">
                <div class="flex items-center gap-1.5">
                  <Timer class="size-4 text-primary/70"/>
                  <span>{{ formatTimeLimit(problem.stats?.timeLimitMs) }}</span>
                </div>
                <div class="flex items-center gap-1.5">
                  <HardDrive class="size-4 text-primary/70"/>
                  <span>{{ formatMemory(problem.stats?.memoryLimitKb) }}</span>
                </div>
                <div class="flex items-center gap-1.5">
                  <Activity class="size-4 text-primary/70"/>
                  <span>{{ formatMetadata(problem.metadata) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarInset>
  </SidebarProvider>
</template>
