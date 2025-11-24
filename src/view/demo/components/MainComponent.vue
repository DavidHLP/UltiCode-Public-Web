<script setup lang="ts">
import { computed } from 'vue';
import { Spinner } from "@/components/ui/spinner";
import type { MainContentProps } from "../composables/types";
import { useDemoUI } from "../composables/useDemoUI";
import { useDemoStore } from "@/view/demo";
import { storeToRefs } from "pinia";

defineOptions({
  name: "MainComponent"
});

interface MainComponentProps extends Partial<MainContentProps> {
  useStore?: boolean; // 是否使用 Pinia store
}

const props = withDefaults(defineProps<MainComponentProps>(), {
  loading: false,
  empty: false,
  emptyText: '暂无数据',
  emptyIcon: 'Inbox',
  useStore: false
});

// 使用 composables
const { getIconComponent } = useDemoUI();

// 使用 Pinia store（可选）
const demoStore = useDemoStore();
const { 
  mainText: storeText, 
  loading: storeLoading, 
  empty: storeEmpty, 
  emptyText: storeEmptyText, 
  emptyIcon: storeEmptyIcon 
} = storeToRefs(demoStore);

// 根据配置选择数据源
const currentText = computed(() => props.useStore ? storeText.value : props.text);
const currentLoading = computed(() => props.useStore ? storeLoading.value : props.loading);
const currentEmpty = computed(() => props.useStore ? storeEmpty.value : props.empty);
const currentEmptyText = computed(() => props.useStore ? storeEmptyText.value : props.emptyText);
const currentEmptyIcon = computed(() => props.useStore ? storeEmptyIcon.value : props.emptyIcon);
</script>

<template>
  <main class="flex flex-1 min-h-0 overflow-auto">
    <!-- 加载状态 -->
    <div v-if="currentLoading" class="flex flex-1 items-center justify-center">
      <div class="flex flex-col items-center gap-3">
        <Spinner class="h-8 w-8 text-primary" />
        <p class="text-sm text-muted-foreground">加载中...</p>
      </div>
    </div>
    
    <!-- 空状态 -->
    <div v-else-if="currentEmpty" class="flex flex-1 items-center justify-center">
      <div class="flex flex-col items-center gap-4 text-center px-4">
        <div class="rounded-full bg-muted p-6">
          <component 
            :is="getIconComponent(currentEmptyIcon)" 
            v-if="getIconComponent(currentEmptyIcon)"
            class="h-12 w-12 text-muted-foreground/60"
          />
        </div>
        <div class="space-y-1">
          <p class="text-sm font-medium text-muted-foreground">{{ currentEmptyText }}</p>
          <slot name="empty-action" />
        </div>
      </div>
    </div>
    
    <!-- 文本内容 -->
    <div v-else-if="currentText" class="flex flex-1 items-center justify-center">
      <div class="text-center px-4">
        <p class="text-muted-foreground">{{ currentText }}</p>
      </div>
    </div>
    
    <!-- 默认内容插槽 -->
    <div v-else class="flex flex-1 flex-col w-full">
      <slot />
    </div>
  </main>
</template>
