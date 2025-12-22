<script setup lang="ts">
import { computed } from "vue";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Trophy,
  Calendar,
  Clock,
} from "lucide-vue-next";
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

// Simple pagination logic
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
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-end justify-between">
      <div class="space-y-1">
        <h2 class="text-2xl font-bold tracking-tight">Past Contests</h2>
        <p class="text-sm text-muted-foreground">
          Join virtual contests to prepare for the ranking contest
        </p>
      </div>
      <div
        class="flex items-center gap-1.5 rounded-full bg-yellow-50 px-3 py-1 text-xs font-semibold text-yellow-600 transition-colors hover:bg-yellow-100 cursor-pointer"
      >
        <Trophy class="h-3.5 w-3.5" />
        Contest Partner
      </div>
    </div>

    <!-- Contest List -->
    <div
      class="flex flex-col rounded-lg border bg-card text-card-foreground shadow-sm"
    >
      <div
        v-for="(contest, index) in contests"
        :key="contest.id"
        class="group flex items-center justify-between gap-4 p-3 transition-colors hover:bg-muted/50 cursor-pointer"
        :class="{ 'border-b': index !== contests.length - 1 }"
        @click="
          router.push({
            name: 'contest-detail',
            params: { contestId: contest.id },
          })
        "
      >
        <div class="flex items-center gap-3 min-w-0">
          <!-- Icon Box -->
          <div
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground group-hover:text-foreground transition-colors"
          >
            <Trophy class="h-5 w-5" />
          </div>

          <!-- Info -->
          <div class="flex flex-col gap-0.5 min-w-0">
            <span
              class="truncate text-sm font-medium leading-none group-hover:text-primary transition-colors"
            >
              {{ contest.title }}
            </span>
            <div class="flex items-center gap-3 text-xs text-muted-foreground">
              <span class="flex items-center gap-1">
                <Calendar class="h-3 w-3" />
                {{ formatDateTime(contest.start_time).split(" ")[0] }}
              </span>
              <span class="flex items-center gap-1">
                <Clock class="h-3 w-3" />
                {{ getDurationMinutes(contest.start_time, contest.end_time) }}
                min
              </span>
            </div>
          </div>
        </div>

        <!-- Action -->
        <Button
          variant="ghost"
          size="sm"
          class="h-7 px-3 text-xs font-medium text-muted-foreground hover:text-primary hover:bg-primary/10"
          @click.stop
        >
          Virtual
        </Button>
      </div>
    </div>

    <!-- Loading State -->
    <div
      v-if="loading && contests.length === 0"
      class="py-10 text-center text-muted-foreground"
    >
      Loading...
    </div>

    <!-- Pagination -->
    <div class="flex items-center justify-center gap-2 pt-4">
      <Button
        variant="outline"
        size="icon"
        class="h-9 w-9"
        :disabled="currentPage === 1 || loading"
        @click="emit('update:currentPage', currentPage - 1)"
      >
        <ChevronLeft class="h-4 w-4" />
      </Button>

      <div class="flex gap-1.5">
        <Button
          v-for="page in visiblePages"
          :key="page"
          :variant="page === currentPage ? 'default' : 'outline'"
          size="icon"
          :disabled="page === '...' || loading"
          class="h-9 w-9 text-xs"
          :class="{ 'pointer-events-none': page === '...' }"
          @click="typeof page === 'number' && emit('update:currentPage', page)"
        >
          {{ page }}
        </Button>
      </div>

      <Button
        variant="outline"
        size="icon"
        class="h-9 w-9"
        :disabled="currentPage === totalPages || loading"
        @click="emit('update:currentPage', currentPage + 1)"
      >
        <ChevronRight class="h-4 w-4" />
      </Button>
    </div>
  </div>
</template>
