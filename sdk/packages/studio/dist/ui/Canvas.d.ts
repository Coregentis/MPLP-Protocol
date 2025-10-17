/**
 * @fileoverview Canvas - 拖拽式设计画布
 * @version 1.1.0-beta
 * @based_on MPLP V1.0 Alpha可视化设计模式
 */
import { MPLPEventManager } from '../core/MPLPEventManager';
import { StudioConfig, IStudioManager } from '../types/studio';
/**
 * 画布元素接口
 */
export interface CanvasElement {
    id: string;
    type: 'agent' | 'component' | 'connection' | 'group';
    name: string;
    position: {
        x: number;
        y: number;
    };
    size: {
        width: number;
        height: number;
    };
    properties: Record<string, any>;
    style: {
        backgroundColor?: string;
        borderColor?: string;
        borderWidth?: number;
        borderRadius?: number;
        opacity?: number;
    };
    connections: string[];
    metadata: {
        created: Date;
        modified: Date;
        version: string;
    };
}
/**
 * 画布配置接口
 */
export interface CanvasConfig {
    width: number;
    height: number;
    zoom: number;
    gridSize: number;
    showGrid: boolean;
    snapToGrid: boolean;
    backgroundColor: string;
    maxZoom: number;
    minZoom: number;
    enablePanning: boolean;
    enableSelection: boolean;
    enableMultiSelect: boolean;
}
/**
 * Canvas组件 - 基于MPLP V1.0 Alpha可视化设计模式
 * 提供拖拽式的可视化设计画布功能
 */
export declare class Canvas implements IStudioManager {
    private eventManager;
    private config;
    private _isInitialized;
    private canvasConfig;
    private elements;
    private selectedElements;
    private dragState;
    private canvasContainer;
    private canvasElement;
    private canvasContext;
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
     * 创建画布DOM结构
     */
    private createCanvasDOM;
    /**
     * 设置事件监听器
     */
    private setupEventListeners;
    /**
     * 移除事件监听器
     */
    private removeEventListeners;
    /**
     * 渲染画布
     */
    private render;
    /**
     * 绘制网格
     */
    private drawGrid;
    /**
     * 绘制元素
     */
    private drawElement;
    /**
     * 绘制选择框
     */
    private drawSelectionBoxes;
    private handleMouseDown;
    private handleMouseMove;
    private handleMouseUp;
    private handleWheel;
    private handleKeyDown;
    private handleKeyUp;
    private handleResize;
    /**
     * 添加元素到画布
     */
    addElement(element: CanvasElement): void;
    /**
     * 从画布移除元素
     */
    removeElement(elementId: string): void;
    /**
     * 获取指定位置的元素
     */
    private getElementAtPosition;
    /**
     * 删除选中的元素
     */
    private deleteSelectedElements;
    /**
     * 获取画布配置
     */
    getCanvasConfig(): CanvasConfig;
    /**
     * 更新画布配置
     */
    updateCanvasConfig(updates: Partial<CanvasConfig>): void;
    /**
     * 获取所有元素
     */
    getAllElements(): CanvasElement[];
    /**
     * 获取选中的元素
     */
    getSelectedElements(): CanvasElement[];
}
//# sourceMappingURL=Canvas.d.ts.map