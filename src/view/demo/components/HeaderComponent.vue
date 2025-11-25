<script setup lang="ts">
import { type Component, ref, watch } from "vue";
import { VueDraggable } from "vue-draggable-plus";
import * as LucideIcons from "lucide-vue-next";
import type { HeaderModel } from "../store";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const props = defineProps<{
  headers: HeaderModel[];
  onUpdate: (newHeaders: HeaderModel[]) => void;
  group?: string;
}>();

const localHeaders = ref<HeaderModel[]>([...props.headers]);

// 监听 props 变化并同步到本地状态
watch(
  () => props.headers,
  (newHeaders) => {
    localHeaders.value = [...newHeaders];
  },
  { deep: true }
);

const getIconComponent = (iconName?: string): Component | null => {
  if (!iconName) return null;
  const icon = (LucideIcons as Record<string, unknown>)[iconName];
  // 检查是否是有效的组件（可以是对象或函数）
  if (icon && (typeof icon === "object" || typeof icon === "function")) {
    return icon as Component;
  }
  return null;
};

const handleDragEnd = () => {
  props.onUpdate(localHeaders.value);
};
</script>

<template>
  <header class="flex items-center border-b bg-[#fafafa] py-2">
    <VueDraggable
      v-model="localHeaders"
      :animation="200"
      :group="props.group || 'headers'"
      class="flex items-center min-h-[40px]"
      @end="handleDragEnd"
    >
      <div
        v-for="(header, idx) in localHeaders"
        :key="header.id"
        class="flex items-center h-4 cursor-move"
      >
        <Separator v-if="idx > 0" orientation="vertical" />
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
          <span>
            {{ header.title }}
          </span>
        </Button>
      </div>
    </VueDraggable>
  </header>
</template>
