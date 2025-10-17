import { PlanModuleAdapter } from './infrastructure/adapters/plan-module.adapter';
import { PlanEntity } from './domain/entities/plan.entity';
import { PlanManagementService } from './application/services/plan-management.service';
import { PlanProtocol } from './infrastructure/protocols/plan.protocol';
import { IPlanRepository } from './domain/repositories/plan-repository.interface';
import { PlanEntityData } from './api/mappers/plan.mapper';
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
export declare function initializePlanModule(options?: PlanModuleOptions): Promise<PlanModuleResult>;
export declare class PlanModuleManager {
    private static instance;
    private static options;
    static getInstance(options?: PlanModuleOptions): Promise<PlanModuleResult>;
    static reset(): void;
    static isInitialized(): boolean;
    static getHealthStatus(): Promise<{
        status: 'healthy' | 'degraded' | 'unhealthy';
        components: Record<string, boolean>;
        timestamp: string;
    }>;
}
export declare const createPlanModule: typeof initializePlanModule;
export declare const DEFAULT_PLAN_MODULE_OPTIONS: PlanModuleOptions;
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