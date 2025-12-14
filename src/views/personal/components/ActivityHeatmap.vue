<script setup lang="ts">
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Generate mock data for the last 365 days
const generateData = () => {
  const data = [];
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    // Random activity level: 0 (none) to 4 (high)
    // Skew towards 0 for realism
    const rand = Math.random();
    let level = 0;
    if (rand > 0.9) level = 4;
    else if (rand > 0.8) level = 3;
    else if (rand > 0.7) level = 2;
    else if (rand > 0.5) level = 1;

    data.push({
      date: date.toISOString().split("T")[0],
      level,
    });
  }
  return data.reverse();
};

const activityData = generateData();

const getColorClass = (level: number) => {
  switch (level) {
    case 1:
      return "bg-green-200 dark:bg-green-900/40";
    case 2:
      return "bg-green-400 dark:bg-green-700/60";
    case 3:
      return "bg-green-600 dark:bg-green-500/80";
    case 4:
      return "bg-green-800 dark:bg-green-400";
    default:
      return "bg-secondary"; // Empty/None
  }
};

const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
</script>

<template>
  <div class="w-full overflow-x-auto pb-4">
    <div class="min-w-[800px] space-y-2">
      <!-- Months Header -->
      <div class="flex text-xs text-muted-foreground">
        <div v-for="month in months" :key="month" class="flex-1">
          {{ month }}
        </div>
      </div>

      <!-- Heatmap Grid -->
      <div class="flex gap-[3px]">
        <!-- We need to render columns (weeks). 365 days is approx 52 weeks -->
        <!-- This is a simplified rendering. A real calendar heatmap needs complex date math for exact alignment. -->
        <!-- For this mock, we'll just render a flex wrap of 365 boxes to look "cool" roughly. -->
        <!-- actually, grid is better for "weeks" columns. -->
        <div class="grid grid-flow-col grid-rows-7 gap-[3px]">
          <TooltipProvider v-for="(day, index) in activityData" :key="index">
            <Tooltip>
              <TooltipTrigger as-child>
                <div
                  class="h-3 w-3 rounded-[2px] transition-colors hover:ring-2 hover:ring-ring hover:ring-offset-1"
                  :class="getColorClass(day.level)"
                ></div>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {{ day.level === 0 ? "No" : day.level }} contributions on
                  {{ day.date }}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div class="flex items-center gap-2 text-xs text-muted-foreground">
        <span>Less</span>
        <div class="flex gap-[2px]">
          <div class="h-3 w-3 rounded-[2px] bg-secondary"></div>
          <div
            class="h-3 w-3 rounded-[2px] bg-green-200 dark:bg-green-900/40"
          ></div>
          <div
            class="h-3 w-3 rounded-[2px] bg-green-400 dark:bg-green-700/60"
          ></div>
          <div
            class="h-3 w-3 rounded-[2px] bg-green-600 dark:bg-green-500/80"
          ></div>
          <div
            class="h-3 w-3 rounded-[2px] bg-green-800 dark:bg-green-400"
          ></div>
        </div>
        <span>More</span>
      </div>
    </div>
  </div>
</template>
