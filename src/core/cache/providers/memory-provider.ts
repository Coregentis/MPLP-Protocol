/**
 * MPLP内存缓存提供者
 *
 * 提供基于内存的缓存实现，适用于高性能、非持久化的缓存需求。
 * 实现ICacheProvider接口，支持TTL、标签、命名空间等功能。
 *
 * @version v1.0.0
 * @created 2025-07-18T09:30:00+08:00
 */

import { performance } from 'perf_hooks';
import {
  ICacheProvider,
  CacheItemOptions,
  CacheStats,
  CacheLevel
} from '../interfaces';

/**
 * 内存缓存项
 */
interface MemoryCacheItem<T = any> {
  /**
   * 缓存值
   */
  value: T;

  /**
   * 过期时间戳
   */
  expireAt?: number;

  /**
   * 最大空闲时间戳
   */
  maxIdleAt?: number;

  /**
   * 最后访问时间戳
   */
  lastAccessedAt: number;

  /**
   * 创建时间戳
   */
  createdAt: number;

  /**
   * 访问次数
   */
  accessCount: number;

  /**
   * 缓存标签
   */
  tags?: string[];

  /**
   * 命名空间
   */
  namespace?: string;

  /**
   * 元数据
   */
  metadata?: Record<string, any>;
}

/**
 * 内存缓存提供者配置
 */
export interface MemoryCacheProviderConfig {
  /**
   * 提供者名称
   */
  name?: string;

  /**
   * 默认过期时间（毫秒）
   */
  defaultTtl?: number;

  /**
   * 默认最大空闲时间（毫秒）
   */
  defaultMaxIdleTime?: number;

  /**
   * 最大缓存项数量
   */
  maxItems?: number;

  /**
   * 最大缓存大小（字节）
   */
  maxSize?: number;

  /**
   * 清理间隔（毫秒）
   */
  cleanupInterval?: number;

  /**
   * 是否启用统计
   */
  enableStats?: boolean;

  /**
   * 驱逐策略
   */
  evictionPolicy?: 'lru' | 'lfu' | 'fifo' | 'random';
}

/**
 * 内存缓存提供者
 */
export class MemoryCacheProvider<T = any> implements ICacheProvider<T> {
  private cache: Map<string, MemoryCacheItem<T>> = new Map();
  private tagIndex: Map<string, Set<string>> = new Map();
  private namespaceIndex: Map<string, Set<string>> = new Map();
  private cleanupTimer?: NodeJS.Timeout;
  private stats: CacheStats;
  private config: Required<MemoryCacheProviderConfig>;
  private name: string;

  /**
   * 创建内存缓存提供者
   * @param config 配置
   */
  constructor(config?: MemoryCacheProviderConfig) {
    this.config = {
      name: config?.name || 'memory-cache',
      defaultTtl: config?.defaultTtl || 60000, // 1分钟
      defaultMaxIdleTime: config?.defaultMaxIdleTime || 300000, // 5分钟
      maxItems: config?.maxItems || 10000,
      maxSize: config?.maxSize || 104857600, // 100MB
      cleanupInterval: config?.cleanupInterval || 60000, // 1分钟
      enableStats: config?.enableStats !== undefined ? config.enableStats : true,
      evictionPolicy: config?.evictionPolicy || 'lru'
    };

    this.name = this.config.name;
    this.stats = this.createEmptyStats();

    // 启动定期清理
    if (this.config.cleanupInterval > 0) {
      this.cleanupTimer = setInterval(() => {
        this.cleanup();
      }, this.config.cleanupInterval);
    }
  }

