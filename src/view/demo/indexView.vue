<script setup lang="ts">
import { onMounted } from "vue";
import HeaderLeft from "./components/header/HeaderLeft.vue";
import HeaderRight from "./components/header/HeaderRight.vue";
import {
  useHeaderStore,
  type HeaderGroup,
  type LayoutNode,
} from "@/stores/headerStore";
import { storeToRefs } from "pinia";
import DynamicLayout from "./components/layout/DynamicLayout.vue";
import HeaderMid from "./components/header/HeaderMid.vue";

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
  <div class="h-screen flex flex-col bg-[#f0f0f0] antialiased">
    <header
      class="relative flex h-12 w-full min-w-[100px] shrink-0 items-center justify-between gap-2 border-b bg-[#f0f0f0] px-2.5"
    >
      <div class="relative z-10 flex h-full min-w-[240px] flex-1 items-center overflow-hidden">
        <HeaderLeft />
      </div>
      <div
        class="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <div class="pointer-events-auto">
          <HeaderMid />
        </div>
      </div>
      <div class="relative z-10 ml-auto flex h-full flex-1 items-center justify-end gap-2">
        <HeaderRight />
      </div>
    </header>

    <!-- 动态布局区域 -->
    <main class="flex-1 min-h-0 overflow-hidden w-full">
      <DynamicLayout
        v-if="layoutConfig"
        :layout="layoutConfig"
        class="h-full w-full"
      />
    </main>
  </div>
</template>
