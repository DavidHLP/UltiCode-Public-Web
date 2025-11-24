import type { Component } from "vue";
import * as LucideIcons from "lucide-vue-next";
import type { HeaderModel, HeaderVariant } from "./types.ts";

/**
 * Demo UI 相关 Composable
 * 统一管理图标和样式逻辑
 */
export function useDemoUI() {
  // ==================== 图标处理 ====================
  
  /**
   * 根据图标名称获取对应的 Lucide 图标组件
   */
  const getIconComponent = (iconName?: string): Component | null => {
    if (!iconName) return null;
    
    const icon = (LucideIcons as Record<string, unknown>)[iconName];
    
    if (icon && (typeof icon === "object" || typeof icon === "function")) {
      return icon as Component;
    }
    
    return null;
  };

  // ==================== Header 样式处理 ====================
  
  const baseClasses = "flex items-center gap-1.5 transition-all duration-200 select-none";

  /**
   * 根据 header 状态和变体获取对应的样式类
   */
  const getHeaderClasses = (header: HeaderModel, variant: HeaderVariant = 'default') => {
    // 禁用状态
    if (header.disabled) {
      return `${baseClasses} opacity-40 cursor-not-allowed`;
    }
    
    // 激活状态
    if (header.active) {
      switch (variant) {
        case 'tabs':
          return `${baseClasses} cursor-pointer border-b-2 border-primary text-primary font-medium px-3 py-2 -mb-px`;
        case 'pills':
          return `${baseClasses} cursor-pointer bg-primary text-primary-foreground rounded-full px-4 py-1.5 font-medium shadow-sm`;
        default:
          return `${baseClasses} cursor-pointer bg-accent text-accent-foreground rounded-md px-3 py-1.5 font-medium`;
      }
    }
    
    // 普通状态
    switch (variant) {
      case 'tabs':
        return `${baseClasses} cursor-pointer hover:text-primary hover:border-b-2 hover:border-border px-3 py-2 -mb-px text-muted-foreground`;
      case 'pills':
        return `${baseClasses} cursor-pointer hover:bg-muted rounded-full px-4 py-1.5 text-muted-foreground hover:text-foreground`;
      default:
        return `${baseClasses} cursor-pointer hover:bg-accent/50 hover:text-accent-foreground rounded-md px-3 py-1.5 text-muted-foreground`;
    }
  };

  return {
    getIconComponent,
    getHeaderClasses
  };
}
