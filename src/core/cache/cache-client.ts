/**
 * MPLP缓存客户端
 *
 * 提供简单易用的API，用于缓存数据的存取和管理。
 * 实现ICacheClient接口，封装缓存管理器和策略的使用。
 *
 * @version v1.0.0
 * @created 2025-07-18T11:00:00+08:00
 */

import {
  ICacheClient,
  ICacheManager,
  CacheItemOptions,
  CacheStrategy,
  CacheLevel,
  CacheStats
} from './interfaces';
import { createCacheStrategy } from './strategies/cache-strategies';

/**
 * 缓存客户端配置
 */
export interface CacheClientConfig {
  /**
   * 默认缓存策略
   */
  defaultStrategy?: CacheStrategy;

  /**
   * 默认缓存选项
   */
  defaultOptions?: Partial<CacheItemOptions>;

  /**
   * 启用日志
   */
  enableLogging?: boolean;

  /**
   * 日志级别
   */
  logLevel?: 'debug' | 'info' | 'warn' | 'error' | 'none';
}

/**
 * 缓存客户端
 */
export class CacheClient implements ICacheClient {
  private cacheManager: ICacheManager;
  private config: Required<CacheClientConfig>;

  /**
   * 创建缓存客户端
   * @param cacheManager 缓存管理器
   * @param config 配置
   */
  constructor(cacheManager: ICacheManager, config?: CacheClientConfig) {
    this.cacheManager = cacheManager;
    this.config = {
      defaultStrategy: config?.defaultStrategy || CacheStrategy.CACHE_FIRST,
      defaultOptions: config?.defaultOptions || {},
      enableLogging: config?.enableLogging !== undefined ? config.enableLogging : true,
      logLevel: config?.logLevel || 'info'
    };
  }

  /**
   * 获取缓存项，如果不存在则获取并缓存
   * @param key 缓存键
   * @param fetchFn 获取源数据的函数
   * @param options 缓存选项
   * @returns 数据
   */
  public async getOrFetch<T = any>(
    key: string,
    fetchFn: () => Promise<T>,
    options?: Partial<CacheItemOptions>
  ): Promise<T> {
    return this.getWithStrategy<T>(
      this.config.defaultStrategy,
      key,
      fetchFn,
      this.mergeOptions(options)
    );
  }

  /**
   * 使用特定策略获取缓存项
   * @param strategy 缓存策略
   * @param key 缓存键
   * @param fetchFn 获取源数据的函数
   * @param options 缓存选项
   * @returns 数据
   */
  public async getWithStrategy<T = any>(
    strategy: CacheStrategy,
    key: string,
    fetchFn: () => Promise<T>,
    options?: Partial<CacheItemOptions>
  ): Promise<T> {
    const cacheStrategy = createCacheStrategy(strategy, this.cacheManager);
    const mergedOptions = this.mergeOptions(options);
    
    this.log('debug', `Using strategy "${strategy}" to get key "${key}"`);
    
    try {
      const result = await cacheStrategy.execute<T>(key, fetchFn, mergedOptions);
      return result;
    } catch (error) {
      this.log('error', `Error executing strategy "${strategy}" for key "${key}": ${error}`);
      throw error;
    }
  }

  /**
   * 获取缓存项
   * @param key 缓存键
   * @param options 缓存选项
   * @returns 缓存值或undefined
   */
  public async get<T = any>(key: string, options?: Partial<CacheItemOptions>): Promise<T | undefined> {
    const mergedOptions = this.mergeOptions(options);
    
    this.log('debug', `Getting key "${key}" from cache`);
    
    try {
      return await this.cacheManager.get<T>(key, mergedOptions);
    } catch (error) {
      this.log('error', `Error getting key "${key}" from cache: ${error}`);
      throw error;
    }
  }

