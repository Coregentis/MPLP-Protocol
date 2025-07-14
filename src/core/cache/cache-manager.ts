/**
 * MPLP缓存管理器
 *
 * 提供缓存管理功能，包括缓存提供者注册、获取、删除等操作。
 * 实现ICacheManager接口，支持多级缓存和缓存策略。
 *
 * @version v1.0.0
 * @created 2025-07-18T10:00:00+08:00
 */

import {
  ICacheManager,
  ICacheProvider,
  CacheItemOptions,
  CacheStats,
  CacheLevel
} from './interfaces';

/**
 * 缓存管理器配置
 */
export interface CacheManagerConfig {
  /**
   * 默认提供者名称
   */
  defaultProviderName?: string;

  /**
   * 启用多级缓存
   */
  enableMultiLevelCache?: boolean;

  /**
   * 自动同步多级缓存
   */
  autoSyncMultiLevelCache?: boolean;

  /**
   * 启用统计
   */
  enableStats?: boolean;

  /**
   * 日志级别
   */
  logLevel?: 'debug' | 'info' | 'warn' | 'error' | 'none';
}

/**
 * 缓存管理器
 */
export class CacheManager implements ICacheManager {
  private providers: Map<string, ICacheProvider> = new Map();
  private levelProviders: Map<CacheLevel, ICacheProvider[]> = new Map();
  private defaultProviderName?: string;
  private config: Required<CacheManagerConfig>;

  /**
   * 创建缓存管理器
   * @param config 配置
   */
  constructor(config?: CacheManagerConfig) {
    this.config = {
      defaultProviderName: config?.defaultProviderName || '',
      enableMultiLevelCache: config?.enableMultiLevelCache !== undefined ? config.enableMultiLevelCache : true,
      autoSyncMultiLevelCache: config?.autoSyncMultiLevelCache !== undefined ? config.autoSyncMultiLevelCache : true,
      enableStats: config?.enableStats !== undefined ? config.enableStats : true,
      logLevel: config?.logLevel || 'info'
    };

    // 初始化层级提供者映射
    Object.values(CacheLevel).forEach(level => {
      this.levelProviders.set(level as CacheLevel, []);
    });
  }

  /**
   * 注册缓存提供者
   * @param provider 缓存提供者
   * @param isDefault 是否设为默认
   * @returns 是否成功
   */
  public registerProvider(provider: ICacheProvider, isDefault?: boolean): boolean {
    const name = provider.getName();
    const level = provider.getLevel();

    // 检查是否已存在同名提供者
    if (this.providers.has(name)) {
      this.log('warn', `Provider with name "${name}" already exists. Skipping registration.`);
      return false;
    }

    // 注册提供者
    this.providers.set(name, provider);

    // 添加到层级映射
    const levelProviders = this.levelProviders.get(level) || [];
    levelProviders.push(provider);
    this.levelProviders.set(level, levelProviders);

    // 设置默认提供者
    if (isDefault || (!this.defaultProviderName && this.providers.size === 1)) {
      this.defaultProviderName = name;
      this.log('info', `Set "${name}" as default cache provider.`);
    }

    this.log('info', `Registered cache provider "${name}" at level "${level}".`);
    return true;
  }

  /**
   * 获取缓存提供者
   * @param name 提供者名称
   * @returns 缓存提供者
   */
  public getProvider(name?: string): ICacheProvider | undefined {
    const providerName = name || this.defaultProviderName;
    if (!providerName) {
      this.log('warn', 'No provider name specified and no default provider set.');
      return undefined;
    }

    const provider = this.providers.get(providerName);
    if (!provider) {
      this.log('warn', `Provider "${providerName}" not found.`);
    }

    return provider;
  }

  /**
   * 获取指定层级的提供者
   * @param level 缓存层级
   * @returns 缓存提供者
   */
  public getProviderByLevel(level: CacheLevel): ICacheProvider | undefined {
    const providers = this.levelProviders.get(level) || [];
    if (providers.length === 0) {
      this.log('warn', `No provider found for level "${level}".`);
      return undefined;
    }

    // 返回第一个提供者
    return providers[0];
  }

