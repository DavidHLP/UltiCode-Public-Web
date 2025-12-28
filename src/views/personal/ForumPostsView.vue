<script setup lang="ts">
import { onMounted, ref } from "vue";
import { RouterLink } from "vue-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { fetchMyForumPosts, deleteForumPost } from "@/api/forum";
import type { ForumPost } from "@/types/forum";
import { toast } from "vue-sonner";

const isLoading = ref(true);
const posts = ref<ForumPost[]>([]);

async function loadPosts() {
  isLoading.value = true;
  try {
    posts.value = await fetchMyForumPosts();
  } catch (error) {
    console.error("Failed to load forum posts", error);
    toast.error("Failed to load forum posts");
  } finally {
    isLoading.value = false;
  }
}

async function handleDelete(postId: string) {
  try {
    await deleteForumPost(postId);
    posts.value = posts.value.filter((post) => post.id !== postId);
    toast.success("Post deleted.");
  } catch (error) {
    console.error("Failed to delete post", error);
    toast.error("Failed to delete post.");
  }
}

onMounted(loadPosts);
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 class="text-2xl font-bold tracking-tight">My Forum Posts</h2>
        <p class="text-sm text-muted-foreground">
          Manage your published threads.
        </p>
      </div>
      <Button as-child>
        <RouterLink to="/forum/create">New Post</RouterLink>
      </Button>
    </div>

    <div v-if="isLoading" class="text-sm text-muted-foreground">
      Loading your posts...
    </div>

    <div v-else-if="posts.length === 0" class="text-sm text-muted-foreground">
      You haven't published any posts yet.
    </div>

    <div v-else class="space-y-4">
      <Card v-for="post in posts" :key="post.id">
        <CardHeader
          class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
        >
          <div class="space-y-1">
            <CardTitle class="text-base">
              <RouterLink
                :to="{ name: 'forum-thread', params: { postId: post.id } }"
                class="hover:underline"
              >
                {{ post.title }}
              </RouterLink>
            </CardTitle>
            <div class="text-xs text-muted-foreground">
              {{ post.community?.name ?? "General" }} ·
              {{ new Date(post.createdAt).toLocaleDateString() }}
            </div>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <Badge v-if="post.isPinned" variant="secondary">Pinned</Badge>
            <Badge v-if="post.isLocked" variant="outline">Locked</Badge>
            <Badge v-if="post.flair" variant="secondary">
              {{ post.flair.text }}
            </Badge>
          </div>
        </CardHeader>
        <CardContent class="flex flex-wrap items-center justify-between gap-3">
          <div class="text-xs text-muted-foreground">
            {{ post.stats?.comments ?? 0 }} comments ·
            {{ post.stats?.views ?? 0 }} views
          </div>
          <div class="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" as-child>
              <RouterLink
                :to="{ name: 'forum-edit', params: { postId: post.id } }"
              >
                Edit
              </RouterLink>
            </Button>
            <AlertDialog>
              <AlertDialogTrigger as-child>
                <Button variant="destructive" size="sm">Delete</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this post?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction @click="handleDelete(post.id)">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