  /**
   * 获取缓存项
   * @param key 缓存键
   * @returns 缓存值或undefined
   */
  public async get(key: string): Promise<T | undefined> {
    const startTime = performance.now();
    const item = this.cache.get(key);

    if (!item) {
      if (this.config.enableStats) {
        this.stats.misses++;
        this.updateHitRatio();
      }
      return undefined;
    }

    // 检查是否过期
    if (this.isExpired(item)) {
      this.delete(key);
      if (this.config.enableStats) {
        this.stats.misses++;
        this.updateHitRatio();
      }
      return undefined;
    }

    // 更新访问统计
    item.lastAccessedAt = Date.now();
    item.accessCount++;

    // 更新最大空闲时间
    if (item.maxIdleAt !== undefined) {
      item.maxIdleAt = Date.now() + (this.config.defaultMaxIdleTime || 0);
    }

    if (this.config.enableStats) {
      this.stats.hits++;
      this.updateHitRatio();
      this.stats.avgAccessTime = (this.stats.avgAccessTime * (this.stats.hits - 1) + (performance.now() - startTime)) / this.stats.hits;

      // 更新命名空间统计
      if (item.namespace && this.stats.namespaceStats) {
        const nsStats = this.stats.namespaceStats[item.namespace] || this.createEmptyStats();
        nsStats.hits++;
        nsStats.hitRatio = nsStats.hits / (nsStats.hits + nsStats.misses);
        this.stats.namespaceStats[item.namespace] = nsStats;
      }
    }

    return item.value;
  }

  /**
   * 设置缓存项
   * @param key 缓存键
   * @param value 缓存值
   * @param options 缓存选项
   * @returns 是否成功
   */
  public async set(key: string, value: T, options?: Partial<CacheItemOptions>): Promise<boolean> {
    // 检查容量限制
    if (this.cache.size >= this.config.maxItems) {
      this.evict();
    }

    const now = Date.now();
    const ttl = options?.ttl || this.config.defaultTtl;
    const maxIdleTime = options?.maxIdleTime || this.config.defaultMaxIdleTime;
    const namespace = options?.namespace;
    const tags = options?.tags || [];

    const item: MemoryCacheItem<T> = {
      value,
      expireAt: ttl > 0 ? now + ttl : undefined,
      maxIdleAt: maxIdleTime > 0 ? now + maxIdleTime : undefined,
      lastAccessedAt: now,
      createdAt: now,
      accessCount: 0,
      tags,
      namespace,
      metadata: options?.metadata
    };

    // 存储缓存项
    this.cache.set(key, item);

    // 更新标签索引
    for (const tag of tags) {
      if (!this.tagIndex.has(tag)) {
        this.tagIndex.set(tag, new Set());
      }
      this.tagIndex.get(tag)?.add(key);
    }

    // 更新命名空间索引
    if (namespace) {
      if (!this.namespaceIndex.has(namespace)) {
        this.namespaceIndex.set(namespace, new Set());
      }
      this.namespaceIndex.get(namespace)?.add(key);
    }

    // 更新统计
    if (this.config.enableStats) {
      this.stats.itemCount = this.cache.size;
      
      // 估计大小（简单实现，实际应用可能需要更精确的计算）
      const itemSize = this.estimateSize(key, value);
      this.stats.size += itemSize;

      // 更新命名空间统计
      if (namespace && this.stats.namespaceStats) {
        const nsStats = this.stats.namespaceStats[namespace] || this.createEmptyStats();
        nsStats.itemCount++;
        nsStats.size += itemSize;
        this.stats.namespaceStats[namespace] = nsStats;
      }
    }

    return true;
  }

  /**
   * 检查缓存项是否存在
   * @param key 缓存键
   * @returns 是否存在
   */
  public async has(key: string): Promise<boolean> {
    const item = this.cache.get(key);
    if (!item) return false;
    
    // 检查是否过期
    if (this.isExpired(item)) {
      this.delete(key);
      return false;
    }
    
    return true;
  }

