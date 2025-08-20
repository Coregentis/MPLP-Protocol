/**
 * 缓存策略服务
 * 
 * 基于Schema字段: caching_policy (cache_strategy, cache_levels, cache_warming)
 * 实现多层缓存策略、缓存预热、缓存驱逐等功能
 */

import { UUID } from '../../types';

/**
 * 缓存策略类型
 */
export type CacheStrategy = 'lru' | 'lfu' | 'ttl' | 'adaptive';

/**
 * 缓存后端类型
 */
export type CacheBackend = 'memory' | 'redis' | 'memcached' | 'database';

/**
 * 驱逐策略类型
 */
export type EvictionPolicy = 'lru' | 'lfu' | 'random' | 'ttl';

/**
 * 缓存级别配置接口
 */
export interface CacheLevel {
  level: string;
  backend: CacheBackend;
  ttlSeconds: number;
  maxSizeMb?: number;
  evictionPolicy?: EvictionPolicy;
}

/**
 * 缓存预热配置接口
 */
export interface CacheWarmingConfig {
  enabled: boolean;
  strategies?: string[];
}

/**
 * 缓存策略配置接口
 */
export interface CachingPolicyConfig {
  enabled: boolean;
  cacheStrategy: CacheStrategy;
  cacheLevels?: CacheLevel[];
  cacheWarming?: CacheWarmingConfig;
}

/**
 * 缓存项接口
 */
export interface CacheItem<T = unknown> {
  key: string;
  value: T;
  timestamp: Date;
  ttl: number;
  accessCount: number;
  lastAccessed: Date;
  size: number;
}

/**
 * 缓存统计接口
 */
export interface CacheStatistics {
  totalItems: number;
  totalSizeBytes: number;
  hitCount: number;
  missCount: number;
  hitRate: number;
  evictionCount: number;
  levelStatistics: Record<string, {
    items: number;
    sizeBytes: number;
    hits: number;
    misses: number;
    evictions: number;
  }>;
}

/**
 * 缓存操作结果接口
 */
export interface CacheOperationResult<T = unknown> {
  success: boolean;
  value?: T;
  fromCache: boolean;
  level?: string;
  error?: string;
}

/**
 * 缓存策略服务
 */
export class CachingPolicyService {
  private config: CachingPolicyConfig;
  private caches = new Map<string, Map<string, CacheItem>>();
  private statistics: CacheStatistics;

  constructor(config?: Partial<CachingPolicyConfig>) {
    this.config = {
      enabled: true,
      cacheStrategy: 'lru',
      cacheLevels: [
        {
          level: 'L1',
          backend: 'memory',
          ttlSeconds: 300,
          maxSizeMb: 100,
          evictionPolicy: 'lru'
        }
      ],
      cacheWarming: {
        enabled: true,
        strategies: ['preload_frequent']
      },
      ...config
    };

    this.statistics = {
      totalItems: 0,
      totalSizeBytes: 0,
      hitCount: 0,
      missCount: 0,
      hitRate: 0,
      evictionCount: 0,
      levelStatistics: {}
    };

    this.initializeCacheLevels();
  }

  /**
   * 获取缓存项
   */
  async get<T>(key: string, contextId?: UUID): Promise<CacheOperationResult<T>> {
    if (!this.config.enabled) {
      return {
        success: false,
        fromCache: false,
        error: 'Caching is disabled'
      };
    }

    const fullKey = contextId ? `${contextId}:${key}` : key;

    // 按级别顺序查找
    for (const level of this.config.cacheLevels || []) {
      const cache = this.caches.get(level.level);
      if (!cache) continue;

      const item = cache.get(fullKey);
      if (item && !this.isExpired(item)) {
        // 更新访问统计
        item.accessCount++;
        item.lastAccessed = new Date();

        this.statistics.hitCount++;
        this.updateLevelStatistics(level.level, 'hit');
        this.updateHitRate();

        return {
          success: true,
          value: item.value as T,
          fromCache: true,
          level: level.level
        };
      }
    }

    // 缓存未命中
    this.statistics.missCount++;
    // 更新第一个级别的miss统计
    if (this.config.cacheLevels && this.config.cacheLevels.length > 0) {
      this.updateLevelStatistics(this.config.cacheLevels[0].level, 'miss');
    }
    this.updateHitRate();

    return {
      success: false,
      fromCache: false
    };
  }

  /**
   * 设置缓存项
   */
  async set<T>(key: string, value: T, contextId?: UUID, customTtl?: number): Promise<boolean> {
    if (!this.config.enabled) {
      return false;
    }

    const fullKey = contextId ? `${contextId}:${key}` : key;
    const valueSize = this.calculateSize(value);

    // 选择合适的缓存级别
    const targetLevel = this.selectCacheLevel(valueSize);
    if (!targetLevel) {
      return false;
    }

    const cache = this.caches.get(targetLevel.level);
    if (!cache) {
      return false;
    }

    const ttl = customTtl || targetLevel.ttlSeconds;
    const item: CacheItem<T> = {
      key: fullKey,
      value,
      timestamp: new Date(),
      ttl,
      accessCount: 0,
      lastAccessed: new Date(),
      size: valueSize
    };

    // 检查是否需要驱逐
    await this.evictIfNecessary(targetLevel, valueSize);

    // 存储缓存项
    cache.set(fullKey, item);
    
    // 更新统计
    this.statistics.totalItems++;
    this.statistics.totalSizeBytes += valueSize;
    this.updateLevelStatistics(targetLevel.level, 'set', valueSize);

    return true;
  }

