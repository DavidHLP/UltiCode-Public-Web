<script setup lang="ts">
import type {
  ForumFlairType,
  ForumPost,
  ForumCommunity,
  ForumCommunityRule,
  ForumCommunityLink,
} from "@/types/forum";
import ForumPostCard from "@/views/forum/components/ForumPostCard.vue";
import ForumPostSkeleton from "@/views/forum/components/ForumPostSkeleton.vue";
import ForumSidebar from "@/views/forum/components/ForumSidebar.vue";
import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";
import {
  fetchForumCommunities,
  fetchForumCommunity,
  fetchCommunityPosts,
  fetchForumPosts,
  fetchForumQuickFilters,
} from "@/api/forum";

const posts = ref<ForumPost[]>([]);
const communities = ref<ForumCommunity[]>([]);
const quickFilters = ref<Array<{ label: string; value: string }>>([]);
const currentCommunity = ref<ForumCommunity | null>(null);
const communityRules = ref<ForumCommunityRule[]>([]);
const communityLinks = ref<ForumCommunityLink[]>([]);
const isLoading = ref(true);

const props = defineProps<{
  filter?: string;
}>();

const route = useRoute();
const searchQuery = ref("");
const quickFilter = ref(props.filter || "hot");
const selectedCommunity = ref("all");
const selectedFlair = ref<"all" | ForumFlairType>("all");

// Load all posts and communities on mount
async function loadAllPosts() {
  isLoading.value = true;
  try {
    const [postRows, communityRows, filters] = await Promise.all([
      fetchForumPosts(),
      fetchForumCommunities(),
      fetchForumQuickFilters(),
    ]);
    posts.value = postRows;
    communities.value = communityRows;
    quickFilters.value = filters;
    currentCommunity.value = null;
    communityRules.value = [];
    communityLinks.value = [];
  } catch (error) {
    console.error("Failed to load forum data", error);
    posts.value = [];
    communities.value = [];
    quickFilters.value = [];
  } finally {
    isLoading.value = false;
  }
}

// Load posts for a specific community
async function loadCommunityPosts(slug: string) {
  isLoading.value = true;
  try {
    const [communityPosts, communityData] = await Promise.all([
      fetchCommunityPosts(slug, {
        sortBy: quickFilter.value as "hot" | "new" | "top",
      }),
      fetchForumCommunity(slug),
    ]);
    posts.value = communityPosts;
    currentCommunity.value = communityData.community;
    communityRules.value = communityData.rules;
    communityLinks.value = communityData.links;
  } catch (error) {
    console.error("Failed to load community posts", error);
    posts.value = [];
    currentCommunity.value = null;
  } finally {
    isLoading.value = false;
  }
}

// Watch for category changes in route
watch(
  () => route.params.category,
  async (newCategory) => {
    if (newCategory) {
      selectedCommunity.value = String(newCategory);
      await loadCommunityPosts(String(newCategory));
    } else {
      selectedCommunity.value = "all";
      await loadAllPosts();
    }
  },
  { immediate: true },
);

// Check props for filter
watch(
  () => props.filter,
  (newFilter: string | undefined) => {
    if (newFilter) {
      quickFilter.value = newFilter;
    }
  },
  { immediate: true },
);

const filteredPosts = computed(() => {
  const normalizedSearch = searchQuery.value.trim().toLowerCase();
  return posts.value.filter((post) => {
    const matchesSearch =
      !normalizedSearch ||
      post.title.toLowerCase().includes(normalizedSearch) ||
      post.excerpt?.toLowerCase().includes(normalizedSearch) ||
      (Array.isArray(post.tags) &&
        post.tags.some((tag: string) =>
          tag.toLowerCase().includes(normalizedSearch),
        ));

    const matchesFlair =
      selectedFlair.value === "all" || post.flair?.type === selectedFlair.value;

    return matchesSearch && matchesFlair;
  });
});

const sortedPosts = computed(() => {
  const postsArray = [...filteredPosts.value];
  const sorters: Record<string, (a: ForumPost, b: ForumPost) => number> = {
    hot: (a, b) => (b.stats?.score ?? 0) - (a.stats?.score ?? 0),
    new: (a, b) =>
      new Date(b.createdAt).valueOf() - new Date(a.createdAt).valueOf(),
    top: (a, b) => (b.stats?.saves ?? 0) - (a.stats?.saves ?? 0),
    rising: (a, b) => (b.stats?.shares ?? 0) - (a.stats?.shares ?? 0),
  };

  const sorter = sorters[quickFilter.value] ?? sorters.hot;
  postsArray.sort(sorter);

  const pinned = postsArray.filter((post) => post.isPinned);
  const rest = postsArray.filter((post) => !post.isPinned);

  return [...pinned, ...rest];
});
</script>

<template>
  <div class="mx-auto flex w-full max-w-5xl items-start gap-6 px-4 py-8">
    <!-- Main Feed -->
    <main class="w-full min-w-0 flex-1 space-y-4">
      <div v-if="isLoading" class="space-y-4">
        <ForumPostSkeleton v-for="i in 3" :key="i" />
      </div>
      <div v-else class="space-y-4">
        <ForumPostCard
          v-for="post in sortedPosts"
          :key="post.id"
          :post="post"
        />
      </div>
    </main>

    <!-- Right Sidebar -->
    <ForumSidebar
      :community="currentCommunity"
      :rules="communityRules"
      :links="communityLinks"
    />
  </div>
</template>
