import { defineStore } from "pinia";
import { ref } from "vue";

export interface HeaderModel {
  id: number;
  index: number;
  title: string;
  icon: string;
  color?: string;
  bgColor?: string;
  iconColor?: string;
}

export interface HeaderGroup {
  id: string;
  name: string;
  headers: HeaderModel[];
}

export const useHeaderStore = defineStore("header", () => {
  // 动态菜单组列表
  const headerGroups = ref<HeaderGroup[]>([
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
  ]);

  // 更新指定组的 headers
  const updateGroupHeaders = (groupId: string, newHeaders: HeaderModel[]) => {
    const group = headerGroups.value.find((g) => g.id === groupId);
    if (group) {
      group.headers = newHeaders.map((header, idx) => ({
        ...header,
        index: idx,
      }));
    }
  };

  return {
    headerGroups,
    updateGroupHeaders,
  };
});
