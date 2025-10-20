/**
 * Core服务协调器
 *
 * @description 基于GLFB反馈循环机制，协调4个核心服务的协作和数据流
 * @version 1.0.0
 * @layer 应用层 - 服务协调器
 * @pattern 与Context、Plan、Role等模块使用IDENTICAL的服务协调器模式
 */
import { CoreEntity } from '../../domain/entities/core.entity';
import { ICoreRepository } from '../../domain/repositories/core-repository.interface';
import { CoreManagementService } from '../services/core-management.service';
import { CoreMonitoringService } from '../services/core-monitoring.service';
import { CoreOrchestrationService } from '../services/core-orchestration.service';
import { CoreResourceService } from '../services/core-resource.service';
import { UUID, WorkflowConfig, ExecutionContext, CoreOperation, CoreDetails } from '../../types';
/**
 * 协调创建工作流的参数
 */
export interface CoordinatedWorkflowCreationParams {
    workflowId: UUID;
    orchestratorId: UUID;
    workflowConfig: WorkflowConfig;
    executionContext: ExecutionContext;
    coreOperation: CoreOperation;
    coreDetails?: CoreDetails;
    enableMonitoring?: boolean;
    enableResourceTracking?: boolean;
    userId?: string;
}
/**
 * 协调执行结果
 */
export interface CoordinatedExecutionResult {
    workflow: CoreEntity;
    monitoringEnabled: boolean;
    resourcesAllocated: boolean;
    orchestrationActive: boolean;
    healthStatus: 'healthy' | 'warning' | 'critical';
}
/**
 * Core服务协调器
 *
 * @description 统一协调Core模块的4个核心服务，实现完整的工作流生命周期管理
 */
export declare class CoreServicesCoordinator {
    private readonly managementService;
    private readonly monitoringService;
    private readonly orchestrationService;
    private readonly resourceService;
    private readonly coreRepository;
    private readonly logger?;
    constructor(managementService: CoreManagementService, monitoringService: CoreMonitoringService, orchestrationService: CoreOrchestrationService, resourceService: CoreResourceService, coreRepository: ICoreRepository, logger?: {
        info: (msg: string, meta?: Record<string, unknown>) => void;
        error: (msg: string, meta?: Record<string, unknown>) => void;
    });
    /**
     * 协调创建工作流 - 完整生命周期管理
     * 整合：管理服务创建 + 监控服务启动 + 资源服务分配 + 编排服务激活
     */
    createWorkflowWithFullCoordination(params: CoordinatedWorkflowCreationParams): Promise<CoordinatedExecutionResult>;
    /**
     * 协调执行工作流 - 简化实现
     * 使用实际存在的服务方法
     */
    executeWorkflowWithCoordination(workflowId: UUID): Promise<CoordinatedExecutionResult>;
    /**
     * 协调停止工作流 - 简化实现
     */
    stopWorkflowWithCoordination(workflowId: UUID): Promise<boolean>;
    /**
     * 获取协调状态概览
     */
    getCoordinationOverview(): Promise<{
        totalWorkflows: number;
        activeWorkflows: number;
        monitoredWorkflows: number;
        resourceUtilization: number;
        systemHealth: 'healthy' | 'warning' | 'critical';
    }>;
    /**
     * 评估工作流健康状态
     */
    private evaluateWorkflowHealth;
    /**
     * 更新监控状态
     */
    private _updateMonitoringStatus;
    /**
     * 检查资源状态
     */
    private _checkResourceStatus;
}
//# sourceMappingURL=core-services-coordinator.d.ts.map