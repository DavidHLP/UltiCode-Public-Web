<script setup lang="ts">
import { onMounted } from "vue";
import {
  useHeaderStore,
  type HeaderGroup,
  type LayoutNode,
} from "@/stores/headerStore";
import { storeToRefs } from "pinia";
import DynamicLayout from "./components/layout/DynamicLayout.vue";
import {
  ChevronRight,
  ListVideo,
  ChevronLeft,
  Shuffle,
  ExternalLink,
} from "lucide-vue-next";

const headerStore = useHeaderStore();
const { layoutConfig } = storeToRefs(headerStore);

// 定义页面结构元数据 - 按照新的分组方式
const initialHeaderGroups: HeaderGroup[] = [
  {
    id: "problem-info",
    name: "题目信息",
    headers: [
      {
        id: 1,
        index: 0,
        title: "题目描述",
        icon: "FileText",
        color: "#1a1a1a",
        iconColor: "#007bff",
      },
      {
        id: 2,
        index: 1,
        title: "题解",
        icon: "FlaskConical",
        color: "#1a1a1a",
        iconColor: "#007bff",
      },
      {
        id: 3,
        index: 2,
        title: "提交记录",
        icon: "History",
        color: "#1a1a1a",
        iconColor: "#007bff",
      },
    ],
  },
  {
    id: "code-editor",
    name: "代码编辑器",
    headers: [
      {
        id: 4,
        index: 0,
        title: "代码",
        icon: "Code2",
        color: "#1a1a1a",
        iconColor: "#02b128",
      },
    ],
  },
  {
    id: "test-info",
    name: "测试信息",
    headers: [
      {
        id: 5,
        index: 0,
        title: "测试用例",
        icon: "SquareCheck",
        color: "#1a1a1a",
        iconColor: "#02b128",
      },
      {
        id: 6,
        index: 1,
        title: "测试结果",
        icon: "Terminal",
        color: "#1a1a1a",
        iconColor: "#02b128",
      },
    ],
  },
];

// 布局1: 编程练习布局 (左1 + 右(上1 + 下1))
const programmingLayout: LayoutNode = {
  id: "programming-root",
  type: "container",
  direction: "horizontal",
  children: [
    {
      id: "programming-left",
      type: "leaf",
      size: 40,
      groupId: "problem-info",
    },
    {
      id: "programming-right",
      type: "container",
      direction: "vertical",
      size: 60,
      children: [
        {
          id: "programming-right-top",
          type: "leaf",
          size: 50,
          groupId: "code-editor",
        },
        {
          id: "programming-right-bottom",
          type: "leaf",
          size: 50,
          groupId: "test-info",
        },
      ],
    },
  ],
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
      <div class="flex min-w-[240px] flex-1 items-center overflow-hidden">
        <ul class="relative ml-2.5 mr-2 flex h-10 flex-none items-center">
          <RouterLink to="/" class="mr-2 self-center">
            <div class="mb-0.5 pl-1">
              <div class="hidden h-5 dark:flex">
                <img
                  src="https://static.leetcode.cn/cn-frontendx-assets/production/_next/static/images/logo-dark-c96c407d175e36c81e236fcfdd682a0b.png?x-oss-process=image%2Fformat%2Cwebp"
                  alt="Ulticode Logo"
                  class="h-full"
                />
              </div>
              <div class="flex h-5 dark:hidden">
                <img
                  src="https://static.leetcode.cn/cn-frontendx-assets/production/_next/static/images/logo-ff2b712834cf26bf50a5de58ee27bcef.png?x-oss-process=image%2Fformat%2Cwebp"
                  alt="Ulticode Logo"
                  class="h-full"
                />
              </div>
            </div>
          </RouterLink>
          <li class="h-[16px] w-[1px] bg-gray-300 dark:bg-gray-600"></li>
        </ul>

        <div
          class="flex group items-center overflow-hidden rounded hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          <div
            class="group/nav-back cursor-pointer gap-2 overflow-hidden hover:text-blue-600 dark:hover:text-blue-400 flex items-center h-[32px] transition-none hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-400 px-2"
            role="button"
            aria-label="展开面板"
          >
            <div
              class="relative text-[16px] leading-[normal] p-0.5 before:block before:h-4 before:w-4 flex-none"
            >
              <ListVideo
                class="h-4 w-4 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              />
            </div>
            <div class="relative flex items-center gap-2 overflow-hidden">
              <div
                class="truncate font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 text-gray-800 dark:text-gray-200 hover:text-gray-800 dark:hover:text-gray-200"
              >
                题库
              </div>
              <div class="hidden group-hover/nav-back:block">
                <div class="flex flex-none" data-state="closed">
                  <RouterLink
                    to="/problemset/"
                    aria-label="在新的标签页打开 题库"
                    class="no-underline truncate rounded p-1 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600 hover:text-gray-800 dark:hover:text-gray-200"
                  >
                    <ExternalLink class="h-3 w-3" />
                  </RouterLink>
                </div>
              </div>
            </div>
          </div>

          <div
            class="h-[28px] w-[1px] flex-none bg-gray-300 dark:bg-gray-600"
          ></div>

          <RouterLink
            class="group flex-none cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 flex items-center h-[32px] transition-none hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-400 w-[32px]"
            aria-label="上一题"
            to="/problems/sparse-similarity-lcci"
          >
            <div
              class="relative text-[16px] leading-[normal] before:block before:h-4 before:w-4 m-auto items-center"
            >
              <ChevronLeft
                class="h-4 w-4 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              />
            </div>
          </RouterLink>

          <div
            class="h-[28px] w-[1px] flex-none bg-gray-300 dark:bg-gray-600"
          ></div>

          <RouterLink
            class="group flex-none cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 flex items-center h-[32px] transition-none hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-400 w-[32px]"
            aria-label="下一题"
            to="/problems/add-two-numbers"
          >
            <div
              class="relative text-[16px] leading-[normal] before:block before:h-4 before:w-4 m-auto items-center"
            >
              <ChevronRight
                class="h-4 w-4 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              />
            </div>
          </RouterLink>

          <div
            class="h-[28px] w-[1px] flex-none bg-gray-300 dark:bg-gray-600"
          ></div>

          <RouterLink
            to="/problems/random"
            class="flex-none cursor-pointer justify-center hover:text-blue-600 dark:hover:text-blue-400 flex items-center h-[32px] transition-none hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-400 w-[32px]"
            aria-label="随机一题"
          >
            <div
              class="relative text-[16px] leading-[normal] before:block before:h-4 before:w-4"
            >
              <Shuffle
                class="h-4 w-4 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              />
            </div>
          </RouterLink>
        </div>
      </div>
    </nav>

    <!-- 动态布局区域 -->
    <main class="flex-1 overflow-hidden h-full w-full">
      <DynamicLayout
        v-if="layoutConfig"
        :layout="layoutConfig"
        class="h-full w-full"
      />
    </main>
  </div>
</template>
