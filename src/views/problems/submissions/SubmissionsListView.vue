<script setup lang="ts">
import { computed } from "vue";
import type {
  SubmissionRecord,
  SubmissionStatusMeta,
} from "@/types/submission";
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
import { useI18n } from "vue-i18n";

const props = defineProps<{
  submissions: SubmissionRecord[];
  isLoading?: boolean;
  statusMetaByKey?: Record<string, SubmissionStatusMeta>;
}>();

const emit = defineEmits<{
  select: [submission: SubmissionRecord];
}>();

const { t, locale } = useI18n();

const statusClass = (status: SubmissionRecord["status"]) => {
  const meta = props.statusMetaByKey?.[status];
  const severity = meta?.severity ?? meta?.category;
  switch (severity) {
    case "success":
      return "text-green-600 dark:text-green-400 font-medium";
    case "error":
      return "text-red-600 dark:text-red-400 font-medium";
    case "warning":
      return "text-amber-600 dark:text-amber-400 font-medium";
    case "info":
      return "text-sky-600 dark:text-sky-400 font-medium";
    case "pending":
      return "text-sky-600 dark:text-sky-400 font-medium";
    default:
      return status === "Accepted"
        ? "text-green-600 dark:text-green-400 font-medium"
        : "text-red-600 dark:text-red-400 font-medium";
  }
};

const dateFormatter = computed(
  () =>
    new Intl.DateTimeFormat(locale.value, {
      dateStyle: "medium",
      timeStyle: "short",
    }),
);

const relativeFormatter = computed(
  () =>
    new Intl.RelativeTimeFormat(locale.value, {
      numeric: "auto",
    }),
);

const normalizeTimestamp = (value: string) => {
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? null : timestamp;
};

const formatRelativeTime = (timestamp: number | null) => {
  if (!timestamp) return t("problem.submissions.timeUnknown");
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
      return relativeFormatter.value.format(
        Math.round(diffSeconds / seconds),
        unit,
      );
    }
  }
  return t("common.time.now");
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
        ? dateFormatter.value.format(timestamp)
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
      {{ t("problem.submissions.loading") }}
    </div>

    <template v-else>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead class="w-[140px]">{{
              t("problem.submissions.status")
            }}</TableHead>
            <TableHead class="w-[140px]">{{
              t("problem.submissions.language")
            }}</TableHead>
            <TableHead class="w-[120px] text-center">{{
              t("problem.submissions.runtime")
            }}</TableHead>
            <TableHead class="w-[120px] text-center">{{
              t("problem.submissions.memory")
            }}</TableHead>
            <TableHead>{{ t("problem.submissions.notes") }}</TableHead>
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
                      {{ t("problem.submissions.noSubmissionsTitle") }}
                    </p>
                    <EmptyDescription>
                      {{ t("problem.submissions.noSubmissionsDesc") }}
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
