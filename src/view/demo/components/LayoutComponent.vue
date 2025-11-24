<script setup lang="ts">
import HeaderComponent from './HeaderComponent.vue';
import MainComponent from './MainComponent.vue';
import FooterComponent from './FooterComponent.vue';
import type { HeaderModel, FooterAction, MainContentProps } from '../composables/types';

defineOptions({
  name: "LayoutComponent"
});

interface LayoutProps extends Partial<MainContentProps> {
  headers: HeaderModel[];
  headerVariant?: 'default' | 'tabs' | 'pills';
  footerActions?: FooterAction[];
  footerAlign?: 'left' | 'center' | 'right' | 'space-between';
  footerVariant?: 'default' | 'elevated' | 'bordered';
  rounded?: boolean;
  bordered?: boolean;
  shadow?: boolean;
}

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

const handleHeaderClick = (index: number) => {
  emit('headerClick', index);
};
</script>

<template>
  <div 
    class="flex flex-col h-full overflow-hidden"
    :class="{
      'rounded-lg': rounded,
      'border': bordered,
      'shadow-md': shadow
    }"
  >
    <HeaderComponent 
      :headers="headers" 
      :variant="headerVariant"
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
      :actions="footerActions"
      :align="footerAlign"
      :variant="footerVariant"
    >
      <slot name="footer" />
    </FooterComponent>
  </div>
</template>