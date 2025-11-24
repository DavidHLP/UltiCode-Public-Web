import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type {
  HeaderModel,
  HeaderVariant,
  FooterAction,
  FooterAlign,
  FooterVariant,
  MainContentProps
} from '../composables/types';

/**
 * Demo 模块状态管理 Store
 * 管理 Header、Main、Footer 组件的状态和交互
 */
export const useDemoStore = defineStore('demo', () => {
  // ==================== Header 状态 ====================
  
  /** Header 配置列表 */
  const headers = ref<HeaderModel[]>([]);
  
  /** Header 变体 */
  const headerVariant = ref<HeaderVariant>('default');
  
  /** 当前激活的 Header 索引 */
  const activeHeaderIndex = ref<number>(0);

  // ==================== Main 状态 ====================
  
  /** 主内容区域配置 */
  const mainText = ref<string>();
  const loading = ref<boolean>(false);
  const empty = ref<boolean>(false);
  const emptyText = ref<string>('暂无数据');
  const emptyIcon = ref<string>('Inbox');

  // ==================== Footer 状态 ====================
  
  /** Footer 配置 */
  const footerActions = ref<FooterAction[]>([]);
  const footerAlign = ref<FooterAlign>('left');
  const footerVariant = ref<FooterVariant>('default');

  // ==================== Layout 状态 ====================
  
  /** 布局样式 */
  const rounded = ref<boolean>(true);
  const bordered = ref<boolean>(true);
  const shadow = ref<boolean>(false);

  // ==================== 计算属性 ====================
  
  /** 当前激活的 Header */
  const activeHeader = computed(() => {
    return headers.value.find(h => h.index === activeHeaderIndex.value);
  });

  /** 主内容区域 Props */
  const mainContentProps = computed<Partial<MainContentProps>>(() => ({
    text: mainText.value,
    loading: loading.value,
    empty: empty.value,
    emptyText: emptyText.value,
    emptyIcon: emptyIcon.value
  }));

  /** 已启用的 Headers 数量 */
  const enabledHeadersCount = computed(() => {
    return headers.value.filter(h => !h.disabled).length;
  });

  // ==================== Actions ====================

  /**
   * 设置 Headers（支持批量设置）
   */
  const setHeaders = (newHeaders: HeaderModel[], variant?: HeaderVariant) => {
    headers.value = newHeaders;
    if (variant) headerVariant.value = variant;
  };

  /**
   * 更新指定 Header
   */
  const updateHeader = (index: number, updates: Partial<HeaderModel>) => {
    const headerIndex = headers.value.findIndex(h => h.index === index);
    if (headerIndex !== -1) {
      headers.value[headerIndex] = {
        ...headers.value[headerIndex],
        ...updates
      } as HeaderModel;
    }
  };

  /**
   * 激活指定 Header
   */
  const activateHeader = (index: number) => {
    headers.value = headers.value.map(h => ({
      ...h,
      active: h.index === index
    }));
    activeHeaderIndex.value = index;
  };

  /**
   * 设置主内容配置
   */
  const setMainContent = (config: Partial<MainContentProps>) => {
    if (config.text !== undefined) mainText.value = config.text;
    if (config.loading !== undefined) loading.value = config.loading;
    if (config.empty !== undefined) empty.value = config.empty;
    if (config.emptyText !== undefined) emptyText.value = config.emptyText;
    if (config.emptyIcon !== undefined) emptyIcon.value = config.emptyIcon;
  };

  /**
   * 设置 Footer 配置
   */
  const setFooter = (
    actions?: FooterAction[], 
    align?: FooterAlign, 
    variant?: FooterVariant
  ) => {
    if (actions !== undefined) footerActions.value = actions;
    if (align !== undefined) footerAlign.value = align;
    if (variant !== undefined) footerVariant.value = variant;
  };

  /**
   * 设置布局样式
   */
  const setLayoutStyle = (style: {
    rounded?: boolean;
    bordered?: boolean;
    shadow?: boolean;
  }) => {
    if (style.rounded !== undefined) rounded.value = style.rounded;
    if (style.bordered !== undefined) bordered.value = style.bordered;
    if (style.shadow !== undefined) shadow.value = style.shadow;
  };

  /**
   * 重置所有状态
   */
  const reset = () => {
    headers.value = [];
    headerVariant.value = 'default';
    activeHeaderIndex.value = 0;
    mainText.value = undefined;
    loading.value = false;
    empty.value = false;
    emptyText.value = '暂无数据';
    emptyIcon.value = 'Inbox';
    footerActions.value = [];
    footerAlign.value = 'left';
    footerVariant.value = 'default';
    rounded.value = true;
    bordered.value = true;
    shadow.value = false;
  };

  /**
   * 初始化默认配置
   */
  const initialize = () => {
    setHeaders([
      { index: 0, title: '首页', icon: 'Home', active: true },
      { index: 1, title: '列表', icon: 'List' },
      { index: 2, title: '设置', icon: 'Settings' }
    ]);

    setFooter([
      {
        label: '取消',
        variant: 'ghost',
        onClick: () => console.log('取消')
      },
      {
        label: '确认',
        variant: 'default',
        onClick: () => console.log('确认')
      }
    ]);
  };

  return {
    // State
    headers,
    headerVariant,
    activeHeaderIndex,
    mainText,
    loading,
    empty,
    emptyText,
    emptyIcon,
    footerActions,
    footerAlign,
    footerVariant,
    rounded,
    bordered,
    shadow,

    // Computed
    activeHeader,
    mainContentProps,
    enabledHeadersCount,

    // Actions
    setHeaders,
    updateHeader,
    activateHeader,
    setMainContent,
    setFooter,
    setLayoutStyle,
    reset,
    initialize
  };
});
