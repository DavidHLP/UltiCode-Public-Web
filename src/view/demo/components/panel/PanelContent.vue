<script setup lang="ts">
import { computed } from "vue";
import type { HeaderModel } from "@/stores/headerStore";

// 接收活动头部作为属性
const props = defineProps<{
  activeHeader: HeaderModel | null;
  isActive?: boolean; // 当前组是否为激活状态
}>();

const content = computed(() => {
  if (!props.activeHeader) {
    return "请选择一个选项";
  }
  
  return props.activeHeader.title;
});
</script>

<template>
  <div class="p-4 h-full w-full bg-[#ffffff]">
    <div class="border-2 border-dashed border-muted-foreground rounded-lg p-8 h-full w-full flex items-center justify-center bg-[#ffffff]">
      <p class="text-center text-muted-foreground">{{ content }}</p>
    </div>
  </div>
</template>