<script setup lang="ts">
import type { Problem } from "@/types/problem";
import { onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { Lock, SearchX, Video, Trash2 } from "lucide-vue-next";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useI18n } from "vue-i18n";

import type { ProblemTableProps } from "./type";

const props = defineProps<ProblemTableProps>();

const router = useRouter();
const { t } = useI18n();

const emit = defineEmits(["load-more", "remove"]);

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

const handleRemove = (e: Event, problem: Problem) => {
  e.stopPropagation();
  emit("remove", problem);
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
        <TableHead class="w-[50px]">{{ t("problem.table.status") }}</TableHead>
        <TableHead>{{ t("problem.table.title") }}</TableHead>
        <TableHead class="w-[120px] text-center">{{
          t("problem.table.acceptance")
        }}</TableHead>
        <TableHead class="w-[100px] text-center">{{
          t("problem.table.difficulty")
        }}</TableHead>
        <TableHead v-if="props.editable" class="w-[80px] text-center">{{
          t("problem.table.actions")
        }}</TableHead>
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
          <TableCell>
            <div class="flex justify-center items-center">
              <component
                :is="problem.statusIcon"
                v-if="problem.statusIcon"
                class="h-5 w-5"
                :class="{ 'text-emerald-600': problem.status === 'solved' }"
              />
            </div>
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
                problem.acceptanceRate ?? problem.acceptance_rate,
              )
            }}
          </TableCell>

          <TableCell
            :class="difficultyClass(problem.difficulty)"
            class="text-center"
          >
            {{ t("problem.difficulty." + problem.difficulty.toLowerCase()) }}
          </TableCell>

          <TableCell v-if="props.editable" class="text-center">
            <Button
              variant="ghost"
              size="icon"
              class="h-8 w-8 text-muted-foreground hover:text-destructive rounded-full"
              @click="(e: MouseEvent) => handleRemove(e, problem)"
            >
              <Trash2 class="h-4 w-4" />
            </Button>
          </TableCell>
        </TableRow>
      </template>

      <TableRow v-else>
        <TableCell :colspan="props.editable ? 5 : 4" class="p-0">
          <div
            class="flex flex-col items-center justify-center py-24 border-2 border-dashed border-muted/50 rounded-2xl bg-muted/5 text-center px-6 m-4"
          >
            <div
              class="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/50 mb-4"
            >
              <SearchX class="h-8 w-8 text-muted-foreground/50" />
            </div>
            <p class="text-xl font-bold text-foreground">
              {{ t("problem.table.noResults") }}
            </p>
            <p class="text-sm text-muted-foreground mt-2 max-w-[300px]">
              {{ t("problem.table.tryAdjusting") }}
            </p>
          </div>
        </TableCell>
      </TableRow>
    </TableBody>
  </Table>
  <div
    v-if="numProblemsToShow < totalFilteredProblems"
    class="text-center py-4 text-muted-foreground"
  >
    {{ t("problem.table.loadingMore") }}
  </div>
</template>
