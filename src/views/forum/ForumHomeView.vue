<script setup lang="ts">
import type { ForumFlairType, ForumPost, ForumCommunity } from "@/types/forum";
import ForumPostCard from "@/views/forum/components/ForumPostCard.vue";
import ForumPostSkeleton from "@/views/forum/components/ForumPostSkeleton.vue";
import { computed, onMounted, ref } from "vue";
import {
  fetchForumCommunities,
  fetchForumPosts,
  fetchForumQuickFilters,
} from "@/api/forum";

const posts = ref<ForumPost[]>([]);
const communities = ref<ForumCommunity[]>([]);
const quickFilters = ref<Array<{ label: string; value: string }>>([]);
const isLoading = ref(true);

onMounted(async () => {
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
  } catch (error) {
    console.error("Failed to load forum data", error);
    posts.value = [];
    communities.value = [];
    quickFilters.value = [];
  } finally {
    isLoading.value = false;
  }
});

const searchQuery = ref("");
const quickFilter = ref("hot");
const selectedCommunity = ref("all");
const selectedFlair = ref<"all" | ForumFlairType>("all");
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

    const matchesCommunity =
      selectedCommunity.value === "all" ||
      post.community?.slug === selectedCommunity.value;

    const matchesFlair =
      selectedFlair.value === "all" || post.flair?.type === selectedFlair.value;

    return matchesSearch && matchesCommunity && matchesFlair;
  });
});

const sortedPosts = computed(() => {
  const posts = [...filteredPosts.value];
  const sorters: Record<string, (a: ForumPost, b: ForumPost) => number> = {
    hot: (a, b) => (b.stats?.score ?? 0) - (a.stats?.score ?? 0),
    new: (a, b) =>
      new Date(b.createdAt).valueOf() - new Date(a.createdAt).valueOf(),
    top: (a, b) => (b.stats?.saves ?? 0) - (a.stats?.saves ?? 0),
    rising: (a, b) => (b.stats?.shares ?? 0) - (a.stats?.shares ?? 0),
  };

  const sorter = sorters[quickFilter.value] ?? sorters.hot;
  posts.sort(sorter);

  const pinned = posts.filter((post) => post.isPinned);
  const rest = posts.filter((post) => !post.isPinned);

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
    <sider class="hidden w-[312px] flex-none space-y-4 lg:block">
      <!-- Community sidebar placeholder -->
      <div
        class="overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm"
      >
        <div class="bg-muted/50 p-4 font-medium">About Community</div>
        <div class="p-4 text-sm text-muted-foreground">
          <p>
            Welcome to the forum! Discuss related topics and share your
            thoughts.
          </p>
          <div class="mt-4 flex flex-col gap-2">
            <div class="flex justify-between text-xs">
              <span>Created</span>
              <span class="font-medium">Dec 11, 2025</span>
            </div>
          </div>
        </div>
      </div>
    </sider>
  </div>
</template>
