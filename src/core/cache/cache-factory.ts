/**
 * MPLP缓存工厂
 *
 * 提供创建缓存相关组件的工厂方法，包括缓存管理器、提供者、策略等。
 * 实现ICacheFactory接口，用于简化缓存组件的创建和配置。
 *
 * @version v1.0.0
 * @created 2025-07-18T11:30:00+08:00
 */

import {
  ICacheFactory,
  ICacheManager,
  ICacheProvider,
  ICacheStrategy,
  CacheStrategy
} from './interfaces';
import { CacheManager, CacheManagerConfig } from './cache-manager';
import { MemoryCacheProvider, MemoryCacheProviderConfig } from './providers/memory-provider';
import { createCacheStrategy } from './strategies/cache-strategies';

/**
 * 缓存工厂
 */
export class CacheFactory implements ICacheFactory {
  /**
   * 创建缓存管理器
   * @param config 缓存管理器配置
   * @returns 缓存管理器
   */
  public createCacheManager(config?: CacheManagerConfig): ICacheManager {
    return new CacheManager(config);
  }

  /**
   * 创建缓存提供者
   * @param type 提供者类型
   * @param config 提供者配置
   * @returns 缓存提供者
   */
  public createProvider(type: string, config?: Record<string, any>): ICacheProvider {
    switch (type) {
      case 'memory':
        return new MemoryCacheProvider(config as MemoryCacheProviderConfig);
      // 其他提供者类型可以在这里添加
      default:
        throw new Error(`Unsupported cache provider type: ${type}`);
    }
  }

  /**
   * 创建缓存策略
   * @param type 策略类型
   * @param cacheManager 缓存管理器
   * @returns 缓存策略
   */
  public createStrategy(type: CacheStrategy, cacheManager: ICacheManager): ICacheStrategy {
    return createCacheStrategy(type, cacheManager);
  }

  /**
   * 创建默认缓存管理器
   * 
   * 创建一个配置了内存缓存提供者的缓存管理器。
   * 
   * @param config 缓存管理器配置
   * @returns 缓存管理器
   */
  public createDefaultCacheManager(config?: CacheManagerConfig): ICacheManager {
    const cacheManager = this.createCacheManager(config);
    const memoryProvider = this.createProvider('memory');
    
    cacheManager.registerProvider(memoryProvider, true);
    
    return cacheManager;
  }
} 