<script setup lang="ts">
import { onMounted, ref } from "vue";
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

// Initialize layout state
const currentLayout = ref<'leet' | 'classic' | 'compact' | 'wide'>('leet');

// Define page structure metadata - according to new grouping method
// 创建深拷贝函数以确保数据隔离
const createInitialHeaderGroups = (): HeaderGroup[] => {
  return [
    {
      id: "problem-info",
      name: "Problem Information",
      headers: [
        {
          id: 1,
          index: 0,
          title: "Problem Description",
          icon: "FileText",
          color: "#1a1a1a",
          iconColor: "#007bff",
        },
        {
          id: 2,
          index: 1,
          title: "Solution",
          icon: "FlaskConical",
          color: "#1a1a1a",
          iconColor: "#007bff",
        },
        {
          id: 3,
          index: 2,
          title: "Submission Records",
          icon: "History",
          color: "#1a1a1a",
          iconColor: "#007bff",
        },
      ],
    },
    {
      id: "code-editor",
      name: "Code Editor",
      headers: [
        {
          id: 4,
          index: 0,
          title: "Code",
          icon: "Code2",
          color: "#1a1a1a",
          iconColor: "#02b128",
        },
      ],
    },
    {
      id: "test-info",
      name: "Test Information",
      headers: [
        {
          id: 5,
          index: 0,
          title: "Test Cases",
          icon: "SquareCheck",
          color: "#1a1a1a",
          iconColor: "#02b128",
        },
        {
          id: 6,
          index: 1,
          title: "Test Results",
          icon: "Terminal",
          color: "#1a1a1a",
          iconColor: "#02b128",
        },
      ],
    },
  ];
};

// 为每个布局创建独立的 header groups 副本和布局配置
const getLeetLayoutConfig = () => {
  const groups = createInitialHeaderGroups();
  const layout: LayoutNode = {
    id: "programming-root",
    type: "container",
    direction: "horizontal",
    children: [
      {
        id: "programming-left",
        type: "leaf",
        size: 50,
        groupId: "problem-info",
        groupMetadata: {
          id: "problem-info",
          name: "Problem Information"
        }
      },
      {
        id: "programming-right",
        type: "container",
        direction: "vertical",
        size: 50,
        children: [
          {
            id: "programming-right-top",
            type: "leaf",
            size: 50,
            groupId: "code-editor",
            groupMetadata: {
              id: "code-editor",
              name: "Code Editor"
            }
          },
          {
            id: "programming-right-bottom",
            type: "leaf",
            size: 50,
            groupId: "test-info",
            groupMetadata: {
              id: "test-info",
              name: "Test Information"
            }
          },
        ],
      },
    ],
  };
  return { groups, layout };
};

const getClassicLayoutConfig = () => {
  const groups = createInitialHeaderGroups();
  const layout: LayoutNode = {
    id: "classic-root",
    type: "container",
    direction: "vertical",
    children: [
      {
        id: "classic-top",
        type: "leaf",
        size: 40,
        groupId: "problem-info",
        groupMetadata: {
          id: "problem-info",
          name: "Problem Information"
        }
      },
      {
        id: "classic-bottom",
        type: "container",
        direction: "horizontal",
        size: 60,
        children: [
          {
            id: "classic-bottom-left",
            type: "leaf",
            size: 50,
            groupId: "code-editor",
            groupMetadata: {
              id: "code-editor",
              name: "Code Editor"
            }
          },
          {
            id: "classic-bottom-right",
            type: "leaf",
            size: 50,
            groupId: "test-info",
            groupMetadata: {
              id: "test-info",
              name: "Test Information"
            }
          },
        ],
      },
    ],
  };
  return { groups, layout };
};

const getCompactLayoutConfig = () => {
  const groups = createInitialHeaderGroups();
  const layout: LayoutNode = {
    id: "compact-root",
    type: "container",
    direction: "horizontal",
    children: [
      {
        id: "compact-left",
        type: "container",
        direction: "vertical",
        size: 30,
        children: [
          {
            id: "compact-left-top",
            type: "leaf",
            size: 50,
            groupId: "problem-info",
            groupMetadata: {
              id: "problem-info",
              name: "Problem Information"
            }
          },
          {
            id: "compact-left-bottom",
            type: "leaf",
            size: 50,
            groupId: "test-info",
            groupMetadata: {
              id: "test-info",
              name: "Test Information"
            }
          },
        ],
      },
      {
        id: "compact-right",
        type: "leaf",
        size: 70,
        groupId: "code-editor",
        groupMetadata: {
          id: "code-editor",
          name: "Code Editor"
        }
      },
    ],
  };
  return { groups, layout };
};

const getWideLayoutConfig = () => {
  const groups = createInitialHeaderGroups();
  const layout: LayoutNode = {
    id: "wide-root",
    type: "container",
    direction: "horizontal",
    children: [
      {
        id: "wide-left",
        type: "leaf",
        size: 25,
        groupId: "problem-info",
        groupMetadata: {
          id: "problem-info",
          name: "Problem Information"
        }
      },
      {
        id: "wide-center",
        type: "leaf",
        size: 50,
        groupId: "code-editor",
        groupMetadata: {
          id: "code-editor",
          name: "Code Editor"
        }
      },
      {
        id: "wide-right",
        type: "leaf",
        size: 25,
        groupId: "test-info",
        groupMetadata: {
          id: "test-info",
          name: "Test Information"
        }
      },
    ],
  };
  return { groups, layout };
};

// Handle layout changes from HeaderRight
const handleLayoutChange = (newLayout: 'leet' | 'classic' | 'compact' | 'wide') => {
  currentLayout.value = newLayout;
  let config: { groups: HeaderGroup[], layout: LayoutNode };
  
  switch (newLayout) {
    case 'leet':
      config = getLeetLayoutConfig();
      break;
    case 'classic':
      config = getClassicLayoutConfig();
      break;
    case 'compact':
      config = getCompactLayoutConfig();
      break;
    case 'wide':
      config = getWideLayoutConfig();
      break;
  }
  
  headerStore.initData(config.groups, config.layout);
};

// Initialize data
onMounted(() => {
  let initialConfig: { groups: HeaderGroup[], layout: LayoutNode };
  
  switch (currentLayout.value) {
    case 'leet':
      initialConfig = getLeetLayoutConfig();
      break;
    case 'classic':
      initialConfig = getClassicLayoutConfig();
      break;
    case 'compact':
      initialConfig = getCompactLayoutConfig();
      break;
    case 'wide':
      initialConfig = getWideLayoutConfig();
      break;
  }
  
  headerStore.initData(initialConfig.groups, initialConfig.layout);
});
</script>

<template>
  <div class="h-screen flex flex-col bg-[#f0f0f0] antialiased">
    <header
      class="relative flex h-12 w-full min-w-[100px] shrink-0 items-center justify-between gap-2 bg-[#f0f0f0] px-2.5"
    >
      <div
        class="relative z-10 flex h-full min-w-[240px] flex-1 items-center overflow-hidden"
      >
        <HeaderLeft />
      </div>
      <div
        class="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <div class="pointer-events-auto">
          <HeaderMid />
        </div>
      </div>
      <div
        class="relative z-10 ml-auto flex h-full flex-1 items-center justify-end gap-2"
      >
        <HeaderRight :current-layout="currentLayout" @layout-change="handleLayoutChange" />
      </div>
    </header>

    <!-- Dynamic layout area -->
    <main class="flex-1 min-h-0 overflow-hidden w-full">
      <DynamicLayout
        v-if="layoutConfig"
        :layout="layoutConfig"
        class="h-full w-full"
      />
    </main>
  </div>
</template>