  /**
   * 删除缓存项
   * @param key 缓存键
   * @returns 是否成功
   */
  public async delete(key: string): Promise<boolean> {
    const item = this.cache.get(key);
    if (!item) return false;

    // 从标签索引中移除
    if (item.tags) {
      for (const tag of item.tags) {
        const keys = this.tagIndex.get(tag);
        if (keys) {
          keys.delete(key);
          if (keys.size === 0) {
            this.tagIndex.delete(tag);
          }
        }
      }
    }

    // 从命名空间索引中移除
    if (item.namespace) {
      const keys = this.namespaceIndex.get(item.namespace);
      if (keys) {
        keys.delete(key);
        if (keys.size === 0) {
          this.namespaceIndex.delete(item.namespace);
        }
      }
    }

    // 更新统计
    if (this.config.enableStats) {
      this.stats.itemCount = this.cache.size - 1;
      const itemSize = this.estimateSize(key, item.value);
      this.stats.size -= itemSize;

      // 更新命名空间统计
      if (item.namespace && this.stats.namespaceStats) {
        const nsStats = this.stats.namespaceStats[item.namespace];
        if (nsStats) {
          nsStats.itemCount--;
          nsStats.size -= itemSize;
          if (nsStats.itemCount <= 0) {
            delete this.stats.namespaceStats[item.namespace];
          } else {
            this.stats.namespaceStats[item.namespace] = nsStats;
          }
        }
      }
    }

    // 从缓存中移除
    return this.cache.delete(key);
  }

  /**
   * 按标签删除缓存项
   * @param tag 标签
   * @returns 删除的项数
   */
  public async deleteByTag(tag: string): Promise<number> {
    const keys = this.tagIndex.get(tag);
    if (!keys || keys.size === 0) return 0;

    const keysArray = Array.from(keys);
    let deletedCount = 0;

    for (const key of keysArray) {
      const success = await this.delete(key);
      if (success) deletedCount++;
    }

    return deletedCount;
  }

  /**
   * 清空所有缓存
   * @param namespace 可选命名空间
   * @returns 是否成功
   */
  public async clear(namespace?: string): Promise<boolean> {
    if (namespace) {
      const keys = this.namespaceIndex.get(namespace);
      if (!keys || keys.size === 0) return false;

      const keysArray = Array.from(keys);
      for (const key of keysArray) {
        await this.delete(key);
      }

      return true;
    }

    // 清空所有缓存
    this.cache.clear();
    this.tagIndex.clear();
    this.namespaceIndex.clear();

    // 重置统计
    if (this.config.enableStats) {
      this.stats = this.createEmptyStats();
    }

    return true;
  }

  /**
   * 获取缓存统计信息
   * @returns 统计信息
   */
  public async getStats(): Promise<CacheStats> {
    return { ...this.stats };
  }

  /**
   * 获取多个缓存项
   * @param keys 缓存键数组
   * @returns 键值对映射
   */
  public async mget(keys: string[]): Promise<Map<string, T>> {
    const result = new Map<string, T>();
    
    for (const key of keys) {
      const value = await this.get(key);
      if (value !== undefined) {
        result.set(key, value);
      }
    }
    
    return result;
  }

  /**
   * 设置多个缓存项
   * @param items 键值对映射
   * @param options 缓存选项
   * @returns 是否成功
   */
  public async mset(items: Map<string, T>, options?: Partial<CacheItemOptions>): Promise<boolean> {
    let success = true;
    
    for (const [key, value] of items.entries()) {
      const result = await this.set(key, value, options);
      if (!result) success = false;
    }
    
    return success;
  }

  /**
   * 获取缓存提供者名称
   * @returns 提供者名称
   */
  public getName(): string {
    return this.name;
  }

  /**
   * 获取缓存层级
   * @returns 缓存层级
   */
  public getLevel(): CacheLevel {
    return CacheLevel.MEMORY;
  }

