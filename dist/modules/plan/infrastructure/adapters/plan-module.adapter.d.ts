/**
 * Plan模块适配器
 *
 * @description Plan模块的基础设施适配器，提供外部系统集成和统一访问接口
 * @version 1.0.0
 * @layer 基础设施层 - 适配器
 * @pattern 与Context模块使用IDENTICAL的适配器模式
 */
import { PlanEntity } from '../../domain/entities/plan.entity';
import { PlanManagementService } from '../../application/services/plan-management.service';
import { IPlanRepository } from '../../domain/repositories/plan-repository.interface';
import { PlanProtocol } from '../protocols/plan.protocol';
import { PlanEntityData } from '../../api/mappers/plan.mapper';
import { UUID } from '../../../../shared/types';
/**
 * Plan模块适配器配置
 */
export interface PlanModuleAdapterConfig {
    enableLogging?: boolean;
    enableCaching?: boolean;
    enableMetrics?: boolean;
    repositoryType?: 'memory' | 'database' | 'file';
    maxCacheSize?: number;
    cacheTimeout?: number;
    enableOptimization?: boolean;
    enableRiskAssessment?: boolean;
    enableFailureRecovery?: boolean;
}
/**
 * Plan模块适配器结果
 */
export interface PlanModuleAdapterResult {
    repository: IPlanRepository;
    service: PlanManagementService;
    protocol: PlanProtocol;
    adapter: PlanModuleAdapter;
}
/**
 * Plan模块适配器
 *
 * @description 提供Plan模块的统一访问接口和外部系统集成，支持智能任务规划协调
 * @pattern 与Context模块使用IDENTICAL的适配器实现模式
 */
export declare class PlanModuleAdapter {
    private repository;
    private service;
    private protocol;
    private config;
    private isInitialized;
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
    constructor(config?: PlanModuleAdapterConfig);
    /**
     * 初始化模块组件
     */
    private initializeComponents;
    /**
     * 获取模块组件
     */
    getComponents(): PlanModuleAdapterResult;
    /**
     * 获取仓库实例
     */
    getRepository(): IPlanRepository;
    /**
     * 获取服务实例
     */
    getService(): PlanManagementService;
    /**
     * 获取协议实例
     */
    getProtocol(): PlanProtocol;
    /**
     * 获取配置
     */
    getConfig(): PlanModuleAdapterConfig;
    /**
     * 检查模块健康状态
     */
    healthCheck(): Promise<{
        status: 'healthy' | 'degraded' | 'unhealthy';
        components: {
            repository: boolean;
            service: boolean;
            protocol: boolean;
            crossCuttingConcerns: boolean;
        };
        timestamp: string;
    }>;
    /**
     * 创建Plan实体
     */
    createPlan(data: Partial<PlanEntityData>): Promise<PlanEntity>;
    /**
     * 获取Plan实体
     */
    getPlan(planId: UUID): Promise<PlanEntity | null>;
    /**
     * 更新Plan实体
     */
    updatePlan(planId: UUID, updates: Partial<PlanEntityData>): Promise<PlanEntity>;
    /**
     * 删除Plan实体
     */
    deletePlan(planId: UUID): Promise<boolean>;
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
    /**
     * 检查服务健康状态
     */
    private checkServiceHealth;
    /**
     * 检查横切关注点健康状态
     */
    private checkCrossCuttingConcernsHealth;
}
/**
 * Plan模块适配器工厂函数
 *
 * @description 创建并初始化Plan模块适配器的便捷函数
 * @param config 适配器配置
 * @returns 初始化完成的适配器结果
 */
export declare function createPlanModuleAdapter(config?: PlanModuleAdapterConfig): Promise<PlanModuleAdapterResult>;
/**
 * Plan模块适配器单例
 *
 * @description 提供全局单例访问的Plan模块适配器
 */
export declare class PlanModuleAdapterSingleton {
    private static instance;
    private static config;
    /**
     * 获取单例实例
     */
    static getInstance(config?: PlanModuleAdapterConfig): PlanModuleAdapter;
    /**
     * 重置单例实例
     */
    static reset(): void;
    /**
     * 检查单例是否已初始化
     */
    static isInitialized(): boolean;
}
//# sourceMappingURL=plan-module.adapter.d.ts.map