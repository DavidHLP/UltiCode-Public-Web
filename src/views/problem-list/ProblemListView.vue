<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";
import ProblemExplorer from "@/components/problem/ProblemExplorer.vue";
import { Button } from "@/components/ui/button";
import {
  GitFork,
  ListX,
  MoreHorizontal,
  Share2,
  CalendarDays,
  Clock,
} from "lucide-vue-next";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import type { ProblemListItem } from "@/types/problem-list";
import type { Problem } from "@/types/problem";
import {
  fetchProblemListItem,
  fetchProblemsByListId,
} from "@/api/problem-list";
import { fetchCurrentUserId } from "@/utils/auth";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
} from "@/components/ui/empty";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import ProblemListAnalytics from "./ProblemListAnalytics.vue";

const route = useRoute();
const listId = computed(() => route.params.id as string);

// 获取当前列表的详细信息
const currentList = ref<ProblemListItem | null>(null);
const problems = ref<Problem[]>([]);
const problemsWithStatus = computed(() => problems.value);

async function loadProblemList(id?: string) {
  if (!id) {
    currentList.value = null;
    problems.value = [];
    return;
  }
  const userId = fetchCurrentUserId();
  try {
    currentList.value = await fetchProblemListItem(id);
  } catch (error) {
    console.error("Failed to load problem list", error);
    currentList.value = null;
  }
  try {
    problems.value = await fetchProblemsByListId(id, userId ?? undefined);
  } catch (error) {
    console.error("Failed to load problems for list", error);
    problems.value = [];
  }
}

watch(
  listId,
  (id) => {
    void loadProblemList(id);
  },
  { immediate: true }
);

// 格式化日期
const formatDate = (date?: Date | string) => {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
};
</script>

<template>
  <div
    class="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 max-w-[1400px]"
  >
    <!-- Header Section -->
    <div
      class="flex flex-col gap-6 md:flex-row md:items-start md:justify-between border-b pb-8"
    >
      <div class="space-y-4 max-w-3xl">
        <div class="space-y-2">
          <div class="flex items-center gap-3">
            <Badge variant="outline" class="rounded-md px-2.5 py-0.5"
              >List</Badge
            >
            <span
              v-if="!currentList?.isPublic"
              class="text-xs text-muted-foreground flex items-center gap-1"
            >
              <span class="w-1.5 h-1.5 rounded-full bg-yellow-500/70"></span>
              Private
            </span>
          </div>
          <h1
            class="text-3xl font-bold tracking-tight sm:text-4xl text-foreground/90"
          >
            {{ currentList?.name || "Problem List" }}
          </h1>
        </div>

        <p
          v-if="currentList?.description"
          class="text-lg text-muted-foreground/80 leading-relaxed"
        >
          {{ currentList.description }}
        </p>

        <div
          class="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground/70"
        >
          <div class="flex items-center gap-2">
            <div
              class="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium"
            >
              {{ currentList?.authorId?.slice(0, 2).toUpperCase() || "U" }}
            </div>
            <span>Author</span>
          </div>

          <Separator orientation="vertical" class="h-4" />

          <span v-if="currentList?.createdAt" class="flex items-center gap-1.5">
            <CalendarDays class="w-4 h-4" />
            Created {{ formatDate(currentList.createdAt) }}
          </span>

          <span v-if="currentList?.updatedAt" class="flex items-center gap-1.5">
            <Clock class="w-4 h-4" />
            Updated {{ formatDate(currentList.updatedAt) }}
          </span>
        </div>
      </div>

      <div class="flex items-center gap-2 shrink-0">
        <Button variant="secondary" size="sm" class="h-9">
          <Share2 class="mr-2 h-4 w-4" />
          Share
        </Button>
        <Button variant="outline" size="sm" class="h-9">
          <GitFork class="mr-2 h-4 w-4" />
          Fork
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button variant="ghost" size="icon" class="h-9 w-9">
              <MoreHorizontal class="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" class="w-48">
            <DropdownMenuItem>Edit List Details</DropdownMenuItem>
            <DropdownMenuItem>Manage Problems</DropdownMenuItem>
            <DropdownMenuItem>Duplicate List</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem class="text-destructive"
              >Delete List</DropdownMenuItem
            >
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>

    <div v-if="problems.length === 0" class="py-12">
      <Empty
        class="h-80 border border-dashed border-border/60 bg-muted/20 rounded-xl"
      >
        <EmptyContent>
          <EmptyMedia
            variant="icon"
            class="bg-background p-4 rounded-full shadow-sm mb-4"
          >
            <ListX class="h-8 w-8 text-muted-foreground" />
          </EmptyMedia>
          <EmptyHeader>
            <h3 class="text-xl font-semibold text-foreground mb-1">
              No problems in this list
            </h3>
            <EmptyDescription class="text-base">
              This list is currently empty. Add problems to start tracking your
              progress.
            </EmptyDescription>
          </EmptyHeader>
          <Button class="mt-6" size="lg">Add Problems</Button>
        </EmptyContent>
      </Empty>
    </div>

    <!-- Main Content Grid -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <!-- Left Column: Problem List (8 cols) -->
      <div class="lg:col-span-8 space-y-6">
        <ProblemExplorer :problems="problemsWithStatus" />
      </div>

      <!-- Right Column: Analytics Sidebar (4 cols) -->
      <div class="lg:col-span-4 space-y-6 sticky top-6">
        <ProblemListAnalytics :problems="problemsWithStatus" />

        <!-- Motivation Card (Optional Placeholder) -->
        <div class="bg-primary/5 rounded-lg p-5 border border-primary/10">
          <h4 class="font-medium text-primary mb-2 flex items-center gap-2">
            🔥 Keep it up!
          </h4>
          <p class="text-sm text-primary/80">
            Solve <strong>3 more</strong> problems to reach 50% completion on
            this list.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
