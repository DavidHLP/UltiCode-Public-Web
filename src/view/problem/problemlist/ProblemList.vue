<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";
import ProblemView from "@/view/problem/components/ProblemView.vue";
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
import type {
  ProblemListItem,
  ProblemListStats,
} from "@/mocks/schema/problem-list";
import type { Problem } from "@/mocks/schema/problem";
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
const formatDate = (date?: Date) => {
  if (!date) return "";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
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
      "Acceptance Rate": Number(problem.acceptanceRate.toFixed(1)),
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
  <div class="mx-auto w-full max-w-[60%] space-y-8 py-6">
    <ProblemView :problems="problems">
    <template #header>
      <div class="space-y-6">
        <!-- 标题和操作按钮 -->
        <div class="flex items-end justify-between gap-4">
          <div class="flex items-end gap-3">
            <h1 class="text-3xl font-bold tracking-tight">
              {{ currentList?.name || "Problem List" }}
            </h1>
          </div>
          <div class="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Share2 class="mr-2 h-4 w-4" />
              Share
            </Button>
            <Button variant="outline" size="sm">
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

        <!-- 描述 -->
        <p
          v-if="currentList?.description"
          class="text-base text-muted-foreground leading-relaxed"
        >
          {{ currentList.description }}
        </p>

        <!-- 统计信息 - 使用图表颜色系统 -->
        <div class="flex flex-wrap items-center gap-8 text-sm">
          <div class="flex items-center gap-2.5">
            <span class="text-muted-foreground">Total:</span>
            <span class="font-semibold">{{ safeStats.totalCount }}</span>
          </div>
          <div class="flex items-center gap-2.5">
            <span class="text-muted-foreground">Solved:</span>
            <span class="chart-solved font-semibold">{{
              safeStats.solvedCount
            }}</span>
          </div>
          <div class="flex items-center gap-2.5">
            <span class="text-muted-foreground">Attempted:</span>
            <span class="chart-attempted font-semibold">{{
              safeStats.attemptedCount
            }}</span>
          </div>
          <div class="flex items-center gap-2.5">
            <span class="text-muted-foreground">Todo:</span>
            <span class="chart-todo font-semibold">{{
              safeStats.todoCount
            }}</span>
          </div>
          <div class="flex items-center gap-2.5">
            <span class="text-muted-foreground">Progress:</span>
            <span class="font-semibold"
              >{{ safeStats.progress.toFixed(1) }}%</span
            >
          </div>
        </div>

        <!-- 元数据 -->
        <div class="flex items-center gap-6 text-xs text-muted-foreground">
          <span v-if="currentList?.createdAt">
            Created: {{ formatDate(currentList.createdAt) }}
          </span>
          <span v-if="currentList?.updatedAt">
            Updated: {{ formatDate(currentList.updatedAt) }}
          </span>
        </div>

        <!-- 图表区域 -->
        <div
          v-if="problems.length"
          class="grid grid-cols-1 gap-8 xl:grid-cols-3"
        >
          <!-- Status Overview Card -->
          <Card class="chart-fade-in bg-card/60 backdrop-blur transition-shadow hover:shadow-lg">
            <CardHeader class="pb-3 space-y-2">
              <CardTitle class="text-lg">Status Overview</CardTitle>
              <p class="text-sm text-muted-foreground leading-relaxed">
                Status mix rendered with the shared donut design
              </p>
            </CardHeader>
            <CardContent class="space-y-6">
              <DonutChart
                class="h-64"
                index="name"
                :category="'total'"
                :data="statusDonutData"
                :value-formatter="donutValueFormatter"
                :colors="statusColorScale"
              />
            </CardContent>
          </Card>

          <!-- Difficulty Insights Card -->
          <Card class="chart-fade-in xl:col-span-2 transition-shadow hover:shadow-lg">
            <CardHeader class="pb-3 space-y-2">
              <CardTitle class="text-lg">Difficulty Insights</CardTitle>
              <p class="text-sm text-muted-foreground leading-relaxed">
                Status mix, premium load, and acceptance per difficulty
              </p>
            </CardHeader>
            <CardContent>
              <BarChart
                class="h-96"
                :data="difficultyInsights"
                index="difficulty"
                :categories="statusCategories"
                type="stacked"
                :rounded-corners="6"
                :y-formatter="countFormatter"
                :colors="statusColorScale"
              />
            </CardContent>
          </Card>

          <!-- Progress Momentum Card -->
          <Card class="chart-fade-in xl:col-span-3 transition-shadow hover:shadow-lg">
            <CardHeader class="pb-3 space-y-2">
              <CardTitle class="text-lg">Progress Momentum</CardTitle>
              <p class="text-sm text-muted-foreground leading-relaxed">
                Rolling share of solved / attempted / todo alongside acceptance
              </p>
            </CardHeader>
            <CardContent>
              <LineChart
                class="h-[400px]"
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

    <!-- 问题列表将由 ProblemView 组件处理 -->
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
          <Button class="mt-1" variant="outline" size="lg">Add Problems</Button>
        </EmptyContent>
      </Empty>
    </template>
    </ProblemView>
  </div>
</template>
