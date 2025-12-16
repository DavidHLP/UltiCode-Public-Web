<script setup lang="ts">
import type {
  ForumFlairType,
  ForumThread,
  ForumPostMedia,
} from "@/types/forum";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { AspectRatio } from "@/components/ui/aspect-ratio";
import {
  Lock,
  MessageSquare,
  Pin,
  Share2,
  Bookmark,
  BookmarkCheck,
} from "lucide-vue-next";
import { Vote } from "@/components/vote";
import { computed } from "vue";
import { renderMarkdown } from "@/utils/markdown";

const props = defineProps<{
  thread: ForumThread;
}>();

const flairClasses: Record<ForumFlairType, string> = {
  announcement: "bg-amber-100 text-amber-700",
  discussion: "bg-blue-100 text-blue-700",
  showcase: "bg-purple-100 text-purple-700",
  question: "bg-emerald-100 text-emerald-700",
  hiring: "bg-orange-100 text-orange-700",
};

const communityIcon = computed(() => props.thread.community?.icon || "");

const userInitials = computed(() => {
  const parts = props.thread.author.username.split(/[\s_-]/);
  return parts
    .map((part: string) => part.charAt(0).toUpperCase())
    .join("")
    .slice(0, 2);
});

const createdAgo = computed(() => formatRelativeTime(props.thread.createdAt));

const media = computed(
  () => props.thread.media as unknown as ForumPostMedia | undefined
);

const commentsDisplay = computed(() =>
  props.thread.stats?.comments ? formatCount(props.thread.stats.comments) : "0"
);

