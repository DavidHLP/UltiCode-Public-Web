<script setup lang="ts">
import type { ContestInsight } from '@/mocks/schema/contest'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const props = defineProps<{
  insights: ContestInsight[]
}>()
</script>

<template>
  <Card class="bg-card/80 backdrop-blur">
    <CardHeader>
      <CardTitle>Signal monitor</CardTitle>
      <CardDescription>Telemetry powering the contest health feed</CardDescription>
    </CardHeader>
    <CardContent class="space-y-4">
      <div
        v-for="insight in props.insights"
        :key="insight.id + '-signal'"
        class="rounded-xl border border-border/60 p-3"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs uppercase tracking-[0.35em] text-muted-foreground">
              {{ insight.label }}
            </p>
            <p class="text-2xl font-semibold">{{ insight.value }}</p>
          </div>
          <div class="text-right text-sm">
            <p :class="insight.trend === 'down' ? 'text-rose-400' : 'text-emerald-400'">
              {{ insight.delta }}
            </p>
            <p class="text-xs text-muted-foreground">{{ insight.helper }}</p>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
</template>
