<script setup lang="ts">
import { computed, ref, onMounted, watch, nextTick } from "vue";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import MarkdownView from "@/components/markdown/MarkdownView.vue";
import type { SubmissionRecord } from "@/mocks/schema/submission";
import { Clock, Microchip, Sparkles } from "lucide-vue-next";
import * as echarts from "echarts";
import type { ECharts } from "echarts";

interface TooltipCallbackDataParams {
  dataIndex: number;
  value: number;
  [key: string]: unknown;
}

const props = defineProps<{
  submission: SubmissionRecord;
}>();

const parseMs = (value: string) => {
  const m = /([0-9]+)\s*ms/.exec(value);
  return m ? Number(m[1]) : null;
};

const runtimeMs = computed(() => parseMs(props.submission.runtime));
const distBins = computed<number[]>(
  () => props.submission.runtimeDistBinsMs ?? [],
);
const distCounts = computed<number[]>(() => props.submission.runtimeDist ?? []);
const distLength = computed(() =>
  Math.min(distCounts.value.length, distBins.value.length),
);
const pairedDist = computed(() =>
  Array.from({ length: distLength.value }, (_, i) => ({
    i,
    count: distCounts.value[i]!,
    bin: distBins.value[i]!,
  })),
);
const totalCount = computed(() =>
  pairedDist.value.reduce(
    (acc, d) => acc + (Number.isFinite(d.count) ? d.count : 0),
    0,
  ),
);

const highlightIndex = computed(() => {
  const bins = distBins.value;
  const val = runtimeMs.value;
  if (!Array.isArray(bins) || bins.length === 0 || val == null) return -1;
  const v = val as number;
  let closest = 0;
  let best = Math.abs((bins[0] ?? v) - v);
  for (let i = 1; i < bins.length; i++) {
    const bi = bins[i] ?? v;
    const d = Math.abs(bi - v);
    if (d < best) {
      best = d;
      closest = i;
    }
  }
  return closest;
});

const activeChart = ref<'runtime' | 'memory'>('runtime');

const showRuntimeDetail = computed(() => activeChart.value === 'runtime');
const showMemoryDetail = computed(() => activeChart.value === 'memory');

const runtimeChartRef = ref<HTMLDivElement>();
const memoryChartRef = ref<HTMLDivElement>();
let runtimeChart: ECharts | null = null;
let memoryChart: ECharts | null = null;

const initRuntimeChart = () => {
  if (!runtimeChartRef.value) return;
  
  if (runtimeChart) {
    runtimeChart.dispose();
  }
  
  runtimeChart = echarts.init(runtimeChartRef.value);
  
  const userIndex = highlightIndex.value;
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: (params: unknown) => {
        const dataArray = params as TooltipCallbackDataParams[];
        const data = dataArray[0];
        if (!data) return '';
        const bin = distBins.value[data.dataIndex];
        const count = distCounts.value[data.dataIndex] ?? 0;
        const total = totalCount.value;
        const percentage = total ? ((count / total) * 100).toFixed(2) : '0';
        const isUserPosition = data.dataIndex === userIndex;
        return `${bin}ms<br/>数量: ${count}<br/>占比: ${percentage}%${isUserPosition ? '<br/><span style="color: hsl(var(--chart-series-1));">您的位置</span>' : ''}`;
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: distBins.value.map(bin => `${bin}ms`),
      axisLabel: {
        interval: Math.ceil(distBins.value.length / 8),
        rotate: 0,
        fontSize: 10
      },
      axisLine: {
        lineStyle: {
          color: 'hsl(var(--border))'
        }
      }
    },
    yAxis: {
      type: 'value',
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      splitLine: {
        lineStyle: {
          color: 'hsl(var(--border))'
        }
      },
      axisLabel: {
        fontSize: 10,
        color: 'hsl(var(--muted-foreground))'
      }
    },
    series: [
      {
        type: 'bar',
        data: pairedDist.value.map((d, i) => ({
          value: d.count,
          itemStyle: {
            color: i === userIndex
              ? 'hsl(var(--chart-series-1))' 
              : 'hsl(var(--muted-foreground) / 0.3)',
            borderRadius: [4, 4, 0, 0]
          }
        })),
        barMaxWidth: 40,
        markPoint: userIndex >= 0 ? {
          data: [
            {
              coord: [userIndex, pairedDist.value[userIndex]?.count ?? 0],
              symbol: 'pin',
              symbolSize: 50,
              itemStyle: {
                color: 'hsl(var(--chart-series-1))'
              },
              label: {
                show: true,
                position: 'top',
                fontSize: 11,
                fontWeight: 'bold',
                color: 'hsl(var(--chart-series-1))'
              }
            }
          ]
        } : undefined,
      }
    ]
  };
  
  runtimeChart.setOption(option);
};

