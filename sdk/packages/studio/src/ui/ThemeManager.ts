/**
 * @fileoverview ThemeManager - 主题系统管理器
 * @version 1.1.0-beta
 * @based_on MPLP V1.0 Alpha主题管理模式
 */

import { MPLPEventManager } from '../core/MPLPEventManager';
import { StudioConfig, IStudioManager } from '../types/studio';

/**
 * 主题定义接口
 */
export interface Theme {
  id: string;
  name: string;
  description: string;
  type: 'light' | 'dark' | 'auto';
  colors: {
    // 基础颜色
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    danger: string;
    info: string;
    
    // 背景颜色
    background: string;
    surface: string;
    card: string;
    
    // 文本颜色
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    
    // 边框颜色
    border: string;
    borderLight: string;
    borderDark: string;
    
    // 状态颜色
    hover: string;
    active: string;
    focus: string;
    disabled: string;
    
    // 特殊颜色
    shadow: string;
    overlay: string;
  };
  fonts: {
    primary: string;
    secondary: string;
    monospace: string;
    sizes: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
      xxl: string;
    };
    weights: {
      light: number;
      normal: number;
      medium: number;
      semibold: number;
      bold: number;
    };
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    xxl: string;
  };
  borderRadius: {
    none: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    full: string;
  };
  shadows: {
    none: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}

/**
 * 主题管理器配置接口
 */
export interface ThemeManagerConfig {
  defaultTheme: string;
  autoDetectSystemTheme: boolean;
  persistThemeChoice: boolean;
  storageKey: string;
  transitionDuration: number;
  customCSSProperties: boolean;
}

/**
 * ThemeManager组件 - 基于MPLP V1.0 Alpha主题管理模式
 * 提供完整的主题系统和动态切换功能
 */
export class ThemeManager implements IStudioManager {
  private eventManager: MPLPEventManager;
  private config: StudioConfig;
  private _isInitialized = false;
  
  // 主题管理状态
  private themeConfig: ThemeManagerConfig;
  private themes = new Map<string, Theme>();
  private currentTheme: Theme | null = null;
  private systemThemeMediaQuery: MediaQueryList | null = null;
  
  // DOM元素
  private styleElement: HTMLStyleElement | null = null;

  constructor(config: StudioConfig, eventManager: MPLPEventManager) {
    this.config = config;
    this.eventManager = eventManager;
    
    // 初始化主题管理器配置
    this.themeConfig = {
      defaultTheme: 'light',
      autoDetectSystemTheme: true,
      persistThemeChoice: true,
      storageKey: 'mplp-studio-theme',
      transitionDuration: 200,
      customCSSProperties: true
    };
    
    // 初始化默认主题
    this.initializeDefaultThemes();
  }

  // ===== IStudioManager接口实现 =====

  /**
   * 获取状态
   */
  public getStatus(): string {
    return this._isInitialized ? 'initialized' : 'not_initialized';
  }

