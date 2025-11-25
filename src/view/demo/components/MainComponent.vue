<script setup lang="ts">
import { inject, type Ref } from "vue";
import type { HeaderModel } from "@/stores/headerStore";

interface SelectedHeader {
  header: HeaderModel | null;
  group: string | null;
}

const selectedHeader = inject<Ref<SelectedHeader>>('selectedHeader');

const getContentForHeader = () => {
  if (!selectedHeader?.value.header) {
    return "请选择一个选项";
  }

  return `你选择了: ${selectedHeader.value.header.title}`;
};
</script>

<template>
  <div class="p-4">
    <h2 class="text-xl font-bold mb-4">主要内容区域</h2>
    <div class="border rounded p-4 min-h-[200px]">
      <p>{{ getContentForHeader() }}</p>
    </div>
  </div>
</template>