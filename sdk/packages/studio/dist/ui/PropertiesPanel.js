"use strict";
/**
 * @fileoverview PropertiesPanel - 属性编辑面板
 * @version 1.1.0-beta
 * @based_on MPLP V1.0 Alpha属性管理模式
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PropertiesPanel = void 0;
/**
 * PropertiesPanel组件 - 基于MPLP V1.0 Alpha属性管理模式
 * 提供动态属性编辑和验证功能
 */
class PropertiesPanel {
    constructor(config, eventManager) {
        this._isInitialized = false;
        this.fields = new Map();
        this.groups = new Map();
        this.currentTarget = null; // 当前编辑的目标对象
        this.validationErrors = new Map();
        // DOM元素
        this.panelContainer = null;
        this.panelElement = null;
        this.headerElement = null;
        this.contentElement = null;
        this.config = config;
        this.eventManager = eventManager;
        // 初始化面板配置
        this.panelConfig = {
            width: 300,
            backgroundColor: '#ffffff',
            borderColor: '#dee2e6',
            groupSpacing: 16,
            fieldSpacing: 12,
            labelWidth: 120,
            showGroupHeaders: true,
            collapsibleGroups: true,
            showDescriptions: true,
            showValidationErrors: true
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
            // 创建属性面板DOM结构
            this.createPanelDOM();
            // 设置事件监听器
            this.setupEventListeners();
            // 渲染面板
            this.render();
            this._isInitialized = true;
            this.emitEvent('propertiesPanelInitialized', {
                panelId: 'properties-panel',
                config: this.panelConfig
            });
        }
        catch (error) {
            throw new Error(`Failed to initialize PropertiesPanel: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
            if (this.panelContainer && this.panelContainer.parentNode) {
                this.panelContainer.parentNode.removeChild(this.panelContainer);
            }
            this._isInitialized = false;
            this.emitEvent('propertiesPanelShutdown', { panelId: 'properties-panel' });
        }
        catch (error) {
            throw new Error(`Failed to shutdown PropertiesPanel: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
        this.eventManager.emit(`properties:${eventType}`, data);
    }
    /**
     * 创建属性面板DOM结构
     */
    createPanelDOM() {
        // 创建容器
        this.panelContainer = document.createElement('div');
        this.panelContainer.className = 'mplp-properties-panel-container';
        this.panelContainer.style.cssText = `
      position: relative;
      width: ${this.panelConfig.width}px;
      height: 100%;
      background-color: ${this.panelConfig.backgroundColor};
      border-left: 1px solid ${this.panelConfig.borderColor};
      display: flex;
      flex-direction: column;
      user-select: none;
    `;
        // 创建头部
        this.headerElement = document.createElement('div');
        this.headerElement.className = 'mplp-properties-panel-header';
        this.headerElement.style.cssText = `
      padding: 12px 16px;
      border-bottom: 1px solid ${this.panelConfig.borderColor};
      background-color: #f8f9fa;
      font-weight: 600;
      font-size: 14px;
      color: #495057;
    `;
        this.headerElement.textContent = 'Properties';
        // 创建内容区域
        this.contentElement = document.createElement('div');
        this.contentElement.className = 'mplp-properties-panel-content';
        this.contentElement.style.cssText = `
      flex: 1;
      overflow-y: auto;
      padding: 16px;
    `;
        // 组装面板
        this.panelContainer.appendChild(this.headerElement);
        this.panelContainer.appendChild(this.contentElement);
        // 添加到页面（这里假设有一个目标容器）
        const targetContainer = document.getElementById('studio-properties-panel-container') || document.body;
        targetContainer.appendChild(this.panelContainer);
    }
    /**
     * 设置事件监听器
     */
    setupEventListeners() {
        // 监听选择变化事件
        this.eventManager.on('canvas:elementSelected', (data) => {
            this.handleElementSelected(data);
        });
        this.eventManager.on('canvas:selectionCleared', () => {
            this.handleSelectionCleared();
        });
    }
    /**
     * 移除事件监听器
     */
    removeEventListeners() {
        this.eventManager.off('canvas:elementSelected', this.handleElementSelected.bind(this));
        this.eventManager.off('canvas:selectionCleared', this.handleSelectionCleared.bind(this));
    }
    /**
     * 处理元素选择事件
     */
    handleElementSelected(data) {
        // 这里应该根据选中的元素类型加载相应的属性
        this.loadPropertiesForElement(data.elementId);
    }
    /**
     * 处理选择清除事件
     */
    handleSelectionCleared() {
        this.clearProperties();
    }
    /**
     * 为元素加载属性
     */
    loadPropertiesForElement(elementId) {
        // 清除现有属性
        this.fields.clear();
        this.groups.clear();
        this.validationErrors.clear();
        // 创建示例属性（实际应用中应该根据元素类型动态生成）
        this.createSampleProperties(elementId);
        // 渲染属性
        this.render();
    }
    /**
     * 创建示例属性
     */
    createSampleProperties(elementId) {
        // 基本属性组
        const basicGroup = {
            id: 'basic',
            label: 'Basic Properties',
            expanded: true,
            visible: true,
            position: 1,
            fields: ['name', 'type', 'description']
        };
        const basicFields = [
            {
                id: 'name',
                label: 'Name',
                type: 'text',
                value: `Element ${elementId}`,
                defaultValue: '',
                required: true,
                readonly: false,
                visible: true,
                group: 'basic',
                description: 'The name of the element',
                placeholder: 'Enter element name'
            },
            {
                id: 'type',
                label: 'Type',
                type: 'select',
                value: 'agent',
                defaultValue: 'agent',
                required: true,
                readonly: false,
                visible: true,
                group: 'basic',
                description: 'The type of the element',
                options: [
                    { label: 'Agent', value: 'agent' },
                    { label: 'Component', value: 'component' },
                    { label: 'Connection', value: 'connection' }
                ]
            },
            {
                id: 'description',
                label: 'Description',
                type: 'textarea',
                value: '',
                defaultValue: '',
                required: false,
                readonly: false,
                visible: true,
                group: 'basic',
                description: 'A description of the element',
                placeholder: 'Enter description'
            }
        ];
        // 样式属性组
        const styleGroup = {
            id: 'style',
            label: 'Style Properties',
            expanded: false,
            visible: true,
            position: 2,
            fields: ['backgroundColor', 'borderColor', 'borderWidth', 'opacity']
        };
        const styleFields = [
            {
                id: 'backgroundColor',
                label: 'Background Color',
                type: 'color',
                value: '#ffffff',
                defaultValue: '#ffffff',
                required: false,
                readonly: false,
                visible: true,
                group: 'style',
                description: 'The background color of the element'
            },
            {
                id: 'borderColor',
                label: 'Border Color',
                type: 'color',
                value: '#6c757d',
                defaultValue: '#6c757d',
                required: false,
                readonly: false,
                visible: true,
                group: 'style',
                description: 'The border color of the element'
            },
            {
                id: 'borderWidth',
                label: 'Border Width',
                type: 'range',
                value: 1,
                defaultValue: 1,
                required: false,
                readonly: false,
                visible: true,
                group: 'style',
                description: 'The border width in pixels',
                min: 0,
                max: 10,
                step: 1
            },
            {
                id: 'opacity',
                label: 'Opacity',
                type: 'range',
                value: 1,
                defaultValue: 1,
                required: false,
                readonly: false,
                visible: true,
                group: 'style',
                description: 'The opacity of the element',
                min: 0,
                max: 1,
                step: 0.1
            }
        ];
        // 添加组和字段
        this.groups.set(basicGroup.id, basicGroup);
        this.groups.set(styleGroup.id, styleGroup);
        [...basicFields, ...styleFields].forEach(field => {
            this.fields.set(field.id, field);
        });
    }
    /**
     * 清除属性
     */
    clearProperties() {
        this.fields.clear();
        this.groups.clear();
        this.validationErrors.clear();
        this.currentTarget = null;
        this.render();
    }
    /**
     * 渲染属性面板
     */
    render() {
        if (!this.contentElement)
            return;
        // 清空内容
        this.contentElement.innerHTML = '';
        if (this.fields.size === 0) {
            // 显示无选择消息
            const noSelectionMessage = document.createElement('div');
            noSelectionMessage.style.cssText = `
        text-align: center;
        color: #6c757d;
        font-size: 14px;
        margin-top: 40px;
      `;
            noSelectionMessage.textContent = 'Select an element to edit properties';
            this.contentElement.appendChild(noSelectionMessage);
            return;
        }
        // 按位置排序组
        const sortedGroups = Array.from(this.groups.values())
            .filter(group => group.visible)
            .sort((a, b) => a.position - b.position);
        // 渲染每个组
        sortedGroups.forEach(group => {
            this.renderGroup(group);
        });
    }
    /**
     * 渲染属性组
     */
    renderGroup(group) {
        if (!this.contentElement)
            return;
        const groupElement = document.createElement('div');
        groupElement.className = 'mplp-property-group';
        groupElement.style.cssText = `
      margin-bottom: ${this.panelConfig.groupSpacing}px;
    `;
        // 创建组头部
        if (this.panelConfig.showGroupHeaders) {
            const groupHeader = document.createElement('div');
            groupHeader.className = 'mplp-property-group-header';
            groupHeader.style.cssText = `
        display: flex;
        align-items: center;
        padding: 8px 0;
        font-weight: 600;
        font-size: 13px;
        color: #495057;
        border-bottom: 1px solid #e9ecef;
        margin-bottom: 12px;
        cursor: ${this.panelConfig.collapsibleGroups ? 'pointer' : 'default'};
      `;
            const expandIcon = document.createElement('span');
            expandIcon.style.cssText = `
        margin-right: 8px;
        font-size: 12px;
        transition: transform 0.2s ease;
        transform: rotate(${group.expanded ? 90 : 0}deg);
      `;
            expandIcon.textContent = '▶';
            const groupLabel = document.createElement('span');
            groupLabel.textContent = group.label;
            groupHeader.appendChild(expandIcon);
            groupHeader.appendChild(groupLabel);
            // 添加折叠功能
            if (this.panelConfig.collapsibleGroups) {
                groupHeader.addEventListener('click', () => {
                    group.expanded = !group.expanded;
                    this.render();
                });
            }
            groupElement.appendChild(groupHeader);
        }
        // 创建组内容
        if (group.expanded) {
            const groupContent = document.createElement('div');
            groupContent.className = 'mplp-property-group-content';
            // 渲染组内字段
            group.fields.forEach(fieldId => {
                const field = this.fields.get(fieldId);
                if (field && field.visible) {
                    const fieldElement = this.createFieldElement(field);
                    groupContent.appendChild(fieldElement);
                }
            });
            groupElement.appendChild(groupContent);
        }
        this.contentElement.appendChild(groupElement);
    }
    /**
     * 创建字段元素
     */
    createFieldElement(field) {
        const fieldElement = document.createElement('div');
        fieldElement.className = 'mplp-property-field';
        fieldElement.style.cssText = `
      margin-bottom: ${this.panelConfig.fieldSpacing}px;
    `;
        // 创建标签
        const labelElement = document.createElement('label');
        labelElement.className = 'mplp-property-label';
        labelElement.style.cssText = `
      display: block;
      font-size: 13px;
      font-weight: 500;
      color: #495057;
      margin-bottom: 4px;
    `;
        labelElement.textContent = field.label + (field.required ? ' *' : '');
        // 创建输入控件
        const inputElement = this.createInputElement(field);
        // 创建描述
        let descriptionElement = null;
        if (this.panelConfig.showDescriptions && field.description) {
            descriptionElement = document.createElement('div');
            descriptionElement.className = 'mplp-property-description';
            descriptionElement.style.cssText = `
        font-size: 12px;
        color: #6c757d;
        margin-top: 4px;
      `;
            descriptionElement.textContent = field.description;
        }
        // 创建验证错误
        let errorElement = null;
        const error = this.validationErrors.get(field.id);
        if (this.panelConfig.showValidationErrors && error) {
            errorElement = document.createElement('div');
            errorElement.className = 'mplp-property-error';
            errorElement.style.cssText = `
        font-size: 12px;
        color: #dc3545;
        margin-top: 4px;
      `;
            errorElement.textContent = error;
        }
        // 组装字段
        fieldElement.appendChild(labelElement);
        fieldElement.appendChild(inputElement);
        if (descriptionElement) {
            fieldElement.appendChild(descriptionElement);
        }
        if (errorElement) {
            fieldElement.appendChild(errorElement);
        }
        return fieldElement;
    }
    /**
     * 创建输入控件
     */
    createInputElement(field) {
        let inputElement;
        const baseStyle = `
      width: 100%;
      padding: 6px 8px;
      border: 1px solid #ced4da;
      border-radius: 4px;
      font-size: 13px;
      background-color: ${field.readonly ? '#f8f9fa' : '#ffffff'};
    `;
        switch (field.type) {
            case 'text':
                inputElement = document.createElement('input');
                inputElement.type = 'text';
                inputElement.value = field.value || '';
                inputElement.placeholder = field.placeholder || '';
                inputElement.readOnly = field.readonly;
                inputElement.style.cssText = baseStyle;
                break;
            case 'number':
                inputElement = document.createElement('input');
                inputElement.type = 'number';
                inputElement.value = field.value || '';
                inputElement.min = field.min?.toString() || '';
                inputElement.max = field.max?.toString() || '';
                inputElement.step = field.step?.toString() || '';
                inputElement.readOnly = field.readonly;
                inputElement.style.cssText = baseStyle;
                break;
            case 'boolean':
                inputElement = document.createElement('input');
                inputElement.type = 'checkbox';
                inputElement.checked = field.value || false;
                inputElement.disabled = field.readonly;
                inputElement.style.cssText = 'margin: 4px 0;';
                break;
            case 'select':
                inputElement = document.createElement('select');
                inputElement.disabled = field.readonly;
                inputElement.style.cssText = baseStyle;
                field.options?.forEach(option => {
                    const optionElement = document.createElement('option');
                    optionElement.value = option.value;
                    optionElement.textContent = option.label;
                    optionElement.selected = option.value === field.value;
                    inputElement.appendChild(optionElement);
                });
                break;
            case 'color':
                inputElement = document.createElement('input');
                inputElement.type = 'color';
                inputElement.value = field.value || '#000000';
                inputElement.disabled = field.readonly;
                inputElement.style.cssText = baseStyle + ' height: 32px;';
                break;
            case 'range':
                inputElement = document.createElement('input');
                inputElement.type = 'range';
                inputElement.value = field.value || '';
                inputElement.min = field.min?.toString() || '';
                inputElement.max = field.max?.toString() || '';
                inputElement.step = field.step?.toString() || '';
                inputElement.disabled = field.readonly;
                inputElement.style.cssText = baseStyle;
                break;
            case 'textarea':
                inputElement = document.createElement('textarea');
                inputElement.value = field.value || '';
                inputElement.placeholder = field.placeholder || '';
                inputElement.readOnly = field.readonly;
                inputElement.rows = 3;
                inputElement.style.cssText = baseStyle + ' resize: vertical;';
                break;
            case 'json':
                inputElement = document.createElement('textarea');
                inputElement.value = JSON.stringify(field.value, null, 2) || '';
                inputElement.readOnly = field.readonly;
                inputElement.rows = 5;
                inputElement.style.cssText = baseStyle + ' font-family: monospace; resize: vertical;';
                break;
            default:
                inputElement = document.createElement('input');
                inputElement.type = 'text';
                inputElement.value = field.value || '';
                inputElement.style.cssText = baseStyle;
        }
        // 添加变更事件监听器
        inputElement.addEventListener('change', (event) => {
            this.handleFieldChange(field, event);
        });
        inputElement.addEventListener('input', (event) => {
            this.handleFieldInput(field, event);
        });
        return inputElement;
    }
    /**
     * 处理字段变更
     */
    handleFieldChange(field, event) {
        const target = event.target;
        let newValue;
        switch (field.type) {
            case 'boolean':
                newValue = target.checked;
                break;
            case 'number':
            case 'range':
                newValue = parseFloat(target.value) || 0;
                break;
            case 'json':
                try {
                    newValue = JSON.parse(target.value);
                }
                catch {
                    newValue = field.value; // 保持原值如果JSON无效
                }
                break;
            default:
                newValue = target.value;
        }
        // 验证字段
        const error = this.validateField(field, newValue);
        if (error) {
            this.validationErrors.set(field.id, error);
        }
        else {
            this.validationErrors.delete(field.id);
            field.value = newValue;
        }
        // 重新渲染以显示验证错误
        this.render();
        // 发射属性变更事件
        this.emitEvent('propertyChanged', {
            fieldId: field.id,
            field: field,
            oldValue: field.value,
            newValue: newValue,
            valid: !error
        });
    }
    /**
     * 处理字段输入
     */
    handleFieldInput(field, event) {
        // 实时输入处理（如果需要）
    }
    /**
     * 验证字段
     */
    validateField(field, value) {
        // 必填验证
        if (field.required && (value === null || value === undefined || value === '')) {
            return `${field.label} is required`;
        }
        // 自定义验证
        if (field.validation) {
            return field.validation(value);
        }
        // 数值范围验证
        if (field.type === 'number' || field.type === 'range') {
            const numValue = parseFloat(value);
            if (field.min !== undefined && numValue < field.min) {
                return `${field.label} must be at least ${field.min}`;
            }
            if (field.max !== undefined && numValue > field.max) {
                return `${field.label} must be at most ${field.max}`;
            }
        }
        return null;
    }
    // ===== 公共API方法 =====
    /**
     * 设置属性目标
     */
    setTarget(target) {
        this.currentTarget = target;
        // 根据目标类型加载属性
        this.loadPropertiesForTarget(target);
    }
    /**
     * 为目标加载属性
     */
    loadPropertiesForTarget(target) {
        // 实际应用中应该根据目标对象的类型和属性动态生成字段
        this.createSampleProperties(target?.id || 'unknown');
        this.render();
    }
    /**
     * 获取当前属性值
     */
    getPropertyValues() {
        const values = {};
        this.fields.forEach((field, id) => {
            values[id] = field.value;
        });
        return values;
    }
    /**
     * 设置属性值
     */
    setPropertyValues(values) {
        Object.entries(values).forEach(([fieldId, value]) => {
            const field = this.fields.get(fieldId);
            if (field) {
                field.value = value;
            }
        });
        this.render();
    }
    /**
     * 验证所有字段
     */
    validateAll() {
        this.validationErrors.clear();
        let isValid = true;
        this.fields.forEach(field => {
            const error = this.validateField(field, field.value);
            if (error) {
                this.validationErrors.set(field.id, error);
                isValid = false;
            }
        });
        this.render();
        return isValid;
    }
    /**
     * 重置所有字段到默认值
     */
    resetToDefaults() {
        this.fields.forEach(field => {
            field.value = field.defaultValue;
        });
        this.validationErrors.clear();
        this.render();
        this.emitEvent('propertiesReset', {});
    }
    /**
     * 获取面板配置
     */
    getPanelConfig() {
        return { ...this.panelConfig };
    }
    /**
     * 更新面板配置
     */
    updatePanelConfig(updates) {
        this.panelConfig = { ...this.panelConfig, ...updates };
        this.render();
        this.emitEvent('configUpdated', { config: this.panelConfig });
    }
}
exports.PropertiesPanel = PropertiesPanel;
//# sourceMappingURL=PropertiesPanel.js.map