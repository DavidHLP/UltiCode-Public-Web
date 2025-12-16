<script setup lang="ts">
import type { ForumComment } from "@/types/forum.ts";
import type { Comment } from "@/types/comment.ts";
import { Button } from "@/components/ui/button";
import { Lock, Image as ImageIcon, FileVideo, Type } from "lucide-vue-next";
import CommentNode from "@/components/comments/CommentNode.vue";
import MarkdownEdit from "@/components/markdown/MarkdownEdit.vue";
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
const isCommenting = ref(false);

function submit() {
  const text = commentText.value.trim();
  if (!text || props.isLocked) return;
  emit("submit", text);
  commentText.value = "";
  isCommenting.value = false;
}

function handleReply(commentId: string | number, content: string) {
  emit("submit", content, String(commentId));
}

const adaptedComments = computed(() => {
  const commentMap = new Map<string, Comment>();
  const roots: Comment[] = [];

  // 1. Create all Comment objects
  props.comments.forEach((c) => {
    commentMap.set(c.id, {
      id: c.id,
      author: c.author.username,
      avatar:
        c.author.avatar ||
        `https://api.dicebear.com/7.x/identicon/svg?seed=${c.author.username}`,
      time: formatRelativeTime(c.createdAt),
      votes: c.upvotes,
      content: c.body,
      isOp: false, // Could calculate if post author ID available
      children: [],
    });
  });

  // 2. Link children to parents
  props.comments.forEach((c) => {
    const current = commentMap.get(c.id)!;
    if (c.parentId && commentMap.has(c.parentId)) {
      const parent = commentMap.get(c.parentId)!;
      parent.children = parent.children || [];
      parent.children.push(current);
    } else {
      roots.push(current);
    }
  });

  return roots;
});
</script>

<template>
  <div class="space-y-4 px-4 sm:px-6 pb-6">
    <div v-if="!isCommenting && !props.isLocked" class="mb-6">
      <div
        class="w-full rounded-full border border-muted bg-muted/50 px-4 py-2.5 text-sm text-muted-foreground cursor-text hover:bg-muted/70 transition-colors"
        @click="isCommenting = true"
      >
        Join the conversation
      </div>
    </div>

    <form v-if="isCommenting" class="space-y-2 mb-6" @submit.prevent="submit">
      <div
        class="rounded-lg border border-input bg-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 overflow-hidden"
      >
        <MarkdownEdit
          v-model="commentText"
          :hide-header="true"
          :read-only="isLocked"
          editor-class="!min-h-[60px] !border-0 rounded-none focus-within:ring-0"
        />
        <div class="flex items-center justify-between p-2 bg-muted/20 border-t">
          <div class="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              class="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <ImageIcon class="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              class="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <FileVideo class="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              class="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <Type class="h-4 w-4" />
            </Button>
          </div>
          <div class="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              class="rounded-full px-4 h-8 bg-muted hover:bg-muted/80"
              @click="isCommenting = false"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              class="rounded-full px-4 h-8"
              :disabled="!commentText.trim() || isLocked"
            >
              Comment
            </Button>
          </div>
        </div>
      </div>

      <div
        v-if="isLocked"
        class="flex items-center gap-1 text-[11px] text-amber-600 px-1"
      >
        <Lock class="h-3 w-3" /> Thread is locked
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
