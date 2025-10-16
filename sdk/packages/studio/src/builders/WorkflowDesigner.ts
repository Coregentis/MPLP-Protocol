/**
 * @fileoverview Workflow Designer - 可视化工作流设计器
 * @version 1.1.0-beta
 * @based_on MPLP V1.0 Alpha Workflow架构
 */

import { MPLPEventManager } from '../core/MPLPEventManager';
import { 
  Workflow, 
  WorkflowStep, 
  WorkflowTrigger, 
  WorkflowConfig,
  Agent,
  StudioConfig,
  IStudioManager 
} from '../types/studio';

/**
 * 工作流设计器 - 基于MPLP V1.0 Alpha工作流设计模式
 * 提供拖拽式的可视化工作流设计和配置功能
 */
export class WorkflowDesigner implements IStudioManager {
  private eventManager: MPLPEventManager;
  private config: StudioConfig;
  private _isInitialized = false;
  private workflows = new Map<string, Workflow>();
  private workflowSteps = new Map<string, WorkflowStep>();
  private workflowTriggers = new Map<string, WorkflowTrigger>();

  constructor(config: StudioConfig, eventManager: MPLPEventManager) {
    this.config = config;
    this.eventManager = eventManager;
  }

  // ===== IStudioManager接口实现 =====

  /**
   * 获取状态
   */
  public getStatus(): string {
    return this._isInitialized ? 'initialized' : 'not_initialized';
  }

  /**
   * 事件监听 - 委托给eventManager
   */
  public on(event: string, listener: (...args: any[]) => void): this {
    this.eventManager.on(event, listener);
    return this;
  }

  /**
   * 发射事件 - 委托给eventManager
   */
  public emit(event: string, ...args: any[]): boolean {
    return this.eventManager.emit(event, ...args);
  }

  /**
   * 移除事件监听器 - 委托给eventManager
   */
  public off(event: string, listener: (...args: any[]) => void): this {
    this.eventManager.off(event, listener);
    return this;
  }

  /**
   * 移除所有事件监听器 - 委托给eventManager
   */
  public removeAllListeners(event?: string): this {
    this.eventManager.removeAllListeners(event);
    return this;
  }

  // ===== 核心生命周期方法 - 基于MPLP V1.0 Alpha生命周期模式 =====

  /**
   * 初始化工作流设计器
   */
  public async initialize(): Promise<void> {
    if (this._isInitialized) {
      return;
    }

    try {
      // 加载默认工作流模板
      await this.loadDefaultTemplates();
      
      // 初始化设计器状态
      this._isInitialized = true;
      this.emitEvent('initialized', { module: 'WorkflowDesigner' });
    } catch (error) {
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
  public async shutdown(): Promise<void> {
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
    } catch (error) {
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
  public async createWorkflow(name: string, config: Partial<WorkflowConfig> = {}): Promise<Workflow> {
    if (!this._isInitialized) {
      throw new Error('WorkflowDesigner not initialized');
    }

    const workflow: Workflow = {
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
  public getWorkflow(workflowId: string): Workflow | undefined {
    return this.workflows.get(workflowId);
  }

  /**
   * 更新工作流
   */
  public async updateWorkflow(workflowId: string, updates: Partial<Workflow>): Promise<Workflow> {
    if (!this._isInitialized) {
      throw new Error('WorkflowDesigner not initialized');
    }

    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    const updatedWorkflow: Workflow = {
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
  public async deleteWorkflow(workflowId: string): Promise<void> {
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
  public getAllWorkflows(): Workflow[] {
    return Array.from(this.workflows.values());
  }

  // ===== 工作流步骤管理方法 =====

  /**
   * 添加工作流步骤
   */
  public async addStepToWorkflow(workflowId: string, step: WorkflowStep): Promise<void> {
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
  public createWorkflowStep(
    name: string, 
    type: 'action' | 'condition' | 'loop' | 'parallel',
    config: Record<string, any> = {}
  ): WorkflowStep {
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
  public async addTriggerToWorkflow(workflowId: string, trigger: WorkflowTrigger): Promise<void> {
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
  public createWorkflowTrigger(
    type: 'manual' | 'scheduled' | 'event' | 'webhook',
    config: Record<string, any> = {}
  ): WorkflowTrigger {
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
  public async validateWorkflow(workflowId: string): Promise<{ valid: boolean; errors: string[] }> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      return { valid: false, errors: ['Workflow not found'] };
    }

    const errors: string[] = [];

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
  private async loadDefaultTemplates(): Promise<void> {
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
  private emitEvent(type: string, data: Record<string, any>): void {
    this.eventManager.emitMPLP(type, 'WorkflowDesigner', data);
  }
}
