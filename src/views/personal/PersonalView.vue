<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Link as LinkIcon,
  Twitter,
  Github,
  Calendar,
  Target,
  Zap,
  Activity,
  GitCommit,
  Edit,
} from "lucide-vue-next";
import { onMounted, ref, computed } from "vue";
import { RouterLink } from "vue-router";
import ActivityHeatmap from "./components/ActivityHeatmap.vue";
import {
  fetchUserProfile,
  fetchUserStats,
  type UserProfile,
  type UserStats,
} from "@/api/user";
import { fetchUserSubmissions } from "@/api/submission";
import type { SubmissionRecord } from "@/types/submission";
import { fetchCurrentUserId } from "@/utils/auth";

const loading = ref(true);
const user = ref<UserProfile | null>(null);
const submissions = ref<SubmissionRecord[]>([]);
const statsData = ref<UserStats | null>(null);

const stats = computed(() => {
  if (!statsData.value)
    return {
      easy: {
        count: 0,
        total: 0,
        color: "text-green-500",
        bg: "bg-green-500",
      },
      medium: {
        count: 0,
        total: 0,
        color: "text-yellow-500",
        bg: "bg-yellow-500",
      },
      hard: { count: 0, total: 0, color: "text-red-500", bg: "bg-red-500" },
    };

  const { stats } = statsData.value;
  return {
    easy: {
      count: stats.Easy.count,
      total: stats.Easy.total,
      color: "text-green-500",
      bg: "bg-green-500",
    },
    medium: {
      count: stats.Medium.count,
      total: stats.Medium.total,
      color: "text-yellow-500",
      bg: "bg-yellow-500",
    },
    hard: {
      count: stats.Hard.count,
      total: stats.Hard.total,
      color: "text-red-500",
      bg: "bg-red-500",
    },
  };
});

const recentActivity = computed(() => {
  return submissions.value.slice(0, 3).map((sub) => ({
    action: sub.status === "Accepted" ? "Solved" : "Attempted",
    problem: sub.problem?.title || "Unknown Problem",
    time: new Date(sub.created_at).toLocaleDateString(),
    status: sub.status,
  }));
});

