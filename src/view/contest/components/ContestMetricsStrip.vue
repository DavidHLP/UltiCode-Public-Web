<script setup lang="ts">
import type { ContestInsight } from '@/mocks/schema/contest'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const props = defineProps<{
  insights: ContestInsight[]
}>()
</script>

<template>
  <section class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
    <Card v-for="insight in props.insights" :key="insight.id">
      <CardHeader class="pb-2">
        <CardDescription>{{ insight.label }}</CardDescription>
        <CardTitle class="text-3xl font-semibold">{{ insight.value }}</CardTitle>
      </CardHeader>
      <CardContent class="flex items-center justify-between text-sm text-muted-foreground">
        <span>{{ insight.helper }}</span>
        <span
          :class="
            insight.trend === 'up'
              ? 'text-emerald-500'
              : insight.trend === 'down'
                ? 'text-rose-500'
                : 'text-muted-foreground'
          "
        >
          {{ insight.delta }}
        </span>
      </CardContent>
    </Card>
  </section>
</template>
