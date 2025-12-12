<script setup lang="ts">
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock } from "lucide-vue-next";
import { useRouter } from "vue-router";
import type { ContestListItem } from "@/types/contest";
import { formatDateTime, getDurationMinutes } from "@/utils/date";

defineProps<{
  contests: ContestListItem[];
}>();

const router = useRouter();

// 计算倒计时
function getCountdown(startTime: string): string {
  const now = new Date().getTime();
  const start = new Date(startTime).getTime();
  const diff = start - now;

  if (diff <= 0) return "Started";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  }
  return `${hours}h ${minutes}m ${seconds}s`;
}

// 获取竞赛类型标签
function getContestTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    weekly: "Weekly Contest",
    biweekly: "Biweekly Contest",
    special: "Special Contest",
  };
  return labels[type] || type;
}
</script>

<template>
  <section v-if="contests.length > 0">
    <div class="grid gap-6 md:grid-cols-2">
      <Card
        v-for="(contest, index) in contests.slice(0, 2)"
        :key="contest.id"
        class="relative cursor-pointer overflow-hidden border-0 text-white transition-all hover:scale-[1.02] hover:shadow-xl"
        :class="
          index === 0
            ? 'bg-gradient-to-br from-[#2c3e50] to-[#4ca1af]'
            : 'bg-gradient-to-br from-[#134e5e] to-[#71b280]'
        "
        @click="
          router.push({
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
                <span>Time: {{ formatDateTime(contest.start_time) }}</span>
              </div>
              <div class="flex items-center gap-2">
                <Clock class="h-4 w-4" />
                <span
                  >Duration:
                  {{ getDurationMinutes(contest.start_time, contest.end_time) }}
                  min</span
                >
              </div>
            </div>

            <div class="flex items-center justify-between mt-4">
              <div class="text-sm font-medium opacity-90">
                Time until start: {{ getCountdown(contest.start_time) }}
              </div>
              <Button
                variant="secondary"
                size="sm"
                class="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm"
                @click.stop
              >
                <Calendar class="mr-2 h-3 w-3" /> Add to Calendar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </section>
</template>
