<script setup lang="ts">
import type { Component } from 'vue'
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import MonacoEditor from './components/MonacoEditor.vue'
import { type ProblemDetail, type ProblemLanguageConfig } from '@/api/problem/problems'
import { MAIN_ROUTE_NAME } from '@/router'
import { Database, Flame, Loader2, Play, RotateCcw, Send, Timer } from 'lucide-vue-next'
import { mockMarkdownConstraints, mockMarkdownDescription, mockMarkdownExamples } from './markdown'
import { mockLanguages, mockProblemBasics } from './code'
import { mockMetadata, mockStats, mockTags } from './test'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const problem = ref<ProblemDetail | null>(null)
const errorMessage = ref<string | null>(null)

const markdownDescription = ref('')
const markdownConstraints = ref('')
const markdownExamples = ref('')

const languageBuffers = ref<Record<string, string>>({})
const activeLanguageKey = ref<string | null>(null)

const testTab = ref<'samples' | 'custom'>('samples')
const customInput = ref('')
const actionInProgress = ref(false)
const actionFeedback = ref<string | null>(null)

let activeRequestToken = 0

function createMockProblemDetail(slugOverride: string): ProblemDetail {
  const resolvedSlug = slugOverride.trim() || mockProblemBasics.slug
  return {
    id: mockProblemBasics.id,
    slug: resolvedSlug,
    title: mockProblemBasics.title,
    descriptionMd: mockMarkdownDescription,
    constraintsMd: mockMarkdownConstraints,
    examplesMd: mockMarkdownExamples,
    difficulty: mockProblemBasics.difficulty,
    stats: { ...mockStats },
    metadata: {
      ...mockMetadata,
      companies: [...mockMetadata.companies],
    },
    tags: mockTags.map((tag) => ({ ...tag })),
    languages: mockLanguages.map((language) => ({ ...language })),
    updatedAt: mockProblemBasics.updatedAt,
  }
}

const slug = computed(() => {
  const raw = route.params.slug
  if (typeof raw === 'string') {
    return raw
  }
  if (Array.isArray(raw)) {
    return raw[0] ?? ''
  }
  return ''
})

const difficultyLabelMap: Record<string, string> = {
  easy: '简单',
  medium: '中等',
  hard: '困难',
}
const difficultyLabel = computed(() => {
  const code = (problem.value?.difficulty?.code ?? '').toLowerCase()
  const label = problem.value?.difficulty?.label?.trim()
  if (label && label.length > 0) {
    return label
  }
  if (code in difficultyLabelMap) {
    return difficultyLabelMap[code]
  }
  return null
})

const difficultyBadgeClass = computed(() => '')