  /**
   * 获取所有缓存提供者
   * @returns 提供者列表
   */
  public getAllProviders(): ICacheProvider[] {
    return Array.from(this.providers.values());
  }

  /**
   * 移除缓存提供者
   * @param name 提供者名称
   * @returns 是否成功
   */
  public removeProvider(name: string): boolean {
    const provider = this.providers.get(name);
    if (!provider) {
      this.log('warn', `Provider "${name}" not found. Cannot remove.`);
      return false;
    }

    // 从提供者映射中移除
    this.providers.delete(name);

    // 从层级映射中移除
    const level = provider.getLevel();
    const levelProviders = this.levelProviders.get(level) || [];
    const index = levelProviders.findIndex(p => p.getName() === name);
    if (index !== -1) {
      levelProviders.splice(index, 1);
      this.levelProviders.set(level, levelProviders);
    }

    // 如果是默认提供者，重置默认提供者
    if (this.defaultProviderName === name) {
      this.defaultProviderName = this.providers.size > 0 ? 
        Array.from(this.providers.keys())[0] : undefined;
      
      if (this.defaultProviderName) {
        this.log('info', `Reset default provider to "${this.defaultProviderName}".`);
      } else {
        this.log('warn', 'No default provider available after removal.');
      }
    }

    this.log('info', `Removed cache provider "${name}".`);
    return true;
  }

  /**
   * 获取缓存项
   * @param key 缓存键
   * @param options 缓存选项
   * @returns 缓存值或undefined
   */
  public async get<T = any>(key: string, options?: Partial<CacheItemOptions>): Promise<T | undefined> {
    const level = options?.level;
    const namespace = options?.namespace;

    // 如果指定了层级，从该层级获取
    if (level) {
      const provider = this.getProviderByLevel(level);
      if (provider) {
        return provider.get(key) as Promise<T | undefined>;
      }
      return undefined;
    }

    // 如果启用了多级缓存，从最快的缓存开始查找
    if (this.config.enableMultiLevelCache) {
      // 按层级顺序查找（从快到慢）
      const levels = [CacheLevel.MEMORY, CacheLevel.LOCAL, CacheLevel.DISTRIBUTED, CacheLevel.PERSISTENT];
      
      for (const level of levels) {
        const providers = this.levelProviders.get(level) || [];
        
        for (const provider of providers) {
          const value = await provider.get(key) as T | undefined;
          
          if (value !== undefined) {
            // 如果启用了自动同步，将值同步到更快的缓存
            if (this.config.autoSyncMultiLevelCache) {
              await this.syncToFasterCaches(key, value, level, options);
            }
            
            return value;
          }
        }
      }
      
      return undefined;
    }

    // 使用默认提供者
    const provider = this.getProvider();
    if (!provider) {
      this.log('error', 'No cache provider available.');
      return undefined;
    }

    return provider.get(key) as Promise<T | undefined>;
  }

  /**
   * 设置缓存项
   * @param key 缓存键
   * @param value 缓存值
   * @param options 缓存选项
   * @returns 是否成功
   */
  public async set<T = any>(key: string, value: T, options?: Partial<CacheItemOptions>): Promise<boolean> {
    const level = options?.level;

    // 如果指定了层级，只设置到该层级
    if (level) {
      const provider = this.getProviderByLevel(level);
      if (provider) {
        return provider.set(key, value, options);
      }
      this.log('warn', `No provider found for level "${level}". Cannot set cache.`);
      return false;
    }

    // 如果启用了多级缓存，设置到所有层级
    if (this.config.enableMultiLevelCache) {
      let success = true;
      
      // 遍历所有提供者
      for (const provider of this.providers.values()) {
        const result = await provider.set(key, value, options);
        if (!result) success = false;
      }
      
      return success;
    }

    // 使用默认提供者
    const provider = this.getProvider();
    if (!provider) {
      this.log('error', 'No cache provider available.');
      return false;
    }

    return provider.set(key, value, options);
  }

