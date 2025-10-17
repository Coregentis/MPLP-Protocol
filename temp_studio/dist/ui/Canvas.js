"use strict";
/**
 * @fileoverview Canvas - 拖拽式设计画布
 * @version 1.1.0-beta
 * @based_on MPLP V1.0 Alpha可视化设计模式
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Canvas = void 0;
/**
 * Canvas组件 - 基于MPLP V1.0 Alpha可视化设计模式
 * 提供拖拽式的可视化设计画布功能
 */
class Canvas {
    constructor(config, eventManager) {
        this._isInitialized = false;
        this.elements = new Map();
        this.selectedElements = new Set();
        // DOM元素
        this.canvasContainer = null;
        this.canvasElement = null;
        this.canvasContext = null;
        this.config = config;
        this.eventManager = eventManager;
        // 初始化画布配置
        this.canvasConfig = {
            width: 1200,
            height: 800,
            zoom: 1.0,
            gridSize: 20,
            showGrid: true,
            snapToGrid: true,
            backgroundColor: '#f8f9fa',
            maxZoom: 3.0,
            minZoom: 0.1,
            enablePanning: true,
            enableSelection: true,
            enableMultiSelect: true
        };
        // 初始化拖拽状态
        this.dragState = {
            isDragging: false,
            dragElement: null,
            startPosition: { x: 0, y: 0 },
            currentPosition: { x: 0, y: 0 },
            offset: { x: 0, y: 0 }
        };
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
            // 创建画布DOM结构
            this.createCanvasDOM();
            // 设置事件监听器
            this.setupEventListeners();
            // 初始化渲染
            this.render();
            this._isInitialized = true;
            this.emitEvent('canvasInitialized', {
                canvasId: 'main-canvas',
                config: this.canvasConfig
            });
        }
        catch (error) {
            throw new Error(`Failed to initialize Canvas: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
            // 清理事件监听器
            this.removeEventListeners();
            // 清理DOM元素
            if (this.canvasContainer && this.canvasContainer.parentNode) {
                this.canvasContainer.parentNode.removeChild(this.canvasContainer);
            }
            // 清理状态
            this.elements.clear();
            this.selectedElements.clear();
            this._isInitialized = false;
            this.emitEvent('canvasShutdown', { canvasId: 'main-canvas' });
        }
        catch (error) {
            throw new Error(`Failed to shutdown Canvas: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
        this.eventManager.emit(`canvas:${eventType}`, data);
    }
    /**
     * 创建画布DOM结构
     */
    createCanvasDOM() {
        // 创建容器
        this.canvasContainer = document.createElement('div');
        this.canvasContainer.className = 'mplp-canvas-container';
        this.canvasContainer.style.cssText = `
      position: relative;
      width: 100%;
      height: 100%;
      overflow: hidden;
      background-color: ${this.canvasConfig.backgroundColor};
      cursor: default;
    `;
        // 创建画布元素
        this.canvasElement = document.createElement('canvas');
        this.canvasElement.className = 'mplp-canvas';
        this.canvasElement.width = this.canvasConfig.width;
        this.canvasElement.height = this.canvasConfig.height;
        this.canvasElement.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      border: 1px solid #dee2e6;
      background-color: white;
    `;
        // 获取绘图上下文
        this.canvasContext = this.canvasElement.getContext('2d');
        if (!this.canvasContext) {
            throw new Error('Failed to get canvas 2D context');
        }
        // 添加到容器
        this.canvasContainer.appendChild(this.canvasElement);
        // 添加到页面（这里假设有一个目标容器）
        const targetContainer = document.getElementById('studio-canvas-container') || document.body;
        targetContainer.appendChild(this.canvasContainer);
    }
    /**
     * 设置事件监听器
     */
    setupEventListeners() {
        if (!this.canvasElement)
            return;
        // 鼠标事件
        this.canvasElement.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.canvasElement.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvasElement.addEventListener('mouseup', this.handleMouseUp.bind(this));
        this.canvasElement.addEventListener('wheel', this.handleWheel.bind(this));
        // 键盘事件
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        document.addEventListener('keyup', this.handleKeyUp.bind(this));
        // 窗口事件
        window.addEventListener('resize', this.handleResize.bind(this));
    }
    /**
     * 移除事件监听器
     */
    removeEventListeners() {
        if (!this.canvasElement)
            return;
        this.canvasElement.removeEventListener('mousedown', this.handleMouseDown.bind(this));
        this.canvasElement.removeEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvasElement.removeEventListener('mouseup', this.handleMouseUp.bind(this));
        this.canvasElement.removeEventListener('wheel', this.handleWheel.bind(this));
        document.removeEventListener('keydown', this.handleKeyDown.bind(this));
        document.removeEventListener('keyup', this.handleKeyUp.bind(this));
        window.removeEventListener('resize', this.handleResize.bind(this));
    }
    /**
     * 渲染画布
     */
    render() {
        if (!this.canvasContext)
            return;
        // 清空画布
        this.canvasContext.clearRect(0, 0, this.canvasConfig.width, this.canvasConfig.height);
        // 绘制网格
        if (this.canvasConfig.showGrid) {
            this.drawGrid();
        }
        // 绘制元素
        this.elements.forEach(element => {
            this.drawElement(element);
        });
        // 绘制选择框
        this.drawSelectionBoxes();
    }
    /**
     * 绘制网格
     */
    drawGrid() {
        if (!this.canvasContext)
            return;
        const { gridSize, width, height } = this.canvasConfig;
        this.canvasContext.strokeStyle = '#e9ecef';
        this.canvasContext.lineWidth = 1;
        this.canvasContext.beginPath();
        // 垂直线
        for (let x = 0; x <= width; x += gridSize) {
            this.canvasContext.moveTo(x, 0);
            this.canvasContext.lineTo(x, height);
        }
        // 水平线
        for (let y = 0; y <= height; y += gridSize) {
            this.canvasContext.moveTo(0, y);
            this.canvasContext.lineTo(width, y);
        }
        this.canvasContext.stroke();
    }
    /**
     * 绘制元素
     */
    drawElement(element) {
        if (!this.canvasContext)
            return;
        const { position, size, style } = element;
        // 设置样式
        this.canvasContext.fillStyle = style.backgroundColor || '#ffffff';
        this.canvasContext.strokeStyle = style.borderColor || '#6c757d';
        this.canvasContext.lineWidth = style.borderWidth || 1;
        this.canvasContext.globalAlpha = style.opacity || 1;
        // 绘制矩形
        this.canvasContext.fillRect(position.x, position.y, size.width, size.height);
        this.canvasContext.strokeRect(position.x, position.y, size.width, size.height);
        // 绘制文本
        this.canvasContext.fillStyle = '#212529';
        this.canvasContext.font = '14px Arial';
        this.canvasContext.textAlign = 'center';
        this.canvasContext.fillText(element.name, position.x + size.width / 2, position.y + size.height / 2 + 5);
        // 重置透明度
        this.canvasContext.globalAlpha = 1;
    }
    /**
     * 绘制选择框
     */
    drawSelectionBoxes() {
        if (!this.canvasContext)
            return;
        this.selectedElements.forEach(elementId => {
            const element = this.elements.get(elementId);
            if (!element || !this.canvasContext)
                return;
            const { position, size } = element;
            this.canvasContext.strokeStyle = '#007bff';
            this.canvasContext.lineWidth = 2;
            this.canvasContext.setLineDash([5, 5]);
            this.canvasContext.strokeRect(position.x - 2, position.y - 2, size.width + 4, size.height + 4);
            this.canvasContext.setLineDash([]);
        });
    }
    // ===== 事件处理方法 =====
    handleMouseDown(event) {
        // 鼠标按下事件处理
        const rect = this.canvasElement?.getBoundingClientRect();
        if (!rect)
            return;
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        // 查找点击的元素
        const clickedElement = this.getElementAtPosition(x, y);
        if (clickedElement) {
            // 开始拖拽
            this.dragState.isDragging = true;
            this.dragState.dragElement = clickedElement;
            this.dragState.startPosition = { x, y };
            this.dragState.offset = {
                x: x - clickedElement.position.x,
                y: y - clickedElement.position.y
            };
            // 选择元素
            if (!event.ctrlKey && !event.metaKey) {
                this.selectedElements.clear();
            }
            this.selectedElements.add(clickedElement.id);
            this.emitEvent('elementSelected', { elementId: clickedElement.id });
        }
        else {
            // 清除选择
            this.selectedElements.clear();
            this.emitEvent('selectionCleared', {});
        }
        this.render();
    }
    handleMouseMove(event) {
        // 鼠标移动事件处理
        if (!this.dragState.isDragging || !this.dragState.dragElement)
            return;
        const rect = this.canvasElement?.getBoundingClientRect();
        if (!rect)
            return;
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        // 更新元素位置
        const newX = x - this.dragState.offset.x;
        const newY = y - this.dragState.offset.y;
        // 网格对齐
        if (this.canvasConfig.snapToGrid) {
            const gridSize = this.canvasConfig.gridSize;
            this.dragState.dragElement.position.x = Math.round(newX / gridSize) * gridSize;
            this.dragState.dragElement.position.y = Math.round(newY / gridSize) * gridSize;
        }
        else {
            this.dragState.dragElement.position.x = newX;
            this.dragState.dragElement.position.y = newY;
        }
        this.render();
    }
    handleMouseUp(event) {
        // 鼠标释放事件处理
        if (this.dragState.isDragging && this.dragState.dragElement) {
            this.emitEvent('elementMoved', {
                elementId: this.dragState.dragElement.id,
                newPosition: this.dragState.dragElement.position
            });
        }
        // 重置拖拽状态
        this.dragState.isDragging = false;
        this.dragState.dragElement = null;
    }
    handleWheel(event) {
        // 鼠标滚轮事件处理（缩放）
        event.preventDefault();
        const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
        const newZoom = Math.max(this.canvasConfig.minZoom, Math.min(this.canvasConfig.maxZoom, this.canvasConfig.zoom * zoomFactor));
        if (newZoom !== this.canvasConfig.zoom) {
            this.canvasConfig.zoom = newZoom;
            this.emitEvent('zoomChanged', { zoom: newZoom });
            this.render();
        }
    }
    handleKeyDown(event) {
        // 键盘按下事件处理
        switch (event.key) {
            case 'Delete':
            case 'Backspace':
                this.deleteSelectedElements();
                break;
            case 'Escape':
                this.selectedElements.clear();
                this.render();
                break;
        }
    }
    handleKeyUp(event) {
        // 键盘释放事件处理
    }
    handleResize() {
        // 窗口大小变化事件处理
        this.render();
    }
    // ===== 公共API方法 =====
    /**
     * 添加元素到画布
     */
    addElement(element) {
        this.elements.set(element.id, element);
        this.render();
        this.emitEvent('elementAdded', { elementId: element.id });
    }
    /**
     * 从画布移除元素
     */
    removeElement(elementId) {
        if (this.elements.delete(elementId)) {
            this.selectedElements.delete(elementId);
            this.render();
            this.emitEvent('elementRemoved', { elementId });
        }
    }
    /**
     * 获取指定位置的元素
     */
    getElementAtPosition(x, y) {
        for (const element of this.elements.values()) {
            const { position, size } = element;
            if (x >= position.x && x <= position.x + size.width &&
                y >= position.y && y <= position.y + size.height) {
                return element;
            }
        }
        return null;
    }
    /**
     * 删除选中的元素
     */
    deleteSelectedElements() {
        this.selectedElements.forEach(elementId => {
            this.removeElement(elementId);
        });
        this.selectedElements.clear();
    }
    /**
     * 获取画布配置
     */
    getCanvasConfig() {
        return { ...this.canvasConfig };
    }
    /**
     * 更新画布配置
     */
    updateCanvasConfig(updates) {
        this.canvasConfig = { ...this.canvasConfig, ...updates };
        this.render();
        this.emitEvent('configUpdated', { config: this.canvasConfig });
    }
    /**
     * 获取所有元素
     */
    getAllElements() {
        return Array.from(this.elements.values());
    }
    /**
     * 获取选中的元素
     */
    getSelectedElements() {
        return Array.from(this.selectedElements).map(id => this.elements.get(id)).filter(Boolean);
    }
}
exports.Canvas = Canvas;
//# sourceMappingURL=Canvas.js.map