<script setup lang="ts">
import { computed, inject, type Component } from "vue";

import type { HeaderModel } from "@/stores/headerStore";

// Receive active header as property
const props = defineProps<{
  activeHeader: HeaderModel | null;
  isActive?: boolean; // Whether the current group is active
}>();

// Inject the component map from the parent view (DetailedView)
const panelComponentMap =
  inject<Record<number, Component>>("panelComponentMap");

const contentComponent = computed(() => {
  if (!props.activeHeader || !panelComponentMap) return null;
  return panelComponentMap[props.activeHeader.id];
});

const content = computed(() => {
  if (!props.activeHeader) {
    return "Please select an option";
  }
  return props.activeHeader.title;
});
</script>

<template>
  <div class="h-full w-full bg-[#ffffff]">
    <component
      v-if="contentComponent"
      :is="contentComponent"
      class="h-full w-full"
    />
    <div
      v-else
      class="border-2 border-dashed border-muted-foreground rounded-lg p-8 h-full w-full flex items-center justify-center bg-[#ffffff]"
    >
      <p class="text-center text-muted-foreground">{{ content }}</p>
    </div>
  </div>
</template>
