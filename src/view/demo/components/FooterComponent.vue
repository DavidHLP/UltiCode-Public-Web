<script setup lang="ts">
import { computed } from 'vue';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { FooterAction, FooterAlign, FooterVariant } from "../composables/types";
import { useDemoUI } from "../composables/useDemoUI";
import { useDemoStore } from "@/view/demo";
import { storeToRefs } from "pinia";

defineOptions({
  name: "FooterComponent"
});

interface FooterComponentProps {
  actions?: FooterAction[];
  align?: FooterAlign;
  variant?: FooterVariant;
  useStore?: boolean; // 是否使用 Pinia store
}

const props = withDefaults(defineProps<FooterComponentProps>(), {
  align: 'left',
  variant: 'default',
  useStore: false
});

// 使用 composables
const { getIconComponent } = useDemoUI();

// 使用 Pinia store（可选）
const demoStore = useDemoStore();
const { 
  footerActions: storeActions, 
  footerAlign: storeAlign, 
  footerVariant: storeVariant 
} = storeToRefs(demoStore);

// 根据配置选择数据源
const currentActions = computed(() => props.useStore ? storeActions.value : props.actions);
const currentAlign = computed(() => props.useStore ? storeAlign.value : props.align);
const currentVariant = computed(() => props.useStore ? storeVariant.value : props.variant);

/**
 * 获取对齐方式的 CSS 类
 */
const getAlignClass = (align: FooterAlign) => {
  const alignMap: Record<FooterAlign, string> = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
    'space-between': 'justify-between'
  };
  return alignMap[align];
};
</script>

<template>
  <footer 
    class="flex items-center gap-2 px-3 py-2"
    :class="[
      getAlignClass(currentAlign),
      {
        'bg-muted/50': currentVariant === 'default',
        'bg-background shadow-lg border-t': currentVariant === 'elevated',
        'border-t': currentVariant === 'bordered'
      }
    ]"
  >
    <!-- 自定义内容插槽 -->
    <slot />
    
    <!-- 分隔线 -->
    <Separator 
      v-if="$slots.default && currentActions && currentActions.length > 0" 
      orientation="vertical" 
      class="h-5" 
    />
    
    <!-- 快捷操作按钮 -->
    <div v-if="currentActions && currentActions.length > 0" class="flex items-center gap-2">
      <Button
        v-for="(action, index) in currentActions"
        :key="index"
        :variant="action.variant || 'ghost'"
        size="sm"
        @click="action.onClick"
        class="h-7"
      >
        <component 
          :is="getIconComponent(action.icon)" 
          v-if="action.icon && getIconComponent(action.icon)"
          class="h-3.5 w-3.5 mr-1.5"
        />
        {{ action.label }}
      </Button>
    </div>
  </footer>
</template>
