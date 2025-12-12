<script setup lang="ts">
import {
  onMounted,
  ref,
  watch,
  provide,
  h,
  defineComponent,
  inject,
  type Component,
  type Ref,
} from "vue";
import { useRoute, useRouter } from "vue-router";
import { storeToRefs } from "pinia";

import LayoutHeaderLeft from "./headers/LayoutHeaderLeft.vue";
import LayoutHeaderCenter from "./headers/LayoutHeaderCenter.vue";
import LayoutHeaderControls from "./headers/LayoutHeaderControls.vue";
import LayoutTree from "@/features/layout/tree/LayoutTree.vue";
import {
  useHeaderStore,
  type HeaderGroup,
  type LayoutNode,
} from "@/stores/headerStore";

import type { ProblemDetail, ProblemTestCase } from "@/types/problem-detail";
import type { ProblemRunResult } from "@/types/test-results";
import { fetchProblemDetailById } from "@/api/problem-detail";
import { useBottomPanelStore } from "./right/bottom/bottom";
import { fetchCurrentUserId } from "@/utils/auth";

import DescriptionView from "./left-panel/description/DescriptionView.vue";
import SolutionsView from "./left-panel/solutions/SolutionsView.vue";
import SubmissionsView from "./left-panel/submissions/SubmissionsView.vue";
import CodeView from "./right/top/CodeView.vue";
import TestCaseView from "./right/bottom/TestCaseView.vue";
import TestResultsView from "./right/bottom/TestResultsView.vue";

// --- Data Fetching ---
const route = useRoute();
const router = useRouter();
const problem = ref<ProblemDetail | null>(null);
const runResult = ref<ProblemRunResult | null>(null);
const bottomPanelStore = useBottomPanelStore();

onMounted(async () => {
  const idParam = route.params.id;
  const id = Array.isArray(idParam) ? idParam[0] : idParam;

  if (!id) return;

  try {
    problem.value = await fetchProblemDetailById(id);
  } catch (error) {
    console.error("Failed to load problem detail", error);
    problem.value = null;
  }
});

watch(
  () => problem.value?.id,
  () => {
    runResult.value = null;
  },
);

const buildRunResultFromCases = (
  cases: ProblemTestCase[],
  problemId: number,
): ProblemRunResult => {
  const runId = `run-${problemId}-${Date.now()}`;
  const userId = fetchCurrentUserId();
  const runtimeMs = 40 + cases.length * 5;
  const memoryMb = 8 + cases.length * 2;

  const mappedCases = cases.map((testCase, index) => {
    const displayLabel = `Case ${index + 1}`;
    const output =
      testCase.inputs?.map((input) => input.value || "").join(" | ") || "OK";

    return {
      id: `${runId}-case-${index + 1}`,
      runId,
      submissionTestId: testCase.id,
      testCaseId: testCase.id,
      caseLabel: displayLabel,
      status: "Accepted" as const,
      runtime: `${Math.max(1, testCase.inputs?.length ?? 1) * 2} ms`,
      memory: `${10 + index} MB`,
      detail: "Sample run using provided inputs.",
      output,
      expectedOutput: output,
      inputs:
        testCase.inputs?.map((input) => ({
          id: input.id ?? `input-${index}-${input.name}`,
          label: input.label ?? input.name,
          name: input.name,
          value: input.value,
        })) ?? [],
    };
  });

  return {
    id: runId,
    submissionId: `${runId}-submission`,
    problemId,
    userId,
    verdict: "Accepted",
    runtime: `${runtimeMs} ms`,
    memory: `${memoryMb} MB`,
    cases: mappedCases,
  };
};

watch(
  () => bottomPanelStore.lastRunToken.value,
  () => {
    if (!problem.value) return;
    const cases =
      bottomPanelStore.testCases.value.length > 0
        ? bottomPanelStore.testCases.value
        : (problem.value.testCases ?? []);
    runResult.value = buildRunResultFromCases(cases, problem.value.id);
  },
);

// --- Context Provider ---
// Define the context type
interface ProblemContextType {
  problem: Ref<ProblemDetail | null>;
  runResult: Ref<ProblemRunResult | null>;
}

