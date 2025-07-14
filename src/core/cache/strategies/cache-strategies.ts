/**
 * MPLP缓存策略实现
 *
 * 提供多种缓存策略实现，包括CacheFirst、SourceFirst、CacheOnly等。
 * 实现ICacheStrategy接口，支持不同的缓存访问模式。
 *
 * @version v1.0.0
 * @created 2025-07-18T10:30:00+08:00
 */

import {
  ICacheStrategy,
  ICacheManager,
  CacheStrategy,
  CacheItemOptions
} from '../interfaces';

/**
 * 缓存优先策略
 * 
 * 先尝试从缓存中获取数据，如果缓存未命中，则从源获取并更新缓存。
 */
export class CacheFirstStrategy implements ICacheStrategy {
  private cacheManager: ICacheManager;

  /**
   * 创建缓存优先策略
   * @param cacheManager 缓存管理器
   */
  constructor(cacheManager: ICacheManager) {
    this.cacheManager = cacheManager;
  }

  /**
   * 获取策略名称
   * @returns 策略名称
   */
  public getName(): CacheStrategy {
    return CacheStrategy.CACHE_FIRST;
  }

  /**
   * 执行缓存策略
   * @param key 缓存键
   * @param fetchFn 获取源数据的函数
   * @param options 缓存选项
   * @returns 数据
   */
  public async execute<T = any>(
    key: string,
    fetchFn: () => Promise<T>,
    options?: Partial<CacheItemOptions>
  ): Promise<T> {
    // 尝试从缓存获取
    const cachedValue = await this.cacheManager.get<T>(key, options);
    
    // 如果缓存命中，直接返回
    if (cachedValue !== undefined) {
      return cachedValue;
    }
    
    // 缓存未命中，从源获取
    const sourceValue = await fetchFn();
    
    // 更新缓存
    await this.cacheManager.set(key, sourceValue, options);
    
    return sourceValue;
  }
}

/**
 * 源优先策略
 * 
 * 总是从源获取数据，然后更新缓存。
 */
export class SourceFirstStrategy implements ICacheStrategy {
  private cacheManager: ICacheManager;

  /**
   * 创建源优先策略
   * @param cacheManager 缓存管理器
   */
  constructor(cacheManager: ICacheManager) {
    this.cacheManager = cacheManager;
  }

  /**
   * 获取策略名称
   * @returns 策略名称
   */
  public getName(): CacheStrategy {
    return CacheStrategy.SOURCE_FIRST;
  }

  /**
   * 执行缓存策略
   * @param key 缓存键
   * @param fetchFn 获取源数据的函数
   * @param options 缓存选项
   * @returns 数据
   */
  public async execute<T = any>(
    key: string,
    fetchFn: () => Promise<T>,
    options?: Partial<CacheItemOptions>
  ): Promise<T> {
    // 从源获取
    const sourceValue = await fetchFn();
    
    // 更新缓存
    await this.cacheManager.set(key, sourceValue, options);
    
    return sourceValue;
  }
}

/**
 * 仅缓存策略
 * 
 * 只从缓存获取数据，如果缓存未命中，则返回undefined。
 */
export class CacheOnlyStrategy implements ICacheStrategy {
  private cacheManager: ICacheManager;

  /**
   * 创建仅缓存策略
   * @param cacheManager 缓存管理器
   */
  constructor(cacheManager: ICacheManager) {
    this.cacheManager = cacheManager;
  }

  /**
   * 获取策略名称
   * @returns 策略名称
   */
  public getName(): CacheStrategy {
    return CacheStrategy.CACHE_ONLY;
  }

  /**
   * 执行缓存策略
   * @param key 缓存键
   * @param fetchFn 获取源数据的函数
   * @param options 缓存选项
   * @returns 数据
   */
  public async execute<T = any>(
    key: string,
    fetchFn: () => Promise<T>,
    options?: Partial<CacheItemOptions>
  ): Promise<T> {
    // 只从缓存获取
    const cachedValue = await this.cacheManager.get<T>(key, options);
    
    if (cachedValue === undefined) {
      throw new Error(`Cache miss for key "${key}" and CacheOnly strategy does not allow fetching from source.`);
    }
    
    return cachedValue;
  }
}

/**
 * 仅源策略
 * 
 * 只从源获取数据，不使用缓存。
 */
export class SourceOnlyStrategy implements ICacheStrategy {
  private cacheManager: ICacheManager;

  /**
   * 创建仅源策略
   * @param cacheManager 缓存管理器
   */
  constructor(cacheManager: ICacheManager) {
    this.cacheManager = cacheManager;
  }

  /**
   * 获取策略名称
   * @returns 策略名称
   */
  public getName(): CacheStrategy {
    return CacheStrategy.SOURCE_ONLY;
  }

  /**
   * 执行缓存策略
   * @param key 缓存键
   * @param fetchFn 获取源数据的函数
   * @param options 缓存选项
   * @returns 数据
   */
  public async execute<T = any>(
    key: string,
    fetchFn: () => Promise<T>,
    options?: Partial<CacheItemOptions>
  ): Promise<T> {
    // 只从源获取，不使用缓存
    return fetchFn();
  }
}

