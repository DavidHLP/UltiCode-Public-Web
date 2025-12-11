<script setup lang="ts">
import { renderMarkdown } from "@/utils/markdown";

const props = defineProps<{
  /** Markdown 内容 */
  content: string;
  /** 编辑器 ID，用于区分多个实例 */
  editorId?: string;
}>();
</script>

<template>
  <div class="markdown-view">
    <div
      class="prose prose-sm dark:prose-invert max-w-none w-full bg-transparent"
      v-html="renderMarkdown(props.content)"
    ></div>
  </div>
</template>
