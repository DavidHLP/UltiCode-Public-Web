<script setup lang="ts">
import { computed } from "vue";
import type { SubmissionRecord } from "@/types/submission";
import { Loader2, Inbox } from "lucide-vue-next";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
} from "@/components/ui/empty";

const props = defineProps<{
  submissions: SubmissionRecord[];
  isLoading?: boolean;
}>();

const emit = defineEmits<{
  select: [submission: SubmissionRecord];
}>();

const statusClass = (status: SubmissionRecord["status"]) => {
  switch (status) {
    case "Accepted":
      return "text-green-600 dark:text-green-400 font-medium";
    case "Wrong Answer":
    case "Runtime Error":
    case "Time Limit Exceeded":
    case "Compile Error":
      return "text-red-600 dark:text-red-400 font-medium";
    default:
      return "text-muted-foreground";
  }
};

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});

const relativeFormatter = new Intl.RelativeTimeFormat(undefined, {
  numeric: "auto",
});

const normalizeTimestamp = (value: string) => {
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? null : timestamp;
};

const formatRelativeTime = (timestamp: number | null) => {
  if (!timestamp) return "time unknown";
  const diffSeconds = Math.round((timestamp - Date.now()) / 1000);
  const absoluteDiff = Math.abs(diffSeconds);
  const thresholds: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 60 * 60 * 24 * 365],
    ["month", 60 * 60 * 24 * 30],
    ["week", 60 * 60 * 24 * 7],
    ["day", 60 * 60 * 24],
    ["hour", 60 * 60],
    ["minute", 60],
  ];
  for (const [unit, seconds] of thresholds) {
    if (absoluteDiff >= seconds) {
      return relativeFormatter.format(Math.round(diffSeconds / seconds), unit);
    }
  }
  return "just now";
};

const sortedSubmissions = computed(() =>
  [...props.submissions].sort((a, b) => {
    const tsA = normalizeTimestamp(a.submittedAt ?? a.created_at) ?? 0;
    const tsB = normalizeTimestamp(b.submittedAt ?? b.created_at) ?? 0;
    return tsB - tsA;
  }),
);

const decoratedSubmissions = computed(() =>
  sortedSubmissions.value.map((submission) => {
    const timestamp = normalizeTimestamp(
      submission.submittedAt ?? submission.created_at,
    );
    return {
      ...submission,
      formattedSubmitted: timestamp
        ? dateFormatter.format(timestamp)
        : submission.submittedAt,
      relativeSubmitted: formatRelativeTime(timestamp),
    };
  }),
);

const handleSelect = (submission: SubmissionRecord) =>
  emit("select", submission);
</script>

<template>
  <div class="space-y-4">
    <div
      v-if="isLoading"
      class="flex items-center justify-center py-10 text-muted-foreground"
    >
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
                <div :class="statusClass(submission.status)">
                  {{ submission.status }}
                </div>
              </TableCell>
              <TableCell>{{ submission.language }}</TableCell>
              <TableCell class="text-center">{{
                submission.runtime
              }}</TableCell>
              <TableCell class="text-center">{{ submission.memory }}</TableCell>
              <TableCell class="text-sm text-muted-foreground">
                {{ submission.notes || "—" }}
              </TableCell>
            </TableRow>
          </template>

          <TableRow v-else>
            <TableCell colspan="5" class="p-0">
              <Empty class="border-none bg-transparent px-6 py-8">
                <EmptyContent>
                  <EmptyMedia variant="icon">
                    <Inbox class="h-6 w-6 text-muted-foreground" />
                  </EmptyMedia>
                  <EmptyHeader>
                    <p class="text-base font-semibold text-foreground">
                      No submissions yet
                    </p>
                    <EmptyDescription>
                      Run or submit your solution to populate this list.
                    </EmptyDescription>
                  </EmptyHeader>
                </EmptyContent>
              </Empty>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </template>
  </div>
</template>
