/**
 * @fileoverview Workflow Designer - 可视化工作流设计器
 * @version 1.1.0-beta
 * @based_on MPLP V1.0 Alpha Workflow架构
 */
import { MPLPEventManager } from '../core/MPLPEventManager';
import { Workflow, WorkflowStep, WorkflowTrigger, WorkflowConfig, StudioConfig, IStudioManager } from '../types/studio';
/**
 * 工作流设计器 - 基于MPLP V1.0 Alpha工作流设计模式
 * 提供拖拽式的可视化工作流设计和配置功能
 */
export declare class WorkflowDesigner implements IStudioManager {
    private eventManager;
    private config;
    private _isInitialized;
    private workflows;
    private workflowSteps;
    private workflowTriggers;
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
     * 初始化工作流设计器
     */
    initialize(): Promise<void>;
    /**
     * 关闭工作流设计器
     */
    shutdown(): Promise<void>;
    /**
     * 创建新工作流
     */
    createWorkflow(name: string, config?: Partial<WorkflowConfig>): Promise<Workflow>;
    /**
     * 获取工作流
     */
    getWorkflow(workflowId: string): Workflow | undefined;
    /**
     * 更新工作流
     */
    updateWorkflow(workflowId: string, updates: Partial<Workflow>): Promise<Workflow>;
    /**
     * 删除工作流
     */
    deleteWorkflow(workflowId: string): Promise<void>;
    /**
     * 获取所有工作流
     */
    getAllWorkflows(): Workflow[];
    /**
     * 添加工作流步骤
     */
    addStepToWorkflow(workflowId: string, step: WorkflowStep): Promise<void>;
    /**
     * 创建工作流步骤
     */
    createWorkflowStep(name: string, type: 'action' | 'condition' | 'loop' | 'parallel', config?: Record<string, any>): WorkflowStep;
    /**
     * 添加触发器到工作流
     */
    addTriggerToWorkflow(workflowId: string, trigger: WorkflowTrigger): Promise<void>;
    /**
     * 创建工作流触发器
     */
    createWorkflowTrigger(type: 'manual' | 'scheduled' | 'event' | 'webhook', config?: Record<string, any>): WorkflowTrigger;
    /**
     * 验证工作流
     */
    validateWorkflow(workflowId: string): Promise<{
        valid: boolean;
        errors: string[];
    }>;
    /**
     * 加载默认工作流模板
     */
    private loadDefaultTemplates;
    /**
     * 发射事件 - 基于MPLP V1.0 Alpha事件发射模式
     */
    private emitEvent;
}
//# sourceMappingURL=WorkflowDesigner.d.ts.map