<script setup lang="ts">
import { computed } from 'vue';
import HeaderComponent from './HeaderComponent.vue';
import MainComponent from './MainComponent.vue';
import FooterComponent from './FooterComponent.vue';
import type { LayoutProps } from '../composables/types';
import { useDemoStore } from '@/view/demo';
import { storeToRefs } from 'pinia';

defineOptions({
  name: "LayoutComponent"
});

interface LayoutComponentProps extends Partial<LayoutProps> {
  useStore?: boolean; // 是否使用 Pinia store
}

const props = withDefaults(defineProps<LayoutComponentProps>(), {
  rounded: true,
  bordered: true,
  shadow: false,
  headerVariant: 'default',
  footerAlign: 'left',
  footerVariant: 'default',
  useStore: false
});

const emit = defineEmits<{
  (e: 'headerClick', index: number): void;
}>();

// 使用 Pinia store（可选）
const demoStore = useDemoStore();
const { 
  headers: storeHeaders,
  headerVariant: storeHeaderVariant,
  footerActions: storeFooterActions,
  footerAlign: storeFooterAlign,
  footerVariant: storeFooterVariant,
  rounded: storeRounded,
  bordered: storeBordered,
  shadow: storeShadow,
  mainText: storeMainText,
  loading: storeLoading,
  empty: storeEmpty,
  emptyText: storeEmptyText,
  emptyIcon: storeEmptyIcon
} = storeToRefs(demoStore);

// 根据配置选择数据源
const currentHeaders = computed(() => props.useStore ? storeHeaders.value : props.headers);
const currentHeaderVariant = computed(() => props.useStore ? storeHeaderVariant.value : props.headerVariant);
const currentFooterActions = computed(() => props.useStore ? storeFooterActions.value : props.footerActions);
const currentFooterAlign = computed(() => props.useStore ? storeFooterAlign.value : props.footerAlign);
const currentFooterVariant = computed(() => props.useStore ? storeFooterVariant.value : props.footerVariant);
const currentRounded = computed(() => props.useStore ? storeRounded.value : props.rounded);
const currentBordered = computed(() => props.useStore ? storeBordered.value : props.bordered);
const currentShadow = computed(() => props.useStore ? storeShadow.value : props.shadow);
const currentMainText = computed(() => props.useStore ? storeMainText.value : props.text);
const currentLoading = computed(() => props.useStore ? storeLoading.value : props.loading);
const currentEmpty = computed(() => props.useStore ? storeEmpty.value : props.empty);
const currentEmptyText = computed(() => props.useStore ? storeEmptyText.value : props.emptyText);
const currentEmptyIcon = computed(() => props.useStore ? storeEmptyIcon.value : props.emptyIcon);

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
      'rounded-lg': currentRounded,
      'border': currentBordered,
      'shadow-md': currentShadow
    }"
  >
    <HeaderComponent 
      :headers="currentHeaders" 
      :variant="currentHeaderVariant"
      :use-store="props.useStore"
      @click="handleHeaderClick" 
    />
    <MainComponent 
      :text="currentMainText"
      :loading="currentLoading"
      :empty="currentEmpty"
      :empty-text="currentEmptyText"
      :empty-icon="currentEmptyIcon"
      :use-store="props.useStore"
    >
      <slot />
      <template #empty-action>
        <slot name="empty-action" />
      </template>
    </MainComponent>
    <FooterComponent 
      :actions="currentFooterActions"
      :align="currentFooterAlign"
      :variant="currentFooterVariant"
      :use-store="props.useStore"
    >
      <slot name="footer" />
    </FooterComponent>
  </div>
</template>