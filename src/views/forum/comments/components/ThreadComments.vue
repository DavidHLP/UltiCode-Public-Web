<script setup lang="ts">
import type { ForumComment } from "@/types/forum.ts";
import type { Comment } from "@/types/comment.ts";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-vue-next";
import CommentNode from "@/components/comments/CommentNode.vue";
import { ref, computed } from "vue";
import { formatRelativeTime } from "@/utils/date";

const props = defineProps<{
  comments: ForumComment[];
  isLocked?: boolean;
}>();

const emit = defineEmits<{
  (e: "submit", body: string, parentId?: string): void;
}>();

const commentText = ref("");

function submit() {
  const text = commentText.value.trim();
  if (!text || props.isLocked) return;
  emit("submit", text);
  commentText.value = "";
}

function handleReply(commentId: string | number, content: string) {
  emit("submit", content, String(commentId));
}

function adaptComment(forumComment: ForumComment): Comment {
  return {
    id: forumComment.id,
    author: forumComment.author.username,
    avatar:
      forumComment.author.avatar ||
      `https://api.dicebear.com/7.x/identicon/svg?seed=${forumComment.author.username}`,
    time: formatRelativeTime(forumComment.createdAt),
    votes: forumComment.upvotes,
    content: [forumComment.body],
    isOp: false, // You could calculate this if you had the post author ID
    children: forumComment.replies?.map(adaptComment) || [],
  };
}

const adaptedComments = computed(() => {
  return props.comments.map(adaptComment);
});
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
        v-if="adaptedComments.length === 0"
        class="text-center py-10 text-muted-foreground text-sm"
      >
        No comments yet. Be the first to share what you think!
      </div>
      <div class="space-y-4">
        <CommentNode
          v-for="comment in adaptedComments"
          :key="comment.id"
          :comment="comment"
          :is-last="true"
          :is-root="true"
          @reply="
            (id: number | string, content: string) => handleReply(id, content)
          "
        />
      </div>
    </div>
  </div>
</template>
