<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { FooterAction, FooterAlign, FooterVariant } from "../composables";
import { useIcon } from "../composables/useIcon";

defineOptions({
  name: "FooterComponent"
});

interface FooterComponentProps {
  actions?: FooterAction[];
  align?: FooterAlign;
  variant?: FooterVariant;
}

const props = withDefaults(defineProps<FooterComponentProps>(), {
  align: 'left',
  variant: 'default'
});

// 使用 composables
const { getIconComponent } = useIcon();

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
      getAlignClass(props.align),
      {
        'bg-muted/50': props.variant === 'default',
        'bg-background shadow-lg border-t': props.variant === 'elevated',
        'border-t': props.variant === 'bordered'
      }
    ]"
  >
    <!-- 自定义内容插槽 -->
    <slot />
    
    <!-- 分隔线 -->
    <Separator 
      v-if="$slots.default && props.actions && props.actions.length > 0" 
      orientation="vertical" 
      class="h-5" 
    />
    
    <!-- 快捷操作按钮 -->
    <div v-if="props.actions && props.actions.length > 0" class="flex items-center gap-2">
      <Button
        v-for="(action, index) in props.actions"
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
