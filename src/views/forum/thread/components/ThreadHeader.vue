<script setup lang="ts">
import type { ForumFlairType, ForumPost } from "@/types/forum";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Pin, Lock, ArrowBigUp, Eye } from "lucide-vue-next";
import { computed } from "vue";

const props = defineProps<{
  post: ForumPost;
  createdAgo: string;
  flairClasses: Record<ForumFlairType, string>;
  upvoteRatioDisplay?: string;
  viewsDisplay?: string;
}>();

const avatarSrc = computed(() => props.post.author.avatar || undefined);
const userInitials = computed(() => {
  const parts = props.post.author.username.split(/[^A-Za-z0-9]+/);
  return parts
    .map((p) => p.charAt(0).toUpperCase())
    .join("")
    .slice(0, 2);
});
const communityIcon = computed(() => props.post.community?.icon || "");
</script>

<template>
  <header class="flex items-start justify-between gap-4">
    <div class="flex items-start gap-3 min-w-0">
      <Avatar class="h-9 w-9 border border-border/60">
        <AvatarImage
          v-if="avatarSrc"
          :src="avatarSrc"
          :alt="post.author.username"
        />
        <AvatarFallback class="text-xs font-semibold uppercase">{{
          userInitials
        }}</AvatarFallback>
      </Avatar>
      <div class="min-w-0 space-y-2">
        <div
          class="flex flex-wrap items-center gap-2 text-sm font-semibold text-foreground"
        >
          <span class="flex items-center gap-2">
            <span
              v-if="communityIcon"
              class="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-base"
              >{{ communityIcon }}</span
            >
            <span class="truncate">{{ post.community?.name }}</span>
          </span>
          <Badge
            v-if="post.flair"
            variant="secondary"
            :class="[
              'gap-1 rounded-full px-2.5 py-0.5 text-[10px]',
              flairClasses[post.flair.type],
            ]"
          >
            {{ post.flair.text }}
          </Badge>
          <Badge
            v-if="post.isPinned"
            variant="outline"
            class="flex items-center gap-1 rounded-full border-dashed px-2 py-0.5 text-[10px] uppercase"
          >
            <Pin class="h-3 w-3" /> Pinned
          </Badge>
          <span
            v-if="post.isLocked"
            class="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600"
          >
            <Lock class="h-3 w-3" /> Locked
          </span>
        </div>
        <div
          class="flex flex-wrap items-center gap-1 text-xs text-muted-foreground"
        >
          <span>u/{{ post.author.username }}</span>
          <span>•</span>
          <span>{{ createdAgo }}</span>
          <span>•</span>
          <span>{{ post.stats?.likes?.toLocaleString() ?? 0 }} likes</span>
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
</template>
