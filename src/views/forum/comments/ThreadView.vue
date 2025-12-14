<script setup lang="ts">
import type { ForumThread } from "@/types/forum";
import { Skeleton } from "@/components/ui/skeleton";
import PostSkeleton from "@/views/forum/comments/components/PostSkeleton.vue";
import ThreadContent from "@/views/forum/comments/components/ThreadContent.vue";
import ThreadComments from "@/views/forum/comments/components/ThreadComments.vue";
import { fetchForumThread, createForumComment } from "@/api/forum";
import { ref, watch } from "vue";
import { useRoute, RouterLink } from "vue-router";
import { ArrowLeft } from "lucide-vue-next";

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
  { immediate: true },
);

async function onSubmitComment(body: string, parentId?: string | null) {
  const postId = route.params.postId as string;
  await createForumComment(postId, body, parentId);
  await loadThread(postId);
}
</script>

<template>
  <div class="mx-auto flex w-full max-w-5xl items-start gap-6 px-4 py-8">
    <main class="w-full min-w-0 flex-1 space-y-4">
      <div v-if="isLoading" class="space-y-6">
        <PostSkeleton />
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
        <div class="relative flex items-start gap-0.25 sm:gap-0.5 xl:block">
          <RouterLink
            to="/forum"
            class="shrink-0 inline-flex h-9 w-9 items-center justify-center rounded-full bg-muted/50 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground mt-4 sm:mt-6 xl:absolute xl:right-full xl:mr-3"
          >
            <ArrowLeft class="h-5 w-5" />
          </RouterLink>

          <div class="flex-1 min-w-0 bg-card sm:rounded-xl overflow-hidden">
            <ThreadContent :thread="thread" />
            <div class="px-4 sm:px-6 bg-muted/10 h-2"></div>
            <ThreadComments
              :comments="thread.comments"
              :is-locked="thread.isLocked"
              @submit="onSubmitComment"
            />
          </div>
        </div>
      </template>

      <div
        v-else
        class="rounded-xl border border-dashed border-destructive/40 bg-destructive/5 p-6 text-sm text-destructive"
      >
        Failed to load thread.
      </div>
    </main>
  </div>
</template>
