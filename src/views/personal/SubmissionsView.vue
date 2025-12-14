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
import { ListX } from "lucide-vue-next";
import { RouterLink } from "vue-router";
import { Button } from "@/components/ui/button";

const submissions = ref<SubmissionRecord[]>([]);
const loading = ref(true);

onMounted(async () => {
  try {
    const userId = "u-001"; // This would typically come from user session/auth
    submissions.value = await fetchUserSubmissions(userId);
  } catch (e) {
    console.error("Failed to load submissions", e);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div class="space-y-0.5">
      <h2 class="text-2xl font-bold tracking-tight">My Submissions</h2>
      <p class="text-muted-foreground">
        View detailed records of your problem submissions.
      </p>
    </div>

    <div v-if="loading" class="text-center text-muted-foreground py-8">
      Loading submissions...
    </div>
    <Card v-else-if="submissions.length > 0">
      <CardHeader>
        <CardTitle>Recent Submissions</CardTitle>
        <CardDescription>
          You have made {{ submissions.length }} submissions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Problem</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Language</TableHead>
              <TableHead>Runtime</TableHead>
              <TableHead>Memory</TableHead>
              <TableHead class="text-right">Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="submission in submissions" :key="submission.id">
              <TableCell class="font-medium">{{
                submission.problem?.title || "Unknown"
              }}</TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  :class="{
                    'border-green-500 text-green-600 bg-green-50 dark:bg-green-900/10':
                      submission.status === 'Accepted',
                    'border-red-500 text-red-600 bg-red-50 dark:bg-red-900/10':
                      submission.status === 'Wrong Answer' ||
                      submission.status === 'Time Limit Exceeded',
                  }"
                >
                  {{ submission.status }}
                </Badge>
              </TableCell>
              <TableCell>{{ submission.language }}</TableCell>
              <TableCell>{{ submission.runtime }}ms</TableCell>
              <TableCell>{{ submission.memory }}MB</TableCell>
              <TableCell class="text-right">{{
                new Date(submission.created_at).toLocaleDateString()
              }}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
    <div
      v-else
      class="flex h-[400px] shrink-0 items-center justify-center rounded-md border border-dashed"
    >
      <div
        class="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center"
      >
        <div
          class="flex h-20 w-20 items-center justify-center rounded-full bg-muted"
        >
          <ListX class="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 class="mt-4 text-lg font-semibold">No submissions yet</h3>
        <p class="mb-4 mt-2 text-sm text-muted-foreground">
          You haven't submitted any solutions yet. Start solving problems to see
          your history here.
        </p>
        <Button as-child>
          <RouterLink to="/problemset">Browse Problems</RouterLink>
        </Button>
      </div>
    </div>
  </div>
</template>
