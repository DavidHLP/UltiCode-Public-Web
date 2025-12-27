<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useContestStore } from "@/stores/contest";
import { useRouter } from "vue-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Trophy, TrendingUp, TrendingDown } from "lucide-vue-next";

const contestStore = useContestStore();
const router = useRouter();
const loading = ref(true);

onMounted(async () => {
  try {
    await Promise.all([
      contestStore.loadUserContests(),
      contestStore.loadContestHistory(),
    ]);
  } catch (error) {
    console.error("Failed to load user contests:", error);
  } finally {
    loading.value = false;
  }
});

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusBadge(status: string) {
  const variants: Record<string, string> = {
    upcoming: "default",
    running: "destructive",
    finished: "secondary",
  };
  return variants[status] || "secondary";
}

function navigateToContest(contestId: string) {
  router.push({ name: "contest-detail", params: { contestId } });
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold">My Contests</h2>
        <p class="text-muted-foreground">
          View your registered, participated, and virtual contests
        </p>
      </div>
    </div>

    <div v-if="loading" class="py-20 text-center">
      <p class="text-muted-foreground">Loading contests...</p>
    </div>

    <Tabs v-else default-value="registered" class="w-full">
      <TabsList class="grid w-full max-w-md grid-cols-3">
        <TabsTrigger value="registered">Registered</TabsTrigger>
        <TabsTrigger value="participated">Participated</TabsTrigger>
        <TabsTrigger value="virtual">Virtual</TabsTrigger>
      </TabsList>

      <!-- Registered Contests -->
      <TabsContent value="registered" class="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Registered Contests</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              v-if="contestStore.registeredContests.length === 0"
              class="py-12 text-center text-muted-foreground"
            >
              No registered contests
            </div>
            <div v-else class="space-y-3">
              <div
                v-for="contest in contestStore.registeredContests"
                :key="contest.id"
                class="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50 cursor-pointer"
                @click="navigateToContest(contest.id)"
              >
                <div class="space-y-1">
                  <h3 class="font-semibold">{{ contest.title }}</h3>
                  <div
                    class="flex items-center gap-3 text-sm text-muted-foreground"
                  >
                    <span class="flex items-center gap-1">
                      <Calendar class="h-3 w-3" />
                      {{ formatDate(contest.start_time) }}
                    </span>
                    <span>{{ contest.duration_minutes }} min</span>
                  </div>
                </div>
                <Badge :variant="getStatusBadge(contest.status) as any">
                  {{ contest.status }}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <!-- Participated Contests -->
      <TabsContent value="participated" class="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Contest History</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              v-if="contestStore.contestHistory.length === 0"
              class="py-12 text-center text-muted-foreground"
            >
              No participated contests yet
            </div>
            <div v-else class="space-y-3">
              <div
                v-for="history in contestStore.contestHistory"
                :key="history.contestId"
                class="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50"
              >
                <div class="flex-1 space-y-1">
                  <h3 class="font-semibold">{{ history.contestTitle }}</h3>
                  <div
                    class="flex items-center gap-3 text-sm text-muted-foreground"
                  >
                    <span class="flex items-center gap-1">
                      <Calendar class="h-3 w-3" />
                      {{ formatDate(history.contestDate) }}
                    </span>
                    <span class="flex items-center gap-1">
                      <Trophy class="h-3 w-3" />
                      Rank {{ history.rank }} / {{ history.totalParticipants }}
                    </span>
                    <span>Score: {{ history.score }}</span>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <Badge v-if="history.isVirtual" variant="outline"
                    >Virtual</Badge
                  >
                  <div
                    class="flex items-center gap-1 rounded-md px-2 py-1 font-semibold"
                    :class="{
                      'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400':
                        history.ratingChange > 0,
                      'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400':
                        history.ratingChange < 0,
                      'text-muted-foreground': history.ratingChange === 0,
                    }"
                  >
                    <TrendingUp
                      v-if="history.ratingChange > 0"
                      class="h-4 w-4"
                    />
                    <TrendingDown
                      v-else-if="history.ratingChange < 0"
                      class="h-4 w-4"
                    />
                    {{ history.ratingChange > 0 ? "+" : ""
                    }}{{ history.ratingChange }}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <!-- Virtual Contests -->
      <TabsContent value="virtual" class="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Virtual Contests</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              v-if="contestStore.virtualContests.length === 0"
              class="py-12 text-center text-muted-foreground"
            >
              No virtual contests completed
            </div>
            <div v-else class="space-y-3">
              <div
                v-for="contest in contestStore.virtualContests"
                :key="contest.id"
                class="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50 cursor-pointer"
                @click="navigateToContest(contest.id)"
              >
                <div class="space-y-1">
                  <h3 class="font-semibold">{{ contest.title }}</h3>
                  <div
                    class="flex items-center gap-3 text-sm text-muted-foreground"
                  >
                    <span class="flex items-center gap-1">
                      <Calendar class="h-3 w-3" />
                      {{ formatDate(contest.start_time) }}
                    </span>
                    <span>{{ contest.duration_minutes }} min</span>
                  </div>
                </div>
                <Badge variant="outline">Virtual</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  </div>
</template>
