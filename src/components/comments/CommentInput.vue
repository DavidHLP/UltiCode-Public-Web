<template>
  <div class="flex gap-4 p-4 border rounded-md bg-background">
    <div class="w-8 h-8 rounded-full overflow-hidden bg-muted shrink-0">
      <!-- User Avatar Placeholder -->
      <div
        class="w-full h-full flex items-center justify-center text-xs font-bold text-muted-foreground"
      >
        ME
      </div>
    </div>
    <div class="flex-1 space-y-2">
      <div
        class="w-full min-h-[100px] rounded-md border border-input bg-background focus-within:ring-2 focus-within:ring-primary/50"
      >
        <MarkdownEdit
          v-model="content"
          :hide-header="true"
          editor-class="!min-h-[100px]"
        />
      </div>
      <div class="flex justify-end gap-2">
        <button
          v-if="onCancel"
          @click="onCancel"
          class="px-4 py-1.5 text-sm font-semibold text-muted-foreground rounded hover:bg-muted transition-colors"
        >
          Cancel
        </button>
        <button
          @click="submit"
          :disabled="!content.trim()"
          class="px-4 py-1.5 text-sm font-semibold text-white bg-blue-600 rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Comment
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import MarkdownEdit from "@/components/markdown/MarkdownEdit.vue";

const props = defineProps<{
  parentId?: number | string;
  onCancel?: () => void;
}>();

const emit = defineEmits<{
  (e: "submit", content: string, parentId?: number | string): void;
}>();

const content = ref("");

const submit = () => {
  if (!content.value.trim()) return;
  emit("submit", content.value, props.parentId);
  content.value = "";
};
</script>
