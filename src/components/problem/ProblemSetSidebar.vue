<script setup lang="ts">
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  type DateValue,
  getLocalTimeZone,
  today,
} from "@internationalized/date";
import { Badge } from "@/components/ui/badge";
import { type Ref, ref } from "vue";
import { ChevronLeft, ChevronRight, Search, Building2 } from "lucide-vue-next";

const date = ref(today(getLocalTimeZone())) as Ref<DateValue>;

const trendingCompanies = [
  {
    name: "Google",
    count: 1249,
    color: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
  },
  {
    name: "Amazon",
    count: 762,
    color:
      "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300",
  },
  {
    name: "Meta",
    count: 688,
    color:
      "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300",
  },
  {
    name: "Microsoft",
    count: 723,
    color: "bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300",
  },
  {
    name: "Apple",
    count: 86,
    color: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300",
  },
  {
    name: "Bloomberg",
    count: 485,
    color:
      "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300",
  },
  {
    name: "Uber",
    count: 320,
    color: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300",
  },
];
</script>

<template>
  <div class="space-y-6">
    <!-- Calendar Widget -->
    <Card class="border-none shadow-sm bg-card/50">
      <CardHeader class="pb-2 border-b border-border/50 bg-muted/20">
        <CardTitle
          class="text-sm font-medium flex items-center justify-between"
        >
          <span>Daily Challenge</span>
          <div class="flex items-center gap-1">
            <span class="text-xs font-normal text-muted-foreground mr-1"
              >Dec 2025</span
            >
            <Badge
              variant="outline"
              class="text-[10px] font-normal h-5 px-1.5 flex gap-1 items-center bg-background/50"
            >
              <span class="w-1.5 h-1.5 rounded-full bg-green-500"></span>
              0
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent class="p-3 flex justify-center bg-card/30">
        <Calendar v-model="date" class="rounded-md border-0 p-0" />
      </CardContent>
    </Card>

    <!-- Trending Companies -->
    <Card class="border-none shadow-sm bg-card/50">
      <CardHeader class="pb-3 border-b border-border/50 bg-muted/20">
        <div class="flex items-center justify-between mb-3">
          <CardTitle class="text-sm font-medium flex items-center gap-2">
            <Building2 class="w-4 h-4 text-muted-foreground" />
            Trending Companies
          </CardTitle>
          <div class="flex gap-1">
            <Button variant="ghost" size="icon" class="h-6 w-6 rounded-md">
              <ChevronLeft class="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" class="h-6 w-6 rounded-md">
              <ChevronRight class="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div class="relative">
          <Search
            class="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground"
          />
          <Input
            type="text"
            placeholder="Search companies..."
            class="w-full bg-background/50 h-8 text-xs pl-8 pr-2 border-transparent focus:border-primary/20 shadow-none"
          />
        </div>
      </CardHeader>
      <CardContent class="pt-3 pb-4">
        <div class="flex flex-wrap gap-2">
          <span
            v-for="company in trendingCompanies"
            :key="company.name"
            class="group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-all hover:bg-opacity-80 hover:shadow-sm"
            :class="company.color"
          >
            {{ company.name }}
            <span
              class="bg-black/10 dark:bg-white/10 rounded-full px-1.5 min-w-[1.25rem] text-center text-[10px] group-hover:bg-black/20 dark:group-hover:bg-white/20 transition-colors"
            >
              {{ company.count }}
            </span>
          </span>
        </div>
      </CardContent>
    </Card>

    <!-- Session/Progress Widget Placeholder -->
    <Card
      class="border-none shadow-sm bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20"
    >
      <CardContent class="p-4 flex items-center justify-between">
        <div class="space-y-1">
          <p class="text-xs font-medium text-primary/80">Study Plan</p>
          <h4 class="text-sm font-bold text-primary">Ace Coding Interview</h4>
        </div>
        <Button size="sm" class="h-8 text-xs shadow-sm">Continue</Button>
      </CardContent>
    </Card>
  </div>
</template>
