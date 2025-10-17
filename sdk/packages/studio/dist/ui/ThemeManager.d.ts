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
        primary: string;
        secondary: string;
        success: string;
        warning: string;
        danger: string;
        info: string;
        background: string;
        surface: string;
        card: string;
        textPrimary: string;
        textSecondary: string;
        textMuted: string;
        border: string;
        borderLight: string;
        borderDark: string;
        hover: string;
        active: string;
        focus: string;
        disabled: string;
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
export declare class ThemeManager implements IStudioManager {
    private eventManager;
    private config;
    private _isInitialized;
    private themeConfig;
    private themes;
    private currentTheme;
    private systemThemeMediaQuery;
    private styleElement;
    constructor(config: StudioConfig, eventManager: MPLPEventManager);
    /**
     * 获取状态
     */
    getStatus(): string;
    /**
     * 初始化
     */
    initialize(): Promise<void>;
    /**
     * 关闭
     */
    shutdown(): Promise<void>;
    on(event: string, listener: (...args: any[]) => void): this;
    emit(event: string, ...args: any[]): boolean;
    off(event: string, listener: (...args: any[]) => void): this;
    removeAllListeners(event?: string): this;
    /**
     * 发射事件
     */
    private emitEvent;
    /**
     * 初始化默认主题
     */
    private initializeDefaultThemes;
    /**
     * 创建样式元素
     */
    private createStyleElement;
    /**
     * 设置系统主题检测
     */
    private setupSystemThemeDetection;
    /**
     * 处理系统主题变化
     */
    private handleSystemThemeChange;
    /**
     * 加载保存的主题
     */
    private loadSavedTheme;
    /**
     * 保存主题选择
     */
    private saveThemeChoice;
    /**
     * 应用主题
     */
    applyTheme(themeId: string): Promise<void>;
    /**
     * 生成CSS变量
     */
    private generateCSSVariables;
    /**
     * 转换为kebab-case
     */
    private kebabCase;
    /**
     * 获取当前主题
     */
    getCurrentTheme(): Theme | null;
    /**
     * 获取所有主题
     */
    getAllThemes(): Theme[];
    /**
     * 添加自定义主题
     */
    addTheme(theme: Theme): void;
    /**
     * 移除主题
     */
    removeTheme(themeId: string): void;
    /**
     * 切换到下一个主题
     */
    nextTheme(): void;
    /**
     * 切换到上一个主题
     */
    previousTheme(): void;
    /**
     * 检测系统主题偏好
     */
    getSystemThemePreference(): 'light' | 'dark';
    /**
     * 获取主题管理器配置
     */
    getThemeConfig(): ThemeManagerConfig;
    /**
     * 更新主题管理器配置
     */
    updateThemeConfig(updates: Partial<ThemeManagerConfig>): void;
    /**
     * 导出当前主题为CSS
     */
    exportThemeAsCSS(): string;
    /**
     * 从CSS导入主题
     */
    importThemeFromCSS(css: string, themeId: string, themeName: string): void;
}
//# sourceMappingURL=ThemeManager.d.ts.map