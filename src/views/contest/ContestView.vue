<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import { Trophy } from "lucide-vue-next";
import { useRouter, useRoute } from "vue-router";
import { useContestStore } from "@/stores/contest";
import { storeToRefs } from "pinia";
import UpcomingContests from "./components/UpcomingContests.vue";
import GlobalRanking from "./components/GlobalRanking.vue";
import PastContests from "./components/PastContests.vue";
import MyContests from "./components/MyContests.vue";

const router = useRouter();
const route = useRoute();
const contestStore = useContestStore();

defineProps<{
  tab?: string;
}>();

// Use store state
const {
  upcomingContests,
  pastContests,
  pastContestsTotal,
  globalRankings,
  loading,
  loadingContests,
} = storeToRefs(contestStore);

const currentPage = ref(1);
const pageSize = 10;

const totalPages = computed(() =>
  Math.ceil(pastContestsTotal.value / pageSize),
);

// Load data
onMounted(async () => {
  try {
    const page = Number(route.query.page) || 1;
    currentPage.value = page;

    await Promise.all([
      contestStore.loadContests(),
      contestStore.loadPastContests(page, pageSize),
      contestStore.loadGlobalRankings(),
    ]);
  } catch (error) {
    console.error("Failed to load contest data:", error);
  }
});

// Watch pagination changes
watch(currentPage, async (newPage) => {
  try {
    await contestStore.loadPastContests(newPage, pageSize);
    // Update URL Query
    router.replace({ query: { ...route.query, page: newPage } });
  } catch (error) {
    console.error("Failed to load past contests:", error);
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
      <!-- Home View -->
      <template v-if="!tab">
        <UpcomingContests :contests="upcomingContests" />
        <div class="grid gap-8 lg:grid-cols-3">
          <GlobalRanking :rankings="globalRankings" />
          <PastContests
            :contests="pastContests"
            :loading="loadingContests"
            v-model:currentPage="currentPage"
            :totalPages="totalPages"
          />
        </div>
      </template>

      <!-- Past Contests View -->
      <template v-else-if="tab === 'past'">
        <PastContests
          :contests="pastContests"
          :loading="loadingContests"
          v-model:currentPage="currentPage"
          :totalPages="totalPages"
          class="lg:col-span-3"
        />
      </template>

      <!-- Rankings View -->
      <template v-else-if="tab === 'ranking'">
        <GlobalRanking :rankings="globalRankings" class="lg:col-span-3" />
      </template>

      <!-- My Contests View -->
      <template v-else-if="tab === 'my'">
        <MyContests />
      </template>
    </div>
  </div>
</template>
