/**
 * @fileoverview UI Components - 用户界面组件库
 * @version 1.1.0-beta
 * @based_on MPLP V1.0 Alpha UI设计模式
 */
export { Canvas } from './Canvas';
export { Toolbar } from './Toolbar';
export { Sidebar } from './Sidebar';
export { PropertiesPanel } from './PropertiesPanel';
export { ThemeManager } from './ThemeManager';
export type { CanvasElement, CanvasConfig } from './Canvas';
export type { ToolbarButton, ToolbarGroup, ToolbarConfig } from './Toolbar';
export type { SidebarPanel, SidebarConfig } from './Sidebar';
export type { PropertyField, PropertyGroup, PropertiesPanelConfig } from './PropertiesPanel';
export type { Theme, ThemeManagerConfig } from './ThemeManager';
import { Canvas } from './Canvas';
import { Toolbar } from './Toolbar';
import { Sidebar } from './Sidebar';
import { PropertiesPanel } from './PropertiesPanel';
import { ThemeManager } from './ThemeManager';
import { MPLPEventManager } from '../core/MPLPEventManager';
import { StudioConfig } from '../types/studio';
/**
 * UI组件集合接口
 */
export interface UIComponents {
    canvas: Canvas;
    toolbar: Toolbar;
    leftSidebar: Sidebar;
    rightSidebar: Sidebar;
    propertiesPanel: PropertiesPanel;
    themeManager: ThemeManager;
}
/**
 * UI组件配置接口
 */
export interface UIComponentsConfig {
    canvas?: {
        width?: number;
        height?: number;
        showGrid?: boolean;
        snapToGrid?: boolean;
    };
    toolbar?: {
        position?: 'top' | 'bottom';
        showLabels?: boolean;
        showTooltips?: boolean;
    };
    leftSidebar?: {
        width?: number;
        collapsible?: boolean;
        resizable?: boolean;
    };
    rightSidebar?: {
        width?: number;
        collapsible?: boolean;
        resizable?: boolean;
    };
    propertiesPanel?: {
        width?: number;
        showDescriptions?: boolean;
        showValidationErrors?: boolean;
    };
    themeManager?: {
        defaultTheme?: string;
        autoDetectSystemTheme?: boolean;
        persistThemeChoice?: boolean;
    };
}
/**
 * 创建完整的UI组件集合
 *
 * @param config - Studio配置
 * @param eventManager - 事件管理器
 * @param uiConfig - UI组件配置
 * @returns UI组件集合
 */
export declare function createUIComponents(config: StudioConfig, eventManager: MPLPEventManager, uiConfig?: UIComponentsConfig): UIComponents;
/**
 * 初始化所有UI组件
 *
 * @param components - UI组件集合
 * @returns Promise<void>
 */
export declare function initializeUIComponents(components: UIComponents): Promise<void>;
/**
 * 关闭所有UI组件
 *
 * @param components - UI组件集合
 * @returns Promise<void>
 */
export declare function shutdownUIComponents(components: UIComponents): Promise<void>;
/**
 * 设置UI组件之间的事件连接
 *
 * @param components - UI组件集合
 */
export declare function setupUIComponentConnections(components: UIComponents): void;
/**
 * 创建完整的UI系统
 *
 * @param config - Studio配置
 * @param eventManager - 事件管理器
 * @param uiConfig - UI组件配置
 * @returns Promise<UIComponents>
 */
export declare function createCompleteUISystem(config: StudioConfig, eventManager: MPLPEventManager, uiConfig?: UIComponentsConfig): Promise<UIComponents>;
export declare const UI_VERSION = "1.1.0-beta";
export declare const UI_NAME = "MPLP Studio UI Components";
export declare const UI_DESCRIPTION = "Complete UI component library for MPLP Studio";
export declare const UI_COMPONENT_STATUS: {
    readonly canvas: "completed";
    readonly toolbar: "completed";
    readonly sidebar: "completed";
    readonly propertiesPanel: "completed";
    readonly themeManager: "completed";
    readonly overall: "100% completed";
};
//# sourceMappingURL=index.d.ts.map