  /**
   * 删除缓存项
   * @param key 缓存键
   * @param options 缓存选项
   * @returns 是否成功
   */
  public async delete(key: string, options?: Partial<CacheItemOptions>): Promise<boolean> {
    const level = options?.level;

    // 如果指定了层级，只从该层级删除
    if (level) {
      const provider = this.getProviderByLevel(level);
      if (provider) {
        return provider.delete(key);
      }
      this.log('warn', `No provider found for level "${level}". Cannot delete cache.`);
      return false;
    }

    // 如果启用了多级缓存，从所有层级删除
    if (this.config.enableMultiLevelCache) {
      let success = true;
      
      // 遍历所有提供者
      for (const provider of this.providers.values()) {
        const result = await provider.delete(key);
        if (!result) success = false;
      }
      
      return success;
    }

    // 使用默认提供者
    const provider = this.getProvider();
    if (!provider) {
      this.log('error', 'No cache provider available.');
      return false;
    }

    return provider.delete(key);
  }

  /**
   * 清空缓存
   * @param namespace 可选命名空间
   * @param level 可选缓存层级
   * @returns 是否成功
   */
  public async clear(namespace?: string, level?: CacheLevel): Promise<boolean> {
    // 如果指定了层级，只清空该层级
    if (level) {
      const providers = this.levelProviders.get(level) || [];
      if (providers.length === 0) {
        this.log('warn', `No provider found for level "${level}". Cannot clear cache.`);
        return false;
      }
      
      let success = true;
      for (const provider of providers) {
        const result = await provider.clear(namespace);
        if (!result) success = false;
      }
      
      return success;
    }

    // 清空所有提供者
    let success = true;
    for (const provider of this.providers.values()) {
      const result = await provider.clear(namespace);
      if (!result) success = false;
    }
    
    return success;
  }

  /**
   * 获取缓存统计信息
   * @param providerName 可选提供者名称
   * @returns 统计信息
   */
  public async getStats(providerName?: string): Promise<CacheStats> {
    if (providerName) {
      const provider = this.getProvider(providerName);
      if (!provider) {
        this.log('warn', `Provider "${providerName}" not found. Cannot get stats.`);
        return this.createEmptyStats();
      }
      
      return provider.getStats();
    }

    // 使用默认提供者
    const provider = this.getProvider();
    if (!provider) {
      this.log('error', 'No cache provider available.');
      return this.createEmptyStats();
    }

    return provider.getStats();
  }

  /**
   * 获取所有缓存统计信息
   * @returns 所有提供者的统计信息
   */
  public async getAllStats(): Promise<Record<string, CacheStats>> {
    const stats: Record<string, CacheStats> = {};
    
    for (const [name, provider] of this.providers.entries()) {
      stats[name] = await provider.getStats();
    }
    
    return stats;
  }

  /**
   * 将值同步到更快的缓存
   * @param key 缓存键
   * @param value 缓存值
   * @param sourceLevel 源缓存层级
   * @param options 缓存选项
   * @returns 是否成功
   */
  private async syncToFasterCaches(
    key: string,
    value: any,
    sourceLevel: CacheLevel,
    options?: Partial<CacheItemOptions>
  ): Promise<boolean> {
    // 定义层级优先级（从快到慢）
    const levels = [CacheLevel.MEMORY, CacheLevel.LOCAL, CacheLevel.DISTRIBUTED, CacheLevel.PERSISTENT];
    const sourceLevelIndex = levels.indexOf(sourceLevel);
    
    if (sourceLevelIndex <= 0) {
      // 已经是最快的缓存，无需同步
      return true;
    }
    
    // 同步到更快的缓存
    let success = true;
    for (let i = 0; i < sourceLevelIndex; i++) {
      const level = levels[i];
      const providers = this.levelProviders.get(level) || [];
      
      for (const provider of providers) {
        const result = await provider.set(key, value, options);
        if (!result) success = false;
      }
    }
    
    return success;
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
   * 记录日志
   * @param level 日志级别
   * @param message 日志消息
   */
  private log(level: 'debug' | 'info' | 'warn' | 'error', message: string): void {
    const logLevels = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
      none: 4
    };

    if (logLevels[level] >= logLevels[this.config.logLevel]) {
      const timestamp = new Date().toISOString();
      const prefix = `[${timestamp}] [CacheManager] [${level.toUpperCase()}]`;
      
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