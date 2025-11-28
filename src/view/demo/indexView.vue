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
const currentLayout = ref<'preview' | 'leet' | 'classic' | 'compact' | 'wide'>('leet');

// Define page structure metadata - according to new grouping method
const initialHeaderGroups: HeaderGroup[] = [
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

// Layout 1: Preview Layout
const previewLayout: LayoutNode = {
  id: "preview-root",
  type: "container",
  direction: "horizontal",
  children: [
    {
      id: "preview-left",
      type: "container",
      direction: "vertical",
      size: 40,
      children: [
        {
          id: "preview-left-top",
          type: "leaf",
          size: 33,
          groupId: "problem-info",
        },
        {
          id: "preview-left-bottom",
          type: "leaf",
          size: 67,
          groupId: "code-editor",
        },
      ],
    },
    {
      id: "preview-right",
      type: "leaf",
      size: 60,
      groupId: "test-info",
    },
  ],
};

// Layout 2: Leet Layout
const leetLayout: LayoutNode = {
  id: "programming-root",
  type: "container",
  direction: "horizontal",
  children: [
    {
      id: "programming-left",
      type: "leaf",
      size: 50,
      groupId: "problem-info",
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

// Layout 3: Classic Layout - Similar to traditional IDE layout
const classicLayout: LayoutNode = {
  id: "classic-root",
  type: "container",
  direction: "vertical",
  children: [
    {
      id: "classic-top",
      type: "leaf",
      size: 40,
      groupId: "problem-info",
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
        },
        {
          id: "classic-bottom-right",
          type: "leaf",
          size: 50,
          groupId: "test-info",
        },
      ],
    },
  ],
};

// Layout 4: Compact Layout - Optimized for smaller screens
const compactLayout: LayoutNode = {
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
        },
        {
          id: "compact-left-bottom",
          type: "leaf",
          size: 50,
          groupId: "test-info",
        },
      ],
    },
    {
      id: "compact-right",
      type: "leaf",
      size: 70,
      groupId: "code-editor",
    },
  ],
};

// Layout 5: Wide Layout - Emphasizes code editor
const wideLayout: LayoutNode = {
  id: "wide-root",
  type: "container",
  direction: "horizontal",
  children: [
    {
      id: "wide-left",
      type: "leaf",
      size: 25,
      groupId: "problem-info",
    },
    {
      id: "wide-center",
      type: "leaf",
      size: 50,
      groupId: "code-editor",
    },
    {
      id: "wide-right",
      type: "leaf",
      size: 25,
      groupId: "test-info",
    },
  ],
};

// Handle layout changes from HeaderRight
const handleLayoutChange = (newLayout: 'preview' | 'leet' | 'classic' | 'compact' | 'wide') => {
  currentLayout.value = newLayout;
  let selectedLayout: LayoutNode;
  
  switch (newLayout) {
    case 'leet':
      selectedLayout = leetLayout;
      break;
    case 'classic':
      selectedLayout = classicLayout;
      break;
    case 'compact':
      selectedLayout = compactLayout;
      break;
    case 'wide':
      selectedLayout = wideLayout;
      break;
    default: // preview
      selectedLayout = previewLayout;
  }
  
  headerStore.updateLayout(selectedLayout);
};

// Initialize data
onMounted(() => {
  let initialLayout: LayoutNode;
  
  switch (currentLayout.value) {
    case 'leet':
      initialLayout = leetLayout;
      break;
    case 'classic':
      initialLayout = classicLayout;
      break;
    case 'compact':
      initialLayout = compactLayout;
      break;
    case 'wide':
      initialLayout = wideLayout;
      break;
    default: // preview
      initialLayout = previewLayout;
  }
  
  headerStore.initData(initialHeaderGroups, initialLayout);
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