<template>
  <div class="flex h-screen w-full flex-col overflow-hidden bg-background">
    <!-- 顶部导航栏 -->
    <header class="flex h-14 flex-shrink-0 items-center border-b px-4">
      <Button variant="ghost" size="sm" class="gap-2" @click="handleGoBack">
        <ArrowLeft class="h-4 w-4" />
        Back
      </Button>
      <div class="flex-1" />
      <span class="text-xs text-muted-foreground">
        {{ draftStatus }}
      </span>
      <Button size="sm" class="ml-4 gap-2" @click="handlePublish">
        <SendHorizonal class="h-4 w-4" />
        Publish Solution
      </Button>
    </header>

    <!-- 主体内容 -->
    <main class="flex flex-1 overflow-hidden">
      <div class="flex w-full flex-col overflow-hidden">
        <!-- 标题和话题区域 -->
        <div class="flex flex-shrink-0 flex-col gap-3 px-4 py-3">
          <div class="rounded-lg border bg-card p-3">
            <Input
              v-model="title"
              placeholder="Enter title"
              class="rounded-none border-0 border-b bg-transparent px-0 text-base font-medium shadow-none focus-visible:ring-0"
            />

            <div class="mt-3 flex flex-wrap items-center gap-2">
              <div class="relative">
                <button
                  type="button"
                  class="flex h-8 items-center gap-2 rounded-md border border-border bg-background px-3 text-sm hover:bg-muted"
                  @click="showTopicPicker = !showTopicPicker"
                >
                  <Tag class="h-4 w-4" />
                  Topics
                </button>
                <div
                  v-if="showTopicPicker"
                  class="absolute left-0 top-10 z-50 w-80 rounded-md border border-border bg-card shadow-lg"
                >
                  <div class="border-b border-border px-4 py-3">
                    <h4 class="text-sm font-medium">Select Topics</h4>
                  </div>

                  <div
                    v-if="isLoadingTopics"
                    class="flex items-center justify-center py-8"
                  >
                    <span class="text-sm text-muted-foreground"
                      >Loading...</span
                    >
                  </div>
                  <div v-else-if="topicLoadError" class="py-8 text-center">
                    <p class="text-sm text-destructive">{{ topicLoadError }}</p>
                  </div>
                  <div
                    v-else-if="!topicOptions.length"
                    class="py-8 text-center"
                  >
                    <p class="text-sm text-muted-foreground">
                      No topics available
                    </p>
                  </div>
                  <div v-else class="max-h-64 overflow-y-auto">
                    <div class="p-2">
                      <button
                        v-for="topic in topicOptions"
                        :key="topic.id"
                        type="button"
                        class="flex w-full items-center justify-between rounded px-2 py-1.5 text-sm hover:bg-muted"
                        @click="toggleTopic(topic.id)"
                      >
                        <span>{{ topic.name }}</span>
                        <Check
                          v-if="selectedTopicIds.includes(topic.id)"
                          class="h-4 w-4"
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <span
                v-for="topic in selectedTopics"
                :key="topic.id"
                class="inline-flex items-center gap-1.5 rounded-md bg-secondary px-2 py-1 text-sm"
              >
                {{ topic.name }}
                <button
                  type="button"
                  class="inline-flex h-4 w-4 items-center justify-center hover:opacity-70"
                  @click="removeTopic(topic.id)"
                >
                  <X class="h-3 w-3" />
                </button>
              </span>
            </div>
          </div>
        </div>

        <div class="flex-1 px-4 pb-4 overflow-hidden">
          <div class="grid h-full grid-cols-2 gap-4">
            <!-- Monaco Editor Container -->
            <div
              class="flex flex-col rounded-lg border bg-card overflow-hidden"
            >
              <div
                class="flex items-center border-b bg-muted/30 px-3 py-2 text-xs font-medium text-muted-foreground"
              >
                Markdown Editor
              </div>
              <div ref="editorContainer" class="flex-1 w-full h-full"></div>
            </div>

            <!-- Markdown Preview -->
            <div
              class="flex flex-col rounded-lg border bg-card overflow-hidden"
            >
              <div
                class="flex items-center border-b bg-muted/30 px-3 py-2 text-xs font-medium text-muted-foreground"
              >
                Preview
              </div>
              <div class="flex-1 overflow-y-auto p-4">
                <div class="markdown-content" v-html="previewHtml"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch, onBeforeUnmount } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useDebounceFn, usePreferredDark } from "@vueuse/core";
import { SendHorizonal, Tag, X, ArrowLeft, Check } from "lucide-vue-next";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { fetchSolutionTopics } from "@/api/topic";
import { fetchSubmission } from "@/api/submission";
import type { SolutionTopic } from "@/types/topic";
import loader from "@monaco-editor/loader";
import * as monaco from "monaco-editor";
import { renderMarkdown } from "@/utils/markdown";
import "highlight.js/styles/atom-one-dark.css";

const router = useRouter();
const route = useRoute();

const title = ref("");
const editorContent = ref<string>(`# Approach

> What method do you use to solve this problem?

# Solution

> How do you apply these methods?

# Complexity

- Time complexity: $O(*)$
- Space complexity: $O(*)$

# Code

\`\`\`java
class Solution {
   public int[] twoSum(int[] nums, int target) {
       for (int i = 0; i < nums.length; i++) {
           for (int j = i + 1; j < nums.length; j++) {
               if (nums[i] + nums[j] == target) { 
                   return new int[] { i, j };
               }
           }
       }
       return new int[] {};
   }
}
\`\`\`
`);

