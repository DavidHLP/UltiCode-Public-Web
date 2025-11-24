<script setup lang="ts">
defineProps<{
  text?: string;
}>();
</script>

<template>
  <main class="flex flex-1 min-h-0 items-center justify-center overflow-auto">
    <div v-if="text" class="text-muted-foreground">{{ text }}</div>
    <slot v-else />
  </main>
</template>
