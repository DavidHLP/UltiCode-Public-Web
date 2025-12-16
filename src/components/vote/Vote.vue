<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { ArrowBigUp } from "lucide-vue-next";
import { computed } from "vue";

const props = defineProps<{
  votes: number;
  userVote?: 1 | -1 | 0; // 1: upvoted, -1: downvoted, 0: neutral
  readonly?: boolean;
}>();

const emit = defineEmits<{
  (e: "vote", type: 1 | -1): void;
}>();

const scoreDisplay = computed(() => {
  const value = props.votes;
  if (value >= 1000) return `${(value / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return value.toString();
});

const handleVote = (type: 1 | -1) => {
  if (props.readonly) return;
  emit("vote", type);
};

defineOptions({
  name: "VoteControl",
});
</script>

<template>
  <div
    class="flex items-center bg-muted/30 rounded-full p-0.5 border border-transparent transition-colors"
    :class="{ 'hover:border-border/40': !readonly }"
  >
    <!-- Upvote -->
    <Button
      variant="ghost"
      size="icon"
      class="h-8 w-8 rounded-full"
      :class="{
        'hover:text-orange-600 hover:bg-orange-100/50': !readonly,
        'text-orange-600 bg-orange-100/50': userVote === 1,
        'cursor-default hover:bg-transparent hover:text-inherit': readonly,
      }"
      :disabled="readonly && userVote !== 1"
      @click.stop="handleVote(1)"
    >
      <ArrowBigUp
        class="h-5 w-5 transition-colors"
        :class="{ 'fill-current': userVote === 1 }"
      />
    </Button>

    <!-- Score -->
    <span
      class="text-xs px-1 font-bold min-w-[1.5rem] text-center select-none"
      :class="{
        'text-orange-600': userVote === 1,
        'text-blue-600': userVote === -1,
        'text-foreground': userVote === 0 || userVote === undefined,
      }"
    >
      {{ scoreDisplay }}
    </span>

    <!-- Downvote -->
    <Button
      variant="ghost"
      size="icon"
      class="h-8 w-8 rounded-full"
      :class="{
        'hover:text-blue-600 hover:bg-blue-100/50': !readonly,
        'text-blue-600 bg-blue-100/50': userVote === -1,
        'cursor-default hover:bg-transparent hover:text-inherit': readonly,
      }"
      :disabled="readonly && userVote !== -1"
      @click.stop="handleVote(-1)"
    >
      <ArrowBigUp
        class="h-5 w-5 rotate-180 transition-colors"
        :class="{ 'fill-current': userVote === -1 }"
      />
    </Button>
  </div>
</template>