  /**
   * 初始化
   */
  public async initialize(): Promise<void> {
    if (this._isInitialized) {
      return;
    }

    try {
      // 创建样式元素
      this.createStyleElement();
      
      // 设置系统主题检测
      this.setupSystemThemeDetection();
      
      // 加载保存的主题或使用默认主题
      const savedTheme = this.loadSavedTheme();
      const themeToApply = savedTheme || this.themeConfig.defaultTheme;
      
      // 应用主题
      await this.applyTheme(themeToApply);
      
      this._isInitialized = true;
      this.emitEvent('themeManagerInitialized', { 
        managerId: 'theme-manager',
        currentTheme: this.currentTheme?.id,
        config: this.themeConfig 
      });
      
    } catch (error) {
      throw new Error(`Failed to initialize ThemeManager: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * 关闭
   */
  public async shutdown(): Promise<void> {
    if (!this._isInitialized) {
      return;
    }

    try {
      // 清理系统主题检测
      if (this.systemThemeMediaQuery) {
        this.systemThemeMediaQuery.removeEventListener('change', this.handleSystemThemeChange.bind(this));
      }
      
      // 清理样式元素
      if (this.styleElement && this.styleElement.parentNode) {
        this.styleElement.parentNode.removeChild(this.styleElement);
      }
      
      this._isInitialized = false;
      this.emitEvent('themeManagerShutdown', { managerId: 'theme-manager' });
      
    } catch (error) {
      throw new Error(`Failed to shutdown ThemeManager: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ===== EventEmitter接口实现 =====

  public on(event: string, listener: (...args: any[]) => void): this {
    this.eventManager.on(event, listener);
    return this;
  }

  public emit(event: string, ...args: any[]): boolean {
    return this.eventManager.emit(event, ...args);
  }

  public off(event: string, listener: (...args: any[]) => void): this {
    this.eventManager.off(event, listener);
    return this;
  }

  public removeAllListeners(event?: string): this {
    this.eventManager.removeAllListeners(event);
    return this;
  }

  // ===== 私有辅助方法 =====

  /**
   * 发射事件
   */
  private emitEvent(eventType: string, data: any): void {
    this.eventManager.emit(`theme:${eventType}`, data);
  }

  /**
   * 初始化默认主题
   */
  private initializeDefaultThemes(): void {
    // 浅色主题
    const lightTheme: Theme = {
      id: 'light',
      name: 'Light Theme',
      description: 'Clean and bright theme for daytime use',
      type: 'light',
      colors: {
        primary: '#007bff',
        secondary: '#6c757d',
        success: '#28a745',
        warning: '#ffc107',
        danger: '#dc3545',
        info: '#17a2b8',
        
        background: '#ffffff',
        surface: '#f8f9fa',
        card: '#ffffff',
        
        textPrimary: '#212529',
        textSecondary: '#495057',
        textMuted: '#6c757d',
        
        border: '#dee2e6',
        borderLight: '#e9ecef',
        borderDark: '#adb5bd',
        
        hover: '#e9ecef',
        active: '#dee2e6',
        focus: '#80bdff',
        disabled: '#e9ecef',
        
        shadow: 'rgba(0, 0, 0, 0.1)',
        overlay: 'rgba(0, 0, 0, 0.5)'
      },
      fonts: {
        primary: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        secondary: 'Georgia, "Times New Roman", Times, serif',
        monospace: 'SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
        sizes: {
          xs: '0.75rem',
          sm: '0.875rem',
          md: '1rem',
          lg: '1.125rem',
          xl: '1.25rem',
          xxl: '1.5rem'
        },
        weights: {
          light: 300,
          normal: 400,
          medium: 500,
          semibold: 600,
          bold: 700
        }
      },
      spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
        xxl: '3rem'
      },
      borderRadius: {
        none: '0',
        sm: '0.125rem',
        md: '0.25rem',
        lg: '0.5rem',
        xl: '1rem',
        full: '9999px'
      },
      shadows: {
        none: 'none',
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }
    };

    // 深色主题
    const darkTheme: Theme = {
      id: 'dark',
      name: 'Dark Theme',
      description: 'Dark theme for comfortable nighttime use',
      type: 'dark',
      colors: {
        primary: '#0d6efd',
        secondary: '#6c757d',
        success: '#198754',
        warning: '#ffc107',
        danger: '#dc3545',
        info: '#0dcaf0',
        
        background: '#121212',
        surface: '#1e1e1e',
        card: '#2d2d2d',
        
        textPrimary: '#ffffff',
        textSecondary: '#e0e0e0',
        textMuted: '#9e9e9e',
        
        border: '#404040',
        borderLight: '#505050',
        borderDark: '#303030',
        
        hover: '#333333',
        active: '#404040',
        focus: '#4dabf7',
        disabled: '#404040',
        
        shadow: 'rgba(0, 0, 0, 0.3)',
        overlay: 'rgba(0, 0, 0, 0.7)'
      },
      fonts: lightTheme.fonts, // 使用相同的字体配置
      spacing: lightTheme.spacing, // 使用相同的间距配置
      borderRadius: lightTheme.borderRadius, // 使用相同的圆角配置
      shadows: {
        none: 'none',
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.3)'
      }
    };

    // 自动主题（跟随系统）
    const autoTheme: Theme = {
      id: 'auto',
      name: 'Auto Theme',
      description: 'Automatically follows system theme preference',
      type: 'auto',
      colors: lightTheme.colors, // 默认使用浅色，会根据系统自动切换
      fonts: lightTheme.fonts,
      spacing: lightTheme.spacing,
      borderRadius: lightTheme.borderRadius,
      shadows: lightTheme.shadows
    };

    // 注册主题
    this.themes.set(lightTheme.id, lightTheme);
    this.themes.set(darkTheme.id, darkTheme);
    this.themes.set(autoTheme.id, autoTheme);
  }

  /**
   * 创建样式元素
   */
  private createStyleElement(): void {
    this.styleElement = document.createElement('style');
    this.styleElement.id = 'mplp-theme-styles';
    document.head.appendChild(this.styleElement);
  }

  /**
   * 设置系统主题检测
   */
  private setupSystemThemeDetection(): void {
    if (!this.themeConfig.autoDetectSystemTheme) return;

    this.systemThemeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    this.systemThemeMediaQuery.addEventListener('change', this.handleSystemThemeChange.bind(this));
  }

  /**
   * 处理系统主题变化
   */
  private handleSystemThemeChange(event: MediaQueryListEvent): void {
    if (this.currentTheme?.type === 'auto') {
      // 重新应用自动主题
      this.applyTheme('auto');
    }
  }

  /**
   * 加载保存的主题
   */
  private loadSavedTheme(): string | null {
    if (!this.themeConfig.persistThemeChoice) return null;

    try {
      return localStorage.getItem(this.themeConfig.storageKey);
    } catch {
      return null;
    }
  }

  /**
   * 保存主题选择
   */
  private saveThemeChoice(themeId: string): void {
    if (!this.themeConfig.persistThemeChoice) return;

    try {
      localStorage.setItem(this.themeConfig.storageKey, themeId);
    } catch {
      // 忽略存储错误
    }
  }

  /**
   * 应用主题
   */
  public async applyTheme(themeId: string): Promise<void> {
    const theme = this.themes.get(themeId);
    if (!theme) {
      throw new Error(`Theme not found: ${themeId}`);
    }

    // 处理自动主题
    let actualTheme = theme;
    if (theme.type === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const autoThemeId = prefersDark ? 'dark' : 'light';
      actualTheme = this.themes.get(autoThemeId) || theme;
    }

    // 生成CSS变量
    const cssVariables = this.generateCSSVariables(actualTheme);
    
    // 应用样式
    if (this.styleElement) {
      this.styleElement.textContent = cssVariables;
    }

    // 添加过渡效果
    if (this.themeConfig.transitionDuration > 0) {
      document.body.style.transition = `all ${this.themeConfig.transitionDuration}ms ease`;
      setTimeout(() => {
        document.body.style.transition = '';
      }, this.themeConfig.transitionDuration);
    }

    // 更新body类名
    document.body.className = document.body.className.replace(/theme-\w+/g, '');
    document.body.classList.add(`theme-${actualTheme.type}`);

    // 保存主题选择
    this.saveThemeChoice(themeId);

    // 更新当前主题
    const previousTheme = this.currentTheme;
    this.currentTheme = theme;

    // 发射主题变化事件
    this.emitEvent('themeChanged', {
      previousTheme: previousTheme?.id,
      currentTheme: theme.id,
      actualTheme: actualTheme.id,
      theme: actualTheme
    });
  }

  /**
   * 生成CSS变量
   */
  private generateCSSVariables(theme: Theme): string {
    const variables: string[] = [];

    // 颜色变量
    Object.entries(theme.colors).forEach(([key, value]) => {
      variables.push(`--mplp-color-${this.kebabCase(key)}: ${value};`);
    });

    // 字体变量
    variables.push(`--mplp-font-primary: ${theme.fonts.primary};`);
    variables.push(`--mplp-font-secondary: ${theme.fonts.secondary};`);
    variables.push(`--mplp-font-monospace: ${theme.fonts.monospace};`);

    Object.entries(theme.fonts.sizes).forEach(([key, value]) => {
      variables.push(`--mplp-font-size-${key}: ${value};`);
    });

    Object.entries(theme.fonts.weights).forEach(([key, value]) => {
      variables.push(`--mplp-font-weight-${key}: ${value};`);
    });

    // 间距变量
    Object.entries(theme.spacing).forEach(([key, value]) => {
      variables.push(`--mplp-spacing-${key}: ${value};`);
    });

    // 圆角变量
    Object.entries(theme.borderRadius).forEach(([key, value]) => {
      variables.push(`--mplp-border-radius-${key}: ${value};`);
    });

    // 阴影变量
    Object.entries(theme.shadows).forEach(([key, value]) => {
      variables.push(`--mplp-shadow-${key}: ${value};`);
    });

    return `:root {\n  ${variables.join('\n  ')}\n}`;
  }

  /**
   * 转换为kebab-case
   */
  private kebabCase(str: string): string {
    return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
  }

  // ===== 公共API方法 =====

  /**
   * 获取当前主题
   */
  public getCurrentTheme(): Theme | null {
    return this.currentTheme;
  }

  /**
   * 获取所有主题
   */
  public getAllThemes(): Theme[] {
    return Array.from(this.themes.values());
  }

  /**
   * 添加自定义主题
   */
  public addTheme(theme: Theme): void {
    this.themes.set(theme.id, theme);
    this.emitEvent('themeAdded', { themeId: theme.id, theme });
  }

  /**
   * 移除主题
   */
  public removeTheme(themeId: string): void {
    if (this.themes.delete(themeId)) {
      // 如果移除的是当前主题，切换到默认主题
      if (this.currentTheme?.id === themeId) {
        this.applyTheme(this.themeConfig.defaultTheme);
      }
      this.emitEvent('themeRemoved', { themeId });
    }
  }

  /**
   * 切换到下一个主题
   */
  public nextTheme(): void {
    const themes = Array.from(this.themes.keys());
    const currentIndex = this.currentTheme ? themes.indexOf(this.currentTheme.id) : -1;
    const nextIndex = (currentIndex + 1) % themes.length;
    this.applyTheme(themes[nextIndex]);
  }

  /**
   * 切换到上一个主题
   */
  public previousTheme(): void {
    const themes = Array.from(this.themes.keys());
    const currentIndex = this.currentTheme ? themes.indexOf(this.currentTheme.id) : -1;
    const previousIndex = currentIndex <= 0 ? themes.length - 1 : currentIndex - 1;
    this.applyTheme(themes[previousIndex]);
  }

  /**
   * 检测系统主题偏好
   */
  public getSystemThemePreference(): 'light' | 'dark' {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  /**
   * 获取主题管理器配置
   */
  public getThemeConfig(): ThemeManagerConfig {
    return { ...this.themeConfig };
  }

  /**
   * 更新主题管理器配置
   */
  public updateThemeConfig(updates: Partial<ThemeManagerConfig>): void {
    this.themeConfig = { ...this.themeConfig, ...updates };
    this.emitEvent('configUpdated', { config: this.themeConfig });
  }

  /**
   * 导出当前主题为CSS
   */
  public exportThemeAsCSS(): string {
    if (!this.currentTheme) return '';
    return this.generateCSSVariables(this.currentTheme);
  }

  /**
   * 从CSS导入主题
   */
  public importThemeFromCSS(css: string, themeId: string, themeName: string): void {
    // 这里可以实现从CSS解析主题的逻辑
    // 简化实现，实际应用中需要更复杂的CSS解析
    console.warn('importThemeFromCSS not fully implemented');
  }
}
