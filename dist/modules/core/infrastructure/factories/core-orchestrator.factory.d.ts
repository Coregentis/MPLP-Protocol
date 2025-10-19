/**
 * CoreOrchestrator工厂
 *
 * @description 负责创建和配置CoreOrchestrator实例，集成所有L3管理器和核心服务
 * @version 1.0.0
 * @layer 基础设施层 - 工厂模式
 * @pattern 与Context、Plan、Role等模块使用IDENTICAL的工厂模式
 */
import { CoreOrchestrator } from '../../../../core/orchestrator/core.orchestrator';
import { ReservedInterfaceActivator } from '../../domain/activators/reserved-interface.activator';
import { CoreOrchestrationService } from '../../application/services/core-orchestration.service';
import { CoreResourceService } from '../../application/services/core-resource.service';
import { CoreMonitoringService } from '../../application/services/core-monitoring.service';
import { CoreManagementService } from '../../application/services/core-management.service';
import { MemoryCoreRepository } from '../repositories/core.repository';
import { MLPPSecurityManager, MLPPPerformanceMonitor, MLPPEventBusManager, MLPPErrorHandler, MLPPCoordinationManager, MLPPOrchestrationManager, MLPPStateSyncManager, MLPPTransactionManager, MLPPProtocolVersionManager } from '../../../../core/protocols/cross-cutting-concerns';
/**
 * CoreOrchestrator工厂配置
 */
export interface CoreOrchestratorFactoryConfig {
    enableLogging?: boolean;
    enableMetrics?: boolean;
    enableCaching?: boolean;
    repositoryType?: 'memory' | 'database' | 'file';
    maxConcurrentWorkflows?: number;
    workflowTimeout?: number;
    enableReservedInterfaces?: boolean;
    enableModuleCoordination?: boolean;
}
/**
 * CoreOrchestrator工厂结果
 */
export interface CoreOrchestratorFactoryResult {
    orchestrator: CoreOrchestrator;
    interfaceActivator: ReservedInterfaceActivator;
    orchestrationService: CoreOrchestrationService;
    resourceService: CoreResourceService;
    monitoringService: CoreMonitoringService;
    managementService: CoreManagementService;
    repository: MemoryCoreRepository;
    crossCuttingManagers: {
        security: MLPPSecurityManager;
        performance: MLPPPerformanceMonitor;
        eventBus: MLPPEventBusManager;
        errorHandler: MLPPErrorHandler;
        coordination: MLPPCoordinationManager;
        orchestration: MLPPOrchestrationManager;
        stateSync: MLPPStateSyncManager;
        transaction: MLPPTransactionManager;
        protocolVersion: MLPPProtocolVersionManager;
    };
    healthCheck: () => Promise<{
        status: 'healthy' | 'degraded' | 'unhealthy';
        components: Record<string, boolean>;
        metrics: Record<string, number>;
        modules: Record<string, string>;
        uptime: number;
        version: string;
    }>;
    shutdown: () => Promise<void>;
}
/**
 * CoreOrchestrator工厂类
 *
 * @description 单例工厂，负责创建和配置CoreOrchestrator及其所有依赖组件
 */
export declare class CoreOrchestratorFactory {
    private static instance;
    private crossCuttingFactory;
    private constructor();
    /**
     * 获取工厂单例实例
     */
    static getInstance(): CoreOrchestratorFactory;
    /**
     * 创建CoreOrchestrator实例
     */
    createCoreOrchestrator(config?: CoreOrchestratorFactoryConfig): Promise<CoreOrchestratorFactoryResult>;
    /**
     * 创建开发环境配置的CoreOrchestrator
     */
    createDevelopmentOrchestrator(): Promise<CoreOrchestratorFactoryResult>;
    /**
     * 创建生产环境配置的CoreOrchestrator
     */
    createProductionOrchestrator(): Promise<CoreOrchestratorFactoryResult>;
    /**
     * 创建测试环境配置的CoreOrchestrator
     */
    createTestOrchestrator(): Promise<CoreOrchestratorFactoryResult>;
    /**
     * 检查仓储健康状态
     */
    private checkRepositoryHealth;
    /**
     * 检查服务健康状态
     */
    private checkServiceHealth;
    /**
     * 重置工厂实例（用于测试）
     */
    static resetInstance(): void;
    /**
     * 创建SecurityManager适配器
     */
    private createSecurityAdapter;
    /**
     * 创建PerformanceMonitor适配器
     */
    private createPerformanceAdapter;
    /**
     * 创建EventBusManager适配器
     */
    private createEventBusAdapter;
    /**
     * 创建ErrorHandler适配器
     */
    private createErrorHandlerAdapter;
    /**
     * 创建CoordinationManager适配器
     */
    private createCoordinationAdapter;
    /**
     * 创建OrchestrationManager适配器
     */
    private createOrchestrationAdapter;
    /**
     * 创建StateSyncManager适配器
     */
    private createStateSyncAdapter;
    /**
     * 创建TransactionManager适配器
     */
    private createTransactionAdapter;
    /**
     * 创建ProtocolVersionManager适配器
     */
    private createProtocolVersionAdapter;
}
//# sourceMappingURL=core-orchestrator.factory.d.ts.map