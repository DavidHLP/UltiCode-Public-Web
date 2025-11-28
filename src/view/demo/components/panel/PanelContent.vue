<script setup lang="ts">
import { computed } from "vue";
import type { HeaderModel } from "@/stores/headerStore";

// Receive active header as property
const props = defineProps<{
  activeHeader: HeaderModel | null;
  isActive?: boolean; // Whether the current group is active
}>();

const content = computed(() => {
  if (!props.activeHeader) {
    return "Please select an option";
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