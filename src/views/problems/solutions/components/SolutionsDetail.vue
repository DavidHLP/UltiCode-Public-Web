<script setup lang="ts">
import type { SolutionFeedItem } from "@/types/solution";
import type { ForumComment } from "@/types/forum";
import MarkdownView from "@/components/markdown/MarkdownView.vue";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Badge from "@/components/ui/badge/Badge.vue";
import { Separator } from "@/components/ui/separator";
import { Eye, MessageCircle } from "lucide-vue-next";
import { computed, ref, watch } from "vue";
import { ThreadComments } from "@/components/comments";
import {
  fetchSolutionComments,
  createSolutionComment,
  voteSolution,
  voteSolutionComment,
} from "@/api/solution";
import { Vote } from "@/components/vote";
import "highlight.js/styles/atom-one-dark.css";

const props = defineProps<{
  item: SolutionFeedItem;
}>();

const authorInitial = computed(
  () => props.item.author.name.charAt(0)?.toUpperCase() ?? "?"
);

const topicLabel = computed(
  () =>
    props.item.topicName ||
    props.item.topicTranslated ||
    props.item.topic ||
    "topic"
);

const comments = ref<ForumComment[]>([]);
const localStats = ref<{ likes: number; dislikes: number }>({
  likes: 0,
  dislikes: 0,
});

watch(
  () => props.item,
  (newItem) => {
    localStats.value = {
      likes: newItem.stats?.likes ?? 0,
      dislikes: 0, // Assuming initial dislikes are 0 or not provided by feed yet
    };
  },
  { immediate: true, deep: true }
);

const loadComments = async () => {
  if (!props.item.id || props.item.id === "follow-up") {
    comments.value = [];
    return;
  }
  try {
    comments.value = await fetchSolutionComments(props.item.id);
  } catch (error) {
    console.error("Failed to load comments", error);
    comments.value = [];
  }
};

const handleCommentSubmit = async (content: string, parentId?: string) => {
  try {
    if (!props.item.id || props.item.id === "follow-up") return;
    await createSolutionComment(props.item.id, content, parentId);
    await loadComments();
  } catch (error) {
    console.error("Failed to post comment", error);
  }
};

const handleSolutionVote = async (voteType: 1 | -1) => {
  try {
    if (!props.item.id || props.item.id === "follow-up") return;
    // Optimistic update
    // Note: Use a more complex logic if we want to toggle locally first.
    // For now, let's just call API and update.
    const res = await voteSolution(props.item.id, "u-001", voteType);
    localStats.value = { ...res };
  } catch (error) {
    console.error("Failed to vote solution", error);
  }
};

const handleCommentVote = async (
  commentId: string | number,
  voteType: 1 | -1
) => {
  try {
    const res = await voteSolutionComment(String(commentId), "u-001", voteType);

    // Update local state
    const commentIndex = comments.value.findIndex((c) => c.id === commentId);
    if (commentIndex !== -1 && comments.value[commentIndex]) {
      comments.value[commentIndex].upvotes = res.likes;
    }
  } catch (error) {
    console.error("Failed to vote comment", error);
  }
};

watch(() => props.item.id, loadComments, { immediate: true });
</script>

<template>
  <article
    class="group flex flex-col gap-3 border-b border-border px-0 py-5 last:border-b-0"
  >
    <header class="flex items-start gap-3">
      <Avatar class="h-10 w-10 border border-border/50">
        <AvatarFallback
          class="text-xs font-semibold text-white"
          :style="{ backgroundColor: props.item.author.avatarColor }"
        >
          {{ authorInitial }}
        </AvatarFallback>
      </Avatar>

      <div class="flex flex-1 flex-col gap-1.5 text-sm leading-tight">
        <div class="flex flex-wrap items-center gap-2">
          <span class="font-semibold text-foreground">
            {{ props.item.author.name }}
          </span>
          <span class="truncate text-muted-foreground">
            {{ props.item.author.role }}
          </span>
          <span class="text-xs text-muted-foreground">
            · {{ props.item.created_at }}
          </span>
          <Badge
            v-if="props.item.flair"
            variant="secondary"
            class="rounded-full bg-orange-100 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-orange-700 hover:bg-orange-100"
          >
            {{ props.item.flair }}
          </Badge>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <Badge
            variant="secondary"
            class="rounded-full px-2.5 py-0.5 text-[11px] capitalize"
          >
            {{ props.item.language }}
          </Badge>
          <Badge
            variant="secondary"
            class="rounded-full px-2.5 py-0.5 text-[11px] capitalize"
          >
            {{ topicLabel }}
          </Badge>
          <Badge
            v-for="badge in props.item.badges"
            :key="badge"
            variant="outline"
            class="rounded-full px-2.5 py-0.5 text-[11px] font-medium"
          >
            {{ badge }}
          </Badge>
        </div>
      </div>
    </header>

    <section class="space-y-4 text-sm leading-relaxed">
      <!-- Markdown 内容展示 -->
      <MarkdownView
        :content="props.item.content"
        :editor-id="`solution-${props.item.id}`"
      />

      <!-- 标签 -->
      <div v-if="props.item.tags.length" class="flex flex-wrap gap-2">
        <Badge
          v-for="tag in props.item.tags"
          :key="tag"
          variant="secondary"
          class="rounded-full px-3 py-1 text-xs"
        >
          {{ tag }}
        </Badge>
      </div>

      <Separator class="my-2" />

      <!-- 统计信息 -->
      <!-- 统计信息和操作 -->
      <div class="flex items-center gap-6 text-muted-foreground select-none">
        <!-- Vote Pill -->
        <Vote
          :votes="localStats.likes"
          :user-vote="0"
          @vote="handleSolutionVote"
        />

        <div class="flex items-center gap-1.5 text-xs">
          <Eye class="h-4 w-4" />
          {{ props.item.stats.views }}
        </div>
        <div class="flex items-center gap-1.5 text-xs">
          <MessageCircle class="h-4 w-4" />
          {{ localStats.likes }}
        </div>
      </div>
    </section>

    <!-- Comments Section -->
    <div class="mt-4">
      <Separator class="mb-4" />
      <h3 class="text-sm font-semibold mb-4">Comments</h3>
      <ThreadComments
        :comments="comments"
        :is-locked="false"
        @submit="handleCommentSubmit"
        @vote="handleCommentVote"
      />
    </div>
  </article>
</template>
