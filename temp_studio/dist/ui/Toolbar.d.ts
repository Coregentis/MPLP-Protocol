/**
 * @fileoverview Toolbar - 工具栏组件
 * @version 1.1.0-beta
 * @based_on MPLP V1.0 Alpha工具栏设计模式
 */
import { MPLPEventManager } from '../core/MPLPEventManager';
import { StudioConfig, IStudioManager } from '../types/studio';
/**
 * 工具栏按钮接口
 */
export interface ToolbarButton {
    id: string;
    label: string;
    icon: string;
    tooltip: string;
    action: string;
    enabled: boolean;
    visible: boolean;
    group: string;
    shortcut?: string;
    style?: {
        backgroundColor?: string;
        color?: string;
        borderColor?: string;
    };
}
/**
 * 工具栏组接口
 */
export interface ToolbarGroup {
    id: string;
    label: string;
    position: 'left' | 'center' | 'right';
    buttons: string[];
    separator: boolean;
}
/**
 * 工具栏配置接口
 */
export interface ToolbarConfig {
    position: 'top' | 'bottom' | 'left' | 'right';
    height: number;
    backgroundColor: string;
    borderColor: string;
    showLabels: boolean;
    showTooltips: boolean;
    iconSize: number;
    spacing: number;
    padding: number;
}
/**
 * Toolbar组件 - 基于MPLP V1.0 Alpha工具栏设计模式
 * 提供可定制的工具栏和快捷操作功能
 */
export declare class Toolbar implements IStudioManager {
    private eventManager;
    private config;
    private _isInitialized;
    private toolbarConfig;
    private buttons;
    private groups;
    private toolbarContainer;
    private toolbarElement;
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
     * 初始化默认按钮
     */
    private initializeDefaultButtons;
    /**
     * 初始化默认组
     */
    private initializeDefaultGroups;
    /**
     * 创建工具栏DOM结构
     */
    private createToolbarDOM;
    /**
     * 设置事件监听器
     */
    private setupEventListeners;
    /**
     * 移除事件监听器
     */
    private removeEventListeners;
    /**
     * 渲染工具栏
     */
    private render;
    /**
     * 渲染工具栏组
     */
    private renderGroup;
    /**
     * 创建按钮元素
     */
    private createButtonElement;
    /**
     * 处理按钮点击
     */
    private handleButtonClick;
    /**
     * 处理键盘事件
     */
    private handleKeyDown;
    /**
     * 获取快捷键字符串
     */
    private getShortcutString;
    /**
     * 添加按钮
     */
    addButton(button: ToolbarButton): void;
    /**
     * 移除按钮
     */
    removeButton(buttonId: string): void;
    /**
     * 更新按钮
     */
    updateButton(buttonId: string, updates: Partial<ToolbarButton>): void;
    /**
     * 启用/禁用按钮
     */
    setButtonEnabled(buttonId: string, enabled: boolean): void;
    /**
     * 显示/隐藏按钮
     */
    setButtonVisible(buttonId: string, visible: boolean): void;
    /**
     * 获取工具栏配置
     */
    getToolbarConfig(): ToolbarConfig;
    /**
     * 更新工具栏配置
     */
    updateToolbarConfig(updates: Partial<ToolbarConfig>): void;
    /**
     * 获取所有按钮
     */
    getAllButtons(): ToolbarButton[];
    /**
     * 获取所有组
     */
    getAllGroups(): ToolbarGroup[];
}
//# sourceMappingURL=Toolbar.d.ts.map