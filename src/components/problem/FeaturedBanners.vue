<script setup lang="ts">
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Code2, Database, ArrowRight, Sparkles } from "lucide-vue-next";

// Enhanced data for banners
const featuredBanners = [
  {
    title: "Top 100 Liked Questions",
    description:
      "Must-do list for interview prep. Master the most common patterns.",
    icon: Trophy,
    bgClass:
      "bg-gradient-to-br from-orange-500/10 to-amber-500/5 border-orange-200/20",
    iconClass:
      "text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/20",
    count: 100,
    tag: "Essential",
  },
  {
    title: "LeetCode 75",
    description: "Ace your coding interview with 75 curated questions.",
    icon: Code2,
    bgClass:
      "bg-gradient-to-br from-blue-500/10 to-indigo-500/5 border-blue-200/20",
    iconClass:
      "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/20",
    count: 75,
    tag: "Study Plan",
  },
  {
    title: "SQL 50",
    description: "Crack SQL interviews with 50 essential queries.",
    icon: Database,
    bgClass:
      "bg-gradient-to-br from-cyan-500/10 to-sky-500/5 border-cyan-200/20",
    iconClass:
      "text-cyan-600 dark:text-cyan-400 bg-cyan-100 dark:bg-cyan-900/20",
    count: 50,
    tag: "Database",
  },
];
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
    <Card
      v-for="(banner, index) in featuredBanners"
      :key="index"
      class="group relative overflow-hidden border shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary/20 cursor-pointer"
      :class="banner.bgClass"
    >
      <!-- Decorative background elements -->
      <div
        class="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/40 dark:bg-white/5 blur-3xl transition-transform group-hover:scale-110"
      ></div>

      <CardContent
        class="p-5 relative z-10 flex flex-col h-full justify-between"
      >
        <div class="flex items-start justify-between mb-4">
          <div
            class="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3"
            :class="banner.iconClass"
          >
            <component :is="banner.icon" class="w-5 h-5" />
          </div>
          <div
            class="px-2 py-0.5 rounded-full text-[10px] font-medium bg-background/60 backdrop-blur border shadow-sm"
          >
            {{ banner.tag }}
          </div>
        </div>

        <div>
          <h3
            class="font-bold text-lg mb-1 group-hover:text-primary transition-colors"
          >
            {{ banner.title }}
          </h3>
          <p
            class="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-4"
          >
            {{ banner.description }}
          </p>

          <div class="flex items-center justify-between">
            <div
              class="text-xs font-medium text-muted-foreground flex items-center gap-1"
            >
              <Sparkles class="w-3 h-3 text-yellow-500" />
              {{ banner.count }} Questions
            </div>
            <div
              class="flex items-center gap-1 text-xs font-semibold text-primary opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0"
            >
              Get Started
              <ArrowRight class="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
