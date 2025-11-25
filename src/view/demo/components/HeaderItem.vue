<script setup lang="ts">
import { computed } from "vue";
import { useDraggable, useDroppable } from "@vue-dnd-kit/core";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { HeaderModel } from "@/stores/headerStore";
import * as LucideIcons from "lucide-vue-next";

const props = defineProps<{
  header: HeaderModel;
  index: number;
  group: string;
  isDragging: boolean;
  isOver: boolean;
  showSeparator: boolean;
}>();

const emit = defineEmits<{
  (e: 'drag-start', event: PointerEvent, handleStart: (e: PointerEvent) => void): void;
  (e: 'drag-over'): void;
  (e: 'drag-end'): void;
}>();

const headerId = computed(() => `header-${props.group}-${props.header.id}-${props.index}`);

const { elementRef: draggableRef, handleDragStart } = useDraggable({
  id: headerId.value,
  data: { index: props.index, groupId: props.group },
  groups: ['headers'],
});

const { elementRef: droppableRef } = useDroppable({
  data: { index: props.index, groupId: props.group },
  groups: ['headers'],
});

const getIconComponent = (iconName?: string) => {
  if (!iconName) return null;
  const icon = (LucideIcons as Record<string, unknown>)[iconName];
  if (icon && (typeof icon === "object" || typeof icon === "function")) {
    return icon;
  }
  return null;
};

const onPointerDown = (e: PointerEvent) => {
  emit('drag-start', e, handleDragStart);
};

const setRef = (el: unknown) => {
  if (el) {
    draggableRef.value = el as HTMLElement;
    droppableRef.value = el as HTMLElement;
  }
};
</script>

<template>
  <div
    :ref="setRef"
    class="flex items-center h-3 cursor-move"
    :class="{
      'border-l-2 border-blue-500': isOver,
    }"
    :style="{ touchAction: 'none' }"
    @pointerdown="onPointerDown"
    @pointerover="emit('drag-over')"
    @pointerup="emit('drag-end')"
  >
    <Separator v-if="showSeparator" orientation="vertical" class="h-3" />
    <Button
      variant="ghost"
      size="sm"
      :style="{
        color: header.color,
        backgroundColor: header.bgColor,
      }"
    >
      <component
        :is="getIconComponent(header.icon)"
        v-if="getIconComponent(header.icon)"
        :style="{ color: header.iconColor || header.color }"
      />
      <span>{{ header.title }}</span>
    </Button>
  </div>
</template>
