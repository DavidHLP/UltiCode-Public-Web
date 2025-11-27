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
  dropPosition?: 'before' | 'after' | null;
  showSeparator: boolean;
  isActive?: boolean; // 添加是否激活的属性
}>();

const emit = defineEmits<{
  (e: 'drag-start', event: PointerEvent, handleStart: (e: PointerEvent) => void): void;
  (e: 'drag-over', event: PointerEvent): void;
  (e: 'drag-end'): void;
  (e: 'header-click', header: HeaderModel): void; // 修改事件定义，不再传递 group
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

const onPointerOver = (e: PointerEvent) => {
  emit('drag-over', e);
};

const onHeaderClick = () => {
  // 修改事件触发，不再传递 group
  emit('header-click', props.header);
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
    class="flex items-center h-3 cursor-move relative"
    :class="{
      'before:absolute before:left-0 before:top-0 before:bottom-0 before:w-0.5 before:bg-blue-500': isOver && dropPosition === 'before',
      'after:absolute after:right-0 after:top-0 after:bottom-0 after:w-0.5 after:bg-blue-500': isOver && dropPosition === 'after',
    }"
    :style="{ touchAction: 'none' }"
    @pointerdown="onPointerDown"
    @pointerover="onPointerOver"
    @pointerup="emit('drag-end')"
  >
    <Separator v-if="showSeparator" orientation="vertical" class="h-3" />
    <Button
      variant="ghost"
      size="sm"
      class="relative bg-[#fafafa] h-6"
      :class="{
        'opacity-60': !isActive,
      }"
      :style="{
        color: header.color,
      }"
      @click="onHeaderClick"
    >
      <component
        :is="getIconComponent(header.icon)"
        v-if="getIconComponent(header.icon)"
        :style="{ color: header.iconColor || header.color }"
        class="h-3 w-3"
      />
      <span class="font-medium text-xs">{{ header.title }}</span>
    </Button>
  </div>
</template>