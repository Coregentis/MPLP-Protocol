/**
 * Role模块企业级缓存服务
 * 
 * @description 提供高性能缓存机制，支持命中率监控、预热、智能失效等企业级功能
 * @version 1.0.0
 * @layer 基础设施层 - 服务
 */

import { RoleEntity } from '../../domain/entities/role.entity';
import { RoleLoggerService, createRoleLogger, LogLevel } from './role-logger.service';

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
export class RoleCacheService {
  private cache = new Map<string, CacheEntry>();
  private timers = new Map<string, ReturnType<typeof setTimeout>>();
  private metrics: CacheMetrics;
  private logger: RoleLoggerService;
  private config: Required<RoleCacheConfig>;
  private cleanupTimer?: ReturnType<typeof setTimeout>;
  private warmupTimer?: ReturnType<typeof setTimeout>;

  constructor(
    config: Partial<RoleCacheConfig> = {},
    private warmupStrategy: CacheWarmupStrategy = {
      enabled: true,
      strategies: ['popular_roles', 'permission_cache'],
      batchSize: 50,
      intervalMs: 300000 // 5分钟
    }
  ) {
    this.config = {
      maxSize: 1000,
      defaultTTL: 300, // 5分钟
      enableMetrics: true,
      enablePrewarming: true,
      evictionPolicy: 'lru',
      compressionEnabled: false,
      persistenceEnabled: false,
      cleanupInterval: 60000, // 1分钟
      ...config
    };

    this.metrics = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      evictions: 0,
      totalSize: 0,
      hitRate: 0,
      missRate: 0,
      memoryUsage: 0,
      averageAccessTime: 0
    };

    this.logger = createRoleLogger({
      module: 'RoleCache',
      level: LogLevel.INFO,
      enableStructured: true,
      environment: process.env.NODE_ENV as 'development' | 'production' | 'test' || 'development'
    });

