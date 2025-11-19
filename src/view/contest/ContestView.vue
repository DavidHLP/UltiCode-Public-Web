<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type {
  ContestCrewMember,
  ContestEvent,
  ContestLeaderboardEntry,
  ContestOpsCheckpoint,
  ContestOpsPhase,
  ContestOpsStatus,
  ContestStatus,
  ContestTrack,
  ContestResource,
  ContestFaqItem,
  ContestInsight,
} from '@/mocks/schema/contest'
import {
  fetchContestCrew,
  fetchContestFaq,
  fetchContestFeaturedEvent,
  fetchContestInsights,
  fetchContestLeaderboard,
  fetchContestOpsCheckpoints,
  fetchContestResources,
  fetchContestSchedule,
  fetchContestTracks,
} from '@/api/contest'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users, CalendarClock } from 'lucide-vue-next'
import ContestHero from './components/ContestHero.vue'
import ContestHealthPanel from './components/ContestHealthPanel.vue'
import ContestMetricsStrip from './components/ContestMetricsStrip.vue'
import ContestScheduleBoard from './components/ContestScheduleBoard.vue'
import ContestOpsTimeline from './components/ContestOpsTimeline.vue'
import ContestLeaderboardPanel from './components/ContestLeaderboardPanel.vue'
import ContestSignalMonitor from './components/ContestSignalMonitor.vue'
import ContestTracksPanel from './components/ContestTracksPanel.vue'
import ContestResourcesPanel from './components/ContestResourcesPanel.vue'
import ContestCrewDesk from './components/ContestCrewDesk.vue'
import ContestFaqPanel from './components/ContestFaqPanel.vue'

const heroEvent = ref<ContestEvent | null>(null)
const contestScheduleData = ref<ContestEvent[]>([])
const contestInsightsData = ref<ContestInsight[]>([])
const contestLeaderboardData = ref<ContestLeaderboardEntry[]>([])
const contestTracksData = ref<ContestTrack[]>([])
const contestResourcesData = ref<ContestResource[]>([])
const contestFaqData = ref<ContestFaqItem[]>([])
const contestOpsData = ref<ContestOpsCheckpoint[]>([])
const contestCrewData = ref<ContestCrewMember[]>([])
const isContestLoading = ref(true)

onMounted(async () => {
  isContestLoading.value = true
  try {
    const [
      hero,
      schedule,
      insights,
      leaderboard,
      tracks,
      resources,
      faqs,
      ops,
      crew,
    ] = await Promise.all([
      fetchContestFeaturedEvent(),
      fetchContestSchedule(),
      fetchContestInsights(),
      fetchContestLeaderboard(),
      fetchContestTracks(),
      fetchContestResources(),
      fetchContestFaq(),
      fetchContestOpsCheckpoints(),
      fetchContestCrew(),
    ])
    heroEvent.value = hero
    contestScheduleData.value = schedule
    contestInsightsData.value = insights
    contestLeaderboardData.value = leaderboard
    contestTracksData.value = tracks
    contestResourcesData.value = resources
    contestFaqData.value = faqs
    contestOpsData.value = ops
    contestCrewData.value = crew
  } catch (error) {
    console.error('Failed to load contest data', error)
  } finally {
    isContestLoading.value = false
  }
})

const tabValue = ref('plan')
const tabItems = [
  {
    value: 'plan',
    label: 'Plan & register',
    description: 'Filter contest windows, manage slots, and monitor operations.',
  },
  {
    value: 'perform',
    label: 'Live signals',
    description: 'Leaderboard slices + telemetry once the window is live.',
  },
  {
    value: 'support',
    label: 'Prep & support',
    description: 'Tracks, docs, FAQ, and crew contacts.',
  },
]

const searchQuery = ref('')
const divisionFilter = ref('all')
const difficultyFilter = ref('all')
const modeFilter = ref('all')
const ratedOnly = ref(false)
const showArchived = ref(false)