onMounted(async () => {
  try {
    const userId = fetchCurrentUserId();
    if (!userId) return;
    const [userData, userSubmissions, userStats] = await Promise.all([
      fetchUserProfile(userId),
      fetchUserSubmissions(userId),
      fetchUserStats(userId),
    ]);

    user.value = userData;
    submissions.value = userSubmissions;
    statsData.value = userStats;
  } catch (e) {
    console.error("Failed to load profile data", e);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div v-if="loading" class="flex h-96 items-center justify-center">
    <div class="text-muted-foreground">Loading profile...</div>
  </div>
  <div v-else-if="!user" class="flex h-96 items-center justify-center">
    <div class="text-muted-foreground">Please log in to view your profile.</div>
  </div>
  <div
    v-else-if="user"
    class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500"
  >
    <!-- Hero Section -->
    <div class="flex flex-col gap-8 md:flex-row">
      <div class="shrink-0">
        <div class="relative">
          <Avatar class="h-32 w-32 border-4 border-background shadow-xl">
            <AvatarImage :src="user.avatar" :alt="user.name" />
            <AvatarFallback class="text-2xl">{{
              user.username.substring(0, 2).toUpperCase()
            }}</AvatarFallback>
          </Avatar>
          <div
            class="absolute bottom-1 right-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm"
            title="Premium Member"
          >
            <Zap class="h-4 w-4 fill-current" />
          </div>
        </div>
      </div>
      <div class="flex flex-1 flex-col justify-center space-y-4">
        <div class="flex items-start justify-between">
          <div class="space-y-1">
            <h1 class="text-3xl font-bold tracking-tight">
              {{ user.name || user.username }}
            </h1>
            <p class="text-muted-foreground">@{{ user.username }}</p>
          </div>
          <Button variant="outline" size="sm" class="gap-2" as-child>
            <RouterLink to="/personal/account">
              <Edit class="h-4 w-4" />
              Edit Profile
            </RouterLink>
          </Button>
        </div>
        <p class="max-w-2xl text-base leading-relaxed text-foreground/80">
          {{ user.bio || "No bio provided." }}
        </p>
        <div class="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <div class="flex items-center gap-1" v-if="user.location">
            <MapPin class="h-4 w-4" />
            <span>{{ user.location }}</span>
          </div>
          <div class="flex items-center gap-1" v-if="user.website">
            <LinkIcon class="h-4 w-4" />
            <a
              :href="user.website"
              class="hover:text-primary"
              target="_blank"
              >{{ user.website }}</a
            >
          </div>
          <div class="flex items-center gap-1" v-if="user.github">
            <Github class="h-4 w-4" />
            <span>{{ user.github }}</span>
          </div>
          <div class="flex items-center gap-1" v-if="user.twitter">
            <Twitter class="h-4 w-4" />
            <span>{{ user.twitter }}</span>
          </div>
          <div class="flex items-center gap-1">
            <Calendar class="h-4 w-4" />
            <span
              >Joined
              {{
                user.joined_at
                  ? new Date(user.joined_at).toLocaleDateString()
                  : "Recently"
              }}</span
            >
          </div>
        </div>
      </div>
    </div>

    <!-- Stats and Activity Grid -->
    <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <!-- Left Column: Stats -->
      <div class="space-y-6 lg:col-span-2">
        <!-- Progress Cards -->
        <div class="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader class="pb-2">
              <CardTitle class="text-sm font-medium text-muted-foreground"
                >Global Ranking</CardTitle
              >
            </CardHeader>
            <CardContent>
              <div class="flex items-baseline gap-2">
                <span class="text-2xl font-bold">{{
                  (user.rank || 12403).toLocaleString()
                }}</span>
                <span class="text-xs text-muted-foreground">Top 0.5%</span>
              </div>
              <div class="mt-2 flex items-center gap-2 text-xs">
                <Badge
                  variant="secondary"
                  class="bg-blue-100 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300"
                >
                  Diamond
                </Badge>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader class="pb-2">
              <CardTitle class="text-sm font-medium text-muted-foreground"
                >Problems Solved</CardTitle
              >
            </CardHeader>
            <CardContent>
              <div class="flex items-baseline gap-2">
                ><span class="text-2xl font-bold">{{
                  statsData?.totalSolved || 0
                }}</span>
                <span class="text-xs text-muted-foreground"
                  >/
                  {{
                    (statsData?.stats?.Easy.total || 0) +
                    (statsData?.stats?.Medium.total || 0) +
                    (statsData?.stats?.Hard.total || 0)
                  }}</span
                >
              </div>
              <div
                class="mt-2 h-2 w-full overflow-hidden rounded-full bg-secondary"
              >
                <div
                  class="h-full bg-primary"
                  :style="{
                    width:
                      ((statsData?.totalSolved || 0) /
                        ((statsData?.stats?.Easy.total || 0) +
                          (statsData?.stats?.Medium.total || 0) +
                          (statsData?.stats?.Hard.total || 0) || 1)) *
                        100 +
                      '%',
                  }"
                ></div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader class="pb-2">
              <CardTitle class="text-sm font-medium text-muted-foreground"
                >Current Streak</CardTitle
              >
            </CardHeader>
            <CardContent>
              <div class="flex items-baseline gap-2">
                <span class="text-2xl font-bold">{{
                  statsData?.streak || 0
                }}</span>
                <span class="text-xs text-muted-foreground">Days</span>
              </div>
              <div class="mt-2 flex gap-1">
                <!-- visual squares -->
                <div
                  v-for="i in 5"
                  :key="i"
                  class="h-2 w-2 rounded-sm bg-primary/20"
                  :class="{ 'bg-primary': i <= (statsData?.streak || 0) % 5 }"
                ></div>
              </div>
            </CardContent>
          </Card>
        </div>

        <!-- Detailed Problem Stats -->
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <Target class="h-5 w-5" />
              Problem Solving Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-4">
              <div
                v-for="(stat, difficulty) in stats"
                :key="difficulty"
                class="space-y-1"
              >
                <div class="flex items-center justify-between text-sm">
                  <span class="capitalize font-medium w-16">{{
                    difficulty
                  }}</span>
                  <div class="flex gap-1 text-xs text-muted-foreground">
                    <span :class="stat.color" class="font-bold">{{
                      stat.count
                    }}</span>
                    <span>/</span>
                    <span>{{ stat.total }}</span>
                    <span
                      >({{
                        ((stat.count / stat.total) * 100).toFixed(1)
                      }}%)</span
                    >
                  </div>
                </div>
                <div
                  class="h-2 w-full overflow-hidden rounded-full bg-secondary"
                >
                  <div
                    class="h-full transition-all"
                    :class="stat.bg"
                    :style="{ width: (stat.count / stat.total) * 100 + '%' }"
                  ></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Activity Heatmap Placeholder -->
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <Activity class="h-5 w-5" />
              Activity Map
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ActivityHeatmap :data="statsData?.heatmap" />
          </CardContent>
        </Card>
      </div>

      <!-- Right Column: Recent Activity -->
      <div class="space-y-6">
        <Card class="h-full">
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <GitCommit class="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              class="relative space-y-8 pl-6 before:absolute before:inset-y-0 before:left-2 before:w-[2px] before:bg-muted"
            >
              <div
                v-for="(item, index) in recentActivity"
                :key="index"
                class="relative"
              >
                <div
                  class="absolute -left-[23px] flex h-4 w-4 items-center justify-center rounded-full bg-background ring-2 ring-muted"
                >
                  <div
                    class="h-2 w-2 rounded-full bg-primary"
                    :class="
                      item.status !== 'Accepted' ? 'bg-muted-foreground' : ''
                    "
                  ></div>
                </div>
                <div class="flex flex-col gap-1">
                  <span class="text-sm font-medium leading-none"
                    >{{ item.action }}
                    <span class="text-primary">{{ item.problem }}</span></span
                  >
                  <span class="text-xs text-muted-foreground">{{
                    item.time
                  }}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>
