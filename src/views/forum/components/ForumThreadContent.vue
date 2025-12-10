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
  ArrowBigUp,
  Eye,
  Gift,
  Lock,
  MessageSquare,
  Pin,
  Share2,
} from "lucide-vue-next";
import { computed } from "vue";

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

const avatarSrc = computed(() => props.thread.author.avatar || undefined);
const userInitials = computed(() => {
  const parts = props.thread.author.username.split(/[^A-Za-z0-9]+/);
  return parts
    .map((p) => p.charAt(0).toUpperCase())
    .join("")
    .slice(0, 2);
});
const communityIcon = computed(() => props.thread.community?.icon || "");

const createdAgo = computed(() =>
  formatRelativeTime(props.thread.createdAt ?? props.thread.created_at),
);
const recommendationLabel = computed(
  () =>
    (props.thread.recommendation as unknown as { label?: string })?.label ?? "",
);
const media = computed(
  () => props.thread.media as unknown as ForumPostMedia | undefined,
);
const awards = computed(() => props.thread.awards ?? []);
const upvoteRatioDisplay = computed(() =>
  typeof props.thread.stats?.upvote_ratio === "number"
    ? `${Math.round(props.thread.stats.upvote_ratio * 100)}%`
    : undefined,
);
const viewsDisplay = computed(() =>
  typeof props.thread.stats?.views === "number"
    ? formatCount(props.thread.stats.views)
    : undefined,
);
const voteState = computed(() => props.thread.voteState ?? "neutral");
const voteLabel = computed(() =>
  voteState.value === "upvoted"
    ? "Upvoted"
    : voteState.value === "downvoted"
      ? "Downvoted"
      : "Upvote",
);
const scoreDisplay = computed(() =>
  props.thread.stats?.score ? formatCount(props.thread.stats.score) : "0",
);
const commentsDisplay = computed(() =>
  props.thread.stats?.comments ? formatCount(props.thread.stats.comments) : "0",
);
const awardsDisplay = computed(() =>
  props.thread.stats?.awards ? formatCount(props.thread.stats.awards) : "0",
);
const savesDisplay = computed(() =>
  props.thread.stats?.saves ? formatCount(props.thread.stats.saves) : "0",
);
const sharesDisplay = computed(() =>
  props.thread.stats?.shares ? formatCount(props.thread.stats.shares) : "0",
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
  <div
    class="rounded-xl border border-border/50 bg-card text-card-foreground shadow-sm"
  >
    <div class="pb-2 p-6">
      <h3 class="text-xl font-semibold leading-none tracking-tight">
        {{ thread.title }}
      </h3>
    </div>
    <div class="space-y-4 p-6 pt-0">
      <header class="flex items-start justify-between gap-4">
        <div class="flex items-start gap-3 min-w-0">
          <Avatar class="h-9 w-9 border border-border/60">
            <AvatarImage
              v-if="avatarSrc"
              :src="avatarSrc"
              :alt="thread.author.username"
            />
            <AvatarFallback class="text-xs font-semibold uppercase">
              {{ userInitials }}
            </AvatarFallback>
          </Avatar>
          <div class="min-w-0 space-y-2">
            <div
              class="flex flex-wrap items-center gap-2 text-sm font-semibold text-foreground"
            >
              <span class="flex items-center gap-2">
                <span
                  v-if="communityIcon"
                  class="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-base"
                >
                  {{ communityIcon }}
                </span>
                <span class="truncate">{{ thread.community?.name }}</span>
              </span>
              <Badge
                v-if="thread.flair"
                variant="secondary"
                :class="[
                  'gap-1 rounded-full px-2.5 py-0.5 text-[10px]',
                  flairClasses[thread.flair.type],
                ]"
              >
                {{ thread.flair.text }}
              </Badge>
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
            <div
              class="flex flex-wrap items-center gap-1 text-xs text-muted-foreground"
            >
              <span>u/{{ thread.author.username }}</span>
              <span>•</span>
              <span>{{ createdAgo }}</span>
              <span>•</span>
              <span
                >{{ thread.stats?.likes?.toLocaleString() ?? 0 }} likes</span
              >
            </div>
            <div
              v-if="upvoteRatioDisplay || viewsDisplay"
              class="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground"
            >
              <span
                v-if="upvoteRatioDisplay"
                class="inline-flex items-center gap-1"
              >
                <ArrowBigUp class="h-3 w-3 opacity-60" />
                {{ upvoteRatioDisplay }} upvoted
              </span>
              <span v-if="viewsDisplay" class="inline-flex items-center gap-1">
                <Eye class="h-3 w-3 opacity-60" /> {{ viewsDisplay }} views
              </span>
            </div>
          </div>
        </div>
      </header>

      <p v-if="recommendationLabel" class="text-xs text-muted-foreground">
        {{ recommendationLabel }}
      </p>

      <section v-if="thread.excerpt" class="text-sm text-muted-foreground">
        {{ thread.excerpt }}
      </section>

      <section
        v-if="media"
        class="overflow-hidden rounded-lg border border-border/60"
      >
        <AspectRatio
          v-if="media.type === 'image'"
          :ratio="media.ratio ?? 16 / 9"
          class="bg-muted"
        >
          <img
            :src="media.src"
            :alt="media.alt ?? thread.title"
            class="h-full w-full object-cover"
          />
        </AspectRatio>
        <p
          v-if="media.type === 'image' && media.caption"
          class="border-t border-border/50 bg-background/80 px-4 py-2 text-xs text-muted-foreground"
        >
          {{ media.caption }}
        </p>

        <div
          v-else-if="media.type === 'link'"
          class="flex flex-col gap-3 bg-background/80 p-4 sm:flex-row sm:items-center"
        >
          <div
            v-if="media.thumbnail"
            class="h-24 w-full overflow-hidden rounded-md border bg-muted sm:h-20 sm:w-20"
          >
            <img
              :src="media.thumbnail"
              :alt="media.title ?? media.domain"
              class="h-full w-full object-cover"
            />
          </div>
          <div class="min-w-0 space-y-1 text-sm">
            <p class="text-xs uppercase tracking-wide text-muted-foreground">
              {{ media.domain }}
            </p>
            <p class="truncate font-medium text-foreground">
              {{ media.title ?? media.url }}
            </p>
            <p
              v-if="media.description"
              class="line-clamp-2 text-xs text-muted-foreground"
            >
              {{ media.description }}
            </p>
          </div>
        </div>

        <div
          v-else-if="media.type === 'text'"
          class="space-y-2 bg-muted/20 p-4 text-sm leading-relaxed text-muted-foreground"
        >
          {{ media.body }}
          <pre
            v-if="media.markdown"
            class="whitespace-pre-wrap text-xs text-muted-foreground"
            >{{ media.markdown }}</pre
          >
        </div>

        <div v-else-if="media.type === 'video'" class="bg-muted">
          <AspectRatio :ratio="16 / 9" class="bg-black">
            <video
              :src="media.src"
              class="h-full w-full object-cover"
              :poster="media.thumbnail"
              :controls="media.controls ?? true"
              :autoplay="media.autoplay ?? false"
              playsinline
            />
          </AspectRatio>
          <p
            v-if="media.duration"
            class="border-t border-border/50 px-4 py-2 text-xs text-muted-foreground"
          >
            Duration {{ media.duration }}
          </p>
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
      </section>

      <section
        v-if="awards.length"
        class="space-y-2 rounded-lg border border-border/60 bg-background/60 p-3"
      >
        <header
          class="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground"
        >
          Awards
        </header>
        <ul class="flex flex-wrap gap-2">
          <li
            v-for="award in awards"
            :key="award.id"
            class="inline-flex items-center gap-2 rounded-full bg-muted/50 px-3 py-1 text-xs font-medium"
          >
            <span class="text-sm">{{ award.icon }}</span>
            <span class="text-foreground">{{ award.label }}</span>
            <span class="text-muted-foreground">×{{ award.count }}</span>
          </li>
        </ul>
      </section>
    </div>

    <div
      class="flex flex-wrap items-center gap-2 border-t border-border/50 px-4 py-3"
    >
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
  </div>
</template>
