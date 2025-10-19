/**
 * Core协议实现
 *
 * @description 基于Context、Plan、Role、Confirm等模块的企业级标准，实现Core模块的MPLP协议
 * @version 1.0.0
 * @layer 基础设施层 - 协议实现
 * @pattern 与Context、Plan、Role等模块使用IDENTICAL的协议实现模式
 */
import { CoreEntity } from '../../domain/entities/core.entity';
import { ICoreRepository } from '../../domain/repositories/core-repository.interface';
import { CoreManagementService } from '../../application/services/core-management.service';
import { CoreMonitoringService } from '../../application/services/core-monitoring.service';
import { CoreOrchestrationService } from '../../application/services/core-orchestration.service';
import { CoreResourceService } from '../../application/services/core-resource.service';
import { UUID, WorkflowConfig, ExecutionContext, CoreOperation } from '../../types';
import { MLPPSecurityManager, MLPPPerformanceMonitor, MLPPEventBusManager, MLPPErrorHandler, MLPPCoordinationManager, MLPPOrchestrationManager, MLPPStateSyncManager, MLPPTransactionManager, MLPPProtocolVersionManager } from '../../../../core/protocols/cross-cutting-concerns';
/**
 * Core协议配置
 */
export interface CoreProtocolConfig {
    enableLogging?: boolean;
    enableCaching?: boolean;
    enableMetrics?: boolean;
    repositoryType?: 'memory' | 'database' | 'file';
}
/**
 * Core协议操作结果
 */
export interface CoreProtocolResult<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    timestamp: string;
    operationId: UUID;
}
/**
 * Core工作流创建请求
 */
export interface CoreWorkflowCreationRequest {
    workflowId: UUID;
    orchestratorId: UUID;
    workflowConfig: WorkflowConfig;
    executionContext: ExecutionContext;
    coreOperation: CoreOperation;
    metadata?: Record<string, unknown>;
}
/**
 * Core协议实现
 *
 * @description 实现MPLP协议的Core模块标准，提供工作流协调和执行的协议级接口
 */
export declare class CoreProtocol {
    private readonly managementService;
    private readonly _monitoringService;
    private readonly _orchestrationService;
    private readonly _resourceService;
    private readonly _repository;
    private readonly _securityManager;
    private readonly _performanceMonitor;
    private readonly _eventBusManager;
    private readonly _errorHandler;
    private readonly coordinationManager;
    private readonly _orchestrationManager;
    private readonly _stateSyncManager;
    private readonly _transactionManager;
    private readonly _protocolVersionManager;
    private readonly config;
    constructor(managementService: CoreManagementService, _monitoringService: CoreMonitoringService, _orchestrationService: CoreOrchestrationService, _resourceService: CoreResourceService, _repository: ICoreRepository, _securityManager: MLPPSecurityManager, _performanceMonitor: MLPPPerformanceMonitor, _eventBusManager: MLPPEventBusManager, _errorHandler: MLPPErrorHandler, coordinationManager: MLPPCoordinationManager, _orchestrationManager: MLPPOrchestrationManager, _stateSyncManager: MLPPStateSyncManager, _transactionManager: MLPPTransactionManager, _protocolVersionManager: MLPPProtocolVersionManager, config?: CoreProtocolConfig);
    /**
     * 创建工作流 - 协议级接口
     */
    createWorkflow(request: CoreWorkflowCreationRequest): Promise<CoreProtocolResult<CoreEntity>>;
    /**
     * 执行工作流 - 协议级接口
     */
    executeWorkflow(workflowId: UUID): Promise<CoreProtocolResult<boolean>>;
    /**
     * 获取工作流状态 - 协议级接口
     */
    getWorkflowStatus(_workflowId: UUID): Promise<CoreProtocolResult<{
        status: string;
        progress: number;
        lastUpdated: string;
    }>>;
    /**
     * 获取协议健康状态
     */
    getProtocolHealth(): Promise<CoreProtocolResult<{
        status: 'healthy' | 'degraded' | 'unhealthy';
        components: Record<string, boolean>;
        metrics: Record<string, number>;
    }>>;
    /**
     * 生成操作ID
     */
    private generateOperationId;
    /**
     * 检查仓库健康状态
     */
    private checkRepositoryHealth;
    /**
     * 获取启动时间（简化实现）
     */
    private getStartTime;
    /**
     * 获取操作计数（简化实现）
     */
    private getOperationsCount;
}
//# sourceMappingURL=core.protocol.d.ts.map