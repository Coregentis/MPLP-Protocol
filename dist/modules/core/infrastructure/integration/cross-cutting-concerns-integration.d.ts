/**
 * Core模块横切关注点集成验证
 *
 * @description 验证Core模块与9个L3横切关注点管理器的完整集成
 * @version 1.0.0
 * @layer 基础设施层 - 横切关注点集成
 * @pattern 与Context、Plan、Role、Confirm等模块使用IDENTICAL的横切关注点集成模式
 */
import { MLPPSecurityManager, MLPPPerformanceMonitor, MLPPEventBusManager, MLPPErrorHandler, MLPPCoordinationManager, MLPPOrchestrationManager, MLPPStateSyncManager, MLPPTransactionManager, MLPPProtocolVersionManager, CrossCuttingConcernsFactory } from '../../../../core/protocols/cross-cutting-concerns';
/**
 * 横切关注点集成状态
 */
export interface CrossCuttingConcernsIntegrationStatus {
    security: {
        enabled: boolean;
        manager: MLPPSecurityManager | null;
        status: 'active' | 'inactive' | 'error';
        lastCheck: string;
    };
    performance: {
        enabled: boolean;
        manager: MLPPPerformanceMonitor | null;
        status: 'active' | 'inactive' | 'error';
        lastCheck: string;
    };
    eventBus: {
        enabled: boolean;
        manager: MLPPEventBusManager | null;
        status: 'active' | 'inactive' | 'error';
        lastCheck: string;
    };
    errorHandler: {
        enabled: boolean;
        manager: MLPPErrorHandler | null;
        status: 'active' | 'inactive' | 'error';
        lastCheck: string;
    };
    coordination: {
        enabled: boolean;
        manager: MLPPCoordinationManager | null;
        status: 'active' | 'inactive' | 'error';
        lastCheck: string;
    };
    orchestration: {
        enabled: boolean;
        manager: MLPPOrchestrationManager | null;
        status: 'active' | 'inactive' | 'error';
        lastCheck: string;
    };
    stateSync: {
        enabled: boolean;
        manager: MLPPStateSyncManager | null;
        status: 'active' | 'inactive' | 'error';
        lastCheck: string;
    };
    transaction: {
        enabled: boolean;
        manager: MLPPTransactionManager | null;
        status: 'active' | 'inactive' | 'error';
        lastCheck: string;
    };
    protocolVersion: {
        enabled: boolean;
        manager: MLPPProtocolVersionManager | null;
        status: 'active' | 'inactive' | 'error';
        lastCheck: string;
    };
}
/**
 * 横切关注点集成验证器
 *
 * @description 验证Core模块与所有L3横切关注点管理器的集成状态
 */
export declare class CrossCuttingConcernsIntegrationValidator {
    private readonly crossCuttingFactory;
    constructor(crossCuttingFactory: CrossCuttingConcernsFactory);
    /**
     * 验证所有横切关注点的集成状态
     */
    validateIntegration(): Promise<CrossCuttingConcernsIntegrationStatus>;
    /**
     * 生成集成报告
     */
    generateIntegrationReport(): Promise<{
        summary: {
            totalConcerns: number;
            activeConcerns: number;
            inactiveConcerns: number;
            errorConcerns: number;
            integrationRate: number;
        };
        details: CrossCuttingConcernsIntegrationStatus;
        recommendations: string[];
    }>;
    /**
     * 验证特定横切关注点的功能
     */
    validateSpecificConcern(concernName: keyof CrossCuttingConcernsIntegrationStatus): Promise<{
        name: string;
        status: 'active' | 'inactive' | 'error';
        functionality: {
            basicOperations: boolean;
            advancedFeatures: boolean;
            errorHandling: boolean;
        };
        performance: {
            responseTime: number;
            memoryUsage: number;
        };
    }>;
    /**
     * 检查管理器状态
     */
    private checkManagerStatus;
    /**
     * 测试基础操作
     */
    private testBasicOperations;
    /**
     * 测试高级功能
     */
    private testAdvancedFeatures;
    /**
     * 测试错误处理
     */
    private testErrorHandling;
}
/**
 * 创建横切关注点集成验证器
 */
export declare function createCrossCuttingConcernsValidator(): CrossCuttingConcernsIntegrationValidator;
/**
 * 快速验证横切关注点集成
 */
export declare function quickValidateCrossCuttingConcerns(): Promise<boolean>;
//# sourceMappingURL=cross-cutting-concerns-integration.d.ts.map