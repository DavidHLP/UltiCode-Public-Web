<script setup lang="ts">
import type { ForumPostMedia } from '@/mocks/schema/forum.ts'
import { AspectRatio } from '@/components/ui/aspect-ratio'

defineProps<{
  media?: ForumPostMedia
  title: string
}>()

function formatPollPercentage(votes: number, totalVotes: number) {
  if (totalVotes <= 0) return '0%'
  return `${Math.round((votes / totalVotes) * 100)}%`
}

function formatPollWidth(votes: number, totalVotes: number) {
  if (totalVotes <= 0) return '0%'
  const percentage = (votes / totalVotes) * 100
  const minimum = votes > 0 && percentage < 4 ? 4 : percentage
  return `${Math.min(100, Math.max(minimum, 0)).toFixed(0)}%`
}
</script>

<template>
  <section v-if="media" class="overflow-hidden rounded-lg border border-border/60">
    <AspectRatio v-if="media.kind === 'image'" :ratio="media.ratio ?? 16 / 9" class="bg-muted">
      <img :src="media.src" :alt="media.alt ?? title" class="h-full w-full object-cover" />
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
        <p class="text-xs uppercase tracking-wide text-muted-foreground">{{ media.domain }}</p>
        <p class="truncate font-medium text-foreground">{{ media.title ?? media.url }}</p>
        <p v-if="media.description" class="line-clamp-2 text-xs text-muted-foreground">
          {{ media.description }}
        </p>
      </div>
    </div>

    <div
      v-else-if="media.kind === 'text'"
      class="space-y-2 bg-muted/20 p-4 text-sm leading-relaxed text-muted-foreground"
    >
      {{ media.body }}
      <pre v-if="media.markdown" class="whitespace-pre-wrap text-xs text-muted-foreground">{{
        media.markdown
      }}</pre>
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
        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Community poll
        </p>
        <p class="font-medium text-foreground">{{ media.question }}</p>
      </header>
      <ul class="space-y-2">
        <li v-for="option in media.options" :key="option.id" class="space-y-1">
          <div class="flex items-center justify-between text-[11px] text-muted-foreground">
            <span class="text-foreground">{{ option.label }}</span>
            <span>{{ formatPollPercentage(option.votes, media.totalVotes) }}</span>
          </div>
          <div class="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              class="h-full rounded-full bg-primary"
              :style="{ width: formatPollWidth(option.votes, media.totalVotes) }"
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
</template>
