/**
 * Demo 模块统一导出
 */

// 类型导出
export type {
  HeaderModel,
  HeaderVariant,
  MainContentProps,
  FooterAction,
  FooterAlign,
  FooterVariant,
  ButtonVariant,
  LayoutProps
} from './types';

// Composables 导出
export { useDemoUI } from './useDemoUI';
