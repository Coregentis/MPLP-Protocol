/**
 * @fileoverview PropertiesPanel - 属性编辑面板
 * @version 1.1.0-beta
 * @based_on MPLP V1.0 Alpha属性管理模式
 */
import { MPLPEventManager } from '../core/MPLPEventManager';
import { StudioConfig, IStudioManager } from '../types/studio';
/**
 * 属性字段接口
 */
export interface PropertyField {
    id: string;
    label: string;
    type: 'text' | 'number' | 'boolean' | 'select' | 'color' | 'range' | 'textarea' | 'json';
    value: any;
    defaultValue: any;
    required: boolean;
    readonly: boolean;
    visible: boolean;
    group: string;
    description?: string;
    placeholder?: string;
    options?: {
        label: string;
        value: any;
    }[];
    min?: number;
    max?: number;
    step?: number;
    validation?: (value: any) => string | null;
}
/**
 * 属性组接口
 */
export interface PropertyGroup {
    id: string;
    label: string;
    expanded: boolean;
    visible: boolean;
    position: number;
    fields: string[];
}
/**
 * 属性面板配置接口
 */
export interface PropertiesPanelConfig {
    width: number;
    backgroundColor: string;
    borderColor: string;
    groupSpacing: number;
    fieldSpacing: number;
    labelWidth: number;
    showGroupHeaders: boolean;
    collapsibleGroups: boolean;
    showDescriptions: boolean;
    showValidationErrors: boolean;
}
/**
 * PropertiesPanel组件 - 基于MPLP V1.0 Alpha属性管理模式
 * 提供动态属性编辑和验证功能
 */
export declare class PropertiesPanel implements IStudioManager {
    private eventManager;
    private config;
    private _isInitialized;
    private panelConfig;
    private fields;
    private groups;
    private currentTarget;
    private validationErrors;
    private panelContainer;
    private panelElement;
    private headerElement;
    private contentElement;
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
     * 创建属性面板DOM结构
     */
    private createPanelDOM;
    /**
     * 设置事件监听器
     */
    private setupEventListeners;
    /**
     * 移除事件监听器
     */
    private removeEventListeners;
    /**
     * 处理元素选择事件
     */
    private handleElementSelected;
    /**
     * 处理选择清除事件
     */
    private handleSelectionCleared;
    /**
     * 为元素加载属性
     */
    private loadPropertiesForElement;
    /**
     * 创建示例属性
     */
    private createSampleProperties;
    /**
     * 清除属性
     */
    private clearProperties;
    /**
     * 渲染属性面板
     */
    private render;
    /**
     * 渲染属性组
     */
    private renderGroup;
    /**
     * 创建字段元素
     */
    private createFieldElement;
    /**
     * 创建输入控件
     */
    private createInputElement;
    /**
     * 处理字段变更
     */
    private handleFieldChange;
    /**
     * 处理字段输入
     */
    private handleFieldInput;
    /**
     * 验证字段
     */
    private validateField;
    /**
     * 设置属性目标
     */
    setTarget(target: any): void;
    /**
     * 为目标加载属性
     */
    private loadPropertiesForTarget;
    /**
     * 获取当前属性值
     */
    getPropertyValues(): Record<string, any>;
    /**
     * 设置属性值
     */
    setPropertyValues(values: Record<string, any>): void;
    /**
     * 验证所有字段
     */
    validateAll(): boolean;
    /**
     * 重置所有字段到默认值
     */
    resetToDefaults(): void;
    /**
     * 获取面板配置
     */
    getPanelConfig(): PropertiesPanelConfig;
    /**
     * 更新面板配置
     */
    updatePanelConfig(updates: Partial<PropertiesPanelConfig>): void;
}
//# sourceMappingURL=PropertiesPanel.d.ts.map