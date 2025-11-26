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

// 预设布局：2列布局
const presetPanels = computed(() => {
  return visibleGroups.value.slice(0, 2).map((group, index) => ({
    id: `preset-${index}`,
    groupId: group.id,
    size: 50,
  }));
});

const handleGroupClick = (groupId: string) => {
  setActiveGroup(groupId);
};
</script>

<template>
  <ResizablePanelGroup direction="horizontal" class="h-full w-full">
    <template v-for="(panel, index) in presetPanels" :key="panel.id">
      <ResizablePanel :default-size="panel.size" :min-size="20">
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
      <ResizableHandle v-if="index < presetPanels.length - 1" with-handle />
    </template>
  </ResizablePanelGroup>
</template>
