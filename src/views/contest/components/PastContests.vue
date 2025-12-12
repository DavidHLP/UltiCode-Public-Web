<script setup lang="ts">
import { computed } from "vue";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronLeft, ChevronRight, Trophy } from "lucide-vue-next";
import { useRouter } from "vue-router";
import type { ContestListItem } from "@/types/contest";
import { formatDateTime, getDurationMinutes } from "@/utils/date";

const props = defineProps<{
  contests: ContestListItem[];
  loading: boolean;
  currentPage: number;
  totalPages: number;
}>();

const emit = defineEmits<{
  "update:currentPage": [page: number];
}>();

const router = useRouter();

// 简单的页码生成逻辑
const visiblePages = computed(() => {
  const pages: (number | string)[] = [];
  const total = props.totalPages;
  const current = props.currentPage;

  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    pages.push(1);
    if (current > 3) pages.push("...");

    let start = Math.max(2, current - 1);
    let end = Math.min(total - 1, current + 1);

    if (current < 3) end = 4;
    if (current > total - 2) start = total - 3;

    for (let i = start; i <= end; i++) pages.push(i);

    if (current < total - 2) pages.push("...");
    pages.push(total);
  }
  return pages;
});
</script>

<template>
  <div class="space-y-4 lg:col-span-2">
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-bold">Past Contests</h2>
      <div
        class="flex items-center gap-2 text-primary font-medium text-sm cursor-pointer"
      >
        <Trophy class="h-4 w-4" /> Contest Partner
      </div>
    </div>
    <p class="text-muted-foreground text-sm -mt-2">
      Join virtual contests to prepare for the ranking contest
    </p>

    <Card class="border-none shadow-sm overflow-hidden">
      <div class="p-2 border-b flex justify-end">
        <!-- Random/Toggle Placeholders from Image -->
        <Button
          variant="ghost"
          size="icon"
          class="text-pink-500 rounded-full bg-pink-50 hover:bg-pink-100"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M12 3v19" />
            <path d="M5 8h14" />
            <path d="M5 16h14" />
          </svg>
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow class="hover:bg-transparent bg-muted/5">
            <TableHead class="w-[300px]">Past Contests</TableHead>
            <TableHead class="text-center">Duration</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow
            v-for="(contest, index) in contests"
            :key="contest.id"
            class="group"
            :class="index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'"
          >
            <TableCell>
              <div
                class="py-2 cursor-pointer hover:underline decoration-primary"
                @click="
                  router.push({
                    name: 'contest-detail',
                    params: { contestId: contest.id },
                  })
                "
              >
                <span class="font-medium block text-base">{{
                  contest.title
                }}</span>
                <span class="text-xs text-muted-foreground">{{
                  formatDateTime(contest.start_time)
                }}</span>
              </div>
            </TableCell>
            <TableCell class="text-center text-sm text-gray-500 font-mono">
              {{
                getDurationMinutes(contest.start_time, contest.end_time) || "--"
              }}
              {{
                getDurationMinutes(contest.start_time, contest.end_time)
                  ? "min"
                  : ""
              }}
            </TableCell>
            <TableCell class="text-right">
              <Button
                size="sm"
                class="bg-pink-100 text-pink-500 hover:bg-pink-200 hover:text-pink-600 border-none px-4 h-7 text-xs font-semibold rounded"
                @click.stop
              >
                Virtual
              </Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>

      <!-- Pagination -->
      <div
        class="flex items-center justify-center gap-2 p-4 bg-muted/5 mt-auto"
      >
        <Button
          variant="outline"
          size="icon"
          class="h-8 w-8 bg-white"
          :disabled="currentPage === 1 || loading"
          @click="emit('update:currentPage', currentPage - 1)"
        >
          <ChevronLeft class="h-4 w-4" />
        </Button>

        <div class="flex gap-1">
          <Button
            v-for="page in visiblePages"
            :key="page"
            :variant="page === currentPage ? 'default' : 'ghost'"
            size="sm"
            :disabled="page === '...' || loading"
            class="w-8 h-8 p-0"
            :class="
              page === currentPage
                ? 'bg-primary text-primary-foreground'
                : 'bg-white hover:bg-gray-100'
            "
            @click="
              typeof page === 'number' && emit('update:currentPage', page)
            "
          >
            {{ page }}
          </Button>
        </div>

        <Button
          variant="outline"
          size="icon"
          class="h-8 w-8 bg-white"
          :disabled="currentPage === totalPages || loading"
          @click="emit('update:currentPage', currentPage + 1)"
        >
          <ChevronRight class="h-4 w-4" />
        </Button>
      </div>
    </Card>
  </div>
</template>
