<script setup lang="ts">
import type { ContestOpsCheckpoint, ContestOpsPhase, ContestOpsStatus } from '@/mocks/schema/contest'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const props = defineProps<{
  phases: { phase: ContestOpsPhase; entries: ContestOpsCheckpoint[] }[]
  phaseLabels: Record<ContestOpsPhase, string>
  statusStyles: Record<ContestOpsStatus, string>
  statusLabels: Record<ContestOpsStatus, string>
  formatDate: (value: string) => string
  formatTime: (value: string) => string
}>()
</script>

<template>
  <Card class="bg-card/80 backdrop-blur">
    <CardHeader>
      <CardTitle class="flex items-center gap-2">
        Ops timeline
      </CardTitle>
      <CardDescription>Milestones tied to the featured sprint</CardDescription>
    </CardHeader>
    <CardContent class="space-y-5">
      <div v-for="phase in props.phases" :key="phase.phase" class="space-y-3">
        <div class="flex items-center justify-between">
          <p class="text-xs uppercase tracking-[0.35em] text-muted-foreground">
            {{ props.phaseLabels[phase.phase] }}
          </p>
          <Badge variant="outline" class="text-[11px]">
            {{ phase.entries.length }} checkpoints
          </Badge>
        </div>
        <div class="space-y-3">
          <div
            v-for="checkpoint in phase.entries"
            :key="checkpoint.id"
            class="rounded-xl border border-border/50 p-4"
          >
            <div class="flex flex-wrap items-center justify-between gap-2">
              <p class="font-semibold">{{ checkpoint.title }}</p>
              <Badge
                variant="outline"
                class="text-[11px] font-medium"
                :class="props.statusStyles[checkpoint.status]"
              >
                {{ props.statusLabels[checkpoint.status] }}
              </Badge>
            </div>
            <p class="text-xs text-muted-foreground">
              {{ checkpoint.owner }} ·
              {{ props.formatDate(checkpoint.dueAt) }} ·
              {{ props.formatTime(checkpoint.dueAt) }}
            </p>
            <p class="mt-2 text-sm text-muted-foreground">{{ checkpoint.notes }}</p>
            <div class="mt-3 flex flex-wrap gap-2 text-xs">
              <Badge variant="secondary" class="text-[11px]">
                {{ props.phaseLabels[checkpoint.category] }}
              </Badge>
              <Badge variant="outline" class="text-[11px]">
                Effort {{ checkpoint.effort }}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
</template>