const detailSheetOpen = ref(false)
const manageDialogOpen = ref(false)
const selectedEvent = ref<ContestEvent | null>(null)
const manageEvent = ref<ContestEvent | null>(null)
const manageMode = ref<'solo' | 'team'>('solo')
const manageRegistered = ref(false)
const registrationState = ref<Record<string, { mode: 'solo' | 'team'; registered: boolean }>>({})

const heroEventData = computed(() => heroEvent.value ?? contestScheduleData.value[0] ?? null)

const activeTabDescription = computed(
  () => tabItems.find((tab) => tab.value === tabValue.value)?.description ?? '',
)

const filteredSchedule = computed(() => {
  const normalizedSearch = searchQuery.value.trim().toLowerCase()
  return contestScheduleData.value.filter((event) => {
    const matchesSearch =
      !normalizedSearch ||
      event.title.toLowerCase().includes(normalizedSearch) ||
      event.description.toLowerCase().includes(normalizedSearch) ||
      event.tags.some((t) => t.toLowerCase().includes(normalizedSearch))
    const matchesDivision =
      divisionFilter.value === 'all' || event.division === divisionFilter.value
    const matchesDifficulty =
      difficultyFilter.value === 'all' || event.difficulty === difficultyFilter.value
    const matchesMode = modeFilter.value === 'all' || event.registration.mode === modeFilter.value
    const matchesRated = !ratedOnly.value || event.isRated
    const matchesArchived = showArchived.value || event.status !== 'archived'
    return (
      matchesSearch &&
      matchesDivision &&
      matchesDifficulty &&
      matchesMode &&
      matchesRated &&
      matchesArchived
    )
  })
})

const sortedSchedule = computed(() => {
  return [...filteredSchedule.value].sort(
    (a, b) => new Date(a.startTime).valueOf() - new Date(b.startTime).valueOf(),
  )
})

const scheduleGroups = computed(() => {
  const groups: Partial<Record<ContestStatus, ContestEvent[]>> = {}
  sortedSchedule.value.forEach((event) => {
    if (!groups[event.status]) {
      groups[event.status] = []
    }
    groups[event.status]!.push(event)
  })
  return groups
})

const statusesToRender = computed<ContestStatus[]>(() => {
  return showArchived.value
    ? (['live', 'registration', 'upcoming', 'archived'] as ContestStatus[])
    : (['live', 'registration', 'upcoming'] as ContestStatus[])
})

const leaderboardGroups = computed(() => {
  const map = contestLeaderboardData.value.reduce<Record<string, ContestLeaderboardEntry[]>>(
    (acc, entry) => {
      if (!acc[entry.divisionTag]) {
        acc[entry.divisionTag] = []
      }
      acc[entry.divisionTag]!.push(entry)
      return acc
    },
    {},
  )

  return Object.entries(map).map(([title, entries]) => ({
    title,
    entries: [...entries].sort((a, b) => a.rank - b.rank),
  }))
})

const heroRegistrationPct = computed(() => {
  const hero = heroEventData.value
  if (!hero || !hero.registration.slots) return 0
  return Math.min(
    100,
    Math.round((hero.registration.registered / hero.registration.slots) * 100),
  )
})

const heroCountdownLabel = computed(() => {
  const hero = heroEventData.value
  if (!hero) return 'Loading...'
  if (hero.status === 'live') return 'Live now'
  const diffMs = new Date(hero.startTime).valueOf() - Date.now()
  if (diffMs <= 0) return 'Starting shortly'
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
  if (diffHours >= 24) {
    const days = Math.floor(diffHours / 24)
    const hoursLeft = diffHours % 24
    return `${days}d ${hoursLeft}h`
  }
  if (diffHours > 0) {
    return `${diffHours}h ${diffMinutes}m`
  }
  return `${diffMinutes} minutes`
})

