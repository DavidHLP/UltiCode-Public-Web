<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";
import ProblemExplorer from "@/components/problem/ProblemExplorer.vue";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart } from "@/components/ui/chart-line";
import { BarChart } from "@/components/ui/chart-bar";
import { DonutChart } from "@/components/ui/chart-donut";
import { GitFork, ListX, MoreHorizontal, Share2 } from "lucide-vue-next";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ProblemListItem, ProblemListStats } from "@/types/problem-list";
import type { Problem } from "@/types/problem";
import {
  fetchProblemListItem,
  fetchProblemListStats,
  fetchProblemsByListId,
} from "@/api/problem-list";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
} from "@/components/ui/empty";

const route = useRoute();
const listId = computed(() => route.params.id as string);

// 获取当前列表的详细信息
const currentList = ref<ProblemListItem | null>(null);
const problems = ref<Problem[]>([]);
const stats = ref<ProblemListStats | null>(null);
const emptyStats = computed<ProblemListStats>(() => ({
  listId: listId.value || "",
  totalCount: 0,
  solvedCount: 0,
  attemptedCount: 0,
  todoCount: 0,
  progress: 0,
}));
const safeStats = computed<ProblemListStats>(
  () => stats.value ?? emptyStats.value,
);

async function loadProblemList(id?: string) {
  if (!id) {
    currentList.value = null;
    problems.value = [];
    stats.value = null;
    return;
  }
  try {
    currentList.value = await fetchProblemListItem(id);
  } catch (error) {
    console.error("Failed to load problem list", error);
    currentList.value = null;
  }
  try {
    problems.value = await fetchProblemsByListId(id);
  } catch (error) {
    console.error("Failed to load problems for list", error);
    problems.value = [];
  }
  try {
    const allStats = await fetchProblemListStats();
    stats.value = allStats.find((s) => s.listId === id) ?? emptyStats.value;
  } catch (error) {
    console.error("Failed to load list stats", error);
    stats.value = emptyStats.value;
  }
}

watch(
  listId,
  (id) => {
    void loadProblemList(id);
  },
  { immediate: true },
);

// 格式化日期
const formatDate = (date?: Date | string) => {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(d);
};

const statusCategories: Array<"Solved" | "Attempted" | "Todo"> = [
  "Solved",
  "Attempted",
  "Todo",
];
const statusColorTokens: Record<(typeof statusCategories)[number], string> = {
  Solved: "--chart-status-solved",
  Attempted: "--chart-status-attempted",
  Todo: "--chart-status-todo",
};
const statusColorScale = computed(() =>
  statusCategories.map((label) => `hsl(var(${statusColorTokens[label]}))`),
);
const momentumColorScale = computed(() => [
  `hsl(var(--chart-status-solved))`,
  `hsl(var(--chart-status-attempted))`,
  `hsl(var(--chart-status-todo))`,
  `hsl(var(--chart-accent-info))`,
]);

const statusDistribution = computed(() => {
  const current = safeStats.value;
  return [
    { label: "Solved", value: current.solvedCount },
    { label: "Attempted", value: current.attemptedCount },
    { label: "Todo", value: current.todoCount },
  ];
});

const statusDonutData = computed(() =>
  statusDistribution.value.map((item) => ({
    name: item.label,
    total: item.value,
  })),
);

const difficultyBuckets = ["Easy", "Medium", "Hard"] as const;

const difficultyInsights = computed(() => {
  return difficultyBuckets.map((difficulty) => {
    const filtered = problems.value.filter(
      (problem) => problem.difficulty === difficulty,
    );
    const solved = filtered.filter(
      (problem) => problem.status === "solved",
    ).length;
    const attempted = filtered.filter(
      (problem) => problem.status === "attempted",
    ).length;
    const todo = filtered.filter((problem) => problem.status === "todo").length;
    return {
      difficulty,
      Solved: solved,
      Attempted: attempted,
      Todo: todo,
    };
  });
});