const initMemoryChart = () => {
  if (!memoryChartRef.value) return;
  
  if (memoryChart) {
    memoryChart.dispose();
  }
  
  memoryChart = echarts.init(memoryChartRef.value);
  
  // 模拟内存分布数据
  const memoryBins = Array.from({ length: 80 }, (_, i) => {
    const baseMemory = 43.42;
    const step = 0.048;
    return (baseMemory + i * step).toFixed(3);
  });
  
  const memoryCounts = Array.from({ length: 80 }, () => Math.floor(Math.random() * 100));
  const userMemoryIndex = 40; // 用户位置索引
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: (params: unknown) => {
        const dataArray = params as TooltipCallbackDataParams[];
        const data = dataArray[0];
        if (!data) return '';
        const isUserPosition = data.dataIndex === userMemoryIndex;
        return `${memoryBins[data.dataIndex]}MB<br/>数量: ${data.value}${isUserPosition ? '<br/><span style="color: hsl(var(--chart-series-1));">您的位置</span>' : ''}`;
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: memoryBins,
      axisLabel: {
        interval: Math.ceil(memoryBins.length / 8),
        rotate: 0,
        fontSize: 10,
        formatter: (value: string) => `${value}mb`
      },
      axisLine: {
        lineStyle: {
          color: 'hsl(var(--border))'
        }
      }
    },
    yAxis: {
      type: 'value',
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      splitLine: {
        lineStyle: {
          color: 'hsl(var(--border))'
        }
      },
      axisLabel: {
        fontSize: 10,
        color: 'hsl(var(--muted-foreground))'
      }
    },
    series: [
      {
        type: 'bar',
        data: memoryCounts.map((count, i) => ({
          value: count,
          itemStyle: {
            color: i === userMemoryIndex
              ? 'hsl(var(--chart-series-1))' 
              : 'hsl(var(--muted-foreground) / 0.3)',
            borderRadius: [4, 4, 0, 0]
          }
        })),
        barMaxWidth: 40,
        markPoint: {
          data: [
            {
              coord: [userMemoryIndex, memoryCounts[userMemoryIndex] ?? 0],
              symbol: 'pin',
              symbolSize: 50,
              itemStyle: {
                color: 'hsl(var(--chart-series-1))'
              },
              label: {
                show: true,
                position: 'top',
                fontSize: 11,
                fontWeight: 'bold',
                color: 'hsl(var(--chart-series-1))'
              }
            }
          ]
        },
      }
    ]
  };
  
  memoryChart.setOption(option);
};

onMounted(() => {
  if (showRuntimeDetail.value) {
    nextTick(() => initRuntimeChart());
  }
  if (showMemoryDetail.value) {
    nextTick(() => initMemoryChart());
  }
});

watch(activeChart, (newVal) => {
  if (newVal === 'runtime') {
    nextTick(() => initRuntimeChart());
  } else if (newVal === 'memory') {
    nextTick(() => initMemoryChart());
  }
});

const toggleRuntimeChart = () => {
  activeChart.value = 'runtime';
};

const toggleMemoryChart = () => {
  activeChart.value = 'memory';
};

const codeMarkdown = computed(() => {
  const lang = props.submission.language.toLowerCase();
  const code = props.submission.code;
  return `\`\`\`${lang}\n${code}\n\`\`\``;
});
</script>

