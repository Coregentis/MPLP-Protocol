import { PlanEntity } from '../../domain/entities/plan.entity';
import { PlanManagementService } from '../../application/services/plan-management.service';
import { IPlanRepository } from '../../domain/repositories/plan-repository.interface';
import { PlanProtocol } from '../protocols/plan.protocol';
import { PlanEntityData } from '../../api/mappers/plan.mapper';
import { UUID } from '../../../../shared/types';
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
export interface PlanModuleAdapterResult {
    repository: IPlanRepository;
    service: PlanManagementService;
    protocol: PlanProtocol;
    adapter: PlanModuleAdapter;
}
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
    private initializeComponents;
    getComponents(): PlanModuleAdapterResult;
    getRepository(): IPlanRepository;
    getService(): PlanManagementService;
    getProtocol(): PlanProtocol;
    getConfig(): PlanModuleAdapterConfig;
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
    createPlan(data: Partial<PlanEntityData>): Promise<PlanEntity>;
    getPlan(planId: UUID): Promise<PlanEntity | null>;
    updatePlan(planId: UUID, updates: Partial<PlanEntityData>): Promise<PlanEntity>;
    deletePlan(planId: UUID): Promise<boolean>;
    getModuleInfo(): {
        name: string;
        version: string;
        description: string;
        layer: string;
        status: string;
        features: string[];
        dependencies: string[];
    };
    private checkRepositoryHealth;
    private checkServiceHealth;
    private checkCrossCuttingConcernsHealth;
}
export declare function createPlanModuleAdapter(config?: PlanModuleAdapterConfig): Promise<PlanModuleAdapterResult>;
export declare class PlanModuleAdapterSingleton {
    private static instance;
    private static config;
    static getInstance(config?: PlanModuleAdapterConfig): PlanModuleAdapter;
    static reset(): void;
    static isInitialized(): boolean;
}
//# sourceMappingURL=plan-module.adapter.d.ts.map