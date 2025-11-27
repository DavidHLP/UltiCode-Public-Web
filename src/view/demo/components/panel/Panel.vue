<script setup lang="ts">
import { ref, watch, inject, type Ref, onMounted } from "vue";
import type { HeaderModel } from "@/stores/headerStore";
import PanelHeader from "./PanelHeader.vue";
import PanelContent from "./PanelContent.vue";

const props = defineProps<{
  headers: HeaderModel[];
  onUpdate: (newHeaders: HeaderModel[]) => void;
  group?: string;
  isActive?: boolean; // 当前面板是否为激活状态
}>();

// 每个 PanelComponent 维护自己的活动头部状态
const activeHeader = ref<HeaderModel | null>(null);

const localHeaders = ref<HeaderModel[]>([...props.headers]);
const draggedIndex = ref<number | null>(null);
const overIndex = ref<number | null>(null);
const dropPosition = ref<"before" | "after" | null>(null);

const dragState =
  inject<Ref<{ sourceGroupId: string | null; sourceIndex: number | null }>>(
    "dragState"
  );
const moveHeaderBetweenGroups = inject<
  (
    sourceGroupId: string,
    targetGroupId: string,
    sourceIndex: number,
    targetIndex: number
  ) => void
>("moveHeaderBetweenGroups");

watch(
  () => props.headers,
  (newHeaders) => {
    localHeaders.value = [...newHeaders];
  },
  { deep: true }
);

// 在组件挂载时设置默认选中第一个头部
onMounted(() => {
  if (localHeaders.value.length > 0 && !activeHeader.value) {
    activeHeader.value = localHeaders.value[0] || null;
  }
});

// 监听 headers 变化，如果当前没有选中项且有头部项，则选中第一个
watch(
  () => localHeaders.value,
  (newHeaders) => {
    const activeId = activeHeader.value?.id;
    const stillExists =
      activeId !== undefined &&
      newHeaders.some((header) => header.id === activeId);
    // 如果当前激活项被移出（例如被拖拽到其他组），重置为当前列表的第一个或空
    if (!stillExists) {
      activeHeader.value = newHeaders[0] || null;
    }
  },
  { immediate: true }
);

const handleDragStart = (
  index: number,
  event: PointerEvent,
  handleStart: (e: PointerEvent) => void
) => {
  draggedIndex.value = index;
  if (dragState) {
    dragState.value.sourceGroupId = props.group || "default";
    dragState.value.sourceIndex = index;
  }
  handleStart(event);
};

const handleDragOver = (index: number, event: PointerEvent) => {
  if (dragState?.value.sourceGroupId && dragState.value.sourceIndex !== null) {
    const target = event.currentTarget as HTMLElement;
    if (!target) return;

    const rect = target.getBoundingClientRect();
    const mouseX = event.clientX;
    const elementCenter = rect.left + rect.width / 2;

    overIndex.value = index;
    dropPosition.value = mouseX < elementCenter ? "before" : "after";
  }
};

// 处理头部选择事件
const handleHeaderSelect = (header: HeaderModel) => {
  activeHeader.value = header;
};

const handleDragEnd = () => {
  if (
    dragState?.value.sourceGroupId &&
    dragState.value.sourceIndex !== null &&
    overIndex.value !== null
  ) {
    const sourceGroupId = dragState.value.sourceGroupId;
    const sourceIndex = dragState.value.sourceIndex;
    const targetGroupId = props.group || "default";
    let targetIndex = overIndex.value;

    if (dropPosition.value === "after") {
      targetIndex += 1;
    }

    if (sourceGroupId === targetGroupId) {
      if (sourceIndex !== targetIndex) {
        const newHeaders = [...localHeaders.value];
        const [movedItem] = newHeaders.splice(sourceIndex, 1);
        if (movedItem) {
          const adjustedTargetIndex =
            targetIndex > sourceIndex ? targetIndex - 1 : targetIndex;
          newHeaders.splice(adjustedTargetIndex, 0, movedItem);
          localHeaders.value = newHeaders;
          props.onUpdate(newHeaders);
        }
      }
    } else {
      if (moveHeaderBetweenGroups) {
        moveHeaderBetweenGroups(
          sourceGroupId,
          targetGroupId,
          sourceIndex,
          targetIndex
        );
      }
    }
  }

  draggedIndex.value = null;
  overIndex.value = null;
  dropPosition.value = null;
  if (dragState) {
    dragState.value.sourceGroupId = null;
    dragState.value.sourceIndex = null;
  }
};
</script>

<template>
  <div class="flex flex-col h-full bg-[#fafafa] rounded-lg overflow-hidden shadow-sm">
    <header class="flex items-center border-b bg-[#fafafa] py-1 px-2">
      <div class="flex items-center min-h-[32px] flex-1">
        <PanelHeader
          v-for="(header, idx) in localHeaders"
          :key="header.id"
          :header="header"
          :index="idx"
          :group="group || 'default'"
          :is-dragging="draggedIndex === idx"
          :is-over="overIndex === idx && draggedIndex !== idx"
          :drop-position="overIndex === idx ? dropPosition : null"
          :show-separator="idx > 0"
          :is-active="activeHeader?.id === header.id"
          @drag-start="
            (event, handleStart) => handleDragStart(idx, event, handleStart)
          "
          @drag-over="(event) => handleDragOver(idx, event)"
          @drag-end="handleDragEnd"
          @header-click="handleHeaderSelect"
        />
      </div>
    </header>
    <main class="flex-1 overflow-hidden p-2">
      <div class="h-full overflow-auto rounded-md bg-white">
        <PanelContent
          :active-header="activeHeader || null"
          :is-active="isActive"
        />
      </div>
    </main>
  </div>
</template>