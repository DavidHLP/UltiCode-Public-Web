<script setup lang="ts">
import type { ContestInsight } from '@/mocks/schema/contest'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, ArrowUpRight } from 'lucide-vue-next'
import { cn } from '@/lib/utils'

const props = defineProps<{
  insights: ContestInsight[]
}>()
</script>

<template>
  <Card class="bg-card/70 backdrop-blur">
    <CardHeader>
      <CardTitle>Contest health</CardTitle>
      <CardDescription>Realtime signal across all ladders</CardDescription>
    </CardHeader>
    <CardContent class="space-y-6">
      <div
        v-for="insight in props.insights"
        :key="insight.id"
        class="flex items-center justify-between rounded-lg border border-border/60 p-4"
      >
        <div>
          <p class="text-sm text-muted-foreground">{{ insight.label }}</p>
          <p class="text-2xl font-semibold tracking-tight">{{ insight.value }}</p>
          <p class="text-xs text-muted-foreground">{{ insight.helper }}</p>
        </div>
        <div
          :class="
            cn(
              'flex flex-col items-end rounded-md px-2 py-1 text-xs font-semibold',
              insight.trend === 'up' && 'bg-emerald-500/10 text-emerald-500',
              insight.trend === 'down' && 'bg-rose-500/10 text-rose-500',
              insight.trend === 'steady' && 'bg-muted text-muted-foreground',
            )
          "
        >
          <span>{{ insight.delta }}</span>
          <TrendingUp v-if="insight.trend === 'up'" class="h-3.5 w-3.5" />
          <ArrowUpRight v-else-if="insight.trend === 'steady'" class="h-3.5 w-3.5 rotate-45" />
          <TrendingUp v-else class="h-3.5 w-3.5 rotate-180" />
        </div>
      </div>
    </CardContent>
  </Card>
</template>
