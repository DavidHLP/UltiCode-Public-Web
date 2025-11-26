<script setup lang="ts">
import { storeToRefs } from "pinia";
import { ref, provide } from "vue";
import { useHeaderStore } from "@/stores/headerStore";
import { Button } from "@/components/ui/button";
import PresetLayout from "./layouts/PresetLayout.vue";
import LeetLayout from "./layouts/LeetLayout.vue";

const headerStore = useHeaderStore();
const { layoutMode } = storeToRefs(headerStore);
const { moveHeaderBetweenGroups, setLayoutMode } = headerStore;

const dragState = ref<{
  sourceGroupId: string | null;
  sourceIndex: number | null;
}>({ sourceGroupId: null, sourceIndex: null });

provide('dragState', dragState);
provide('moveHeaderBetweenGroups', moveHeaderBetweenGroups);
</script>

<template>
  <div class="h-screen w-full flex flex-col">
    <!-- 布局切换按钮 -->
    <div class="flex gap-2 p-4 border-b bg-gray-50">
      <Button
        :variant="layoutMode === 'preset' ? 'default' : 'outline'"
        @click="setLayoutMode('preset')"
      >
        预设布局 (2列)
      </Button>
      <Button
        :variant="layoutMode === 'leet' ? 'default' : 'outline'"
        @click="setLayoutMode('leet')"
      >
        Leet布局 (1+3)
      </Button>
    </div>

    <!-- 布局区域 -->
    <div class="flex-1 overflow-hidden">
      <PresetLayout v-if="layoutMode === 'preset'" />
      <LeetLayout v-else-if="layoutMode === 'leet'" />
    </div>
  </div>
</template>
