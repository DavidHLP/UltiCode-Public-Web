<script setup lang="ts">
import type { ContestEvent, ContestStatus } from '@/mocks/schema/contest'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CalendarDays } from 'lucide-vue-next'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

const props = defineProps<{
  scheduleGroups: Partial<Record<ContestStatus, ContestEvent[]>>
  statuses: ContestStatus[]
  search: string
  division: string
  difficulty: string
  mode: string
  ratedOnly: boolean
  showArchived: boolean
  statusAccentClasses: Record<ContestStatus, string>
  formatDate: (value: string) => string
  formatTime: (value: string) => string
  formatDuration: (value: number) => string
  isRegistered: (id: string) => boolean
}>()

const emit = defineEmits<{
  (e: 'update:search', value: string): void
  (e: 'update:division', value: string): void
  (e: 'update:difficulty', value: string): void
  (e: 'update:mode', value: string): void
  (e: 'update:ratedOnly', value: boolean): void
  (e: 'update:showArchived', value: boolean): void
  (e: 'run-brief', payload: ContestEvent): void
  (e: 'manage-entry', payload: ContestEvent): void
}>()

const handleInput = (event: Event) => {
  emit('update:search', (event.target as HTMLInputElement).value)
}
</script>

<template>
  <Card class="bg-card/80 backdrop-blur">
    <CardHeader class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
      <div>
        <CardTitle>Upcoming contests</CardTitle>
        <CardDescription>Global + premium ladders inspired by LeetCode cadence</CardDescription>
      </div>
      <Button variant="outline" size="sm" class="gap-2">
        <CalendarDays class="h-4 w-4" />
        Export iCal
      </Button>
    </CardHeader>
    <CardContent class="space-y-6">
      <div class="flex flex-wrap items-center gap-2 md:gap-3">
        <Input
          :model-value="props.search"
          placeholder="Search contests"
          class="w-56"
          @input="handleInput"
        />
        <Select :model-value="props.division" @update:value="emit('update:division', $event)">
          <SelectTrigger class="min-w-40">
            <SelectValue placeholder="Division" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All divisions</SelectItem>
            <SelectItem value="global">Global</SelectItem>
            <SelectItem value="regional">Regional</SelectItem>
            <SelectItem value="college">College</SelectItem>
            <SelectItem value="team">Team</SelectItem>
          </SelectContent>
        </Select>
        <Select :model-value="props.difficulty" @update:value="emit('update:difficulty', $event)">
          <SelectTrigger class="min-w-40">
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All difficulties</SelectItem>
            <SelectItem value="Starter">Starter</SelectItem>
            <SelectItem value="Intermediate">Intermediate</SelectItem>
            <SelectItem value="Advanced">Advanced</SelectItem>
            <SelectItem value="Championship">Championship</SelectItem>
          </SelectContent>
        </Select>
        <Select :model-value="props.mode" @update:value="emit('update:mode', $event)">
          <SelectTrigger class="min-w-40">
            <SelectValue placeholder="Mode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All modes</SelectItem>
            <SelectItem value="solo">Solo</SelectItem>
            <SelectItem value="team">Team</SelectItem>
          </SelectContent>
        </Select>
        <div class="flex items-center gap-2 pl-1">
          <Switch :checked="props.ratedOnly" @update:checked="emit('update:ratedOnly', $event)" />
          <span class="text-sm text-muted-foreground">Rated only</span>
        </div>
        <div class="flex items-center gap-2">
          <Switch :checked="props.showArchived" @update:checked="emit('update:showArchived', $event)" />
          <span class="text-sm text-muted-foreground">Show archived</span>
        </div>
      </div>

      <div v-for="status in props.statuses" :key="status" class="space-y-3">
        <div class="flex items-center gap-2">
          <div class="h-2 w-2 rounded-full bg-primary" />
          <p class="text-xs uppercase tracking-[0.35em] text-muted-foreground">
            {{ status }}
          </p>
        </div>
        <div class="space-y-4">
          <div
            v-for="event in props.scheduleGroups[status] ?? []"
            :key="event.id"
            class="rounded-xl border border-border/60 p-4 transition hover:border-primary"
          >
            <div class="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p class="flex items-center gap-2 text-sm font-semibold">
                  {{ event.title }}
                  <Badge variant="outline" class="border-border text-xs font-normal text-muted-foreground">
                    {{ event.series }}
                  </Badge>
                </p>
                <p class="text-sm text-muted-foreground">{{ event.description }}</p>
              </div>
              <div class="flex flex-col items-end gap-1 text-right">
                <Badge :class="['text-xs', props.statusAccentClasses[event.status]]">
                  {{ event.status }}
                </Badge>
                <Badge
                  v-if="props.isRegistered(event.id)"
                  variant="outline"
                  class="border-emerald-400/40 bg-emerald-500/10 text-[11px] text-emerald-400"
                >
                  Registered
                </Badge>
              </div>
            </div>
            <Separator class="my-3" />
            <div class="grid gap-4 md:grid-cols-4">
              <div>
                <p class="text-xs text-muted-foreground">Window</p>
                <p class="font-semibold">
                  {{ props.formatDate(event.startTime) }}
                  ·
                  {{ props.formatTime(event.startTime) }}
                </p>
                <p class="text-xs text-muted-foreground">{{ event.timezone }}</p>
              </div>
              <div>
                <p class="text-xs text-muted-foreground">Duration</p>
                <p class="font-semibold">{{ props.formatDuration(event.durationMinutes) }}</p>
                <p class="text-xs text-muted-foreground">{{ event.ratingBand }}</p>
              </div>
              <div>
                <p class="text-xs text-muted-foreground">Reward</p>
                <p class="font-semibold">{{ event.rewards[0] || 'Digital badge' }}</p>
                <p class="text-xs text-muted-foreground">
                  Mode · {{ event.registration.mode.toUpperCase() }}
                </p>
              </div>
              <div>
                <p class="text-xs text-muted-foreground">Slots</p>
                <p class="font-semibold">
                  {{ event.registration.registered.toLocaleString() }} /
                  {{ event.registration.slots.toLocaleString() }}
                </p>
                <p class="text-xs text-muted-foreground">
                  {{ event.registration.open ? 'Open now' : 'Closed' }}
                </p>
              </div>
            </div>
            <div class="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
              <Badge v-for="tag in event.tags" :key="tag" variant="outline">
                {{ tag }}
              </Badge>
            </div>
            <div class="mt-4 flex flex-wrap gap-2">
              <Button variant="secondary" size="sm" @click="emit('run-brief', event)">
                Run brief
              </Button>
              <Button variant="outline" size="sm" @click="emit('manage-entry', event)">
                Manage entry
              </Button>
              <Button variant="ghost" size="sm" class="text-muted-foreground">
                Share
              </Button>
            </div>
          </div>
          <p v-if="!props.scheduleGroups[status]?.length" class="text-sm text-muted-foreground">
            Nothing in {{ status }}.
          </p>
        </div>
      </div>
    </CardContent>
  </Card>
</template>
