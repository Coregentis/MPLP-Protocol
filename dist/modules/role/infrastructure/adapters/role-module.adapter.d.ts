/**
 * Role模块适配器
 *
 * @description 基于Context、Plan、Confirm模块的企业级标准，提供Role模块的统一访问接口和外部系统集成 - 企业级RBAC安全中心
 * @version 1.0.0
 * @layer 基础设施层 - 适配器
 * @integration 统一L3管理器注入模式，与Context/Plan/Confirm模块IDENTICAL架构
 */
import { RoleController } from '../../api/controllers/role.controller';
import { RoleManagementService } from '../../application/services/role-management.service';
import { IRoleRepository } from '../../domain/repositories/role-repository.interface';
import { RoleProtocol } from '../protocols/role.protocol';
import { RoleEntity } from '../../domain/entities/role.entity';
import { CacheMetrics } from '../services/role-cache.service';
import { PerformanceAlert, PerformanceBenchmark } from '../services/role-performance.service';
import { MLPPSecurityManager, MLPPPerformanceMonitor, MLPPEventBusManager, MLPPCoordinationManager } from '../../../../core/protocols/cross-cutting-concerns';
/**
 * Role模块适配器配置
 */
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
/**
 * Role模块适配器
 *
 * @description 基于Context、Plan、Confirm模块的企业级标准，提供Role模块的统一访问接口和外部系统集成
 * @pattern 企业级RBAC安全中心，统一L3管理器注入模式
 */
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
    /**
     * 初始化Role模块适配器
     * @description 基于Context/Plan/Confirm模块的企业级标准初始化流程
     */
    initialize(): Promise<void>;
    /**
     * 初始化9个L3横切关注点管理器
     * @description 与Context/Plan/Confirm模块使用IDENTICAL的初始化模式
     */
    private initializeCrossCuttingConcerns;
    /**
     * 初始化仓库层
     */
    private initializeRepository;
    /**
     * 初始化应用服务层
     */
    private initializeService;
    /**
     * 初始化协议层
     */
    private initializeProtocol;
    /**
     * 初始化API控制器层
     */
    private initializeController;
    /**
     * 执行健康检查
     */
    private performHealthCheck;
    /**
     * 获取Role控制器
     */
    getRoleController(): RoleController;
    /**
     * 获取Role服务
     */
    getRoleService(): RoleManagementService;
    /**
     * 获取Role协议
     */
    getRoleProtocol(): RoleProtocol;
    /**
     * 获取Role仓库
     */
    getRoleRepository(): IRoleRepository;
    /**
     * 获取安全管理器
     */
    getSecurityManager(): MLPPSecurityManager;
    /**
     * 获取性能监控器
     */
    getPerformanceMonitor(): MLPPPerformanceMonitor;
    /**
     * 获取事件总线管理器
     */
    getEventBusManager(): MLPPEventBusManager;
    /**
     * 获取协调管理器
     */
    getCoordinationManager(): MLPPCoordinationManager;
    /**
     * 获取模块健康状态
     */
    getHealthStatus(): Promise<{
        status: 'healthy' | 'unhealthy';
        timestamp: string;
        details: Record<string, unknown>;
    }>;
    /**
     * 销毁适配器
     */
    destroy(): Promise<void>;
    /**
     * 获取缓存统计信息
     */
    getCacheMetrics(): CacheMetrics;
    /**
     * 获取缓存健康状态
     */
    getCacheHealth(): {
        status: 'healthy' | 'degraded' | 'unhealthy';
        metrics: CacheMetrics;
        details: Record<string, unknown>;
    };
    /**
     * 执行缓存预热
     */
    warmupCache(data: {
        roles?: RoleEntity[];
        permissions?: unknown[];
        statistics?: unknown[];
    }): Promise<void>;
    /**
     * 清空缓存
     */
    clearCache(): Promise<void>;
    /**
     * 按标签删除缓存
     */
    clearCacheByTags(tags: string[]): Promise<number>;
    /**
     * 获取性能统计信息
     */
    getPerformanceStats(): {
        totalMetrics: number;
        activeTraces: number;
        totalAlerts: number;
        unresolvedAlerts: number;
        benchmarks: Record<string, PerformanceBenchmark>;
        recentMetrics: unknown[];
    };
    /**
     * 获取性能健康状态
     */
    getPerformanceHealth(): {
        status: 'healthy' | 'degraded' | 'unhealthy';
        score: number;
        issues: string[];
        recommendations: string[];
    };
    /**
     * 获取未解决的性能告警
     */
    getPerformanceAlerts(): PerformanceAlert[];
    /**
     * 解决性能告警
     */
    resolvePerformanceAlert(alertId: string): Promise<boolean>;
    /**
     * 重置性能基准
     */
    resetPerformanceBenchmarks(): void;
    /**
     * 优化权限检查操作
     */
    optimizePermissionCheck<T>(operation: () => Promise<T>, context: {
        roleId?: string;
        permission?: string;
        resourceId?: string;
    }): Promise<T>;
    /**
     * 确保适配器已初始化
     */
    private ensureInitialized;
    /**
     * 创建数据库客户端
     */
    private createDatabaseClient;
}
//# sourceMappingURL=role-module.adapter.d.ts.map