const statusAccentClasses: Record<ContestStatus, string> = {
  live: 'border-green-500/60 bg-green-500/10 text-green-300',
  registration: 'border-sky-400/60 bg-sky-400/10 text-sky-200',
  upcoming: 'border-amber-400/60 bg-amber-400/10 text-amber-200',
  archived: 'border-muted text-muted-foreground',
}

const formatContestDate = (iso: string) => {
  const date = new Date(iso)
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
  }).format(date)
}

const formatContestTime = (iso: string) => {
  const date = new Date(iso)
  return new Intl.DateTimeFormat('en', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours && mins) return `${hours}h ${mins}m`
  if (hours) return `${hours}h`
  return `${mins}m`
}

const formatDelta = (delta: number) => (delta > 0 ? `+${delta}` : delta.toString())

const trackAccent = (track: ContestTrack) => {
  const palette: Record<ContestTrack['difficulty'], string> = {
    Starter: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/30',
    Intermediate: 'from-sky-500/20 to-sky-500/5 border-sky-500/30',
    Advanced: 'from-purple-500/20 to-purple-500/5 border-purple-500/30',
  }
  return palette[track.difficulty]
}

const resourceBadge = {
  guide: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  video: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  playbook: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  announcement: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
} as const

const opsPhaseLabels: Record<ContestOpsPhase, string> = {
  'pre-flight': 'Pre-flight',
  live: 'Live window',
  post: 'Post contest',
}

const opsStatusBadge: Record<ContestOpsStatus, string> = {
  pending: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
  in_progress: 'border-sky-500/30 bg-sky-500/10 text-sky-300',
  done: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
}

const opsStatusLabel: Record<ContestOpsStatus, string> = {
  pending: 'Pending',
  in_progress: 'In progress',
  done: 'Complete',
}

const opsPhaseOrder: ContestOpsPhase[] = ['pre-flight', 'live', 'post']
const opsByPhase = computed(() => {
  const grouped: Record<ContestOpsPhase, ContestOpsCheckpoint[]> = {
    'pre-flight': [],
    live: [],
    post: [],
  }
  contestOpsData.value.forEach((checkpoint) => {
    grouped[checkpoint.category].push(checkpoint)
  })
  return opsPhaseOrder
    .map((phase) => ({
      phase,
      entries: grouped[phase].sort(
        (a, b) => new Date(a.dueAt).valueOf() - new Date(b.dueAt).valueOf(),
      ),
    }))
    .filter((phase) => phase.entries.length)
})

const crewMembers = computed<ContestCrewMember[]>(() => {
  return [...contestCrewData.value].sort((a, b) => a.name.localeCompare(b.name))
})

const isEventRegistered = (id: string) => registrationState.value[id]?.registered ?? false

const updateSearch = (value: string) => {
  searchQuery.value = value
}
const updateDivision = (value: string) => {
  divisionFilter.value = value
}
const updateDifficulty = (value: string) => {
  difficultyFilter.value = value
}
const updateMode = (value: string) => {
  modeFilter.value = value
}
const updateRatedOnly = (value: boolean) => {
  ratedOnly.value = value
}
const updateShowArchived = (value: boolean) => {
  showArchived.value = value
}

const openEventBrief = (event: ContestEvent) => {
  selectedEvent.value = event
  detailSheetOpen.value = true
}

const openManageDialog = (event: ContestEvent) => {
  manageEvent.value = event
  const existing = registrationState.value[event.id]
  manageMode.value = existing?.mode ?? event.registration.mode
  manageRegistered.value = existing?.registered ?? false
  manageDialogOpen.value = true
}

const persistRegistration = (registered: boolean) => {
  if (!manageEvent.value) return
  registrationState.value = {
    ...registrationState.value,
    [manageEvent.value.id]: {
      mode: manageMode.value,
      registered,
    },
  }
  manageRegistered.value = registered
}

const handleRegister = () => persistRegistration(true)
const handleCancelRegistration = () => persistRegistration(false)

const canConfirmEntry = computed(() => {
  if (!manageEvent.value) return false
  if (manageRegistered.value) return true
  return (
    manageEvent.value.registration.registered < manageEvent.value.registration.slots &&
    manageEvent.value.status !== 'archived'
  )
})
</script>