// Provide problem and runResult to connector components
provide<ProblemContextType>("problemContext", { problem, runResult });

// --- Connector Components ---
// These wrappers adapt the injected context to the specific props required by the views

const ConnectedDescriptionView = defineComponent({
  setup() {
    const context = inject<ProblemContextType>("problemContext");
    if (!context) throw new Error("problemContext not provided");
    const { problem } = context;
    return () =>
      problem.value
        ? h(
            "div",
            { class: "px-1 py-2" },
            h(DescriptionView, { problem: problem.value }),
          )
        : h(
            "div",
            { class: "flex items-center justify-center h-full" },
            "Loading...",
          );
  },
});

const ConnectedSolutionsView = defineComponent({
  setup() {
    const context = inject<ProblemContextType>("problemContext");
    if (!context) throw new Error("problemContext not provided");
    const { problem } = context;
    return () =>
      problem.value
        ? h(
            "div",
            { class: "px-1 py-2" },
            h(SolutionsView, {
              problemId: problem.value.id,
              followUp: problem.value.followUp ?? "",
            }),
          )
        : h(
            "div",
            { class: "flex items-center justify-center h-full" },
            "Loading...",
          );
  },
});

const ConnectedSubmissionsView = defineComponent({
  setup() {
    const context = inject<ProblemContextType>("problemContext");
    if (!context) throw new Error("problemContext not provided");
    const { problem } = context;
    return () =>
      problem.value
        ? h(
            "div",
            { class: "px-1 py-2" },
            h(SubmissionsView, { problemId: problem.value.id }),
          )
        : h(
            "div",
            { class: "flex items-center justify-center h-full" },
            "Loading...",
          );
  },
});

const ConnectedCodeView = defineComponent({
  setup() {
    const context = inject<ProblemContextType>("problemContext");
    if (!context) throw new Error("problemContext not provided");
    const { problem } = context;
    return () =>
      problem.value && problem.value.languages.length
        ? h(CodeView, {
            languages: problem.value.languages,
            starterNotes: problem.value.starterNotes ?? [],
          })
        : h(
            "div",
            { class: "flex items-center justify-center h-full" },
            "Loading...",
          );
  },
});

const ConnectedTestCaseView = defineComponent({
  setup() {
    const context = inject<ProblemContextType>("problemContext");
    if (!context) throw new Error("problemContext not provided");
    const { problem } = context;
    return () =>
      problem.value
        ? h(
            "div",
            { class: "px-1 py-2" },
            h(TestCaseView, { testCases: problem.value.testCases ?? [] }),
          )
        : h(
            "div",
            { class: "flex items-center justify-center h-full" },
            "Loading...",
          );
  },
});

const ConnectedTestResultsView = defineComponent({
  setup() {
    const context = inject<ProblemContextType>("problemContext");
    if (!context) throw new Error("problemContext not provided");
    const { runResult } = context;
    return () =>
      h(
        "div",
        { class: "px-1 py-2" },
        h(TestResultsView, { runResult: runResult.value }),
      );
  },
});

// Map Header IDs to Components
const panelComponentMap: Record<number, Component> = {
  1: ConnectedDescriptionView,
  2: ConnectedSolutionsView,
  3: ConnectedSubmissionsView,
  4: ConnectedCodeView,
  5: ConnectedTestCaseView,
  6: ConnectedTestResultsView,
};

provide("panelComponentMap", panelComponentMap);

