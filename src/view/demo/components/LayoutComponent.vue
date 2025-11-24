<script setup lang="ts">
import HeaderComponent from './HeaderComponent.vue';
import MainComponent from './MainComponent.vue';
import FooterComponent from './FooterComponent.vue';
import type { LayoutProps } from '../composables';

defineOptions({
  name: "LayoutComponent"
});

const props = withDefaults(defineProps<LayoutProps>(), {
  rounded: true,
  bordered: true,
  shadow: false,
  headerVariant: 'default',
  footerAlign: 'left',
  footerVariant: 'default'
});

const emit = defineEmits<{
  (e: 'headerClick', index: number): void;
}>();

/**
 * 处理 header 点击事件
 */
const handleHeaderClick = (index: number) => {
  emit('headerClick', index);
};
</script>

<template>
  <div 
    class="flex flex-col h-full overflow-hidden"
    :class="{
      'rounded-lg': props.rounded,
      'border': props.bordered,
      'shadow-md': props.shadow
    }"
  >
    <HeaderComponent 
      :headers="props.headers" 
      :variant="props.headerVariant"
      @click="handleHeaderClick" 
    />
    <MainComponent 
      :text="props.text"
      :loading="props.loading"
      :empty="props.empty"
      :empty-text="props.emptyText"
      :empty-icon="props.emptyIcon"
    >
      <slot />
      <template #empty-action>
        <slot name="empty-action" />
      </template>
    </MainComponent>
    <FooterComponent 
      :actions="props.footerActions"
      :align="props.footerAlign"
      :variant="props.footerVariant"
    >
      <slot name="footer" />
    </FooterComponent>
  </div>
</template>