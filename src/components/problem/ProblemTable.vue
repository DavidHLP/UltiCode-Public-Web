<script setup lang="ts">
import type { Problem } from "@/types/problem";
import { onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { Lock, SearchX, Video } from "lucide-vue-next";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
} from "@/components/ui/empty";

import type { ProblemTableProps } from "./type";

defineProps<ProblemTableProps>();

const router = useRouter();

const emit = defineEmits(["load-more"]);

const goToDetail = (slug: string) => {
  router.push({ name: "problem-detail", params: { slug } });
};

const difficultyClass = (difficulty: Problem["difficulty"]) => {
  switch (difficulty) {
    case "Easy":
      return "text-emerald-600";
    case "Medium":
      return "text-amber-600";
    case "Hard":
      return "text-red-600";
    default:
      return "";
  }
};

const formatAcceptance = (value: number | string | undefined | null) => {
  if (value === undefined || value === null) return "-";
  const num = Number(value);
  return isNaN(num) ? "-" : `${num.toFixed(1)}%`;
};

const handleScroll = () => {
  const buffer = 200; // Number of pixels from the bottom to trigger load more
  const isAtBottom =
    window.innerHeight + window.scrollY >=
    document.documentElement.offsetHeight - buffer;
  if (isAtBottom) {
    emit("load-more");
  }
};

onMounted(() => {
  window.addEventListener("scroll", handleScroll);
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});
</script>

<template>
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead class="w-[50px]">Status</TableHead>
        <TableHead>Title</TableHead>
        <TableHead class="w-[120px] text-center">Acceptance</TableHead>
        <TableHead class="w-[100px] text-center">Difficulty</TableHead>
      </TableRow>
    </TableHeader>

    <TableBody>
      <template v-if="displayedProblems.length > 0">
        <!-- 关键：在 TableRow 上加 odd:/even: 类 -->
        <TableRow
          v-for="problem in displayedProblems"
          :key="problem.id"
          class="odd:bg-muted/30 even:bg-background hover:bg-muted/50 cursor-pointer"
          @click="goToDetail(problem.slug)"
        >
          <TableCell class="flex justify-center">
            <component
              :is="problem.statusIcon"
              v-if="problem.statusIcon"
              class="h-5 w-5"
              :class="{ 'text-emerald-600': problem.status === 'solved' }"
            />
          </TableCell>

          <TableCell>
            <div class="flex items-center gap-2">
              <span class="truncate"
                >{{ problem.id }}. {{ problem.title }}</span
              >
              <!-- 关键：去掉下划线 -->
              <a
                v-if="problem.hasSolution"
                href="#"
                class="no-underline hover:no-underline text-muted-foreground hover:text-foreground"
                @click.stop
              >
                <Video class="h-4 w-4" />
              </a>
              <Lock v-if="problem.isPremium" class="h-4 w-4 text-amber-500" />
            </div>
          </TableCell>

          <TableCell class="text-center">
            {{
              formatAcceptance(
                problem.acceptanceRate ?? problem.acceptance_rate
              )
            }}
          </TableCell>

          <TableCell
            :class="difficultyClass(problem.difficulty)"
            class="text-center"
          >
            {{ problem.difficulty }}
          </TableCell>
        </TableRow>
      </template>

      <TableRow v-else>
        <TableCell colspan="4" class="p-0">
          <Empty class="border-none bg-transparent px-6 py-8">
            <EmptyContent>
              <EmptyMedia variant="icon">
                <SearchX class="h-6 w-6 text-muted-foreground" />
              </EmptyMedia>
              <EmptyHeader>
                <p class="text-base font-semibold text-foreground">
                  No results found
                </p>
                <EmptyDescription>
                  Try adjusting filters or clearing search to see more problems.
                </EmptyDescription>
              </EmptyHeader>
            </EmptyContent>
          </Empty>
        </TableCell>
      </TableRow>
    </TableBody>
  </Table>
  <div
    v-if="numProblemsToShow < totalFilteredProblems"
    class="text-center py-4 text-muted-foreground"
  >
    Loading more...
  </div>
</template>