/**
 * 过期重新验证策略
 * 
 * 同时从缓存和源获取数据，返回最快的响应，然后异步更新缓存。
 */
export class StaleWhileRevalidateStrategy implements ICacheStrategy {
  private cacheManager: ICacheManager;

  /**
   * 创建过期重新验证策略
   * @param cacheManager 缓存管理器
   */
  constructor(cacheManager: ICacheManager) {
    this.cacheManager = cacheManager;
  }

  /**
   * 获取策略名称
   * @returns 策略名称
   */
  public getName(): CacheStrategy {
    return CacheStrategy.STALE_WHILE_REVALIDATE;
  }

  /**
   * 执行缓存策略
   * @param key 缓存键
   * @param fetchFn 获取源数据的函数
   * @param options 缓存选项
   * @returns 数据
   */
  public async execute<T = any>(
    key: string,
    fetchFn: () => Promise<T>,
    options?: Partial<CacheItemOptions>
  ): Promise<T> {
    // 同时从缓存和源获取
    const cachedValuePromise = this.cacheManager.get<T>(key, options);
    const sourceValuePromise = fetchFn();
    
    // 创建一个Promise，返回最快的响应
    const result = await Promise.race([
      cachedValuePromise.then(value => ({ source: 'cache', value })),
      sourceValuePromise.then(value => ({ source: 'source', value }))
    ]);
    
    if (result.source === 'cache' && result.value !== undefined) {
      // 如果缓存命中，异步更新缓存
      sourceValuePromise.then(sourceValue => {
        this.cacheManager.set(key, sourceValue, options);
      }).catch(error => {
        console.error(`Error updating cache for key "${key}":`, error);
      });
      
      return result.value;
    } else {
      // 如果源先返回或缓存未命中，更新缓存并返回源值
      const sourceValue = result.source === 'source' ? 
        result.value as T : await sourceValuePromise;
      
      await this.cacheManager.set(key, sourceValue, options);
      
      return sourceValue;
    }
  }
}

/**
 * 过期错误策略
 * 
 * 如果缓存过期但在容忍时间内，返回缓存并异步更新。
 */
export class StaleIfErrorStrategy implements ICacheStrategy {
  private cacheManager: ICacheManager;
  private toleranceMs: number;

  /**
   * 创建过期错误策略
   * @param cacheManager 缓存管理器
   * @param toleranceMs 容忍时间（毫秒）
   */
  constructor(cacheManager: ICacheManager, toleranceMs: number = 3600000) { // 默认1小时
    this.cacheManager = cacheManager;
    this.toleranceMs = toleranceMs;
  }

  /**
   * 获取策略名称
   * @returns 策略名称
   */
  public getName(): CacheStrategy {
    return CacheStrategy.STALE_IF_ERROR;
  }

  /**
   * 执行缓存策略
   * @param key 缓存键
   * @param fetchFn 获取源数据的函数
   * @param options 缓存选项
   * @returns 数据
   */
  public async execute<T = any>(
    key: string,
    fetchFn: () => Promise<T>,
    options?: Partial<CacheItemOptions>
  ): Promise<T> {
    try {
      // 尝试从源获取
      const sourceValue = await fetchFn();
      
      // 更新缓存
      await this.cacheManager.set(key, sourceValue, options);
      
      return sourceValue;
    } catch (error) {
      // 源获取失败，尝试从缓存获取
      const cachedValue = await this.cacheManager.get<T>(key, {
        ...options,
        // 扩展TTL以包含容忍时间
        ttl: (options?.ttl || 0) + this.toleranceMs
      });
      
      if (cachedValue !== undefined) {
        return cachedValue;
      }
      
      // 缓存也未命中，重新抛出错误
      throw error;
    }
  }
}

/**
 * 创建缓存策略
 * @param type 策略类型
 * @param cacheManager 缓存管理器
 * @returns 缓存策略
 */
export function createCacheStrategy(
  type: CacheStrategy,
  cacheManager: ICacheManager
): ICacheStrategy {
  switch (type) {
    case CacheStrategy.CACHE_FIRST:
      return new CacheFirstStrategy(cacheManager);
    case CacheStrategy.SOURCE_FIRST:
      return new SourceFirstStrategy(cacheManager);
    case CacheStrategy.CACHE_ONLY:
      return new CacheOnlyStrategy(cacheManager);
    case CacheStrategy.SOURCE_ONLY:
      return new SourceOnlyStrategy(cacheManager);
    case CacheStrategy.STALE_WHILE_REVALIDATE:
      return new StaleWhileRevalidateStrategy(cacheManager);
    case CacheStrategy.STALE_IF_ERROR:
      return new StaleIfErrorStrategy(cacheManager);
    default:
      throw new Error(`Unsupported cache strategy: ${type}`);
  }
} 