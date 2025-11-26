<script setup lang="ts">
import { ref, watch, inject, type Ref, onMounted } from "vue";
import type { HeaderModel } from "@/stores/headerStore";
import PanelHeader from "./PanelHeader.vue";
import PanelContent from "./PanelContent.vue";
import HeaderColorSettings from "./HeaderColorSettings.vue";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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
const dropPosition = ref<'before' | 'after' | null>(null);

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
    const stillExists = activeId !== undefined && newHeaders.some((header) => header.id === activeId);
    // 如果当前激活项被移出（例如被拖拽到其他组），重置为当前列表的第一个或空
    if (!stillExists) {
      activeHeader.value = newHeaders[0] || null;
    }
  },
  { immediate: true }
);

const handleDragStart = (index: number, event: PointerEvent, handleStart: (e: PointerEvent) => void) => {
  draggedIndex.value = index;
  if (dragState) {
    dragState.value.sourceGroupId = props.group || 'default';
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
    dropPosition.value = mouseX < elementCenter ? 'before' : 'after';
  }
};

// 处理头部选择事件
const handleHeaderSelect = (header: HeaderModel) => {
  activeHeader.value = header;
};

const handleDragEnd = () => {
  if (dragState?.value.sourceGroupId && dragState.value.sourceIndex !== null && overIndex.value !== null) {
    const sourceGroupId = dragState.value.sourceGroupId;
    const sourceIndex = dragState.value.sourceIndex;
    const targetGroupId = props.group || 'default';
    let targetIndex = overIndex.value;
    
    if (dropPosition.value === 'after') {
      targetIndex += 1;
    }

    if (sourceGroupId === targetGroupId) {
      if (sourceIndex !== targetIndex) {
        const newHeaders = [...localHeaders.value];
        const [movedItem] = newHeaders.splice(sourceIndex, 1);
        if (movedItem) {
          const adjustedTargetIndex = targetIndex > sourceIndex ? targetIndex - 1 : targetIndex;
          newHeaders.splice(adjustedTargetIndex, 0, movedItem);
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
  dropPosition.value = null;
  if (dragState) {
    dragState.value.sourceGroupId = null;
    dragState.value.sourceIndex = null;
  }
};
</script>

<template>
  <div class="flex flex-col h-full">
    <header class="flex items-center border-b bg-[#fafafa] py-1">
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
          @drag-start="(event, handleStart) => handleDragStart(idx, event, handleStart)"
          @drag-over="(event) => handleDragOver(idx, event)"
          @drag-end="handleDragEnd"
          @header-click="handleHeaderSelect"
        />
      </div>
      <div class="pr-2">
        <Dialog>
          <DialogTrigger as-child>
            <Button variant="ghost" size="sm" class="h-6 w-6 p-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-palette">
                <circle cx="13.5" cy="6.5" r=".5" />
                <circle cx="17.5" cy="10.5" r=".5" />
                <circle cx="8.5" cy="7.5" r=".5" />
                <circle cx="6.5" cy="12.5" r=".5" />
                <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
              </svg>
            </Button>
          </DialogTrigger>
          <DialogContent class="max-w-md">
            <DialogHeader>
              <DialogTitle>自定义颜色</DialogTitle>
            </DialogHeader>
            <HeaderColorSettings 
              :headers="localHeaders" 
              :on-update="props.onUpdate" 
            />
          </DialogContent>
        </Dialog>
      </div>
    </header>
    <main class="flex-1 overflow-hidden">
      <div class="h-full overflow-auto">
        <PanelContent :active-header="activeHeader || null" :is-active="isActive" />
      </div>
    </main>
  </div>
</template>
