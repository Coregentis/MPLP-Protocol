/**
 * Core模块适配器
 *
 * @description 基于Context、Plan、Role、Confirm等模块的企业级标准，提供Core模块的统一访问接口和外部系统集成
 * @version 1.0.0
 * @layer 基础设施层 - 适配器
 * @pattern 与Context、Plan、Role等模块使用IDENTICAL的适配器模式
 */
import { CoreEntity } from '../../domain/entities/core.entity';
import { ICoreRepository } from '../../domain/repositories/core-repository.interface';
import { CoreManagementService } from '../../application/services/core-management.service';
import { CoreMonitoringService } from '../../application/services/core-monitoring.service';
import { CoreOrchestrationService } from '../../application/services/core-orchestration.service';
import { CoreResourceService } from '../../application/services/core-resource.service';
import { CoreReservedInterfacesService } from '../../application/services/core-reserved-interfaces.service';
import { CoreServicesCoordinator } from '../../application/coordinators/core-services-coordinator';
import { CoreProtocol } from '../protocols/core.protocol';
import { UUID, WorkflowConfig, ExecutionContext, CoreOperation } from '../../types';
/**
 * Core模块适配器配置
 */
export interface CoreModuleAdapterConfig {
    enableLogging?: boolean;
    enableCaching?: boolean;
    enableMetrics?: boolean;
    repositoryType?: 'memory' | 'database' | 'file';
    maxCacheSize?: number;
    cacheTimeout?: number;
    enableCoordination?: boolean;
    enableReservedInterfaces?: boolean;
}
/**
 * Core模块适配器结果
 */
export interface CoreModuleAdapterResult {
    repository: ICoreRepository;
    managementService: CoreManagementService;
    monitoringService: CoreMonitoringService;
    orchestrationService: CoreOrchestrationService;
    resourceService: CoreResourceService;
    reservedInterfacesService: CoreReservedInterfacesService;
    coordinator: CoreServicesCoordinator;
    protocol: CoreProtocol;
    adapter: CoreModuleAdapter;
}
/**
 * Core模块适配器
 *
 * @description 统一协调Core模块的5个核心服务，实现完整的工作流生命周期管理和MPLP协议集成
 */
export declare class CoreModuleAdapter {
    private readonly config;
    private initialized;
    private repository;
    private managementService;
    private monitoringService;
    private orchestrationService;
    private resourceService;
    private reservedInterfacesService;
    private coordinator;
    private protocol;
    private crossCuttingFactory;
    private securityManager;
    private performanceMonitor;
    private eventBusManager;
    private errorHandler;
    private coordinationManager;
    private orchestrationManager;
    private stateSyncManager;
    private transactionManager;
    private protocolVersionManager;
    constructor(config?: CoreModuleAdapterConfig);
    /**
     * 初始化适配器
     */
    private initialize;
    /**
     * 初始化协议
     */
    private initializeProtocol;
    /**
     * 确保适配器已初始化
     */
    private ensureInitialized;
    /**
     * 获取所有组件
     */
    getComponents(): CoreModuleAdapterResult;
    /**
     * 获取仓库实例
     */
    getRepository(): ICoreRepository;
    /**
     * 获取管理服务
     */
    getManagementService(): CoreManagementService;
    /**
     * 获取服务协调器
     */
    getCoordinator(): CoreServicesCoordinator;
    /**
     * 获取预留接口服务
     */
    getReservedInterfacesService(): CoreReservedInterfacesService;
    /**
     * 获取协议实例
     */
    getProtocol(): CoreProtocol;
    /**
     * 创建Core工作流
     */
    createWorkflow(data: {
        workflowId: UUID;
        orchestratorId: UUID;
        workflowConfig: WorkflowConfig;
        executionContext: ExecutionContext;
        coreOperation: CoreOperation;
    }): Promise<CoreEntity>;
    /**
     * 协调创建工作流（使用协调器）
     */
    createWorkflowWithCoordination(params: {
        workflowId: UUID;
        orchestratorId: UUID;
        workflowConfig: WorkflowConfig;
        executionContext: ExecutionContext;
        coreOperation: CoreOperation;
        enableMonitoring?: boolean;
        enableResourceTracking?: boolean;
    }): Promise<import("../../application/coordinators/core-services-coordinator").CoordinatedExecutionResult>;
    /**
     * 获取健康状态
     */
    getHealthStatus(): Promise<{
        status: 'healthy' | 'degraded' | 'unhealthy';
        components: Record<string, boolean>;
        timestamp: string;
    }>;
    /**
     * 获取模块信息
     */
    getModuleInfo(): {
        name: string;
        version: string;
        description: string;
        layer: string;
        status: string;
        features: string[];
        dependencies: string[];
    };
    /**
     * 检查仓库健康状态
     */
    private checkRepositoryHealth;
}
//# sourceMappingURL=core-module.adapter.d.ts.map