  /**
   * 设置缓存项
   * @param key 缓存键
   * @param value 缓存值
   * @param options 缓存选项
   * @returns 是否成功
   */
  public async set<T = any>(key: string, value: T, options?: Partial<CacheItemOptions>): Promise<boolean> {
    const mergedOptions = this.mergeOptions(options);
    
    this.log('debug', `Setting key "${key}" in cache`);
    
    try {
      return await this.cacheManager.set(key, value, mergedOptions);
    } catch (error) {
      this.log('error', `Error setting key "${key}" in cache: ${error}`);
      throw error;
    }
  }

  /**
   * 删除缓存项
   * @param key 缓存键
   * @param options 缓存选项
   * @returns 是否成功
   */
  public async delete(key: string, options?: Partial<CacheItemOptions>): Promise<boolean> {
    const mergedOptions = this.mergeOptions(options);
    
    this.log('debug', `Deleting key "${key}" from cache`);
    
    try {
      return await this.cacheManager.delete(key, mergedOptions);
    } catch (error) {
      this.log('error', `Error deleting key "${key}" from cache: ${error}`);
      throw error;
    }
  }

  /**
   * 按标签删除缓存项
   * @param tag 标签
   * @param level 可选缓存层级
   * @returns 删除的项数
   */
  public async deleteByTag(tag: string, level?: CacheLevel): Promise<number> {
    this.log('debug', `Deleting items with tag "${tag}" from cache`);
    
    try {
      let deletedCount = 0;
      
      if (level) {
        // 如果指定了层级，只从该层级删除
        const provider = this.cacheManager.getProviderByLevel(level);
        if (provider) {
          deletedCount = await provider.deleteByTag(tag);
        }
      } else {
        // 从所有提供者删除
        const providers = this.cacheManager.getAllProviders();
        for (const provider of providers) {
          const count = await provider.deleteByTag(tag);
          deletedCount += count;
        }
      }
      
      return deletedCount;
    } catch (error) {
      this.log('error', `Error deleting items with tag "${tag}" from cache: ${error}`);
      throw error;
    }
  }

  /**
   * 清空缓存
   * @param namespace 可选命名空间
   * @param level 可选缓存层级
   * @returns 是否成功
   */
  public async clear(namespace?: string, level?: CacheLevel): Promise<boolean> {
    this.log('debug', `Clearing cache${namespace ? ` for namespace "${namespace}"` : ''}${level ? ` at level "${level}"` : ''}`);
    
    try {
      return await this.cacheManager.clear(namespace, level);
    } catch (error) {
      this.log('error', `Error clearing cache: ${error}`);
      throw error;
    }
  }

  /**
   * 获取缓存统计信息
   * @returns 统计信息
   */
  public async getStats(): Promise<Record<string, CacheStats>> {
    this.log('debug', 'Getting cache statistics');
    
    try {
      return await this.cacheManager.getAllStats();
    } catch (error) {
      this.log('error', `Error getting cache statistics: ${error}`);
      throw error;
    }
  }

  /**
   * 合并缓存选项
   * @param options 用户提供的选项
   * @returns 合并后的选项
   */
  private mergeOptions(options?: Partial<CacheItemOptions>): Partial<CacheItemOptions> {
    return {
      ...this.config.defaultOptions,
      ...options
    };
  }

  /**
   * 记录日志
   * @param level 日志级别
   * @param message 日志消息
   */
  private log(level: 'debug' | 'info' | 'warn' | 'error', message: string): void {
    if (!this.config.enableLogging) return;
    
    const logLevels = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
      none: 4
    };

    if (logLevels[level] >= logLevels[this.config.logLevel]) {
      const timestamp = new Date().toISOString();
      const prefix = `[${timestamp}] [CacheClient] [${level.toUpperCase()}]`;
      
      switch (level) {
        case 'debug':
          console.debug(`${prefix} ${message}`);
          break;
        case 'info':
          console.info(`${prefix} ${message}`);
          break;
        case 'warn':
          console.warn(`${prefix} ${message}`);
          break;
        case 'error':
          console.error(`${prefix} ${message}`);
          break;
      }
    }
  }
} 