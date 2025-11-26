<script setup lang="ts">
import { onMounted } from "vue";
import { useHeaderStore, type HeaderGroup, type LayoutNode } from "@/stores/headerStore";
import { storeToRefs } from "pinia";
import DynamicLayout from "./components/layout/DynamicLayout.vue";
import { Button } from "@/components/ui/button";

const headerStore = useHeaderStore();
const { layoutConfig } = storeToRefs(headerStore);
const { updateLayout } = headerStore;

// 定义页面结构元数据
const initialHeaderGroups: HeaderGroup[] = [
  {
    id: "main-menu",
    name: "主菜单",
    headers: [
      { id: 1, index: 0, title: "首页", icon: "Home" },
      { id: 2, index: 1, title: "设置", icon: "Settings" },
    ],
  },
  {
    id: "user-menu",
    name: "用户菜单",
    headers: [
      { id: 4, index: 0, title: "个人中心", icon: "User" },
      { id: 3, index: 1, title: "系统配置", icon: "Settings" },
    ],
  },
  {
    id: "tools-menu",
    name: "工具菜单",
    headers: [
      { id: 5, index: 0, title: "数据分析", icon: "BarChart" },
      { id: 6, index: 1, title: "报表", icon: "FileText" },
    ],
  },
  {
    id: "analysis-menu",
    name: "分析菜单",
    headers: [
      { id: 7, index: 0, title: "统计", icon: "TrendingUp" },
      { id: 8, index: 1, title: "图表", icon: "PieChart" },
    ],
  },
  {
    id: "extra-menu",
    name: "额外菜单",
    headers: [
      { id: 9, index: 0, title: "帮助", icon: "HelpCircle" },
      { id: 10, index: 1, title: "关于", icon: "Info" },
    ],
  },
];

// 布局1: Leet布局 (左1 + 右(上2 + 下1))
const leetLayout: LayoutNode = {
  id: 'leet-root',
  type: 'container',
  direction: 'horizontal',
  children: [
    {
      id: 'leet-left',
      type: 'leaf',
      size: 40,
      groupId: 'main-menu'
    },
    {
      id: 'leet-right',
      type: 'container',
      direction: 'vertical',
      size: 60,
      children: [
        {
          id: 'leet-right-top',
          type: 'container',
          direction: 'horizontal',
          size: 50,
          children: [
            {
              id: 'leet-user',
              type: 'leaf',
              size: 50,
              groupId: 'user-menu'
            },
            {
              id: 'leet-tools',
              type: 'leaf',
              size: 50,
              groupId: 'tools-menu'
            }
          ]
        },
        {
          id: 'leet-right-bottom',
          type: 'leaf',
          size: 50,
          groupId: 'analysis-menu'
        }
      ]
    }
  ]
};

// 布局2: 预设布局 (简单左右分栏)
const presetLayout: LayoutNode = {
  id: 'preset-root',
  type: 'container',
  direction: 'horizontal',
  children: [
    {
      id: 'preset-left',
      type: 'leaf',
      size: 30,
      groupId: 'main-menu'
    },
    {
      id: 'preset-right',
      type: 'container',
      direction: 'vertical',
      size: 70,
      children: [
        {
          id: 'preset-right-top',
          type: 'leaf',
          size: 60,
          groupId: 'user-menu'
        },
        {
          id: 'preset-right-bottom',
          type: 'leaf',
          size: 40,
          groupId: 'extra-menu'
        }
      ]
    }
  ]
};

// 初始化数据
onMounted(() => {
  headerStore.initData(initialHeaderGroups, leetLayout);
});
</script>

<template>
  <div class="h-screen w-full flex flex-col">
    <!-- 布局切换控制栏 -->
    <div class="flex gap-2 p-4 border-b bg-gray-50">
      <Button variant="outline" @click="updateLayout(leetLayout)">
        Leet布局
      </Button>
      <Button variant="outline" @click="updateLayout(presetLayout)">
        预设布局
      </Button>
    </div>

    <!-- 动态布局区域 -->
    <div class="flex-1 overflow-hidden">
      <DynamicLayout v-if="layoutConfig" :layout="layoutConfig" />
    </div>
  </div>
</template>
