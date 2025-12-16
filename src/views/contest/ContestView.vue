<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import {
  fetchUpcomingContests,
  fetchPastContests,
  fetchGlobalRankings,
} from "@/api/contest";
import type { ContestListItem, GlobalRankingEntry } from "@/types/contest";
import { Trophy } from "lucide-vue-next";
import { useRouter, useRoute } from "vue-router";
import UpcomingContests from "./components/UpcomingContests.vue";
import GlobalRanking from "./components/GlobalRanking.vue";
import PastContests from "./components/PastContests.vue";

const router = useRouter();
const route = useRoute();

// State
const upcomingContests = ref<ContestListItem[]>([]);
const pastContests = ref<ContestListItem[]>([]);
const totalPastContests = ref(0);
const globalRankings = ref<GlobalRankingEntry[]>([]);
const loading = ref(true);
const loadingPast = ref(false);

const currentPage = ref(1);
const pageSize = 10;

const totalPages = computed(() =>
  Math.ceil(totalPastContests.value / pageSize)
);

// Load data
onMounted(async () => {
  try {
    const page = Number(route.query.page) || 1;
    currentPage.value = page;

    const [upcoming, pastRes, rankings] = await Promise.all([
      fetchUpcomingContests(),
      fetchPastContests(page, pageSize),
      fetchGlobalRankings(),
    ]);
    upcomingContests.value = upcoming;
    pastContests.value = pastRes.data;
    totalPastContests.value = pastRes.total;
    globalRankings.value = rankings;
  } catch (error) {
    console.error("Failed to load contest data:", error);
  } finally {
    loading.value = false;
  }
});

// Watch pagination changes
watch(currentPage, async (newPage) => {
  loadingPast.value = true;
  try {
    const res = await fetchPastContests(newPage, pageSize);
    pastContests.value = res.data;
    totalPastContests.value = res.total;
    // Update URL Query
    router.replace({ query: { ...route.query, page: newPage } });
  } catch (error) {
    console.error("Failed to load past contests:", error);
  } finally {
    loadingPast.value = false;
  }
});
</script>

<template>
  <div class="container mx-auto max-w-[1200px] space-y-8 py-8">
    <div class="space-y-4 text-center">
      <div class="flex items-center justify-center gap-3">
        <Trophy class="h-16 w-16 text-yellow-500" />
        <h1
          class="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-500 to-orange-500"
        >
          UltiCode Contest
        </h1>
      </div>
      <p class="text-lg text-muted-foreground">
        Join weekly contests and improve your global ranking
      </p>
    </div>

    <div v-if="loading" class="py-20 text-center">
      <p class="text-muted-foreground">Loading...</p>
    </div>

    <div v-else class="space-y-8">
      <!-- Upcoming Contests Top Section -->
      <UpcomingContests :contests="upcomingContests" />

      <!-- Main Grid: Left Ranking, Right Past Contests -->
      <div class="grid gap-8 lg:grid-cols-3">
        <!-- LEFT: Ranking -->
        <GlobalRanking :rankings="globalRankings" />

        <!-- RIGHT: Past Contests -->
        <PastContests
          :contests="pastContests"
          :loading="loadingPast"
          v-model:currentPage="currentPage"
          :totalPages="totalPages"
        />
      </div>
    </div>
  </div>
</template>
