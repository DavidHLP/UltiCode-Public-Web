<script setup lang="ts">
import ProblemExplorer from "@/components/problem/ProblemExplorer.vue";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Trophy,
  Code2,
  Database,
  BrainCircuit,
  Share2,
  Building2,
  List,
  ArrowRight,
} from "lucide-vue-next";

const featuredLists = [
  {
    title: "Top 100 Liked",
    description: "Must-do list for interview prep",
    icon: Trophy,
    color: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-500",
    count: 100,
  },
  {
    title: "LeetCode 75",
    description: "Ace your coding interview",
    icon: Code2,
    color: "bg-blue-500/10 text-blue-600 dark:text-blue-500",
    count: 75,
  },
  {
    title: "SQL 50",
    description: "Crack SQL interviews",
    icon: Database,
    color: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-500",
    count: 50,
  },
  {
    title: "Dynamic Programming",
    description: "Master DP pattern",
    icon: BrainCircuit,
    color: "bg-purple-500/10 text-purple-600 dark:text-purple-500",
    count: 25,
  },
  {
    title: "Graph Theory",
    description: "Learn graph algorithms",
    icon: Share2,
    color: "bg-green-500/10 text-green-600 dark:text-green-500",
    count: 40,
  },
  {
    title: "Top Amazon Questions",
    description: "High frequency questions",
    icon: Building2,
    color: "bg-orange-500/10 text-orange-600 dark:text-orange-500",
    count: 35,
  },
];
</script>

<template>
  <div class="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-12">
    <section class="space-y-6">
      <Carousel
        class="relative w-full"
        :opts="{
          align: 'start',
          loop: true,
        }"
      >
        <CarouselContent class="-ml-4 pb-4">
          <CarouselItem
            v-for="(item, index) in featuredLists"
            :key="index"
            class="pl-4 md:basis-1/3 lg:basis-1/4"
          >
            <Card
              class="group relative overflow-hidden border-muted bg-card/50 hover:bg-card transition-all duration-300 hover:border-primary/50 h-full cursor-pointer"
            >
              <!-- Decorative gradient background blob -->
              <div
                class="absolute -right-4 -top-4 h-24 w-24 rounded-full opacity-0 group-hover:opacity-10 transition-all duration-500 group-hover:scale-125 blur-2xl"
                :class="item.color?.split(' ')[0]?.replace('/10', '/20') ?? ''"
              ></div>

              <CardContent class="p-4">
                <div class="flex gap-3 relative z-10">
                  <!-- Icon Left -->
                  <div
                    class="w-10 h-10 shrink-0 rounded-lg flex items-center justify-center shadow-sm ring-1 ring-inset ring-border transition-transform duration-300 group-hover:scale-110"
                    :class="item.color ?? ''"
                  >
                    <component :is="item.icon" class="w-5 h-5" />
                  </div>

                  <!-- Content Right -->
                  <div class="flex flex-col flex-1 min-w-0 py-0.5">
                    <div class="flex items-start justify-between gap-2">
                      <h3
                        class="font-bold text-sm leading-tight tracking-tight group-hover:text-primary transition-colors truncate"
                      >
                        {{ item.title }}
                      </h3>
                    </div>

                    <p
                      class="text-[11px] text-muted-foreground line-clamp-2 mt-1 leading-relaxed"
                    >
                      {{ item.description }}
                    </p>

                    <div class="flex items-center justify-between mt-2.5">
                      <span
                        class="inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground bg-secondary/50 px-1.5 py-0.5 rounded border border-transparent group-hover:border-border/50 transition-colors"
                      >
                        <List class="w-2.5 h-2.5" />
                        {{ item.count }} Problems
                      </span>
                      <div
                        class="flex items-center gap-1 text-[10px] font-bold text-primary opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0"
                      >
                        Start
                        <ArrowRight class="w-3 h-3" />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </CarouselItem>
        </CarouselContent>
        <CarouselPrevious
          class="left-0 -translate-x-1/2 bg-background/90 backdrop-blur shadow-md border-muted hover:bg-background hover:border-primary"
        />
        <CarouselNext
          class="right-0 translate-x-1/2 bg-background/90 backdrop-blur shadow-md border-muted hover:bg-background hover:border-primary"
        />
      </Carousel>
    </section>

    <section class="space-y-6">
      <ProblemExplorer />
    </section>
  </div>
</template>
