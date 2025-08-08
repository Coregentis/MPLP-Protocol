/**
 * 缓存客户端
 * @description 提供简化的缓存操作接口，封装缓存管理器的复杂性
 * @author MPLP Team
 * @version 1.0.1
 */

import { Logger } from '../../public/utils/logger';
import { CacheManager, CacheManagerConfig } from './cache-manager';

export interface CacheClientConfig {
  namespace?: string;
  defaultTTL?: number;
  keyPrefix?: string;
  enableCompression?: boolean;
  enableSerialization?: boolean;
}

export interface CacheOptions {
  ttl?: number;
  tags?: string[];
  compress?: boolean;
  serialize?: boolean;
}

/**
 * 缓存客户端类
 */
export class CacheClient {
  private logger: Logger;
  private keyPrefix: string;

  constructor(
    private cacheManager: CacheManager,
    private config: CacheClientConfig = {}
  ) {
    this.logger = new Logger('CacheClient');
    this.keyPrefix = config.keyPrefix || (config.namespace ? `${config.namespace}:` : '');
    
    this.logger.info('Cache client initialized', { config });
  }

  /**
   * 获取缓存值
   */
  async get<T = unknown>(key: string): Promise<T | null> {
    try {
      const fullKey = this.buildKey(key);
      const value = await this.cacheManager.get<string>(fullKey);
      
      if (value === undefined) {
        return null;
      }
      
      return this.deserialize<T>(value);
    } catch (error) {
      this.logger.error('Failed to get cache value', { key, error });
      return null;
    }
  }

  /**
   * 设置缓存值
   */
  async set<T = unknown>(key: string, value: T, options: CacheOptions = {}): Promise<boolean> {
    try {
      const fullKey = this.buildKey(key);
      const serializedValue = this.serialize(value);
      const ttl = options.ttl || this.config.defaultTTL;
      
      return await this.cacheManager.set(fullKey, serializedValue, ttl);
    } catch (error) {
      this.logger.error('Failed to set cache value', { key, error });
      return false;
    }
  }

  /**
   * 删除缓存值
   */
  async delete(key: string): Promise<boolean> {
    try {
      const fullKey = this.buildKey(key);
      return await this.cacheManager.delete(fullKey);
    } catch (error) {
      this.logger.error('Failed to delete cache value', { key, error });
      return false;
    }
  }

  /**
   * 检查缓存是否存在
   */
  async has(key: string): Promise<boolean> {
    try {
      const fullKey = this.buildKey(key);
      return await this.cacheManager.has(fullKey);
    } catch (error) {
      this.logger.error('Failed to check cache existence', { key, error });
      return false;
    }
  }

  /**
   * 获取或设置缓存值
   */
  async getOrSet<T = unknown>(
    key: string, 
    factory: () => Promise<T> | T, 
    options: CacheOptions = {}
  ): Promise<T | null> {
    try {
      // 先尝试获取
      let value = await this.get<T>(key);
      
      if (value !== null) {
        return value;
      }
      
      // 缓存未命中，调用工厂函数
      value = await Promise.resolve(factory());
      
      if (value !== null && value !== undefined) {
        await this.set(key, value, options);
      }
      
      return value;
    } catch (error) {
      this.logger.error('Failed to get or set cache value', { key, error });
      return null;
    }
  }

  /**
   * 批量获取
   */
  async mget<T = unknown>(keys: string[]): Promise<Map<string, T | null>> {
    const result = new Map<string, T | null>();
    
    await Promise.all(
      keys.map(async (key) => {
        const value = await this.get<T>(key);
        result.set(key, value);
      })
    );
    
    return result;
  }

  /**
   * 批量设置
   */
  async mset<T = unknown>(entries: Map<string, T>, options: CacheOptions = {}): Promise<boolean[]> {
    const results = await Promise.all(
      Array.from(entries.entries()).map(([key, value]) =>
        this.set(key, value, options)
      )
    );
    
    return results;
  }

  /**
   * 批量删除
   */
  async mdel(keys: string[]): Promise<boolean[]> {
    const results = await Promise.all(
      keys.map(key => this.delete(key))
    );
    
    return results;
  }

  /**
   * 按模式删除
   */
  async deletePattern(pattern: string): Promise<number> {
    try {
      const fullPattern = this.keyPrefix + pattern;
      return await this.cacheManager.clearPattern(fullPattern);
    } catch (error) {
      this.logger.error('Failed to delete by pattern', { pattern, error });
      return 0;
    }
  }

  /**
   * 清空命名空间
   */
  async clear(): Promise<boolean> {
    try {
      if (this.keyPrefix) {
        const count = await this.deletePattern('*');
        return count > 0;
      } else {
        return await this.cacheManager.clear();
      }
    } catch (error) {
      this.logger.error('Failed to clear cache', { error });
      return false;
    }
  }

  /**
   * 获取统计信息
   */
  getStats() {
    return this.cacheManager.getMetrics();
  }

  /**
   * 构建完整的缓存键
   */
  private buildKey(key: string): string {
    return this.keyPrefix + key;
  }

  /**
   * 序列化值
   */
  private serialize<T>(value: T): string {
    if (!this.config.enableSerialization) {
      return String(value);
    }
    
    try {
      return JSON.stringify(value);
    } catch (error) {
      this.logger.warn('Failed to serialize value, using string conversion', { error });
      return String(value);
    }
  }

  /**
   * 反序列化值
   */
  private deserialize<T>(value: string): T {
    if (!this.config.enableSerialization) {
      return value as unknown as T;
    }

    try {
      return JSON.parse(value) as T;
    } catch (error) {
      // 如果解析失败，返回原始字符串
      return value as unknown as T;
    }
  }

  /**
   * 创建带标签的缓存客户端
   */
  withTags(tags: string[]): CacheClient {
    const taggedConfig = {
      ...this.config,
      keyPrefix: this.keyPrefix + `tags:${tags.join(',')}:`
    };
    
    return new CacheClient(this.cacheManager, taggedConfig);
  }

  /**
   * 创建带命名空间的缓存客户端
   */
  withNamespace(namespace: string): CacheClient {
    const namespacedConfig = {
      ...this.config,
      namespace,
      keyPrefix: `${namespace}:`
    };
    
    return new CacheClient(this.cacheManager, namespacedConfig);
  }

  /**
   * 创建带TTL的缓存客户端
   */
  withTTL(ttl: number): CacheClient {
    const ttlConfig = {
      ...this.config,
      defaultTTL: ttl
    };
    
    return new CacheClient(this.cacheManager, ttlConfig);
  }
}

/**
 * 创建默认缓存客户端
 */
export function createCacheClient(
  managerConfig: CacheManagerConfig,
  clientConfig: CacheClientConfig = {}
): CacheClient {
  const manager = new CacheManager(managerConfig);
  return new CacheClient(manager, clientConfig);
}
