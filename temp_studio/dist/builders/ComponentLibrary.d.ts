/**
 * @fileoverview Component Library - 组件库管理器
 * @version 1.1.0-beta
 * @based_on MPLP V1.0 Alpha组件架构
 */
import { MPLPEventManager } from '../core/MPLPEventManager';
import { Component, StudioConfig, IStudioManager } from '../types/studio';
/**
 * 组件类别定义
 */
export interface ComponentCategory {
    id: string;
    name: string;
    description: string;
    icon: string;
    color: string;
    components: string[];
}
/**
 * 组件模板定义
 */
export interface ComponentTemplate {
    id: string;
    name: string;
    description: string;
    category: string;
    template: Partial<Component>;
    preview?: string;
    tags: string[];
}
/**
 * 组件库管理器 - 基于MPLP V1.0 Alpha组件管理模式
 * 提供组件的注册、分类、搜索和管理功能
 */
export declare class ComponentLibrary implements IStudioManager {
    private eventManager;
    private config;
    private _isInitialized;
    private components;
    private categories;
    private templates;
    constructor(config: StudioConfig, eventManager: MPLPEventManager);
    /**
     * 获取状态
     */
    getStatus(): string;
    /**
     * 事件监听 - 委托给eventManager
     */
    on(event: string, listener: (...args: any[]) => void): this;
    /**
     * 发射事件 - 委托给eventManager
     */
    emit(event: string, ...args: any[]): boolean;
    /**
     * 移除事件监听器 - 委托给eventManager
     */
    off(event: string, listener: (...args: any[]) => void): this;
    /**
     * 移除所有事件监听器 - 委托给eventManager
     */
    removeAllListeners(event?: string): this;
    /**
     * 初始化组件库
     */
    initialize(): Promise<void>;
    /**
     * 关闭组件库
     */
    shutdown(): Promise<void>;
    /**
     * 注册组件
     */
    registerComponent(component: Component): Promise<void>;
    /**
     * 获取组件
     */
    getComponent(componentId: string): Component | undefined;
    /**
     * 获取所有组件
     */
    getAllComponents(): Component[];
    /**
     * 按类别获取组件
     */
    getComponentsByCategory(categoryId: string): Component[];
    /**
     * 搜索组件
     */
    searchComponents(query: string, filters?: {
        category?: string;
        type?: string;
        tags?: string[];
    }): Component[];
    /**
     * 注册组件类别
     */
    registerCategory(category: ComponentCategory): Promise<void>;
    /**
     * 获取所有类别
     */
    getAllCategories(): ComponentCategory[];
    /**
     * 获取类别
     */
    getCategory(categoryId: string): ComponentCategory | undefined;
    /**
     * 注册组件模板
     */
    registerTemplate(template: ComponentTemplate): Promise<void>;
    /**
     * 从模板创建组件
     */
    createComponentFromTemplate(templateId: string, overrides?: Partial<Component>): Component;
    /**
     * 获取所有模板
     */
    getAllTemplates(): ComponentTemplate[];
    /**
     * 按类别获取模板
     */
    getTemplatesByCategory(categoryId: string): ComponentTemplate[];
    /**
     * 验证组件
     */
    private validateComponent;
    /**
     * 加载默认类别
     */
    private loadDefaultCategories;
    /**
     * 加载默认组件
     */
    private loadDefaultComponents;
    /**
     * 加载默认模板
     */
    private loadDefaultTemplates;
    /**
     * 发射事件 - 基于MPLP V1.0 Alpha事件发射模式
     */
    private emitEvent;
}
//# sourceMappingURL=ComponentLibrary.d.ts.map