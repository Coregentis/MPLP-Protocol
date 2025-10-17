"use strict";
/**
 * @fileoverview Component Library - 组件库管理器
 * @version 1.1.0-beta
 * @based_on MPLP V1.0 Alpha组件架构
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComponentLibrary = void 0;
/**
 * 组件库管理器 - 基于MPLP V1.0 Alpha组件管理模式
 * 提供组件的注册、分类、搜索和管理功能
 */
class ComponentLibrary {
    constructor(config, eventManager) {
        this._isInitialized = false;
        this.components = new Map();
        this.categories = new Map();
        this.templates = new Map();
        this.config = config;
        this.eventManager = eventManager;
    }
    // ===== IStudioManager接口实现 =====
    /**
     * 获取状态
     */
    getStatus() {
        return this._isInitialized ? 'initialized' : 'not_initialized';
    }
    /**
     * 事件监听 - 委托给eventManager
     */
    on(event, listener) {
        this.eventManager.on(event, listener);
        return this;
    }
    /**
     * 发射事件 - 委托给eventManager
     */
    emit(event, ...args) {
        return this.eventManager.emit(event, ...args);
    }
    /**
     * 移除事件监听器 - 委托给eventManager
     */
    off(event, listener) {
        this.eventManager.off(event, listener);
        return this;
    }
    /**
     * 移除所有事件监听器 - 委托给eventManager
     */
    removeAllListeners(event) {
        this.eventManager.removeAllListeners(event);
        return this;
    }
    // ===== 核心生命周期方法 - 基于MPLP V1.0 Alpha生命周期模式 =====
    /**
     * 初始化组件库
     */
    async initialize() {
        if (this._isInitialized) {
            return;
        }
        try {
            // 加载默认组件类别
            await this.loadDefaultCategories();
            // 加载默认组件
            await this.loadDefaultComponents();
            // 加载组件模板
            await this.loadDefaultTemplates();
            this._isInitialized = true;
            this.emitEvent('initialized', { module: 'ComponentLibrary' });
        }
        catch (error) {
            this.emitEvent('error', {
                error: error instanceof Error ? error.message : String(error),
                module: 'ComponentLibrary',
                context: 'initialization'
            });
            throw error;
        }
    }
    /**
     * 关闭组件库
     */
    async shutdown() {
        if (!this._isInitialized) {
            return;
        }
        try {
            // 清理资源
            this.components.clear();
            this.categories.clear();
            this.templates.clear();
            this._isInitialized = false;
            this.emitEvent('shutdown', { module: 'ComponentLibrary' });
        }
        catch (error) {
            this.emitEvent('error', {
                error: error instanceof Error ? error.message : String(error),
                module: 'ComponentLibrary',
                context: 'shutdown'
            });
            throw error;
        }
    }
    // ===== 组件管理方法 - 基于MPLP V1.0 Alpha组件管理模式 =====
    /**
     * 注册组件
     */
    async registerComponent(component) {
        if (!this._isInitialized) {
            throw new Error('ComponentLibrary not initialized');
        }
        // 验证组件
        this.validateComponent(component);
        // 注册组件
        this.components.set(component.id, component);
        // 添加到对应类别
        const category = this.categories.get(component.category);
        if (category && !category.components.includes(component.id)) {
            category.components.push(component.id);
            this.categories.set(category.id, category);
        }
        this.emitEvent('componentRegistered', {
            componentId: component.id,
            componentName: component.name,
            category: component.category
        });
    }
    /**
     * 获取组件
     */
    getComponent(componentId) {
        return this.components.get(componentId);
    }
    /**
     * 获取所有组件
     */
    getAllComponents() {
        return Array.from(this.components.values());
    }
    /**
     * 按类别获取组件
     */
    getComponentsByCategory(categoryId) {
        const category = this.categories.get(categoryId);
        if (!category) {
            return [];
        }
        return category.components
            .map(id => this.components.get(id))
            .filter((component) => component !== undefined);
    }
    /**
     * 搜索组件
     */
    searchComponents(query, filters) {
        const components = this.getAllComponents();
        const lowerQuery = query.toLowerCase();
        return components.filter(component => {
            // 文本搜索
            const matchesQuery = !query ||
                component.name.toLowerCase().includes(lowerQuery) ||
                component.description?.toLowerCase().includes(lowerQuery);
            // 类别过滤
            const matchesCategory = !filters?.category ||
                component.category === filters.category;
            // 类型过滤
            const matchesType = !filters?.type ||
                component.type === filters.type;
            return matchesQuery && matchesCategory && matchesType;
        });
    }
    // ===== 类别管理方法 =====
    /**
     * 注册组件类别
     */
    async registerCategory(category) {
        if (!this._isInitialized) {
            throw new Error('ComponentLibrary not initialized');
        }
        this.categories.set(category.id, category);
        this.emitEvent('categoryRegistered', {
            categoryId: category.id,
            categoryName: category.name
        });
    }
    /**
     * 获取所有类别
     */
    getAllCategories() {
        return Array.from(this.categories.values());
    }
    /**
     * 获取类别
     */
    getCategory(categoryId) {
        return this.categories.get(categoryId);
    }
    // ===== 模板管理方法 =====
    /**
     * 注册组件模板
     */
    async registerTemplate(template) {
        if (!this._isInitialized) {
            throw new Error('ComponentLibrary not initialized');
        }
        this.templates.set(template.id, template);
        this.emitEvent('templateRegistered', {
            templateId: template.id,
            templateName: template.name,
            category: template.category
        });
    }
    /**
     * 从模板创建组件
     */
    createComponentFromTemplate(templateId, overrides = {}) {
        const template = this.templates.get(templateId);
        if (!template) {
            throw new Error(`Template not found: ${templateId}`);
        }
        const component = {
            id: `component-${Date.now()}`,
            name: template.name,
            type: 'processor',
            category: template.category,
            description: template.description,
            config: {
                properties: {},
                validation: { required: [], schema: {} },
                ui: { icon: 'component', color: '#6b7280', size: 'medium' }
            },
            position: { x: 0, y: 0 },
            connections: [],
            ...template.template,
            ...overrides
        };
        return component;
    }
    /**
     * 获取所有模板
     */
    getAllTemplates() {
        return Array.from(this.templates.values());
    }
    /**
     * 按类别获取模板
     */
    getTemplatesByCategory(categoryId) {
        return this.getAllTemplates().filter(template => template.category === categoryId);
    }
    // ===== 私有方法 =====
    /**
     * 验证组件
     */
    validateComponent(component) {
        if (!component.id) {
            throw new Error('Component ID is required');
        }
        if (!component.name) {
            throw new Error('Component name is required');
        }
        if (!component.type) {
            throw new Error('Component type is required');
        }
        if (!component.category) {
            throw new Error('Component category is required');
        }
        if (!this.categories.has(component.category)) {
            throw new Error(`Unknown category: ${component.category}`);
        }
    }
    /**
     * 加载默认类别
     */
    async loadDefaultCategories() {
        const defaultCategories = [
            {
                id: 'inputs',
                name: 'Inputs',
                description: 'Input components for data collection',
                icon: 'input',
                color: '#3b82f6',
                components: []
            },
            {
                id: 'processors',
                name: 'Processors',
                description: 'Processing components for data transformation',
                icon: 'processor',
                color: '#10b981',
                components: []
            },
            {
                id: 'outputs',
                name: 'Outputs',
                description: 'Output components for data presentation',
                icon: 'output',
                color: '#f59e0b',
                components: []
            },
            {
                id: 'connectors',
                name: 'Connectors',
                description: 'Connector components for system integration',
                icon: 'connector',
                color: '#8b5cf6',
                components: []
            },
            {
                id: 'ai',
                name: 'AI Components',
                description: 'AI and machine learning components',
                icon: 'brain',
                color: '#ef4444',
                components: []
            }
        ];
        for (const category of defaultCategories) {
            this.categories.set(category.id, category);
        }
    }
    /**
     * 加载默认组件
     */
    async loadDefaultComponents() {
        // 这里可以加载预定义的组件
        // 实际实现中可能从配置文件或远程服务加载
    }
    /**
     * 加载默认模板
     */
    async loadDefaultTemplates() {
        // 这里可以加载预定义的组件模板
        // 实际实现中可能从配置文件或远程服务加载
    }
    /**
     * 发射事件 - 基于MPLP V1.0 Alpha事件发射模式
     */
    emitEvent(type, data) {
        this.eventManager.emitMPLP(type, 'ComponentLibrary', data);
    }
}
exports.ComponentLibrary = ComponentLibrary;
//# sourceMappingURL=ComponentLibrary.js.map