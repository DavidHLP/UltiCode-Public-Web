<script setup lang="ts">
import type { ForumComment } from "@/types/forum.ts";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-vue-next";
import CommentNode from "@/views/forum/comments/components/CommentNode.vue";
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
  <div class="space-y-4 px-4 sm:px-6 pb-6">
    <form class="space-y-2 mb-6" @submit.prevent="submit">
      <Textarea
        v-model="commentText"
        placeholder="What are your thoughts?"
        :disabled="isLocked"
        class="min-h-[100px] resize-y"
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
            class="rounded-full px-4"
            :disabled="!commentText.trim() || isLocked"
          >
            Comment
          </Button>
        </div>
      </div>
    </form>

    <div class="space-y-6">
      <div
        v-if="comments.length === 0"
        class="text-center py-10 text-muted-foreground text-sm"
      >
        No comments yet. Be the first to share what you think!
      </div>
      <ul class="space-y-4">
        <CommentNode
          v-for="comment in comments"
          :key="comment.id"
          :comment="comment"
        />
      </ul>
    </div>
  </div>
</template>
