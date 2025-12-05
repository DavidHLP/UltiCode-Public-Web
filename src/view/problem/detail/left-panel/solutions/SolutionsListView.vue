<script setup lang="ts">
import { computed, ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import type { SolutionFeedItem } from "@/types/solution";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import SolutionsCard from "./components/SolutionsCard.vue";
import Separator from "@/components/ui/separator/Separator.vue";
import Badge from "@/components/ui/badge/Badge.vue";
import {
  Search,
  Plus,
  PenLine,
  ArrowDownAZ,
  Check,
  Lightbulb,
} from "lucide-vue-next";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
} from "@/components/ui/empty";

const props = defineProps<{
  items: SolutionFeedItem[];
  followUp: string;
  sortOptions: Array<{ label: string; value: string }>;
}>();

const emit = defineEmits<{
  select: [item: SolutionFeedItem];
}>();

const router = useRouter();
const route = useRoute();

const search = ref("");
const languageFilter = ref("all");
const sortBy = ref("likes");

const sortOptions = computed(() =>
  props.sortOptions.length
    ? props.sortOptions
    : [
        { label: "Most liked", value: "likes" },
        { label: "Most recent", value: "newest" },
      ],
);

const feedItems = computed<SolutionFeedItem[]>(() => props.items ?? []);

// 从题解数据中实时提取语言选项
const languageOptions = computed(() => {
  const languages = new Set<string>();
  feedItems.value.forEach((item) => {
    if (item.language) {
      languages.add(item.language);
    }
  });

  return Array.from(languages)
    .sort()
    .map((lang) => ({
      label: lang,
      value: lang.toLowerCase(),
    }));
});

const filteredItems = computed(() => {
  const query = search.value.trim().toLowerCase();
  return feedItems.value.filter((item) => {
    const matchesLanguage =
      languageFilter.value === "all" ||
      item.languageFilter === languageFilter.value ||
      item.language.toLowerCase() === languageFilter.value;
    const matchesQuery =
      !query ||
      [item.highlight, item.author.name, item.content]
        .join(" ")
        .toLowerCase()
        .includes(query);
    return matchesLanguage && matchesQuery;
  });
});

const sortedItems = computed(() => {
  const items = [...filteredItems.value];
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

const handleCreateSolution = () => {
  const problemId = route.params.id || "1";
  router.push({ name: "solution-create", params: { id: problemId } });
};
</script>

<template>
  <section class="relative flex h-full w-full flex-col overflow-hidden">
    <!-- Header 区域 -->
    <header class="flex flex-col border-b border-border">
      <!-- 顶部搜索和排序栏 -->
      <div class="flex items-center gap-2 px-3 py-2">
        <!-- 搜索框 -->
        <div class="relative flex-1">
          <Search
            class="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
          />
          <Input
            v-model="search"
            placeholder="Search solutions"
            class="h-8 pl-8 text-xs"
          />
        </div>

        <!-- 排序按钮 -->
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button variant="outline" size="sm" class="gap-1.5 text-xs">
              <ArrowDownAZ class="h-4 w-4" />
              Sort
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              v-for="option in sortOptions"
              :key="option.value"
              @click="sortBy = option.value"
            >
              {{ option.label }}
              <Check v-if="sortBy === option.value" class="ml-auto h-4 w-4" />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <!-- 语言标签过滤栏 -->
      <div
        class="relative w-full overflow-hidden px-3 py-1.5 lc-md:px-2 lc-md:py-1"
      >
        <div
          class="flex w-full items-center gap-1.5 overflow-x-auto scrollbar-hide"
        >
          <Badge
            variant="secondary"
            class="lc-md:px-1.5 lc-md:py-0.5 inline-flex cursor-pointer items-center flex-shrink-0 gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium transition-colors"
            :class="
              languageFilter === 'all'
                ? 'bg-gray-100 dark:bg-gray-100 text-foreground dark:text-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            "
            @click="languageFilter = 'all'"
          >
            All
          </Badge>
          <Badge
            v-for="option in languageOptions.filter(
              (opt) => opt.value !== 'all',
            )"
            :key="option.value"
            translate="no"
            variant="secondary"
            class="lc-md:px-1.5 lc-md:py-0.5 inline-flex cursor-pointer items-center flex-shrink-0 gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium transition-colors"
            :class="
              languageFilter === option.value
                ? 'bg-primary/10 text-primary hover:bg-primary/20'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            "
            @click="languageFilter = option.value"
          >
            {{ option.label }}
          </Badge>
        </div>
      </div>

      <!-- 提交统计和操作栏 -->
      <div class="mx-3 mb-1.5 lc-md:mx-2 lc-md:mb-1">
        <div
          class="bg-gray-100 dark:bg-gray-800 flex items-center justify-between gap-2 rounded-lg p-1.5 lc-md:p-1"
        >
          <div class="flex items-center gap-1.5 flex-1 min-w-0">
            <div
              class="rounded-full bg-opacity-100 p-0.5 bg-fill-primary dark:bg-fill-primary flex-shrink-0"
            >
              <Plus
                class="h-2.5 w-2.5 text-text-primary dark:text-text-primary"
              />
            </div>
            <span class="text-[11px] leading-tight">
              Your last submission beats
              <span class="font-semibold text-green-600 dark:text-green-400"
                >17%</span
              >
              of users
            </span>
          </div>
          <button
            class="flex h-5 flex-shrink-0 items-center gap-0.5 rounded bg-green-600 px-2 py-0.5 text-[11px] font-medium text-white shadow-sm transition-all hover:bg-green-600/90 hover:shadow active:bg-green-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50"
            @click="handleCreateSolution"
          >
            <PenLine class="h-2.5 w-2.5" />
            Write Solution
          </button>
        </div>
      </div>
    </header>

    <!-- 题解列表 -->
    <div class="flex-1 overflow-y-auto">
      <div class="py-3">
        <div v-if="sortedItems.length" class="flex flex-col">
          <div
            v-for="(item, index) in sortedItems"
            :key="item.id"
            class="flex flex-col"
          >
            <div class="px-3">
              <SolutionsCard :item="item" @select="handleSelect" />
            </div>
            <Separator v-if="index < sortedItems.length - 1" class="my-2" />
          </div>
        </div>
        <Empty class="mx-3 bg-muted/30 px-6 py-8">
          <EmptyContent>
            <EmptyMedia variant="icon">
              <Lightbulb class="h-6 w-6 text-muted-foreground" />
            </EmptyMedia>
            <EmptyHeader>
              <p class="text-base font-semibold text-foreground">
                No solutions yet
              </p>
              <EmptyDescription>
                Share your approach to help others understand this problem.
              </EmptyDescription>
            </EmptyHeader>
          </EmptyContent>
        </Empty>
      </div>
    </div>
  </section>
</template>