const lastUpdatedText = computed(() => {
  const updatedAt = problem.value?.updatedAt
  if (!updatedAt) {
    return null
  }
  const parsed = new Date(updatedAt)
  if (Number.isNaN(parsed.getTime())) {
    return null
  }
  return new Intl.DateTimeFormat('zh-CN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(parsed)
})

const companies = computed(() =>
  (problem.value?.metadata?.companies ?? []).filter(
    (company) => typeof company === 'string' && company.trim().length > 0,
  ),
)

type StatItem = {
  key: string
  label: string
  value: string
  icon: Component
}

const statItems = computed<StatItem[]>(() => {
  if (!problem.value) {
    return []
  }
  const items: StatItem[] = []
  const timeLimitMs = problem.value.stats?.timeLimitMs
  if (typeof timeLimitMs === 'number') {
    items.push({
      key: 'timeLimit',
      label: '时间限制',
      value: `${timeLimitMs} ms`,
      icon: Timer,
    })
  }
  const memoryLimitKb = problem.value.stats?.memoryLimitKb
  if (typeof memoryLimitKb === 'number') {
    const memoryMb = memoryLimitKb / 1024
    const formatted =
      memoryMb >= 1
        ? `${Number.isInteger(memoryMb) ? memoryMb : memoryMb.toFixed(1)} MB`
        : `${memoryLimitKb} KB`
    items.push({
      key: 'memoryLimit',
      label: '内存限制',
      value: formatted,
      icon: Database,
    })
  }
  const frequency = problem.value.metadata?.frequency
  if (typeof frequency === 'number') {
    items.push({
      key: 'frequency',
      label: '热度指数',
      value: `${frequency}`,
      icon: Flame,
    })
  }
  return items
})

interface LanguageOption {
  key: string
  label: string
  language: ProblemLanguageConfig
}

const languageOptions = computed<LanguageOption[]>(() =>
  (problem.value?.languages ?? []).map((language) => ({
    key: resolveLanguageKey(language),
    label: language.languageName ?? language.languageCode ?? `语言 ${language.languageId ?? ''}`,
    language,
  })),
)

const currentLanguage = computed<ProblemLanguageConfig | null>(() => {
  const key = activeLanguageKey.value
  if (!key || !problem.value) {
    return null
  }
  return problem.value.languages.find((language) => resolveLanguageKey(language) === key) ?? null
})

const editorLanguage = computed(() => currentLanguage.value?.languageCode ?? 'plaintext')

const editorCode = computed(() => {
  const key = activeLanguageKey.value
  if (!key) {
    return ''
  }
  return languageBuffers.value[key] ?? ''
})

function resolveLanguageKey(language: ProblemLanguageConfig): string {
  if (language.languageCode) {
    return language.languageCode
  }
  if (typeof language.languageId === 'number') {
    return `id-${language.languageId}`
  }
  if (language.languageName) {
    return language.languageName.toLowerCase().replace(/\s+/g, '-')
  }
  return 'lang-unknown'
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function renderMarkdown(content: string | null | undefined): string {
  if (!content) {
    return ''
  }
  let text = content.replace(/\r\n/g, '\n')
  const codeBlocks: string[] = []
  text = text.replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang: string, block: string) => {
    const index = codeBlocks.length
    const safeLanguage = lang ? escapeHtml(lang) : 'plaintext'
    codeBlocks.push(`<pre><code class="language-${safeLanguage}">${escapeHtml(block)}</code></pre>`)
    return `[[CODE_BLOCK_${index}]]`
  })

  const lines = text.split('\n')
  const htmlParts: string[] = []
  let paragraphBuffer: string[] = []
  let blockquoteBuffer: string[] = []
  let inUnorderedList = false
  let inOrderedList = false

  const flushParagraph = () => {
    if (paragraphBuffer.length === 0) {
      return
    }
    htmlParts.push(`<p>${processInline(paragraphBuffer.join(' '))}</p>`)
    paragraphBuffer = []
  }

  const flushBlockquote = () => {
    if (blockquoteBuffer.length === 0) {
      return
    }
    const merged = blockquoteBuffer.map((line) => processInline(line)).join('<br />')
    htmlParts.push(`<blockquote>${merged}</blockquote>`)
    blockquoteBuffer = []
  }

  const flushUnorderedList = () => {
    if (!inUnorderedList) {
      return
    }
    htmlParts.push('</ul>')
    inUnorderedList = false
  }

  const flushOrderedList = () => {
    if (!inOrderedList) {
      return
    }
    htmlParts.push('</ol>')
    inOrderedList = false
  }

  for (const rawLine of lines) {
    const trimmed = rawLine.trim()

    if (!trimmed) {
      flushParagraph()
      flushBlockquote()
      flushUnorderedList()
      flushOrderedList()
      continue
    }

    if (!trimmed.startsWith('>') && blockquoteBuffer.length > 0) {
      flushBlockquote()
    }

    if (trimmed.startsWith('[[CODE_BLOCK_')) {
      flushParagraph()
      flushBlockquote()
      flushUnorderedList()
      flushOrderedList()
      htmlParts.push(trimmed)
      continue
    }

    if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      flushParagraph()
      flushBlockquote()
      flushUnorderedList()
      flushOrderedList()
      htmlParts.push('<hr />')
      continue
    }

    const headingMatch = trimmed.match(/^(#{1,6})\s+(.*)$/)
    if (headingMatch) {
      const level = Math.min(headingMatch[1].length, 6)
      flushParagraph()
      flushBlockquote()
      flushUnorderedList()
      flushOrderedList()
      htmlParts.push(`<h${level}>${processInline(headingMatch[2])}</h${level}>`)
      continue
    }

    if (trimmed.startsWith('>')) {
      const contentLine = trimmed.replace(/^>\s?/, '')
      blockquoteBuffer.push(contentLine)
      continue
    }

    const unorderedMatch = trimmed.match(/^[-*+] (.+)$/)
    if (unorderedMatch) {
      flushParagraph()
      flushOrderedList()
      if (!inUnorderedList) {
        flushBlockquote()
        htmlParts.push('<ul>')
        inUnorderedList = true
      }
      htmlParts.push(`<li>${processInline(unorderedMatch[1])}</li>`)
      continue
    }

    const orderedMatch = trimmed.match(/^(\d+)[.)] (.+)$/)
    if (orderedMatch) {
      flushParagraph()
      flushUnorderedList()
      if (!inOrderedList) {
        flushBlockquote()
        htmlParts.push('<ol>')
        inOrderedList = true
      }
      htmlParts.push(`<li>${processInline(orderedMatch[2])}</li>`)
      continue
    }

    paragraphBuffer.push(trimmed)
  }

  flushParagraph()
  flushBlockquote()
  flushUnorderedList()
  flushOrderedList()

  let html = htmlParts.join('\n')
  html = html.replace(
    /\[\[CODE_BLOCK_(\d+)]]/g,
    (_, index: string) => codeBlocks[Number(index)] ?? '',
  )
  return html
}

