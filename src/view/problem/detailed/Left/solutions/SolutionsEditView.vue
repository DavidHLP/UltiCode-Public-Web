<template>
  <div class="flex min-h-screen w-full flex-col bg-background">
    <!-- 顶部导航栏 -->
    <div class="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div class="flex h-14 items-center gap-4 px-4">
        <Button
          variant="ghost"
          size="sm"
          class="gap-2"
          @click="handleGoBack"
        >
          <ArrowLeft class="h-4 w-4" />
          返回
        </Button>
        <div class="flex-1" />
        <span class="text-xs text-muted-foreground">
          {{ draftStatus }}
        </span>
        <Button size="sm" class="h-9 px-3" @click="handlePublish">
          <SendHorizonal class="h-4 w-4" />
          <span>发布题解</span>
        </Button>
      </div>
    </div>

    <!-- 主体内容 -->
    <div class="flex w-full flex-1 justify-center px-4 py-6">
      <div
        class="bg-card shadow-sm flex w-full max-w-[960px] flex-col overflow-hidden rounded-xl border border-border"
      >
        <!-- 标题和话题区域 -->
        <div
          class="flex w-full flex-col gap-4 border-b border-border px-6 py-6"
        >
          <Input
            v-model="title"
            placeholder="请输入标题"
            class="h-12 border-0 bg-transparent px-0 text-lg font-semibold shadow-none focus-visible:border-transparent focus-visible:ring-0"
          />

          <div class="flex flex-wrap items-center gap-2">
            <div class="relative">
              <button
                type="button"
                class="flex cursor-pointer items-center gap-1 rounded-full bg-muted px-3 py-1 text-sm font-medium text-foreground transition-colors hover:bg-muted/80"
                @click="showTopicPicker = !showTopicPicker"
              >
                <Tag class="h-3.5 w-3.5" />
                <span>话题</span>
              </button>
              <div
                v-if="showTopicPicker"
                class="absolute z-10 mt-2 w-72 rounded-lg border border-border bg-popover p-2 text-sm shadow-lg"
              >
                <p class="px-1 pb-2 text-[11px] uppercase tracking-wide text-muted-foreground">
                  Select or deselect topics
                </p>
                <div
                  v-if="isLoadingTopics"
                  class="px-2 py-1 text-xs text-muted-foreground"
                >
                  Loading topics…
                </div>
                <div
                  v-else-if="topicLoadError"
                  class="px-2 py-1 text-xs text-destructive"
                >
                  {{ topicLoadError }}
                </div>
                <div
                  v-else-if="!topicOptions.length"
                  class="px-2 py-1 text-xs text-muted-foreground"
                >
                  No topics available
                </div>
                <template v-else>
                  <button
                    v-for="topic in topicOptions"
                    :key="topic.id"
                    type="button"
                    class="flex w-full items-start justify-between gap-2 rounded-md px-2 py-1 text-left text-sm transition-colors hover:bg-muted"
                    @click="toggleTopic(topic.id)"
                  >
                    <span class="flex flex-col gap-0.5">
                      <span class="font-medium">{{ topic.name }}</span>
                      <span class="text-[11px] leading-tight text-muted-foreground">
                        {{ topic.nameTranslated || topic.slug }}
                      </span>
                    </span>
                    <span
                      v-if="selectedTopicIds.includes(topic.id)"
                      class="mt-0.5 text-xs font-semibold text-primary"
                    >
                      Selected
                    </span>
                  </button>
                </template>
              </div>
            </div>

            <Badge
              v-for="topic in selectedTopics"
              :key="topic.id"
              variant="secondary"
              class="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs"
            >
              <span>{{ topic.name }}</span>
              <button
                type="button"
                class="text-muted-foreground transition hover:text-foreground"
                @click="removeTopic(topic.id)"
              >
                <X class="h-3 w-3" />
              </button>
            </Badge>
          </div>
        </div>

        <!-- 编辑器区域 -->
        <div
          class="h-[calc(100vh-14rem)] w-full overflow-hidden px-6 py-4"
        >
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
    </div>
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
import { SendHorizonal, Tag, X, ArrowLeft } from "lucide-vue-next";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Badge from "@/components/ui/badge/Badge.vue";
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
const editorContent = ref<string>(`# 思路

> 你选用何种方法解题？

# 解题过程

> 这些方法具体怎么运用？

# 复杂度

- 时间复杂度: $O(*)$
- 空间复杂度: $O(*)$

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
  topicOptions.value.filter((topic) => selectedTopicIds.value.includes(topic.id)),
);
const showTopicPicker = ref(false);
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
  isDraftSaved.value ? "草稿已保存" : "正在编辑草稿…",
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

<style scoped>
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
