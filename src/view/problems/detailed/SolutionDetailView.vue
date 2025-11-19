<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Eye, MessageCircle, Triangle } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { renderMarkdown } from '@/lib/markdown'
import type { ProblemDetail } from '@/mocks/schema/problem-detail'
import { fetchProblemDetailById } from '@/api/problem-detail'
import { fetchSolutionFeed } from '@/api/solution'
import type { SolutionFeedItem } from '@/mocks/schema/solution'

const route = useRoute()
const router = useRouter()

const problem = ref<ProblemDetail | null>(null)
const solutionItems = ref<SolutionFeedItem[]>([])
const isLoading = ref(true)

const problemId = computed(() => {
  const idParam = route.params.id
  const numericId =
    typeof idParam === 'string' ? Number.parseInt(idParam, 10) : Number(idParam ?? 0)
  return Number.isFinite(numericId) ? numericId : 1
})

const solutionId = computed(() => String(route.params.solutionId ?? ''))

watch(
  problemId,
  async (id) => {
    isLoading.value = true
    try {
      problem.value = await fetchProblemDetailById(id)
      const feedResponse = await fetchSolutionFeed(id)
      solutionItems.value = feedResponse.items
    } catch (error) {
      console.error('Failed to load solution detail', error)
      problem.value = null
      solutionItems.value = []
    } finally {
      isLoading.value = false
    }
  },
  { immediate: true },
)

const solution = computed<SolutionFeedItem | null>(() => {
  return solutionItems.value.find((item) => item.id === solutionId.value) ?? null
})

const authorInitial = computed(() => solution.value?.author.name.charAt(0)?.toUpperCase() ?? '?')

const summaryHtml = computed(() => renderMarkdown(solution.value?.summary ?? ''))
const stepsMarkdown = computed(() =>
  solution.value?.steps.length
    ? renderMarkdown(solution.value.steps.map((step, index) => `${index + 1}. ${step}`).join('\n'))
    : '',
)
const codeContent = computed(() => solution.value?.code ?? '')

const goBack = () => {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push({ name: 'problem-detail', params: { id: problemId.value } })
  }
}
</script>

<template>
  <div class="min-h-screen bg-muted/20 py-8">
    <div class="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4">
      <header class="flex flex-wrap items-center justify-between gap-4">
        <div class="space-y-1">
          <p class="text-xs uppercase tracking-wide text-muted-foreground">
            Problem {{ problemId }}
          </p>
          <h1 class="text-2xl font-semibold text-foreground">
            {{ solution?.title ?? '题解详情' }}
          </h1>
          <p class="text-sm text-muted-foreground">{{ problem?.title }}</p>
        </div>
        <Button variant="outline" size="sm" class="gap-2" @click="goBack">
          <ArrowLeft class="size-4" />
          返回题目
        </Button>
      </header>

      <section
        v-if="isLoading"
        class="rounded-2xl border border-dashed border-muted bg-card/70 p-6"
      >
        <p class="text-sm text-muted-foreground">加载中…</p>
      </section>

      <section
        v-else-if="!solution"
        class="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-destructive/40 bg-destructive/5 p-8 text-center"
      >
        <p class="text-lg font-semibold text-destructive">未找到对应的题解</p>
        <p class="text-sm text-muted-foreground">请返回题目列表重新选择。</p>
        <Button
          class="gap-2"
          @click="router.push({ name: 'problem-detail', params: { id: problemId } })"
        >
          <ArrowLeft class="size-4" />
          返回题目详情
        </Button>
      </section>

      <section v-else class="space-y-6">
        <Card class="border border-border/80">
          <CardHeader class="space-y-4 pb-0">
            <div class="flex items-start gap-4">
              <div
                class="flex h-14 w-14 items-center justify-center rounded-full text-base font-semibold text-white shadow-inner"
                :style="{ backgroundColor: solution.author.avatarColor }"
              >
                {{ authorInitial }}
              </div>
              <div class="flex flex-1 flex-col gap-1 text-sm leading-tight">
                <div class="flex flex-wrap items-center gap-2">
                  <span class="font-semibold text-foreground">{{ solution.author.name }}</span>
                  <span class="truncate text-muted-foreground">{{ solution.author.role }}</span>
                  <span class="text-xs text-muted-foreground">· {{ solution.createdAt }}</span>
                  <span
                    v-if="solution.flair"
                    class="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-orange-700"
                  >
                    {{ solution.flair }}
                  </span>
                </div>
                <div class="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                  <span class="rounded-full bg-muted/70 px-2 py-0.5 capitalize">{{
                    solution.language
                  }}</span>
                  <span class="rounded-full bg-muted/70 px-2 py-0.5 capitalize">{{
                    solution.topic
                  }}</span>
                  <span
                    v-for="badge in solution.badges"
                    :key="badge"
                    class="rounded-full border border-border px-2 py-0.5 font-medium"
                  >
                    {{ badge }}
                  </span>
                </div>
              </div>
            </div>
            <div class="flex flex-wrap gap-6 text-xs text-muted-foreground">
              <span class="flex items-center gap-1.5 font-semibold text-foreground">
                <Triangle class="h-4 w-4 text-amber-500" />
                {{ solution.stats.likes }}
              </span>
              <span class="flex items-center gap-1.5">
                <Eye class="h-4 w-4" />
                {{ solution.stats.views }}
              </span>
              <span class="flex items-center gap-1.5">
                <MessageCircle class="h-4 w-4" />
                {{ solution.stats.comments }}
              </span>
            </div>
          </CardHeader>

          <CardContent class="space-y-6">
            <div class="space-y-2">
              <p class="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {{ solution.highlight }}
              </p>
              <CardTitle class="text-lg">{{ solution.title }}</CardTitle>
            </div>

            <article
              class="markdown-block text-sm leading-relaxed text-muted-foreground"
              v-html="summaryHtml"
            />

            <section v-if="stepsMarkdown" class="space-y-2">
              <h3 class="text-sm font-semibold text-foreground">解题步骤</h3>
              <article class="markdown-block text-sm leading-relaxed" v-html="stepsMarkdown" />
            </section>

            <section v-if="codeContent" class="space-y-2">
              <h3 class="text-sm font-semibold text-foreground">参考代码</h3>
              <pre
                class="max-h-96 overflow-auto rounded-xl border border-border bg-muted px-4 py-3 font-mono text-[12px] leading-relaxed text-foreground shadow-inner"
                >{{ codeContent }}
              </pre>
            </section>

            <section v-if="solution.tags.length" class="space-y-2">
              <h3 class="text-sm font-semibold text-foreground">相关标签</h3>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="tag in solution.tags"
                  :key="tag"
                  class="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground"
                >
                  {{ tag }}
                </span>
              </div>
            </section>

            <section
              class="grid gap-3 rounded-xl border border-dashed border-primary/40 bg-primary/5 p-4 text-xs text-muted-foreground"
            >
              <div class="flex items-center justify-between">
                <span>发布时间</span>
                <span class="font-medium text-foreground">{{
                  new Date(solution.publishedAt).toLocaleString()
                }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span>语言筛选</span>
                <span class="font-medium text-foreground">{{ solution.languageFilter }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span>热度评分</span>
                <span class="font-semibold text-primary">{{ solution.score }}</span>
              </div>
            </section>
          </CardContent>
        </Card>
      </section>
    </div>
  </div>
</template>
