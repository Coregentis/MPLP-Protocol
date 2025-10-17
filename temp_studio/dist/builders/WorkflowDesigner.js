"use strict";
/**
 * @fileoverview Workflow Designer - 可视化工作流设计器
 * @version 1.1.0-beta
 * @based_on MPLP V1.0 Alpha Workflow架构
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowDesigner = void 0;
/**
 * 工作流设计器 - 基于MPLP V1.0 Alpha工作流设计模式
 * 提供拖拽式的可视化工作流设计和配置功能
 */
class WorkflowDesigner {
    constructor(config, eventManager) {
        this._isInitialized = false;
        this.workflows = new Map();
        this.workflowSteps = new Map();
        this.workflowTriggers = new Map();
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
     * 初始化工作流设计器
     */
    async initialize() {
        if (this._isInitialized) {
            return;
        }
        try {
            // 加载默认工作流模板
            await this.loadDefaultTemplates();
            // 初始化设计器状态
            this._isInitialized = true;
            this.emitEvent('initialized', { module: 'WorkflowDesigner' });
        }
        catch (error) {
            this.emitEvent('error', {
                error: error instanceof Error ? error.message : String(error),
                module: 'WorkflowDesigner',
                context: 'initialization'
            });
            throw error;
        }
    }
    /**
     * 关闭工作流设计器
     */
    async shutdown() {
        if (!this._isInitialized) {
            return;
        }
        try {
            // 清理资源
            this.workflows.clear();
            this.workflowSteps.clear();
            this.workflowTriggers.clear();
            this._isInitialized = false;
            this.emitEvent('shutdown', { module: 'WorkflowDesigner' });
        }
        catch (error) {
            this.emitEvent('error', {
                error: error instanceof Error ? error.message : String(error),
                module: 'WorkflowDesigner',
                context: 'shutdown'
            });
            throw error;
        }
    }
    // ===== 工作流管理方法 - 基于MPLP V1.0 Alpha工作流管理模式 =====
    /**
     * 创建新工作流
     */
    async createWorkflow(name, config = {}) {
        if (!this._isInitialized) {
            throw new Error('WorkflowDesigner not initialized');
        }
        const workflow = {
            id: `workflow-${Date.now()}`,
            name,
            description: config.description || '',
            config: {
                timeout: config.timeout || 300000, // 5分钟默认超时
                retryPolicy: config.retryPolicy || { maxRetries: 3, backoff: 'exponential' },
                errorHandling: config.errorHandling || 'stop',
                parallel: config.parallel || false,
                ...config
            },
            steps: [],
            triggers: [],
            agents: [],
            status: 'draft',
            createdAt: new Date(),
            updatedAt: new Date()
        };
        this.workflows.set(workflow.id, workflow);
        this.emitEvent('workflowCreated', {
            workflowId: workflow.id,
            workflowName: workflow.name
        });
        return workflow;
    }
    /**
     * 获取工作流
     */
    getWorkflow(workflowId) {
        return this.workflows.get(workflowId);
    }
    /**
     * 更新工作流
     */
    async updateWorkflow(workflowId, updates) {
        if (!this._isInitialized) {
            throw new Error('WorkflowDesigner not initialized');
        }
        const workflow = this.workflows.get(workflowId);
        if (!workflow) {
            throw new Error(`Workflow not found: ${workflowId}`);
        }
        const updatedWorkflow = {
            ...workflow,
            ...updates,
            updatedAt: new Date()
        };
        this.workflows.set(workflowId, updatedWorkflow);
        this.emitEvent('workflowUpdated', {
            workflowId,
            updates: Object.keys(updates)
        });
        return updatedWorkflow;
    }
    /**
     * 删除工作流
     */
    async deleteWorkflow(workflowId) {
        if (!this._isInitialized) {
            throw new Error('WorkflowDesigner not initialized');
        }
        const workflow = this.workflows.get(workflowId);
        if (!workflow) {
            throw new Error(`Workflow not found: ${workflowId}`);
        }
        this.workflows.delete(workflowId);
        this.emitEvent('workflowDeleted', { workflowId, workflowName: workflow.name });
    }
    /**
     * 获取所有工作流
     */
    getAllWorkflows() {
        return Array.from(this.workflows.values());
    }
    // ===== 工作流步骤管理方法 =====
    /**
     * 添加工作流步骤
     */
    async addStepToWorkflow(workflowId, step) {
        if (!this._isInitialized) {
            throw new Error('WorkflowDesigner not initialized');
        }
        const workflow = this.workflows.get(workflowId);
        if (!workflow) {
            throw new Error(`Workflow not found: ${workflowId}`);
        }
        // 添加步骤到工作流
        workflow.steps.push(step.id);
        this.workflowSteps.set(step.id, step);
        // 更新工作流
        workflow.updatedAt = new Date();
        this.workflows.set(workflowId, workflow);
        this.emitEvent('stepAdded', {
            workflowId,
            stepId: step.id,
            stepType: step.type
        });
    }
    /**
     * 创建工作流步骤
     */
    createWorkflowStep(name, type, config = {}) {
        return {
            id: `step-${Date.now()}`,
            name,
            type,
            config,
            position: { x: 0, y: 0 },
            connections: {
                inputs: [],
                outputs: []
            },
            status: 'pending'
        };
    }
    /**
     * 添加触发器到工作流
     */
    async addTriggerToWorkflow(workflowId, trigger) {
        if (!this._isInitialized) {
            throw new Error('WorkflowDesigner not initialized');
        }
        const workflow = this.workflows.get(workflowId);
        if (!workflow) {
            throw new Error(`Workflow not found: ${workflowId}`);
        }
        // 添加触发器到工作流
        workflow.triggers.push(trigger.id);
        this.workflowTriggers.set(trigger.id, trigger);
        // 更新工作流
        workflow.updatedAt = new Date();
        this.workflows.set(workflowId, workflow);
        this.emitEvent('triggerAdded', {
            workflowId,
            triggerId: trigger.id,
            triggerType: trigger.type
        });
    }
    /**
     * 创建工作流触发器
     */
    createWorkflowTrigger(type, config = {}) {
        return {
            id: `trigger-${Date.now()}`,
            type,
            config,
            enabled: true
        };
    }
    /**
     * 验证工作流
     */
    async validateWorkflow(workflowId) {
        const workflow = this.workflows.get(workflowId);
        if (!workflow) {
            return { valid: false, errors: ['Workflow not found'] };
        }
        const errors = [];
        // 验证工作流基本信息
        if (!workflow.name.trim()) {
            errors.push('Workflow name is required');
        }
        // 验证步骤
        if (workflow.steps.length === 0) {
            errors.push('Workflow must have at least one step');
        }
        // 验证触发器
        if (workflow.triggers.length === 0) {
            errors.push('Workflow must have at least one trigger');
        }
        // 验证Agent分配
        for (const stepId of workflow.steps) {
            const step = this.workflowSteps.get(stepId);
            if (step && step.config.agentId && !workflow.agents.includes(step.config.agentId)) {
                errors.push(`Step ${step.name} references unknown agent: ${step.config.agentId}`);
            }
        }
        return { valid: errors.length === 0, errors };
    }
    // ===== 私有方法 =====
    /**
     * 加载默认工作流模板
     */
    async loadDefaultTemplates() {
        // 基于MPLP V1.0 Alpha的默认工作流模板
        const defaultTemplates = [
            {
                name: 'Simple Sequential Workflow',
                description: 'A basic sequential workflow template',
                steps: ['input', 'process', 'output'],
                triggers: ['manual']
            },
            {
                name: 'Parallel Processing Workflow',
                description: 'A parallel processing workflow template',
                steps: ['input', 'parallel-process', 'merge', 'output'],
                triggers: ['scheduled']
            },
            {
                name: 'Event-Driven Workflow',
                description: 'An event-driven workflow template',
                steps: ['event-listener', 'condition', 'action', 'notification'],
                triggers: ['event', 'webhook']
            }
        ];
        // 这里可以预加载模板到系统中
        this.emitEvent('templatesLoaded', {
            count: defaultTemplates.length,
            templates: defaultTemplates.map(t => t.name)
        });
    }
    /**
     * 发射事件 - 基于MPLP V1.0 Alpha事件发射模式
     */
    emitEvent(type, data) {
        this.eventManager.emitMPLP(type, 'WorkflowDesigner', data);
    }
}
exports.WorkflowDesigner = WorkflowDesigner;
//# sourceMappingURL=WorkflowDesigner.js.map