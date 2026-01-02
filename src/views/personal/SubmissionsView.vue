<script setup lang="ts">
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { onMounted, ref } from "vue";
import { fetchUserSubmissions } from "@/api/submission";
import type { SubmissionRecord } from "@/types/submission";
import {
  ListX,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
  ExternalLink,
  Loader2,
} from "lucide-vue-next";
import { RouterLink } from "vue-router";
import { Button } from "@/components/ui/button";
import { fetchCurrentUserId } from "@/utils/auth";
import { useI18n } from "vue-i18n";
import PersonalPageHeader from "./components/PersonalPageHeader.vue";
import PersonalPageShell from "./components/PersonalPageShell.vue";

const { t, locale } = useI18n();
const submissions = ref<SubmissionRecord[]>([]);
const loading = ref(true);
const hasUser = ref(false);

const getStatusIcon = (status: SubmissionRecord["status"]) => {
  switch (status) {
    case "Accepted":
      return CheckCircle2;
    case "Wrong Answer":
    case "Runtime Error":
    case "Compile Error":
    case "System Error":
      return XCircle;
    case "Time Limit Exceeded":
    case "Memory Limit Exceeded":
    case "Output Limit Exceeded":
    case "Presentation Error":
      return Clock;
    case "Judging":
    case "Pending":
      return Clock;
    default:
      return Clock;
  }
};

const getStatusColorClass = (status: SubmissionRecord["status"]) => {
  switch (status) {
    case "Accepted":
      return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
    case "Wrong Answer":
    case "Runtime Error":
    case "Compile Error":
    case "System Error":
      return "text-rose-500 bg-rose-500/10 border-rose-500/20";
    case "Time Limit Exceeded":
    case "Memory Limit Exceeded":
    case "Output Limit Exceeded":
    case "Presentation Error":
      return "text-amber-500 bg-amber-500/10 border-amber-500/20";
    case "Judging":
    case "Pending":
      return "text-sky-500 bg-sky-500/10 border-sky-500/20";
    default:
      return "text-amber-500 bg-amber-500/10 border-amber-500/20";
  }
};

