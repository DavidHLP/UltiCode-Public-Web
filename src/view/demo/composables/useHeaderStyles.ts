import type { HeaderModel, HeaderVariant } from ".";

/**
 * Header 样式管理 Composable
 * 根据不同变体和状态生成对应的样式类
 */
export function useHeaderStyles() {
  const baseClasses = "flex items-center gap-1.5 transition-all duration-200 select-none";

  /**
   * 获取禁用状态的样式
   */
  const getDisabledClasses = () => {
    return `${baseClasses} opacity-40 cursor-not-allowed`;
  };

  /**
   * 获取激活状态的样式
   */
  const getActiveClasses = (variant: HeaderVariant) => {
    switch (variant) {
      case 'tabs':
        return `${baseClasses} cursor-pointer border-b-2 border-primary text-primary font-medium px-3 py-2 -mb-px`;
      case 'pills':
        return `${baseClasses} cursor-pointer bg-primary text-primary-foreground rounded-full px-4 py-1.5 font-medium shadow-sm`;
      default:
        return `${baseClasses} cursor-pointer bg-accent text-accent-foreground rounded-md px-3 py-1.5 font-medium`;
    }
  };

  /**
   * 获取普通状态的样式
   */
  const getNormalClasses = (variant: HeaderVariant) => {
    switch (variant) {
      case 'tabs':
        return `${baseClasses} cursor-pointer hover:text-primary hover:border-b-2 hover:border-border px-3 py-2 -mb-px text-muted-foreground`;
      case 'pills':
        return `${baseClasses} cursor-pointer hover:bg-muted rounded-full px-4 py-1.5 text-muted-foreground hover:text-foreground`;
      default:
        return `${baseClasses} cursor-pointer hover:bg-accent/50 hover:text-accent-foreground rounded-md px-3 py-1.5 text-muted-foreground`;
    }
  };

  /**
   * 根据 header 状态和变体获取对应的样式类
   */
  const getVariantClasses = (header: HeaderModel, variant: HeaderVariant = 'default') => {
    if (header.disabled) {
      return getDisabledClasses();
    }
    
    if (header.active) {
      return getActiveClasses(variant);
    }
    
    return getNormalClasses(variant);
  };

  return {
    getVariantClasses
  };
}
