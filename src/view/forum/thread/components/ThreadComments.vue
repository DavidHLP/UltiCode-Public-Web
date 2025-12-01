<script setup lang="ts">
import type { ForumComment } from "@/mocks/schema/forum.ts";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-vue-next";
import CommentNode from "@/view/forum/thread/components/CommentNode.vue";
import { ref } from "vue";

const props = defineProps<{
  comments: ForumComment[];
  isLocked?: boolean;
}>();

const emit = defineEmits<{
  (e: "submit", body: string): void;
}>();

const commentText = ref("");

function submit() {
  const text = commentText.value.trim();
  if (!text || props.isLocked) return;
  emit("submit", text);
  commentText.value = "";
}
</script>

<template>
  <form class="space-y-2 mb-4" @submit.prevent="submit">
    <Textarea
      v-model="commentText"
      placeholder="Write a comment..."
      :disabled="isLocked"
    />
    <div
      class="flex items-center justify-between text-[11px] text-muted-foreground"
    >
      <span
        v-if="isLocked"
        class="inline-flex items-center gap-1 text-amber-600"
      >
        <Lock class="h-3 w-3" /> Thread is locked
      </span>
      <div class="ml-auto">
        <Button
          type="submit"
          size="sm"
          class="gap-2"
          :disabled="!commentText.trim() || isLocked"
        >
          Post comment
        </Button>
      </div>
    </div>
  </form>
  <ul class="space-y-4">
    <CommentNode
      v-for="comment in comments"
      :key="comment.id"
      :comment="comment"
    />
  </ul>
</template>
