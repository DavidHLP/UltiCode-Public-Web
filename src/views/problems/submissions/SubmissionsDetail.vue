<script setup lang="ts">
import { computed, ref, onMounted, watch, nextTick } from "vue";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import MarkdownView from "@/components/markdown/MarkdownView.vue";
import type { SubmissionRecord } from "@/types/submission";
import { Clock, Microchip } from "lucide-vue-next";
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
  props.submission ? parseMs(props.submission.runtime) : null
);

const distBins = computed<number[]>(
  () => props.submission?.runtimeDistBinsMs?.map((b) => b.min) ?? []
);
const distCounts = computed<number[]>(
  () => props.submission?.runtimeDistBinsMs?.map((b) => b.count) ?? []
);
const distLength = computed(() =>
  Math.min(distCounts.value.length, distBins.value.length)
);
const pairedDist = computed(() =>
  Array.from({ length: distLength.value }, (_, i) => ({
    i,
    count: distCounts.value[i]!,
    bin: distBins.value[i]!,
  }))
);
const totalCount = computed(() =>
  pairedDist.value.reduce(
    (acc, d) => acc + (Number.isFinite(d.count) ? d.count : 0),
    0
  )
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
  // Determine avatar URL: use dynamic user avatar or fallback to default
  const userAvatar =
    props.submission?.user?.avatar ||
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
    Math.floor(Math.random() * 100)
  );
  const userMemoryIndex = 40; // 用户位置索引
  const userAvatar =
    props.submission?.user?.avatar ||
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

import { useRouter } from "vue-router";
const router = useRouter();

const handleWriteSolution = () => {
  if (props.submission?.id) {
    router.push({
      name: "solution-create-from-submission",
      query: { submissionId: props.submission.id },
    });
  }
};
</script>

<template>
  <div
    v-if="props.submission"
    class="mx-auto flex w-full max-w-[700px] flex-col gap-4 px-3 py-2"
  >
    <!-- Header -->
    <div class="flex w-full items-center justify-between gap-3">
      <div class="flex flex-1 flex-col items-start gap-0.5 overflow-hidden">
        <div
          class="flex flex-1 items-center gap-1.5 text-lg font-medium leading-tight"
          :class="[
            props.submission?.status === 'Accepted'
              ? 'text-green-600 dark:text-green-400'
              : 'text-red-600 dark:text-red-400',
          ]"
        >
          <span data-e2e-locator="submission-result">{{
            props.submission?.status
          }}</span>
        </div>

        <!-- Test cases info (only if not compile error) -->
        <div
          v-if="props.submission.status !== 'Compile Error'"
          class="text-xs font-normal text-muted-foreground"
        >
          <span v-if="props.submission.status === 'Accepted'">
            All test cases passed
          </span>
          <span v-else>
            {{
              props.submission?.tests?.filter((t) => t.status === "Accepted")
                .length ?? 0
            }}
            / {{ props.submission?.tests?.length ?? 0 }} test cases passed
          </span>
        </div>

        <div class="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
          <div class="flex items-center gap-1">
            <Avatar class="h-4 w-4">
              <AvatarImage
                :src="
                  props.submission.user?.avatar ||
                  'https://assets.leetcode.cn/aliyun-lc-upload/default_avatar.png'
                "
              />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <span class="font-medium text-foreground">{{
              props.submission.user?.username || "User"
            }}</span>
            <span class="text-muted-foreground/60">submitted at</span>
            <span>{{
              new Date(
                props.submission.submittedAt ?? props.submission.created_at
              ).toLocaleString()
            }}</span>
          </div>
        </div>
      </div>

      <div class="flex flex-none gap-2">
        <Button
          v-if="props.submission?.status === 'Accepted'"
          variant="default"
          size="sm"
          class="h-7 text-xs bg-green-600 hover:bg-green-700 text-white"
          @click="handleWriteSolution"
        >
          Write Solution
        </Button>
      </div>
    </div>

    <!-- Content based on Status -->

    <!-- 1. Compile Error -->
    <div
      v-if="props.submission.status === 'Compile Error'"
      class="rounded-md bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 p-4"
    >
      <h3 class="font-medium text-red-700 dark:text-red-400 text-sm mb-2">
        Compile Error
      </h3>
      <pre
        class="whitespace-pre-wrap text-sm font-mono text-red-600 dark:text-red-300 bg-transparent p-0"
        >{{
          props.submission.compiler_error || "No error message available."
        }}</pre
      >
    </div>

    <!-- 2. Runtime Error / Wrong Answer / TLE -->
    <div
      v-else-if="
        ['Wrong Answer', 'Runtime Error', 'Time Limit Exceeded'].includes(
          props.submission.status
        )
      "
      class="space-y-4"
    >
      <div v-if="props.submission.input" class="space-y-1.5">
        <div class="text-xs font-medium text-muted-foreground">Input</div>
        <div
          class="rounded-md bg-muted px-3 py-2 text-sm font-mono text-foreground"
        >
          {{ props.submission.input }}
        </div>
      </div>

      <div v-if="props.submission.output" class="space-y-1.5">
        <div class="text-xs font-medium text-muted-foreground">Output</div>
        <div
          class="rounded-md bg-muted px-3 py-2 text-sm font-mono text-foreground"
        >
          {{ props.submission.output }}
        </div>
      </div>

      <div v-if="props.submission.expected_output" class="space-y-1.5">
        <div class="text-xs font-medium text-muted-foreground">Expected</div>
        <div
          class="rounded-md bg-muted px-3 py-2 text-sm font-mono text-foreground"
        >
          {{ props.submission.expected_output }}
        </div>
      </div>
    </div>

    <!-- 3. Accepted (Charts) -->
    <div v-else-if="props.submission.status === 'Accepted'" class="space-y-4">
      <!-- 分布统计卡片 -->
      <div
        class="flex w-full flex-col gap-1.5 rounded-lg border border-border p-2"
      >
        <div class="flex items-center justify-between gap-1.5">
          <div class="flex w-full flex-wrap gap-2">
            <!-- Runtime Trigger -->
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
                  {{ props.submission?.runtime.toString().replace("ms", "") }}
                  ms
                </span>
                <span class="text-muted-foreground">
                  Beats
                  {{ (props.submission?.runtimePercentile ?? 0).toFixed(1) }}%
                </span>
              </div>
            </div>

            <!-- Memory Trigger -->
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
                  {{ props.submission?.memory.toString().replace("MB", "") }} MB
                </span>
                <span class="text-muted-foreground">
                  Beats
                  {{ (props.submission?.memoryPercentile ?? 0).toFixed(1) }}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Charts -->
      <div v-if="showRuntimeDetail" class="rounded-lg border border-border p-3">
        <div class="h-48 w-full" ref="runtimeChartRef"></div>
      </div>
      <div v-if="showMemoryDetail" class="rounded-lg border border-border p-3">
        <div class="h-48 w-full" ref="memoryChartRef"></div>
      </div>
    </div>

    <!-- Code Section -->
    <div class="space-y-2 mt-2">
      <div class="text-xs font-medium text-muted-foreground">Code</div>
      <MarkdownView
        :content="codeMarkdown"
        editor-id="submission-code-preview"
      />
    </div>
  </div>
</template>
