/**
 * Role模块企业级缓存服务
 *
 * @description 提供高性能缓存机制，支持命中率监控、预热、智能失效等企业级功能
 * @version 1.0.0
 * @layer 基础设施层 - 服务
 */
import { RoleEntity } from '../../domain/entities/role.entity';
/**
 * 缓存条目接口
 */
export interface CacheEntry<T = unknown> {
    key: string;
    value: T;
    createdAt: number;
    accessedAt: number;
    accessCount: number;
    ttl: number;
    tags?: string[];
}
/**
 * 缓存统计接口
 */
export interface CacheMetrics {
    hits: number;
    misses: number;
    sets: number;
    deletes: number;
    evictions: number;
    totalSize: number;
    hitRate: number;
    missRate: number;
    memoryUsage: number;
    averageAccessTime: number;
}
/**
 * 缓存配置接口
 */
export interface RoleCacheConfig {
    maxSize: number;
    defaultTTL: number;
    enableMetrics: boolean;
    enablePrewarming: boolean;
    evictionPolicy: 'lru' | 'lfu' | 'ttl' | 'random';
    compressionEnabled: boolean;
    persistenceEnabled: boolean;
    cleanupInterval: number;
}
/**
 * 缓存预热策略
 */
export interface CacheWarmupStrategy {
    enabled: boolean;
    strategies: ('popular_roles' | 'recent_roles' | 'permission_cache' | 'statistics_cache')[];
    batchSize: number;
    intervalMs: number;
}
/**
 * Role模块企业级缓存服务
 *
 * @description 高性能缓存系统，支持LRU/LFU策略、命中率监控、预热机制
 */
export declare class RoleCacheService {
    private warmupStrategy;
    private cache;
    private timers;
    private metrics;
    private logger;
    private config;
    private cleanupTimer?;
    private warmupTimer?;
    constructor(config?: Partial<RoleCacheConfig>, warmupStrategy?: CacheWarmupStrategy);
    /**
     * 获取缓存值
     */
    get<T = unknown>(key: string): Promise<T | undefined>;
    /**
     * 设置缓存值
     */
    set<T = unknown>(key: string, value: T, ttl?: number, tags?: string[]): Promise<boolean>;
    /**
     * 删除缓存值
     */
    delete(key: string): Promise<boolean>;
    /**
     * 批量删除（按标签）
     */
    deleteByTags(tags: string[]): Promise<number>;
    /**
     * 清空缓存
     */
    clear(): Promise<void>;
    /**
     * 获取缓存统计
     */
    getMetrics(): CacheMetrics;
    /**
     * 获取缓存健康状态
     */
    getHealthStatus(): {
        status: 'healthy' | 'degraded' | 'unhealthy';
        metrics: CacheMetrics;
        details: Record<string, unknown>;
    };
    /**
     * 缓存预热
     */
    warmup(data: {
        roles?: RoleEntity[];
        permissions?: unknown[];
        statistics?: unknown[];
    }): Promise<void>;
    /**
     * 检查条目是否过期
     */
    private isExpired;
    /**
     * 设置过期定时器
     */
    private setExpiration;
    /**
     * 清除定时器
     */
    private clearTimer;
    /**
     * 清除所有定时器
     */
    private clearAllTimers;
    /**
     * 缓存淘汰策略
     */
    private evict;
    /**
     * LRU淘汰策略
     */
    private evictLRU;
    /**
     * LFU淘汰策略
     */
    private evictLFU;
    /**
     * TTL淘汰策略
     */
    private evictByTTL;
    /**
     * 随机淘汰策略
     */
    private evictRandom;
    /**
     * 记录缓存命中
     */
    private recordHit;
    /**
     * 记录缓存未命中
     */
    private recordMiss;
    /**
     * 记录缓存设置
     */
    private recordSet;
    /**
     * 记录缓存删除
     */
    private recordDelete;
    /**
     * 记录缓存淘汰
     */
    private recordEviction;
    /**
     * 更新命中率
     */
    private updateHitRate;
    /**
     * 更新平均访问时间
     */
    private updateAverageAccessTime;
    /**
     * 更新缓存统计
     */
    private updateMetrics;
    /**
     * 计算内存使用量
     */
    private calculateMemoryUsage;
    /**
     * 计算平均条目年龄
     */
    private calculateAverageEntryAge;
    /**
     * 统计过期条目数量
     */
    private countExpiredEntries;
    /**
     * 启动清理定时器
     */
    private startCleanupTimer;
    /**
     * 启动预热定时器
     */
    private startWarmupTimer;
    /**
     * 清理过期条目
     */
    private cleanup;
    /**
     * 执行定期预热
     */
    private performScheduledWarmup;
    /**
     * 销毁缓存服务
     */
    destroy(): Promise<void>;
}
/**
 * 创建Role缓存服务实例的工厂函数
 */
export declare function createRoleCacheService(config?: Partial<RoleCacheConfig>, warmupStrategy?: CacheWarmupStrategy): RoleCacheService;
//# sourceMappingURL=role-cache.service.d.ts.map