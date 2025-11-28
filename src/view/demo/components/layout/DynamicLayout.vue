<script setup lang="ts">
import { ref, provide } from "vue";
import { useHeaderStore, type LayoutNode } from "@/stores/headerStore";
import LayoutNodeComponent from "./LayoutNode.vue";

defineProps<{
  layout: LayoutNode;
}>();

const headerStore = useHeaderStore();
const { moveHeaderBetweenGroups } = headerStore;

const dragState = ref<{
  sourceGroupId: string | null;
  sourceIndex: number | null;
}>({ sourceGroupId: null, sourceIndex: null });

provide('dragState', dragState);
provide('moveHeaderBetweenGroups', moveHeaderBetweenGroups);
</script>

<template>
  <div class="h-full w-full">
    <div class="h-full w-full">
      <LayoutNodeComponent :node="layout" :is-root="true" :key="layout.id" />
    </div>
  </div>
</template>
