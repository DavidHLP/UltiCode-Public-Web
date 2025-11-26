<script setup lang="ts">
import { storeToRefs } from "pinia";
import { ref, provide, computed } from "vue";
import { useHeaderStore } from "@/stores/headerStore";
import HeaderComponent from "./components/LayoutComponent.vue";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';

const headerStore = useHeaderStore();
const { headerGroups } = storeToRefs(headerStore);
const { updateGroupHeaders, moveHeaderBetweenGroups } = headerStore;

const dragState = ref<{
  sourceGroupId: string | null;
  sourceIndex: number | null;
}>({ sourceGroupId: null, sourceIndex: null });

provide('dragState', dragState);
provide('moveHeaderBetweenGroups', moveHeaderBetweenGroups);

const visibleGroups = computed(() => headerGroups.value.filter(g => g.headers.length > 0));
</script>

<template>
  <div class="h-screen w-full">
    <ResizablePanelGroup direction="horizontal" class="h-full w-full border">
      <!-- 第一个面板 -->
      <template v-if="visibleGroups[0]">
        <ResizablePanel :default-size="50">
          <HeaderComponent
            :headers="visibleGroups[0]!.headers"
            :group="visibleGroups[0]!.id"
            :on-update="(newHeaders) => updateGroupHeaders(visibleGroups[0]!.id, newHeaders)"
            class="h-full"
          />
        </ResizablePanel>
      </template>
      
      <!-- 分隔条 -->
      <ResizableHandle v-if="visibleGroups.length > 1" />
      
      <!-- 右侧面板 -->
      <ResizablePanel v-if="visibleGroups.length > 1" :default-size="50">
        <!-- 如果只有两个组，直接显示第二个组 -->
        <template v-if="visibleGroups.length === 2">
          <HeaderComponent
            :headers="visibleGroups[1]!.headers"
            :group="visibleGroups[1]!.id"
            :on-update="(newHeaders) => updateGroupHeaders(visibleGroups[1]!.id, newHeaders)"
            class="h-full"
          />
        </template>
        
        <!-- 如果有更多组，则使用垂直布局 -->
        <ResizablePanelGroup v-else direction="vertical">
          <!-- 第二个面板 -->
          <ResizablePanel :default-size="25">
            <HeaderComponent
              :headers="visibleGroups[1]!.headers"
              :group="visibleGroups[1]!.id"
              :on-update="(newHeaders) => updateGroupHeaders(visibleGroups[1]!.id, newHeaders)"
              class="h-full"
            />
          </ResizablePanel>
          
          <ResizableHandle />
          
          <!-- 第三个及更多面板 -->
          <ResizablePanel :default-size="75">
            <ResizablePanelGroup direction="vertical">
              <template v-for="(group, index) in visibleGroups.slice(2)" :key="group.id">
                <ResizablePanel :default-size="100 / (visibleGroups.length - 2)">
                  <HeaderComponent
                    :headers="group.headers"
                    :group="group.id"
                    :on-update="(newHeaders) => updateGroupHeaders(group.id, newHeaders)"
                    class="h-full"
                  />
                </ResizablePanel>
                <ResizableHandle v-if="index < visibleGroups.slice(2).length - 1" />
              </template>
            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
    </ResizablePanelGroup>
  </div>
</template>