<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ThumbsUp, ThumbsDown, Bookmark } from "lucide-vue-next";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import type {
  ProblemDetail,
  ProblemInteractionCounts,
  ProblemReactionType,
} from "@/types/problem-detail";
import {
  operateEdgeOperation,
  EdgeOperationTargetType,
  EdgeOperationType,
} from "@/api/interaction";
import { fetchProblemLists, addProblemToList } from "@/api/problem-list";
import type { ProblemList } from "@/types/problem-list";
import { toast } from "vue-sonner";

interface Props {
  problem?: ProblemDetail | null;
}

const props = defineProps<Props>();

const interactionCounts = ref<ProblemInteractionCounts>({
  likes: 0,
  dislikes: 0,
  favorites: 0,
});

const viewerInteraction = ref<{
  reaction: ProblemReactionType | undefined;
  isFavorite: boolean;
}>({
  reaction: undefined,
  isFavorite: false,
});

const userLists = ref<ProblemList[]>([]);
const isLoadingLists = ref(false);
const userId = "user-yuki"; // TODO: Get from auth context

const loadUserLists = async () => {
  if (userLists.value.length > 0) return;
  isLoadingLists.value = true;
  try {
    const groups = await fetchProblemLists();
    const createdGroup = groups.find((g) => g.id === "group-created");
    if (createdGroup) {
      userLists.value = createdGroup.lists;
    }
  } catch (error) {
    console.error("Failed to fetch lists", error);
    toast.error("Failed to load your lists");
  } finally {
    isLoadingLists.value = false;
  }
};

const handleAddToList = async (listId: string) => {
  if (!props.problem) return;
  try {
    await addProblemToList(listId, userId, Number(props.problem.id));
    toast.success("Added to list successfully");
  } catch (error) {
    console.error("Failed to add to list", error);
    toast.error("Failed to add to list");
  }
};

watch(
  () => props.problem?.interactions,
  (interactions) => {
    if (!interactions) return;
    interactionCounts.value = { ...interactions.counts };
    viewerInteraction.value = {
      reaction: interactions.viewer?.reaction,
      isFavorite: !!interactions.viewer?.isFavorite,
    };
  },
  { immediate: true, deep: true },
);

const reactionCounts = computed(() => interactionCounts.value);
const isLiked = computed(() => viewerInteraction.value.reaction === "like");
const isDisliked = computed(
  () => viewerInteraction.value.reaction === "dislike",
);
const isFavorited = computed(() => viewerInteraction.value.isFavorite);

const toggleReaction = async (reaction: "like" | "dislike") => {
  if (!props.problem) return;
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
    interactionCounts.value.favorites = res.favorites;
    viewerInteraction.value.reaction =
      res.userOperation === EdgeOperationType.VOTE_UP
        ? "like"
        : res.userOperation === EdgeOperationType.VOTE_DOWN
          ? "dislike"
          : undefined;
  } catch (e) {
    console.error("Failed to toggle reaction", e);
  }
};

const toggleFavorite = async () => {
  if (!props.problem) return;
  try {
    const res = await operateEdgeOperation(
      EdgeOperationType.FAVORITE,
      EdgeOperationTargetType.PROBLEM,
      props.problem.id.toString(),
    );
    interactionCounts.value.likes = res.likes;
    interactionCounts.value.dislikes = res.dislikes;
    interactionCounts.value.favorites = res.favorites;
    viewerInteraction.value.isFavorite =
      res.userOperation === EdgeOperationType.FAVORITE;
  } catch (e) {
    console.error("Failed to toggle favorite", e);
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

    <DropdownMenu @update:open="(isOpen) => isOpen && loadUserLists()">
      <DropdownMenuTrigger as-child>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Save"
          :aria-pressed="isFavorited"
          :class="[
            'group flex-none cursor-pointer flex items-center h-8 transition-none hover:bg-gray-200 w-auto px-2 gap-1 focus:outline-none focus:ring-0 focus:ring-offset-0',
            isFavorited ? 'text-amber-600' : 'text-gray-600',
          ]"
        >
          <Bookmark class="h-4 w-4" />
          <span class="text-xs">{{ reactionCounts.favorites }}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent class="w-56" align="end">
        <DropdownMenuLabel>Save to...</DropdownMenuLabel>
        <DropdownMenuCheckboxItem
          :checked="isFavorited"
          @select.prevent="toggleFavorite"
        >
          <span class="flex-1">Favorites</span>
          <span
            class="text-xs text-gray-500 ml-2"
            v-if="reactionCounts.favorites > 0"
          >
            {{ reactionCounts.favorites }}
          </span>
        </DropdownMenuCheckboxItem>

        <DropdownMenuSeparator />

        <DropdownMenuLabel>My Lists</DropdownMenuLabel>
        <div
          v-if="isLoadingLists"
          class="p-2 text-xs text-center text-gray-500"
        >
          Loading...
        </div>
        <div
          v-else-if="userLists.length === 0"
          class="p-2 text-xs text-center text-gray-500"
        >
          No custom lists found
        </div>
        <DropdownMenuGroup v-else>
          <DropdownMenuItem
            v-for="list in userLists"
            :key="list.id"
            class="cursor-pointer"
            @select="handleAddToList(list.id)"
          >
            <span>{{ list.name }}</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>

    <Separator orientation="vertical" class="h-7 w-px flex-none bg-gray-200" />
  </div>
</template>
