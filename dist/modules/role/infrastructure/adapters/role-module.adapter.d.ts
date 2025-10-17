import { RoleController } from '../../api/controllers/role.controller';
import { RoleManagementService } from '../../application/services/role-management.service';
import { IRoleRepository } from '../../domain/repositories/role-repository.interface';
import { RoleProtocol } from '../protocols/role.protocol';
import { RoleEntity } from '../../domain/entities/role.entity';
import { CacheMetrics } from '../services/role-cache.service';
import { PerformanceAlert, PerformanceBenchmark } from '../services/role-performance.service';
import { MLPPSecurityManager, MLPPPerformanceMonitor, MLPPEventBusManager, MLPPCoordinationManager } from '../../../../core/protocols/cross-cutting-concerns';
export interface RoleModuleAdapterConfig {
    enableLogging?: boolean;
    enableCaching?: boolean;
    enableMetrics?: boolean;
    enableSecurity?: boolean;
    repositoryType?: 'memory' | 'database' | 'file';
    maxCacheSize?: number;
    cacheTimeout?: number;
    securityLevel?: 'basic' | 'standard' | 'enterprise';
    auditLevel?: 'basic' | 'detailed' | 'comprehensive';
}
export declare class RoleModuleAdapter {
    private config;
    private initialized;
    private logger;
    private cacheService;
    private performanceService;
    private repository;
    private service;
    private controller;
    private protocol;
    private securityManager;
    private performanceMonitor;
    private eventBusManager;
    private errorHandler;
    private coordinationManager;
    private orchestrationManager;
    private stateSyncManager;
    private transactionManager;
    private protocolVersionManager;
    constructor(config?: RoleModuleAdapterConfig);
    initialize(): Promise<void>;
    private initializeCrossCuttingConcerns;
    private initializeRepository;
    private initializeService;
    private initializeProtocol;
    private initializeController;
    private performHealthCheck;
    getRoleController(): RoleController;
    getRoleService(): RoleManagementService;
    getRoleProtocol(): RoleProtocol;
    getRoleRepository(): IRoleRepository;
    getSecurityManager(): MLPPSecurityManager;
    getPerformanceMonitor(): MLPPPerformanceMonitor;
    getEventBusManager(): MLPPEventBusManager;
    getCoordinationManager(): MLPPCoordinationManager;
    getHealthStatus(): Promise<{
        status: 'healthy' | 'unhealthy';
        timestamp: string;
        details: Record<string, unknown>;
    }>;
    destroy(): Promise<void>;
    getCacheMetrics(): CacheMetrics;
    getCacheHealth(): {
        status: 'healthy' | 'degraded' | 'unhealthy';
        metrics: CacheMetrics;
        details: Record<string, unknown>;
    };
    warmupCache(data: {
        roles?: RoleEntity[];
        permissions?: unknown[];
        statistics?: unknown[];
    }): Promise<void>;
    clearCache(): Promise<void>;
    clearCacheByTags(tags: string[]): Promise<number>;
    getPerformanceStats(): {
        totalMetrics: number;
        activeTraces: number;
        totalAlerts: number;
        unresolvedAlerts: number;
        benchmarks: Record<string, PerformanceBenchmark>;
        recentMetrics: unknown[];
    };
    getPerformanceHealth(): {
        status: 'healthy' | 'degraded' | 'unhealthy';
        score: number;
        issues: string[];
        recommendations: string[];
    };
    getPerformanceAlerts(): PerformanceAlert[];
    resolvePerformanceAlert(alertId: string): Promise<boolean>;
    resetPerformanceBenchmarks(): void;
    optimizePermissionCheck<T>(operation: () => Promise<T>, context: {
        roleId?: string;
        permission?: string;
        resourceId?: string;
    }): Promise<T>;
    private ensureInitialized;
    private createDatabaseClient;
}
//# sourceMappingURL=role-module.adapter.d.ts.map