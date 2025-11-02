<script setup lang="ts">
import type { DateRange } from 'reka-ui'
import type { Component } from 'vue'
import { CalendarDate } from '@internationalized/date'
import { computed, ref, watch } from 'vue'
import { BookOpen, Download, FileCode2, LineChart, UsersRound } from 'lucide-vue-next'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  fetchDashboardOverview,
  type RecentSubmission,
  type SubmissionTrendPoint,
  type SummaryCard,
} from '@/api/main/dashboard'
import DateRangePicker from './components/DateRangePicker.vue'
import MainNav from './components/MainNav.vue'
import Overview, { type OverviewChartPoint } from './components/Overview.vue'
import RecentSales from './components/RecentSales.vue'
import Search from './components/Search.vue'
import TeamSwitcher from './components/TeamSwitcher.vue'
import UserNav from './components/UserNav.vue'

function toCalendarDate(date: Date) {
  return new CalendarDate(date.getFullYear(), date.getMonth() + 1, date.getDate())
}

function createDefaultRange(): DateRange {
  const endDate = new Date()
  const startDate = new Date(endDate)
  startDate.setDate(endDate.getDate() - 29)
  return {
    start: toCalendarDate(startDate),
    end: toCalendarDate(endDate),
  }
}

const dateRange = ref<DateRange | null>(createDefaultRange())
const loading = ref(false)
const errorMessage = ref<string | null>(null)

const summaryCards = ref<SummaryCard[]>([])
const submissionTrend = ref<SubmissionTrendPoint[]>([])
const recentSubmissions = ref<RecentSubmission[]>([])

let activeRequestToken = 0

const summaryCardIcons: Record<string, Component> = {
  totalProblems: BookOpen,
  submissionsInRange: FileCode2,
  acceptanceRate: LineChart,
  activeUsers: UsersRound,
}

const summarySkeletonCount = 4

function getCardIcon(key: string): Component {
  return summaryCardIcons[key] ?? LineChart
}

function formatTrendLabel(dateStr: string) {
  const date = new Date(`${dateStr}T00:00:00`)
  if (Number.isNaN(date.getTime())) {
    return dateStr
  }
  return new Intl.DateTimeFormat('zh-CN', { month: '2-digit', day: '2-digit' }).format(date)
}

const overviewChartData = computed<OverviewChartPoint[]>(() =>
  submissionTrend.value.map((point) => ({
    label: formatTrendLabel(point.date),
    total: point.total,
    accepted: point.accepted,
  }))
)

const exportDisabled = computed(
  () =>
    loading.value ||
    !dateRange.value?.start ||
    !dateRange.value?.end ||
    (summaryCards.value.length === 0 &&
      submissionTrend.value.length === 0 &&
      recentSubmissions.value.length === 0)
)

async function loadOverview(range: DateRange | null) {
  if (!range?.start || !range?.end) {
    return
  }

  const requestToken = ++activeRequestToken
  loading.value = true
  errorMessage.value = null
  try {
    const response = await fetchDashboardOverview({
      startDate: range.start.toString(),
      endDate: range.end.toString(),
      lang: 'zh-CN',
      recentLimit: 6,
    })
    if (requestToken !== activeRequestToken) {
      return
    }
    summaryCards.value = response.summaryCards
    submissionTrend.value = response.submissionTrend
    recentSubmissions.value = response.recentSubmissions
  } catch (error) {
    if (requestToken !== activeRequestToken) {
      return
    }
    errorMessage.value =
      error instanceof Error ? error.message : '仪表盘数据加载失败，请稍后重试。'
  } finally {
    if (requestToken === activeRequestToken) {
      loading.value = false
    }
  }
}

function handleRetry() {
  void loadOverview(dateRange.value)
}

function handleExport() {
  if (exportDisabled.value || !dateRange.value?.start || !dateRange.value?.end) {
    return
  }
  const payload = {
    range: {
      startDate: dateRange.value.start.toString(),
      endDate: dateRange.value.end.toString(),
    },
    summaryCards: summaryCards.value,
    submissionTrend: submissionTrend.value,
    recentSubmissions: recentSubmissions.value,
  }
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `dashboard-${payload.range.startDate}-${payload.range.endDate}.json`
  anchor.click()
  URL.revokeObjectURL(url)
}

watch(
  () => {
    const range = dateRange.value
    if (!range?.start || !range?.end) {
      return null
    }
    return `${range.start.toString()}_${range.end.toString()}`
  },
  (key) => {
    if (!key) {
      return
    }
    void loadOverview(dateRange.value)
  },
  { immediate: true }
)
</script>

