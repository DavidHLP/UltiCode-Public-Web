<script setup lang="ts">
import type { ContestEvent } from '@/mocks/schema/contest'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Users, CalendarClock, Radio, Sparkles, Clock3 } from 'lucide-vue-next'

const props = defineProps<{
  event: ContestEvent
  registrationPct: number
  countdownLabel: string
  formatDate: (value: string) => string
  formatTime: (value: string) => string
  formatDuration: (minutes: number) => string
}>()
</script>

<template>
  <section
    class="relative overflow-hidden rounded-3xl border-none bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-inner"
  >
    <img
      v-if="props.event.coverImage"
      :src="props.event.coverImage"
      :alt="props.event.title"
      class="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-30"
    />
    <div class="relative space-y-6 p-6 lg:p-8">
      <div class="flex flex-wrap items-center gap-3 text-sm text-white/80">
        <Badge variant="outline" class="border-white/40 bg-white/10 text-white">
          {{ props.event.series }}
        </Badge>
        <span class="inline-flex items-center gap-1 text-emerald-200">
          <Sparkles class="h-4 w-4" />
          {{ props.event.ratingBand }}
        </span>
        <span class="inline-flex items-center gap-1 text-sky-200">
          <Clock3 class="h-4 w-4" />
          {{ props.formatDuration(props.event.durationMinutes) }}
        </span>
      </div>
      <div class="space-y-4">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p class="text-xs uppercase tracking-[0.3em] text-white/60">Featured contest</p>
            <h1 class="text-3xl font-semibold leading-tight lg:text-4xl">
              {{ props.event.title }}
            </h1>
          </div>
          <Badge class="bg-emerald-500/20 text-emerald-200">
            {{ props.event.status === 'live' ? 'Live now' : 'Registration open' }}
          </Badge>
        </div>
        <p class="max-w-2xl text-base text-white/80">
          {{ props.event.description }}
        </p>
        <div class="flex flex-wrap gap-2">
          <Badge
            v-for="tag in props.event.tags"
            :key="tag"
            variant="outline"
            class="border-white/20 bg-white/5 text-xs text-white/80"
          >
            {{ tag }}
          </Badge>
        </div>
      </div>
      <div class="grid gap-4 md:grid-cols-3">
        <div class="space-y-1">
          <p class="text-xs uppercase tracking-[0.2em] text-white/50">Starts</p>
          <p class="text-lg font-semibold">
            {{ props.formatDate(props.event.startTime) }}
            <span class="text-white/60">· {{ props.formatTime(props.event.startTime) }}</span>
          </p>
          <p class="text-sm text-white/60">{{ props.event.timezone }}</p>
        </div>
        <div class="space-y-1">
          <p class="text-xs uppercase tracking-[0.2em] text-white/50">Countdown</p>
          <p class="text-lg font-semibold text-emerald-200">{{ props.countdownLabel }}</p>
          <p class="text-sm text-white/60">
            Editorial
            <span v-if="props.event.editorialEta">
              · {{ props.formatDate(props.event.editorialEta) }}
              {{ props.formatTime(props.event.editorialEta) }}
            </span>
            <span v-else>· ETA TBA</span>
          </p>
        </div>
        <div class="space-y-1">
          <p class="text-xs uppercase tracking-[0.2em] text-white/50">Prize pool</p>
          <p class="text-lg font-semibold">
            {{ props.event.prizePool || 'Community swag' }}
          </p>
          <p class="text-sm text-white/60">{{ props.event.rewards[0] }}</p>
        </div>
      </div>
      <div class="space-y-3">
        <div class="flex items-center justify-between text-sm text-white/70">
          <p>
            {{ props.event.registration.registered.toLocaleString() }} /
            {{ props.event.registration.slots.toLocaleString() }} slots
          </p>
          <p>Mode · {{ props.event.registration.mode.toUpperCase() }}</p>
        </div>
        <div class="h-2 rounded-full bg-white/10">
            <div
              class="h-full rounded-full bg-gradient-to-r from-emerald-300 to-sky-300"
              :style="{ width: `${props.registrationPct}%` }"
            />
        </div>
          <p class="text-xs uppercase tracking-[0.2em] text-white/60">
            Closes
            {{ props.formatDate(props.event.registration.closesAt ?? props.event.startTime) }}
        </p>
      </div>
      <div class="flex flex-wrap gap-3">
        <Button size="lg" class="gap-2 bg-white text-slate-900 hover:bg-slate-100">
          <Users class="h-4 w-4" />
          Secure slot
        </Button>
        <Button size="lg" variant="secondary" class="gap-2 border border-white/20 bg-transparent">
          <CalendarClock class="h-4 w-4" />
          Add to calendar
        </Button>
        <Button size="lg" variant="ghost" class="gap-2 text-white hover:bg-white/10">
          <Radio class="h-4 w-4" />
          Watch live
        </Button>
      </div>
    </div>
  </section>
</template>
