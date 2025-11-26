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
  
  return `你选择了: ${props.activeHeader.title}`;
});
</script>

<template>
  <div class="p-4 h-full">
    <div class="border rounded p-4 min-h-[200px]">
      <p>{{ content }}</p>
    </div>
  </div>
</template>