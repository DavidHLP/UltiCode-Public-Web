<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { ArrowBigUp, Gift, MessageSquare, Share2 } from "lucide-vue-next";

defineProps<{
  voteState: "upvoted" | "downvoted" | "neutral";
  voteLabel: string;
  scoreDisplay: string;
  commentsDisplay: string;
  awardsDisplay: string;
  sharesDisplay: string;
  savesDisplay: string;
}>();
</script>

<template>
  <div class="flex flex-wrap items-center gap-2">
    <Button
      variant="ghost"
      size="sm"
      :class="[
        'gap-2 text-xs font-medium',
        voteState === 'upvoted' ? 'text-primary' : 'text-foreground',
      ]"
    >
      <ArrowBigUp
        class="h-4 w-4"
        :class="voteState === 'upvoted' ? 'text-primary' : ''"
      />
      <span>{{ voteLabel }}</span>
      <span class="text-muted-foreground">· {{ scoreDisplay }}</span>
    </Button>
    <Button variant="ghost" size="sm" class="gap-2 text-xs font-medium">
      <MessageSquare class="h-4 w-4" />
      {{ commentsDisplay }} comments
    </Button>
    <Button variant="ghost" size="sm" class="gap-2 text-xs font-medium">
      <Gift class="h-4 w-4" />
      {{ awardsDisplay }} awards
    </Button>
    <Button variant="ghost" size="sm" class="gap-2 text-xs font-medium">
      <Share2 class="h-4 w-4" />
      {{ sharesDisplay }} shares
    </Button>
    <Button variant="ghost" size="sm" class="gap-2 text-xs font-medium">
      <Share2 class="h-4 w-4 rotate-90" />
      {{ savesDisplay }} saves
    </Button>
  </div>
</template>
