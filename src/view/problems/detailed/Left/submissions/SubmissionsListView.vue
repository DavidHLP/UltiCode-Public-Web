<script setup lang="ts">
import { computed } from 'vue'
import { Badge } from '@/components/ui/badge'

import type { SubmissionRecord } from '@/mocks/schema/submission'
import { Loader2 } from 'lucide-vue-next'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const props = defineProps<{
  submissions: SubmissionRecord[]
  isLoading?: boolean
}>()

const emit = defineEmits<{
  select: [submission: SubmissionRecord]
}>()

const statusVariant = (status: SubmissionRecord['status']) => {
  switch (status) {
    case 'Accepted':
      return 'text-emerald-600 dark:text-emerald-300 bg-emerald-100/50 dark:bg-emerald-900/40'
    case 'Wrong Answer':
      return 'text-red-600 dark:text-red-300 bg-red-100/60 dark:bg-red-900/40'
    case 'Runtime Error':
      return 'text-amber-600 dark:text-amber-300 bg-amber-100/60 dark:bg-amber-900/40'
    case 'Time Limit Exceeded':
      return 'text-sky-600 dark:text-sky-300 bg-sky-100/60 dark:bg-sky-900/40'
    default:
      return 'text-muted-foreground bg-muted'
  }
}

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short',
})

const relativeFormatter = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' })

const normalizeTimestamp = (value: string) => {
  const timestamp = Date.parse(value)
  return Number.isNaN(timestamp) ? null : timestamp
}

const formatRelativeTime = (timestamp: number | null) => {
  if (!timestamp) return 'time unknown'
  const diffSeconds = Math.round((timestamp - Date.now()) / 1000)
  const absoluteDiff = Math.abs(diffSeconds)
  const thresholds: [Intl.RelativeTimeFormatUnit, number][] = [
    ['year', 60 * 60 * 24 * 365],
    ['month', 60 * 60 * 24 * 30],
    ['week', 60 * 60 * 24 * 7],
    ['day', 60 * 60 * 24],
    ['hour', 60 * 60],
    ['minute', 60],
  ]
  for (const [unit, seconds] of thresholds) {
    if (absoluteDiff >= seconds) {
      return relativeFormatter.format(Math.round(diffSeconds / seconds), unit)
    }
  }
  return 'just now'
}

const sortedSubmissions = computed(() =>
  [...props.submissions].sort((a, b) => {
    const tsA = normalizeTimestamp(a.submittedAt) ?? 0
    const tsB = normalizeTimestamp(b.submittedAt) ?? 0
    return tsB - tsA
  }),
)

const decoratedSubmissions = computed(() =>
  sortedSubmissions.value.map((submission) => {
    const timestamp = normalizeTimestamp(submission.submittedAt)
    return {
      ...submission,
      formattedSubmitted: timestamp ? dateFormatter.format(timestamp) : submission.submittedAt,
      relativeSubmitted: formatRelativeTime(timestamp),
    }
  }),
)

const handleSelect = (submission: SubmissionRecord) => emit('select', submission)
</script>

<template>
  <div class="space-y-4">
    <div v-if="isLoading" class="flex items-center justify-center py-10 text-muted-foreground">
      <Loader2 class="mr-2 h-4 w-4 animate-spin" />
      Loading submissions...
    </div>

    <template v-else>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead class="w-[140px]">Status</TableHead>
            <TableHead class="w-[140px]">Language</TableHead>
            <TableHead class="w-[120px] text-center">Runtime</TableHead>
            <TableHead class="w-[120px] text-center">Memory</TableHead>
            <TableHead>Notes</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          <template v-if="decoratedSubmissions.length">
            <TableRow
              v-for="submission in decoratedSubmissions"
              :key="submission.id"
              class="odd:bg-muted/30 even:bg-background hover:bg-muted/50 cursor-pointer"
              @click="handleSelect(submission)"
            >
              <TableCell>
                <Badge
                  class="rounded-full px-3 py-0.5 text-xs font-semibold"
                  :class="statusVariant(submission.status)"
                >
                  {{ submission.status }}
                </Badge>
              </TableCell>
              <TableCell>{{ submission.language }}</TableCell>
              <TableCell class="text-center">{{ submission.runtime }}</TableCell>
              <TableCell class="text-center">{{ submission.memory }}</TableCell>
              <TableCell class="text-sm text-muted-foreground">
                {{ submission.notes || '—' }}
              </TableCell>
            </TableRow>
          </template>

          <TableRow v-else>
            <TableCell colspan="5" class="h-24 text-center">
              No submissions yet. Run or submit your solution to populate this list.
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </template>
  </div>
</template>