// --- Layout Logic ---
const headerStore = useHeaderStore();
const { layoutConfig } = storeToRefs(headerStore);
const currentLayout = ref<"leet" | "classic" | "compact" | "wide">("leet");

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
        groupMetadata: { id: "problem-info", name: "Problem Information" },
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
            groupMetadata: { id: "code-editor", name: "Code Editor" },
          },
          {
            id: "programming-right-bottom",
            type: "leaf",
            size: 50,
            groupId: "test-info",
            groupMetadata: { id: "test-info", name: "Test Information" },
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
        groupMetadata: { id: "problem-info", name: "Problem Information" },
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
            groupMetadata: { id: "code-editor", name: "Code Editor" },
          },
          {
            id: "classic-bottom-right",
            type: "leaf",
            size: 50,
            groupId: "test-info",
            groupMetadata: { id: "test-info", name: "Test Information" },
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
            groupMetadata: { id: "problem-info", name: "Problem Information" },
          },
          {
            id: "compact-left-bottom",
            type: "leaf",
            size: 50,
            groupId: "test-info",
            groupMetadata: { id: "test-info", name: "Test Information" },
          },
        ],
      },
      {
        id: "compact-right",
        type: "leaf",
        size: 70,
        groupId: "code-editor",
        groupMetadata: { id: "code-editor", name: "Code Editor" },
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
        groupMetadata: { id: "problem-info", name: "Problem Information" },
      },
      {
        id: "wide-center",
        type: "leaf",
        size: 50,
        groupId: "code-editor",
        groupMetadata: { id: "code-editor", name: "Code Editor" },
      },
      {
        id: "wide-right",
        type: "leaf",
        size: 25,
        groupId: "test-info",
        groupMetadata: { id: "test-info", name: "Test Information" },
      },
    ],
  };
  return { groups, layout };
};

const handleLayoutChange = (
  newLayout: "leet" | "classic" | "compact" | "wide",
) => {
  currentLayout.value = newLayout;
  let config;
  switch (newLayout) {
    case "leet":
      config = getLeetLayoutConfig();
      break;
    case "classic":
      config = getClassicLayoutConfig();
      break;
    case "compact":
      config = getCompactLayoutConfig();
      break;
    case "wide":
      config = getWideLayoutConfig();
      break;
  }
  headerStore.initData(config.groups, config.layout);
};

const TAB_MAP: Record<string, number> = {
  description: 1,
  solutions: 2,
  submissions: 3,
};

const REV_TAB_MAP: Record<number, string> = {
  1: "description",
  2: "solutions",
  3: "submissions",
};

// Sync URL to Store (when route changes, e.g. back button)
watch(
  () => route.params.tab,
  (newTab) => {
    const tabName = Array.isArray(newTab) ? newTab[0] : newTab;
    if (tabName && Object.prototype.hasOwnProperty.call(TAB_MAP, tabName)) {
      const targetId = TAB_MAP[tabName];
      if (
        targetId !== undefined &&
        headerStore.activeHeaderByGroup["problem-info"] !== targetId
      ) {
        headerStore.setActiveHeader("problem-info", targetId);
      }
    } else if (!tabName) {
      // Default to description if no tab specified
      if (headerStore.activeHeaderByGroup["problem-info"] !== 1) {
        headerStore.setActiveHeader("problem-info", 1);
      }
    }
  },
);

// Sync Store to URL (when user clicks tabs)
watch(
  () => headerStore.activeHeaderByGroup["problem-info"],
  (newHeaderId) => {
    if (newHeaderId && newHeaderId in REV_TAB_MAP) {
      const tabName = REV_TAB_MAP[newHeaderId];
      if (route.params.tab !== tabName) {
        router.push({
          name: "problem-detail",
          params: { ...route.params, tab: tabName },
        });
      }
    }
  },
);

onMounted(() => {
  const initialConfig = getLeetLayoutConfig();
  headerStore.initData(initialConfig.groups, initialConfig.layout);

  // Restore tab from URL
  const tabParam = route.params.tab;
  const tabName = Array.isArray(tabParam) ? tabParam[0] : tabParam;
  if (tabName) {
    const targetId = TAB_MAP[tabName];
    if (targetId !== undefined) {
      headerStore.setActiveHeader("problem-info", targetId);
    }
  }
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
        <LayoutHeaderLeft />
      </div>
      <div
        class="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <div class="pointer-events-auto">
          <LayoutHeaderCenter />
        </div>
      </div>
      <div
        class="relative z-10 ml-auto flex h-full flex-1 items-center justify-end gap-2"
      >
        <LayoutHeaderControls
          :current-layout="currentLayout"
          :problem="problem"
          @layout-change="handleLayoutChange"
        />
      </div>
    </header>

    <!-- Dynamic layout area -->
    <main class="flex-1 min-h-0 overflow-hidden w-full p-4 pt-0">
      <LayoutTree
        v-if="layoutConfig"
        :layout="layoutConfig"
        class="h-full w-full"
      />
    </main>
  </div>
</template>