function processInline(input: string): string {
  const codePlaceholders: string[] = []
  let text = input.replace(/`([^`]+)`/g, (_, code: string) => {
    const index = codePlaceholders.length
    codePlaceholders.push(`<code>${escapeHtml(code)}</code>`)
    return `[[CODE_SPAN_${index}]]`
  })

  text = escapeHtml(text)

  text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  text = text.replace(/__(.+?)__/g, '<strong>$1</strong>')
  text = text.replace(/\*(.+?)\*/g, '<em>$1</em>')
  text = text.replace(/_(.+?)_/g, '<em>$1</em>')
  text = text.replace(/~~(.+?)~~/g, '<del>$1</del>')
  text = text.replace(
    /\[([^\]]+)]\(([^)]+)\)/g,
    (_, label: string, url: string) =>
      `<a href="${url}" target="_blank" rel="noopener noreferrer">${label}</a>`,
  )

  text = text.replace(
    /\[\[CODE_SPAN_(\d+)]]/g,
    (_, index: string) => codePlaceholders[Number(index)] ?? '',
  )
  return text
}

function resetPageState() {
  problem.value = null
  markdownDescription.value = ''
  markdownConstraints.value = ''
  markdownExamples.value = ''
  languageBuffers.value = {}
  activeLanguageKey.value = null
  testTab.value = 'samples'
  customInput.value = ''
  actionFeedback.value = null
}

async function loadProblem(targetSlug: string) {
  const normalizedSlug = targetSlug.trim()
  if (!normalizedSlug) {
    loading.value = false
    resetPageState()
    errorMessage.value = '未找到对应的题目，请返回题库重试。'
    return
  }

  const requestToken = ++activeRequestToken
  loading.value = true
  errorMessage.value = null
  actionFeedback.value = null

  await new Promise((resolve) => setTimeout(resolve, 300))
  if (requestToken !== activeRequestToken) {
    return
  }

  const detail = createMockProblemDetail(normalizedSlug)
  problem.value = detail

  const buffers: Record<string, string> = {}
  let defaultKey: string | null = null
  for (const language of detail.languages) {
    const key = resolveLanguageKey(language)
    if (!defaultKey) {
      defaultKey = key
    }
    buffers[key] = language.starterCode ?? ''
  }
  languageBuffers.value = buffers
  activeLanguageKey.value = defaultKey
  testTab.value = 'samples'
  customInput.value = ''

  markdownDescription.value = renderMarkdown(detail.descriptionMd)
  markdownConstraints.value = renderMarkdown(detail.constraintsMd)
  markdownExamples.value = renderMarkdown(detail.examplesMd)

  if (requestToken === activeRequestToken) {
    loading.value = false
  }
}

function handleRetry() {
  if (!slug.value) {
    return
  }
  void loadProblem(slug.value)
}

function handleGoBack() {
  router.push({ name: MAIN_ROUTE_NAME }).catch(() => {
    /* noop */
  })
}

function handleLanguageChange(value: string) {
  if (value === activeLanguageKey.value) {
    return
  }
  activeLanguageKey.value = value
  actionFeedback.value = null
  if (!(value in languageBuffers.value)) {
    const language = currentLanguage.value
    const fallback = language?.starterCode ?? ''
    languageBuffers.value = {
      ...languageBuffers.value,
      [value]: fallback,
    }
  }
}

function handleCodeUpdate(value: string) {
  const key = activeLanguageKey.value
  if (!key) {
    return
  }
  languageBuffers.value = {
    ...languageBuffers.value,
    [key]: value,
  }
}

function handleResetCode() {
  const key = activeLanguageKey.value
  const language = currentLanguage.value
  if (!key || !language) {
    return
  }
  languageBuffers.value = {
    ...languageBuffers.value,
    [key]: language.starterCode ?? '',
  }
  actionFeedback.value = '已恢复初始代码模板。'
}

async function simulateAction(action: 'run' | 'submit') {
  if (actionInProgress.value || !currentLanguage.value) {
    return
  }
  actionInProgress.value = true
  actionFeedback.value = action === 'run' ? '正在准备运行代码...' : '正在准备提交答案...'
  await new Promise((resolve) => setTimeout(resolve, 600))
  const hasCustomInput = customInput.value.trim().length > 0
  actionFeedback.value =
    action === 'run'
      ? hasCustomInput
        ? '已记录自定义输入，判题服务接入后即可使用当前输入运行。'
        : '在线运行功能即将开放，敬请期待。'
      : '在线提交功能即将上线，敬请期待。'
  actionInProgress.value = false
}

function handleRun() {
  void simulateAction('run')
}

function handleSubmit() {
  void simulateAction('submit')
}

function handleTestTabChange(value: string) {
  testTab.value = value === 'custom' ? 'custom' : 'samples'
}

onMounted(() => {
  if (slug.value) {
    void loadProblem(slug.value)
  } else {
    loading.value = false
    errorMessage.value = '未找到对应的题目，请返回题库重试。'
  }
})

watch(
  () => slug.value,
  (newSlug, oldSlug) => {
    if (newSlug && newSlug !== oldSlug) {
      void loadProblem(newSlug)
    }
  },
)
</script>

<template>
  <ResizablePanelGroup id="problem-editor-layout" direction="horizontal" class="min-h-screen">
    <ResizablePanel id="problem-statement-panel" :default-size="32">
      <div class="h-full">
        <div>
          <template v-if="loading">
            <Skeleton class="h-6 w-3/4" />
            <Skeleton class="h-4 w-1/2" />
          </template>
          <template v-else-if="problem">
            <div>
              <h1>
                {{ problem.title }}
              </h1>
              <Badge v-if="difficultyLabel" variant="outline" :class="difficultyBadgeClass">
                {{ difficultyLabel }}
              </Badge>
            </div>
            <div>
              <span v-if="problem.metadata?.frontendId"
                >编号 #{{ problem.metadata.frontendId }}</span
              >
              <span v-if="lastUpdatedText">更新于 {{ lastUpdatedText }}</span>
            </div>
            <div>
              <Badge
                v-for="tag in problem.tags"
                :key="tag.id ?? tag.slug ?? tag.name"
                variant="secondary"
              >
                #{{ tag.name }}
              </Badge>
            </div>
            <div>
              <span v-if="problem.metadata?.paidOnly">付费专属</span>
              <span v-if="problem.metadata?.leetcodeStyle">同步 LeetCode</span>
            </div>
          </template>
          <template v-else>
            <p>
              {{ errorMessage ?? '题目加载失败，请稍后重试。' }}
            </p>
            <div>
              <Button size="sm" variant="outline" @click="handleRetry">重新加载</Button>
              <Button size="sm" variant="ghost" @click="handleGoBack">返回题库</Button>
            </div>
          </template>
        </div>

        <div class="h-full">
          <template v-if="loading">
            <div>
              <div>
                <Skeleton class="h-5 w-1/3" />
                <Skeleton class="h-4 w-full" />
                <Skeleton class="h-4 w-5/6" />
                <Skeleton class="h-4 w-4/6" />
              </div>
              <div>
                <Skeleton class="h-5 w-1/4" />
                <Skeleton class="h-4 w-full" />
                <Skeleton class="h-4 w-5/6" />
              </div>
            </div>
          </template>
          <template v-else-if="problem">
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>题目描述</CardTitle>
                  <CardDescription>理解题意与背景信息。</CardDescription>
                </CardHeader>
                <CardContent>
                  <div v-if="markdownDescription" v-html="markdownDescription" />
                  <p v-else>暂无题目描述。</p>
                </CardContent>
              </Card>

              <Card v-if="markdownConstraints">
                <CardHeader>
                  <CardTitle>约束条件</CardTitle>
                  <CardDescription>关注输入规模与性能要求。</CardDescription>
                </CardHeader>
                <CardContent>
                  <div v-html="markdownConstraints" />
                </CardContent>
              </Card>

              <Card v-if="markdownExamples">
                <CardHeader>
                  <CardTitle>样例说明</CardTitle>
                  <CardDescription>通过样例快速把握题意。</CardDescription>
                </CardHeader>
                <CardContent>
                  <div v-html="markdownExamples" />
                </CardContent>
              </Card>

              <Card v-if="statItems.length > 0 || companies.length > 0">
                <CardHeader>
                  <CardTitle>题目信息</CardTitle>
                  <CardDescription>了解判题限制与相关企业标签。</CardDescription>
                </CardHeader>
                <CardContent>
                  <div>
                    <div v-if="statItems.length > 0">
                      <div v-for="item in statItems" :key="item.key">
                        <component :is="item.icon" class="size-4" />
                        <div>
                          <p>
                            {{ item.label }}
                          </p>
                          <p>
                            {{ item.value }}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div v-if="companies.length > 0">
                      <Badge v-for="company in companies" :key="company" variant="outline">
                        {{ company }}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </template>
          <template v-else>
            <div>
              <p>
                {{ errorMessage ?? '暂无题目信息。' }}
              </p>
              <div>
                <Button size="sm" @click="handleRetry">重新加载</Button>
                <Button size="sm" variant="outline" @click="handleGoBack">返回题库</Button>
              </div>
            </div>
          </template>
        </div>
      </div>
    </ResizablePanel>

    <ResizableHandle id="problem-editor-divider" with-handle />

    <ResizablePanel id="problem-editor-panel" :default-size="68">
      <ResizablePanelGroup id="problem-editor-nested-group" direction="vertical" class="h-full">
        <ResizablePanel id="editor-panel" :default-size="60">
          <div class="h-full">
            <div>
              <div>
                <div>
                  <p>代码编辑器</p>
                  <p>选择语言并编写解题代码。</p>
                </div>
                <Select
                  v-if="languageOptions.length > 0"
                  :model-value="activeLanguageKey"
                  @update:model-value="handleLanguageChange"
                >
                  <SelectTrigger class="w-48 h-9">
                    <SelectValue placeholder="选择语言" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      v-for="option in languageOptions"
                      :key="option.key"
                      :value="option.key"
                    >
                      {{ option.label }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div class="h-full">
              <MonacoEditor
                :model-value="editorCode"
                :language="editorLanguage"
                :read-only="loading || !currentLanguage"
                height="100%"
                @update:modelValue="handleCodeUpdate"
              />
            </div>
            <div>
              <Button
                size="sm"
                variant="outline"
                :disabled="loading || !currentLanguage || actionInProgress"
                @click="handleResetCode"
              >
                <RotateCcw class="size-4" />
                重置代码
              </Button>
              <div>
                <Button
                  size="sm"
                  variant="outline"
                  :disabled="loading || !currentLanguage || actionInProgress"
                  @click="handleRun"
                >
                  <Loader2 v-if="actionInProgress" class="size-4" />
                  <template v-else>
                    <Play class="size-4" />
                    运行
                  </template>
                </Button>
                <Button
                  size="sm"
                  :disabled="loading || !currentLanguage || actionInProgress"
                  @click="handleSubmit"
                >
                  <Loader2 v-if="actionInProgress" class="size-4" />
                  <template v-else>
                    <Send class="size-4" />
                    提交
                  </template>
                </Button>
              </div>
            </div>
            <div v-if="actionFeedback">
              {{ actionFeedback }}
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle id="testcase-divider" with-handle />

        <ResizablePanel id="testcase-panel" :default-size="40">
          <div class="h-full">
            <div>
              <p>测试用例</p>
              <p>查看官方样例或录入自定义输入。</p>
            </div>
            <Tabs :value="testTab" class="h-full" @update:value="handleTestTabChange">
              <TabsList class="w-full">
                <TabsTrigger value="samples">官方样例</TabsTrigger>
                <TabsTrigger value="custom">自定义输入</TabsTrigger>
              </TabsList>
              <TabsContent value="samples">
                <div v-if="markdownExamples" v-html="markdownExamples" />
                <p v-else>暂无官方样例，敬请关注题面更新。</p>
              </TabsContent>
              <TabsContent value="custom" class="h-full">
                <div class="h-full">
                  <label>自定义输入</label>
                  <textarea
                    v-model="customInput"
                    class="min-h-[180px]"
                    placeholder="在此粘贴或输入自定义测试用例，运行时将以标准输入提供给程序。"
                  />
                  <p>当前版本暂未接入在线判题服务，运行时会优先使用这里的输入内容。</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </ResizablePanel>
  </ResizablePanelGroup>
</template>
