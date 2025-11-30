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
  <div class="mx-auto w-full max-w-[60%] space-y-6 py-6">
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
          <Card class="transition-shadow hover:shadow-md">
            <CardContent class="flex items-center justify-center p-8 h-36">
              <span class="text-4xl font-semibold">{{ index + 1 }}</span>
            </CardContent>
          </Card>
        </CarouselItem>
      </CarouselContent>
      <CarouselPrevious class="left-0" />
      <CarouselNext class="right-0" />
    </Carousel>
    <ProblemExplorer />
  </div>
</template>
