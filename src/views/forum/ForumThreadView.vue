<script setup lang="ts">
import type { ForumThread } from "@/types/forum";
import { Skeleton } from "@/components/ui/skeleton";
import ForumPostSkeleton from "@/views/forum/components/ForumPostSkeleton.vue";
import ForumThreadContent from "@/views/forum/components/ForumThreadContent.vue";
import ForumThreadComments from "@/views/forum/components/ForumThreadComments.vue";
import { fetchForumThread, createForumComment } from "@/api/forum";
import { ref, watch } from "vue";
import { useRoute, RouterLink } from "vue-router";

const route = useRoute();
const thread = ref<ForumThread | null>(null);
const isLoading = ref(true);

async function loadThread(postId: string) {
  if (!postId) return;
  isLoading.value = true;
  try {
    thread.value = await fetchForumThread(postId);
  } catch (error) {
    console.error("Failed to load forum thread", error);
    thread.value = null;
  } finally {
    isLoading.value = false;
  }
}

watch(
  () => route.params.postId as string,
  (postId) => {
    void loadThread(postId);
  },
  { immediate: true }
);

async function onSubmitComment(body: string) {
  const postId = route.params.postId as string;
  await createForumComment(postId, body, null);
  await loadThread(postId);
}
</script>

<template>
  <div class="mx-auto w-full max-w-4xl px-0 sm:px-4 lg:px-6 py-4">
    <div class="mb-4 px-4 sm:px-0">
      <RouterLink
        to="/forum"
        class="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <span class="text-xs">←</span> Back to feed
      </RouterLink>
    </div>

    <div v-if="isLoading" class="space-y-6">
      <ForumPostSkeleton />
      <div class="space-y-4 pl-4 border-l border-border/40">
        <div class="flex gap-3" v-for="i in 3" :key="i">
          <Skeleton class="h-8 w-8 rounded-full" />
          <div class="space-y-2 flex-1">
            <Skeleton class="h-4 w-32" />
            <Skeleton class="h-4 w-full" />
          </div>
        </div>
      </div>
    </div>

    <template v-else-if="thread">
      <div class="bg-card sm:rounded-xl overflow-hidden">
        <ForumThreadContent :thread="thread" />
        <div class="px-4 sm:px-6 bg-muted/10 h-2"></div>
        <ForumThreadComments
          :comments="thread.comments"
          :is-locked="thread.isLocked"
          @submit="onSubmitComment"
        />
      </div>
    </template>

    <div
      v-else
      class="rounded-xl border border-dashed border-destructive/40 bg-destructive/5 p-6 text-sm text-destructive"
    >
      Failed to load thread.
    </div>
  </div>
</template>
