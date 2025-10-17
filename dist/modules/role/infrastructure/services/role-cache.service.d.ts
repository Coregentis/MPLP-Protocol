import { RoleEntity } from '../../domain/entities/role.entity';
export interface CacheEntry<T = unknown> {
    key: string;
    value: T;
    createdAt: number;
    accessedAt: number;
    accessCount: number;
    ttl: number;
    tags?: string[];
}
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
export interface CacheWarmupStrategy {
    enabled: boolean;
    strategies: ('popular_roles' | 'recent_roles' | 'permission_cache' | 'statistics_cache')[];
    batchSize: number;
    intervalMs: number;
}
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
    get<T = unknown>(key: string): Promise<T | undefined>;
    set<T = unknown>(key: string, value: T, ttl?: number, tags?: string[]): Promise<boolean>;
    delete(key: string): Promise<boolean>;
    deleteByTags(tags: string[]): Promise<number>;
    clear(): Promise<void>;
    getMetrics(): CacheMetrics;
    getHealthStatus(): {
        status: 'healthy' | 'degraded' | 'unhealthy';
        metrics: CacheMetrics;
        details: Record<string, unknown>;
    };
    warmup(data: {
        roles?: RoleEntity[];
        permissions?: unknown[];
        statistics?: unknown[];
    }): Promise<void>;
    private isExpired;
    private setExpiration;
    private clearTimer;
    private clearAllTimers;
    private evict;
    private evictLRU;
    private evictLFU;
    private evictByTTL;
    private evictRandom;
    private recordHit;
    private recordMiss;
    private recordSet;
    private recordDelete;
    private recordEviction;
    private updateHitRate;
    private updateAverageAccessTime;
    private updateMetrics;
    private calculateMemoryUsage;
    private calculateAverageEntryAge;
    private countExpiredEntries;
    private startCleanupTimer;
    private startWarmupTimer;
    private cleanup;
    private performScheduledWarmup;
    destroy(): Promise<void>;
}
export declare function createRoleCacheService(config?: Partial<RoleCacheConfig>, warmupStrategy?: CacheWarmupStrategy): RoleCacheService;
//# sourceMappingURL=role-cache.service.d.ts.map