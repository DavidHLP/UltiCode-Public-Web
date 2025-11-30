<script setup lang="ts">
import ProblemExplorer from "@/view/problem/components/ProblemExplorer.vue";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
</script>

<template>
  <div class="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-10">
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-2xl font-bold tracking-tight">Featured Problem Sets</h2>
        <a href="#" class="text-sm font-medium text-primary hover:underline">View all</a>
      </div>
      <Carousel
        class="relative w-full"
        :opts="{
          align: 'start',
        }"
      >
        <CarouselContent class="-ml-4">
          <CarouselItem
            v-for="(_, index) in 10"
            :key="index"
            class="basis-1/2 pl-4 sm:basis-1/3 md:basis-1/4 lg:basis-1/5"
          >
            <Card class="group relative overflow-hidden transition-all hover:shadow-lg hover:border-primary/50 cursor-pointer h-full">
              <CardContent class="flex flex-col justify-between p-6 h-40 bg-gradient-to-br from-muted/50 to-muted/10 group-hover:from-primary/5 group-hover:to-transparent">
                <div class="space-y-2">
                  <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                    {{ index + 1 }}
                  </div>
                  <h3 class="font-semibold leading-none tracking-tight">Weekly Challenge</h3>
                </div>
                <div class="flex items-center justify-between text-sm text-muted-foreground">
                  <span>5 Problems</span>
                  <span class="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </CardContent>
            </Card>
          </CarouselItem>
        </CarouselContent>
        <CarouselPrevious class="left-0 -translate-x-1/2 bg-background/80 backdrop-blur-sm" />
        <CarouselNext class="right-0 translate-x-1/2 bg-background/80 backdrop-blur-sm" />
      </Carousel>
    </div>

    <div class="space-y-4">
      <h2 class="text-2xl font-bold tracking-tight">All Problems</h2>
      <ProblemExplorer />
    </div>
  </div>
</template>
