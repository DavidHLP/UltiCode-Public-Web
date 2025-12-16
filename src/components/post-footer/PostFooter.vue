<script setup lang="ts">
import { Vote } from "@/components/vote";
import { Button } from "@/components/ui/button";
import {
  MessageCircle,
  Share2,
  Bookmark,
  BookmarkCheck,
  Eye,
  MessageSquare,
} from "lucide-vue-next";
import { computed } from "vue";

export interface PostFooterConfig {
  comments?: {
    show: boolean;
    count: number | string;
    text?: string; // e.g. "Comments"
    icon?: "message-circle" | "message-square"; // default square for forum?
    variant?: "button" | "simple"; // button (ghost) or simple text/icon
  };
  views?: {
    show: boolean;
    count: number | string;
  };
  share?: {
    show: boolean;
    text?: string;
  };
  save?: {
    show: boolean;
    isSaved?: boolean;
    text?: string;
  };
}

export interface VoteData {
  likes: number;
  dislikes: number;
  userVote?: 0 | 1 | -1;
}

const props = defineProps<{
  vote: VoteData;
  config: PostFooterConfig;
  class?: string;
}>();

const emit = defineEmits<{
  (e: "vote", type: 1 | -1): void;
  (e: "comment"): void;
  (e: "share"): void;
  (e: "save"): void;
}>();

const commentIcon = computed(() => {
  return props.config.comments?.icon === "message-circle"
    ? MessageCircle
    : MessageSquare;
});
</script>

<template>
  <div
    :class="[
      'flex items-center gap-2 text-muted-foreground select-none',
      props.class,
    ]"
  >
    <Vote
      :likes="vote.likes"
      :dislikes="vote.dislikes"
      :user-vote="vote.userVote"
      class="origin-left"
      @vote="(t: 1 | -1) => emit('vote', t)"
    />

    <!-- Views (Simple only usually) -->
    <div
      v-if="config.views?.show"
      class="flex items-center gap-1.5 text-xs ml-2"
    >
      <Eye class="h-3.5 w-3.5" />
      <span>{{ config.views.count }}</span>
    </div>

    <!-- Comments -->
    <template v-if="config.comments?.show">
      <Button
        v-if="config.comments.variant !== 'simple'"
        variant="ghost"
        size="sm"
        class="gap-2 rounded-full h-9 hover:bg-muted/50"
        @click="emit('comment')"
      >
        <component :is="commentIcon" class="h-4 w-4" />
        <span class="text-xs font-semibold">
          {{ config.comments.count }} {{ config.comments.text }}
        </span>
      </Button>
      <div
        v-else
        class="flex items-center gap-1.5 text-xs cursor-pointer hover:text-foreground transition-colors ml-2"
        @click="emit('comment')"
      >
        <component :is="commentIcon" class="h-3.5 w-3.5" />
        <span>{{ config.comments.count }}</span>
      </div>
    </template>

    <!-- Share -->
    <Button
      v-if="config.share?.show"
      variant="ghost"
      size="sm"
      class="gap-2 rounded-full h-9 hover:bg-muted/50"
      @click="emit('share')"
    >
      <Share2 class="h-4 w-4" />
      <span v-if="config.share.text" class="text-xs font-semibold">{{
        config.share.text
      }}</span>
    </Button>

    <!-- Save -->
    <Button
      v-if="config.save?.show"
      variant="ghost"
      size="sm"
      class="gap-2 rounded-full h-9 hover:bg-muted/50"
      @click="emit('save')"
    >
      <component
        :is="config.save.isSaved ? BookmarkCheck : Bookmark"
        class="h-4 w-4"
      />
      <span v-if="config.save.text" class="text-xs font-semibold">{{
        config.save.text
      }}</span>
    </Button>
  </div>
</template>
