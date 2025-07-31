/**
 * 缓存模块导出
 * @description 统一导出缓存系统的所有组件
 * @author MPLP Team
 * @version 1.0.1
 */

// 核心类
export { CacheManager, CacheManagerConfig, CacheEntry, CacheMetrics } from './cache-manager';
export { CacheClient, CacheClientConfig, CacheOptions, createCacheClient } from './cache-client';

// 接口定义
export * from './interfaces';

// 类型定义
export type {
  ICacheProvider,
  ICacheStrategy,
  ICacheSerializer,
  ICacheCompressor,
  ICacheEventEmitter,
  ICacheConfig,
  ICacheStats,
  ICacheHealth,
  IDistributedCache,
  ICacheMiddleware,
  ICacheFactory,
  ICacheAdapter,
  ICacheShard,
  IConsistentHash,
  ICacheWarmer,
  ICacheBackup,
  CacheEvent,
  CacheEventListener,
  CacheEventData,
  CacheDecoratorOptions
} from './interfaces';
