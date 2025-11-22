<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import type { ProblemDetail } from "@/mocks/schema/problem-detail";
import type { ProblemRunResult } from "@/mocks/schema/test-results";
import { fetchProblemDetailById } from "@/api/problem-detail";
import { fetchProblemRunResultByProblemId } from "@/api/test-results";
import DescriptionView from "./Left/description/DescriptionView.vue";
import SolutionsView from "./Left/solutions/SolutionsView.vue";
import SubmissionsView from "./Left/submissions/SubmissionsView.vue";
import CodeView from "./right/top/CodeView.vue";
import TestCaseView from "./right/bottom/TestCaseView.vue";
import TestResultsView from "./right/bottom/TestResultsView.vue";
import HeaderView from "./components/HeaderView.vue";

const route = useRoute();

const problem = ref<ProblemDetail | null>(null);
const runResult = ref<ProblemRunResult | null>(null);

watch(
  () => problem.value?.id,
  async (id) => {
    if (!id) {
      runResult.value = null;
      return;
    }
    try {
      runResult.value = await fetchProblemRunResultByProblemId(id);
    } catch (error) {
      console.error("Failed to load run result", error);
      runResult.value = null;
    }
  },
);

onMounted(async () => {
  const idParam = route.params.id;
  const numericId =
    typeof idParam === "string"
      ? Number.parseInt(idParam, 10)
      : Number(idParam);
  const safeId = Number.isFinite(numericId) ? numericId : 1;
  try {
    problem.value = await fetchProblemDetailById(safeId);
  } catch (error) {
    console.error("Failed to load problem detail", error);
    problem.value = null;
  }
});
</script>

<template>
  <div class="flex h-screen w-screen flex-col gap-4 overflow-hidden p-4">
    <div v-if="problem" class="flex flex-1 min-h-0 flex-col gap-4">
      <HeaderView :problem="problem" />

      <ResizablePanelGroup direction="horizontal" class="flex-1 min-h-0 gap-4">
        <ResizablePanel :defaultSize="45" class="min-w-[280px]">
          <Card class="flex h-full min-h-0 flex-col">
            <CardContent class="flex min-h-0 flex-1 flex-col pb-2">
              <Tabs
                default-value="description"
                class="flex h-full flex-col gap-3"
              >
                <TabsList>
                  <TabsTrigger value="description"> Description </TabsTrigger>
                  <TabsTrigger value="solutions"> Solutions </TabsTrigger>
                  <TabsTrigger value="submissions"> Submissions </TabsTrigger>
                </TabsList>
                <TabsContent value="description" class="flex-1 min-h-0">
                  <ScrollArea class="h-full pr-3">
                    <div class="px-1 py-2">
                      <DescriptionView :problem="problem" />
                    </div>
                  </ScrollArea>
                </TabsContent>
                <TabsContent value="solutions" class="flex-1 min-h-0">
                  <ScrollArea class="h-full pr-3">
                    <div class="px-1 py-2">
                      <SolutionsView
                        :problem-id="problem.id"
                        :follow-up="problem.followUp ?? ''"
                      />
                    </div>
                  </ScrollArea>
                </TabsContent>
                <TabsContent value="submissions" class="flex-1 min-h-0">
                  <ScrollArea class="h-full pr-3">
                    <div class="px-1 py-2">
                      <SubmissionsView :problem-id="problem.id" />
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </ResizablePanel>

        <ResizableHandle with-handle />

        <ResizablePanel :defaultSize="55" class="min-w-[320px]">
          <Card class="flex h-full min-h-0 flex-col">
            <CardContent class="flex min-h-0 flex-1 flex-col pt-3">
              <ResizablePanelGroup
                direction="vertical"
                class="flex-1 min-h-0 gap-3"
              >
                <ResizablePanel :defaultSize="60" class="min-h-[160px]">
                  <div class="flex h-full min-h-0 flex-col">
                    <CodeView
                      v-if="problem.languages.length"
                      :languages="problem.languages"
                      :starter-notes="problem.starterNotes"
                    />
                  </div>
                </ResizablePanel>

                <ResizableHandle with-handle />

                <ResizablePanel :defaultSize="40" class="min-h-[120px]">
                  <div class="flex h-full min-h-0 flex-col">
                    <Tabs
                      default-value="cases"
                      class="flex h-full flex-col gap-2"
                    >
                      <TabsList>
                        <TabsTrigger value="cases"> Testcases </TabsTrigger>
                        <TabsTrigger value="results"> Results </TabsTrigger>
                      </TabsList>
                      <TabsContent value="cases" class="flex-1 min-h-0">
                        <ScrollArea class="h-full pr-3">
                          <div class="px-1 py-2">
                            <TestCaseView :test-cases="problem.testCases" />
                          </div>
                        </ScrollArea>
                      </TabsContent>
                      <TabsContent value="results" class="flex-1 min-h-0">
                        <ScrollArea class="h-full pr-3">
                          <div class="px-1 py-2">
                            <TestResultsView :run-result="runResult" />
                          </div>
                        </ScrollArea>
                      </TabsContent>
                    </Tabs>
                  </div>
                </ResizablePanel>
              </ResizablePanelGroup>
            </CardContent>
          </Card>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>

    <div v-else class="flex flex-1 items-center justify-center">
      <p class="text-sm text-muted-foreground">Loading problem...</p>
    </div>
  </div>
</template>
