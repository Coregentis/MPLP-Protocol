"use strict";
/**
 * @fileoverview Agent Builder - 可视化Agent构建器
 * @version 1.1.0-beta
 * @based_on MPLP V1.0 Alpha Agent架构
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentBuilder = void 0;
/**
 * Agent构建器 - 基于MPLP V1.0 Alpha Agent构建模式
 * 提供拖拽式的可视化Agent设计和配置功能
 */
class AgentBuilder {
    constructor(config, eventManager) {
        this._isInitialized = false;
        this.agents = new Map();
        this.components = new Map();
        this.connections = new Map();
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
     * 初始化Agent构建器
     */
    async initialize() {
        if (this._isInitialized) {
            return;
        }
        try {
            // 加载默认组件库
            await this.loadDefaultComponents();
            // 初始化构建器状态
            this._isInitialized = true;
            this.emitEvent('initialized', { module: 'AgentBuilder' });
        }
        catch (error) {
            this.emitEvent('error', {
                error: error instanceof Error ? error.message : String(error),
                module: 'AgentBuilder',
                context: 'initialization'
            });
            throw error;
        }
    }
    /**
     * 关闭Agent构建器
     */
    async shutdown() {
        if (!this._isInitialized) {
            return;
        }
        try {
            // 清理资源
            this.agents.clear();
            this.components.clear();
            this.connections.clear();
            this._isInitialized = false;
            this.emitEvent('shutdown', { module: 'AgentBuilder' });
        }
        catch (error) {
            this.emitEvent('error', {
                error: error instanceof Error ? error.message : String(error),
                module: 'AgentBuilder',
                context: 'shutdown'
            });
            throw error;
        }
    }
    // ===== Agent管理方法 - 基于MPLP V1.0 Alpha Agent管理模式 =====
    /**
     * 创建新Agent
     */
    async createAgent(name, config = {}) {
        if (!this._isInitialized) {
            throw new Error('AgentBuilder not initialized');
        }
        const agent = {
            id: `agent-${Date.now()}`,
            name,
            type: config.type || 'simple',
            capabilities: config.capabilities || [],
            platforms: config.platforms || [],
            config: {
                type: config.type,
                description: config.description,
                capabilities: config.capabilities,
                platforms: config.platforms,
                settings: config.settings,
                triggers: config.triggers,
                actions: config.actions,
                ...config
            },
            components: [],
            status: 'draft',
            createdAt: new Date(),
            updatedAt: new Date()
        };
        this.agents.set(agent.id, agent);
        this.emitEvent('agentCreated', {
            agentId: agent.id,
            agentName: agent.name,
            agentType: agent.type
        });
        return agent;
    }
    /**
     * 获取Agent
     */
    getAgent(agentId) {
        return this.agents.get(agentId);
    }
    /**
     * 更新Agent
     */
    async updateAgent(agentId, updates) {
        if (!this._isInitialized) {
            throw new Error('AgentBuilder not initialized');
        }
        const agent = this.agents.get(agentId);
        if (!agent) {
            throw new Error(`Agent not found: ${agentId}`);
        }
        const updatedAgent = {
            ...agent,
            ...updates,
            updatedAt: new Date()
        };
        this.agents.set(agentId, updatedAgent);
        this.emitEvent('agentUpdated', {
            agentId,
            updates: Object.keys(updates)
        });
        return updatedAgent;
    }
    /**
     * 删除Agent
     */
    async deleteAgent(agentId) {
        if (!this._isInitialized) {
            throw new Error('AgentBuilder not initialized');
        }
        const agent = this.agents.get(agentId);
        if (!agent) {
            throw new Error(`Agent not found: ${agentId}`);
        }
        this.agents.delete(agentId);
        this.emitEvent('agentDeleted', { agentId, agentName: agent.name });
    }
    /**
     * 获取所有Agent
     */
    getAllAgents() {
        return Array.from(this.agents.values());
    }
    // ===== 组件管理方法 - 基于MPLP V1.0 Alpha组件管理模式 =====
    /**
     * 添加组件到Agent
     */
    async addComponentToAgent(agentId, component) {
        if (!this._isInitialized) {
            throw new Error('AgentBuilder not initialized');
        }
        const agent = this.agents.get(agentId);
        if (!agent) {
            throw new Error(`Agent not found: ${agentId}`);
        }
        // 添加组件到Agent
        agent.components.push(component.id);
        this.components.set(component.id, component);
        // 更新Agent
        agent.updatedAt = new Date();
        this.agents.set(agentId, agent);
        this.emitEvent('componentAdded', {
            agentId,
            componentId: component.id,
            componentType: component.type
        });
    }
    /**
     * 创建组件连接
     */
    async createConnection(connection) {
        if (!this._isInitialized) {
            throw new Error('AgentBuilder not initialized');
        }
        // 验证连接的组件存在
        const sourceComponent = this.components.get(connection.sourceId);
        const targetComponent = this.components.get(connection.targetId);
        if (!sourceComponent || !targetComponent) {
            throw new Error('Source or target component not found');
        }
        this.connections.set(connection.id, connection);
        this.emitEvent('connectionCreated', {
            connectionId: connection.id,
            sourceId: connection.sourceId,
            targetId: connection.targetId,
            type: connection.type
        });
    }
    // ===== 私有方法 =====
    /**
     * 加载默认组件库
     */
    async loadDefaultComponents() {
        // 基于MPLP V1.0 Alpha的默认组件
        const defaultComponents = [
            {
                id: 'input-text',
                name: 'Text Input',
                type: 'input',
                category: 'inputs',
                description: 'Text input component',
                config: {
                    properties: { placeholder: 'Enter text...' },
                    validation: { required: [], schema: {} },
                    ui: { icon: 'text', color: '#3b82f6', size: 'medium' }
                },
                position: { x: 0, y: 0 },
                connections: []
            },
            {
                id: 'processor-llm',
                name: 'LLM Processor',
                type: 'processor',
                category: 'processors',
                description: 'Large Language Model processor',
                config: {
                    properties: { model: 'gpt-4', temperature: 0.7 },
                    validation: { required: ['model'], schema: {} },
                    ui: { icon: 'brain', color: '#10b981', size: 'large' }
                },
                position: { x: 0, y: 0 },
                connections: []
            },
            {
                id: 'output-response',
                name: 'Response Output',
                type: 'output',
                category: 'outputs',
                description: 'Response output component',
                config: {
                    properties: { format: 'text' },
                    validation: { required: [], schema: {} },
                    ui: { icon: 'message', color: '#f59e0b', size: 'medium' }
                },
                position: { x: 0, y: 0 },
                connections: []
            }
        ];
        // 加载默认组件到组件库
        for (const component of defaultComponents) {
            this.components.set(component.id, component);
        }
    }
    /**
     * 发射事件 - 基于MPLP V1.0 Alpha事件发射模式
     */
    emitEvent(type, data) {
        this.eventManager.emitMPLP(type, 'AgentBuilder', data);
    }
}
exports.AgentBuilder = AgentBuilder;
//# sourceMappingURL=AgentBuilder.js.map