<script setup lang="ts">
import { computed, type Component } from "vue";
import * as LucideIcons from "lucide-vue-next";

const props = defineProps<{
  title: string;
  icon?: string;
}>();

const IconComponent = computed(() => {
  if (!props.icon) return null;
  const icon = (LucideIcons as Record<string, unknown>)[props.icon];
  // 检查是否是有效的组件（可以是对象或函数）
  if (icon && (typeof icon === 'object' || typeof icon === 'function')) {
    return icon as Component;
  }
  return null;
});
</script>

<template>
  <header class="flex items-center gap-1 bg-muted/50 px-2 py-1.5">
    <component :is="IconComponent" v-if="IconComponent" class="h-3.5 w-3.5" />
    <div class="whitespace-nowrap text-sm font-medium">{{ title }}</div>
  </header>
</template>
