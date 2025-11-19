<script setup lang="ts">
import type { ContestTrack } from '@/mocks/schema/contest'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

const props = defineProps<{
  tracks: ContestTrack[]
  trackAccent: (track: ContestTrack) => string
}>()
</script>

<template>
  <Card class="bg-card/80 backdrop-blur">
    <CardHeader class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
      <div>
        <CardTitle>Tracks & readiness</CardTitle>
        <CardDescription>Choose a lane to level up between contests</CardDescription>
      </div>
      <Badge variant="outline" class="uppercase tracking-[0.35em]">Prep Lab</Badge>
    </CardHeader>
    <CardContent class="grid gap-4">
      <div
        v-for="track in props.tracks"
        :key="track.id"
        class="rounded-2xl border p-4 lg:p-5"
        :class="`bg-gradient-to-br ${props.trackAccent(track)}`"
      >
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p class="text-xs uppercase tracking-[0.35em] text-muted-foreground">
              {{ track.difficulty }}
            </p>
            <h3 class="text-xl font-semibold">{{ track.name }}</h3>
            <p class="text-sm text-muted-foreground">{{ track.summary }}</p>
          </div>
          <Badge variant="secondary">{{ track.badge }}</Badge>
        </div>
        <Separator class="my-4" />
        <div class="grid gap-4 md:grid-cols-3">
          <div>
            <p class="text-xs text-muted-foreground">Cadence</p>
            <p class="font-semibold">{{ track.cadence }}</p>
          </div>
          <div>
            <p class="text-xs text-muted-foreground">Target rating</p>
            <p class="font-semibold">{{ track.targetRating }}</p>
          </div>
          <div>
            <p class="text-xs text-muted-foreground">Focus</p>
            <p class="text-sm">{{ track.focus.join(', ') }}</p>
          </div>
        </div>
        <div class="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
          <Badge v-for="item in track.included" :key="item" variant="outline">
            {{ item }}
          </Badge>
        </div>
      </div>
    </CardContent>
  </Card>
</template>
