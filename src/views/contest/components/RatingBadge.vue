<script setup lang="ts">
import { computed } from "vue";
import {
  getRatingTitle,
  getRatingColor,
  RATING_DISPLAY_NAMES,
} from "@/types/contest";

const props = defineProps<{
  rating: number;
  showTitle?: boolean;
  size?: "sm" | "md" | "lg";
}>();

const title = computed(() => getRatingTitle(props.rating));
const color = computed(() => getRatingColor(props.rating));
const displayName = computed(() => RATING_DISPLAY_NAMES[title.value]);

const sizeClasses = computed(() => {
  switch (props.size) {
    case "sm":
      return "text-xs px-1.5 py-0.5";
    case "lg":
      return "text-base px-3 py-1.5";
    default:
      return "text-sm px-2 py-1";
  }
});
</script>

<template>
  <div class="inline-flex items-center gap-1.5">
    <span
      class="font-bold rounded"
      :class="sizeClasses"
      :style="{ color: color }"
    >
      {{ rating }}
    </span>
    <span v-if="showTitle" class="text-xs text-muted-foreground font-medium">
      {{ displayName }}
    </span>
  </div>
</template>
