import type { Component } from "vue";
import * as LucideIcons from "lucide-vue-next";

/**
 * 图标处理 Composable
 * 提供统一的图标组件获取逻辑
 */
export function useIcon() {
  /**
   * 根据图标名称获取对应的 Lucide 图标组件
   * @param iconName - Lucide 图标名称
   * @returns 图标组件或 null
   */
  const getIconComponent = (iconName?: string): Component | null => {
    if (!iconName) return null;
    
    const icon = (LucideIcons as Record<string, unknown>)[iconName];
    
    // 检查是否是有效的组件（可以是对象或函数）
    if (icon && (typeof icon === "object" || typeof icon === "function")) {
      return icon as Component;
    }
    
    return null;
  };

  return {
    getIconComponent
  };
}
