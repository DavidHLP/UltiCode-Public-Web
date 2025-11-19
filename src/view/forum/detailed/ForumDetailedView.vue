<script setup lang="ts">
import type { ForumFlairType, ForumThread } from '@/mocks/schema/forum'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { fetchForumThread, createForumComment } from '@/mocks/api/forum'
import { MessageSquare } from 'lucide-vue-next'
import { computed, ref } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import ThreadHeader from '@/view/forum/detailed/components/ThreadHeader.vue'
import ThreadMedia from '@/view/forum/detailed/components/ThreadMedia.vue'
import ThreadAwards from '@/view/forum/detailed/components/ThreadAwards.vue'
import ThreadActions from '@/view/forum/detailed/components/ThreadActions.vue'
import ThreadComments from '@/view/forum/detailed/components/ThreadComments.vue'

const route = useRoute()
const postId = route.params.postId as string
const threadRef = ref<ForumThread>(fetchForumThread(postId))
const thread = computed(() => threadRef.value)

const flairClasses: Record<ForumFlairType, string> = {
  announcement: 'bg-amber-100 text-amber-700',
  discussion: 'bg-blue-100 text-blue-700',
  showcase: 'bg-purple-100 text-purple-700',
  question: 'bg-emerald-100 text-emerald-700',
  hiring: 'bg-orange-100 text-orange-700',
}

const createdAgo = computed(() => formatRelativeTime(thread.value.post.createdAt))
const recommendationLabel = computed(() => thread.value.post.recommendation?.label ?? '')
const media = computed(() => thread.value.post.media)
const awards = computed(() => thread.value.post.awards ?? [])
const upvoteRatioDisplay = computed(() =>
  typeof thread.value.post.stats.upvoteRatio === 'number'
    ? `${Math.round(thread.value.post.stats.upvoteRatio * 100)}%`
    : undefined,
)
const viewsDisplay = computed(() =>
  typeof thread.value.post.stats.views === 'number'
    ? formatCount(thread.value.post.stats.views)
    : undefined,
)
const voteState = computed(() => thread.value.post.voteState ?? 'neutral')
const voteLabel = computed(() =>
  voteState.value === 'upvoted'
    ? 'Upvoted'
    : voteState.value === 'downvoted'
      ? 'Downvoted'
      : 'Upvote',
)
const scoreDisplay = computed(() => formatCount(thread.value.post.stats.score))
const commentsDisplay = computed(() => formatCount(thread.value.post.stats.comments))
const awardsDisplay = computed(() => formatCount(thread.value.post.stats.awards))
const savesDisplay = computed(() => formatCount(thread.value.post.stats.saves))
const sharesDisplay = computed(() => formatCount(thread.value.post.stats.shares))

function formatCount(value: number) {
  if (value >= 1000) return `${(value / 1000).toFixed(1).replace(/\.0$/, '')}k`
  return value.toString()
}

const relativeTimeFormatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
function formatRelativeTime(value: string) {
  const date = new Date(value)
  const diffMs = date.getTime() - Date.now()
  const ranges: [Intl.RelativeTimeFormatUnit, number][] = [
    ['year', 1000 * 60 * 60 * 24 * 365],
    ['month', 1000 * 60 * 60 * 24 * 30],
    ['week', 1000 * 60 * 60 * 24 * 7],
    ['day', 1000 * 60 * 60 * 24],
    ['hour', 1000 * 60 * 60],
    ['minute', 1000 * 60],
  ]
  for (const [unit, amountMs] of ranges) {
    const delta = diffMs / amountMs
    if (Math.abs(delta) >= 1) return relativeTimeFormatter.format(Math.round(delta), unit)
  }
  return 'just now'
}

function onSubmitComment(body: string) {
  createForumComment(postId, body, null)
  threadRef.value = fetchForumThread(postId)
}
</script>

<template>
  <div class="mx-auto w-full max-w-4xl space-y-6 px-4 lg:px-10">
    <div class="py-4">
      <RouterLink
        to="/forum"
        class="text-sm font-medium text-primary underline-offset-2 hover:underline"
      >
        ← Back to forum
      </RouterLink>
    </div>

    <Card class="rounded-xl border border-border/50 bg-background/70 shadow-none">
      <CardHeader class="pb-2">
        <CardTitle class="text-xl">{{ thread.post.title }}</CardTitle>
      </CardHeader>
      <CardContent class="space-y-4">
        <ThreadHeader
          :post="thread.post"
          :created-ago="createdAgo"
          :flair-classes="flairClasses"
          :upvote-ratio-display="upvoteRatioDisplay"
          :views-display="viewsDisplay"
        />
        <p v-if="recommendationLabel" class="text-xs text-muted-foreground">
          {{ recommendationLabel }}
        </p>

        <section v-if="thread.post.excerpt" class="text-sm text-muted-foreground">
          {{ thread.post.excerpt }}
        </section>

        <ThreadMedia :media="media" :title="thread.post.title" />

        <ThreadAwards v-if="awards.length" :awards="awards" />
      </CardContent>
      <CardFooter class="flex flex-wrap items-center gap-2 border-t border-border/50 px-4 py-3">
        <ThreadActions
          :vote-state="voteState"
          :vote-label="voteLabel"
          :score-display="scoreDisplay"
          :comments-display="commentsDisplay"
          :awards-display="awardsDisplay"
          :shares-display="sharesDisplay"
          :saves-display="savesDisplay"
        />
      </CardFooter>
    </Card>

    <Card class="border-border/60 bg-card/60">
      <CardHeader class="space-y-1 border-b border-border/60 px-4 py-3">
        <CardTitle class="flex items-center gap-2 text-sm font-semibold">
          <MessageSquare class="h-4 w-4 text-blue-500" />
          Comments
        </CardTitle>
      </CardHeader>
      <CardContent class="p-4">
        <ThreadComments
          :comments="thread.comments"
          :is-locked="thread.post.isLocked"
          @submit="onSubmitComment"
        />
      </CardContent>
    </Card>
  </div>
</template>
