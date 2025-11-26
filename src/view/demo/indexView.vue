<script setup lang="ts">
import { onMounted } from "vue";
import { useHeaderStore, type HeaderGroup } from "@/stores/headerStore";
import LayoutComponent from "./components/LayoutComponent.vue";

const headerStore = useHeaderStore();

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

// 初始化数据
onMounted(() => {
  headerStore.initData(initialHeaderGroups, 'preset');
});
</script>

<template>
  <LayoutComponent />
</template>