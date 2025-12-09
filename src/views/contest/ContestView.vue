<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import {
  fetchUpcomingContests,
  fetchPastContests,
  fetchGlobalRankings,
} from "@/api/contest";
import type {
  ContestListItem,
  GlobalRankingEntry,
  ContestStatus,
  ContestType,
} from "@/types/contest";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Calendar,
  Clock,
  Users,
  Trophy,
  PlayCircle,
  Lock,
} from "lucide-vue-next";

// 状态
const upcomingContests = ref<ContestListItem[]>([]);
const pastContests = ref<ContestListItem[]>([]);
const globalRankings = ref<GlobalRankingEntry[]>([]);
const loading = ref(true);

// 加载数据
onMounted(async () => {
  try {
    const [upcoming, past, rankings] = await Promise.all([
      fetchUpcomingContests(),
      fetchPastContests(),
      fetchGlobalRankings(),
    ]);
    upcomingContests.value = upcoming;
    pastContests.value = past;
    globalRankings.value = rankings;
  } catch (error) {
    console.error("Failed to load contest data:", error);
  } finally {
    loading.value = false;
  }
});

// 下一场竞赛(最近即将开始的)
const nextContest = computed(() => upcomingContests.value[0]);

// 格式化日期时间
function formatDateTime(isoString: string): string {
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}，${hours}:${minutes}`;
}

// 计算倒计时
function getCountdown(startTime: string): string {
  const now = new Date().getTime();
  const start = new Date(startTime).getTime();
  const diff = start - now;

  if (diff <= 0) return "已开始";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  if (days > 0) {
    return `${days} 天 ${hours} 小时 ${minutes} 分 ${seconds} 秒`;
  }
  return `${hours} 小时 ${minutes} 分 ${seconds} 秒`;
}

// 计算时长
function getDurationMinutes(startTime: string, endTime: string): number {
  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();
  return Math.floor((end - start) / (1000 * 60));
}

// 获取竞赛类型标签
function getContestTypeLabel(type: ContestType | string): string {
  const labels: Record<string, string> = {
    weekly: "周赛",
    biweekly: "双周赛",
    special: "特殊竞赛",
  };
  return labels[type] || type;
}

// 获取竞赛状态颜色
function getStatusVariant(
  status: ContestStatus | string,
): "default" | "secondary" | "destructive" | "outline" {
  const variants: Record<string, "default" | "secondary" | "destructive"> = {
    upcoming: "default",
    running: "destructive",
    finished: "secondary",
  };
  return variants[status] || "outline";
}

// 获取国旗emoji
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
    BY: "🇧🇾",
    RU: "🇷🇺",
    CH: "🇨🇭",
  };
  return flags[countryCode] || "🌐";
}
</script>

<template>
  <div class="container mx-auto max-w-[60%] space-y-8 py-8">
    <!-- 页面标题 -->
    <div class="space-y-4 text-center">
      <div class="flex items-center justify-center gap-3">
        <img
          src="https://assets.leetcode.cn/aliyun-lc-upload/contest-config/contest/wc_card_img.png"
          alt="竞赛"
          class="h-16 w-16 rounded-lg object-cover"
        />
        <h1 class="text-4xl font-bold">全球竞赛</h1>
      </div>
      <p class="text-lg text-muted-foreground">
        快来参加每周排位赛,提升你的世界排名
      </p>
    </div>

    <div v-if="loading" class="py-20 text-center">
      <p class="text-muted-foreground">加载中...</p>
    </div>

    <div v-else class="grid gap-8 lg:grid-cols-3">
      <!-- 主要内容区 -->
      <div class="space-y-6 lg:col-span-2">
        <!-- 即将开始的竞赛 -->
        <section v-if="nextContest" class="space-y-4">
          <h2 class="text-2xl font-semibold">即将开始</h2>
          <Card
            class="cursor-pointer overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 to-background transition-all hover:border-primary/40 hover:shadow-lg"
            @click="
              $router.push({
                name: 'contest-detail',
                params: { contestId: nextContest.id },
              })
            "
          >
            <CardContent class="p-6">
              <div class="space-y-4">
                <div class="flex flex-wrap items-start justify-between gap-4">
                  <div class="space-y-2">
                    <div class="flex items-center gap-2">
                      <Badge variant="outline">
                        {{ getContestTypeLabel(nextContest.type || "weekly") }}
                      </Badge>
                      <Badge v-if="nextContest.isRated" variant="default">
                        计分
                      </Badge>
                    </div>
                    <h3 class="text-2xl font-bold">{{ nextContest.title }}</h3>
                  </div>
                  <Badge :variant="getStatusVariant(nextContest.status)">
                    <Lock class="mr-1 h-3 w-3" />
                    即将开始
                  </Badge>
                </div>

                <div class="grid gap-4 md:grid-cols-3">
                  <div class="flex items-center gap-2 text-sm">
                    <Calendar class="h-4 w-4 text-muted-foreground" />
                    <span>{{ formatDateTime(nextContest.start_time) }}</span>
                  </div>
                  <div class="flex items-center gap-2 text-sm">
                    <Clock class="h-4 w-4 text-muted-foreground" />
                    <span
                      >{{
                        getDurationMinutes(
                          nextContest.start_time,
                          nextContest.end_time,
                        )
                      }}
                      分钟</span
                    >
                  </div>
                  <div class="flex items-center gap-2 text-sm">
                    <Users class="h-4 w-4 text-muted-foreground" />
                    <span>{{ nextContest.participant_count }} 人已报名</span>
                  </div>
                </div>

                <div class="rounded-lg bg-primary/10 p-4">
                  <p class="mb-2 text-sm font-medium">距离开始还有:</p>
                  <p class="text-2xl font-bold text-primary">
                    {{ getCountdown(nextContest.start_time) }}
                  </p>
                </div>

                <div class="flex flex-wrap gap-3">
                  <Button
                    size="lg"
                    class="gap-2"
                    @click.stop="
                      $router.push({
                        name: 'contest-detail',
                        params: { contestId: nextContest.id },
                      })
                    "
                  >
                    <Users class="h-4 w-4" />
                    立即报名
                  </Button>
                  <Button size="lg" variant="outline" class="gap-2" @click.stop>
                    <Calendar class="h-4 w-4" />
                    添加到日历
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <!-- 往届竞赛回顾 -->
        <section class="space-y-4">
          <div class="flex items-center justify-between">
            <h2 class="text-2xl font-semibold">往届竞赛回顾</h2>
            <Button variant="ghost" size="sm">查看更多</Button>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>竞赛</TableHead>
                  <TableHead class="w-32">开始时间</TableHead>
                  <TableHead class="w-24 text-right">时长</TableHead>
                  <TableHead class="w-24"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow
                  v-for="contest in pastContests.slice(0, 10)"
                  :key="contest.id"
                  class="cursor-pointer transition-colors hover:bg-muted/50"
                  @click="
                    $router.push({
                      name: 'contest-detail',
                      params: { contestId: contest.id },
                    })
                  "
                >
                  <TableCell>
                    <div class="flex items-center gap-2">
                      <Badge variant="outline" class="text-xs">
                        {{ getContestTypeLabel(contest.type || "weekly") }}
                      </Badge>
                      <span class="font-semibold">{{ contest.title }}</span>
                    </div>
                  </TableCell>
                  <TableCell class="text-sm text-muted-foreground">
                    {{ formatDateTime(contest.start_time) }}
                  </TableCell>
                  <TableCell class="text-right text-sm">
                    {{
                      getDurationMinutes(contest.start_time, contest.end_time)
                    }}
                    分钟
                  </TableCell>
                  <TableCell class="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      class="gap-2"
                      @click.stop
                    >
                      <PlayCircle class="h-4 w-4" />
                      虚拟竞赛
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Card>
        </section>
      </div>

      <!-- 侧边栏 -->
      <div class="space-y-6">
        <!-- 全球排名榜 -->
        <section class="space-y-4">
          <h2 class="text-xl font-semibold">全球排名</h2>
          <Card>
            <CardHeader>
              <CardTitle class="flex items-center gap-2 text-base">
                <Trophy class="h-5 w-5 text-yellow-500" />
                TOP 10 选手
              </CardTitle>
            </CardHeader>
            <CardContent class="space-y-3">
              <div
                v-for="(user, index) in globalRankings.slice(0, 10)"
                :key="user.username"
                class="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted/50"
              >
                <div
                  class="flex h-8 w-8 items-center justify-center rounded-full font-bold"
                  :class="{
                    'bg-yellow-100 text-yellow-700': index === 0,
                    'bg-gray-100 text-gray-700': index === 1,
                    'bg-orange-100 text-orange-700': index === 2,
                    'bg-muted text-muted-foreground': index > 2,
                  }"
                >
                  {{ index + 1 }}
                </div>

                <img
                  v-if="user.avatar"
                  :src="user.avatar"
                  :alt="user.username"
                  class="h-8 w-8 rounded-full"
                />
                <div v-else class="h-8 w-8 rounded-full bg-primary/10" />

                <div class="flex-1 overflow-hidden">
                  <div class="flex items-center gap-2">
                    <p class="truncate font-medium">{{ user.username }}</p>
                    <Badge
                      v-if="user.badge"
                      variant="secondary"
                      class="text-xs"
                    >
                      {{ user.badge }}
                    </Badge>
                  </div>
                  <p class="text-xs text-muted-foreground">
                    {{ getCountryFlag(user.country || "CN") }}
                    {{ user.rating }} 分 · {{ user.contestsAttended || 0 }} 场
                  </p>
                </div>
              </div>

              <Button variant="outline" class="w-full" size="sm">
                查看完整排名
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  </div>
</template>
