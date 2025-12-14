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

import ActivityHeatmap from "./components/ActivityHeatmap.vue";

// Mock Data
const user = {
  name: "Shad CN",
  username: "shadcn",
  email: "m@example.com",
  avatar: "/avatars/shadcn.jpg",
  bio: "Full-stack developer | UI/UX Enthusiast | Open Source Contributor. Building things that matter.",
  location: "San Francisco, CA",
  website: "shadcn.com",
  twitter: "@shadcn",
  github: "shadcn",
  joined: "December 2023",
  rank: 12403,
  rankTier: "Diamond",
  solved: 452,
  totalProblems: 2500,
  streak: 14,
};

const stats = {
  easy: { count: 200, total: 600, color: "text-green-500", bg: "bg-green-500" },
  medium: {
    count: 210,
    total: 1200,
    color: "text-yellow-500",
    bg: "bg-yellow-500",
  },
  hard: { count: 42, total: 700, color: "text-red-500", bg: "bg-red-500" },
};

const recentActivity = [
  {
    action: "Solved",
    problem: "Two Sum",
    time: "2 hours ago",
    status: "Accepted",
  },
  {
    action: "Solved",
    problem: "Median of Two Sorted Arrays",
    time: "5 hours ago",
    status: "Accepted",
  },
  {
    action: "Attempted",
    problem: "LRU Cache",
    time: "1 day ago",
    status: "Wrong Answer",
  },
];
</script>

<template>
  <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <!-- Hero Section -->
    <div class="flex flex-col gap-8 md:flex-row">
      <div class="shrink-0">
        <div class="relative">
          <Avatar class="h-32 w-32 border-4 border-background shadow-xl">
            <AvatarImage :src="user.avatar" :alt="user.name" />
            <AvatarFallback class="text-2xl">CN</AvatarFallback>
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
            <h1 class="text-3xl font-bold tracking-tight">{{ user.name }}</h1>
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
          {{ user.bio }}
        </p>
        <div class="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <div class="flex items-center gap-1">
            <MapPin class="h-4 w-4" />
            <span>{{ user.location }}</span>
          </div>
          <div class="flex items-center gap-1">
            <LinkIcon class="h-4 w-4" />
            <a href="#" class="hover:text-primary">{{ user.website }}</a>
          </div>
          <div class="flex items-center gap-1">
            <Github class="h-4 w-4" />
            <span>{{ user.github }}</span>
          </div>
          <div class="flex items-center gap-1">
            <Twitter class="h-4 w-4" />
            <span>{{ user.twitter }}</span>
          </div>
          <div class="flex items-center gap-1">
            <Calendar class="h-4 w-4" />
            <span>Joined {{ user.joined }}</span>
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
                  user.rank.toLocaleString()
                }}</span>
                <span class="text-xs text-muted-foreground">Top 0.5%</span>
              </div>
              <div class="mt-2 flex items-center gap-2 text-xs">
                <Badge
                  variant="secondary"
                  class="bg-blue-100 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300"
                >
                  {{ user.rankTier }}
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
                <span class="text-2xl font-bold">{{ user.solved }}</span>
                <span class="text-xs text-muted-foreground"
                  >/ {{ user.totalProblems }}</span
                >
              </div>
              <div
                class="mt-2 h-2 w-full overflow-hidden rounded-full bg-secondary"
              >
                <div
                  class="h-full bg-primary"
                  :style="{
                    width: (user.solved / user.totalProblems) * 100 + '%',
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
                <span class="text-2xl font-bold">{{ user.streak }}</span>
                <span class="text-xs text-muted-foreground">Days</span>
              </div>
              <div class="mt-2 flex gap-1">
                <!-- visual squares -->
                <div
                  v-for="i in 5"
                  :key="i"
                  class="h-2 w-2 rounded-sm bg-primary/20"
                  :class="{ 'bg-primary': i > 2 }"
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
            <ActivityHeatmap />
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
              class="relative space-y-8 pl-2 before:absolute before:inset-y-0 before:left-0 before:w-[1px] before:bg-border"
            >
              <div
                v-for="(item, index) in recentActivity"
                :key="index"
                class="relative pl-6"
              >
                <!-- Timeline Dot -->
                <div
                  class="absolute left-[-4px] top-1 h-2 w-2 rounded-full border border-background bg-muted-foreground ring-2 ring-background"
                ></div>
                <div class="flex flex-col gap-1">
                  <span class="text-sm font-medium"
                    >{{ item.action }}
                    <span class="text-primary">{{ item.problem }}</span></span
                  >
                  <span class="text-xs text-muted-foreground">{{
                    item.time
                  }}</span>
                  <Badge
                    variant="outline"
                    class="w-fit text-[10px]"
                    :class="{
                      'border-green-500 text-green-600':
                        item.status === 'Accepted',
                      'border-red-500 text-red-600': item.status !== 'Accepted',
                    }"
                  >
                    {{ item.status }}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>
