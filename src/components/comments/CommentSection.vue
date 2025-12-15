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
        <CommentNode
          v-for="comment in comments"
          :key="comment.id"
          :comment="comment"
          :is-last="true"
          :is-root="true"
          @reply="handleReply"
        />
        <div
          v-if="comments.length === 0"
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
import CommentNode from "./CommentNode.vue";

const route = useRoute();
const comments = ref<Comment[]>([]);
const loading = ref(true);

// Backend types helper
interface ForumUser {
  username: string;
  avatar: string | null;
}

interface ForumComment {
  id: string;
  parentId: string | null;
  body: string;
  upvotes: number;
  createdAt: string;
  author: ForumUser;
}

const totalComments = computed(() => {
  const countNodes = (nodes: Comment[]): number => {
    return nodes.reduce(
      (acc, node) => acc + 1 + (node.children ? countNodes(node.children) : 0),
      0,
    );
  };
  return countNodes(comments.value);
});

const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "just now";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
};

const buildCommentTree = (flatComments: ForumComment[]): Comment[] => {
  const commentMap = new Map<string, Comment>();
  const roots: Comment[] = [];

  // 1. Create all Comment objects
  flatComments.forEach((c) => {
    commentMap.set(c.id, {
      id: c.id,
      author: c.author.username,
      avatar:
        c.author.avatar ||
        `https://api.dicebear.com/7.x/identicon/svg?seed=${c.author.username}`,
      time: formatRelativeTime(c.createdAt),
      votes: c.upvotes,
      content: c.body.split(/\r?\n/), // Split by newline to support multi-paragraph rendering
      children: [],
    });
  });

  // 2. Link children to parents
  flatComments.forEach((c) => {
    const current = commentMap.get(c.id)!;
    if (c.parentId && commentMap.has(c.parentId)) {
      const parent = commentMap.get(c.parentId)!;
      parent.children!.push(current);
    } else {
      roots.push(current);
    }
  });

  return roots;
};

const fetchComments = async () => {
  const postId = route.params.id as string;
  if (!postId) return;

  try {
    loading.value = true;
    const response = await fetch(`/api/forum/posts/${postId}/thread`);
    if (!response.ok) throw new Error("Failed to fetch thread");

    const data = await response.json();
    // data is { ...post, comments: [...] }
    if (data && data.comments) {
      comments.value = buildCommentTree(data.comments);
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
