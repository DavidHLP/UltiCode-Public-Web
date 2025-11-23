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
import Badge from "@/components/ui/badge/Badge.vue";
import { Search, Plus, PenLine, ArrowDownAZ } from "lucide-vue-next";

const props = defineProps<{
  items: SolutionFeedItem[];
  followUp: string;
  sortOptions: Array<{ label: string; value: string }>;
}>();

const emit = defineEmits<{
  select: [item: SolutionFeedItem];
}>();

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
      [item.title, item.highlight, item.summary, item.author.name]
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
</script>

<template>
  <section class="relative flex h-full w-full flex-col overflow-hidden">
    <div class="flex flex-col gap-2 pb-[1px]">
      <!-- 搜索栏和工具栏 -->
      <div class="lc-md:pl-2 lc-md:pr-1 lc-md:h-8 flex h-10 items-center justify-between gap-2.5 border-b py-1 pl-4 pr-3 border-border">
        <!-- 搜索框 -->
        <div class="relative rounded-md w-full">
          <div class="text-muted-foreground absolute inset-y-0 flex items-center pointer-events-none left-0 pl-0.5">
            <Search class="w-4 h-4" />
          </div>
          <Input
            v-model="search"
            placeholder="搜索"
            class="block w-full rounded-md outline-none border-none pr-3 bg-transparent py-1 pl-[22px] leading-4 focus:bg-transparent"
          />
        </div>

        <!-- 工具按钮组 -->
        <div class="flex items-center gap-1">
          <!-- 排序按钮 -->
          <Menubar class="border-none">
            <MenubarMenu>
              <MenubarTrigger
                class="flex items-center text-left cursor-pointer focus:outline-none whitespace-nowrap rounded-[4px] px-1 py-0.5 text-sm text-muted-foreground hover:text-foreground bg-transparent"
              >
                <ArrowDownAZ class="w-4 h-4 mr-2" />
                排序
              </MenubarTrigger>
              <MenubarContent class="min-w-[160px] p-1">
                <MenubarItem
                  v-for="option in sortOptions"
                  :key="option.value"
                  class="flex items-center justify-between px-2 py-1 text-xs"
                  @click="sortBy = option.value"
                >
                  <span>{{ option.label }}</span>
                  <span v-if="sortBy === option.value" class="text-primary">●</span>
                </MenubarItem>
              </MenubarContent>
            </MenubarMenu>
          </Menubar>
        </div>
      </div>

      <!-- 语言标签过滤 -->
      <div class="relative w-full overflow-hidden px-4 pb-2">
        <div class="flex w-full items-start gap-2 pr-6 overflow-hidden">
          <Badge
            variant="secondary"
            class="lc-md:px-2 lc-md:py-[3px] inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-[6px] text-xs"
            :class="languageFilter === 'all' ? 'bg-gray-100 dark:bg-gray-100 text-foreground dark:text-foreground' : 'bg-secondary text-secondary-foreground'"
            @click="languageFilter = 'all'"
          >
            不限
          </Badge>
          <div class="flex flex-1 gap-2">
            <Badge
              v-for="option in languageOptions.filter(opt => opt.value !== 'all')"
              :key="option.value"
              translate="no"
              variant="secondary"
              class="lc-md:px-2 lc-md:py-[3px] inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-[6px] text-xs bg-secondary text-secondary-foreground"
              :class="languageFilter === option.value && 'bg-primary/10 text-primary'"
              @click="languageFilter = option.value"
            >
              {{ option.label }}
            </Badge>
          </div>
        </div>
      </div>

      <!-- 提交统计提示框 -->
      <div class="bg-gray-100 dark:bg-gray-800 mx-4 flex items-center justify-between gap-2 rounded-[10px] p-2">
        <div class="flex items-center gap-2">
          <div class="rounded-full bg-opacity-100 p-0.5 bg-fill-primary dark:bg-fill-primary">
            <Plus class="h-4 w-4 text-text-primary dark:text-text-primary" />
          </div>
          <span class="flex-1 text-xs">
            你最近一次提交运行时间超过了 
            <span class="font-medium text-green-600 dark:text-green-400">17%</span> 
            的用户
          </span>
        </div>
        <button 
          class="relative justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-green-600 text-white hover:bg-green-600/80 rounded flex h-6 flex-none items-center gap-1 px-2 py-1 text-xs"
        >
          <PenLine class="h-3.5 w-3.5" />
          发布题解
        </button>
      </div>
    </div>

    <!-- 题解列表 -->
    <div class="flex-1 overflow-y-auto">
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
