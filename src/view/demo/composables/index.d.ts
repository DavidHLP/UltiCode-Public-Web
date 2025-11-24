/**
 * Header 变体类型
 */
export type HeaderVariant = 'default' | 'tabs' | 'pills';

/**
 * Footer 对齐方式
 */
export type FooterAlign = 'left' | 'center' | 'right' | 'space-between';

/**
 * Footer 变体类型
 */
export type FooterVariant = 'default' | 'elevated' | 'bordered';

/**
 * 按钮变体类型
 */
export type ButtonVariant = 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link';

/**
 * Header 模型接口
 */
export interface HeaderModel {
  /** Header 索引 */
  index: number;
  /** 标题文本 */
  title: string;
  /** Lucide 图标名称 */
  icon: string;
  /** TailwindCSS 颜色类，如 'text-blue-500', 'text-green-600' 等 */
  color?: string;
  /** 徽章内容 */
  badge?: string | number;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否激活 */
  active?: boolean;
  /** 提示文本 */
  tooltip?: string;
}

/**
 * 主内容区域 Props
 */
export interface MainContentProps {
  /** 文本内容 */
  text?: string;
  /** 是否加载中 */
  loading?: boolean;
  /** 是否为空状态 */
  empty?: boolean;
  /** 空状态提示文本 */
  emptyText?: string;
  /** 空状态图标名称 */
  emptyIcon?: string;
}

/**
 * Footer 操作按钮配置
 */
export interface FooterAction {
  /** 按钮文本 */
  label: string;
  /** Lucide 图标名称 */
  icon?: string;
  /** 按钮变体 */
  variant?: ButtonVariant;
  /** 点击事件处理函数 */
  onClick?: () => void;
}

/**
 * Layout 组件 Props
 */
export interface LayoutProps extends Partial<MainContentProps> {
  /** Header 配置列表 */
  headers: HeaderModel[];
  /** Header 变体 */
  headerVariant?: HeaderVariant;
  /** Footer 操作按钮列表 */
  footerActions?: FooterAction[];
  /** Footer 对齐方式 */
  footerAlign?: FooterAlign;
  /** Footer 变体 */
  footerVariant?: FooterVariant;
  /** 是否圆角 */
  rounded?: boolean;
  /** 是否显示边框 */
  bordered?: boolean;
  /** 是否显示阴影 */
  shadow?: boolean;
}
