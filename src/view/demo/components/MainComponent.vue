<script setup lang="ts">
import type { Component } from "vue";
import * as LucideIcons from "lucide-vue-next";
import { Spinner } from "@/components/ui/spinner";
import type { MainContentProps } from "../composables/types";

const { loading, empty, emptyText, emptyIcon, text } = withDefaults(defineProps<MainContentProps>(), {
  loading: false,
  empty: false,
  emptyText: '暂无数据',
  emptyIcon: 'Inbox'
});

const IconComponent = (iconName: string) => {
  if (!iconName) return null;
  const icon = (LucideIcons as Record<string, unknown>)[iconName];
  if (icon && (typeof icon === "object" || typeof icon === "function")) {
    return icon as Component;
  }
  return null;
};
</script>

<template>
  <main class="flex flex-1 min-h-0 overflow-auto">
    <!-- 加载状态 -->
    <div v-if="loading" class="flex flex-1 items-center justify-center">
      <div class="flex flex-col items-center gap-3">
        <Spinner class="h-8 w-8 text-primary" />
        <p class="text-sm text-muted-foreground">加载中...</p>
      </div>
    </div>
    
    <!-- 空状态 -->
    <div v-else-if="empty" class="flex flex-1 items-center justify-center">
      <div class="flex flex-col items-center gap-4 text-center px-4">
        <div class="rounded-full bg-muted p-6">
          <component 
            :is="IconComponent(emptyIcon)" 
            v-if="IconComponent(emptyIcon)"
            class="h-12 w-12 text-muted-foreground/60"
          />
        </div>
        <div class="space-y-1">
          <p class="text-sm font-medium text-muted-foreground">{{ emptyText }}</p>
          <slot name="empty-action" />
        </div>
      </div>
    </div>
    
    <!-- 文本内容 -->
    <div v-else-if="text" class="flex flex-1 items-center justify-center">
      <div class="text-center px-4">
        <p class="text-muted-foreground">{{ text }}</p>
      </div>
    </div>
    
    <!-- 默认内容插槽 -->
    <div v-else class="flex flex-1 flex-col w-full">
      <slot />
    </div>
  </main>
</template>
