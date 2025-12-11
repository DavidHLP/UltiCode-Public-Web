<script setup lang="ts">
import type { ForumComment } from "@/types/forum.ts";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowBigUp,
  Pin,
  Lock,
  MessageSquare,
  MoreHorizontal,
} from "lucide-vue-next";
import { computed, ref } from "vue";

defineOptions({
  name: "CommentNode",
});

const props = defineProps<{
  comment: ForumComment;
}>();

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

const createdAgo = computed(() => formatRelativeTime(props.comment.createdAt));
const isCollapsed = ref(false);

function toggleCollapse() {
  isCollapsed.value = !isCollapsed.value;
}
</script>

<template>
  <div class="relative flex gap-2">
    <!-- Left Column: Avatar + Thread Line -->
    <div class="flex flex-col items-center shrink-0">
      <Avatar
        class="h-6 w-6 border border-border/40 cursor-pointer sm:h-7 sm:w-7"
        @click="toggleCollapse"
      >
        <AvatarImage
          v-if="comment.author.avatar"
          :src="comment.author.avatar"
          :alt="comment.author.username"
        />
        <AvatarFallback class="text-[10px] font-semibold uppercase">
          {{ comment.author.username.slice(0, 2).toUpperCase() }}
        </AvatarFallback>
      </Avatar>

      <!-- Thread Line -->
      <div
        v-if="!isCollapsed && comment.replies && comment.replies.length > 0"
        class="w-[2px] flex-1 mt-2 rounded-full bg-border/40 hover:bg-primary/50 cursor-pointer transition-colors"
        @click="toggleCollapse"
      ></div>
    </div>

    <!-- Right Column: Content -->
    <div class="flex-1 min-w-0 pb-1">
      <div
        class="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mb-1 h-6 sm:h-7"
      >
        <span
          class="font-semibold text-foreground hover:underline cursor-pointer"
          @click="toggleCollapse"
          >u/{{ comment.author.username }}</span
        >
        <span>•</span>
        <span>{{ createdAgo }}</span>

        <span
          v-if="comment.isPinned"
          class="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
        >
          <Pin class="h-3 w-3" /> Pinned
        </span>
        <span
          v-if="comment.isLocked"
          class="inline-flex items-center gap-1 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
        >
          <Lock class="h-3 w-3" /> Locked
        </span>

        <button
          v-if="isCollapsed"
          @click="toggleCollapse"
          class="ml-auto text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          <MoreHorizontal class="h-4 w-4" />
        </button>
      </div>

      <div v-show="!isCollapsed" class="space-y-2">
        <div class="text-sm leading-relaxed text-foreground/90 break-words">
          {{ comment.body }}
        </div>

        <div class="flex items-center gap-3">
          <button
            class="group flex items-center gap-1.5 text-muted-foreground hover:bg-muted/50 p-1 -ml-1 rounded transition-colors"
          >
            <ArrowBigUp
              class="h-5 w-5 group-hover:text-orange-600 transition-colors"
            />
            <span class="text-xs font-bold">{{ comment.upvotes }}</span>
          </button>
          <button
            class="group flex items-center gap-1.5 text-muted-foreground hover:bg-muted/50 p-1 rounded transition-colors"
          >
            <MessageSquare
              class="h-4 w-4 group-hover:text-blue-500 transition-colors"
            />
            <span class="text-xs font-bold">Reply</span>
          </button>
          <button
            class="group flex items-center gap-1.5 text-muted-foreground hover:bg-muted/50 p-1 rounded transition-colors"
          >
            <MoreHorizontal class="h-4 w-4" />
            <span class="sr-only">More</span>
          </button>
        </div>

        <!-- Nested Replies -->
        <div
          v-if="comment.replies && comment.replies.length"
          class="space-y-4 pt-2"
        >
          <CommentNode
            v-for="reply in comment.replies"
            :key="reply.id"
            :comment="reply"
          />
        </div>
      </div>
    </div>
  </div>
</template>