const progressMomentum = computed(() => {
  let solved = 0;
  let attempted = 0;
  let todo = 0;

  return problems.value.map((problem, index) => {
    if (problem.status === "solved") solved += 1;
    if (problem.status === "attempted") attempted += 1;
    if (problem.status === "todo") todo += 1;

    const total = solved + attempted + todo || 1;

    return {
      label: `#${index + 1}`,
      "Solved Share": Number(((solved / total) * 100).toFixed(1)),
      "Attempted Share": Number(((attempted / total) * 100).toFixed(1)),
      "Todo Share": Number(((todo / total) * 100).toFixed(1)),
      "Acceptance Rate": Number(problem.acceptance_rate.toFixed(1)),
    };
  });
});

const momentumCategories: Array<
  "Solved Share" | "Attempted Share" | "Todo Share" | "Acceptance Rate"
> = ["Solved Share", "Attempted Share", "Todo Share", "Acceptance Rate"];

const donutValueFormatter = (tick: number | Date) =>
  typeof tick === "number" ? `${tick} problems` : "";
const countFormatter = (value: number | Date) =>
  typeof value === "number" ? `${value}` : value.toString();
const percentAxisFormatter = (value: number | Date) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return `${value.toFixed(1)}%`;
  }
  return typeof value === "string" ? value : "";
};
</script>

