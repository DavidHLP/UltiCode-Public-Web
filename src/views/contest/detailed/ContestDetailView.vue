<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import { useContestStore } from "@/stores/contest";
import { fetchContestRanking } from "@/api/contest";
import type { ContestRankingEntry } from "@/types/contest";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import VirtualContestTimer from "../components/VirtualContestTimer.vue";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Clock,
  Users,
  Trophy,
  PlayCircle,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Award,
  Target,
  ArrowLeft,
} from "lucide-vue-next";

const route = useRoute();
const contestStore = useContestStore();
const contestId = route.params.contestId as string;

const contest = computed(() => contestStore.currentContest);
const rankings = ref<ContestRankingEntry[]>([]);
const loading = computed(() => contestStore.loading);
const registering = ref(false);
const startingVirtual = ref(false);

// Get participation status
const isRegistered = computed(() => contestStore.isRegistered(contestId));

onMounted(async () => {
  try {
    const [, rankingRes] = await Promise.all([
      contestStore.loadContestDetail(contestId),
      fetchContestRanking(contestId),
      contestStore.loadParticipationStatus(contestId),
    ]);
    rankings.value = rankingRes.items;
  } catch (error) {
    console.error("Failed to load contest detail:", error);
  }
});

// Registration handler
async function handleRegister() {
  registering.value = true;
  try {
    await contestStore.registerForContest(contestId);
  } catch (error: unknown) {
    console.error("Registration failed:", error);
    alert(getErrorMessage(error, "Failed to register for contest"));
  } finally {
    registering.value = false;
  }
}

async function handleUnregister() {
  registering.value = true;
  try {
    await contestStore.unregisterFromContest(contestId);
  } catch (error: unknown) {
    console.error("Unregister failed:", error);
    alert(getErrorMessage(error, "Failed to unregister from contest"));
  } finally {
    registering.value = false;
  }
}

// Virtual contest handler
async function handleStartVirtual() {
  startingVirtual.value = true;
  try {
    await contestStore.startVirtualContest(contestId);
    // Reload participation status
    await contestStore.loadParticipationStatus(contestId);
  } catch (error: unknown) {
    console.error("Failed to start virtual contest:", error);
    alert(getErrorMessage(error, "Failed to start virtual contest"));
  } finally {
    startingVirtual.value = false;
  }
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}

