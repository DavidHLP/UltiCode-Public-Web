<script setup lang="ts">
import { computed, ref } from "vue";
import type { SolutionFeedItem } from "@/mocks/schema/solution";
import { Input } from "@/components/ui/input";
import Menubar from "@/components/ui/menubar/Menubar.vue";
import MenubarContent from "@/components/ui/menubar/MenubarContent.vue";
import MenubarItem from "@/components/ui/menubar/MenubarItem.vue";
import MenubarMenu from "@/components/ui/menubar/MenubarMenu.vue";
import MenubarTrigger from "@/components/ui/menubar/MenubarTrigger.vue";
import SolutionsCard from "./SolutionsCard.vue";
import Separator from "@/components/ui/separator/Separator.vue";
import { ArrowDownUp, Search, SlidersHorizontal } from "lucide-vue-next";

const props = defineProps<{
  items: SolutionFeedItem[];
  followUp: string;
  languageOptions: Array<{ label: string; value: string }>;
  topicOptions: Array<{ label: string; value: string }>;
  quickFilterOptions: Array<{ label: string; value: string }>;
  sortOptions: Array<{ label: string; value: string }>;
}>();

const emit = defineEmits<{
  select: [item: SolutionFeedItem];
}>();

const search = ref("");
const languageFilter = ref("all");
const topicFilter = ref("all");
const quickFilter = ref("popular");
const sortBy = ref("likes");

const quickFilterOptions = computed(() =>
  props.quickFilterOptions.length
    ? props.quickFilterOptions
    : [
        { label: "Popular", value: "popular" },
        { label: "Latest", value: "latest" },
      ],
);
const sortOptions = computed(() =>
  props.sortOptions.length
    ? props.sortOptions
    : [
        { label: "Most liked", value: "likes" },
        { label: "Most recent", value: "newest" },
      ],
);

const feedItems = computed<SolutionFeedItem[]>(() => props.items ?? []);

const languageOptions = computed(() =>
  props.languageOptions.length
    ? props.languageOptions
    : [
        { label: "All languages", value: "all" },
        { label: "Unknown", value: "unknown" },
      ],
);
const topicOptions = computed(() =>
  props.topicOptions.length
    ? props.topicOptions
    : [
        { label: "All topics", value: "all" },
        { label: "General", value: "general" },
      ],
);

const filteredItems = computed(() => {
  const query = search.value.trim().toLowerCase();
  return feedItems.value.filter((item) => {
    const matchesLanguage =
      languageFilter.value === "all" ||
      item.languageFilter === languageFilter.value ||
      item.language.toLowerCase() === languageFilter.value;
    const matchesTopic =
      topicFilter.value === "all" || item.topic === topicFilter.value;
    const matchesQuery =
      !query ||
      [item.title, item.highlight, item.summary, item.author.name]
        .join(" ")
        .toLowerCase()
        .includes(query);
    return matchesLanguage && matchesTopic && matchesQuery;
  });
});

const orderedItems = computed(() => {
  const items = [...filteredItems.value];
  if (quickFilter.value === "popular") {
    return items.sort((a, b) => b.score - a.score);
  }
  if (quickFilter.value === "latest") {
    return items;
  }
  if (quickFilter.value === "editor") {
    return items.sort((a, b) => b.stats.likes - a.stats.likes);
  }
  return items;
});

const sortedItems = computed(() => {
  const items = [...orderedItems.value];
  switch (sortBy.value) {
    case "likes":
      return items.sort((a, b) => b.stats.likes - a.stats.likes);
    case "heat":
      return items.sort((a, b) => b.score - a.score);
    case "newest":
      return items.sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
      );
    case "oldest":
      return items.sort(
        (a, b) =>
          new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime(),
      );
    default:
      return items;
  }
});

const handleSelect = (item: SolutionFeedItem) => {
  emit("select", item);
};
</script>

<template>
  <section class="space-y-5">
    <div class="bg-card">
      <header class="space-y-4 px-5 py-4">
        <div class="flex flex-wrap items-center gap-3">
          <div class="relative flex-1">
            <Search
              class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              v-model="search"
              placeholder="Search solutions, authors, or keywords"
              class="pl-9"
            />
          </div>
          <div class="ml-auto flex flex-wrap items-center gap-2">
            <Menubar class="border-border">
              <MenubarMenu>
                <MenubarTrigger
                  class="flex items-center gap-2 px-3 py-1 text-xs"
                >
                  <ArrowDownUp class="size-4" />
                  Sort
                </MenubarTrigger>
                <MenubarContent class="min-w-[160px] p-1">
                  <MenubarItem
                    v-for="option in sortOptions"
                    :key="option.value"
                    class="flex items-center justify-between px-2 py-1 text-xs"
                    @click="sortBy = option.value"
                  >
                    <span>{{ option.label }}</span>
                    <span v-if="sortBy === option.value" class="text-primary"
                      >●</span
                    >
                  </MenubarItem>
                </MenubarContent>
              </MenubarMenu>
            </Menubar>
            <Menubar class="border-border">
              <MenubarMenu>
                <MenubarTrigger
                  class="flex items-center gap-2 px-3 py-1 text-xs"
                >
                  <SlidersHorizontal class="size-4" />
                  Filter
                </MenubarTrigger>
                <MenubarContent class="min-w-[160px] p-1">
                  <MenubarItem
                    v-for="option in quickFilterOptions"
                    :key="option.value"
                    class="flex items-center justify-between px-2 py-1 text-xs"
                    @click="quickFilter = option.value"
                  >
                    <span>{{ option.label }}</span>
                    <span
                      v-if="quickFilter === option.value"
                      class="text-primary"
                      >●</span
                    >
                  </MenubarItem>
                </MenubarContent>
              </MenubarMenu>
            </Menubar>
          </div>
        </div>

        <div class="space-y-2 text-xs">
          <div class="flex flex-wrap gap-2">
            <button
              v-for="option in languageOptions"
              :key="option.value"
              type="button"
              class="border px-3 py-1 transition-colors"
              :class="[
                option.value === languageFilter
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-transparent bg-muted text-muted-foreground hover:text-foreground',
              ]"
              @click="languageFilter = option.value"
            >
              {{ option.label }}
            </button>
          </div>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="option in topicOptions"
              :key="option.value"
              type="button"
              class="bg-muted px-3 py-1 font-medium transition-colors"
              :class="
                option.value === topicFilter ? 'bg-primary/10 text-primary' : ''
              "
              @click="topicFilter = option.value"
            >
              {{ option.label }}
            </button>
          </div>
        </div>
      </header>

      <div class="px-5 py-4">
        <div v-if="sortedItems.length" class="flex flex-col gap-3">
          <div v-for="item in sortedItems" :key="item.id" class="flex flex-col">
            <SolutionsCard :item="item" @select="handleSelect" />
            <Separator class="my-2" />
          </div>
        </div>
        <div
          v-else
          class="flex flex-col items-center gap-2 rounded-2xl bg-muted/30 px-6 py-10 text-center"
        >
          <p class="text-base font-medium text-foreground">No solutions yet</p>
          <p class="text-sm text-muted-foreground">
            Share your approach to help others understand this problem.
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
