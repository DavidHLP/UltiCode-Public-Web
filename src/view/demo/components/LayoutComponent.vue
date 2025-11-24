<script setup lang="ts">
import HeaderComponent from './HeaderComponent.vue';
import MainComponent from './MainComponent.vue';
import FooterComponent from './FooterComponent.vue';
import type { HeaderModel } from './types';

defineOptions({
  name: "LayoutComponent"
});

defineProps<{
  headers: HeaderModel[];
  mainText?: string;
}>();

const emit = defineEmits<{
  (e: 'headerClick', index: number): void;
}>();

const handleHeaderClick = (index: number) => {
  emit('headerClick', index);
};
</script>

<template>
  <div class="flex flex-col h-full">
    <HeaderComponent :headers="headers" @click="handleHeaderClick" />
    <MainComponent :text="mainText">
      <slot />
    </MainComponent>
    <FooterComponent>
      <slot name="footer" />
    </FooterComponent>
  </div>
</template>