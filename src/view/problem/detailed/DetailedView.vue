<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { Button } from "@/components/ui/button";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import {
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  ThumbsDown,
  ThumbsUp,
} from "lucide-vue-next";
import logoIcon from "@/ico/favicon.ico";
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
              variant="ghost"
              size="icon-sm"
              class="h-8 w-8 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            >
              <ChevronLeft class="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              class="h-8 w-8 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            >
              <ChevronRight class="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              class="h-8 w-8 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            >
              <Shuffle class="h-4 w-4" />
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
            <span class="text-xs">{{ problem.likes }}</span>
          </Button>
          <Button variant="outline" size="sm" class="gap-1">
            <ThumbsDown class="h-4 w-4" />
            <span class="text-xs">{{ problem.dislikes }}</span>
          </Button>
          <Button variant="outline" size="sm" class="gap-1">
            <Bookmark class="h-4 w-4" />
            <span class="text-xs">Save</span>
          </Button>
        </div>
      </nav>

      <ResizablePanelGroup direction="horizontal" class="flex-1 min-h-0 gap-4">
        <ResizablePanel :defaultSize="45" class="min-w-[280px]">
          <Tabs
            default-value="description"
            class="flex h-full flex-col gap-3 rounded-lg border bg-card shadow-sm"
          >
                <TabsList class="m-2">
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
        </ResizablePanel>

        <ResizableHandle with-handle />

        <ResizablePanel :defaultSize="55" class="min-w-[320px]">
          <ResizablePanelGroup
            direction="vertical"
            class="flex-1 min-h-0 gap-3"
          >
                <ResizablePanel :defaultSize="60" class="min-h-[160px]">
                  <div class="flex h-full min-h-0 flex-col rounded-lg border bg-card shadow-sm">
                    <CodeView
                      v-if="problem.languages.length"
                      :languages="problem.languages"
                      :starter-notes="problem.starterNotes"
                    />
                  </div>
                </ResizablePanel>

                <ResizableHandle with-handle />

                <ResizablePanel :defaultSize="40" class="min-h-[120px]">
                  <Tabs
                    default-value="cases"
                    class="flex h-full flex-col gap-2 rounded-lg border bg-card shadow-sm"
                  >
                      <TabsList class="m-2">
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
                </ResizablePanel>
              </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>

    <div v-else class="flex flex-1 items-center justify-center">
      <p class="text-sm text-muted-foreground">Loading problem...</p>
    </div>
  </div>
</template>