<template>
  <div class="mx-auto flex w-full max-w-[700px] flex-col gap-4 px-4 py-3">
    <!-- 顶部状态栏 -->
    <div class="flex w-full items-center justify-between gap-4">
      <div class="flex flex-1 flex-col items-start gap-1 overflow-hidden">
        <div class="flex flex-1 items-center gap-2 text-[16px] font-medium leading-6"
          :class="[
            submission.status === 'Accepted' 
              ? 'text-green-600 dark:text-green-400'
              : 'text-red-600 dark:text-red-400'
          ]">
          <span data-e2e-locator="submission-result">{{ submission.status }}</span>
          <div class="text-xs font-normal text-muted-foreground">
            <span>{{ submission.tests?.filter(t => t.status === 'Accepted').length ?? 0 }} / {{ submission.tests?.length ?? 0 }} </span>个通过的测试用例
          </div>
        </div>
        <div class="flex max-w-full flex-1 items-center gap-1 overflow-hidden text-xs">
          <Avatar class="h-4 w-4 flex-none cursor-pointer">
            <AvatarImage src="https://assets.leetcode.cn/aliyun-lc-upload/default_avatar.png" alt="User" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          <div class="truncate max-w-full font-medium text-foreground">用户</div>
          <span class="text-muted-foreground flex-none whitespace-nowrap">
            提交于&nbsp;<span class="max-w-full truncate">{{ new Date(submission.submittedAt).toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) }}</span>
          </span>
        </div>
      </div>
      <div class="flex flex-none gap-2">
        <Button variant="secondary" size="sm" class="h-8 gap-2">
          官方题解
        </Button>
        <Button 
          variant="default" 
          size="sm" 
          class="h-8 gap-2 bg-green-600 hover:bg-green-700 text-white"
        >
          写题解
        </Button>
      </div>
    </div>

    <!-- 分布统计卡片 -->
    <div class="flex w-full flex-col gap-2 rounded-lg border border-border p-3">
      <div class="flex items-center justify-between gap-2">
        <div class="flex w-full flex-wrap gap-3">
          <!-- 执行用时分布 -->
          <div 
            class="rounded-md group flex min-w-[275px] flex-1 cursor-pointer flex-col px-4 py-3 text-xs transition hover:opacity-100"
            :class="showRuntimeDetail ? 'bg-accent' : 'opacity-40'"
            @click="toggleRuntimeChart"
          >
            <div class="flex justify-between gap-2">
              <div class="flex items-center gap-1 text-foreground">
                <Clock class="h-3 w-3" />
                <div class="flex-1 text-sm">执行用时分布</div>
              </div>
            </div>
            <div class="mt-2 flex items-center gap-1">
              <span class="text-foreground text-lg font-semibold">{{ submission.runtime.replace(' ms', '') }}</span>
              <span class="text-muted-foreground text-sm">ms</span>
              <div class="w-px h-3 bg-border mx-1"></div>
              <span class="text-muted-foreground capitalize">击败</span>
              <span class="text-foreground text-lg font-semibold">{{ submission.runtimePercentile }}%</span>
            </div>
            <div class="mt-1 flex w-fit cursor-pointer gap-1 text-xs opacity-0 group-hover:opacity-100">
              <Sparkles class="h-4 w-4 text-blue-500" />
              <span class="bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">复杂度分析</span>
            </div>
          </div>
          
          <!-- 消耗内存分布 -->
          <div 
            class="rounded-md group flex min-w-[275px] flex-1 cursor-pointer flex-col px-4 py-3 text-xs transition hover:opacity-100"
            :class="showMemoryDetail ? 'bg-accent' : 'opacity-40'"
            @click="toggleMemoryChart"
          >
            <div class="flex justify-between gap-2">
              <div class="flex items-center gap-1 text-foreground">
                <Microchip class="h-3 w-3" />
                <div class="flex-1 text-sm">消耗内存分布</div>
              </div>
            </div>
            <div class="mt-2 flex items-center gap-1">
              <span class="text-foreground text-lg font-semibold">{{ submission.memory.replace(' MB', '') }}</span>
              <span class="text-muted-foreground text-sm">MB</span>
              <div class="w-px h-3 bg-border mx-1"></div>
              <span class="text-muted-foreground capitalize">击败</span>
              <span class="text-foreground text-lg font-semibold">{{ submission.memoryPercentile }}%</span>
            </div>
            <div class="mt-1 flex w-fit cursor-pointer gap-1 text-xs opacity-0 group-hover:opacity-100">
              <Sparkles class="h-4 w-4 text-blue-500" />
              <span class="bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">复杂度分析</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 执行用时详细图表 -->
    <div v-if="showRuntimeDetail" class="rounded-lg border border-border p-4">
      <div class="space-y-3">
        <h3 class="text-sm font-medium text-foreground">执行用时分布详情</h3>
        <template v-if="pairedDist.length">
          <div ref="runtimeChartRef" class="w-full h-60"></div>
        </template>
        <div v-else class="h-40 flex items-center justify-center text-xs text-muted-foreground">
          暂无分布数据
        </div>
      </div>
    </div>

    <!-- 消耗内存详细图表 -->
    <div v-if="showMemoryDetail" class="rounded-lg border border-border p-4">
      <div class="space-y-3">
        <h3 class="text-sm font-medium text-foreground">消耗内存分布详情</h3>
        <div ref="memoryChartRef" class="w-full h-60"></div>
      </div>
    </div>

    <!-- 代码展示 -->
    <MarkdownView :content="codeMarkdown" editor-id="submission-code-preview" />
  </div>
</template>
