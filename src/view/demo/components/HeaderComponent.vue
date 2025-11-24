<script setup lang="ts">
import { type Component } from "vue";
import * as LucideIcons from "lucide-vue-next";
import type { HeaderModel } from "../store";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const { headers } = defineProps<{
  headers: HeaderModel[];
}>();

const getIconComponent = (iconName?: string): Component | null => {
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
  <header class="flex items-center gap-1 bg-muted/50 px-2 py-1.5">
    <template v-for="(header, idx) in headers" :key="header.id">
      <Separator v-if="idx > 0" orientation="vertical" class="h-4" />
      <Button
        variant="ghost"
        size="sm"
        class="flex items-center gap-1"
        :style="{
          color: header.color,
          backgroundColor: header.bgColor,
        }"
      >
        <component
          :is="getIconComponent(header.icon)"
          v-if="getIconComponent(header.icon)"
          class="h-3.5 w-3.5"
          :style="{ color: header.iconColor || header.color }"
        />
        <div class="whitespace-nowrap text-sm font-medium">
          {{ header.title }}
        </div>
      </Button>
    </template>
  </header>
</template>
