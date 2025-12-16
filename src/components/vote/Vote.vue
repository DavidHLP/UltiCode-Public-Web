<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { ArrowBigUp } from "lucide-vue-next";
import { computed } from "vue";

const props = defineProps<{
  likes: number;
  dislikes: number;
  userVote?: 1 | -1 | 0; // 1: upvoted, -1: downvoted, 0: neutral
  readonly?: boolean;
}>();

const emit = defineEmits<{
  (e: "vote", type: 1 | -1): void;
}>();

const isPreview = computed(() => props.userVote === undefined);

// Helper to format large numbers
const formatCount = (value: number) => {
  if (value >= 1000) return `${(value / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return value.toString();
};

const handleVote = (type: 1 | -1) => {
  if (props.readonly) return;
  emit("vote", type);
};

defineOptions({
  name: "VoteControl",
});
</script>

<template>
  <div class="flex items-center rounded-full px-1.5 h-7">
    <template v-if="!isPreview">
      <!-- Upvote -->
      <Button
        variant="ghost"
        size="icon"
        class="h-6 w-6 rounded-full -ml-0.5 hover:bg-muted"
        :class="{
          'text-orange-600': userVote === 1,
          'cursor-default hover:bg-transparent hover:text-inherit': readonly,
        }"
        :disabled="readonly"
        @click.stop="handleVote(1)"
      >
        <ArrowBigUp
          class="h-4 w-4 transition-colors"
          :class="{ 'fill-current': userVote === 1 }"
        />
      </Button>

      <!-- Likes Count -->
      <span
        class="text-xs font-medium px-1.5 min-w-[0.5rem] text-center select-none"
        :class="{
          'text-orange-600 font-bold': userVote === 1,
          'text-foreground': userVote !== 1,
        }"
      >
        {{ formatCount(likes) }}
      </span>

      <!-- Separator -->
      <div class="h-3 w-px bg-border/50 mx-0.5"></div>

      <!-- Dislikes Count -->
      <span
        class="text-xs font-medium px-1.5 min-w-[0.5rem] text-center select-none"
        :class="{
          'text-blue-600 font-bold': userVote === -1,
          'text-foreground': userVote !== -1,
        }"
      >
        {{ formatCount(dislikes) }}
      </span>

      <!-- Downvote -->
      <Button
        variant="ghost"
        size="icon"
        class="h-6 w-6 rounded-full -mr-0.5 hover:bg-muted"
        :class="{
          'text-blue-600': userVote === -1,
          'cursor-default hover:bg-transparent hover:text-inherit': readonly,
        }"
        :disabled="readonly"
        @click.stop="handleVote(-1)"
      >
        <ArrowBigUp
          class="h-4 w-4 rotate-180 transition-colors"
          :class="{ 'fill-current': userVote === -1 }"
        />
      </Button>
    </template>

    <template v-else>
      <!-- Preview Mode -->
      <span class="text-xs font-medium text-foreground px-1">
        {{ formatCount(likes) }}
      </span>
      <div class="h-3 w-px bg-border/50 mx-1"></div>
      <span class="text-xs font-medium text-foreground px-1">
        {{ formatCount(dislikes) }}
      </span>
    </template>
  </div>
</template>
