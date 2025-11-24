<script setup lang="ts">
import type { Component } from "vue";
import * as LucideIcons from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { FooterAction } from "../composables/types";

defineOptions({
  name: "FooterComponent"
});

defineProps<{
  actions?: FooterAction[];
  align?: 'left' | 'center' | 'right' | 'space-between';
  variant?: 'default' | 'elevated' | 'bordered';
}>();

const IconComponent = (iconName: string) => {
  if (!iconName) return null;
  const icon = (LucideIcons as Record<string, unknown>)[iconName];
  if (icon && (typeof icon === "object" || typeof icon === "function")) {
    return icon as Component;
  }
  return null;
};

const getAlignClass = (align?: string) => {
  switch (align) {
    case 'left':
      return 'justify-start';
    case 'center':
      return 'justify-center';
    case 'right':
      return 'justify-end';
    case 'space-between':
      return 'justify-between';
    default:
      return 'justify-start';
  }
};
</script>

<template>
  <footer 
    class="flex items-center gap-2 px-3 py-2"
    :class="[
      getAlignClass(align),
      {
        'bg-muted/50': variant !== 'elevated' && variant !== 'bordered',
        'bg-background shadow-lg border-t': variant === 'elevated',
        'border-t': variant === 'bordered'
      }
    ]"
  >
    <!-- 自定义内容插槽 -->
    <slot />
    
    <!-- 分隔线 -->
    <Separator v-if="$slots.default && actions && actions.length > 0" orientation="vertical" class="h-5" />
    
    <!-- 快捷操作按钮 -->
    <div v-if="actions && actions.length > 0" class="flex items-center gap-2">
      <Button
        v-for="(action, index) in actions"
        :key="index"
        :variant="action.variant || 'ghost'"
        size="sm"
        @click="action.onClick"
        class="h-7"
      >
        <component 
          :is="IconComponent(action.icon)" 
          v-if="action.icon && IconComponent(action.icon)"
          class="h-3.5 w-3.5 mr-1.5"
        />
        {{ action.label }}
      </Button>
    </div>
  </footer>
</template>
