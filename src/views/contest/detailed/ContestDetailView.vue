<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import { useContestStore } from "@/stores/contest";
import { fetchContestRanking } from "@/api/contest";
import type { ContestRankingEntry } from "@/types/contest";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "vue-sonner";
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
      contestStore.loadVirtualSession(contestId),
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
    toast.error(getErrorMessage(error, "Failed to register for contest"));
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
    toast.error(getErrorMessage(error, "Failed to unregister from contest"));
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
    toast.error(getErrorMessage(error, "Failed to start virtual contest"));
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
  <div
    class="max-w-7xl mx-auto w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10"
  >
    <div v-if="loading" class="flex h-[60vh] items-center justify-center">
      <div
        class="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"
      ></div>
      <p class="ml-4 text-sm text-muted-foreground">Loading contest...</p>
    </div>

    <div v-else-if="contest" class="space-y-8">
      <!-- Contest Header -->
      <div class="space-y-6">
        <Button
          variant="ghost"
          size="sm"
          class="gap-2 rounded-full"
          @click="$router.push({ name: 'contest-home' })"
        >
          <ArrowLeft class="h-4 w-4" />
          Back to Contest List
        </Button>

        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div class="space-y-2 flex-1">
            <div class="flex items-center gap-3">
              <h1 class="text-4xl font-black tracking-tight">
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
                class="rounded-full px-3 h-6 font-bold uppercase text-[10px] tracking-widest"
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
            <p v-if="contest.description" class="text-lg text-muted-foreground max-w-3xl leading-relaxed">
              {{ contest.description }}
            </p>
          </div>

          <div class="flex flex-col sm:flex-row gap-3">
            <Button
              v-if="!isRegistered && contest.status === 'upcoming'"
              size="lg"
              class="gap-2 rounded-full h-12 px-8 font-bold shadow-lg shadow-primary/20"
              :disabled="registering"
              @click="handleRegister"
            >
              <Users class="h-5 w-5" />
              {{ registering ? "Registering..." : "Register Now" }}
            </Button>
            <Button
              v-else-if="isRegistered && contest.status === 'upcoming'"
              size="lg"
              variant="outline"
              class="gap-2 rounded-full h-12 px-8 font-bold"
              :disabled="registering"
              @click="handleUnregister"
            >
              <Users class="h-5 w-5" />
              {{ registering ? "Unregistering..." : "Unregister" }}
            </Button>
            <template v-if="contest.status === 'finished'">
              <Button
                v-if="
                  !contestStore.virtualSession ||
                  contestStore.virtualSession.status !== 'IN_PROGRESS'
                "
                size="lg"
                class="gap-2 rounded-full h-12 px-8 font-bold shadow-lg shadow-primary/20"
                :disabled="startingVirtual"
                @click="handleStartVirtual"
              >
                <PlayCircle class="h-5 w-5" />
                {{
                  startingVirtual ? "Starting..." : "Start Virtual Contest"
                }}
              </Button>
              <Button
                v-else
                size="lg"
                variant="outline"
                class="gap-2 rounded-full h-12 px-8 font-bold"
                disabled
              >
                <PlayCircle class="h-5 w-5" />
                Virtual Contest Active
              </Button>
            </template>
          </div>
        </div>
      </div>

      <Separator />

      <!-- Virtual Contest Timer -->
      <VirtualContestTimer />

      <!-- Contest Info Card -->
      <Card class="border-none shadow-sm overflow-hidden rounded-2xl bg-muted/20">
        <CardContent class="p-0">
          <div class="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 border-b md:border-b-0">
            <div class="flex items-center gap-4 p-6">
              <div
                class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-sm"
              >
                <Calendar class="h-6 w-6" />
              </div>
              <div class="min-w-0">
                <p class="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Start Time
                </p>
                <p class="text-sm font-bold truncate">
                  {{ formatDateTime(contest.start_time) }}
                </p>
              </div>
            </div>
            <div class="flex items-center gap-4 p-6">
              <div
                class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 shadow-sm"
              >
                <Clock class="h-6 w-6" />
              </div>
              <div class="min-w-0">
                <p class="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Duration
                </p>
                <p class="text-sm font-bold truncate">
                  {{ contest.duration_minutes }} Minutes
                </p>
              </div>
            </div>
            <div class="flex items-center gap-4 p-6">
              <div
                class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 shadow-sm"
              >
                <Users class="h-6 w-6" />
              </div>
              <div class="min-w-0">
                <p class="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Participants
                </p>
                <p class="text-sm font-bold truncate">
                  {{ contest.participant_count }}
                </p>
              </div>
            </div>
            <div class="flex items-center gap-4 p-6">
              <div
                class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 shadow-sm"
              >
                <Trophy class="h-6 w-6" />
              </div>
              <div class="min-w-0">
                <p class="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Contest Type
                </p>
                <p class="text-sm font-bold truncate">
                  {{ contest.isRated ? "Rated" : "Unrated" }}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Main Content Area -->
      <Tabs default-value="problems" class="w-full">
        <div class="flex items-center justify-between mb-6">
          <TabsList class="bg-muted/50 p-1 h-11 rounded-full">
            <TabsTrigger value="problems" class="rounded-full px-8 font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm">
              Problems
            </TabsTrigger>
            <TabsTrigger value="ranking" class="rounded-full px-8 font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm">
              Ranking
            </TabsTrigger>
          </TabsList>
        </div>

        <!-- Problem List -->
        <TabsContent value="problems" class="mt-0">
          <Card class="border-none shadow-sm overflow-hidden rounded-2xl">
            <CardHeader class="pb-3 border-b bg-muted/20">
              <CardTitle class="text-lg font-black uppercase tracking-widest text-muted-foreground">Contest Challenges</CardTitle>
            </CardHeader>
            <CardContent class="p-0">
              <Table>
                <TableHeader class="bg-muted/50">
                  <TableRow>
                    <TableHead class="w-20 pl-6 font-bold">#</TableHead>
                    <TableHead class="font-bold">Title</TableHead>
                    <TableHead class="w-32 font-bold">Difficulty</TableHead>
                    <TableHead class="w-24 text-center font-bold">Score</TableHead>
                    <TableHead class="w-32 text-center font-bold">Acceptance</TableHead>
                    <TableHead class="w-20 pr-6"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow
                    v-for="problem in contest.problems"
                    :key="problem.id"
                    class="group cursor-pointer hover:bg-muted/30 transition-colors"
                  >
                    <TableCell class="pl-6">
                      <div
                        class="flex h-10 w-10 items-center justify-center rounded-xl bg-muted font-mono text-sm font-black text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-all"
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
                          class="text-base font-bold hover:text-primary transition-colors"
                        >
                          {{ problem.title }}
                        </router-link>
                        <div
                          class="flex items-center gap-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider"
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
                          'font-black text-[10px] uppercase h-5 px-2 rounded-sm border-current/20 bg-current/5',
                        ]"
                      >
                        {{ problem.difficulty }}
                      </Badge>
                    </TableCell>
                    <TableCell class="text-center">
                      <span
                        class="inline-flex items-center gap-1 font-black text-amber-600"
                      >
                        <Award class="h-4 w-4" />
                        {{ problem.score || 0 }}
                      </span>
                    </TableCell>
                    <TableCell class="text-center">
                      <span class="text-sm font-bold text-muted-foreground">
                        {{ problem.acceptanceRate || "0%" }}
                      </span>
                    </TableCell>
                    <TableCell class="pr-6">
                      <Button
                        size="icon"
                        variant="ghost"
                        class="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
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
        <TabsContent value="ranking" class="mt-0">
          <Card class="border-none shadow-sm overflow-hidden rounded-2xl">
            <CardHeader
              class="flex flex-row items-center justify-between pb-3 border-b bg-muted/20"
            >
              <CardTitle class="text-lg font-black uppercase tracking-widest text-muted-foreground">Leaderboard</CardTitle>
              <Button variant="outline" size="sm" class="rounded-full h-8 font-bold text-[10px]">VIEW ALL</Button>
            </CardHeader>
            <CardContent class="p-0">
              <Table>
                <TableHeader class="bg-muted/50">
                  <TableRow>
                    <TableHead class="w-20 pl-6 font-bold">Rank</TableHead>
                    <TableHead class="font-bold">User</TableHead>
                    <TableHead class="w-24 text-center font-bold">Score</TableHead>
                    <TableHead class="w-32 text-center font-bold">Time</TableHead>
                    <TableHead class="w-48 font-bold">Problems</TableHead>
                    <TableHead class="w-32 pr-6 text-right font-bold">Rating</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow
                    v-for="entry in rankings.slice(0, 20)"
                    :key="entry.username"
                    class="group hover:bg-muted/30 transition-colors"
                  >
                    <TableCell class="pl-6">
                      <div
                        class="inline-flex h-10 w-10 items-center justify-center rounded-xl font-black text-sm transition-all"
                        :class="{
                          'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white shadow-lg shadow-yellow-500/20 scale-110':
                            entry.rank === 1,
                          'bg-gradient-to-br from-slate-300 to-slate-500 text-white shadow-lg shadow-slate-400/20 scale-105':
                            entry.rank === 2,
                          'bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-lg shadow-orange-500/20':
                            entry.rank === 3,
                          'bg-muted text-muted-foreground': entry.rank > 3,
                        }"
                      >
                        {{ entry.rank }}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div class="flex items-center gap-3">
                        <div class="relative">
                          <img
                            :src="
                              entry.avatar ||
                              'https://assets.leetcode.cn/aliyun-lc-upload/users/default_avatar.png'
                            "
                            class="h-10 w-10 rounded-xl border border-border bg-muted shadow-sm"
                            alt="Avatar"
                          />
                          <span class="absolute -bottom-1 -right-1 text-base shadow-sm bg-background rounded-sm">
                            {{ getCountryFlag(entry.country || "CN") }}
                          </span>
                        </div>
                        <div class="flex flex-col">
                          <span class="font-black text-sm">{{ entry.username }}</span>
                          <span class="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                            {{ entry.ratingBefore || 1500 }} → {{ entry.ratingAfter || 1500 }}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell class="text-center">
                      <span class="text-xl font-black tracking-tight">{{ entry.score }}</span>
                    </TableCell>
                    <TableCell class="text-center">
                      <span class="font-mono text-xs font-bold text-muted-foreground">
                        {{ entry.finish_time }}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div class="flex flex-wrap gap-1">
                        <Badge
                          v-for="result in entry.problemResults || []"
                          :key="result.problemIndex"
                          :variant="result.isSolved ? 'default' : 'secondary'"
                          class="min-w-[2rem] justify-center font-mono text-[10px] h-6 rounded px-1.5"
                        >
                          {{ result.problemIndex }}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell class="pr-6 text-right">
                      <div
                        class="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-black shadow-sm"
                        :class="{
                          'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20':
                            (entry.ratingChange || 0) > 0,
                          'bg-rose-500/10 text-rose-600 border border-rose-500/20':
                            (entry.ratingChange || 0) < 0,
                          'bg-muted text-muted-foreground border border-border':
                            (entry.ratingChange || 0) === 0,
                        }"
                      >
                        <TrendingUp
                          v-if="(entry.ratingChange || 0) > 0"
                          class="h-3 w-3"
                        />
                        <TrendingDown
                          v-else-if="(entry.ratingChange || 0) < 0"
                          class="h-3 w-3"
                        />
                        {{ (entry.ratingChange || 0) > 0 ? "+" : "" }}{{ entry.ratingChange || 0 }}
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

    <div v-else-if="!loading" class="flex flex-col items-center justify-center py-32 border-2 border-dashed rounded-3xl bg-muted/5 text-center px-6">
      <Trophy class="h-16 w-16 text-muted-foreground/20 mb-4" />
      <h3 class="text-2xl font-black tracking-tight">Contest Not Found</h3>
      <p class="text-muted-foreground mt-2 max-w-[300px]">The contest you are looking for might have been moved or removed.</p>
      <Button variant="outline" class="mt-8 rounded-full px-8 h-11 font-bold" @click="$router.push({ name: 'contest-home' })">
        Return to Contests
      </Button>
    </div>
  </div>
</template>
