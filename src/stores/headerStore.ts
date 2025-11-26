import { defineStore } from "pinia";
import { ref, computed } from "vue";

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

export type LayoutMode = 'preset' | 'leet';

export const useHeaderStore = defineStore("header", () => {
  const layoutMode = ref<LayoutMode>('preset');
  const activeGroupId = ref<string | null>(null);
  const headerGroups = ref<HeaderGroup[]>([]);

  const visibleGroups = computed(() => headerGroups.value.filter(g => g.headers.length > 0));

  const initData = (groups: HeaderGroup[], mode: LayoutMode = 'preset') => {
    headerGroups.value = groups;
    layoutMode.value = mode;
    // 默认选中第一个有内容的组
    const firstVisible = groups.find(g => g.headers.length > 0);
    if (firstVisible) {
      activeGroupId.value = firstVisible.id;
    }
  };

  const updateGroupHeaders = (groupId: string, newHeaders: HeaderModel[]) => {
    const group = headerGroups.value.find((g) => g.id === groupId);
    if (group) {
      group.headers = newHeaders.map((header, idx) => ({
        ...header,
        index: idx,
      }));
    }
  };

  const moveHeaderBetweenGroups = (
    sourceGroupId: string,
    targetGroupId: string,
    sourceIndex: number,
    targetIndex: number
  ) => {
    const sourceGroup = headerGroups.value.find((g) => g.id === sourceGroupId);
    const targetGroup = headerGroups.value.find((g) => g.id === targetGroupId);

    if (!sourceGroup || !targetGroup) return;

    const [movedItem] = sourceGroup.headers.splice(sourceIndex, 1);
    if (movedItem) {
      targetGroup.headers.splice(targetIndex, 0, movedItem);
      
      sourceGroup.headers = sourceGroup.headers.map((header, idx) => ({
        ...header,
        index: idx,
      }));
      
      targetGroup.headers = targetGroup.headers.map((header, idx) => ({
        ...header,
        index: idx,
      }));
    }
  };

  const setLayoutMode = (mode: LayoutMode) => {
    layoutMode.value = mode;
  };

  const setActiveGroup = (groupId: string) => {
    activeGroupId.value = groupId;
  };

  return {
    headerGroups,
    visibleGroups,
    layoutMode,
    activeGroupId,
    initData,
    updateGroupHeaders,
    moveHeaderBetweenGroups,
    setLayoutMode,
    setActiveGroup,
  };
});