<template>
  <div class="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
    <ProblemExplorer :problems="problems">
      <template #header>
        <div class="space-y-8 pb-8 border-b border-border/40">
          <!-- 标题和操作按钮 -->
          <div
            class="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between"
          >
            <div class="space-y-2">
              <h1 class="text-3xl font-bold tracking-tight sm:text-4xl">
                {{ currentList?.name || "Problem List" }}
              </h1>
              <!-- 描述 -->
              <p
                v-if="currentList?.description"
                class="text-lg text-muted-foreground leading-relaxed max-w-3xl"
              >
                {{ currentList.description }}
              </p>
              <!-- 元数据 -->
              <div
                class="flex items-center gap-4 text-sm text-muted-foreground pt-2"
              >
                <span
                  v-if="currentList?.createdAt"
                  class="flex items-center gap-1"
                >
                  Created {{ formatDate(currentList.createdAt) }}
                </span>
                <span
                  v-if="currentList?.updatedAt"
                  class="flex items-center gap-1 before:content-['•'] before:mr-4 before:text-muted-foreground/50"
                >
                  Updated {{ formatDate(currentList.updatedAt) }}
                </span>
              </div>
            </div>

            <div class="flex items-center gap-2 shrink-0">
              <Button variant="outline" size="sm" class="h-9">
                <Share2 class="mr-2 h-4 w-4" />
                Share
              </Button>
              <Button variant="outline" size="sm" class="h-9">
                <GitFork class="mr-2 h-4 w-4" />
                Fork
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger as-child>
                  <Button variant="outline" size="icon" class="h-9 w-9">
                    <MoreHorizontal class="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Edit List</DropdownMenuItem>
                  <DropdownMenuItem>Duplicate</DropdownMenuItem>
                  <DropdownMenuItem class="text-destructive"
                    >Delete</DropdownMenuItem
                  >
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <!-- 统计信息 - 使用图表颜色系统 -->
          <div
            class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5 lg:w-fit"
          >
            <div class="flex flex-col gap-1 p-3 rounded-lg bg-muted/50">
              <span
                class="text-xs font-medium text-muted-foreground uppercase tracking-wider"
                >Total</span
              >
              <span class="text-2xl font-bold">{{ safeStats.totalCount }}</span>
            </div>
            <div class="flex flex-col gap-1 p-3 rounded-lg bg-muted/50">
              <span
                class="text-xs font-medium text-muted-foreground uppercase tracking-wider"
                >Solved</span
              >
              <span
                class="text-2xl font-bold text-[hsl(var(--chart-status-solved))]"
                >{{ safeStats.solvedCount }}</span
              >
            </div>
            <div class="flex flex-col gap-1 p-3 rounded-lg bg-muted/50">
              <span
                class="text-xs font-medium text-muted-foreground uppercase tracking-wider"
                >Attempted</span
              >
              <span
                class="text-2xl font-bold text-[hsl(var(--chart-status-attempted))]"
                >{{ safeStats.attemptedCount }}</span
              >
            </div>
            <div class="flex flex-col gap-1 p-3 rounded-lg bg-muted/50">
              <span
                class="text-xs font-medium text-muted-foreground uppercase tracking-wider"
                >Todo</span
              >
              <span
                class="text-2xl font-bold text-[hsl(var(--chart-status-todo))]"
                >{{ safeStats.todoCount }}</span
              >
            </div>
            <div class="flex flex-col gap-1 p-3 rounded-lg bg-muted/50">
              <span
                class="text-xs font-medium text-muted-foreground uppercase tracking-wider"
                >Progress</span
              >
              <span class="text-2xl font-bold"
                >{{ safeStats.progress.toFixed(1) }}%</span
              >
            </div>
          </div>

          <!-- 图表区域 -->
          <div
            v-if="problems.length"
            class="grid grid-cols-1 gap-6 lg:grid-cols-3 pt-4"
          >
            <!-- Status Overview Card -->
            <Card class="chart-fade-in bg-card transition-all hover:shadow-md">
              <CardHeader class="pb-2">
                <CardTitle class="text-base font-medium"
                  >Status Overview</CardTitle
                >
              </CardHeader>
              <CardContent>
                <DonutChart
                  class="h-60"
                  index="name"
                  :category="'total'"
                  :data="statusDonutData"
                  :value-formatter="donutValueFormatter"
                  :colors="statusColorScale"
                />
              </CardContent>
            </Card>

            <!-- Difficulty Insights Card -->
            <Card
              class="chart-fade-in lg:col-span-2 transition-all hover:shadow-md"
            >
              <CardHeader class="pb-2">
                <CardTitle class="text-base font-medium"
                  >Difficulty Insights</CardTitle
                >
              </CardHeader>
              <CardContent>
                <BarChart
                  class="h-60"
                  :data="difficultyInsights"
                  index="difficulty"
                  :categories="statusCategories"
                  type="stacked"
                  :rounded-corners="4"
                  :y-formatter="countFormatter"
                  :colors="statusColorScale"
                />
              </CardContent>
            </Card>

            <!-- Progress Momentum Card -->
            <Card
              class="chart-fade-in lg:col-span-3 transition-all hover:shadow-md"
            >
              <CardHeader class="pb-2">
                <CardTitle class="text-base font-medium"
                  >Progress Momentum</CardTitle
                >
              </CardHeader>
              <CardContent>
                <LineChart
                  class="h-[300px]"
                  :data="progressMomentum"
                  index="label"
                  :categories="momentumCategories"
                  :colors="momentumColorScale"
                  :y-formatter="percentAxisFormatter"
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </template>

      <!-- 问题列表将由 ProblemExplorer 组件处理 -->
      <template v-if="problems.length === 0">
        <Empty class="h-80 border border-border bg-muted/40">
          <EmptyContent>
            <EmptyMedia variant="icon">
              <ListX class="h-7 w-7 text-muted-foreground" />
            </EmptyMedia>
            <EmptyHeader>
              <p class="text-xl font-semibold text-foreground">
                No problems in this list
              </p>
              <EmptyDescription>
                Add problems to get started and track your progress.
              </EmptyDescription>
            </EmptyHeader>
            <Button class="mt-1" variant="outline" size="lg"
              >Add Problems</Button
            >
          </EmptyContent>
        </Empty>
      </template>
    </ProblemExplorer>
  </div>
</template>