// Format Date Time
function formatDateTime(isoString: string): string {
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

// Get Difficulty Color
function getDifficultyColor(difficulty: string): string {
  const colors: Record<string, string> = {
    Easy: "text-green-600",
    Medium: "text-yellow-600",
    Hard: "text-red-600",
  };
  return colors[difficulty] || "text-gray-600";
}

// Get Country Flag Emoji
function getCountryFlag(countryCode: string): string {
  const flags: Record<string, string> = {
    CN: "🇨🇳",
    US: "🇺🇸",
    JP: "🇯🇵",
    KR: "🇰🇷",
    DE: "🇩🇪",
    UK: "🇬🇧",
    FR: "🇫🇷",
    CA: "🇨🇦",
    AU: "🇦🇺",
    SG: "🇸🇬",
  };
  return flags[countryCode] || "🌐";
}
</script>

<template>
  <div class="min-h-screen bg-background mx-auto max-w-[60%]">
    <div v-if="loading" class="flex h-screen items-center justify-center">
      <p class="text-lg text-muted-foreground">Loading...</p>
    </div>

    <div v-else-if="contest" class="">
      <!-- Contest Header -->
      <div class="border-b bg-card">
        <div class="container mx-auto px-4 py-6">
          <!-- Back Button -->
          <Button
            variant="ghost"
            size="sm"
            class="mb-4 gap-2"
            @click="$router.push({ name: 'contest-home' })"
          >
            <ArrowLeft class="h-4 w-4" />
            Back to Contest List
          </Button>

          <div class="flex items-start justify-between gap-4">
            <div class="flex-1 space-y-3">
              <div class="flex items-center gap-3">
                <h1 class="text-3xl font-bold tracking-tight">
                  {{ contest.title }}
                </h1>
                <Badge
                  :variant="
                    contest.status === 'running'
                      ? 'destructive'
                      : contest.status === 'upcoming'
                        ? 'default'
                        : 'secondary'
                  "
                  class="text-xs"
                >
                  {{
                    contest.status === "upcoming"
                      ? "Upcoming"
                      : contest.status === "running"
                        ? "Live"
                        : "Ended"
                  }}
                </Badge>
              </div>
              <p
                v-if="contest.description"
                class="text-base text-muted-foreground"
              >
                {{ contest.description }}
              </p>
            </div>
            <div class="flex flex-col gap-2">
              <Button
                v-if="!isRegistered && contest.status === 'upcoming'"
                size="lg"
                class="gap-2"
                :disabled="registering"
                @click="handleRegister"
              >
                <Users class="h-4 w-4" />
                {{ registering ? "Registering..." : "Register Now" }}
              </Button>
              <Button
                v-else-if="isRegistered && contest.status === 'upcoming'"
                size="lg"
                variant="outline"
                class="gap-2"
                :disabled="registering"
                @click="handleUnregister"
              >
                <Users class="h-4 w-4" />
                {{ registering ? "Unregistering..." : "Unregister" }}
              </Button>
              <Button
                v-if="contest.status === 'finished'"
                size="lg"
                class="gap-2"
                :disabled="startingVirtual"
                @click="handleStartVirtual"
              >
                <PlayCircle class="h-4 w-4" />
                {{ startingVirtual ? "Starting..." : "Start Virtual Contest" }}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <!-- Virtual Contest Timer -->
      <div class="container mx-auto px-4 pt-6">
        <VirtualContestTimer />
      </div>

      <!-- Contest Info Card -->
      <div class="container mx-auto px-4 py-6">
        <Card>
          <CardContent class="p-0">
            <div class="grid divide-x md:grid-cols-4">
              <div class="flex items-center gap-3 p-6">
                <div
                  class="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10"
                >
                  <Calendar class="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p class="text-sm font-medium text-muted-foreground">
                    Start Time
                  </p>
                  <p class="text-base font-semibold">
                    {{ formatDateTime(contest.start_time) }}
                  </p>
                </div>
              </div>
              <div class="flex items-center gap-3 p-6">
                <div
                  class="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10"
                >
                  <Clock class="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p class="text-sm font-medium text-muted-foreground">
                    Duration
                  </p>
                  <p class="text-base font-semibold">
                    {{ contest.duration_minutes }} Minutes
                  </p>
                </div>
              </div>
              <div class="flex items-center gap-3 p-6">
                <div
                  class="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10"
                >
                  <Users class="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p class="text-sm font-medium text-muted-foreground">
                    Participants
                  </p>
                  <p class="text-base font-semibold">
                    {{ contest.participant_count }}
                  </p>
                </div>
              </div>
              <div class="flex items-center gap-3 p-6">
                <div
                  class="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10"
                >
                  <Trophy class="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p class="text-sm font-medium text-muted-foreground">
                    Contest Type
                  </p>
                  <p class="text-base font-semibold">
                    {{ contest.isRated ? "Rated" : "Unrated" }}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Main Content Area -->
      <div class="container mx-auto px-4 pb-8">
        <Tabs default-value="problems" class="w-full">
          <TabsList class="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="problems">Problems</TabsTrigger>
            <TabsTrigger value="ranking">Ranking</TabsTrigger>
          </TabsList>

          <!-- Problem List -->
          <TabsContent value="problems" class="space-y-4">
            <Card>
              <CardHeader class="pb-3">
                <CardTitle class="text-xl">Contest Problems</CardTitle>
              </CardHeader>
              <CardContent class="p-0">
                <Table>
                  <TableHeader>
                    <TableRow class="hover:bg-transparent">
                      <TableHead class="w-20 pl-6">#</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead class="w-24">Difficulty</TableHead>
                      <TableHead class="w-24 text-center">Score</TableHead>
                      <TableHead class="w-32 text-center">Acceptance</TableHead>
                      <TableHead class="w-24 pr-6"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow
                      v-for="problem in contest.problems"
                      :key="problem.id"
                      class="group cursor-pointer hover:bg-muted/50"
                    >
                      <TableCell class="pl-6">
                        <div
                          class="flex h-10 w-10 items-center justify-center rounded-md bg-muted font-mono text-sm font-bold"
                        >
                          {{ problem.problemIndex || "#" }}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div class="space-y-1">
                          <router-link
                            :to="{
                              name: 'problem-detail',
                              params: { slug: problem.slug },
                            }"
                            class="font-semibold hover:text-primary"
                          >
                            {{ problem.title }}
                          </router-link>
                          <div
                            class="flex items-center gap-3 text-sm text-muted-foreground"
                          >
                            <span class="flex items-center gap-1">
                              <Target class="h-3 w-3" />
                              {{ problem.solvedCount || 0 }} Solved
                            </span>
                            <span
                              >{{
                                problem.submissionCount || 0
                              }}
                              Submissions</span
                            >
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          :class="[
                            getDifficultyColor(problem.difficulty || 'Medium'),
                            'font-medium',
                          ]"
                        >
                          {{ problem.difficulty }}
                        </Badge>
                      </TableCell>
                      <TableCell class="text-center">
                        <span
                          class="inline-flex items-center gap-1 font-semibold"
                        >
                          <Award class="h-4 w-4 text-yellow-600" />
                          {{ problem.score || 0 }}
                        </span>
                      </TableCell>
                      <TableCell class="text-center">
                        <span class="font-medium">{{
                          problem.acceptanceRate || "0%"
                        }}</span>
                      </TableCell>
                      <TableCell class="pr-6">
                        <Button
                          size="sm"
                          variant="ghost"
                          class="opacity-0 group-hover:opacity-100"
                          @click="
                            $router.push({
                              name: 'problem-detail',
                              params: { slug: problem.slug },
                            })
                          "
                        >
                          <ChevronRight class="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <!-- Ranking -->
          <TabsContent value="ranking" class="space-y-4">
            <Card>
              <CardHeader
                class="flex flex-row items-center justify-between pb-3"
              >
                <CardTitle class="text-xl">Ranking</CardTitle>
                <Button variant="outline" size="sm">View Full Ranking</Button>
              </CardHeader>
              <CardContent class="p-0">
                <Table>
                  <TableHeader>
                    <TableRow class="hover:bg-transparent">
                      <TableHead class="w-20 pl-6">Rank</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead class="w-24 text-center">Score</TableHead>
                      <TableHead class="w-32 text-center"
                        >Finish Time</TableHead
                      >
                      <TableHead class="w-48">Problem Results</TableHead>
                      <TableHead class="w-32 pr-6 text-right"
                        >Rating Change</TableHead
                      >
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow
                      v-for="entry in rankings.slice(0, 20)"
                      :key="entry.username"
                      class="group"
                    >
                      <TableCell class="pl-6">
                        <div
                          class="inline-flex h-10 w-10 items-center justify-center rounded-full font-bold"
                          :class="{
                            'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white shadow-md':
                              entry.rank === 1,
                            'bg-gradient-to-br from-gray-300 to-gray-500 text-white shadow-md':
                              entry.rank === 2,
                            'bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-md':
                              entry.rank === 3,
                            'bg-muted text-muted-foreground': entry.rank > 3,
                          }"
                        >
                          {{ entry.rank }}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div class="space-y-1">
                          <div class="flex items-center gap-2">
                            <span class="text-lg">{{
                              getCountryFlag(entry.country || "CN")
                            }}</span>
                            <img
                              :src="
                                entry.avatar ||
                                'https://assets.leetcode.cn/aliyun-lc-upload/users/default_avatar.png'
                              "
                              class="h-6 w-6 rounded-full border border-border"
                              alt="Avatar"
                            />
                            <span class="font-semibold">{{
                              entry.username
                            }}</span>
                          </div>
                          <p class="text-sm text-muted-foreground">
                            {{ entry.ratingBefore || 1500 }} →
                            {{ entry.ratingAfter || 1500 }}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell class="text-center">
                        <span class="text-lg font-bold">{{ entry.score }}</span>
                      </TableCell>
                      <TableCell class="text-center">
                        <span class="font-mono text-sm">{{
                          entry.finish_time
                        }}</span>
                      </TableCell>
                      <TableCell>
                        <div class="flex flex-wrap gap-1">
                          <Badge
                            v-for="result in entry.problemResults || []"
                            :key="result.problemIndex"
                            :variant="result.isSolved ? 'default' : 'secondary'"
                            class="min-w-[2rem] justify-center font-mono text-xs"
                          >
                            {{ result.problemIndex }}
                            <template
                              v-if="result.isSolved && result.solveTime"
                            >
                              <br />{{ result.solveTime }}
                            </template>
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell class="pr-6 text-right">
                        <div
                          class="inline-flex items-center gap-1 rounded-md px-2 py-1 font-semibold"
                          :class="{
                            'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400':
                              (entry.ratingChange || 0) > 0,
                            'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400':
                              (entry.ratingChange || 0) < 0,
                            'text-muted-foreground':
                              (entry.ratingChange || 0) === 0,
                          }"
                        >
                          <TrendingUp
                            v-if="(entry.ratingChange || 0) > 0"
                            class="h-4 w-4"
                          />
                          <TrendingDown
                            v-else-if="(entry.ratingChange || 0) < 0"
                            class="h-4 w-4"
                          />
                          {{ (entry.ratingChange || 0) > 0 ? "+" : ""
                          }}{{ entry.ratingChange || 0 }}
                        </div>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>

    <div v-else class="py-20 text-center">
      <p class="text-muted-foreground">Contest Not Found</p>
    </div>
  </div>
</template>
