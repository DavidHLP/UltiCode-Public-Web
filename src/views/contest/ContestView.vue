<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import {
  fetchUpcomingContests,
  fetchPastContests,
  fetchGlobalRankings,
} from "@/api/contest";
import type {
  ContestListItem,
  GlobalRankingEntry,
  ContestType,
} from "@/types/contest";
import { Card, CardContent } from "@/components/ui/card";

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
  ChevronLeft,
  ChevronRight,
  Trophy,
} from "lucide-vue-next";
import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();

// 状态
const upcomingContests = ref<ContestListItem[]>([]);
const pastContests = ref<ContestListItem[]>([]);
const totalPastContests = ref(0);
const globalRankings = ref<GlobalRankingEntry[]>([]);
const loading = ref(true);
const loadingPast = ref(false);

const currentPage = ref(1);
const pageSize = 10;

// 加载数据
onMounted(async () => {
  try {
    const page = Number(route.query.page) || 1;
    currentPage.value = page;

    const [upcoming, pastRes, rankings] = await Promise.all([
      fetchUpcomingContests(),
      fetchPastContests(page, pageSize),
      fetchGlobalRankings(),
    ]);
    upcomingContests.value = upcoming;
    pastContests.value = pastRes.data;
    totalPastContests.value = pastRes.total;
    globalRankings.value = rankings;
  } catch (error) {
    console.error("Failed to load contest data:", error);
  } finally {
    loading.value = false;
  }
});

// 监听分页变化
watch(currentPage, async (newPage) => {
  loadingPast.value = true;
  try {
    const res = await fetchPastContests(newPage, pageSize);
    pastContests.value = res.data;
    totalPastContests.value = res.total;
    // 更新 URL Query
    router.replace({ query: { ...route.query, page: newPage } });
  } catch (error) {
    console.error("Failed to load past contests:", error);
  } finally {
    loadingPast.value = false;
  }
});

