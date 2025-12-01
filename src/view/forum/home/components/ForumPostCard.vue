<script setup lang="ts">
import type { ForumFlairType, ForumPost } from "@/mocks/schema/forum";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import {
  ArrowBigUp,
  Bookmark,
  BookmarkCheck,
  Eye,
  Gift,
  Lock,
  MessageSquare,
  Pin,
  Share2,
} from "lucide-vue-next";
import { computed } from "vue";
import { RouterLink } from "vue-router";

const props = defineProps<{
  post: ForumPost;
}>();

const flairClasses: Record<ForumFlairType, string> = {
  announcement: "bg-amber-100 text-amber-700",
  discussion: "bg-blue-100 text-blue-700",
  showcase: "bg-purple-100 text-purple-700",
  question: "bg-emerald-100 text-emerald-700",
  hiring: "bg-orange-100 text-orange-700",
};

const avatarSrc = computed(() => props.post.user.avatar || undefined);

const userInitials = computed(() => {
  const parts = props.post.user.username.split(/[\s_-]/);
  return parts
    .map((part) => part.charAt(0).toUpperCase())
    .join("")
    .slice(0, 2);
});

const communityIcon = computed(() => props.post.community.icon || "");
const createdAgo = computed(() => formatRelativeTime(props.post.createdAt));
const recommendationLabel = computed(
  () => props.post.recommendation?.label ?? "",
);
const media = computed(() => props.post.media);
const awards = computed(() => props.post.awards ?? []);
const hasAwards = computed(() => awards.value.length > 0);
const commentPreview = computed(() => props.post.commentPreview ?? []);
const hasCommentPreview = computed(() => commentPreview.value.length > 0);
const upvoteRatioDisplay = computed(() => {
  const ratio = props.post.stats.upvote_ratio;
  if (typeof ratio !== "number") return undefined;
  return `${Math.round(ratio * 100)}%`;
});
const viewsDisplay = computed(() => {
  const views = props.post.stats.views;
  if (typeof views !== "number") return undefined;
  return formatCount(views);
});
const voteState = computed(() => props.post.voteState ?? "neutral");
const voteLabel = computed(() => {
  if (voteState.value === "upvoted") return "Upvoted";
  if (voteState.value === "downvoted") return "Downvoted";
  return "Upvote";
});
const isSaved = computed(() => props.post.isSaved ?? false);
const saveLabel = computed(() => (isSaved.value ? "Saved" : "Save"));
const impressionsDisplay = computed(() => {
  const impressions = props.post.impressions;
  if (typeof impressions !== "number") return undefined;
  return formatCount(impressions);
});

const karmaDisplay = computed(() => formatCount(props.post.user.karma));
const scoreDisplay = computed(() => formatCount(props.post.stats.score));
const commentsDisplay = computed(() => formatCount(props.post.stats.comments));
const awardsDisplay = computed(() => formatCount(props.post.stats.awards));
const savesDisplay = computed(() => formatCount(props.post.stats.saves));
const sharesDisplay = computed(() => formatCount(props.post.stats.shares));

function formatCount(value: number) {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  }
  return value.toString();
}

function formatPollPercentage(votes: number, totalVotes: number) {
  if (totalVotes <= 0) {
    return "0%";
  }
  return `${Math.round((votes / totalVotes) * 100)}%`;
}

function formatPollWidth(votes: number, totalVotes: number) {
  if (totalVotes <= 0) {
    return "0%";
  }
  const percentage = (votes / totalVotes) * 100;
  const minimum = votes > 0 && percentage < 4 ? 4 : percentage;
  return `${Math.min(100, Math.max(minimum, 0)).toFixed(0)}%`;
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
    if (Math.abs(delta) >= 1) {
      return relativeTimeFormatter.format(Math.round(delta), unit);
    }
  }

  return "just now";
}
</script>

