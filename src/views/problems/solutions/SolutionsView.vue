<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type { SolutionFeedItem } from "@/types/solution";
import SolutionsListView from "./SolutionsListView.vue";
import SolutionsDetail from "./components/SolutionsDetail.vue";
import { fetchSolutionFeed } from "@/api/solution";

const props = defineProps<{
  problemId: number;
  followUp: string;
}>();

const emit = defineEmits<{
  select: [item: SolutionFeedItem];
}>();

const selectedSolution = ref<SolutionFeedItem | null>(null);
const isLoading = ref(true);
const feed = ref<Awaited<ReturnType<typeof fetchSolutionFeed>> | null>(null);

watch(
  () => props.problemId,
  async (id) => {
    if (!id) {
      feed.value = null;
      return;
    }
    isLoading.value = true;
    try {
      feed.value = await fetchSolutionFeed(id);
    } catch (error) {
      console.error("Failed to load solution feed", error);
      feed.value = null;
    } finally {
      isLoading.value = false;
    }
  },
  { immediate: true },
);
const fallbackSolution = computed<SolutionFeedItem>(() => ({
  id: "follow-up",
  title: "Follow-up Insight",
  summary: props.followUp,
  highlight: "Follow-up discussion",
  flair: "",
  badges: [],
  authorId: "author-fallback",
  author: {
    id: "author-fallback",
    name: "Editorial",
    username: "editorial",
    role: "System Note",
    avatarColor: "#94a3b8",
  },
  tags: [],
  stats: {
    likes: 0,
    dislikes: 0,
    views: 0,
    comments: 0,
  },
  views: 0,
  votes: 0,
  likes: 0,
  comments: 0,
  created_at: "—",
  publishedAt: new Date().toISOString(),
  topic: {
    id: "general",
    name: "General",
  },
  languageFilter: "all",
  language: "markdown",
  score: 0,
  content: props.followUp, // Markdown 内容
}));

const handleSelect = (item: SolutionFeedItem) => {
  selectedSolution.value = item;
  emit("select", item);
};

const resetSelectedSolution = () => {
  selectedSolution.value = null;
};
</script>

<template>
  <div v-if="feed?.items?.length" class="space-y-4">
    <div v-if="selectedSolution" class="space-y-4 px-5 py-4">
      <button
        type="button"
        class="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition hover:text-foreground"
        @click="resetSelectedSolution"
      >
        &larr; Return solution list
      </button>
      <SolutionsDetail :item="selectedSolution" />
    </div>
    <SolutionsListView
      v-else
      :items="feed?.items ?? []"
      :follow-up="props.followUp"
      :sort-options="feed?.sortOptions ?? []"
      @select="handleSelect"
    />
  </div>
  <div v-else>
    <div v-if="isLoading" class="px-5 py-4 text-sm text-muted-foreground">
      Loading solutions…
    </div>
    <SolutionsDetail v-else :item="fallbackSolution" />
  </div>
</template>
