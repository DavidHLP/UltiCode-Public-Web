<script setup lang="ts">
import type {
  ForumFlairType,
  ForumThread,
  ForumPostMedia,
} from "@/mocks/schema/forum";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import ForumPostSkeleton from "@/view/forum/components/ForumPostSkeleton.vue";
import { fetchForumThread, createForumComment } from "@/api/forum";
import { MessageSquare } from "lucide-vue-next";
import { computed, ref, watch } from "vue";
import { useRoute, RouterLink } from "vue-router";
import ThreadHeader from "@/view/forum/thread/components/ThreadHeader.vue";
import ThreadMedia from "@/view/forum/thread/components/ThreadMedia.vue";
import ThreadAwards from "@/view/forum/thread/components/ThreadAwards.vue";
import ThreadActions from "@/view/forum/thread/components/ThreadActions.vue";
import ThreadComments from "@/view/forum/thread/components/ThreadComments.vue";

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

const flairClasses: Record<ForumFlairType, string> = {
  announcement: "bg-amber-100 text-amber-700",
  discussion: "bg-blue-100 text-blue-700",
  showcase: "bg-purple-100 text-purple-700",
  question: "bg-emerald-100 text-emerald-700",
  hiring: "bg-orange-100 text-orange-700",
};

const createdAgo = computed(() =>
  thread.value ? formatRelativeTime(thread.value.post.createdAt) : "",
);
const recommendationLabel = computed(
  () =>
    (thread.value?.post.recommendation as unknown as { label?: string })
      ?.label ?? "",
);
const media = computed(
  () => thread.value?.post.media as unknown as ForumPostMedia | undefined,
);
const awards = computed(() => thread.value?.post.awards ?? []);
const upvoteRatioDisplay = computed(() =>
  typeof thread.value?.post.stats.upvote_ratio === "number"
    ? `${Math.round(thread.value.post.stats.upvote_ratio * 100)}%`
    : undefined,
);
const viewsDisplay = computed(() =>
  typeof thread.value?.post.stats.views === "number"
    ? formatCount(thread.value.post.stats.views)
    : undefined,
);
const voteState = computed(() => thread.value?.post.voteState ?? "neutral");
const voteLabel = computed(() =>
  voteState.value === "upvoted"
    ? "Upvoted"
    : voteState.value === "downvoted"
      ? "Downvoted"
      : "Upvote",
);
const scoreDisplay = computed(() =>
  thread.value ? formatCount(thread.value.post.stats.score) : "0",
);
const commentsDisplay = computed(() =>
  thread.value ? formatCount(thread.value.post.stats.comments) : "0",
);
const awardsDisplay = computed(() =>
  thread.value ? formatCount(thread.value.post.stats.awards) : "0",
);
const savesDisplay = computed(() =>
  thread.value ? formatCount(thread.value.post.stats.saves) : "0",
);
const sharesDisplay = computed(() =>
  thread.value ? formatCount(thread.value.post.stats.shares) : "0",
);

function formatCount(value: number) {
  if (value >= 1000) return `${(value / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return value.toString();
}

const relativeTimeFormatter = new Intl.RelativeTimeFormat("en", {
  numeric: "auto",
});
function formatRelativeTime(value: string) {
  const date = new Date(value);
  const diffMs = date.getTime() - Date.now();
  const ranges: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 1000 * 60 * 60 * 24 * 365],
    ["month", 1000 * 60 * 60 * 24 * 30],
    ["week", 1000 * 60 * 60 * 24 * 7],
    ["day", 1000 * 60 * 60 * 24],
    ["hour", 1000 * 60 * 60],
    ["minute", 1000 * 60],
  ];
  for (const [unit, amountMs] of ranges) {
    const delta = diffMs / amountMs;
    if (Math.abs(delta) >= 1)
      return relativeTimeFormatter.format(Math.round(delta), unit);
  }
  return "just now";
}

async function onSubmitComment(body: string) {
  const postId = route.params.postId as string;
  await createForumComment(postId, body, null);
  await loadThread(postId);
}
</script>

<template>
  <div class="mx-auto w-full max-w-4xl space-y-6 px-4 lg:px-10">
    <div class="py-4">
      <RouterLink
        to="/forum"
        class="text-sm font-medium text-primary underline-offset-2 hover:underline"
      >
        ← Back to forum
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
      <Card
        class="rounded-xl border border-border/50 bg-card text-card-foreground shadow-sm"
      >
        <CardHeader class="pb-2">
          <CardTitle class="text-xl">{{ thread.post.title }}</CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
          <ThreadHeader
            :post="thread.post"
            :created-ago="createdAgo"
            :flair-classes="flairClasses"
            :upvote-ratio-display="upvoteRatioDisplay"
            :views-display="viewsDisplay"
          />
          <p v-if="recommendationLabel" class="text-xs text-muted-foreground">
            {{ recommendationLabel }}
          </p>

          <section
            v-if="thread.post.excerpt"
            class="text-sm text-muted-foreground"
          >
            {{ thread.post.excerpt }}
          </section>

          <ThreadMedia :media="media" :title="thread.post.title" />

          <ThreadAwards v-if="awards.length" :awards="awards" />
        </CardContent>
        <CardFooter
          class="flex flex-wrap items-center gap-2 border-t border-border/50 px-4 py-3"
        >
          <ThreadActions
            :vote-state="voteState"
            :vote-label="voteLabel"
            :score-display="scoreDisplay"
            :comments-display="commentsDisplay"
            :awards-display="awardsDisplay"
            :shares-display="sharesDisplay"
            :saves-display="savesDisplay"
          />
        </CardFooter>
      </Card>

      <Card class="border-border/60 bg-card shadow-sm">
        <CardHeader class="space-y-1 border-b border-border/60 px-4 py-3">
          <CardTitle class="flex items-center gap-2 text-sm font-semibold">
            <MessageSquare class="h-4 w-4 text-blue-500" />
            Comments
          </CardTitle>
        </CardHeader>
        <CardContent class="p-4">
          <ThreadComments
            :comments="thread.comments"
            :is-locked="thread.post.isLocked"
            @submit="onSubmitComment"
          />
        </CardContent>
      </Card>
    </template>

    <div
      v-else
      class="rounded-xl border border-dashed border-destructive/40 bg-destructive/5 p-6 text-sm text-destructive"
    >
      Failed to load thread.
    </div>
  </div>
</template>