<template>
  <ScrollArea class="h-full">
    <div class="mx-auto w-full max-w-6xl space-y-8 px-4 py-4 lg:px-10">
      <section class="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <ContestHero
          v-if="heroEventData"
          :event="heroEventData"
          :registration-pct="heroRegistrationPct"
          :countdown-label="heroCountdownLabel"
          :format-date="formatContestDate"
          :format-time="formatContestTime"
          :format-duration="formatDuration"
        />
        <div
          v-else
          class="flex min-h-[260px] items-center justify-center rounded-3xl border border-dashed border-muted-foreground/30 bg-muted/20 text-sm text-muted-foreground"
        >
          Loading featured contest...
        </div>
        <ContestHealthPanel :insights="contestInsightsData" />
      </section>

      <ContestMetricsStrip :insights="contestInsightsData" />

      <Tabs v-model="tabValue" class="space-y-6">
        <div class="space-y-3">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p class="text-xs uppercase tracking-[0.35em] text-muted-foreground">Workspace</p>
              <h2 class="text-xl font-semibold">Contest command deck</h2>
            </div>
            <TabsList class="w-full overflow-auto rounded-lg bg-muted/40 p-1 sm:w-auto">
              <TabsTrigger v-for="tab in tabItems" :key="tab.value" :value="tab.value">
                {{ tab.label }}
              </TabsTrigger>
            </TabsList>
          </div>
          <p class="text-sm text-muted-foreground">{{ activeTabDescription }}</p>
        </div>

        <TabsContent value="plan" class="space-y-6">
          <section class="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
            <ContestScheduleBoard
              :schedule-groups="scheduleGroups"
              :statuses="statusesToRender"
              :search="searchQuery"
              :division="divisionFilter"
              :difficulty="difficultyFilter"
              :mode="modeFilter"
              :rated-only="ratedOnly"
              :show-archived="showArchived"
              :status-accent-classes="statusAccentClasses"
              :format-date="formatContestDate"
              :format-time="formatContestTime"
              :format-duration="formatDuration"
              :is-registered="isEventRegistered"
              @update:search="updateSearch"
              @update:division="updateDivision"
              @update:difficulty="updateDifficulty"
              @update:mode="updateMode"
              @update:rated-only="updateRatedOnly"
              @update:show-archived="updateShowArchived"
              @run-brief="openEventBrief"
              @manage-entry="openManageDialog"
            />
            <ContestOpsTimeline
              :phases="opsByPhase"
              :phase-labels="opsPhaseLabels"
              :status-styles="opsStatusBadge"
              :status-labels="opsStatusLabel"
              :format-date="formatContestDate"
              :format-time="formatContestTime"
            />
          </section>
        </TabsContent>

        <TabsContent value="perform" class="space-y-6">
          <section class="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
            <ContestLeaderboardPanel :groups="leaderboardGroups" :format-delta="formatDelta" />
            <ContestSignalMonitor :insights="contestInsightsData" />
          </section>
        </TabsContent>

        <TabsContent value="support" class="space-y-6">
          <section class="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
            <ContestTracksPanel :tracks="contestTracksData" :track-accent="trackAccent" />
            <div class="space-y-6">
              <ContestResourcesPanel
                :resources="contestResourcesData"
                :badge-styles="resourceBadge"
              />
              <ContestCrewDesk :crew="crewMembers" />
              <ContestFaqPanel :faqs="contestFaqData" />
            </div>
          </section>
        </TabsContent>
      </Tabs>
    </div>

    <Sheet v-model:open="detailSheetOpen">
      <SheetContent class="sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>{{ selectedEvent?.title ?? 'Contest brief' }}</SheetTitle>
          <SheetDescription>
            {{ selectedEvent?.series }} · {{ selectedEvent?.ratingBand }}
          </SheetDescription>
        </SheetHeader>
        <div v-if="selectedEvent" class="space-y-4">
          <div class="grid gap-3 md:grid-cols-2">
            <div>
              <p class="text-xs uppercase tracking-[0.2em] text-muted-foreground">Window</p>
              <p class="font-semibold">
                {{ formatContestDate(selectedEvent.startTime) }} ·
                {{ formatContestTime(selectedEvent.startTime) }}
              </p>
              <p class="text-xs text-muted-foreground">{{ selectedEvent.timezone }}</p>
            </div>
            <div>
              <p class="text-xs uppercase tracking-[0.2em] text-muted-foreground">Duration</p>
              <p class="font-semibold">{{ formatDuration(selectedEvent.durationMinutes) }}</p>
              <p class="text-xs text-muted-foreground">
                Mode · {{ selectedEvent.registration.mode.toUpperCase() }}
              </p>
            </div>
          </div>
          <p class="text-sm text-muted-foreground">{{ selectedEvent.description }}</p>
          <div class="flex flex-wrap gap-2">
            <Badge v-for="tag in selectedEvent.tags" :key="tag" variant="outline" class="text-xs">
              {{ tag }}
            </Badge>
          </div>
          <div class="rounded-xl border border-border/60 p-4">
            <p class="text-sm font-semibold">Registration</p>
            <p class="text-xs text-muted-foreground">
              {{ selectedEvent.registration.registered.toLocaleString() }} /
              {{ selectedEvent.registration.slots.toLocaleString() }} slots ·
              closes
              {{ formatContestDate(selectedEvent.registration.closesAt ?? selectedEvent.startTime) }}
            </p>
          </div>
          <div class="flex flex-wrap gap-2">
            <Button size="sm" class="gap-2" @click="openManageDialog(selectedEvent)">
              <Users class="h-4 w-4" />
              Manage entry
            </Button>
            <Button size="sm" variant="secondary">
              <CalendarClock class="h-4 w-4" />
              Hold slot
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>

    <Dialog v-model:open="manageDialogOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{{ manageEvent?.title ?? 'Manage entry' }}</DialogTitle>
          <DialogDescription>
            {{ manageEvent?.series }} · {{ manageEvent?.ratingBand }}
          </DialogDescription>
        </DialogHeader>
        <div v-if="manageEvent" class="space-y-4">
          <div class="grid gap-3 md:grid-cols-3">
            <div>
              <p class="text-xs uppercase tracking-[0.2em] text-muted-foreground">Slots</p>
              <p class="text-sm">
                {{ manageEvent.registration.registered.toLocaleString() }} /
                {{ manageEvent.registration.slots.toLocaleString() }}
              </p>
            </div>
            <div>
              <p class="text-xs uppercase tracking-[0.2em] text-muted-foreground">Status</p>
              <p class="text-sm capitalize">{{ manageEvent.status }}</p>
            </div>
            <div>
              <p class="text-xs uppercase tracking-[0.2em] text-muted-foreground">Mode</p>
              <Select v-model:value="manageMode">
                <SelectTrigger class="w-[200px]">
                  <SelectValue placeholder="Select mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="solo">Solo</SelectItem>
                  <SelectItem value="team">Team</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <p v-if="!canConfirmEntry && !manageRegistered" class="text-xs text-amber-600">
            Slots might be full or the contest is archived.
          </p>
          <p v-else class="text-xs text-muted-foreground">
            {{ manageRegistered ? 'You are registered locally.' : 'No active registration yet.' }}
          </p>
        </div>
        <DialogFooter class="flex flex-col gap-2 sm:flex-row">
          <Button class="flex-1" :disabled="!canConfirmEntry" @click="handleRegister">
            {{ manageRegistered ? 'Update entry' : 'Confirm entry' }}
          </Button>
          <Button
            variant="outline"
            class="flex-1"
            :disabled="!manageRegistered"
            @click="handleCancelRegistration"
          >
            Cancel entry
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </ScrollArea>
</template>