<template>
  <div class="md:hidden">
    <VPImage
      alt="Dashboard"
      width="1280"
      height="1214"
      class="block"
      :image="{
        dark: '/examples/dashboard-dark.png',
        light: '/examples/dashboard-light.png',
      }"
    />
  </div>

  <div class="hidden flex-col md:flex">
    <div class="border-b">
      <div class="flex h-16 items-center px-4">
        <TeamSwitcher />
        <MainNav class="mx-6" />
        <div class="ml-auto flex items-center space-x-4">
          <Search />
          <UserNav />
        </div>
      </div>
    </div>
    <div class="flex-1 space-y-4 p-8 pt-6">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 class="text-3xl font-bold tracking-tight">数据控制台</h2>
          <p class="text-sm text-muted-foreground">总览公开题库的最新判题动态。</p>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <DateRangePicker v-model="dateRange" />
          <Button variant="outline" :disabled="exportDisabled" @click="handleExport">
            <Download class="mr-2 h-4 w-4" />
            导出数据
          </Button>
        </div>
      </div>
      <Tabs default-value="overview" class="space-y-4">
        <TabsList>
          <TabsTrigger value="overview"> 数据概览 </TabsTrigger>
          <TabsTrigger value="analytics" disabled> 判题洞察 · 敬请期待 </TabsTrigger>
          <TabsTrigger value="reports" disabled> 自定义报表 · 敬请期待 </TabsTrigger>
          <TabsTrigger value="notifications" disabled> 消息中心 · 敬请期待 </TabsTrigger>
        </TabsList>
        <TabsContent value="overview" class="space-y-4">
          <div
            v-if="errorMessage"
            class="rounded-md border border-destructive/40 bg-destructive/10 p-6 text-sm text-destructive"
          >
            <div class="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p class="font-medium">数据加载失败</p>
                <p class="mt-1 text-destructive/80">{{ errorMessage }}</p>
              </div>
              <Button variant="outline" size="sm" @click="handleRetry"> 重试 </Button>
            </div>
          </div>
          <template v-else>
            <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <template v-if="loading && summaryCards.length === 0">
                <Card v-for="n in summarySkeletonCount" :key="`skeleton-${n}`">
                  <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div class="h-4 w-24 animate-pulse rounded bg-muted" />
                    <div class="h-4 w-4 animate-pulse rounded bg-muted" />
                  </CardHeader>
                  <CardContent>
                    <div class="h-7 w-20 animate-pulse rounded bg-muted" />
                    <p class="mt-2 h-3 w-32 animate-pulse rounded bg-muted" />
                  </CardContent>
                </Card>
              </template>
              <Card v-for="card in summaryCards" :key="card.key">
                <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle class="text-sm font-medium">
                    {{ card.title }}
                  </CardTitle>
                  <component
                    :is="getCardIcon(card.key)"
                    class="h-4 w-4 text-muted-foreground"
                  />
                </CardHeader>
                <CardContent>
                  <div class="text-2xl font-bold">{{ card.value }}</div>
                  <p class="text-xs text-muted-foreground">{{ card.description }}</p>
                </CardContent>
              </Card>
            </div>
            <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card class="col-span-4">
                <CardHeader>
                  <CardTitle>提交趋势</CardTitle>
                  <CardDescription> 按日统计的提交与通过数量对比。 </CardDescription>
                </CardHeader>
                <CardContent class="pl-2">
                  <div v-if="loading && submissionTrend.length === 0" class="space-y-4">
                    <div class="h-6 w-32 animate-pulse rounded bg-muted" />
                    <div class="h-[320px] animate-pulse rounded bg-muted/60" />
                  </div>
                  <Overview v-else :data="overviewChartData" />
                </CardContent>
              </Card>
              <Card class="col-span-3">
                <CardHeader>
                  <CardTitle>最新提交</CardTitle>
                  <CardDescription> 展示最近的公开判题结果。 </CardDescription>
                </CardHeader>
                <CardContent>
                  <div v-if="loading && recentSubmissions.length === 0" class="space-y-4">
                    <div v-for="n in 4" :key="`recent-skeleton-${n}`" class="flex items-center">
                      <div class="h-9 w-9 animate-pulse rounded-full bg-muted" />
                      <div class="ml-4 flex-1 space-y-2">
                        <div class="h-3 w-28 animate-pulse rounded bg-muted" />
                        <div class="h-3 w-20 animate-pulse rounded bg-muted/80" />
                      </div>
                      <div class="ml-auto h-3 w-14 animate-pulse rounded bg-muted" />
                    </div>
                  </div>
                  <RecentSales v-else :submissions="recentSubmissions" />
                </CardContent>
              </Card>
            </div>
          </template>
        </TabsContent>
      </Tabs>
    </div>
  </div>
</template>
