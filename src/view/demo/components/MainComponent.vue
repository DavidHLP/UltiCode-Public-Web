<script setup lang="ts">
import { Spinner } from "@/components/ui/spinner";
import type { MainContentProps } from "../composables";
import { useIcon } from "../composables/useIcon";

defineOptions({
  name: "MainComponent"
});

const props = withDefaults(defineProps<MainContentProps>(), {
  loading: false,
  empty: false,
  emptyText: '暂无数据',
  emptyIcon: 'Inbox'
});

// 使用 composables
const { getIconComponent } = useIcon();
</script>

<template>
  <main class="flex flex-1 min-h-0 overflow-auto">
    <!-- 加载状态 -->
    <div v-if="props.loading" class="flex flex-1 items-center justify-center">
      <div class="flex flex-col items-center gap-3">
        <Spinner class="h-8 w-8 text-primary" />
        <p class="text-sm text-muted-foreground">加载中...</p>
      </div>
    </div>
    
    <!-- 空状态 -->
    <div v-else-if="props.empty" class="flex flex-1 items-center justify-center">
      <div class="flex flex-col items-center gap-4 text-center px-4">
        <div class="rounded-full bg-muted p-6">
          <component 
            :is="getIconComponent(props.emptyIcon)" 
            v-if="getIconComponent(props.emptyIcon)"
            class="h-12 w-12 text-muted-foreground/60"
          />
        </div>
        <div class="space-y-1">
          <p class="text-sm font-medium text-muted-foreground">{{ props.emptyText }}</p>
          <slot name="empty-action" />
        </div>
      </div>
    </div>
    
    <!-- 文本内容 -->
    <div v-else-if="props.text" class="flex flex-1 items-center justify-center">
      <div class="text-center px-4">
        <p class="text-muted-foreground">{{ props.text }}</p>
      </div>
    </div>
    
    <!-- 默认内容插槽 -->
    <div v-else class="flex flex-1 flex-col w-full">
      <slot />
    </div>
  </main>
</template>
