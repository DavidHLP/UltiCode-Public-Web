export interface HeaderModel {
  index: number;
  title: string;
  icon: string;
  color?: string; // TailwindCSS 颜色类，如 'text-blue-500', 'text-green-600' 等
  badge?: string | number; // 徽章内容
  disabled?: boolean; // 是否禁用
  active?: boolean; // 是否激活
  tooltip?: string; // 提示文本
}

export interface MainContentProps {
  text?: string;
  loading?: boolean;
  empty?: boolean;
  emptyText?: string;
  emptyIcon?: string;
}

export interface FooterAction {
  label: string;
  icon?: string;
  variant?: 'default' | 'secondary' | 'outline' | 'ghost';
  onClick?: () => void;
}
