<script setup lang="ts">
import type { ContestLeaderboardEntry } from '@/mocks/schema/contest'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Trophy } from 'lucide-vue-next'
import { cn } from '@/lib/utils'

const props = defineProps<{
  groups: { title: string; entries: ContestLeaderboardEntry[] }[]
  formatDelta: (delta: number) => string
}>()
</script>

<template>
  <Card class="bg-card/80 backdrop-blur">
    <CardHeader class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
      <div>
        <CardTitle>Leaderboard pulse</CardTitle>
        <CardDescription>Targeted sample from last rated windows</CardDescription>
      </div>
      <Button variant="outline" size="sm" class="gap-2">
        <Trophy class="h-4 w-4" />
        Full standings
      </Button>
    </CardHeader>
    <CardContent class="space-y-6">
      <div
        v-for="group in props.groups"
        :key="group.title"
        class="rounded-xl border border-border/60 p-4"
      >
        <div class="flex items-center justify-between">
          <p class="text-sm font-semibold">{{ group.title }}</p>
          <span class="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Top {{ group.entries.length }}
          </span>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Handle</TableHead>
              <TableHead class="text-right">Rating</TableHead>
              <TableHead class="text-right">Solved</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="entry in group.entries" :key="entry.id">
              <TableCell class="font-semibold">#{{ entry.rank }}</TableCell>
              <TableCell>
                <div class="flex items-center gap-2">
                  <Avatar class="h-7 w-7 border">
                    <AvatarFallback class="text-xs uppercase">
                      {{ entry.handle.slice(0, 2) }}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p class="font-semibold leading-none">{{ entry.handle }}</p>
                    <p class="text-xs text-muted-foreground">
                      {{ entry.country }} · Pen {{ entry.penalty }}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell class="text-right font-semibold">
                {{ entry.rating }}
                <span
                  :class="
                    cn(
                      'ml-1 text-xs',
                      entry.ratingDelta > 0 && 'text-emerald-500',
                      entry.ratingDelta < 0 && 'text-rose-500',
                      entry.ratingDelta === 0 && 'text-muted-foreground',
                    )
                  "
                >
                    {{ props.formatDelta(entry.ratingDelta) }}
                </span>
              </TableCell>
              <TableCell class="text-right">
                {{ entry.solved }}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </CardContent>
  </Card>
</template>
