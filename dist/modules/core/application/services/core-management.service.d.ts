/**
 * Core管理服务
 * 实现Core模块的核心业务逻辑
 * 遵循DDD应用服务模式
 */
import { CoreEntity } from '../../domain/entities/core.entity';
import { ICoreRepository } from '../../domain/repositories/core-repository.interface';
import { UUID, WorkflowConfig, ExecutionContext, CoreDetails, CoreOperation, WorkflowStatusType, WorkflowStageType } from '../../types';
/**
 * Core管理服务类
 * 提供工作流创建、执行、监控等核心功能
 */
export declare class CoreManagementService {
    private readonly coreRepository;
    constructor(coreRepository: ICoreRepository);
    /**
     * 创建新的工作流
     * @param data 工作流创建数据
     * @returns 创建的Core实体
     */
    createWorkflow(data: {
        workflowId: UUID;
        orchestratorId: UUID;
        workflowConfig: WorkflowConfig;
        executionContext: ExecutionContext;
        coreOperation: CoreOperation;
        coreDetails?: CoreDetails;
    }): Promise<CoreEntity>;
    /**
     * 根据ID获取工作流
     * @param workflowId 工作流ID
     * @returns Core实体或null
     */
    getWorkflowById(workflowId: UUID): Promise<CoreEntity | null>;
    /**
     * 更新工作流状态
     * @param workflowId 工作流ID
     * @param status 新状态
     * @returns 更新后的Core实体
     */
    updateWorkflowStatus(workflowId: UUID, status: WorkflowStatusType): Promise<CoreEntity>;
    /**
     * 更新当前执行阶段
     * @param workflowId 工作流ID
     * @param stage 新阶段
     * @returns 更新后的Core实体
     */
    updateCurrentStage(workflowId: UUID, stage: WorkflowStageType): Promise<CoreEntity>;
    /**
     * 删除工作流
     * @param workflowId 工作流ID
     * @returns 是否删除成功
     */
    deleteWorkflow(workflowId: UUID): Promise<boolean>;
    /**
     * 获取所有工作流
     * @returns 所有Core实体列表
     */
    getAllWorkflows(): Promise<CoreEntity[]>;
    /**
     * 根据状态获取工作流
     * @param status 工作流状态
     * @returns 匹配状态的Core实体列表
     */
    getWorkflowsByStatus(status: WorkflowStatusType): Promise<CoreEntity[]>;
    /**
     * 获取工作流统计信息
     * @returns 统计信息
     */
    getWorkflowStatistics(): Promise<{
        totalWorkflows: number;
        activeWorkflows: number;
        completedWorkflows: number;
        failedWorkflows: number;
        averageDuration: number;
    }>;
    /**
     * 执行工作流
     * @param workflowId 工作流ID
     * @returns 执行后的Core实体
     */
    executeWorkflow(workflowId: UUID): Promise<CoreEntity>;
    /**
     * 获取工作流状态
     * @param workflowId 工作流ID
     * @returns 工作流状态信息
     */
    getWorkflowStatus(workflowId: UUID): Promise<{
        workflowId: UUID;
        status: WorkflowStatusType;
        currentStage?: WorkflowStageType;
        progress: number;
        startTime?: string;
        endTime?: string;
    }>;
    /**
     * 暂停工作流
     * @param workflowId 工作流ID
     * @returns 暂停后的Core实体
     */
    pauseWorkflow(workflowId: UUID): Promise<CoreEntity>;
    /**
     * 恢复工作流
     * @param workflowId 工作流ID
     * @returns 恢复后的Core实体
     */
    resumeWorkflow(workflowId: UUID): Promise<CoreEntity>;
    /**
     * 取消工作流
     * @param workflowId 工作流ID
     * @returns 取消后的Core实体
     */
    cancelWorkflow(workflowId: UUID): Promise<CoreEntity>;
}
//# sourceMappingURL=core-management.service.d.ts.map