  /**
   * 删除缓存项
   */
  async delete(key: string, contextId?: UUID): Promise<boolean> {
    if (!this.config.enabled) {
      return false;
    }

    const fullKey = contextId ? `${contextId}:${key}` : key;
    let deleted = false;

    // 从所有级别删除
    for (const level of this.config.cacheLevels || []) {
      const cache = this.caches.get(level.level);
      if (!cache) continue;

      const item = cache.get(fullKey);
      if (item) {
        cache.delete(fullKey);
        this.statistics.totalItems--;
        this.statistics.totalSizeBytes -= item.size;
        this.updateLevelStatistics(level.level, 'delete', -item.size);
        deleted = true;
      }
    }

    return deleted;
  }

  /**
   * 清空缓存
   */
  async clear(level?: string): Promise<boolean> {
    try {
      if (level) {
        // 清空指定级别
        const cache = this.caches.get(level);
        if (cache) {
          const items = Array.from(cache.values());
          const totalSize = items.reduce((sum, item) => sum + item.size, 0);
          
          cache.clear();
          this.statistics.totalItems -= items.length;
          this.statistics.totalSizeBytes -= totalSize;
          this.resetLevelStatistics(level);
        }
      } else {
        // 清空所有级别
        for (const [levelName, cache] of this.caches.entries()) {
          cache.clear();
          this.resetLevelStatistics(levelName);
        }
        
        this.statistics.totalItems = 0;
        this.statistics.totalSizeBytes = 0;
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * 缓存预热
   */
  async warmCache(data: Array<{ key: string; value: unknown; contextId?: UUID }>): Promise<number> {
    if (!this.config.enabled || !this.config.cacheWarming?.enabled) {
      return 0;
    }

    let warmedCount = 0;

    for (const item of data) {
      const success = await this.set(item.key, item.value, item.contextId);
      if (success) {
        warmedCount++;
      }
    }

    return warmedCount;
  }

  /**
   * 获取缓存统计
   */
  getStatistics(): CacheStatistics {
    this.updateHitRate();
    return { ...this.statistics };
  }

  /**
   * 获取缓存健康状态
   */
  getHealthStatus(): {
    overall: 'healthy' | 'degraded' | 'unhealthy';
    levels: Record<string, 'healthy' | 'degraded' | 'unhealthy'>;
    issues: string[];
  } {
    const issues: string[] = [];
    const levels: Record<string, 'healthy' | 'degraded' | 'unhealthy'> = {};
    
    let healthyLevels = 0;
    let totalLevels = 0;

    for (const level of this.config.cacheLevels || []) {
      totalLevels++;
      const cache = this.caches.get(level.level);
      const levelStats = this.statistics.levelStatistics[level.level];
      
      if (!cache) {
        levels[level.level] = 'unhealthy';
        issues.push(`Cache level ${level.level} is not initialized`);
        continue;
      }

      const hitRate = levelStats ? (levelStats.hits / (levelStats.hits + levelStats.misses) || 0) : 0;
      const sizeUtilization = levelStats ? (levelStats.sizeBytes / ((level.maxSizeMb || 100) * 1024 * 1024)) : 0;
      const totalRequests = levelStats ? (levelStats.hits + levelStats.misses) : 0;

      if (hitRate < 0.1 && totalRequests > 100) {
        levels[level.level] = 'degraded';
        issues.push(`Cache level ${level.level} has low hit rate: ${(hitRate * 100).toFixed(1)}%`);
      } else if (sizeUtilization > 0.9) {
        levels[level.level] = 'degraded';
        issues.push(`Cache level ${level.level} is near capacity: ${(sizeUtilization * 100).toFixed(1)}%`);
      } else {
        levels[level.level] = 'healthy';
        healthyLevels++;
      }
    }

    let overall: 'healthy' | 'degraded' | 'unhealthy';
    if (healthyLevels === totalLevels) {
      overall = 'healthy';
    } else if (healthyLevels > 0) {
      overall = 'degraded';
    } else {
      overall = 'unhealthy';
    }

    return { overall, levels, issues };
  }

  /**
   * 更新缓存策略配置
   */
  async updateConfig(newConfig: Partial<CachingPolicyConfig>): Promise<boolean> {
    try {
      const oldConfig = { ...this.config };
      this.config = { ...this.config, ...newConfig };

      // 如果缓存级别发生变化，重新初始化
      if (JSON.stringify(oldConfig.cacheLevels) !== JSON.stringify(this.config.cacheLevels)) {
        this.initializeCacheLevels();
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * 获取默认配置
   */
  getDefaultConfig(): CachingPolicyConfig {
    return {
      enabled: true,
      cacheStrategy: 'lru',
      cacheLevels: [
        {
          level: 'L1',
          backend: 'memory',
          ttlSeconds: 300,
          maxSizeMb: 100,
          evictionPolicy: 'lru'
        },
        {
          level: 'L2',
          backend: 'redis',
          ttlSeconds: 3600,
          maxSizeMb: 500,
          evictionPolicy: 'lru'
        }
      ],
      cacheWarming: {
        enabled: true,
        strategies: ['preload_frequent', 'background_refresh']
      }
    };
  }

  // 私有方法
  private initializeCacheLevels(): void {
    this.caches.clear();
    this.statistics.levelStatistics = {};

    for (const level of this.config.cacheLevels || []) {
      this.caches.set(level.level, new Map());
      this.statistics.levelStatistics[level.level] = {
        items: 0,
        sizeBytes: 0,
        hits: 0,
        misses: 0,
        evictions: 0
      };
    }
  }

  private isExpired(item: CacheItem): boolean {
    const now = new Date();
    const expireTime = new Date(item.timestamp.getTime() + item.ttl * 1000);
    return now > expireTime;
  }

  private calculateSize(value: unknown): number {
    // 简单的大小估算
    const str = JSON.stringify(value);
    return new Blob([str]).size;
  }

  private selectCacheLevel(size: number): CacheLevel | null {
    // 选择第一个能容纳该大小的缓存级别
    for (const level of this.config.cacheLevels || []) {
      const maxSize = (level.maxSizeMb || 100) * 1024 * 1024;
      if (size <= maxSize * 0.1) { // 单个项目不应超过缓存容量的10%
        return level;
      }
    }
    // 如果没有合适的级别，返回最大的级别
    if (this.config.cacheLevels && this.config.cacheLevels.length > 0) {
      return this.config.cacheLevels[this.config.cacheLevels.length - 1];
    }
    return null;
  }

  private async evictIfNecessary(level: CacheLevel, newItemSize: number): Promise<void> {
    const cache = this.caches.get(level.level);
    if (!cache) return;

    const maxSize = (level.maxSizeMb || 100) * 1024 * 1024;
    const currentSize = this.statistics.levelStatistics[level.level]?.sizeBytes || 0;

    // 如果缓存大小限制很小，强制触发驱逐
    if (currentSize + newItemSize > maxSize || (level.maxSizeMb && level.maxSizeMb < 1 && cache.size > 0)) {
      const evictionPolicy = level.evictionPolicy || 'lru';
      await this.performEviction(cache, level.level, evictionPolicy, newItemSize);
    }
  }

  private async performEviction(cache: Map<string, CacheItem>, levelName: string, policy: EvictionPolicy, requiredSpace: number): Promise<void> {
    const items = Array.from(cache.values());
    let freedSpace = 0;

    // 根据策略排序
    switch (policy) {
      case 'lru':
        items.sort((a, b) => a.lastAccessed.getTime() - b.lastAccessed.getTime());
        break;
      case 'lfu':
        items.sort((a, b) => a.accessCount - b.accessCount);
        break;
      case 'ttl':
        items.sort((a, b) => {
          const aExpire = a.timestamp.getTime() + a.ttl * 1000;
          const bExpire = b.timestamp.getTime() + b.ttl * 1000;
          return aExpire - bExpire;
        });
        break;
      case 'random':
        for (let i = items.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [items[i], items[j]] = [items[j], items[i]];
        }
        break;
    }

    // 驱逐项目直到有足够空间
    for (const item of items) {
      if (freedSpace >= requiredSpace) break;

      cache.delete(item.key);
      freedSpace += item.size;
      
      this.statistics.totalItems--;
      this.statistics.totalSizeBytes -= item.size;
      this.statistics.evictionCount++;
      this.updateLevelStatistics(levelName, 'eviction', -item.size);
    }
  }

  private updateLevelStatistics(level: string, operation: 'hit' | 'miss' | 'set' | 'delete' | 'eviction', sizeChange: number = 0): void {
    if (!this.statistics.levelStatistics[level]) {
      this.statistics.levelStatistics[level] = {
        items: 0,
        sizeBytes: 0,
        hits: 0,
        misses: 0,
        evictions: 0
      };
    }

    const stats = this.statistics.levelStatistics[level];
    
    switch (operation) {
      case 'hit':
        stats.hits++;
        break;
      case 'miss':
        stats.misses++;
        break;
      case 'set':
        stats.items++;
        stats.sizeBytes += sizeChange;
        break;
      case 'delete':
        stats.items--;
        stats.sizeBytes += sizeChange; // sizeChange is negative
        break;
      case 'eviction':
        stats.evictions++;
        stats.items--;
        stats.sizeBytes += sizeChange; // sizeChange is negative
        break;
    }
  }

  private resetLevelStatistics(level: string): void {
    this.statistics.levelStatistics[level] = {
      items: 0,
      sizeBytes: 0,
      hits: 0,
      misses: 0,
      evictions: 0
    };
  }

  private updateHitRate(): void {
    const total = this.statistics.hitCount + this.statistics.missCount;
    this.statistics.hitRate = total > 0 ? this.statistics.hitCount / total : 0;
  }
}
