<script setup lang="ts">
import type { SolutionFeedItem } from "@/types/solution";
import type { ForumComment } from "@/types/forum";
import MarkdownView from "@/components/markdown/MarkdownView.vue";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { computed, ref, watch } from "vue";
import { ThreadComments } from "@/components/comments";
import { fetchSolutionComments, createSolutionComment } from "@/api/solution";
import { vote, VoteTargetType } from "@/api/vote";
import { PostFooter } from "@/components/post-footer";
import "highlight.js/styles/atom-one-dark.css";
import { resolveUserVote, resolveVoteCounts } from "@/utils/vote";

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
const userVote = ref<0 | 1 | -1>(0);

watch(
  () => props.item,
  (newItem) => {
    localStats.value = resolveVoteCounts(
      newItem.likes,
      newItem.dislikes,
      newItem.stats,
    );
    userVote.value = resolveUserVote(newItem.userVote);
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
    const res = await vote(
      VoteTargetType.SOLUTION,
      props.item.id,
      "u-001",
      voteType
    );
    localStats.value = { likes: res.likes, dislikes: res.dislikes };
    userVote.value = res.userVote;
  } catch (error) {
    console.error("Failed to vote solution", error);
  }
};

const handleCommentVote = async (
  commentId: string | number,
  voteType: 1 | -1
) => {
  try {
    const res = await vote(
      VoteTargetType.SOLUTION_COMMENT,
      String(commentId),
      "u-001",
      voteType
    );

    // Recursive helper to find and update comment
    const updateComment = (list: ForumComment[]) => {
      for (const comment of list) {
        if (comment.id === commentId) {
          comment.likes = res.likes;
          comment.dislikes = res.dislikes;
          comment.userVote = res.userVote;
          return true;
        }
        if (comment.replies && comment.replies.length > 0) {
          if (updateComment(comment.replies)) return true;
        }
      }
      return false;
    };

    updateComment(comments.value);
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

      <!-- 统计信息和操作 -->
      <PostFooter
        :vote="{
          likes: localStats.likes,
          dislikes: localStats.dislikes,
          userVote: userVote,
        }"
        :config="{
          views: { show: true, count: props.item.stats.views },
          comments: {
            show: true,
            count: props.item.stats.comments,
            text: 'Comments',
            icon: 'message-circle',
          },
          share: { show: true, text: 'Share' },
          save: { show: true, text: 'Save' },
        }"
        class="border-t pt-4"
        @vote="handleSolutionVote"
      />
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
