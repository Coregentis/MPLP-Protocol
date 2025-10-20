/**
 * Plan模块初始化
 *
 * @description Plan模块的统一初始化和配置管理
 * @version 1.0.0
 * @layer 模块层 - 初始化
 * @pattern 与Context模块使用IDENTICAL的模块初始化模式
 */
import { PlanModuleAdapter } from './infrastructure/adapters/plan-module.adapter';
import { PlanEntity } from './domain/entities/plan.entity';
import { PlanManagementService } from './application/services/plan-management.service';
import { PlanProtocol } from './infrastructure/protocols/plan.protocol';
import { IPlanRepository } from './domain/repositories/plan-repository.interface';
import { PlanEntityData } from './api/mappers/plan.mapper';
/**
 * Plan模块选项
 */
export interface PlanModuleOptions {
    enableLogging?: boolean;
    enableCaching?: boolean;
    enableMetrics?: boolean;
    repositoryType?: 'memory' | 'database' | 'file';
    maxCacheSize?: number;
    cacheTimeout?: number;
    enableOptimization?: boolean;
    enableRiskAssessment?: boolean;
    enableFailureRecovery?: boolean;
    dataSource?: unknown;
}
/**
 * Plan模块结果
 */
export interface PlanModuleResult {
    planEntity: typeof PlanEntity;
    planRepository: IPlanRepository;
    planService: PlanManagementService;
    planProtocol: PlanProtocol;
    planAdapter: PlanModuleAdapter;
    createPlan: (data: Partial<PlanEntityData>) => Promise<PlanEntity>;
    getPlan: (planId: string) => Promise<PlanEntity | null>;
    updatePlan: (planId: string, updates: Partial<PlanEntityData>) => Promise<PlanEntity>;
    deletePlan: (planId: string) => Promise<boolean>;
    moduleInfo: {
        name: string;
        version: string;
        description: string;
        layer: string;
        status: string;
        features: string[];
        dependencies: string[];
    };
}
/**
 * 初始化Plan模块
 *
 * @description 创建并配置Plan模块的所有组件
 * @param options 模块配置选项
 * @returns 初始化完成的模块结果
 */
export declare function initializePlanModule(options?: PlanModuleOptions): Promise<PlanModuleResult>;
/**
 * Plan模块单例管理器
 *
 * @description 提供Plan模块的单例访问和管理
 */
export declare class PlanModuleManager {
    private static instance;
    private static options;
    /**
     * 获取模块实例
     */
    static getInstance(options?: PlanModuleOptions): Promise<PlanModuleResult>;
    /**
     * 重置模块实例
     */
    static reset(): void;
    /**
     * 检查模块是否已初始化
     */
    static isInitialized(): boolean;
    /**
     * 获取模块健康状态
     */
    static getHealthStatus(): Promise<{
        status: 'healthy' | 'degraded' | 'unhealthy';
        components: Record<string, boolean>;
        timestamp: string;
    }>;
}
/**
 * Plan模块工厂函数
 *
 * @description 快速创建Plan模块实例的工厂函数
 * @param options 模块选项
 * @returns 模块实例
 */
export declare const createPlanModule: typeof initializePlanModule;
/**
 * Plan模块默认配置
 */
export declare const DEFAULT_PLAN_MODULE_OPTIONS: PlanModuleOptions;
/**
 * Plan模块信息常量
 */
export declare const PLAN_MODULE_INFO: {
    readonly name: "plan";
    readonly version: "1.0.0";
    readonly description: "MPLP智能任务规划协调模块";
    readonly layer: "L2";
    readonly status: "implementing";
    readonly features: readonly ["智能任务规划", "计划执行管理", "任务协调", "依赖管理", "计划优化", "风险评估", "故障恢复", "性能监控", "审计追踪", "版本历史", "搜索索引", "缓存策略", "事件集成"];
    readonly dependencies: readonly ["security", "performance", "eventBus", "errorHandler", "coordination", "orchestration", "stateSync", "transaction", "protocolVersion"];
};
//# sourceMappingURL=module.d.ts.map