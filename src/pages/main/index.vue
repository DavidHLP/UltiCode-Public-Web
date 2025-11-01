<script lang="ts">
export const description = 'A sidebar with a calendar.'
export const iframeHeight = '800px'
</script>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import AppSidebar from '@/components/AppSidebar.vue'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import ProblemsDataTable from './components/ProblemsDataTable.vue'
import { problemsColumns } from './components/problemsColumns'
import { fetchPublicProblems, type ProblemCard } from '@/api/problem/problems'

const loading = ref(false)
const errorMessage = ref<string | null>(null)
const problems = ref<ProblemCard[]>([])

async function loadProblems() {
  loading.value = true
  errorMessage.value = null
  try {
    const response = await fetchPublicProblems({ page: 1, size: 50, lang: 'zh-CN' })
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
              <BreadcrumbPage>公开题目</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>
      <div class="flex flex-1 flex-col gap-4 p-6">
        <div class="space-y-4">
          <template v-if="loading">
            <div class="rounded-md border">
              <div class="p-8 text-center">
                <div
                  class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
                ></div>
                <p class="mt-4 text-sm text-muted-foreground">正在加载题目数据...</p>
              </div>
            </div>
          </template>

          <template v-else-if="errorMessage">
            <div class="rounded-md border border-destructive/40 bg-destructive/10 p-8 text-center">
              <h3 class="text-lg font-semibold text-destructive">加载失败</h3>
              <p class="mt-2 text-sm text-destructive/80">{{ errorMessage }}</p>
              <Button class="mt-4" @click="loadProblems"> 重新加载 </Button>
            </div>
          </template>

          <template v-else-if="problems.length === 0">
            <div
              class="rounded-md border border-dashed border-muted-foreground/40 bg-muted/20 p-8 text-center"
            >
              <h3 class="text-lg font-semibold text-muted-foreground">暂无题目</h3>
              <p class="mt-2 text-sm text-muted-foreground">
                暂时没有可展示的公开题目，请稍后再试。
              </p>
            </div>
          </template>

          <ProblemsDataTable v-else :columns="problemsColumns" :data="problems" />
        </div>
      </div>
    </SidebarInset>
  </SidebarProvider>
</template>