    this.startCleanupTimer();
    if (this.warmupStrategy.enabled) {
      this.startWarmupTimer();
    }
  }

  /**
   * 获取缓存值
   */
  async get<T = unknown>(key: string): Promise<T | undefined> {
    const startTime = Date.now();
    const entry = this.cache.get(key);

    if (!entry) {
      this.recordMiss(key, Date.now() - startTime);
      return undefined;
    }

    // 检查是否过期
    if (this.isExpired(entry)) {
      await this.delete(key);
      this.recordMiss(key, Date.now() - startTime, 'expired');
      return undefined;
    }

    // 更新访问信息
    entry.accessedAt = Date.now();
    entry.accessCount++;

    this.recordHit(key, Date.now() - startTime);
    return entry.value as T;
  }

  /**
   * 设置缓存值
   */
  async set<T = unknown>(key: string, value: T, ttl?: number, tags?: string[]): Promise<boolean> {
    try {
      const effectiveTTL = ttl ?? this.config.defaultTTL;
      const now = Date.now();

      // 检查缓存大小限制
      if (this.cache.size >= this.config.maxSize && !this.cache.has(key)) {
        await this.evict();
      }

      const entry: CacheEntry<T> = {
        key,
        value,
        createdAt: now,
        accessedAt: now,
        accessCount: 1,
        ttl: effectiveTTL,
        tags
      };

      this.cache.set(key, entry);
      this.setExpiration(key, effectiveTTL);

      this.recordSet(key);
      return true;
    } catch (error) {
      this.logger.error('Failed to set cache entry', error instanceof Error ? error : undefined, { key });
      return false;
    }
  }

  /**
   * 删除缓存值
   */
  async delete(key: string): Promise<boolean> {
    const entry = this.cache.get(key);
    if (!entry) {
      return false;
    }

    this.cache.delete(key);
    this.clearTimer(key);
    this.recordDelete(key);
    return true;
  }

  /**
   * 批量删除（按标签）
   */
  async deleteByTags(tags: string[]): Promise<number> {
    let deletedCount = 0;
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (entry.tags && entry.tags.some(tag => tags.includes(tag))) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      if (await this.delete(key)) {
        deletedCount++;
      }
    }

    this.logger.info('Batch deleted cache entries by tags', {
      tags,
      deletedCount,
      totalKeys: keysToDelete.length
    });

    return deletedCount;
  }

  /**
   * 清空缓存
   */
  async clear(): Promise<void> {
    const size = this.cache.size;
    this.cache.clear();
    this.clearAllTimers();
    
    this.logger.info('Cache cleared', { previousSize: size });
  }

  /**
   * 获取缓存统计
   */
  getMetrics(): CacheMetrics {
    this.updateMetrics();
    return { ...this.metrics };
  }

  /**
   * 获取缓存健康状态
   */
  getHealthStatus(): {
    status: 'healthy' | 'degraded' | 'unhealthy';
    metrics: CacheMetrics;
    details: Record<string, unknown>;
  } {
    const metrics = this.getMetrics();
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

    // 健康状态判断
    if (metrics.hitRate < 0.5) {
      status = 'degraded';
    }
    if (metrics.hitRate < 0.3 || metrics.memoryUsage > 0.9) {
      status = 'unhealthy';
    }

    return {
      status,
      metrics,
      details: {
        cacheSize: this.cache.size,
        maxSize: this.config.maxSize,
        utilizationRate: this.cache.size / this.config.maxSize,
        averageEntryAge: this.calculateAverageEntryAge(),
        expiredEntries: this.countExpiredEntries()
      }
    };
  }

  /**
   * 缓存预热
   */
  async warmup(data: { roles?: RoleEntity[]; permissions?: unknown[]; statistics?: unknown[] }): Promise<void> {
    const startTime = Date.now();
    let warmedCount = 0;

    try {
      // 预热角色数据
      if (data.roles) {
        for (const role of data.roles) {
          await this.set(`role:${role.roleId}`, role, 600, ['role', 'warmup']); // 10分钟TTL
          warmedCount++;
        }
      }

      // 预热权限数据
      if (data.permissions) {
        for (const permission of data.permissions) {
          const permissionObj = permission as { id: string; [key: string]: unknown };
          await this.set(`permission:${permissionObj.id}`, permission, 300, ['permission', 'warmup']); // 5分钟TTL
          warmedCount++;
        }
      }

      // 预热统计数据
      if (data.statistics) {
        for (const stat of data.statistics) {
          const statObj = stat as { key: string; value: unknown; [key: string]: unknown };
          await this.set(`stats:${statObj.key}`, statObj.value, 3600, ['statistics', 'warmup']); // 1小时TTL
          warmedCount++;
        }
      }

      const duration = Date.now() - startTime;
      this.logger.info('Cache warmup completed', {
        warmedCount,
        duration,
        strategies: Object.keys(data)
      });

    } catch (error) {
      this.logger.error('Cache warmup failed', error instanceof Error ? error : undefined, {
        warmedCount,
        duration: Date.now() - startTime
      });
    }
  }

  /**
   * 检查条目是否过期
   */
  private isExpired(entry: CacheEntry): boolean {
    if (entry.ttl <= 0) return false; // 永不过期
    return Date.now() - entry.createdAt > entry.ttl * 1000;
  }

  /**
   * 设置过期定时器
   */
  private setExpiration(key: string, ttl: number): void {
    if (ttl <= 0) return; // 永不过期

    this.clearTimer(key);

    const timer = setTimeout(async () => {
      await this.delete(key);
      this.logger.debug('Cache entry expired', { key });
    }, ttl * 1000);

    this.timers.set(key, timer);
  }

  /**
   * 清除定时器
   */
  private clearTimer(key: string): void {
    const timer = this.timers.get(key);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(key);
    }
  }

  /**
   * 清除所有定时器
   */
  private clearAllTimers(): void {
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    this.timers.clear();
  }

  /**
   * 缓存淘汰策略
   */
  private async evict(): Promise<void> {
    switch (this.config.evictionPolicy) {
      case 'lru':
        await this.evictLRU();
        break;
      case 'lfu':
        await this.evictLFU();
        break;
      case 'ttl':
        await this.evictByTTL();
        break;
      case 'random':
        await this.evictRandom();
        break;
      default:
        await this.evictLRU();
    }
  }

  /**
   * LRU淘汰策略
   */
  private async evictLRU(): Promise<void> {
    let oldestKey = '';
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.accessedAt < oldestTime) {
        oldestTime = entry.accessedAt;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      await this.delete(oldestKey);
      this.recordEviction(oldestKey, 'lru');
    }
  }

  /**
   * LFU淘汰策略
   */
  private async evictLFU(): Promise<void> {
    let leastUsedKey = '';
    let leastAccessCount = Number.MAX_SAFE_INTEGER;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.accessCount < leastAccessCount) {
        leastAccessCount = entry.accessCount;
        leastUsedKey = key;
      }
    }

    if (leastUsedKey) {
      await this.delete(leastUsedKey);
      this.recordEviction(leastUsedKey, 'lfu');
    }
  }

  /**
   * TTL淘汰策略
   */
  private async evictByTTL(): Promise<void> {
    const now = Date.now();
    let shortestTTLKey = '';
    let shortestRemainingTime = Number.MAX_SAFE_INTEGER;

    for (const [key, entry] of this.cache.entries()) {
      const remainingTime = (entry.createdAt + entry.ttl * 1000) - now;
      if (remainingTime < shortestRemainingTime) {
        shortestRemainingTime = remainingTime;
        shortestTTLKey = key;
      }
    }

    if (shortestTTLKey) {
      await this.delete(shortestTTLKey);
      this.recordEviction(shortestTTLKey, 'ttl');
    }
  }

  /**
   * 随机淘汰策略
   */
  private async evictRandom(): Promise<void> {
    const keys = Array.from(this.cache.keys());
    if (keys.length > 0) {
      const randomKey = keys[Math.floor(Math.random() * keys.length)];
      await this.delete(randomKey);
      this.recordEviction(randomKey, 'random');
    }
  }

  /**
   * 记录缓存命中
   */
  private recordHit(key: string, accessTime: number): void {
    this.metrics.hits++;
    this.updateHitRate();
    this.updateAverageAccessTime(accessTime);

    this.logger.debug('Cache hit', { key, accessTime });
  }

  /**
   * 记录缓存未命中
   */
  private recordMiss(key: string, accessTime: number, reason?: string): void {
    this.metrics.misses++;
    this.updateHitRate();
    this.updateAverageAccessTime(accessTime);

    this.logger.debug('Cache miss', { key, accessTime, reason });
  }

  /**
   * 记录缓存设置
   */
  private recordSet(key: string): void {
    this.metrics.sets++;
    this.metrics.totalSize = this.cache.size;

    this.logger.debug('Cache set', { key, totalSize: this.metrics.totalSize });
  }

  /**
   * 记录缓存删除
   */
  private recordDelete(key: string): void {
    this.metrics.deletes++;
    this.metrics.totalSize = this.cache.size;

    this.logger.debug('Cache delete', { key, totalSize: this.metrics.totalSize });
  }

  /**
   * 记录缓存淘汰
   */
  private recordEviction(key: string, policy: string): void {
    this.metrics.evictions++;
    this.metrics.totalSize = this.cache.size;

    this.logger.info('Cache eviction', { key, policy, totalSize: this.metrics.totalSize });
  }

  /**
   * 更新命中率
   */
  private updateHitRate(): void {
    const total = this.metrics.hits + this.metrics.misses;
    if (total > 0) {
      this.metrics.hitRate = this.metrics.hits / total;
      this.metrics.missRate = this.metrics.misses / total;
    }
  }

  /**
   * 更新平均访问时间
   */
  private updateAverageAccessTime(accessTime: number): void {
    const total = this.metrics.hits + this.metrics.misses;
    if (total === 1) {
      this.metrics.averageAccessTime = accessTime;
    } else {
      this.metrics.averageAccessTime =
        (this.metrics.averageAccessTime * (total - 1) + accessTime) / total;
    }
  }

  /**
   * 更新缓存统计
   */
  private updateMetrics(): void {
    this.metrics.totalSize = this.cache.size;
    this.metrics.memoryUsage = this.calculateMemoryUsage();
  }

  /**
   * 计算内存使用量
   */
  private calculateMemoryUsage(): number {
    // 简化的内存使用量计算
    const entrySize = 200; // 估算每个条目的平均大小（字节）
    return (this.cache.size * entrySize) / (1024 * 1024); // MB
  }

  /**
   * 计算平均条目年龄
   */
  private calculateAverageEntryAge(): number {
    if (this.cache.size === 0) return 0;

    const now = Date.now();
    let totalAge = 0;

    for (const entry of this.cache.values()) {
      totalAge += now - entry.createdAt;
    }

    return totalAge / this.cache.size;
  }

  /**
   * 统计过期条目数量
   */
  private countExpiredEntries(): number {
    let expiredCount = 0;

    for (const entry of this.cache.values()) {
      if (this.isExpired(entry)) {
        expiredCount++;
      }
    }

    return expiredCount;
  }

  /**
   * 启动清理定时器
   */
  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(async () => {
      await this.cleanup();
    }, this.config.cleanupInterval);
  }

  /**
   * 启动预热定时器
   */
  private startWarmupTimer(): void {
    if (!this.warmupStrategy.enabled) return;

    this.warmupTimer = setInterval(async () => {
      await this.performScheduledWarmup();
    }, this.warmupStrategy.intervalMs);
  }

  /**
   * 清理过期条目
   */
  private async cleanup(): Promise<void> {
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      await this.delete(key);
    }

    if (keysToDelete.length > 0) {
      this.logger.info('Cache cleanup completed', {
        expiredEntries: keysToDelete.length,
        remainingEntries: this.cache.size
      });
    }
  }

  /**
   * 执行定期预热
   */
  private async performScheduledWarmup(): Promise<void> {
    // 这里可以实现定期预热逻辑
    // 例如：重新加载热门角色、权限等
    this.logger.debug('Scheduled cache warmup triggered');
  }

  /**
   * 销毁缓存服务
   */
  async destroy(): Promise<void> {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    if (this.warmupTimer) {
      clearInterval(this.warmupTimer);
    }

    this.clearAllTimers();
    await this.clear();

    this.logger.info('Cache service destroyed');
  }
}

/**
 * 创建Role缓存服务实例的工厂函数
 */
export function createRoleCacheService(
  config?: Partial<RoleCacheConfig>,
  warmupStrategy?: CacheWarmupStrategy
): RoleCacheService {
  return new RoleCacheService(config, warmupStrategy);
}