<template>
  <Card
    class="rounded-xl border border-border/50 bg-card text-card-foreground shadow-sm transition-all hover:shadow-md hover:border-border"
  >
    <CardContent class="space-y-4 p-4">
      <header class="flex items-start justify-between gap-4">
        <div class="flex items-start gap-3 min-w-0">
          <Avatar class="h-9 w-9 border border-border/60">
            <AvatarImage
              v-if="avatarSrc"
              :src="avatarSrc"
              :alt="post.user.username"
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
                  class="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-base"
                >
                  {{ communityIcon }}
                </span>
                <span class="truncate">{{ post.community.name }}</span>
              </span>
              <Badge
                v-if="post.flair"
                variant="secondary"
                :class="[
                  'gap-1 rounded-full px-2.5 py-0.5 text-[10px]',
                  flairClasses[post.flair.type],
                ]"
              >
                {{ post.flair.label }}
              </Badge>
              <Badge
                v-if="post.isPinned"
                variant="outline"
                class="flex items-center gap-1 rounded-full border-dashed px-2 py-0.5 text-[10px] uppercase"
              >
                <Pin class="h-3 w-3" />
                Pinned
              </Badge>
              <span
                v-if="post.isLocked"
                class="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600"
              >
                <Lock class="h-3 w-3" />
                Locked
              </span>
            </div>
            <div
              class="flex flex-wrap items-center gap-1 text-xs text-muted-foreground"
            >
              <span>u/{{ post.user.username }}</span>
              <span>•</span>
              <span>{{ createdAgo }}</span>
              <span>•</span>
              <span>{{ karmaDisplay }} karma</span>
            </div>
            <p v-if="recommendationLabel" class="text-xs text-muted-foreground">
              {{ recommendationLabel }}
            </p>
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
                <Eye class="h-3 w-3 opacity-60" />
                {{ viewsDisplay }} views
              </span>
            </div>
          </div>
        </div>
      </header>

      <section class="space-y-2">
        <RouterLink
          :to="{ name: 'forum-thread', params: { postId: post.id } }"
          class="block text-lg font-semibold tracking-tight text-foreground hover:underline"
        >
          {{ post.title }}
        </RouterLink>
        <p v-if="post.excerpt" class="text-sm text-muted-foreground">
          {{ post.excerpt }}
        </p>
        <ul class="flex flex-wrap gap-2">
          <li v-for="tag in post.tags" :key="tag" class="list-none">
            <Badge
              variant="outline"
              class="rounded-full border-dashed border-border/60 px-2.5 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground"
            >
              #{{ tag }}
            </Badge>
          </li>
        </ul>
      </section>

      <section
        v-if="hasAwards"
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

      <section
        v-if="media"
        class="overflow-hidden rounded-lg border border-border/60"
      >
        <AspectRatio
          v-if="media.kind === 'image'"
          :ratio="media.ratio ?? 16 / 9"
          class="bg-muted"
        >
          <img
            :src="media.src"
            :alt="media.alt ?? post.title"
            class="h-full w-full object-cover"
          />
        </AspectRatio>
        <p
          v-if="media.kind === 'image' && media.caption"
          class="border-t border-border/50 bg-background/80 px-4 py-2 text-xs text-muted-foreground"
        >
          {{ media.caption }}
        </p>

        <div
          v-else-if="media.kind === 'link'"
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
          v-else-if="media.kind === 'text'"
          class="space-y-2 bg-muted/20 p-4 text-sm leading-relaxed text-muted-foreground"
        >
          {{ media.body }}
          <pre
            v-if="media.markdown"
            class="whitespace-pre-wrap text-xs text-muted-foreground"
            >{{ media.markdown }}
          </pre>
        </div>

        <div v-else-if="media.kind === 'video'" class="bg-muted">
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
          v-else-if="media.kind === 'poll'"
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
            <span v-if="media.closesAt">
              · closes {{ formatRelativeTime(media.closesAt) }}</span
            >
          </p>
        </div>
      </section>

      <section
        v-if="hasCommentPreview"
        class="space-y-4 rounded-lg border border-border/60 bg-background/60 p-3"
      >
        <header
          class="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground"
        >
          Top comments
        </header>
        <ul class="space-y-3">
          <li
            v-for="comment in commentPreview"
            :key="comment.id"
            class="space-y-2"
          >
            <div class="flex items-start gap-3">
              <Avatar class="h-7 w-7 border border-border/50">
                <AvatarImage
                  v-if="comment.avatar"
                  :src="comment.avatar"
                  :alt="comment.author"
                />
                <AvatarFallback class="text-[10px] font-semibold uppercase">
                  {{ comment.author.slice(0, 2).toUpperCase() }}
                </AvatarFallback>
              </Avatar>
              <div class="min-w-0 space-y-1">
                <div
                  class="flex flex-wrap items-center gap-1 text-[11px] text-muted-foreground"
                >
                  <span class="font-semibold text-foreground"
                    >u/{{ comment.author }}</span
                  >
                  <span>•</span>
                  <span>{{ formatRelativeTime(comment.createdAt) }}</span>
                </div>
                <p class="text-sm text-foreground">
                  {{ comment.body }}
                </p>
                <span class="text-[11px] text-muted-foreground">
                  {{ formatCount(comment.upvotes) }} upvotes
                </span>
              </div>
            </div>
          </li>
        </ul>
      </section>
    </CardContent>

    <CardFooter
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
      <Button
        variant="ghost"
        size="sm"
        :class="[
          'group gap-1.5 text-xs font-medium transition-all duration-200',
          isSaved
            ? 'text-amber-600 hover:text-amber-700 dark:text-amber-500 dark:hover:text-amber-400'
            : 'text-muted-foreground hover:text-foreground',
        ]"
      >
        <BookmarkCheck
          v-if="isSaved"
          :class="[
            'h-4 w-4 transition-transform duration-200 group-hover:scale-110',
            'fill-amber-600 dark:fill-amber-500',
          ]"
        />
        <Bookmark
          v-else
          class="h-4 w-4 transition-transform duration-200 group-hover:scale-110"
        />
        <span class="transition-colors duration-200">{{ saveLabel }}</span>
        <span
          :class="[
            'transition-colors duration-200',
            isSaved ? 'text-amber-500/70' : 'text-muted-foreground',
          ]"
          >· {{ savesDisplay }}</span
        >
      </Button>
      <div class="ml-auto flex items-center gap-3">
        <span
          v-if="impressionsDisplay"
          class="text-[11px] text-muted-foreground"
        >
          {{ impressionsDisplay }} impressions
        </span>
      </div>
    </CardFooter>
  </Card>
</template>
