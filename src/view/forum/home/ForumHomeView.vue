<script setup lang="ts">
import type {
  ForumFlairType,
  ForumPost,
  ForumCommunity,
  ForumModerator,
  ForumTrendingTopic,
} from "@/types/forum";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { ChevronsUpDown } from "lucide-vue-next";
import ForumPostCard from "@/view/forum/home/components/ForumPostCard.vue";
import ForumSidebar from "@/view/forum/home/components/ForumSidebar.vue";
import ForumPostSkeleton from "@/view/forum/components/ForumPostSkeleton.vue";
import { computed, onMounted, ref } from "vue";
import {
  fetchForumCommunities,
  fetchForumModerators,
  fetchForumPosts,
  fetchForumQuickFilters,
  fetchForumTrendingTopics,
} from "@/api/forum";

const posts = ref<ForumPost[]>([]);
const trendingTopics = ref<ForumTrendingTopic[]>([]);
const communities = ref<ForumCommunity[]>([]);
const moderators = ref<ForumModerator[]>([]);
const quickFilters = ref<Array<{ label: string; value: string }>>([]);
const isLoading = ref(true);

onMounted(async () => {
  isLoading.value = true;
  try {
    const [postRows, topicRows, communityRows, moderatorRows, filters] =
      await Promise.all([
        fetchForumPosts(),
        fetchForumTrendingTopics(),
        fetchForumCommunities(),
        fetchForumModerators(),
        fetchForumQuickFilters(),
      ]);
    posts.value = postRows;
    trendingTopics.value = topicRows;
    communities.value = communityRows;
    moderators.value = moderatorRows;
    quickFilters.value = filters;
  } catch (error) {
    console.error("Failed to load forum data", error);
    posts.value = [];
    trendingTopics.value = [];
    communities.value = [];
    moderators.value = [];
    quickFilters.value = [];
  } finally {
    isLoading.value = false;
  }
});

const searchQuery = ref("");
const quickFilter = ref("hot");
const selectedCommunity = ref("all");
const selectedFlair = ref<"all" | ForumFlairType>("all");
const quickFilterLabel = computed(() => {
  return (
    (
      {
        hot: "Hot",
        new: "New",
        top: "Top",
        rising: "Rising",
      } as Record<string, string>
    )[quickFilter.value] ?? "Hot"
  );
});
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
      post.community.slug === selectedCommunity.value;

    const matchesFlair =
      selectedFlair.value === "all" || post.flair?.type === selectedFlair.value;

    return matchesSearch && matchesCommunity && matchesFlair;
  });
});

const sortedPosts = computed(() => {
  const posts = [...filteredPosts.value];
  const sorters: Record<string, (a: ForumPost, b: ForumPost) => number> = {
    hot: (a, b) => b.stats.score - a.stats.score,
    new: (a, b) =>
      new Date(b.createdAt).valueOf() - new Date(a.createdAt).valueOf(),
    top: (a, b) => b.stats.saves - a.stats.saves,
    rising: (a, b) => b.stats.shares - a.stats.shares,
  };

  const sorter = sorters[quickFilter.value] ?? sorters.hot;
  posts.sort(sorter);

  const pinned = posts.filter((post) => post.isPinned);
  const rest = posts.filter((post) => !post.isPinned);

  return [...pinned, ...rest];
});
</script>

<template>
  <ScrollArea class="h-full">
    <div class="mx-auto w-full max-w-6xl space-y-8 px-4 lg:px-10">
      <div class="grid gap-8 xl:grid-cols-[minmax(0,1fr)_300px]">
        <Card class="border-none bg-transparent p-0 shadow-none">
          <CardHeader class="space-y-3 border-none px-0 pb-0">
            <div
              class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
            >
              <DropdownMenu>
                <DropdownMenuTrigger as-child>
                  <Button variant="outline" class="gap-2">
                    Sort: {{ quickFilterLabel }}
                    <ChevronsUpDown class="h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent class="w-40">
                  <DropdownMenuRadioGroup v-model:value="quickFilter">
                    <DropdownMenuRadioItem value="hot"
                      >Hot</DropdownMenuRadioItem
                    >
                    <DropdownMenuRadioItem value="new"
                      >New</DropdownMenuRadioItem
                    >
                    <DropdownMenuRadioItem value="top"
                      >Top</DropdownMenuRadioItem
                    >
                    <DropdownMenuRadioItem value="rising"
                      >Rising</DropdownMenuRadioItem
                    >
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
              <form
                class="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center"
              >
                <Input
                  v-model="searchQuery"
                  placeholder="Search threads"
                  class="w-full sm:w-64"
                />
              </form>
            </div>
            <div
              class="flex items-center justify-between text-sm text-muted-foreground"
            >
              <p class="flex items-center gap-1">
                Showing
                <span class="font-semibold text-foreground">{{
                  sortedPosts.length
                }}</span>
                threads
              </p>
              <Button
                variant="ghost"
                size="sm"
                class="h-auto px-2 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary hover:text-primary"
              >
                Subscribe RSS
              </Button>
            </div>
          </CardHeader>
          <CardContent class="space-y-6 px-0">
            <div v-if="isLoading" class="space-y-6">
              <ForumPostSkeleton v-for="i in 3" :key="i" />
            </div>
            <div v-else class="space-y-6">
              <ForumPostCard
                v-for="post in sortedPosts"
                :key="post.id"
                :post="post"
              />
            </div>
          </CardContent>
        </Card>
        <ForumSidebar
          class="self-start xl:sticky xl:top-6"
          :trendingTopics="trendingTopics"
          :communities="communities"
          :moderators="moderators"
          :isLoading="isLoading"
        />
      </div>
    </div>
  </ScrollArea>
</template>
