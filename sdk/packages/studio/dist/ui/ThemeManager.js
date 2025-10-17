"use strict";
/**
 * @fileoverview ThemeManager - 主题系统管理器
 * @version 1.1.0-beta
 * @based_on MPLP V1.0 Alpha主题管理模式
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThemeManager = void 0;
/**
 * ThemeManager组件 - 基于MPLP V1.0 Alpha主题管理模式
 * 提供完整的主题系统和动态切换功能
 */
class ThemeManager {
    constructor(config, eventManager) {
        this._isInitialized = false;
        this.themes = new Map();
        this.currentTheme = null;
        this.systemThemeMediaQuery = null;
        // DOM元素
        this.styleElement = null;
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
    getStatus() {
        return this._isInitialized ? 'initialized' : 'not_initialized';
    }
    /**
     * 初始化
     */
    async initialize() {
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
        }
        catch (error) {
            throw new Error(`Failed to initialize ThemeManager: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * 关闭
     */
    async shutdown() {
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
        }
        catch (error) {
            throw new Error(`Failed to shutdown ThemeManager: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    // ===== EventEmitter接口实现 =====
    on(event, listener) {
        this.eventManager.on(event, listener);
        return this;
    }
    emit(event, ...args) {
        return this.eventManager.emit(event, ...args);
    }
    off(event, listener) {
        this.eventManager.off(event, listener);
        return this;
    }
    removeAllListeners(event) {
        this.eventManager.removeAllListeners(event);
        return this;
    }
    // ===== 私有辅助方法 =====
    /**
     * 发射事件
     */
    emitEvent(eventType, data) {
        this.eventManager.emit(`theme:${eventType}`, data);
    }
    /**
     * 初始化默认主题
     */
    initializeDefaultThemes() {
        // 浅色主题
        const lightTheme = {
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
        const darkTheme = {
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
        const autoTheme = {
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
    createStyleElement() {
        this.styleElement = document.createElement('style');
        this.styleElement.id = 'mplp-theme-styles';
        document.head.appendChild(this.styleElement);
    }
    /**
     * 设置系统主题检测
     */
    setupSystemThemeDetection() {
        if (!this.themeConfig.autoDetectSystemTheme)
            return;
        this.systemThemeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        this.systemThemeMediaQuery.addEventListener('change', this.handleSystemThemeChange.bind(this));
    }
    /**
     * 处理系统主题变化
     */
    handleSystemThemeChange(event) {
        if (this.currentTheme?.type === 'auto') {
            // 重新应用自动主题
            this.applyTheme('auto');
        }
    }
    /**
     * 加载保存的主题
     */
    loadSavedTheme() {
        if (!this.themeConfig.persistThemeChoice)
            return null;
        try {
            return localStorage.getItem(this.themeConfig.storageKey);
        }
        catch {
            return null;
        }
    }
    /**
     * 保存主题选择
     */
    saveThemeChoice(themeId) {
        if (!this.themeConfig.persistThemeChoice)
            return;
        try {
            localStorage.setItem(this.themeConfig.storageKey, themeId);
        }
        catch {
            // 忽略存储错误
        }
    }
    /**
     * 应用主题
     */
    async applyTheme(themeId) {
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
    generateCSSVariables(theme) {
        const variables = [];
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
    kebabCase(str) {
        return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
    }
    // ===== 公共API方法 =====
    /**
     * 获取当前主题
     */
    getCurrentTheme() {
        return this.currentTheme;
    }
    /**
     * 获取所有主题
     */
    getAllThemes() {
        return Array.from(this.themes.values());
    }
    /**
     * 添加自定义主题
     */
    addTheme(theme) {
        this.themes.set(theme.id, theme);
        this.emitEvent('themeAdded', { themeId: theme.id, theme });
    }
    /**
     * 移除主题
     */
    removeTheme(themeId) {
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
    nextTheme() {
        const themes = Array.from(this.themes.keys());
        const currentIndex = this.currentTheme ? themes.indexOf(this.currentTheme.id) : -1;
        const nextIndex = (currentIndex + 1) % themes.length;
        this.applyTheme(themes[nextIndex]);
    }
    /**
     * 切换到上一个主题
     */
    previousTheme() {
        const themes = Array.from(this.themes.keys());
        const currentIndex = this.currentTheme ? themes.indexOf(this.currentTheme.id) : -1;
        const previousIndex = currentIndex <= 0 ? themes.length - 1 : currentIndex - 1;
        this.applyTheme(themes[previousIndex]);
    }
    /**
     * 检测系统主题偏好
     */
    getSystemThemePreference() {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    /**
     * 获取主题管理器配置
     */
    getThemeConfig() {
        return { ...this.themeConfig };
    }
    /**
     * 更新主题管理器配置
     */
    updateThemeConfig(updates) {
        this.themeConfig = { ...this.themeConfig, ...updates };
        this.emitEvent('configUpdated', { config: this.themeConfig });
    }
    /**
     * 导出当前主题为CSS
     */
    exportThemeAsCSS() {
        if (!this.currentTheme)
            return '';
        return this.generateCSSVariables(this.currentTheme);
    }
    /**
     * 从CSS导入主题
     */
    importThemeFromCSS(css, themeId, themeName) {
        // 这里可以实现从CSS解析主题的逻辑
        // 简化实现，实际应用中需要更复杂的CSS解析
        console.warn('importThemeFromCSS not fully implemented');
    }
}
exports.ThemeManager = ThemeManager;
//# sourceMappingURL=ThemeManager.js.map