// 格式化日期时间
function formatDateTime(isoString: string): string {
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}`;
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
// 计算时长
function getDurationMinutes(startTime?: string, endTime?: string): number {
  if (!startTime || !endTime) return 0;
  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();
  if (isNaN(start) || isNaN(end)) return 0;
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

const totalPages = computed(() =>
  Math.ceil(totalPastContests.value / pageSize),
);

// 简单的页码生成逻辑
const visiblePages = computed(() => {
  const pages: (number | string)[] = [];
  const total = totalPages.value;
  const current = currentPage.value;

  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    pages.push(1);
    if (current > 3) pages.push("...");

    let start = Math.max(2, current - 1);
    let end = Math.min(total - 1, current + 1);

    if (current < 3) end = 4;
    if (current > total - 2) start = total - 3;

    for (let i = start; i <= end; i++) pages.push(i);

    if (current < total - 2) pages.push("...");
    pages.push(total);
  }
  return pages;
});
</script>

<template>
  <div class="container mx-auto max-w-[1200px] space-y-8 py-8">
    <div class="space-y-4 text-center">
      <div class="flex items-center justify-center gap-3">
        <Trophy class="h-16 w-16 text-yellow-500" />
        <h1
          class="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-500 to-orange-500"
        >
          力扣 竞赛
        </h1>
      </div>
      <p class="text-lg text-muted-foreground">
        快来参加每周排位赛，提升你的世界排名
      </p>
    </div>

    <div v-if="loading" class="py-20 text-center">
      <p class="text-muted-foreground">加载中...</p>
    </div>

    <div v-else class="space-y-8">
      <!-- Upcoming Contests Top Section -->
      <section v-if="upcomingContests.length > 0">
        <div class="grid gap-6 md:grid-cols-2">
          <Card
            v-for="(contest, index) in upcomingContests.slice(0, 2)"
            :key="contest.id"
            class="relative cursor-pointer overflow-hidden border-0 text-white transition-all hover:scale-[1.02] hover:shadow-xl"
            :class="
              index === 0
                ? 'bg-gradient-to-br from-[#2c3e50] to-[#4ca1af]'
                : 'bg-gradient-to-br from-[#134e5e] to-[#71b280]'
            "
            @click="
              $router.push({
                name: 'contest-detail',
                params: { contestId: contest.id },
              })
            "
          >
            <!-- Background decoration -->
            <div
              class="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl"
            ></div>

            <CardContent class="p-6 relative z-10">
              <div class="space-y-6">
                <div class="flex justify-between items-start">
                  <div class="space-y-2">
                    <p class="text-sm font-medium text-white/90">
                      {{ getContestTypeLabel(contest.type || "weekly") }}
                    </p>
                    <h3 class="text-2xl font-bold leading-tight">
                      {{ contest.title }}
                    </h3>
                  </div>
                  <img
                    src="https://assets.leetcode.cn/aliyun-lc-upload/contest-config/contest/wc_card_img.png"
                    class="w-12 h-12 rounded opacity-90"
                    alt="logo"
                  />
                </div>

                <div class="space-y-2 text-sm text-gray-100">
                  <div class="flex items-center gap-2">
                    <Calendar class="h-4 w-4" />
                    <span
                      >中国时间: {{ formatDateTime(contest.start_time) }}</span
                    >
                  </div>
                  <div class="flex items-center gap-2">
                    <Clock class="h-4 w-4" />
                    <span
                      >时长:
                      {{
                        getDurationMinutes(contest.start_time, contest.end_time)
                      }}
                      分钟</span
                    >
                  </div>
                </div>

                <div class="flex items-center justify-between mt-4">
                  <div class="text-sm font-medium opacity-90">
                    距离开始还有: {{ getCountdown(contest.start_time) }}
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    class="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm"
                    @click.stop
                  >
                    <Calendar class="mr-2 h-3 w-3" /> 添加到日程表
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <!-- Main Grid: Left Ranking, Right Past Contests -->
      <div class="grid gap-8 lg:grid-cols-3">
        <!-- LEFT: Ranking -->
        <div class="space-y-6">
          <!-- Podium Section -->
          <Card
            class="border-none shadow-sm bg-gradient-to-b from-gray-50/50 to-white"
          >
            <div class="p-6 text-center space-y-6">
              <div class="flex items-center justify-between mb-4">
                <h2 class="text-xl font-extrabold text-foreground/80 italic">
                  全国排名
                </h2>
                <span
                  class="text-xs text-muted-foreground border rounded px-1 cursor-pointer"
                  >显示全球</span
                >
              </div>

              <!-- Podium Visual -->
              <div class="flex items-end justify-center gap-2 h-40 pt-4">
                <!-- 2nd Place -->
                <div
                  class="flex flex-col items-center gap-2 w-1/3"
                  v-if="globalRankings[1]"
                >
                  <div class="relative">
                    <img
                      :src="
                        globalRankings[1].avatar ||
                        'https://assets.leetcode.cn/aliyun-lc-upload/users/default_avatar.png'
                      "
                      class="w-12 h-12 rounded-full border-2 border-slate-300"
                    />
                    <div class="absolute -bottom-2 w-full text-center">
                      <span
                        class="bg-slate-300 text-slate-800 text-[10px] px-1.5 rounded-full font-bold"
                        >2</span
                      >
                    </div>
                  </div>
                  <p class="text-xs font-medium truncate w-full">
                    {{ globalRankings[1].username }}
                  </p>
                  <div
                    class="h-20 w-full bg-gradient-to-t from-slate-200 to-slate-100 rounded-t-lg shadow-sm border-t border-slate-300/50"
                  ></div>
                </div>

                <!-- 1st Place -->
                <div
                  class="flex flex-col items-center gap-2 w-1/3"
                  v-if="globalRankings[0]"
                >
                  <div class="relative">
                    <img
                      :src="
                        globalRankings[0].avatar ||
                        'https://assets.leetcode.cn/aliyun-lc-upload/users/default_avatar.png'
                      "
                      class="w-16 h-16 rounded-full border-2 border-yellow-400"
                    />
                    <div class="absolute -bottom-2 w-full text-center">
                      <span
                        class="bg-yellow-400 text-yellow-900 text-[10px] px-1.5 rounded-full font-bold"
                        >1</span
                      >
                    </div>
                  </div>
                  <p
                    class="text-xs font-medium truncate w-full font-bold text-yellow-600"
                  >
                    {{ globalRankings[0].username }}
                  </p>
                  <div
                    class="h-32 w-full bg-gradient-to-t from-yellow-100 to-yellow-50 rounded-t-lg shadow-md border-t border-yellow-300/50"
                  ></div>
                </div>

                <!-- 3rd Place -->
                <div
                  class="flex flex-col items-center gap-2 w-1/3"
                  v-if="globalRankings[2]"
                >
                  <div class="relative">
                    <img
                      :src="
                        globalRankings[2].avatar ||
                        'https://assets.leetcode.cn/aliyun-lc-upload/users/default_avatar.png'
                      "
                      class="w-12 h-12 rounded-full border-2 border-orange-300"
                    />
                    <div class="absolute -bottom-2 w-full text-center">
                      <span
                        class="bg-orange-300 text-orange-800 text-[10px] px-1.5 rounded-full font-bold"
                        >3</span
                      >
                    </div>
                  </div>
                  <p class="text-xs font-medium truncate w-full">
                    {{ globalRankings[2].username }}
                  </p>
                  <div
                    class="h-16 w-full bg-gradient-to-t from-orange-100 to-orange-50 rounded-t-lg shadow-sm border-t border-orange-300/50"
                  ></div>
                </div>
              </div>

              <!-- Rest of List -->
              <div class="space-y-3 pt-4 border-t">
                <div
                  v-for="(user, index) in globalRankings.slice(3, 10)"
                  :key="user.username"
                  class="flex items-center gap-3 p-1"
                >
                  <span class="text-xs font-bold w-4 text-muted-foreground">{{
                    index + 4
                  }}</span>
                  <img
                    :src="
                      user.avatar ||
                      'https://assets.leetcode.cn/aliyun-lc-upload/users/default_avatar.png'
                    "
                    class="h-8 w-8 rounded-full bg-muted"
                  />
                  <div class="flex-1 min-w-0 text-left">
                    <p class="truncate text-sm font-medium">
                      {{ user.username }}
                    </p>
                    <p class="text-xs text-muted-foreground">
                      已参加竞赛 {{ user.contestsAttended || 0 }} 次
                    </p>
                  </div>
                </div>
              </div>

              <Button variant="ghost" class="w-full text-primary text-sm"
                >显示更多</Button
              >
            </div>
          </Card>
        </div>

        <!-- RIGHT: Past Contests -->
        <div class="space-y-4 lg:col-span-2">
          <div class="flex items-center justify-between">
            <h2 class="text-2xl font-bold">往届竞赛回顾</h2>
            <div
              class="flex items-center gap-2 text-primary font-medium text-sm cursor-pointer"
            >
              <Trophy class="h-4 w-4" /> 竞赛合作
            </div>
          </div>
          <p class="text-muted-foreground text-sm -mt-2">
            参加虚拟竞赛，为排位赛做好充足准备
          </p>

          <Card class="border-none shadow-sm overflow-hidden">
            <div class="p-2 border-b flex justify-end">
              <!-- Random/Toggle Placeholders from Image -->
              <Button
                variant="ghost"
                size="icon"
                class="text-pink-500 rounded-full bg-pink-50 hover:bg-pink-100"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M12 3v19" />
                  <path d="M5 8h14" />
                  <path d="M5 16h14" />
                </svg>
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow class="hover:bg-transparent bg-muted/5">
                  <TableHead class="w-[300px]">以往竞赛</TableHead>
                  <TableHead class="text-center">时长</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow
                  v-for="(contest, index) in pastContests"
                  :key="contest.id"
                  class="group"
                  :class="index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'"
                >
                  <TableCell>
                    <div
                      class="py-2 cursor-pointer hover:underline decoration-primary"
                      @click="
                        $router.push({
                          name: 'contest-detail',
                          params: { contestId: contest.id },
                        })
                      "
                    >
                      <span class="font-medium block text-base">{{
                        contest.title
                      }}</span>
                      <span class="text-xs text-muted-foreground">{{
                        formatDateTime(contest.start_time)
                      }}</span>
                    </div>
                  </TableCell>
                  <TableCell
                    class="text-center text-sm text-gray-500 font-mono"
                  >
                    {{
                      getDurationMinutes(
                        contest.start_time,
                        contest.end_time,
                      ) || "--"
                    }}
                    {{
                      getDurationMinutes(contest.start_time, contest.end_time)
                        ? "分钟"
                        : ""
                    }}
                  </TableCell>
                  <TableCell class="text-right">
                    <Button
                      size="sm"
                      class="bg-pink-100 text-pink-500 hover:bg-pink-200 hover:text-pink-600 border-none px-4 h-7 text-xs font-semibold rounded"
                      @click.stop
                    >
                      虚拟
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>

            <!-- Pagination -->
            <div
              class="flex items-center justify-center gap-2 p-4 bg-muted/5 mt-auto"
            >
              <!-- Re-using existing pagination logic -->
              <Button
                variant="outline"
                size="icon"
                class="h-8 w-8 bg-white"
                :disabled="currentPage === 1 || loadingPast"
                @click="currentPage--"
              >
                <ChevronLeft class="h-4 w-4" />
              </Button>

              <div class="flex gap-1">
                <Button
                  v-for="page in visiblePages"
                  :key="page"
                  :variant="page === currentPage ? 'default' : 'ghost'"
                  size="sm"
                  :disabled="page === '...' || loadingPast"
                  class="w-8 h-8 p-0"
                  :class="
                    page === currentPage
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-white hover:bg-gray-100'
                  "
                  @click="typeof page === 'number' && (currentPage = page)"
                >
                  {{ page }}
                </Button>
              </div>

              <Button
                variant="outline"
                size="icon"
                class="h-8 w-8 bg-white"
                :disabled="currentPage === totalPages || loadingPast"
                @click="currentPage++"
              >
                <ChevronRight class="h-4 w-4" />
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  </div>
</template>
