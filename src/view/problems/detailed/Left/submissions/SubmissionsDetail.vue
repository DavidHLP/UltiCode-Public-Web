<script setup lang="ts">
import { computed } from 'vue'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import CodeView from '@/components/code/CodeView.vue'
import type { SubmissionRecord } from '@/mocks/schema/submission'
import { ArrowLeft } from 'lucide-vue-next'

const props = defineProps<{
  submission: SubmissionRecord
}>()

const emit = defineEmits<{
  back: []
}>()

const statusVariant = (status: SubmissionRecord['status']) => {
  switch (status) {
    case 'Accepted':
      return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
    case 'Wrong Answer':
      return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
    case 'Runtime Error':
      return 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
    case 'Time Limit Exceeded':
      return 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300'
    default:
      return ''
  }
}

const overviewMetrics = computed(() => [
  {
    label: 'Runtime',
    value: props.submission.runtime,
    helper: `Top ${props.submission.runtimePercentile}%`,
  },
  {
    label: 'Memory',
    value: props.submission.memory,
    helper: `Top ${props.submission.memoryPercentile}%`,
  },
  {
    label: 'Language',
    value: props.submission.language,
    helper: props.submission.tags.slice(0, 2).join(', ') || 'General',
  },
  {
    label: 'Submitted',
    value: new Date(props.submission.submittedAt).toLocaleString(),
    helper: props.submission.id,
  },
])

const parseMs = (value: string) => {
  const m = /([0-9]+)\s*ms/.exec(value)
  return m ? Number(m[1]) : null
}

const runtimeMs = computed(() => parseMs(props.submission.runtime))
const distBins = computed<number[]>(() => props.submission.runtimeDistBinsMs ?? [])
const distCounts = computed<number[]>(() => props.submission.runtimeDist ?? [])
const distLength = computed(() => Math.min(distCounts.value.length, distBins.value.length))
const pairedDist = computed(() =>
  Array.from({ length: distLength.value }, (_, i) => ({
    i,
    count: distCounts.value[i]!,
    bin: distBins.value[i]!,
  })),
)
const maxCount = computed(() =>
  pairedDist.value.length ? Math.max(...pairedDist.value.map((d) => d.count)) : 0,
)
const totalCount = computed(() =>
  pairedDist.value.reduce((acc, d) => acc + (Number.isFinite(d.count) ? d.count : 0), 0),
)

const highlightIndex = computed(() => {
  const bins = distBins.value
  const val = runtimeMs.value
  if (!Array.isArray(bins) || bins.length === 0 || val == null) return -1
  const v = val as number
  let closest = 0
  let best = Math.abs((bins[0] ?? v) - v)
  for (let i = 1; i < bins.length; i++) {
    const bi = bins[i] ?? v
    const d = Math.abs(bi - v)
    if (d < best) {
      best = d
      closest = i
    }
  }
  return closest
})

const highlightShare = computed(() => {
  const idx = highlightIndex.value
  const total = totalCount.value
  if (idx < 0 || !total || idx >= distCounts.value.length) return null
  const c = distCounts.value[idx] ?? 0
  return (c / total) * 100
})
</script>

