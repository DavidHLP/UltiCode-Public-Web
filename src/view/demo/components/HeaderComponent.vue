<script setup lang="ts">
import type { HeaderModel, HeaderVariant } from "../composables";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useIcon } from "../composables/useIcon";
import { useHeaderStyles } from "../composables/useHeaderStyles";

defineOptions({
  name: "HeaderComponent"
});

interface HeaderComponentProps {
  headers: HeaderModel[];
  variant?: HeaderVariant;
}

withDefaults(defineProps<HeaderComponentProps>(), {
  variant: 'default'
});

const emit = defineEmits<{
  (e: 'click', index: number): void;
}>();

// 使用 composables
const { getIconComponent } = useIcon();
const { getVariantClasses } = useHeaderStyles();

/**
 * 处理 header 点击事件
 */
const handleClick = (index: number, disabled?: boolean) => {
  if (disabled) return;
  emit('click', index);
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
    <template v-for="(header, index) in headers" :key="index">
      <!-- 带 Tooltip 的 Header -->
      <TooltipProvider v-if="header.tooltip" :delay-duration="300">
        <Tooltip>
          <TooltipTrigger as-child>
            <button 
              :class="getVariantClasses(header, variant)"
              @click="handleClick(header.index, header.disabled)"
              :disabled="header.disabled"
            >
              <component 
                :is="getIconComponent(header.icon)" 
                v-if="getIconComponent(header.icon)" 
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
      
      <!-- 普通 Header -->
      <button 
        v-else
        :class="getVariantClasses(header, variant)"
        @click="handleClick(header.index, header.disabled)"
        :disabled="header.disabled"
      >
        <component 
          :is="getIconComponent(header.icon)" 
          v-if="getIconComponent(header.icon)" 
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
