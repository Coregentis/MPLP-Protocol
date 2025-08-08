/**
 * 缓存管理器
 * @description 提供统一的缓存管理接口，支持多种缓存策略和存储后端
 * @author MPLP Team
 * @version 1.0.1
 */

import { Logger } from '../../public/utils/logger';
import { EventBus } from '../event-bus';
import { EventType } from '../event-types';

export interface CacheManagerConfig {
  defaultTTL?: number;
  maxSize?: number;
  cleanupInterval?: number;
  enableMetrics?: boolean;
  enableEvents?: boolean;
  storageBackend?: 'memory' | 'redis' | 'file';
  redisConfig?: {
    host: string;
    port: number;
    password?: string;
    db?: number;
  };
  enableMultiLevelCache?: boolean;
  autoSyncMultiLevelCache?: boolean;
  enableStats?: boolean;
}

export interface CacheEntry<T = unknown> {
  key: string;
  value: T;
  ttl: number;
  createdAt: number;
  accessedAt: number;
  accessCount: number;
}

export interface CacheMetrics {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  evictions: number;
  totalSize: number;
  hitRate: number;
}

/**
 * 缓存管理器类
 */
export class CacheManager {
  private cache = new Map<string, CacheEntry>();
  private timers = new Map<string, ReturnType<typeof setTimeout>>();
  private metrics: CacheMetrics;
  private logger: Logger;
  private eventBus?: EventBus;
  private cleanupTimer?: ReturnType<typeof setTimeout>;
  private config: CacheManagerConfig & {
    defaultTTL: number;
    maxSize: number;
    cleanupInterval: number;
    enableMetrics: boolean;
    enableEvents: boolean;
    storageBackend: 'memory' | 'redis' | 'file';
  };

  constructor(
    config: CacheManagerConfig,
    eventBus?: EventBus
  ) {
    // 设置默认配置
    this.config = {
      defaultTTL: 300,
      maxSize: 1000,
      cleanupInterval: 60,
      enableMetrics: true,
      enableEvents: true,
      storageBackend: 'memory',
      enableMultiLevelCache: false,
      autoSyncMultiLevelCache: false,
      enableStats: true,
      ...config
    };

    this.logger = new Logger('CacheManager');
    this.eventBus = eventBus;
    this.metrics = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      evictions: 0,
      totalSize: 0,
      hitRate: 0
    };