const isDark = usePreferredDark();

// Monaco Editor setup
const editorContainer = ref<HTMLElement | null>(null);
let editorInstance: monaco.editor.IStandaloneCodeEditor | null = null;

const resolvedProblemId = ref<string>(route.params.id as string);

onMounted(async () => {
  const submissionId = route.query.submissionId as string;
  if (submissionId) {
    try {
      const submission = await fetchSubmission(submissionId);
      if (submission.status !== "Accepted") {
        alert("You must have an Accepted submission to create a solution.");
        router.push({
          name: "problem-detail",
          params: { id: submission.problem_id.toString(), tab: "solution" },
        });
        return;
      }
      resolvedProblemId.value = submission.problem_id.toString();

      // Optionally pre-fill code? User didn't ask for it, but might be nice.
      // For now, sticking to requirements: check ACC status.
    } catch (error) {
      console.error("Failed to validate submission", error);
      alert("Failed to validate submission.");
      router.back();
      return;
    }
  }

  loadTopics();

  if (editorContainer.value) {
    loader.config({ monaco });
    const monacoInstance = await loader.init();

    editorInstance = monacoInstance.editor.create(editorContainer.value, {
      value: editorContent.value,
      language: "markdown",
      theme: isDark.value ? "vs-dark" : "vs",
      automaticLayout: true,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      fontSize: 14,
      fontFamily: "Menlo, Monaco, 'Courier New', monospace",
      padding: { top: 16, bottom: 16 },
    });

    editorInstance.onDidChangeModelContent(() => {
      editorContent.value = editorInstance?.getValue() || "";
    });
  }
});

onBeforeUnmount(() => {
  if (editorInstance) {
    editorInstance.dispose();
  }
});

watch(isDark, (newVal) => {
  if (editorInstance) {
    monaco.editor.setTheme(newVal ? "vs-dark" : "vs");
  }
});

// Topic Logic
const topicOptions = ref<SolutionTopic[]>([]);
const selectedTopicIds = ref<string[]>([]);
const selectedTopics = computed(() =>
  topicOptions.value.filter((topic) =>
    selectedTopicIds.value.includes(topic.id),
  ),
);
const showTopicPicker = ref<boolean>(false);
const isLoadingTopics = ref(false);
const topicLoadError = ref<string | null>(null);

const loadTopics = async () => {
  isLoadingTopics.value = true;
  topicLoadError.value = null;
  try {
    const { topics } = await fetchSolutionTopics();
    topicOptions.value = topics;
    if (!selectedTopicIds.value.length && topics.length) {
      selectedTopicIds.value = [topics[0]!.id];
    }
  } catch (error) {
    console.error("Failed to load solution topics", error);
    topicLoadError.value = "Failed to load topics";
  } finally {
    isLoadingTopics.value = false;
  }
};

const isDraftSaved = ref(true);
const draftStatus = computed(() =>
  isDraftSaved.value ? "Draft saved" : "Editing draft...",
);

const markDraftSaved = useDebounceFn(() => {
  isDraftSaved.value = true;
}, 800);

watch([title, editorContent, selectedTopicIds], () => {
  isDraftSaved.value = false;
  markDraftSaved();
});

const toggleTopic = (topicId: string) => {
  if (selectedTopicIds.value.includes(topicId)) {
    selectedTopicIds.value = selectedTopicIds.value.filter(
      (item) => item !== topicId,
    );
  } else {
    selectedTopicIds.value = [...selectedTopicIds.value, topicId];
  }
};

const removeTopic = (topicId: string) => {
  selectedTopicIds.value = selectedTopicIds.value.filter(
    (item) => item !== topicId,
  );
};

const handlePublish = () => {
  isDraftSaved.value = true;
  console.log("Publishing solution", {
    title: title.value,
    topics: selectedTopicIds.value,
    topicLabels: selectedTopics.value.map((topic) => topic.name),
    content: editorContent.value,
    problemId: resolvedProblemId.value,
  });
  // 发布成功后返回题目详情页
  router.push({
    name: "problem-detail",
    params: { id: resolvedProblemId.value },
  });
  // TODO: Add actual publish API call here
};

const handleGoBack = () => {
  router.back();
};

const previewHtml = computed(() => renderMarkdown(editorContent.value));
</script>

<style>
.markdown-content h1 {
  font-size: 1.5rem;
  font-weight: 700;
  margin-top: 1rem;
  margin-bottom: 0.5rem;
}

.markdown-content h2 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-top: 0.875rem;
  margin-bottom: 0.5rem;
}

.markdown-content blockquote {
  border-left: 4px solid var(--color-border);
  padding-left: 1rem;
  color: var(--text-secondary);
  margin: 0.5rem 0;
}

.markdown-content ul {
  list-style: disc;
  margin-left: 1.5rem;
}

.markdown-content ol {
  list-style: decimal;
  margin-left: 1.5rem;
}

.markdown-content pre {
  background-color: var(--color-secondary);
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin: 1rem 0;
}

.markdown-content code {
  font-family: "Fira Code", monospace;
  font-size: 0.875rem;
}

.markdown-content pre code {
  background-color: transparent;
  padding: 0;
}

.markdown-content table {
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
}

.markdown-content th,
.markdown-content td {
  border: 1px solid var(--color-border);
  padding: 0.5rem;
  text-align: left;
}

.markdown-content th {
  background-color: var(--color-muted);
}

.markdown-content a {
  color: var(--color-primary);
  text-decoration: underline;
}
</style>
