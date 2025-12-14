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

const submissions = [
  {
    id: "sub-1",
    problem: "Two Sum",
    status: "Accepted",
    runtime: "52ms",
    memory: "42.5MB",
    language: "TypeScript",
    submittedAt: "2 hours ago",
  },
  {
    id: "sub-2",
    problem: "Median of Two Sorted Arrays",
    status: "Accepted",
    runtime: "88ms",
    memory: "45.1MB",
    language: "Go",
    submittedAt: "5 hours ago",
  },
  {
    id: "sub-3",
    problem: "LRU Cache",
    status: "Wrong Answer",
    runtime: "N/A",
    memory: "N/A",
    language: "Python",
    submittedAt: "1 day ago",
  },
  {
    id: "sub-4",
    problem: "Merge Intervals",
    status: "Accepted",
    runtime: "76ms",
    memory: "18.2MB",
    language: "Rust",
    submittedAt: "2 days ago",
  },
  {
    id: "sub-5",
    problem: "Trapping Rain Water",
    status: "Time Limit Exceeded",
    runtime: "N/A",
    memory: "N/A",
    language: "Java",
    submittedAt: "3 days ago",
  },
];
</script>

<template>
  <div class="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div class="space-y-0.5">
      <h2 class="text-2xl font-bold tracking-tight">My Submissions</h2>
      <p class="text-muted-foreground">
        View detailed records of your problem submissions.
      </p>
    </div>

    <Card>
      <CardHeader>
        <CardTitle>Recent Submissions</CardTitle>
        <CardDescription>
          You have made 5 submissions in the last week.
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
                submission.problem
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
              <TableCell>{{ submission.runtime }}</TableCell>
              <TableCell>{{ submission.memory }}</TableCell>
              <TableCell class="text-right">{{
                submission.submittedAt
              }}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  </div>
</template>
