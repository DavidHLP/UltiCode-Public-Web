<script setup lang="ts">
import type { Component } from "vue";
import * as LucideIcons from "lucide-vue-next";
import type { HeaderModel } from "../composables/types";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

defineOptions({
  name: "HeaderComponent"
});

const props = defineProps<{
  headers: HeaderModel[];
  variant?: 'default' | 'tabs' | 'pills';
}>();

const emit = defineEmits<{
  (e: 'click', index: number): void;
}>();

const handleClick = (index: number, disabled?: boolean) => {
  if (disabled) return;
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

const getVariantClasses = (header: HeaderModel) => {
  const baseClasses = "flex items-center gap-1.5 transition-all duration-200 select-none";
  const variant = props.variant || 'default';
  
  if (header.disabled) {
    return `${baseClasses} opacity-40 cursor-not-allowed`;
  }
  
  if (header.active) {
    switch (variant) {
      case 'tabs':
        return `${baseClasses} cursor-pointer border-b-2 border-primary text-primary font-medium px-3 py-2 -mb-px`;
      case 'pills':
        return `${baseClasses} cursor-pointer bg-primary text-primary-foreground rounded-full px-4 py-1.5 font-medium shadow-sm`;
      default:
        return `${baseClasses} cursor-pointer bg-accent text-accent-foreground rounded-md px-3 py-1.5 font-medium`;
    }
  }
  
  switch (variant) {
    case 'tabs':
      return `${baseClasses} cursor-pointer hover:text-primary hover:border-b-2 hover:border-border px-3 py-2 -mb-px text-muted-foreground`;
    case 'pills':
      return `${baseClasses} cursor-pointer hover:bg-muted rounded-full px-4 py-1.5 text-muted-foreground hover:text-foreground`;
    default:
      return `${baseClasses} cursor-pointer hover:bg-accent/50 hover:text-accent-foreground rounded-md px-3 py-1.5 text-muted-foreground`;
  }
};
</script>

<template>
  <header 
    class="flex items-center gap-2 px-3 py-2 rounded-t-lg border-b"
    :class="{
      'bg-muted/50': variant !== 'tabs',
      'bg-background border-b': variant === 'tabs'
    }"
  >
    <template v-for="(header, index) in props.headers" :key="index">
      <TooltipProvider v-if="header.tooltip" :delay-duration="300">
        <Tooltip>
          <TooltipTrigger as-child>
            <button 
              :class="getVariantClasses(header)"
              @click="handleClick(header.index, header.disabled)"
              :disabled="header.disabled"
            >
              <component 
                :is="IconComponent(header.icon)" 
                v-if="IconComponent(header.icon)" 
                class="h-4 w-4 flex-shrink-0" 
                :class="header.active ? '' : (header.color || 'text-muted-foreground')"
              />
              <span class="whitespace-nowrap text-sm">{{ header.title }}</span>
              <Badge 
                v-if="header.badge !== undefined" 
                variant="secondary" 
                class="ml-1 h-5 min-w-5 px-1.5 text-xs font-semibold"
              >
                {{ header.badge }}
              </Badge>
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{{ header.tooltip }}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <button 
        v-else
        :class="getVariantClasses(header)"
        @click="handleClick(header.index, header.disabled)"
        :disabled="header.disabled"
      >
        <component 
          :is="IconComponent(header.icon)" 
          v-if="IconComponent(header.icon)" 
          class="h-4 w-4 flex-shrink-0" 
          :class="header.active ? '' : (header.color || 'text-muted-foreground')"
        />
        <span class="whitespace-nowrap text-sm">{{ header.title }}</span>
        <Badge 
          v-if="header.badge !== undefined" 
          variant="secondary" 
          class="ml-1 h-5 min-w-5 px-1.5 text-xs font-semibold"
        >
          {{ header.badge }}
        </Badge>
      </button>
    </template>
  </header>
</template>
