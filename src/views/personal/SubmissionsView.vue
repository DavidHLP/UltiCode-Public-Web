<script setup lang="ts">
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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

const submissions = ref<SubmissionRecord[]>([]);
const loading = ref(true);
const hasUser = ref(false);

const getStatusIcon = (status: string) => {
  switch (status) {
    case "Accepted":
      return CheckCircle2;
    case "Wrong Answer":
    case "Runtime Error":
    case "Compile Error":
      return XCircle;
    case "Time Limit Exceeded":
    case "Memory Limit Exceeded":
      return Clock;
    default:
      return Clock;
  }
};

const getStatusColorClass = (status: string) => {
  switch (status) {
    case "Accepted":
      return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
    case "Wrong Answer":
    case "Runtime Error":
    case "Compile Error":
      return "text-rose-500 bg-rose-500/10 border-rose-500/20";
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
    <div class="max-w-7xl mx-auto w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="space-y-1">
          <h2 class="text-3xl font-bold tracking-tight">My Submissions</h2>
          <p class="text-muted-foreground">
            A historical record of all your problem solving attempts.
          </p>
        </div>
        <Button variant="outline" size="sm" class="gap-2 rounded-full" as-child>
          <RouterLink to="/problemset">
            Browse Problems
            <ExternalLink class="h-3.5 w-3.5" />
          </RouterLink>
        </Button>
      </div>
  
      <Separator />

    <div
      v-if="loading"
      class="flex flex-col items-center justify-center py-20 gap-4"
    >
      <Loader2 class="h-10 w-10 animate-spin text-primary" />
      <p class="text-sm text-muted-foreground">
        Retrieving submission history...
      </p>
    </div>

    <div
      v-else-if="!hasUser"
      class="flex flex-col items-center justify-center py-20 border rounded-2xl border-dashed"
    >
      <p class="text-muted-foreground mb-4">
        Please log in to view your submissions.
      </p>
      <Button as-child>
        <RouterLink to="/login">Sign In</RouterLink>
      </Button>
    </div>

    <Card
      v-else-if="submissions.length > 0"
      class="border-none shadow-sm overflow-hidden"
    >
      <CardHeader class="pb-2 border-b bg-muted/20">
        <div class="flex items-center justify-between">
          <div>
            <CardTitle class="text-lg">Recent Attempts</CardTitle>
            <CardDescription>
              Displaying your latest {{ submissions.length }} submissions.
            </CardDescription>
          </div>
          <Badge variant="secondary" class="rounded-full px-3">
            {{ submissions.length }} Total
          </Badge>
        </div>
      </CardHeader>
      <CardContent class="p-0">
        <div class="overflow-x-auto">
          <Table>
            <TableHeader class="bg-muted/50">
              <TableRow>
                <TableHead class="w-[300px] font-bold">Problem</TableHead>
                <TableHead class="font-bold">Status</TableHead>
                <TableHead class="font-bold">Language</TableHead>
                <TableHead class="font-bold">Runtime</TableHead>
                <TableHead class="font-bold">Memory</TableHead>
                <TableHead class="text-right font-bold">Submitted At</TableHead>
                <TableHead class="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow
                v-for="submission in submissions"
                :key="submission.id"
                class="group cursor-default hover:bg-muted/30 transition-colors"
              >
                <TableCell>
                  <div class="flex flex-col">
                    <RouterLink
                      :to="`/problems/${submission.problem?.slug || ''}`"
                      class="font-bold text-foreground hover:text-primary transition-colors"
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
                    class="gap-1.5 py-1 px-2 font-bold rounded-md border"
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
                      new Date(submission.created_at).toLocaleDateString()
                    }}</span>
                    <span class="text-[10px] text-muted-foreground">{{
                      new Date(submission.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
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
      class="flex h-[450px] flex-col items-center justify-center rounded-3xl border-2 border-dashed bg-muted/10 p-10 text-center"
    >
      <div
        class="flex h-20 w-20 items-center justify-center rounded-2xl bg-muted/50 mb-6"
      >
        <ListX class="h-10 w-10 text-muted-foreground/50" />
      </div>
      <h3 class="text-xl font-bold">No submissions found</h3>
      <p class="mb-8 mt-2 max-w-[300px] text-sm text-muted-foreground">
        You haven't submitted any code yet. Ready to take on your first
        challenge?
      </p>
      <Button class="rounded-full px-8 h-12 text-base font-bold" as-child>
        <RouterLink to="/problemset">Start Solving Problems</RouterLink>
      </Button>
    </div>
  </div>
</template>
