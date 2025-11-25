<script setup lang="ts">
import { ref, watch, inject, type Ref } from "vue";
import type { HeaderModel } from "@/stores/headerStore";
import HeaderItem from "./HeaderItem.vue";

const props = defineProps<{
  headers: HeaderModel[];
  onUpdate: (newHeaders: HeaderModel[]) => void;
  group?: string;
}>();

const localHeaders = ref<HeaderModel[]>([...props.headers]);
const draggedIndex = ref<number | null>(null);
const overIndex = ref<number | null>(null);

const dragState = inject<Ref<{ sourceGroupId: string | null; sourceIndex: number | null }>>('dragState');
const moveHeaderBetweenGroups = inject<(
  sourceGroupId: string,
  targetGroupId: string,
  sourceIndex: number,
  targetIndex: number
) => void>('moveHeaderBetweenGroups');

watch(
  () => props.headers,
  (newHeaders) => {
    localHeaders.value = [...newHeaders];
  },
  { deep: true }
);

const handleDragStart = (index: number, event: PointerEvent, handleStart: (e: PointerEvent) => void) => {
  draggedIndex.value = index;
  if (dragState) {
    dragState.value.sourceGroupId = props.group || 'default';
    dragState.value.sourceIndex = index;
  }
  handleStart(event);
};

const handleDragOver = (index: number) => {
  if (dragState?.value.sourceGroupId && dragState.value.sourceIndex !== null) {
    overIndex.value = index;
  }
};

const handleDragEnd = () => {
  if (dragState?.value.sourceGroupId && dragState.value.sourceIndex !== null && overIndex.value !== null) {
    const sourceGroupId = dragState.value.sourceGroupId;
    const sourceIndex = dragState.value.sourceIndex;
    const targetGroupId = props.group || 'default';
    const targetIndex = overIndex.value;

    if (sourceGroupId === targetGroupId) {
      if (sourceIndex !== targetIndex) {
        const newHeaders = [...localHeaders.value];
        const [movedItem] = newHeaders.splice(sourceIndex, 1);
        if (movedItem) {
          newHeaders.splice(targetIndex, 0, movedItem);
          localHeaders.value = newHeaders;
          props.onUpdate(newHeaders);
        }
      }
    } else {
      if (moveHeaderBetweenGroups) {
        moveHeaderBetweenGroups(sourceGroupId, targetGroupId, sourceIndex, targetIndex);
      }
    }
  }
  
  draggedIndex.value = null;
  overIndex.value = null;
  if (dragState) {
    dragState.value.sourceGroupId = null;
    dragState.value.sourceIndex = null;
  }
};
</script>

<template>
  <header class="flex items-center border-b bg-[#fafafa] py-1">
    <div class="flex items-center min-h-[32px]">
      <HeaderItem
        v-for="(header, idx) in localHeaders"
        :key="header.id"
        :header="header"
        :index="idx"
        :group="group || 'default'"
        :is-dragging="draggedIndex === idx"
        :is-over="overIndex === idx && draggedIndex !== idx"
        :show-separator="idx > 0"
        @drag-start="(event, handleStart) => handleDragStart(idx, event, handleStart)"
        @drag-over="handleDragOver(idx)"
        @drag-end="handleDragEnd"
      />
    </div>
  </header>
</template>
