<script setup lang="ts">
import type { ForumComment } from "@/types/forum.ts";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowBigUp, Pin, Lock, MessageSquare, MinusSquare, PlusSquare } from "lucide-vue-next";
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

const createdAgo = computed(() => formatRelativeTime(props.comment.createdAt ?? props.comment.created_at));
const isCollapsed = ref(false);
</script>

<template>
  <li class="group relative space-y-2">
    <div class="flex items-start gap-3">
      <Avatar class="h-7 w-7 border border-border/50">
        <AvatarImage
          v-if="comment.author.avatar"
          :src="comment.author.avatar"
          :alt="comment.author.username"
        />
        <AvatarFallback class="text-[10px] font-semibold uppercase">
          {{ comment.author.username.slice(0, 2).toUpperCase() }}
        </AvatarFallback>
      </Avatar>

      <div class="min-w-0 flex-1 space-y-1.5">
        <div
          class="flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground"
        >
          <span class="font-semibold text-foreground"
            >u/{{ comment.author.username }}</span
          >
          <span>•</span>
          <span class="hover:underline cursor-pointer">{{ createdAgo }}</span>
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
            @click="isCollapsed = !isCollapsed"
            class="ml-1 opacity-0 transition-opacity group-hover:opacity-100"
            :title="isCollapsed ? 'Expand' : 'Collapse'"
          >
            <component
              :is="isCollapsed ? PlusSquare : MinusSquare"
              class="h-3 w-3"
            />
          </button>
        </div>

        <template v-if="!isCollapsed">
          <div class="text-sm leading-relaxed text-foreground/90">
            {{ comment.body }}
          </div>

          <div class="flex items-center gap-4">
            <button
              class="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowBigUp class="h-4 w-4" />
              {{ comment.upvotes }}
            </button>
            <button
              class="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <MessageSquare class="h-3.5 w-3.5" />
              Reply
            </button>
          </div>
        </template>
        <div v-else class="text-[11px] italic text-muted-foreground">
          Comment collapsed
        </div>
      </div>
    </div>

    <ul
      v-if="!isCollapsed && comment.replies && comment.replies.length"
      class="relative ml-3.5 space-y-4 border-l border-border/40 pl-4 pt-2"
    >
      <CommentNode
        v-for="child in comment.replies"
        :key="child.id"
        :comment="child"
      />
    </ul>
  </li>
</template>
