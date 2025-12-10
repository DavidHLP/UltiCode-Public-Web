<script setup lang="ts">
import type { ForumComment } from "@/types/forum.ts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Lock, MessageSquare } from "lucide-vue-next";
import CommentNode from "@/views/forum/components/CommentNode.vue";
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
  <Card class="border-border/60 bg-card shadow-sm">
    <CardHeader class="space-y-1 border-b border-border/60 px-4 py-3">
      <CardTitle class="flex items-center gap-2 text-sm font-semibold">
        <MessageSquare class="h-4 w-4 text-blue-500" />
        Comments
      </CardTitle>
    </CardHeader>
    <CardContent class="p-4">
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
    </CardContent>
  </Card>
</template>
