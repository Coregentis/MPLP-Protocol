"use strict";
/**
 * @fileoverview Toolbar - 工具栏组件
 * @version 1.1.0-beta
 * @based_on MPLP V1.0 Alpha工具栏设计模式
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Toolbar = void 0;
/**
 * Toolbar组件 - 基于MPLP V1.0 Alpha工具栏设计模式
 * 提供可定制的工具栏和快捷操作功能
 */
class Toolbar {
    constructor(config, eventManager) {
        this._isInitialized = false;
        this.buttons = new Map();
        this.groups = new Map();
        // DOM元素
        this.toolbarContainer = null;
        this.toolbarElement = null;
        this.config = config;
        this.eventManager = eventManager;
        // 初始化工具栏配置
        this.toolbarConfig = {
            position: 'top',
            height: 48,
            backgroundColor: '#f8f9fa',
            borderColor: '#dee2e6',
            showLabels: false,
            showTooltips: true,
            iconSize: 20,
            spacing: 8,
            padding: 12
        };
        // 初始化默认按钮和组
        this.initializeDefaultButtons();
        this.initializeDefaultGroups();
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
            // 创建工具栏DOM结构
            this.createToolbarDOM();
            // 设置事件监听器
            this.setupEventListeners();
            // 渲染工具栏
            this.render();
            this._isInitialized = true;
            this.emitEvent('toolbarInitialized', {
                toolbarId: 'main-toolbar',
                config: this.toolbarConfig
            });
        }
        catch (error) {
            throw new Error(`Failed to initialize Toolbar: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
            if (this.toolbarContainer && this.toolbarContainer.parentNode) {
                this.toolbarContainer.parentNode.removeChild(this.toolbarContainer);
            }
            this._isInitialized = false;
            this.emitEvent('toolbarShutdown', { toolbarId: 'main-toolbar' });
        }
        catch (error) {
            throw new Error(`Failed to shutdown Toolbar: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
        this.eventManager.emit(`toolbar:${eventType}`, data);
    }
    /**
     * 初始化默认按钮
     */
    initializeDefaultButtons() {
        const defaultButtons = [
            // 文件操作组
            {
                id: 'new-project',
                label: 'New',
                icon: '📄',
                tooltip: 'Create new project (Ctrl+N)',
                action: 'project:new',
                enabled: true,
                visible: true,
                group: 'file',
                shortcut: 'Ctrl+N'
            },
            {
                id: 'open-project',
                label: 'Open',
                icon: '📂',
                tooltip: 'Open project (Ctrl+O)',
                action: 'project:open',
                enabled: true,
                visible: true,
                group: 'file',
                shortcut: 'Ctrl+O'
            },
            {
                id: 'save-project',
                label: 'Save',
                icon: '💾',
                tooltip: 'Save project (Ctrl+S)',
                action: 'project:save',
                enabled: true,
                visible: true,
                group: 'file',
                shortcut: 'Ctrl+S'
            },
            // 编辑操作组
            {
                id: 'undo',
                label: 'Undo',
                icon: '↶',
                tooltip: 'Undo (Ctrl+Z)',
                action: 'edit:undo',
                enabled: false,
                visible: true,
                group: 'edit',
                shortcut: 'Ctrl+Z'
            },
            {
                id: 'redo',
                label: 'Redo',
                icon: '↷',
                tooltip: 'Redo (Ctrl+Y)',
                action: 'edit:redo',
                enabled: false,
                visible: true,
                group: 'edit',
                shortcut: 'Ctrl+Y'
            },
            {
                id: 'copy',
                label: 'Copy',
                icon: '📋',
                tooltip: 'Copy (Ctrl+C)',
                action: 'edit:copy',
                enabled: false,
                visible: true,
                group: 'edit',
                shortcut: 'Ctrl+C'
            },
            {
                id: 'paste',
                label: 'Paste',
                icon: '📋',
                tooltip: 'Paste (Ctrl+V)',
                action: 'edit:paste',
                enabled: false,
                visible: true,
                group: 'edit',
                shortcut: 'Ctrl+V'
            },
            // 视图操作组
            {
                id: 'zoom-in',
                label: 'Zoom In',
                icon: '🔍+',
                tooltip: 'Zoom in (Ctrl++)',
                action: 'view:zoom-in',
                enabled: true,
                visible: true,
                group: 'view',
                shortcut: 'Ctrl++'
            },
            {
                id: 'zoom-out',
                label: 'Zoom Out',
                icon: '🔍-',
                tooltip: 'Zoom out (Ctrl+-)',
                action: 'view:zoom-out',
                enabled: true,
                visible: true,
                group: 'view',
                shortcut: 'Ctrl+-'
            },
            {
                id: 'fit-to-screen',
                label: 'Fit',
                icon: '⛶',
                tooltip: 'Fit to screen (Ctrl+0)',
                action: 'view:fit-to-screen',
                enabled: true,
                visible: true,
                group: 'view',
                shortcut: 'Ctrl+0'
            },
            // 运行操作组
            {
                id: 'run',
                label: 'Run',
                icon: '▶️',
                tooltip: 'Run project (F5)',
                action: 'project:run',
                enabled: true,
                visible: true,
                group: 'run',
                shortcut: 'F5'
            },
            {
                id: 'debug',
                label: 'Debug',
                icon: '🐛',
                tooltip: 'Debug project (F9)',
                action: 'project:debug',
                enabled: true,
                visible: true,
                group: 'run',
                shortcut: 'F9'
            },
            {
                id: 'stop',
                label: 'Stop',
                icon: '⏹️',
                tooltip: 'Stop execution (Shift+F5)',
                action: 'project:stop',
                enabled: false,
                visible: true,
                group: 'run',
                shortcut: 'Shift+F5'
            }
        ];
        defaultButtons.forEach(button => {
            this.buttons.set(button.id, button);
        });
    }
    /**
     * 初始化默认组
     */
    initializeDefaultGroups() {
        const defaultGroups = [
            {
                id: 'file',
                label: 'File',
                position: 'left',
                buttons: ['new-project', 'open-project', 'save-project'],
                separator: true
            },
            {
                id: 'edit',
                label: 'Edit',
                position: 'left',
                buttons: ['undo', 'redo', 'copy', 'paste'],
                separator: true
            },
            {
                id: 'view',
                label: 'View',
                position: 'center',
                buttons: ['zoom-in', 'zoom-out', 'fit-to-screen'],
                separator: true
            },
            {
                id: 'run',
                label: 'Run',
                position: 'right',
                buttons: ['run', 'debug', 'stop'],
                separator: false
            }
        ];
        defaultGroups.forEach(group => {
            this.groups.set(group.id, group);
        });
    }
    /**
     * 创建工具栏DOM结构
     */
    createToolbarDOM() {
        // 创建容器
        this.toolbarContainer = document.createElement('div');
        this.toolbarContainer.className = 'mplp-toolbar-container';
        this.toolbarContainer.style.cssText = `
      position: relative;
      width: 100%;
      height: ${this.toolbarConfig.height}px;
      background-color: ${this.toolbarConfig.backgroundColor};
      border-bottom: 1px solid ${this.toolbarConfig.borderColor};
      display: flex;
      align-items: center;
      padding: 0 ${this.toolbarConfig.padding}px;
      box-sizing: border-box;
      user-select: none;
    `;
        // 创建工具栏元素
        this.toolbarElement = document.createElement('div');
        this.toolbarElement.className = 'mplp-toolbar';
        this.toolbarElement.style.cssText = `
      display: flex;
      align-items: center;
      width: 100%;
      height: 100%;
      gap: ${this.toolbarConfig.spacing}px;
    `;
        // 添加到容器
        this.toolbarContainer.appendChild(this.toolbarElement);
        // 添加到页面（这里假设有一个目标容器）
        const targetContainer = document.getElementById('studio-toolbar-container') || document.body;
        targetContainer.appendChild(this.toolbarContainer);
    }
    /**
     * 设置事件监听器
     */
    setupEventListeners() {
        // 键盘快捷键
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
    }
    /**
     * 移除事件监听器
     */
    removeEventListeners() {
        document.removeEventListener('keydown', this.handleKeyDown.bind(this));
    }
    /**
     * 渲染工具栏
     */
    render() {
        if (!this.toolbarElement)
            return;
        // 清空工具栏
        this.toolbarElement.innerHTML = '';
        // 按位置分组
        const leftGroups = [];
        const centerGroups = [];
        const rightGroups = [];
        this.groups.forEach(group => {
            switch (group.position) {
                case 'left':
                    leftGroups.push(group);
                    break;
                case 'center':
                    centerGroups.push(group);
                    break;
                case 'right':
                    rightGroups.push(group);
                    break;
            }
        });
        // 创建左侧容器
        const leftContainer = document.createElement('div');
        leftContainer.style.cssText = 'display: flex; align-items: center; gap: 8px;';
        leftGroups.forEach(group => {
            this.renderGroup(group, leftContainer);
        });
        this.toolbarElement.appendChild(leftContainer);
        // 创建中间容器
        const centerContainer = document.createElement('div');
        centerContainer.style.cssText = 'display: flex; align-items: center; gap: 8px; flex: 1; justify-content: center;';
        centerGroups.forEach(group => {
            this.renderGroup(group, centerContainer);
        });
        this.toolbarElement.appendChild(centerContainer);
        // 创建右侧容器
        const rightContainer = document.createElement('div');
        rightContainer.style.cssText = 'display: flex; align-items: center; gap: 8px;';
        rightGroups.forEach(group => {
            this.renderGroup(group, rightContainer);
        });
        this.toolbarElement.appendChild(rightContainer);
    }
    /**
     * 渲染工具栏组
     */
    renderGroup(group, container) {
        const groupElement = document.createElement('div');
        groupElement.className = 'mplp-toolbar-group';
        groupElement.style.cssText = `
      display: flex;
      align-items: center;
      gap: ${this.toolbarConfig.spacing}px;
    `;
        // 渲染按钮
        group.buttons.forEach(buttonId => {
            const button = this.buttons.get(buttonId);
            if (button && button.visible) {
                const buttonElement = this.createButtonElement(button);
                groupElement.appendChild(buttonElement);
            }
        });
        container.appendChild(groupElement);
        // 添加分隔符
        if (group.separator) {
            const separator = document.createElement('div');
            separator.className = 'mplp-toolbar-separator';
            separator.style.cssText = `
        width: 1px;
        height: 24px;
        background-color: ${this.toolbarConfig.borderColor};
        margin: 0 4px;
      `;
            container.appendChild(separator);
        }
    }
    /**
     * 创建按钮元素
     */
    createButtonElement(button) {
        const buttonElement = document.createElement('button');
        buttonElement.className = 'mplp-toolbar-button';
        buttonElement.id = `toolbar-${button.id}`;
        buttonElement.disabled = !button.enabled;
        // 设置样式
        buttonElement.style.cssText = `
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border: 1px solid transparent;
      border-radius: 4px;
      background-color: ${button.style?.backgroundColor || 'transparent'};
      color: ${button.style?.color || '#495057'};
      cursor: ${button.enabled ? 'pointer' : 'not-allowed'};
      font-size: ${this.toolbarConfig.iconSize}px;
      transition: all 0.2s ease;
      opacity: ${button.enabled ? 1 : 0.5};
    `;
        // 设置内容
        buttonElement.innerHTML = button.icon;
        // 设置工具提示
        if (this.toolbarConfig.showTooltips && button.tooltip) {
            buttonElement.title = button.tooltip;
        }
        // 添加事件监听器
        buttonElement.addEventListener('click', () => {
            if (button.enabled) {
                this.handleButtonClick(button);
            }
        });
        // 添加悬停效果
        buttonElement.addEventListener('mouseenter', () => {
            if (button.enabled) {
                buttonElement.style.backgroundColor = '#e9ecef';
                buttonElement.style.borderColor = '#adb5bd';
            }
        });
        buttonElement.addEventListener('mouseleave', () => {
            buttonElement.style.backgroundColor = button.style?.backgroundColor || 'transparent';
            buttonElement.style.borderColor = 'transparent';
        });
        return buttonElement;
    }
    /**
     * 处理按钮点击
     */
    handleButtonClick(button) {
        this.emitEvent('buttonClicked', {
            buttonId: button.id,
            action: button.action,
            button: button
        });
    }
    /**
     * 处理键盘事件
     */
    handleKeyDown(event) {
        // 检查快捷键
        const shortcut = this.getShortcutString(event);
        this.buttons.forEach(button => {
            if (button.shortcut === shortcut && button.enabled) {
                event.preventDefault();
                this.handleButtonClick(button);
            }
        });
    }
    /**
     * 获取快捷键字符串
     */
    getShortcutString(event) {
        const parts = [];
        if (event.ctrlKey)
            parts.push('Ctrl');
        if (event.shiftKey)
            parts.push('Shift');
        if (event.altKey)
            parts.push('Alt');
        if (event.metaKey)
            parts.push('Meta');
        if (event.key && event.key !== 'Control' && event.key !== 'Shift' && event.key !== 'Alt' && event.key !== 'Meta') {
            parts.push(event.key);
        }
        return parts.join('+');
    }
    // ===== 公共API方法 =====
    /**
     * 添加按钮
     */
    addButton(button) {
        this.buttons.set(button.id, button);
        this.render();
        this.emitEvent('buttonAdded', { buttonId: button.id });
    }
    /**
     * 移除按钮
     */
    removeButton(buttonId) {
        if (this.buttons.delete(buttonId)) {
            this.render();
            this.emitEvent('buttonRemoved', { buttonId });
        }
    }
    /**
     * 更新按钮
     */
    updateButton(buttonId, updates) {
        const button = this.buttons.get(buttonId);
        if (button) {
            this.buttons.set(buttonId, { ...button, ...updates });
            this.render();
            this.emitEvent('buttonUpdated', { buttonId, updates });
        }
    }
    /**
     * 启用/禁用按钮
     */
    setButtonEnabled(buttonId, enabled) {
        this.updateButton(buttonId, { enabled });
    }
    /**
     * 显示/隐藏按钮
     */
    setButtonVisible(buttonId, visible) {
        this.updateButton(buttonId, { visible });
    }
    /**
     * 获取工具栏配置
     */
    getToolbarConfig() {
        return { ...this.toolbarConfig };
    }
    /**
     * 更新工具栏配置
     */
    updateToolbarConfig(updates) {
        this.toolbarConfig = { ...this.toolbarConfig, ...updates };
        this.render();
        this.emitEvent('configUpdated', { config: this.toolbarConfig });
    }
    /**
     * 获取所有按钮
     */
    getAllButtons() {
        return Array.from(this.buttons.values());
    }
    /**
     * 获取所有组
     */
    getAllGroups() {
        return Array.from(this.groups.values());
    }
}
exports.Toolbar = Toolbar;
//# sourceMappingURL=Toolbar.js.map