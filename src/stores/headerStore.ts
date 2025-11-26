import { defineStore } from "pinia";
import { ref, computed } from "vue";

export interface HeaderModel {
  id: number;
  index: number;
  title: string;
  icon: string;
  color?: string;
  iconColor?: string;
}

export interface HeaderGroup {
  id: string;
  name: string;
  headers: HeaderModel[];
}

export interface LayoutNode {
  id: string;
  type: 'container' | 'leaf';
  direction?: 'horizontal' | 'vertical';
  size?: number;
  children?: LayoutNode[];
  groupId?: string;
}

export const useHeaderStore = defineStore("header", () => {
  const layoutConfig = ref<LayoutNode | null>(null);
  const activeGroupId = ref<string | null>(null);
  const headerGroups = ref<HeaderGroup[]>([]);

  const visibleGroups = computed(() => headerGroups.value.filter(g => g.headers.length > 0));

  const initData = (groups: HeaderGroup[], layout: LayoutNode) => {
    headerGroups.value = groups;
    layoutConfig.value = layout;
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

  const setActiveGroup = (groupId: string) => {
    activeGroupId.value = groupId;
  };

  const updateLayout = (layout: LayoutNode) => {
    layoutConfig.value = layout;
  };

  return {
    headerGroups,
    visibleGroups,
    layoutConfig,
    activeGroupId,
    initData,
    updateGroupHeaders,
    moveHeaderBetweenGroups,
    setActiveGroup,
    updateLayout,
  };
});