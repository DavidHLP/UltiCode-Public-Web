<script setup lang="ts">
import { renderMarkdown } from "@/utils/markdown";
import { toast } from "vue-sonner";

const props = defineProps<{
  /** Markdown 内容 */
  content: string;
  /** 编辑器 ID，用于区分多个实例 */
  editorId?: string;
}>();

const handleCopy = (e: MouseEvent) => {
  const target = (e.target as HTMLElement).closest(".lc-copy-btn");
  if (!target) return;

  const code = (target as HTMLElement).dataset.code;
  if (code) {
    try {
      const decoded = decodeURIComponent(code);
      navigator.clipboard.writeText(decoded);
      toast.success("Code copied to clipboard");
    } catch (err) {
      console.error("Failed to copy", err);
    }
  }
};
</script>

<template>
  <div class="markdown-view" @click="handleCopy">
    <div
      class="prose prose-sm dark:prose-invert max-w-none w-full bg-transparent"
      v-html="renderMarkdown(props.content)"
    ></div>
  </div>
</template>