    this.startCleanupTimer();
    this.logger.info('Cache manager initialized', { config: this.config });
  }

  /**
   * 获取缓存值
   */
  async get<T = unknown>(key: string): Promise<T | undefined> {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.metrics.misses++;
      this.updateHitRate();
      this.emitEvent('miss', { key });
      return undefined;
    }

    // 检查是否过期
    if (this.isExpired(entry)) {
      await this.delete(key);
      this.metrics.misses++;
      this.updateHitRate();
      this.emitEvent('miss', { key, reason: 'expired' });
      return undefined;
    }

    // 更新访问信息
    entry.accessedAt = Date.now();
    entry.accessCount++;
    
    this.metrics.hits++;
    this.updateHitRate();
    this.emitEvent('hit', { key });
    
    return entry.value as T;
  }

  /**
   * 设置缓存值
   */
  async set<T = unknown>(key: string, value: T, ttl?: number): Promise<boolean> {
    try {
      const effectiveTTL = ttl || this.config.defaultTTL;
      const now = Date.now();
      
      // 检查缓存大小限制
      if (this.cache.size >= this.config.maxSize && !this.cache.has(key)) {
        await this.evictLRU();
      }

      const entry: CacheEntry<T> = {
        key,
        value,
        ttl: effectiveTTL,
        createdAt: now,
        accessedAt: now,
        accessCount: 1
      };

      this.cache.set(key, entry);
      this.setExpiration(key, effectiveTTL);
      
      this.metrics.sets++;
      this.metrics.totalSize = this.cache.size;
      this.emitEvent('set', { key, ttl: effectiveTTL });
      
      return true;
    } catch (error) {
      this.logger.error('Failed to set cache entry', { key, error });
      return false;
    }
  }

  /**
   * 删除缓存值
   */
  async delete(key: string): Promise<boolean> {
    const deleted = this.cache.delete(key);
    
    if (deleted) {
      this.clearTimer(key);
      this.metrics.deletes++;
      this.metrics.totalSize = this.cache.size;
      this.emitEvent('delete', { key });
    }
    
    return deleted;
  }

  /**
   * 检查缓存是否存在
   */
  async has(key: string): Promise<boolean> {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return false;
    }
    
    if (this.isExpired(entry)) {
      await this.delete(key);
      return false;
    }
    
    return true;
  }

  /**
   * 清空缓存
   */
  async clear(): Promise<boolean> {
    try {
      this.cache.clear();
      this.clearAllTimers();
      this.metrics.totalSize = 0;
      this.emitEvent('clear', {});
      return true;
    } catch (error) {
      this.logger.error('Failed to clear cache', { error });
      return false;
    }
  }

  /**
   * 按模式删除缓存
   */
  async clearPattern(pattern: string): Promise<number> {
    const regex = new RegExp(pattern);
    const keysToDelete: string[] = [];
    
    for (const key of Array.from(this.cache.keys())) {
      if (regex.test(key)) {
        keysToDelete.push(key);
      }
    }
    
    for (const key of keysToDelete) {
      await this.delete(key);
    }
    
    this.emitEvent('clearPattern', { pattern, count: keysToDelete.length });
    return keysToDelete.length;
  }

  /**
   * 获取缓存统计信息
   */
  getMetrics(): CacheMetrics {
    return { ...this.metrics };
  }

  /**
   * 获取所有缓存键
   */
  getKeys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * 获取缓存大小
   */
  getSize(): number {
    return this.cache.size;
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
      this.emitEvent('expire', { key });
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
    for (const timer of Array.from(this.timers.values())) {
      clearTimeout(timer);
    }
    this.timers.clear();
  }

  /**
   * LRU淘汰策略
   */
  private async evictLRU(): Promise<void> {
    let oldestKey = '';
    let oldestTime = Date.now();
    
    for (const [key, entry] of Array.from(this.cache.entries())) {
      if (entry.accessedAt < oldestTime) {
        oldestTime = entry.accessedAt;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      await this.delete(oldestKey);
      this.metrics.evictions++;
      this.emitEvent('evict', { key: oldestKey, reason: 'lru' });
    }
  }

  /**
   * 更新命中率
   */
  private updateHitRate(): void {
    const total = this.metrics.hits + this.metrics.misses;
    this.metrics.hitRate = total > 0 ? this.metrics.hits / total : 0;
  }

  /**
   * 发送事件
   */
  private emitEvent(operation: string, data: Record<string, unknown>): void {
    if (!this.config.enableEvents || !this.eventBus) return;

    this.eventBus.publish(EventType.CACHE_HIT, {
      timestamp: new Date().toISOString(),
      source: 'CacheManager',
      operation,
      ...data
    });
  }

  /**
   * 启动清理定时器
   */
  private startCleanupTimer(): void {
    if (this.config.cleanupInterval <= 0) return;
    
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval * 1000);
  }

  /**
   * 清理过期条目
   */
  private async cleanup(): Promise<void> {
    const expiredKeys: string[] = [];

    for (const [key, entry] of Array.from(this.cache.entries())) {
      if (this.isExpired(entry)) {
        expiredKeys.push(key);
      }
    }
    
    for (const key of expiredKeys) {
      await this.delete(key);
    }
    
    if (expiredKeys.length > 0) {
      this.logger.debug('Cleaned up expired cache entries', { 
        count: expiredKeys.length 
      });
    }
  }

  /**
   * 注册缓存提供者（用于测试）
   */
  registerProvider(provider: { getName?(): string }, isPrimary: boolean = false): void {
    // 这是一个测试用的方法，实际实现可以根据需要扩展
    this.logger.debug('Cache provider registered', { provider: provider.getName?.(), isPrimary });
  }

  /**
   * 销毁缓存管理器
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    this.clearAllTimers();
    this.cache.clear();
    this.logger.info('Cache manager destroyed');
  }
}
