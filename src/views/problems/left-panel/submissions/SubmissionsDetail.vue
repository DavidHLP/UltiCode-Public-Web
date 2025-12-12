<script setup lang="ts">
import { computed, ref, onMounted, watch, nextTick } from "vue";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import MarkdownView from "@/components/markdown/MarkdownView.vue";
import type { SubmissionRecord } from "@/types/submission";
import { Clock, Microchip, Sparkles } from "lucide-vue-next";
import * as echarts from "echarts";
import type { ECharts } from "echarts";

interface TooltipCallbackDataParams {
  dataIndex: number;
  value: number;
  [key: string]: unknown;
}

const props = defineProps({
  submission: {
    type: Object as () => SubmissionRecord,
  } as const,
});

const parseMs = (value: string | number) => {
  if (typeof value === "number") return value;
  const m = /([0-9]+)\s*ms/.exec(value);
  return m ? Number(m[1]) : null;
};

const runtimeMs = computed(() =>
  props.submission ? parseMs(props.submission.runtime) : null,
);

const distBins = computed<number[]>(
  () => props.submission?.runtimeDistBinsMs?.map((b) => b.min) ?? [],
);
const distCounts = computed<number[]>(
  () => props.submission?.runtimeDistBinsMs?.map((b) => b.count) ?? [],
);
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

const activeChart = ref<"runtime" | "memory">("runtime");

const showRuntimeDetail = computed(() => activeChart.value === "runtime");
const showMemoryDetail = computed(() => activeChart.value === "memory");

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
  const userAvatar =
    "https://assets.leetcode.cn/aliyun-lc-upload/default_avatar.png";

  // 创建圆形头像 Image 对象
  const avatarImg = new Image();
  avatarImg.crossOrigin = "anonymous";
  avatarImg.src = userAvatar;

  const option = {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
      formatter: (params: unknown) => {
        const dataArray = params as TooltipCallbackDataParams[];
        const data = dataArray[0];
        if (!data) return "";
        const bin = distBins.value[data.dataIndex];
        const count = distCounts.value[data.dataIndex] ?? 0;
        const total = totalCount.value;
        const percentage = total ? ((count / total) * 100).toFixed(2) : "0";
        const isUserPosition = data.dataIndex === userIndex;
        return `${bin}ms<br/>Count: ${count}<br/>Percentage: ${percentage}%${isUserPosition ? '<br/><span style="color: hsl(var(--chart-series-1));">Your Position</span>' : ""}`;
      },
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "15%",
      top: "15%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: distBins.value.map((bin) => `${bin}ms`),
      axisLabel: {
        interval: Math.ceil(distBins.value.length / 8),
        rotate: 0,
        fontSize: 10,
      },
      axisLine: {
        lineStyle: {
          color: "hsl(var(--border))",
        },
      },
    },
    yAxis: {
      type: "value",
      axisLine: {
        show: false,
      },
      axisTick: {
        show: false,
      },
      splitLine: {
        lineStyle: {
          color: "hsl(var(--border))",
        },
      },
      axisLabel: {
        fontSize: 10,
        color: "hsl(var(--muted-foreground))",
      },
    },
    series: [
      {
        type: "bar",
        data: pairedDist.value.map((d, i) => ({
          value: d.count,
          itemStyle: {
            color:
              i === userIndex
                ? "hsl(var(--chart-series-1))"
                : "hsl(var(--muted-foreground) / 0.3)",
            borderRadius: [4, 4, 0, 0],
          },
        })),
        barMaxWidth: 40,
      },
    ],
  };

  runtimeChart.setOption(option);

  // 图表渲染完成后添加圆形头像
  if (userIndex >= 0) {
    avatarImg.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const size = 28;
      canvas.width = size;
      canvas.height = size;

      // 绘制圆形裁剪路径
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();

      // 绘制头像
      ctx.drawImage(avatarImg, 0, 0, size, size);

      // 添加边框
      ctx.restore();
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2 - 1, 0, Math.PI * 2);
      ctx.strokeStyle = "hsl(var(--chart-series-1))";
      ctx.lineWidth = 2;
      ctx.stroke();

      const circularAvatar = canvas.toDataURL();

      // 使用圆形头像更新图表
      runtimeChart?.setOption({
        series: [
          {
            markPoint: {
              data: [
                {
                  coord: [userIndex, pairedDist.value[userIndex]?.count ?? 0],
                  symbol: "image://" + circularAvatar,
                  symbolSize: 32,
                  symbolOffset: [0, -20],
                },
              ],
            },
          },
        ],
      });
    };
  }
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

  const memoryCounts = Array.from({ length: 80 }, () =>
    Math.floor(Math.random() * 100),
  );
  const userMemoryIndex = 40; // 用户位置索引
  const userAvatar =
    "https://assets.leetcode.cn/aliyun-lc-upload/default_avatar.png";

  // 创建圆形头像 Image 对象
  const avatarImg = new Image();
  avatarImg.crossOrigin = "anonymous";
  avatarImg.src = userAvatar;

  const option = {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
      formatter: (params: unknown) => {
        const dataArray = params as TooltipCallbackDataParams[];
        const data = dataArray[0];
        if (!data) return "";
        const isUserPosition = data.dataIndex === userMemoryIndex;
        return `${memoryBins[data.dataIndex]}MB<br/>Count: ${data.value}${isUserPosition ? '<br/><span style="color: hsl(var(--chart-series-1));">Your Position</span>' : ""}`;
      },
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "15%",
      top: "15%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: memoryBins,
      axisLabel: {
        interval: Math.ceil(memoryBins.length / 8),
        rotate: 0,
        fontSize: 10,
        formatter: (value: string) => `${value}mb`,
      },
      axisLine: {
        lineStyle: {
          color: "hsl(var(--border))",
        },
      },
    },
    yAxis: {
      type: "value",
      axisLine: {
        show: false,
      },
      axisTick: {
        show: false,
      },
      splitLine: {
        lineStyle: {
          color: "hsl(var(--border))",
        },
      },
      axisLabel: {
        fontSize: 10,
        color: "hsl(var(--muted-foreground))",
      },
    },
    series: [
      {
        type: "bar",
        data: memoryCounts.map((count, i) => ({
          value: count,
          itemStyle: {
            color:
              i === userMemoryIndex
                ? "hsl(var(--chart-series-1))"
                : "hsl(var(--muted-foreground) / 0.3)",
            borderRadius: [4, 4, 0, 0],
          },
        })),
        barMaxWidth: 40,
      },
    ],
  };

  memoryChart.setOption(option);

  // 图表渲染完成后添加圆形头像
  avatarImg.onload = () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = 28;
    canvas.width = size;
    canvas.height = size;

    // 绘制圆形裁剪路径
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    // 绘制头像
    ctx.drawImage(avatarImg, 0, 0, size, size);

    // 添加边框
    ctx.restore();
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2 - 1, 0, Math.PI * 2);
    ctx.strokeStyle = "hsl(var(--chart-series-1))";
    ctx.lineWidth = 2;
    ctx.stroke();

    const circularAvatar = canvas.toDataURL();

    // 使用圆形头像更新图表
    memoryChart?.setOption({
      series: [
        {
          markPoint: {
            data: [
              {
                coord: [userMemoryIndex, memoryCounts[userMemoryIndex] ?? 0],
                symbol: "image://" + circularAvatar,
                symbolSize: 32,
                symbolOffset: [0, -20],
              },
            ],
          },
        },
      ],
    });
  };
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
  if (newVal === "runtime") {
    nextTick(() => initRuntimeChart());
  } else if (newVal === "memory") {
    nextTick(() => initMemoryChart());
  }
});

