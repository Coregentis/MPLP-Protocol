/**
 * MPLP编排管理器
 *
 * @description L3层统一编排管理，提供工作流编排和执行控制功能
 * @version 1.0.0
 * @integration 与所有10个模块统一集成
 */
/**
 * 工作流步骤接口
 */
export interface WorkflowStep {
    id: string;
    name: string;
    module: string;
    operation: string;
    parameters: Record<string, unknown>;
    dependencies?: string[];
}
/**
 * 工作流定义接口
 */
export interface WorkflowDefinition {
    id: string;
    name: string;
    description?: string;
    steps: WorkflowStep[];
    timeout?: number;
}
/**
 * 工作流执行状态
 */
export type WorkflowStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
/**
 * 工作流实例接口
 */
export interface WorkflowInstance {
    id: string;
    definitionId: string;
    status: WorkflowStatus;
    startTime: string;
    endTime?: string;
    currentStep?: string;
    result?: Record<string, unknown>;
    error?: string;
}
/**
 * MPLP编排管理器
 *
 * @description 统一的编排管理实现，等待CoreOrchestrator激活
 */
export declare class MLPPOrchestrationManager {
    private workflows;
    private instances;
    /**
     * 注册工作流定义
     */
    registerWorkflow(_definition: WorkflowDefinition): void;
    /**
     * 启动工作流实例
     */
    startWorkflow(_definitionId: string, _parameters?: Record<string, unknown>): Promise<string>;
    /**
     * 创建编排计划
     */
    createOrchestrationPlan(_workflowConfig: Record<string, unknown>, _context?: Record<string, unknown>): Promise<Record<string, unknown>>;
    /**
     * 执行编排计划
     */
    executeOrchestrationPlan(_orchestrationPlan: Record<string, unknown>): Promise<Record<string, unknown>>;
    /**
     * 获取工作流实例状态
     */
    getWorkflowStatus(_instanceId: string): WorkflowInstance | null;
    /**
     * 取消工作流实例
     */
    cancelWorkflow(_instanceId: string): Promise<boolean>;
    /**
     * 健康检查
     */
    healthCheck(): Promise<boolean>;
}
//# sourceMappingURL=orchestration-manager.d.ts.map