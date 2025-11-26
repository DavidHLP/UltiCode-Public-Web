<script setup lang="ts">
import { computed } from "vue";
import { useHeaderStore } from "@/stores/headerStore";
import { storeToRefs } from "pinia";
import PanelComponent from "../PanelComponent.vue";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';

const headerStore = useHeaderStore();
const { headerGroups, visibleGroups, activeGroupId } = storeToRefs(headerStore);
const { updateGroupHeaders, setActiveGroup } = headerStore;

// Leet布局：左侧1列 + 右侧3列（2行）
const leetPanels = computed(() => {
  const panels = [];
  if (visibleGroups.value[0]) {
    panels.push({ id: 'leet-left', groupId: visibleGroups.value[0].id, size: 40 });
  }
  // 右侧3个面板
  for (let i = 1; i <= 3 && visibleGroups.value[i]; i++) {
    panels.push({ 
      id: `leet-right-${i}`, 
      groupId: visibleGroups.value[i]!.id,
      size: i === 1 ? 30 : 35, // 第一个较小
    });
  }
  return panels;
});

const handleGroupClick = (groupId: string) => {
  setActiveGroup(groupId);
};
</script>

<template>
  <ResizablePanelGroup direction="horizontal" class="h-full w-full">
    <!-- 左侧面板 -->
    <ResizablePanel v-if="leetPanels[0]" :default-size="40" :min-size="20">
      <div 
        class="h-full cursor-pointer"
        :class="{ 'border border-[#dedede]': activeGroupId === leetPanels[0]!.groupId }"
        @click="handleGroupClick(leetPanels[0]!.groupId)"
      >
        <PanelComponent
          :headers="headerGroups.find(g => g.id === leetPanels[0]!.groupId)!.headers"
          :group="leetPanels[0]!.groupId"
          :on-update="(newHeaders) => updateGroupHeaders(leetPanels[0]!.groupId, newHeaders)"
          :is-active="activeGroupId === leetPanels[0]!.groupId"
          class="h-full"
        />
      </div>
    </ResizablePanel>
    
    <ResizableHandle v-if="leetPanels.length > 1" with-handle />
    
    <!-- 右侧面板：垂直分割 -->
    <ResizablePanel v-if="leetPanels.length > 1" :default-size="60" :min-size="30">
      <ResizablePanelGroup direction="vertical" class="h-full">
        <!-- 上半部分：水平分割 -->
        <ResizablePanel :default-size="50" :min-size="20">
          <ResizablePanelGroup direction="horizontal" class="h-full">
            <template v-for="(panel, index) in leetPanels.slice(1, 3)" :key="panel.id">
              <ResizablePanel :default-size="50" :min-size="20">
                <div 
                  class="h-full cursor-pointer"
                  :class="{ 'border border-[#dedede]': activeGroupId === panel.groupId }"
                  @click="handleGroupClick(panel.groupId)"
                >
                  <PanelComponent
                    :headers="headerGroups.find(g => g.id === panel.groupId)!.headers"
                    :group="panel.groupId"
                    :on-update="(newHeaders) => updateGroupHeaders(panel.groupId, newHeaders)"
                    :is-active="activeGroupId === panel.groupId"
                    class="h-full"
                  />
                </div>
              </ResizablePanel>
              <ResizableHandle v-if="index < leetPanels.slice(1, 3).length - 1" with-handle />
            </template>
          </ResizablePanelGroup>
        </ResizablePanel>
        
        <ResizableHandle v-if="leetPanels[3]" with-handle />
        
        <!-- 下半部分 -->
        <ResizablePanel v-if="leetPanels[3]" :default-size="50" :min-size="20">
          <div 
            class="h-full cursor-pointer"
            :class="{ 'border border-[#dedede]': activeGroupId === leetPanels[3]!.groupId }"
            @click="handleGroupClick(leetPanels[3]!.groupId)"
          >
            <PanelComponent
              :headers="headerGroups.find(g => g.id === leetPanels[3]!.groupId)!.headers"
              :group="leetPanels[3]!.groupId"
              :on-update="(newHeaders) => updateGroupHeaders(leetPanels[3]!.groupId, newHeaders)"
              :is-active="activeGroupId === leetPanels[3]!.groupId"
              class="h-full"
            />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </ResizablePanel>
  </ResizablePanelGroup>
</template>
