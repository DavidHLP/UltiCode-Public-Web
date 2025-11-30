<script setup lang="ts">
import { computed } from "vue";
import { usePreferredDark } from "@vueuse/core";
import { MdPreview, config } from "md-editor-v3";
import "md-editor-v3/lib/preview.css";
import katex from "katex";
import "katex/dist/katex.css";

config({
  editorExtensions: {
    katex: {
      instance: katex,
    },
  },
});

const props = defineProps<{
  /** Markdown 内容 */
  content: string;
  /** 编辑器 ID，用于区分多个实例 */
  editorId?: string;
}>();

const isDark = usePreferredDark();
const theme = computed(() => (isDark.value ? "dark" : "light"));
</script>

<template>
  <div class="markdown-view">
    <MdPreview
      :model-value="props.content"
      :theme="theme"
      :editor-id="props.editorId ?? 'markdown-preview'"
      :katex="katex"
      class="w-full bg-transparent"
    />
  </div>
</template>

<style scoped>
:deep(.md-editor-preview) {
  background: transparent;
  font-size: 0.95rem;
  line-height: 1.5;
}

:deep(.md-editor-preview h1) {
  font-size: 1.35rem;
  font-weight: 700;
  margin-top: 1rem;
  margin-bottom: 0.5rem;
}

:deep(.md-editor-preview h2) {
  font-size: 1.15rem;
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
  font-size: 0.95rem;
}

:deep(.md-editor-preview ol) {
  list-style: decimal;
  margin-left: 1.5rem;
  font-size: 0.95rem;
}
</style>
