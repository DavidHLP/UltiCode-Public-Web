<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { toast } from "vue-sonner";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ThumbsUp, ThumbsDown } from "lucide-vue-next";
import type {
  ProblemDetail,
  ProblemInteractionCounts,
  ProblemReactionType,
} from "@/types/problem-detail";
import {
  operateEdgeOperation,
  fetchEdgeOperationStatus,
  EdgeOperationTargetType,
  EdgeOperationType,
} from "@/api/interaction";
import { BookmarkType } from "@/types/bookmark";
import ProblemSaveButton from "./ProblemSaveButton.vue";
import { fetchCurrentUserId, isAuthenticated } from "@/utils/auth";

interface Props {
  problem?: ProblemDetail | null;
}

const props = defineProps<Props>();

const interactionCounts = ref<ProblemInteractionCounts>({
  likes: 0,
  dislikes: 0,
});

const viewerInteraction = ref<{
  reaction: ProblemReactionType | undefined;
}>({
  reaction: undefined,
});

const isLoadingInteractions = ref(false);

const loadInteractions = async (problemId: number | string) => {
  const userId = fetchCurrentUserId();
  isLoadingInteractions.value = true;
  try {
    const opsRes = await fetchEdgeOperationStatus(
      EdgeOperationTargetType.PROBLEM,
      problemId.toString(),
      userId ?? undefined,
    );

    interactionCounts.value = {
      likes: opsRes.likes,
      dislikes: opsRes.dislikes,
    };
    viewerInteraction.value = {
      reaction:
        opsRes.viewer.vote === 1
          ? "like"
          : opsRes.viewer.vote === -1
            ? "dislike"
            : undefined,
    };
  } catch (e) {
    console.error("Failed to load interactions", e);
  } finally {
    isLoadingInteractions.value = false;
  }
};

watch(
  () => props.problem?.id,
  (problemId) => {
    if (problemId) {
      // First try to use interactions from props if available
      if (props.problem?.interactions) {
        interactionCounts.value = { ...props.problem.interactions.counts };
        viewerInteraction.value = {
          reaction: props.problem.interactions.viewer?.reaction,
        };
      } else {
        // Otherwise fetch from API
        loadInteractions(problemId);
      }
    }
  },
  { immediate: true },
);

const reactionCounts = computed(() => interactionCounts.value);
const isLiked = computed(() => viewerInteraction.value.reaction === "like");
const isDisliked = computed(
  () => viewerInteraction.value.reaction === "dislike",
);

const toggleReaction = async (reaction: "like" | "dislike") => {
  if (!props.problem) return;
  if (!isAuthenticated()) {
    toast.error("Please log in to vote.");
    return;
  }
  const operationType =
    reaction === "like"
      ? EdgeOperationType.VOTE_UP
      : EdgeOperationType.VOTE_DOWN;
  try {
    const res = await operateEdgeOperation(
      operationType,
      EdgeOperationTargetType.PROBLEM,
      props.problem.id.toString(),
    );
    interactionCounts.value.likes = res.likes;
    interactionCounts.value.dislikes = res.dislikes;
    viewerInteraction.value.reaction =
      res.viewer.vote === 1
        ? "like"
        : res.viewer.vote === -1
          ? "dislike"
          : undefined;
  } catch (e) {
    console.error("Failed to toggle reaction", e);
  }
};
</script>

<template>
  <div v-if="problem" class="relative group/actions flex items-center">
    <Button
      variant="ghost"
      size="icon"
      aria-label="Like"
      :aria-pressed="isLiked"
      :class="[
        'group flex-none cursor-pointer flex items-center h-8 transition-none hover:bg-gray-200 w-auto px-2 gap-1 focus:outline-none focus:ring-0 focus:ring-offset-0',
        isLiked ? 'text-blue-600' : 'text-gray-600',
      ]"
      @click="toggleReaction('like')"
    >
      <ThumbsUp class="h-4 w-4" />
      <span class="text-xs">{{ reactionCounts.likes }}</span>
    </Button>

    <Button
      variant="ghost"
      size="icon"
      aria-label="Dislike"
      :aria-pressed="isDisliked"
      :class="[
        'group flex-none cursor-pointer flex items-center h-8 transition-none hover:bg-gray-200 w-auto px-2 gap-1 focus:outline-none focus:ring-0 focus:ring-offset-0',
        isDisliked ? 'text-rose-600' : 'text-gray-600',
      ]"
      @click="toggleReaction('dislike')"
    >
      <ThumbsDown class="h-4 w-4" />
      <span class="text-xs">{{ reactionCounts.dislikes }}</span>
    </Button>

    <ProblemSaveButton
      :problem-id="problem.id"
      :target-type="BookmarkType.PROBLEM"
    />

    <Separator orientation="vertical" class="h-7 w-px flex-none bg-gray-200" />
  </div>
</template>
