<script setup lang="ts">
import type { Component } from "vue";
import * as LucideIcons from "lucide-vue-next";
import type { HeaderModel } from "./types";

defineOptions({
  name: "HeaderComponent"
});

const props = defineProps<{
  headers: HeaderModel[];
}>();

const emit = defineEmits<{
  (e: 'click', index: number): void;
}>();

const handleClick = (index: number) => {
  emit('click', index);
};

const IconComponent = (iconName: string) => {
  if (!iconName) return null;
  const icon = (LucideIcons as Record<string, unknown>)[iconName];
  // 检查是否是有效的组件（可以是对象或函数）
  if (icon && (typeof icon === "object" || typeof icon === "function")) {
    return icon as Component;
  }
  return null;
};
</script>

<template>
  <header class="flex items-center gap-2 bg-muted/50 px-3 py-2 rounded-t-lg border-b">
    <template v-for="(header, index) in props.headers" :key="index">
      <button 
        class="flex items-center gap-1.5 hover:opacity-80 transition-opacity cursor-pointer" 
        :class="header.color"
        @click="handleClick(header.index)"
      >
        <component 
          :is="IconComponent(header.icon)" 
          v-if="IconComponent(header.icon)" 
          class="h-4 w-4" 
          :class="header.color || 'text-muted-foreground'"
        />
        <span class="whitespace-nowrap text-sm font-medium">{{ header.title }}</span>
      </button>
    </template>
  </header>
</template>
