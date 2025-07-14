/**
 * MPLP缓存模块入口
 *
 * 导出缓存模块的所有公共API。
 *
 * @version v1.0.0
 * @created 2025-07-18T12:00:00+08:00
 */

// 导出接口
export {
  ICacheProvider,
  ICacheManager,
  ICacheStrategy,
  ICacheFactory,
  ICacheClient,
  CacheItemOptions,
  CacheLevel,
  CacheStrategy,
  CacheStats
} from './interfaces';

// 导出实现
export { CacheManager, CacheManagerConfig } from './cache-manager';
export { MemoryCacheProvider, MemoryCacheProviderConfig } from './providers/memory-provider';
export { CacheClient, CacheClientConfig } from './cache-client';
export { CacheFactory } from './cache-factory';

// 导出策略
export {
  CacheFirstStrategy,
  SourceFirstStrategy,
  CacheOnlyStrategy,
  SourceOnlyStrategy,
  StaleWhileRevalidateStrategy,
  StaleIfErrorStrategy,
  createCacheStrategy
} from './strategies/cache-strategies';

// 创建默认实例
import { CacheFactory } from './cache-factory';
import { CacheClient, CacheClientConfig } from './cache-client';

/**
 * 创建默认缓存客户端
 * @param config 缓存客户端配置
 * @returns 缓存客户端
 */
export function createDefaultCacheClient(config?: CacheClientConfig): CacheClient {
  const factory = new CacheFactory();
  const cacheManager = factory.createDefaultCacheManager();
  return new CacheClient(cacheManager, config);
}

// 导出默认实例
export const defaultCacheFactory = new CacheFactory();
export const defaultCacheManager = defaultCacheFactory.createDefaultCacheManager();
export const defaultCacheClient = new CacheClient(defaultCacheManager); 