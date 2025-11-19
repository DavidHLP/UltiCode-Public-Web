<script setup lang="ts">
import ProblemView from '@/view/problems/components/ProblemView.vue'
import { Card, CardContent } from '@/components/ui/card'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
</script>

<template>
  <Carousel
    class="relative w-full"
    :opts="{
      align: 'start',
    }"
  >
    <CarouselContent>
      <CarouselItem
        v-for="(_, index) in 10"
        :key="index"
        class="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5"
      >
        <Card>
          <CardContent class="flex items-center justify-center p-6 h-32">
            <span class="text-3xl font-semibold">{{ index + 1 }}</span>
          </CardContent>
        </Card>
      </CarouselItem>
    </CarouselContent>
    <CarouselPrevious class="left-4" />
    <CarouselNext class="right-4" />
  </Carousel>
  <ProblemView />
</template>
