<script setup lang="ts">
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { GlobalRankingEntry } from "@/types/contest";
import RatingBadge from "./RatingBadge.vue";

defineProps<{
  rankings: GlobalRankingEntry[];
}>();
</script>

<template>
  <div class="space-y-6">
    <!-- Podium Section -->
    <Card
      class="border-none shadow-sm bg-gradient-to-b from-gray-50/50 to-white"
    >
      <div class="p-6 text-center space-y-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-extrabold text-foreground/80 italic">
            National Ranking
          </h2>
          <span
            class="text-xs text-muted-foreground border rounded px-1 cursor-pointer"
            >Global</span
          >
        </div>

        <!-- Podium Visual -->
        <div class="flex items-end justify-center gap-2 h-40 pt-4">
          <!-- 2nd Place -->
          <div
            class="flex flex-col items-center gap-2 w-1/3"
            v-if="rankings[1]"
          >
            <div class="relative">
              <img
                :src="
                  rankings[1].avatar ||
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
              {{ rankings[1].username }}
            </p>
            <RatingBadge :rating="rankings[1].rating" size="sm" />
            <div
              class="h-20 w-full bg-gradient-to-t from-slate-200 to-slate-100 rounded-t-lg shadow-sm border-t border-slate-300/50"
            ></div>
          </div>

          <!-- 1st Place -->
          <div
            class="flex flex-col items-center gap-2 w-1/3"
            v-if="rankings[0]"
          >
            <div class="relative">
              <img
                :src="
                  rankings[0].avatar ||
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
              {{ rankings[0].username }}
            </p>
            <RatingBadge :rating="rankings[0].rating" size="sm" />
            <div
              class="h-32 w-full bg-gradient-to-t from-yellow-100 to-yellow-50 rounded-t-lg shadow-md border-t border-yellow-300/50"
            ></div>
          </div>

          <!-- 3rd Place -->
          <div
            class="flex flex-col items-center gap-2 w-1/3"
            v-if="rankings[2]"
          >
            <div class="relative">
              <img
                :src="
                  rankings[2].avatar ||
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
              {{ rankings[2].username }}
            </p>
            <RatingBadge :rating="rankings[2].rating" size="sm" />
            <div
              class="h-16 w-full bg-gradient-to-t from-orange-100 to-orange-50 rounded-t-lg shadow-sm border-t border-orange-300/50"
            ></div>
          </div>
        </div>

        <!-- Rest of List -->
        <div class="space-y-3 pt-4 border-t">
          <div
            v-for="(user, index) in rankings.slice(3, 10)"
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
                Attended {{ user.contestsAttended || 0 }} contests
              </p>
            </div>
            <RatingBadge :rating="user.rating" size="sm" />
          </div>
        </div>

        <Button variant="ghost" class="w-full text-primary text-sm"
          >Show More</Button
        >
      </div>
    </Card>
  </div>
</template>
