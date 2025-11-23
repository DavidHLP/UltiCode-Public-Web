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
      class="w-full bg-transparent"
    />
  </div>
</template>
