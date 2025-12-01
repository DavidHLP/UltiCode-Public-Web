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

        <div class="flex-1 overflow-hidden px-4">
          <div class="h-full overflow-x-hidden overflow-y-auto">
            <MdEditor
              v-model="editorContent"
              :theme="editorTheme"
              :toolbars="toolbarItems"
              :footers="footerItems"
              :preview-only="isPreviewMode"
              class="w-full bg-transparent"
              style="height: 100%"
              editor-id="solution-editor"
              @on-upload-img="handleUpload"
              @on-save="handleManualSave"
            />
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useDebounceFn, usePreferredDark } from "@vueuse/core";
import { MdEditor, config } from "md-editor-v3";
import type { ToolbarNames, Footers } from "md-editor-v3";
import "md-editor-v3/lib/style.css";
import katex from "katex";
import "katex/dist/katex.css";
import { SendHorizonal, Tag, X, ArrowLeft, Check } from "lucide-vue-next";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { fetchSolutionTopics } from "@/api/topic";
import type { SolutionTopic } from "@/mocks/schema/topic";

config({
  editorExtensions: {
    katex: {
      instance: katex,
    },
  },
});

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
const editorTheme = computed(() => (isDark.value ? "dark" : "light"));

const toolbarItems: ToolbarNames[] = [
  "bold",
  "underline",
  "italic",
  "strikeThrough",
  "title",
  "-",
  "quote",
  "unorderedList",
  "orderedList",
  "task",
  "codeRow",
  "code",
  "link",
  "image",
  "table",
  "katex",
  "=",
  "revoke",
  "next",
  "save",
  "preview",
  "previewOnly",
  "fullscreen",
];

const footerItems: Footers[] = ["markdownTotal", "="];

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

onMounted(loadTopics);

const isPreviewMode = ref(false);
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

const handleManualSave = () => {
  isDraftSaved.value = true;
};

const handlePublish = () => {
  isDraftSaved.value = true;
  console.log("Publishing solution", {
    title: title.value,
    topics: selectedTopicIds.value,
    topicLabels: selectedTopics.value.map((topic) => topic.name),
    content: editorContent.value,
    problemId: route.params.id,
  });
  // 发布成功后返回题目详情页
  router.push({ name: "problem-detail", params: { id: route.params.id } });
};

const handleGoBack = () => {
  router.back();
};

const handleUpload = async (
  files: File[],
  callback: (urls: string[]) => void,
) => {
  const urls = files.map((file) => URL.createObjectURL(file));
  callback(urls);
};
</script>

<style>
:deep(.md-editor) {
  border: none;
  background: transparent;
}

:deep(.md-editor-container) {
  background: transparent;
}

:deep(.md-editor--preview-only) {
  background: transparent;
}

:deep(.md-editor-text-input) {
  background: transparent;
  font-family: inherit;
}

:deep(.md-editor-toolbar) {
  border-bottom: 1px solid var(--color-border);
  background: transparent;
}

:deep(.md-editor-preview) {
  background: transparent;
}

:deep(.md-editor-preview h1) {
  font-size: 1.5rem;
  font-weight: 700;
  margin-top: 1rem;
  margin-bottom: 0.5rem;
}

:deep(.md-editor-preview h2) {
  font-size: 1.25rem;
  font-weight: 600;
  margin-top: 0.875rem;
  margin-bottom: 0.5rem;
}

:deep(.md-editor-preview blockquote) {
  border-left: 4px solid var(--color-border);
  padding-left: 1rem;
  color: var(--text-secondary);
  margin: 0.5rem 0;
}

:deep(.md-editor-preview ul) {
  list-style: disc;
  margin-left: 1.5rem;
}

:deep(.md-editor-preview ol) {
  list-style: decimal;
  margin-left: 1.5rem;
}
</style>
