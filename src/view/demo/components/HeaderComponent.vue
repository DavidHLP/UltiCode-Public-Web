<script setup lang="ts">
import { computed } from 'vue';
import type { HeaderModel, HeaderVariant } from "../composables/types";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useDemoUI } from "../composables/useDemoUI";
import { useDemoStore } from "@/view/demo";
import { storeToRefs } from "pinia";

defineOptions({
  name: "HeaderComponent"
});

interface HeaderComponentProps {
  headers?: HeaderModel[];
  variant?: HeaderVariant;
  useStore?: boolean; // 是否使用 Pinia store
}

const props = withDefaults(defineProps<HeaderComponentProps>(), {
  variant: 'default',
  useStore: false
});

const emit = defineEmits<{
  (e: 'click', index: number): void;
}>();

// 使用 composables
const { getIconComponent, getHeaderClasses } = useDemoUI();

// 使用 Pinia store（可选）
const demoStore = useDemoStore();
const { headers: storeHeaders, headerVariant: storeVariant } = storeToRefs(demoStore);

// 根据配置选择数据源
const currentHeaders = computed(() => props.useStore ? storeHeaders.value : (props.headers || []));
const currentVariant = computed(() => props.useStore ? storeVariant.value : props.variant);

/**
 * 处理 header 点击事件
 */
const handleClick = (index: number, disabled?: boolean) => {
  if (disabled) return;
  
  // 如果使用 store，自动更新激活状态
  if (props.useStore) {
    demoStore.activateHeader(index);
  }
  
  emit('click', index);
};
</script>

<template>
  <header 
    class="flex items-center gap-2 px-3 py-2 rounded-t-lg border-b"
    :class="{
      'bg-muted/50': currentVariant !== 'tabs',
      'bg-background border-b': currentVariant === 'tabs'
    }"
  >
    <template v-for="(header, index) in currentHeaders" :key="index">
      <!-- 带 Tooltip 的 Header -->
      <TooltipProvider v-if="header.tooltip" :delay-duration="300">
        <Tooltip>
          <TooltipTrigger as-child>
            <button 
              :class="getHeaderClasses(header, currentVariant)"
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
        :class="getHeaderClasses(header, currentVariant)"
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