function formatCount(value: number) {
  if (value >= 1000) return `${(value / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return value.toString();
}

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

function formatPollPercentage(votes: number, totalVotes: number) {
  if (totalVotes <= 0) return "0%";
  return `${Math.round((votes / totalVotes) * 100)}%`;
}

function formatPollWidth(votes: number, totalVotes: number) {
  if (totalVotes <= 0) return "0%";
  const percentage = (votes / totalVotes) * 100;
  const minimum = votes > 0 && percentage < 4 ? 4 : percentage;
  return `${Math.min(100, Math.max(minimum, 0)).toFixed(0)}%`;
}
</script>

<template>
  <div class="bg-card text-card-foreground">
    <!-- Header -->
    <div class="px-3 pt-4 sm:px-4 sm:pt-6">
      <div class="flex items-center gap-2 text-xs text-muted-foreground mb-2">
        <template v-if="communityIcon">
          <Avatar class="h-9 w-9 rounded-full border border-border/40">
            <AvatarImage
              v-if="communityIcon"
              :src="communityIcon"
              :alt="thread.community?.name"
            />
            <AvatarFallback class="text-xs">{{
              thread.community?.name?.charAt(0).toUpperCase()
            }}</AvatarFallback>
          </Avatar>
        </template>
        <template v-else>
          <Avatar class="h-9 w-9 rounded-full border border-border/40">
            <AvatarImage
              v-if="thread.author.avatar"
              :src="thread.author.avatar"
              :alt="thread.author.username"
            />
            <AvatarFallback class="text-xs">{{ userInitials }}</AvatarFallback>
          </Avatar>
        </template>

        <div class="flex items-center gap-1 flex-wrap">
          <template v-if="thread.community">
            <span
              class="font-bold text-foreground hover:underline cursor-pointer"
            >
              r/{{ thread.community.name }}
            </span>
            <span class="text-muted-foreground/60">•</span>
            <span class="hover:underline cursor-pointer"
              >Posted by u/{{ thread.author.username }}</span
            >
          </template>
          <template v-else>
            <span
              class="font-bold text-foreground hover:underline cursor-pointer"
            >
              u/{{ thread.author.username }}
            </span>
          </template>
          <span class="text-muted-foreground/60">•</span>
          <span>{{ createdAgo }}</span>
        </div>

        <Badge
          v-if="thread.flair"
          variant="secondary"
          :class="[
            'ml-auto sm:ml-2 rounded-full px-2 py-0 text-[10px] h-5',
            flairClasses[thread.flair.type],
          ]"
        >
          {{ thread.flair.text }}
        </Badge>
      </div>

      <h1
        class="text-xl sm:text-2xl font-semibold leading-snug tracking-tight text-foreground mb-2"
      >
        {{ thread.title }}
      </h1>

      <div class="flex flex-wrap gap-2 mb-4">
        <Badge
          v-if="thread.isPinned"
          variant="outline"
          class="flex items-center gap-1 rounded-full border-dashed px-2 py-0.5 text-[10px] uppercase"
        >
          <Pin class="h-3 w-3" /> Pinned
        </Badge>
        <span
          v-if="thread.isLocked"
          class="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600"
        >
          <Lock class="h-3 w-3" /> Locked
        </span>
      </div>
    </div>

    <!-- Content -->
    <div class="px-4 sm:px-6 pb-2 space-y-4">
      <section
        v-if="thread.excerpt"
        class="text-sm leading-relaxed text-foreground/90 prose prose-sm dark:prose-invert max-w-none"
        v-html="renderMarkdown(thread.excerpt)"
      ></section>

      <section v-if="media" class="mt-4">
        <div
          class="overflow-hidden rounded-lg border border-border/40 bg-muted/20"
        >
          <AspectRatio
            v-if="media.type === 'image'"
            :ratio="media.ratio ?? 16 / 9"
            class="bg-muted"
          >
            <img
              :src="media.src"
              :alt="media.alt ?? thread.title"
              class="h-full w-full object-contain bg-black/5"
            />
          </AspectRatio>
          <div
            v-if="media.type === 'image' && media.caption"
            class="p-2 text-xs text-muted-foreground text-center bg-background/50"
          >
            {{ media.caption }}
          </div>

          <div
            v-else-if="media.type === 'link'"
            class="flex flex-col sm:flex-row bg-background"
          >
            <div class="flex-1 p-4 flex flex-col justify-center min-w-0">
              <div
                class="text-xs text-muted-foreground mb-1 uppercase tracking-wide"
              >
                {{ media.domain }}
              </div>
              <div class="font-medium text-foreground truncate mb-1">
                {{ media.title ?? media.url }}
              </div>
              <div class="text-sm text-muted-foreground line-clamp-2">
                {{ media.description }}
              </div>
              <a
                :href="media.url"
                target="_blank"
                class="mt-2 text-blue-500 hover:underline text-xs inline-flex items-center gap-1"
              >
                Open Link <Share2 class="w-3 h-3" />
              </a>
            </div>
            <div
              v-if="media.thumbnail"
              class="h-32 sm:h-auto sm:w-32 bg-muted relative"
            >
              <img :src="media.thumbnail" class="w-full h-full object-cover" />
            </div>
          </div>

          <div
            v-else-if="media.type === 'text'"
            class="p-4 text-sm leading-relaxed prose prose-sm dark:prose-invert max-w-none"
            v-html="renderMarkdown(media.markdown || media.body || '')"
          ></div>

          <div v-else-if="media.type === 'video'" class="bg-black">
            <AspectRatio :ratio="16 / 9">
              <video
                :src="media.src"
                class="w-full h-full"
                controls
                :poster="media.thumbnail"
              ></video>
            </AspectRatio>
          </div>

          <div
            v-else-if="media.type === 'poll'"
            class="space-y-3 bg-background/80 p-4 text-sm text-foreground"
          >
            <header class="space-y-1">
              <p
                class="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground"
              >
                Community poll
              </p>
              <p class="font-medium text-foreground">{{ media.question }}</p>
            </header>
            <ul class="space-y-2">
              <li
                v-for="option in media.options"
                :key="option.id"
                class="space-y-1"
              >
                <div
                  class="flex items-center justify-between text-[11px] text-muted-foreground"
                >
                  <span class="text-foreground">{{ option.label }}</span>
                  <span>{{
                    formatPollPercentage(option.votes, media.totalVotes)
                  }}</span>
                </div>
                <div class="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    class="h-full rounded-full bg-primary"
                    :style="{
                      width: formatPollWidth(option.votes, media.totalVotes),
                    }"
                  />
                </div>
              </li>
            </ul>
            <p class="text-[11px] text-muted-foreground">
              {{ media.totalVotes }} votes
              <span v-if="media.closesAt"> · closes {{ media.closesAt }}</span>
            </p>
          </div>
        </div>
      </section>
    </div>

    <!-- Actions -->
    <div
      class="px-2 py-2 sm:px-6 flex items-center gap-2 text-muted-foreground border-t border-transparent"
    >
      <Vote
        :likes="thread.likes ?? thread.stats?.likes ?? 0"
        :dislikes="thread.dislikes ?? thread.stats?.dislikes ?? 0"
        :user-vote="thread.userVote"
        class="origin-left"
        @vote="(type: 1 | -1) => $emit('vote', type)"
      />

      <Button
        variant="ghost"
        size="sm"
        class="gap-2 rounded-full h-9 hover:bg-muted/50"
      >
        <MessageSquare class="h-4 w-4" />
        <span class="text-xs font-semibold"
          >{{ commentsDisplay }} Comments</span
        >
      </Button>
      <Button
        variant="ghost"
        size="sm"
        class="gap-2 rounded-full h-9 hover:bg-muted/50"
      >
        <Share2 class="h-4 w-4" />
        <span class="text-xs font-semibold">Share</span>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        class="gap-2 rounded-full h-9 hover:bg-muted/50"
      >
        <component
          :is="thread.isSaved ? BookmarkCheck : Bookmark"
          class="h-4 w-4"
        />
        <span class="text-xs font-semibold">Save</span>
      </Button>
    </div>
  </div>
</template>