<template>
  <div class="space-y-4 rounded-xl border border-border/60 bg-background/70 p-4 shadow-sm">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div class="flex items-center gap-3">
        <Button variant="ghost" size="sm" class="text-xs" @click="emit('back')">
          <ArrowLeft class="mr-2 h-3.5 w-3.5" /> Back
        </Button>
        <Badge
          class="rounded-full px-3 py-0.5 text-xs font-semibold"
          :class="statusVariant(submission.status)"
        >
          {{ submission.status }}
        </Badge>
      </div>
      <div class="flex flex-wrap gap-2">
        <Badge v-for="tag in submission.tags" :key="tag" variant="secondary" class="text-xs">
          {{ tag }}
        </Badge>
      </div>
    </div>

    <section class="grid gap-3 md:grid-cols-2">
      <div class="space-y-3 rounded-lg border border-border/60 bg-card/50 p-3">
        <header class="flex items-center justify-between">
          <h3 class="text-sm font-semibold text-foreground">Runtime distribution</h3>
          <span class="text-xs text-muted-foreground">
            {{ submission.runtime }} · Top {{ submission.runtimePercentile }}%
          </span>
        </header>
        <div v-if="pairedDist.length" class="h-40 flex items-end gap-1">
          <div v-for="d in pairedDist" :key="d.i" class="relative flex-1">
            <div
              :class="[
                'w-full rounded-sm',
                d.i === highlightIndex ? 'bg-primary' : 'bg-muted-foreground/30',
              ]"
              :style="{
                height: maxCount ? Math.max(2, Math.round((d.count / maxCount) * 100)) + '%' : '2%',
              }"
            />
            <div
              v-if="d.i === highlightIndex && highlightShare != null"
              class="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] text-muted-foreground"
            >
              {{ highlightShare.toFixed(2) }}% of submissions near this runtime · Runtime:
              {{ d.bin }} ms
            </div>
          </div>
        </div>
        <div v-else class="h-40 flex items-center justify-center text-xs text-muted-foreground">
          No distribution data
        </div>
      </div>
      <div class="space-y-1 rounded-lg border border-border/60 bg-card/50 p-3">
        <header class="text-sm font-semibold text-foreground">Memory distribution</header>
        <div class="text-2xl font-semibold text-foreground">{{ submission.memory }}</div>
        <div class="text-xs text-muted-foreground">Top {{ submission.memoryPercentile }}%</div>
      </div>
    </section>

    <div class="grid gap-3 md:grid-cols-2">
      <article
        v-for="metric in overviewMetrics"
        :key="metric.label"
        class="rounded-lg border border-border/70 bg-card/60 p-3"
      >
        <p class="text-xs uppercase tracking-wide text-muted-foreground">{{ metric.label }}</p>
        <p class="text-lg font-semibold text-foreground">{{ metric.value }}</p>
        <p v-if="metric.helper" class="text-xs text-muted-foreground">{{ metric.helper }}</p>
      </article>
    </div>

    <section class="space-y-3 rounded-lg border border-border/60 bg-card/50 p-3">
      <header class="text-sm font-semibold text-foreground">Test summary</header>
      <ul class="space-y-2">
        <li
          v-for="test in submission.tests"
          :key="test.id"
          class="flex items-center justify-between rounded-lg border border-border/50 px-3 py-2 text-sm"
        >
          <span class="font-medium text-foreground">{{ test.label }}</span>
          <div class="flex items-center gap-3 text-xs text-muted-foreground">
            <span>{{ test.runtime }}</span>
            <Badge
              class="rounded-full px-2 py-0.5 text-[11px] font-semibold"
              :class="statusVariant(test.status)"
            >
              {{ test.status }}
            </Badge>
          </div>
        </li>
      </ul>
    </section>

    <section class="space-y-3">
      <header class="flex items-center justify-between">
        <h3 class="text-sm font-semibold text-foreground">Submission code</h3>
        <span class="text-xs text-muted-foreground">Snapshot of submitted source</span>
      </header>
      <CodeView :code="submission.code" :language="submission.language" />
    </section>

    <section v-if="submission.notes || submission.metrics.length" class="space-y-3">
      <header class="text-sm font-semibold text-foreground">Notes & Metrics</header>
      <p v-if="submission.notes" class="text-sm text-muted-foreground">
        {{ submission.notes }}
      </p>
      <div class="grid gap-3 sm:grid-cols-2">
        <article
          v-for="metric in submission.metrics"
          :key="metric.label"
          class="rounded-lg border border-border/70 bg-card/60 p-3"
        >
          <p class="text-xs uppercase tracking-wide text-muted-foreground">{{ metric.label }}</p>
          <p class="text-base font-semibold text-foreground">{{ metric.value }}</p>
          <p v-if="metric.helper" class="text-xs text-muted-foreground">{{ metric.helper }}</p>
        </article>
      </div>
    </section>
  </div>
</template>
