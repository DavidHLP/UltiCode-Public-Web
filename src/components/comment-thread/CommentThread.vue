<template>
  <div class="max-w-4xl mx-auto py-10 px-6">
    <div class="bg-white">
      <h2 class="text-xl font-bold mb-8 pb-4 border-b">
        Comments ({{ totalComments }} total)
      </h2>

      <div v-if="loading" class="text-center py-8 text-gray-500">
        Loading comments...
      </div>

      <div v-else class="space-y-4">
        <CommentTreeNode
          v-for="comment in commentTree"
          :key="comment.id"
          :comment="comment"
          :is-last="true"
          :is-root="true"
          @reply="handleReply"
        />
        <div
          v-if="commentTree.length === 0"
          class="text-center py-8 text-gray-400 italic"
        >
          No comments yet. Be the first to share your thoughts!
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import type { Comment } from "@/types/comment";
import type { ForumComment, ForumThread } from "@/types/forum";
import CommentTreeNode from "./CommentTreeNode.vue";
import { buildCommentTree, countComments } from "./comment-tree";

defineOptions({
  name: "CommentThread",
});

const route = useRoute();
const commentTree = ref<Comment[]>([]);
const loading = ref(true);
const threadAuthor = ref<string | undefined>();

const totalComments = computed(() => {
  return countComments(commentTree.value);
});

const fetchComments = async () => {
  const postId = route.params.id as string;
  if (!postId) return;

  try {
    loading.value = true;
    const response = await fetch(`/api/forum/posts/${postId}/thread`);
    if (!response.ok) throw new Error("Failed to fetch thread");

    const data: ForumThread & { comments: ForumComment[] } =
      await response.json();
    if (data && data.comments) {
      threadAuthor.value = data.author?.username;
      commentTree.value = buildCommentTree(data.comments, {
        postAuthorUsername: threadAuthor.value,
      });
    }
  } catch (err) {
    console.error("Error loading comments:", err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchComments();
});

const handleReply = (parentId: number | string, content: string) => {
  // Placeholder for real reply logic
  console.log("Reply to", parentId, ":", content);
  // Ideally: POST /api/forum/comments, then refetch or optimistic update
};
</script>
