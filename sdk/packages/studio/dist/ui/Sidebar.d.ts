/**
 * @fileoverview Sidebar - 侧边栏组件
 * @version 1.1.0-beta
 * @based_on MPLP V1.0 Alpha侧边栏设计模式
 */
import { MPLPEventManager } from '../core/MPLPEventManager';
import { StudioConfig, IStudioManager } from '../types/studio';
/**
 * 侧边栏面板接口
 */
export interface SidebarPanel {
    id: string;
    title: string;
    icon: string;
    content: string | HTMLElement;
    active: boolean;
    visible: boolean;
    resizable: boolean;
    collapsible: boolean;
    position: number;
    minHeight?: number;
    maxHeight?: number;
    defaultHeight?: number;
}
/**
 * 侧边栏配置接口
 */
export interface SidebarConfig {
    position: 'left' | 'right';
    width: number;
    minWidth: number;
    maxWidth: number;
    backgroundColor: string;
    borderColor: string;
    collapsible: boolean;
    resizable: boolean;
    showTabs: boolean;
    tabHeight: number;
    panelSpacing: number;
}
/**
 * Sidebar组件 - 基于MPLP V1.0 Alpha侧边栏设计模式
 * 提供可定制的侧边栏和面板管理功能
 */
export declare class Sidebar implements IStudioManager {
    private eventManager;
    private config;
    private _isInitialized;
    private sidebarConfig;
    private panels;
    private activePanel;
    private isCollapsed;
    private sidebarContainer;
    private sidebarElement;
    private tabsContainer;
    private contentContainer;
    private resizeHandle;
    constructor(config: StudioConfig, eventManager: MPLPEventManager, position?: 'left' | 'right');
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
     * 初始化默认面板
     */
    private initializeDefaultPanels;
    /**
     * 创建项目浏览器内容
     */
    private createProjectExplorerContent;
    /**
     * 创建组件库内容
     */
    private createComponentLibraryContent;
    /**
     * 创建属性面板内容
     */
    private createPropertiesContent;
    /**
     * 创建大纲内容
     */
    private createOutlineContent;
    /**
     * 创建侧边栏DOM结构
     */
    private createSidebarDOM;
    /**
     * 设置事件监听器
     */
    private setupEventListeners;
    /**
     * 移除事件监听器
     */
    private removeEventListeners;
    /**
     * 渲染侧边栏
     */
    private render;
    /**
     * 渲染标签
     */
    private renderTabs;
    /**
     * 渲染内容
     */
    private renderContent;
    /**
     * 设置活动面板
     */
    setActivePanel(panelId: string): void;
    /**
     * 添加面板
     */
    addPanel(panel: SidebarPanel): void;
    /**
     * 移除面板
     */
    removePanel(panelId: string): void;
    /**
     * 切换折叠状态
     */
    toggleCollapse(): void;
    /**
     * 获取侧边栏配置
     */
    getSidebarConfig(): SidebarConfig;
    /**
     * 更新侧边栏配置
     */
    updateSidebarConfig(updates: Partial<SidebarConfig>): void;
    /**
     * 获取所有面板
     */
    getAllPanels(): SidebarPanel[];
    /**
     * 获取活动面板
     */
    getActivePanel(): SidebarPanel | null;
}
//# sourceMappingURL=Sidebar.d.ts.map