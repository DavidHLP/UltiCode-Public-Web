<script setup lang="ts">
import { computed } from 'vue'

import { BarChart } from '@/components/ui/chart-bar'

export interface OverviewChartPoint {
  label: string
  total: number
  accepted: number
}

const props = defineProps<{
  data: OverviewChartPoint[]
}>()

const categories = ['total', 'accepted']
const indexField = 'label'

const hasData = computed(() =>
  props.data.some((point) =>
    categories.some((category) => Number(point?.[category] ?? 0) > 0)
  )
)
</script>

<template>
  <div class="w-full">
    <div
      v-if="!hasData"
      class="flex h-[320px] items-center justify-center rounded-md border border-dashed border-muted-foreground/40 text-sm text-muted-foreground"
    >
      暂无提交数据
    </div>
    <BarChart
      v-else
      :data="data"
      :categories="categories"
      :index="indexField"
      :rounded-corners="4"
      class="h-[360px]"
    />
  </div>
</template>