const toggleRuntimeChart = () => {
  activeChart.value = "runtime";
};

const toggleMemoryChart = () => {
  activeChart.value = "memory";
};

const codeMarkdown = computed(() => {
  if (!props.submission) return "";
  const lang = props.submission.language.toLowerCase();
  const code = props.submission.code;
  return "```" + lang + "\n" + code + "\n" + "```";
});
</script>

<template>
  <div
    v-if="props.submission"
    class="mx-auto flex w-full max-w-[700px] flex-col gap-3 px-3 py-2"
  >
    <!-- 顶部状态栏 -->
    <div class="flex w-full items-center justify-between gap-3">
      <div class="flex flex-1 flex-col items-start gap-0.5 overflow-hidden">
        <div
          class="flex flex-1 items-center gap-1.5 text-sm font-medium leading-5"
          :class="[
            props.submission.status === 'Accepted'
              ? 'text-green-600 dark:text-green-400'
              : 'text-red-600 dark:text-red-400',
          ]"
        >
          <span data-e2e-locator="submission-result">{{
            props.submission.status
          }}</span>
          <div class="text-[11px] font-normal text-muted-foreground">
            <span
              >{{
                props.submission.tests?.filter((t) => t.status === "Accepted")
                  .length ?? 0
              }}
              / {{ props.submission.tests?.length ?? 0 }} </span
            >test cases passed
          </div>
        </div>
        <div
          class="flex max-w-full flex-1 items-center gap-1 overflow-hidden text-[11px]"
        >
          <Avatar class="h-3.5 w-3.5 flex-none cursor-pointer">
            <AvatarImage
              src="https://assets.leetcode.cn/aliyun-lc-upload/default_avatar.png"
              alt="User"
            />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          <div class="truncate max-w-full font-medium text-foreground">
            User
          </div>
          <span class="text-muted-foreground flex-none whitespace-nowrap">
            Submitted&nbsp;<span class="max-w-full truncate">{{
              new Date(
                props.submission.submittedAt ?? props.submission.created_at,
              ).toLocaleString("en-US", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              })
            }}</span>
          </span>
        </div>
      </div>
      <div class="flex flex-none gap-1.5">
        <Button variant="secondary" size="sm" class="h-7 gap-1.5 text-xs">
          Official Solution
        </Button>
        <Button
          variant="default"
          size="sm"
          class="h-7 gap-1.5 bg-green-600 hover:bg-green-700 text-xs text-white"
        >
          Write Solution
        </Button>
      </div>
    </div>

    <!-- 分布统计卡片 -->
    <div
      class="flex w-full flex-col gap-1.5 rounded-lg border border-border p-2"
    >
      <div class="flex items-center justify-between gap-1.5">
        <div class="flex w-full flex-wrap gap-2">
          <!-- 执行用时分布 -->
          <div
            class="rounded-md group flex min-w-[240px] flex-1 cursor-pointer flex-col px-3 py-2 text-xs transition hover:opacity-100"
            :class="showRuntimeDetail ? 'bg-accent' : 'opacity-40'"
            @click="toggleRuntimeChart"
          >
            <div class="flex justify-between gap-1.5">
              <div class="flex items-center gap-1 text-foreground">
                <Clock class="h-3 w-3" />
                <div class="flex-1 text-xs">Runtime Distribution</div>
              </div>
            </div>
            <div class="mt-1.5 flex items-center gap-1">
              <span class="font-medium text-foreground">
                {{ props.submission.runtime.toString().replace("ms", "") }} ms
              </span>
              <span class="text-muted-foreground">
                Beats
                {{ (props.submission.runtimePercentile ?? 0).toFixed(1) }}%
              </span>
            </div>
            <div
              class="mt-0.5 flex w-fit cursor-pointer gap-0.5 text-[11px] opacity-0 group-hover:opacity-100"
            >
              <Sparkles class="h-3.5 w-3.5 text-blue-500" />
              <span
                class="bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent"
                >Complexity Analysis</span
              >
            </div>
          </div>

          <!-- 消耗内存分布 -->
          <div
            class="rounded-md group flex min-w-[240px] flex-1 cursor-pointer flex-col px-3 py-2 text-xs transition hover:opacity-100"
            :class="showMemoryDetail ? 'bg-accent' : 'opacity-40'"
            @click="toggleMemoryChart"
          >
            <div class="flex justify-between gap-1.5">
              <div class="flex items-center gap-1 text-foreground">
                <Microchip class="h-3 w-3" />
                <div class="flex-1 text-xs">Memory Distribution</div>
              </div>
            </div>
            <div class="mt-1.5 flex items-center gap-1">
              <span class="font-medium text-foreground">
                {{ props.submission.memory.toString().replace("MB", "") }} MB
              </span>
              <span class="text-muted-foreground">
                Beats {{ (props.submission.memoryPercentile ?? 0).toFixed(1) }}%
              </span>
            </div>
            <div
              class="mt-0.5 flex w-fit cursor-pointer gap-0.5 text-[11px] opacity-0 group-hover:opacity-100"
            >
              <Sparkles class="h-3.5 w-3.5 text-blue-500" />
              <span
                class="bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent"
                >Complexity Analysis</span
              >
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 执行用时详细图表 -->
    <div v-if="showRuntimeDetail" class="rounded-lg border border-border p-3">
      <div class="space-y-2">
        <h3 class="text-xs font-medium text-foreground">
          Runtime Distribution Details
        </h3>
        <template v-if="pairedDist.length">
          <div ref="runtimeChartRef" class="w-full h-48"></div>
        </template>
        <div
          v-else
          class="h-32 flex items-center justify-center text-[11px] text-muted-foreground"
        >
          No distribution data available
        </div>
      </div>
    </div>

    <!-- 消耗内存详细图表 -->
    <div v-if="showMemoryDetail" class="rounded-lg border border-border p-3">
      <div class="space-y-2">
        <h3 class="text-xs font-medium text-foreground">
          Memory Distribution Details
        </h3>
        <div ref="memoryChartRef" class="w-full h-48"></div>
      </div>
    </div>

    <!-- 代码展示 -->
    <MarkdownView :content="codeMarkdown" editor-id="submission-code-preview" />
  </div>
</template>
