<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useHeaderStore, type HeaderGroup, type LayoutNode } from "@/stores/headerStore";
import { storeToRefs } from "pinia";
import DynamicLayout from "./components/layout/DynamicLayout.vue";
import { Button } from "@/components/ui/button";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "@/components/ui/menubar";
import {
  Bookmark,
  ThumbsDown,
  ThumbsUp,
} from "lucide-vue-next";
import logoIcon from "@/ico/favicon.ico";

const headerStore = useHeaderStore();
const { layoutConfig } = storeToRefs(headerStore);
const { updateLayout } = headerStore;

// 模拟problem对象用于header显示
const problem = ref({
  likes: 12,
  dislikes: 3,
});

// 定义页面结构元数据 - 按照新的分组方式
const initialHeaderGroups: HeaderGroup[] = [
  {
    id: "problem-info",
    name: "题目信息",
    headers: [
      { id: 1, index: 0, title: "题目描述", icon: "FileText", color: "#1a1a1a", iconColor: "#007bff" },
      { id: 2, index: 1, title: "题解", icon: "FlaskConical", color: "#1a1a1a", iconColor: "#007bff" },
      { id: 3, index: 2, title: "提交记录", icon: "History", color: "#1a1a1a", iconColor: "#007bff" },
    ],
  },
  {
    id: "code-editor",
    name: "代码编辑器",
    headers: [
      { id: 4, index: 0, title: "代码", icon: "Code2", color: "#1a1a1a", iconColor: "#02b128" },
    ],
  },
  {
    id: "test-info",
    name: "测试信息",
    headers: [
      { id: 5, index: 0, title: "测试用例", icon: "SquareCheck", color: "#1a1a1a", iconColor: "#02b128" },
      { id: 6, index: 1, title: "测试结果", icon: "Terminal", color: "#1a1a1a", iconColor: "#02b128" },
    ],
  },
];

// 布局1: 编程练习布局 (左1 + 右(上1 + 下1))
const programmingLayout: LayoutNode = {
  id: 'programming-root',
  type: 'container',
  direction: 'horizontal',
  children: [
    {
      id: 'programming-left',
      type: 'leaf',
      size: 40,
      groupId: 'problem-info'
    },
    {
      id: 'programming-right',
      type: 'container',
      direction: 'vertical',
      size: 60,
      children: [
        {
          id: 'programming-right-top',
          type: 'leaf',
          size: 50,
          groupId: 'code-editor'
        },
        {
          id: 'programming-right-bottom',
          type: 'leaf',
          size: 50,
          groupId: 'test-info'
        }
      ]
    }
  ]
};

// 布局2: 平衡布局 (三列布局)
const balancedLayout: LayoutNode = {
  id: 'balanced-root',
  type: 'container',
  direction: 'horizontal',
  children: [
    {
      id: 'balanced-left',
      type: 'leaf',
      size: 30,
      groupId: 'problem-info'
    },
    {
      id: 'balanced-center',
      type: 'leaf',
      size: 40,
      groupId: 'code-editor'
    },
    {
      id: 'balanced-right',
      type: 'leaf',
      size: 30,
      groupId: 'test-info'
    }
  ]
};

// 初始化数据
onMounted(() => {
  headerStore.initData(initialHeaderGroups, programmingLayout);
});
</script>

<template>
  <div class="h-screen w-full flex flex-col">
    <!-- Header -->
    <nav
      class="relative flex h-12 w-full min-w-[100px] shrink-0 items-center justify-between gap-2 border-b bg-[#f0f0f0] px-2.5"
    >
      <Menubar
        class="flex h-8 min-w-[240px] flex-1 items-center gap-2 overflow-hidden border-none bg-transparent p-0 shadow-none"
      >
        <RouterLink to="/" class="mr-1 flex items-center gap-1">
          <img :src="logoIcon" alt="Ulticode" class="h-5 w-5" />
        </RouterLink>
        <span class="h-4 w-px bg-border" />

        <MenubarMenu>
          <MenubarTrigger
            class="flex h-8 items-center gap-2 px-2 py-1 text-xs text-muted-foreground hover:bg-accent/40"
          >
            <span>题库</span>
          </MenubarTrigger>
          <MenubarContent>
            <MenubarItem as-child>
              <RouterLink :to="{ name: 'problemset' }" class="block w-full">
                题库首页
              </RouterLink>
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>

        <span class="h-7 w-px bg-border" />

        <div class="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            class="h-8 rounded-none px-3 text-xs font-medium"
            @click="updateLayout(programmingLayout)"
          >
            编程练习布局
          </Button>
          <Button
            variant="outline"
            size="sm"
            class="h-8 rounded-none px-3 text-xs font-medium"
            @click="updateLayout(balancedLayout)"
          >
            平衡布局
          </Button>
        </div>
      </Menubar>

      <div
        class="pointer-events-none absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2"
      >
        <div
          class="pointer-events-auto flex overflow-hidden rounded bg-muted/60 text-xs shadow-sm backdrop-blur-sm dark:bg-muted/40"
        >
          <Button
            variant="ghost"
            size="sm"
            class="h-8 rounded-none px-3 text-xs font-medium text-muted-foreground hover:bg-transparent"
          >
            Run
          </Button>
          <span class="my-1 h-6 w-px bg-border/60" />
          <Button size="sm" class="h-8 rounded-none px-3 text-xs font-medium">
            Submit
          </Button>
        </div>
      </div>

      <div class="hidden flex-none items-center gap-2 md:flex">
        <Button variant="outline" size="sm" class="gap-1">
          <ThumbsUp class="h-4 w-4" />
          <span class="text-xs">{{ problem?.likes || 0 }}</span>
        </Button>
        <Button variant="outline" size="sm" class="gap-1">
          <ThumbsDown class="h-4 w-4" />
          <span class="text-xs">{{ problem?.dislikes || 0 }}</span>
        </Button>
        <Button variant="outline" size="sm" class="gap-1">
          <Bookmark class="h-4 w-4" />
          <span class="text-xs">Save</span>
        </Button>
      </div>
    </nav>

    <!-- 动态布局区域 -->
    <main class="flex-1 overflow-hidden">
      <DynamicLayout v-if="layoutConfig" :layout="layoutConfig" />
    </main>
  </div>
</template>