  /**
   * 销毁缓存提供者
   */
  public destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    
    this.cache.clear();
    this.tagIndex.clear();
    this.namespaceIndex.clear();
  }

  /**
   * 清理过期项
   * @returns 清理的项数
   */
  private cleanup(): number {
    let cleanedCount = 0;
    const now = Date.now();
    
    for (const [key, item] of this.cache.entries()) {
      if (
        (item.expireAt !== undefined && item.expireAt <= now) ||
        (item.maxIdleAt !== undefined && item.maxIdleAt <= now)
      ) {
        this.delete(key);
        cleanedCount++;
        
        if (this.config.enableStats) {
          this.stats.expiredCount++;
        }
      }
    }
    
    return cleanedCount;
  }

  /**
   * 驱逐缓存项
   * @returns 是否成功
   */
  private evict(): boolean {
    if (this.cache.size === 0) return false;
    
    let keyToEvict: string | undefined;
    
    switch (this.config.evictionPolicy) {
      case 'lru': // 最近最少使用
        keyToEvict = this.findLRUKey();
        break;
      case 'lfu': // 最不经常使用
        keyToEvict = this.findLFUKey();
        break;
      case 'fifo': // 先进先出
        keyToEvict = this.findFIFOKey();
        break;
      case 'random': // 随机
        keyToEvict = this.findRandomKey();
        break;
      default:
        keyToEvict = this.findLRUKey();
    }
    
    if (keyToEvict) {
      this.delete(keyToEvict);
      
      if (this.config.enableStats) {
        this.stats.evictedCount++;
      }
      
      return true;
    }
    
    return false;
  }

  /**
   * 查找最近最少使用的键
   * @returns 键
   */
  private findLRUKey(): string | undefined {
    let oldestAccess = Infinity;
    let oldestKey: string | undefined;
    
    for (const [key, item] of this.cache.entries()) {
      if (item.lastAccessedAt < oldestAccess) {
        oldestAccess = item.lastAccessedAt;
        oldestKey = key;
      }
    }
    
    return oldestKey;
  }

  /**
   * 查找最不经常使用的键
   * @returns 键
   */
  private findLFUKey(): string | undefined {
    let lowestCount = Infinity;
    let lfuKey: string | undefined;
    
    for (const [key, item] of this.cache.entries()) {
      if (item.accessCount < lowestCount) {
        lowestCount = item.accessCount;
        lfuKey = key;
      }
    }
    
    return lfuKey;
  }

  /**
   * 查找最早创建的键
   * @returns 键
   */
  private findFIFOKey(): string | undefined {
    let earliestCreation = Infinity;
    let earliestKey: string | undefined;
    
    for (const [key, item] of this.cache.entries()) {
      if (item.createdAt < earliestCreation) {
        earliestCreation = item.createdAt;
        earliestKey = key;
      }
    }
    
    return earliestKey;
  }

  /**
   * 查找随机键
   * @returns 键
   */
  private findRandomKey(): string | undefined {
    const keys = Array.from(this.cache.keys());
    if (keys.length === 0) return undefined;
    
    const randomIndex = Math.floor(Math.random() * keys.length);
    return keys[randomIndex];
  }

  /**
   * 检查缓存项是否过期
   * @param item 缓存项
   * @returns 是否过期
   */
  private isExpired(item: MemoryCacheItem<T>): boolean {
    const now = Date.now();
    
    return (
      (item.expireAt !== undefined && item.expireAt <= now) ||
      (item.maxIdleAt !== undefined && item.maxIdleAt <= now)
    );
  }

  /**
   * 更新命中率
   */
  private updateHitRatio(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRatio = total > 0 ? this.stats.hits / total : 0;
  }

  /**
   * 创建空统计信息
   * @returns 统计信息
   */
  private createEmptyStats(): CacheStats {
    return {
      hits: 0,
      misses: 0,
      hitRatio: 0,
      itemCount: 0,
      size: 0,
      avgAccessTime: 0,
      expiredCount: 0,
      evictedCount: 0,
      namespaceStats: {}
    };
  }

  /**
   * 估计缓存项大小
   * @param key 键
   * @param value 值
   * @returns 大小（字节）
   */
  private estimateSize(key: string, value: T): number {
    // 键的大小（每个字符2字节）
    const keySize = key.length * 2;
    
    // 值的大小（简单估计）
    let valueSize = 0;
    
    if (value === null || value === undefined) {
      valueSize = 4;
    } else if (typeof value === 'boolean') {
      valueSize = 4;
    } else if (typeof value === 'number') {
      valueSize = 8;
    } else if (typeof value === 'string') {
      valueSize = (value as string).length * 2;
    } else if (value instanceof Date) {
      valueSize = 8;
    } else if (Array.isArray(value)) {
      valueSize = 40 + JSON.stringify(value).length * 2;
    } else if (typeof value === 'object') {
      valueSize = 40 + JSON.stringify(value).length * 2;
    } else {
      valueSize = 8;
    }
    
    // 元数据开销（估计）
    const overhead = 40;
    
    return keySize + valueSize + overhead;
  }
} 