onMounted(async () => {
  try {
    const userId = fetchCurrentUserId();
    if (!userId) return;
    hasUser.value = true;
    submissions.value = await fetchUserSubmissions(userId);
  } catch (e) {
    console.error("Failed to load submissions", e);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <PersonalPageShell>
    <PersonalPageHeader
      :title="t('personal.submissions.title')"
      :description="t('personal.submissions.subtitle')"
    >
      <template #actions>
        <Button variant="outline" size="sm" class="gap-2 rounded-full" as-child>
          <RouterLink to="/problemset">
            {{ t("personal.submissions.browseProblems") }}
            <ExternalLink class="h-3.5 w-3.5" />
          </RouterLink>
        </Button>
      </template>
    </PersonalPageHeader>

    <div
      v-if="loading"
      class="flex flex-col items-center justify-center py-20 gap-4"
    >
      <Loader2 class="h-10 w-10 animate-spin text-primary" />
      <p class="text-sm text-muted-foreground">
        {{ t("personal.submissions.loadingSubmissions") }}
      </p>
    </div>

    <div
      v-else-if="!hasUser"
      class="flex flex-col items-center justify-center py-24 border-2 border-dashed border-muted/50 bg-muted/5 rounded-2xl"
    >
      <p class="text-muted-foreground mb-4">
        {{ t("personal.submissions.loginToView") }}
      </p>
      <Button as-child class="rounded-full px-6 h-10 font-bold">
        <RouterLink to="/login">{{ t("personal.profile.signIn") }}</RouterLink>
      </Button>
    </div>

    <Card
      v-else-if="submissions.length > 0"
      class="border shadow-sm overflow-hidden rounded-2xl"
    >
      <CardHeader class="pb-4 border-b">
        <div class="flex items-center justify-between">
          <div>
            <CardTitle class="text-lg font-bold">{{
              t("personal.submissions.recentAttempts")
            }}</CardTitle>
            <CardDescription>
              {{
                t("personal.submissions.latestSubmissions", {
                  count: submissions.length,
                })
              }}
            </CardDescription>
          </div>
          <Badge variant="secondary" class="rounded-full px-3">
            {{
              t("personal.submissions.totalSubmissions", {
                count: submissions.length,
              })
            }}
          </Badge>
        </div>
      </CardHeader>
      <CardContent class="p-0">
        <div class="overflow-x-auto">
          <Table>
            <TableHeader class="bg-muted/30">
              <TableRow class="hover:bg-muted/30">
                <TableHead
                  class="w-[300px] font-semibold text-xs uppercase tracking-wider"
                  >{{ t("personal.submissions.problem") }}</TableHead
                >
                <TableHead
                  class="font-semibold text-xs uppercase tracking-wider"
                  >{{ t("personal.submissions.status") }}</TableHead
                >
                <TableHead
                  class="font-semibold text-xs uppercase tracking-wider"
                  >{{ t("personal.submissions.language") }}</TableHead
                >
                <TableHead
                  class="font-semibold text-xs uppercase tracking-wider"
                  >{{ t("personal.submissions.runtime") }}</TableHead
                >
                <TableHead
                  class="font-semibold text-xs uppercase tracking-wider"
                  >{{ t("personal.submissions.memory") }}</TableHead
                >
                <TableHead
                  class="text-right font-semibold text-xs uppercase tracking-wider"
                  >{{ t("personal.submissions.submittedAt") }}</TableHead
                >
                <TableHead class="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow
                v-for="submission in submissions"
                :key="submission.id"
                class="group cursor-default hover:bg-muted/30 transition-colors border-b last:border-0"
              >
                <TableCell>
                  <div class="flex flex-col">
                    <RouterLink
                      :to="`/problems/${submission.problem?.slug || ''}`"
                      class="font-medium text-foreground hover:text-primary transition-colors"
                    >
                      {{ submission.problem?.title || "Unknown Problem" }}
                    </RouterLink>
                    <span
                      class="text-[10px] text-muted-foreground uppercase tracking-wider font-medium"
                    >
                      ID: {{ submission.id.substring(0, 8) }}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    class="gap-1.5 py-1 px-2 font-medium rounded-md border"
                    :class="getStatusColorClass(submission.status)"
                  >
                    <component
                      :is="getStatusIcon(submission.status)"
                      class="h-3.5 w-3.5"
                    />
                    {{ submission.status }}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    class="font-mono text-[10px] py-0 h-5"
                  >
                    {{ submission.language }}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div class="flex items-center gap-1.5 text-sm font-medium">
                    {{ submission.runtime
                    }}<span class="text-[10px] text-muted-foreground uppercase"
                      >ms</span
                    >
                  </div>
                </TableCell>
                <TableCell>
                  <div class="flex items-center gap-1.5 text-sm font-medium">
                    {{ submission.memory
                    }}<span class="text-[10px] text-muted-foreground uppercase"
                      >mb</span
                    >
                  </div>
                </TableCell>
                <TableCell class="text-right">
                  <div class="flex flex-col items-end">
                    <span class="text-sm font-medium">{{
                      new Date(submission.created_at).toLocaleDateString(locale)
                    }}</span>
                    <span class="text-[10px] text-muted-foreground">{{
                      new Date(submission.created_at).toLocaleTimeString(
                        locale,
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )
                    }}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    class="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    as-child
                  >
                    <RouterLink
                      :to="`/problems/${submission.problem?.slug || ''}`"
                    >
                      <ChevronRight class="h-4 w-4" />
                    </RouterLink>
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>

    <div
      v-else
      class="flex flex-col items-center justify-center py-24 rounded-2xl border-2 border-dashed border-muted/50 bg-muted/5 text-center px-6"
    >
      <div
        class="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/50 mb-4"
      >
        <ListX class="h-8 w-8 text-muted-foreground/50" />
      </div>
      <h3 class="text-xl font-bold">
        {{ t("personal.submissions.noSubmissions") }}
      </h3>
      <p class="mb-8 mt-2 max-w-[300px] text-sm text-muted-foreground">
        {{ t("personal.submissions.noSubmissionsDesc") }}
      </p>
      <Button class="rounded-full px-8 h-10 font-bold" as-child>
        <RouterLink to="/problemset">{{
          t("personal.submissions.startSolving")
        }}</RouterLink>
      </Button>
    </div>
  </PersonalPageShell>
</template>
