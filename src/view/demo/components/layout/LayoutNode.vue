<script setup lang="ts">
import { useHeaderStore, type LayoutNode } from "@/stores/headerStore";
import { storeToRefs } from "pinia";
import Panel from "../panel/Panel.vue";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';

defineProps<{
  node: LayoutNode;
}>();

const headerStore = useHeaderStore();
const { headerGroups, activeGroupId } = storeToRefs(headerStore);
const { updateGroupHeaders, setActiveGroup } = headerStore;

const handleGroupClick = (groupId: string) => {
  setActiveGroup(groupId);
};

const getGroupHeaders = (groupId: string) => {
  return headerGroups.value.find(g => g.id === groupId)?.headers || [];
};
</script>

<template>
  <div class="h-full w-full">
    <!-- Container Node -->
    <ResizablePanelGroup
      v-if="node.type === 'container' && node.children"
      :direction="node.direction || 'horizontal'"
      class="h-full w-full gap-2 p-2"
    >
      <template v-for="(child, index) in node.children" :key="child.id">
        <ResizablePanel :default-size="child.size" :min-size="20" class="rounded-xl overflow-hidden">
          <!-- Recursively render children -->
          <LayoutNode :node="child" />
        </ResizablePanel>
        
        <ResizableHandle v-if="index < node.children.length - 1" with-handle />
      </template>
    </ResizablePanelGroup>

    <!-- Leaf Node -->
    <div 
      v-else-if="node.type === 'leaf' && node.groupId"
      class="h-full cursor-pointer rounded-xl border border-transparent overflow-hidden bg-white m-1"
      :class="{ 'border-[#dedede] shadow-sm': activeGroupId === node.groupId }"
      @click="handleGroupClick(node.groupId)"
    >
      <Panel
        :headers="getGroupHeaders(node.groupId)"
        :group="node.groupId"
        :on-update="(newHeaders) => updateGroupHeaders(node.groupId!, newHeaders)"
        :is-active="activeGroupId === node.groupId"
        class="h-full"
      />
    </div>
  </div>
</template>
