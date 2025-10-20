/**
 * 中央编排服务 - L3执行层核心
 * 职责：工作流编排、模块协调、执行管理
 * 遵循DDD应用服务模式
 */
import { ICoreRepository } from '../../domain/repositories/core-repository.interface';
import { UUID, WorkflowStageType, WorkflowStatusType, Priority, ExecutionMode } from '../../types';
export interface WorkflowExecutionData {
    workflowId: UUID;
    contextId: UUID;
    stages: WorkflowStageType[];
    executionMode?: ExecutionMode;
    parallelExecution?: boolean;
    priority?: Priority;
    timeout?: number;
    metadata?: Record<string, unknown>;
}
export interface WorkflowResult {
    workflowId: UUID;
    executionId: UUID;
    status: WorkflowStatusType;
    startTime: string;
    endTime?: string;
    durationMs?: number;
    stageResults: Record<string, {
        status: string;
        result?: Record<string, unknown>;
        error?: string;
    }>;
    metadata?: Record<string, unknown>;
}
export interface CoordinationRequest {
    sourceModule: string;
    targetModule: string;
    operation: string;
    payload: Record<string, unknown>;
    timestamp: string;
}
export interface CoordinationResult {
    success: boolean;
    result?: Record<string, unknown>;
    error?: string;
    executionTime: number;
}
export interface InterfaceActivationData {
    parameters: Record<string, unknown>;
    configuration?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
}
export interface ActivationResult {
    success: boolean;
    interfaceId: string;
    activatedAt: string;
    result?: Record<string, unknown>;
    error?: string;
}
/**
 * 中央编排服务类
 * 实现L3执行层的核心工作流编排功能
 */
export declare class CoreOrchestrationService {
    private readonly coreRepository;
    constructor(coreRepository: ICoreRepository);
    /**
     * 执行工作流
     * @param workflowData 工作流执行数据
     * @returns 工作流执行结果
     */
    executeWorkflow(workflowData: WorkflowExecutionData): Promise<WorkflowResult>;
    /**
     * 协调模块操作
     * @param request 协调请求
     * @returns 协调结果
     */
    coordinateModuleOperation(request: CoordinationRequest): Promise<CoordinationResult>;
    /**
     * 激活预留接口
     * @param moduleId 模块ID
     * @param interfaceId 接口ID
     * @param activationData 激活数据
     * @returns 激活结果
     */
    activateReservedInterface(moduleId: string, interfaceId: string, activationData: InterfaceActivationData): Promise<ActivationResult>;
    /**
     * 验证工作流数据
     */
    private validateWorkflowData;
    /**
     * 生成执行ID
     */
    private generateExecutionId;
    /**
     * 创建Core实体
     */
    private createCoreEntity;
    /**
     * 执行工作流阶段
     */
    private executeWorkflowStage;
    /**
     * 获取阶段执行结果
     */
    private getStageExecutionResult;
    /**
     * 验证模块协调请求
     */
    private validateCoordinationRequest;
    /**
     * 执行模块间协调
     */
    private performModuleCoordination;
    /**
     * 验证接口激活权限
     */
    private validateInterfaceActivation;
    /**
     * 执行接口激活
     */
    private performInterfaceActivation;
    /**
     * 更新当前阶段
     */
    private updateCurrentStage;
    /**
     * 确定最终状态
     */
    private determineFinalStatus;
    /**
     * 更新工作流状态
     */
    private updateWorkflowStatus;
    /**
     * 处理工作流错误
     */
    private handleWorkflowError;
    /**
     * 协调模块操作
     */
    coordinateModule(module: string, operation: string, parameters?: Record<string, unknown>): Promise<{
        module: string;
        operation: string;
        parameters?: Record<string, unknown>;
        result: string;
        timestamp: string;
    }>;
    /**
     * 执行事务
     */
    executeTransaction(transactionConfig: Record<string, unknown>): Promise<{
        transactionId: string;
        config: Record<string, unknown>;
        result: string;
        timestamp: string;
    }>;
    /**
     * 同步模块状态
     */
    synchronizeModuleState(module: string, syncConfig: Record<string, unknown>): Promise<{
        module: string;
        syncConfig: Record<string, unknown>;
        result: string;
        timestamp: string;
    }>;
    /**
     * 激活Dialog模块接口
     */
    private activateDialogInterface;
    /**
     * 激活Collab模块接口
     */
    private activateCollabInterface;
    /**
     * 激活对话上下文同步接口
     */
    private activateConversationContextSync;
    /**
     * 激活协作协调接口
     */
    private activateCollaborationCoordination;
}
//# sourceMappingURL=core-orchestration.service.d.ts.map