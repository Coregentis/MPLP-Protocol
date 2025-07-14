/**
 * MPLP缓存策略接口定义
 *
 * 定义缓存策略和优化所需的核心接口，包括缓存提供者、缓存管理器、缓存策略等。
 * 遵循厂商中立原则，提供标准化的接口以支持不同的缓存实现。
 *
 * @version v1.0.0
 * @created 2025-07-18T09:00:00+08:00
 */

/**
 * 缓存项配置
 */
export interface CacheItemOptions {
  /**
   * 缓存键
   */
  key: string;

  /**
   * 缓存标签，用于批量操作
   */
  tags?: string[];

  /**
   * 过期时间（毫秒）
   */
  ttl?: number;

  /**
   * 最大空闲时间（毫秒）
   */
  maxIdleTime?: number;

  /**
   * 是否在后台异步刷新
   */
  backgroundRefresh?: boolean;

  /**
   * 缓存命名空间
   */
  namespace?: string;

  /**
   * 缓存层级
   */
  level?: CacheLevel;

  /**
   * 自定义元数据
   */
  metadata?: Record<string, any>;
}

/**
 * 缓存层级
 */
export enum CacheLevel {
  /**
   * 内存缓存（最快，但不持久）
   */
  MEMORY = 'memory',

  /**
   * 本地缓存（较快，进程内持久）
   */
  LOCAL = 'local',

  /**
   * 分布式缓存（中等，跨进程共享）
   */
  DISTRIBUTED = 'distributed',

  /**
   * 持久化缓存（较慢，持久存储）
   */
  PERSISTENT = 'persistent'
}

/**
 * 缓存策略
 */
export enum CacheStrategy {
  /**
   * 先读缓存，缓存未命中时读取源数据
   */
  CACHE_FIRST = 'cache_first',

  /**
   * 先读取源数据，然后更新缓存
   */
  SOURCE_FIRST = 'source_first',

  /**
   * 仅读取缓存，缓存未命中时返回空
   */
  CACHE_ONLY = 'cache_only',

  /**
   * 仅读取源数据，不使用缓存
   */
  SOURCE_ONLY = 'source_only',

  /**
   * 同时读取缓存和源数据，返回最快的响应，异步更新缓存
   */
  STALE_WHILE_REVALIDATE = 'stale_while_revalidate',

  /**
   * 如果缓存过期但在容忍时间内，返回缓存并异步更新
   */
  STALE_IF_ERROR = 'stale_if_error'
}

/**
 * 缓存统计信息
 */
export interface CacheStats {
  /**
   * 命中次数
   */
  hits: number;

  /**
   * 未命中次数
   */
  misses: number;

  /**
   * 命中率
   */
  hitRatio: number;

  /**
   * 缓存项数量
   */
  itemCount: number;

  /**
   * 缓存大小（字节）
   */
  size: number;

  /**
   * 平均访问时间（毫秒）
   */
  avgAccessTime: number;

  /**
   * 过期项数量
   */
  expiredCount: number;

  /**
   * 驱逐项数量
   */
  evictedCount: number;

  /**
   * 按命名空间统计
   */
  namespaceStats?: Record<string, Omit<CacheStats, 'namespaceStats'>>;
}

/**
 * 缓存提供者接口
 */
export interface ICacheProvider<T = any> {
  /**
   * 获取缓存项
   * @param key 缓存键
   * @returns 缓存值或undefined（未命中）
   */
  get(key: string): Promise<T | undefined>;

  /**
   * 设置缓存项
   * @param key 缓存键
   * @param value 缓存值
   * @param options 缓存选项
   * @returns 是否成功
   */
  set(key: string, value: T, options?: Partial<CacheItemOptions>): Promise<boolean>;

  /**
   * 检查缓存项是否存在
   * @param key 缓存键
   * @returns 是否存在
   */
  has(key: string): Promise<boolean>;

  /**
   * 删除缓存项
   * @param key 缓存键
   * @returns 是否成功
   */
  delete(key: string): Promise<boolean>;

  /**
   * 按标签删除缓存项
   * @param tag 标签
   * @returns 删除的项数
   */
  deleteByTag(tag: string): Promise<number>;

  /**
   * 清空所有缓存
   * @param namespace 可选命名空间
   * @returns 是否成功
   */
  clear(namespace?: string): Promise<boolean>;

  /**
   * 获取缓存统计信息
   * @returns 统计信息
   */
  getStats(): Promise<CacheStats>;

  /**
   * 获取多个缓存项
   * @param keys 缓存键数组
   * @returns 键值对映射
   */
  mget(keys: string[]): Promise<Map<string, T>>;

  /**
   * 设置多个缓存项
   * @param items 键值对映射
   * @param options 缓存选项
   * @returns 是否成功
   */
  mset(items: Map<string, T>, options?: Partial<CacheItemOptions>): Promise<boolean>;

  /**
   * 获取缓存提供者名称
   * @returns 提供者名称
   */
  getName(): string;

  /**
   * 获取缓存层级
   * @returns 缓存层级
   */
  getLevel(): CacheLevel;
}

/**
 * 缓存管理器接口
 */
export interface ICacheManager {
  /**
   * 注册缓存提供者
   * @param provider 缓存提供者
   * @param isDefault 是否设为默认
   * @returns 是否成功
   */
  registerProvider(provider: ICacheProvider, isDefault?: boolean): boolean;

  /**
   * 获取缓存提供者
   * @param name 提供者名称
   * @returns 缓存提供者
   */
  getProvider(name?: string): ICacheProvider | undefined;

  /**
   * 获取指定层级的提供者
   * @param level 缓存层级
   * @returns 缓存提供者
   */
  getProviderByLevel(level: CacheLevel): ICacheProvider | undefined;

  /**
   * 获取所有缓存提供者
   * @returns 提供者列表
   */
  getAllProviders(): ICacheProvider[];

  /**
   * 移除缓存提供者
   * @param name 提供者名称
   * @returns 是否成功
   */
  removeProvider(name: string): boolean;

  /**
   * 获取缓存项
   * @param key 缓存键
   * @param options 缓存选项
   * @returns 缓存值或undefined
   */
  get<T = any>(key: string, options?: Partial<CacheItemOptions>): Promise<T | undefined>;

  /**
   * 设置缓存项
   * @param key 缓存键
   * @param value 缓存值
   * @param options 缓存选项
   * @returns 是否成功
   */
  set<T = any>(key: string, value: T, options?: Partial<CacheItemOptions>): Promise<boolean>;

  /**
   * 删除缓存项
   * @param key 缓存键
   * @param options 缓存选项
   * @returns 是否成功
   */
  delete(key: string, options?: Partial<CacheItemOptions>): Promise<boolean>;

  /**
   * 清空缓存
   * @param namespace 可选命名空间
   * @param level 可选缓存层级
   * @returns 是否成功
   */
  clear(namespace?: string, level?: CacheLevel): Promise<boolean>;

  /**
   * 获取缓存统计信息
   * @param providerName 可选提供者名称
   * @returns 统计信息
   */
  getStats(providerName?: string): Promise<CacheStats>;

  /**
   * 获取所有缓存统计信息
   * @returns 所有提供者的统计信息
   */
  getAllStats(): Promise<Record<string, CacheStats>>;
}

/**
 * 缓存策略接口
 */
export interface ICacheStrategy {
  /**
   * 获取策略名称
   * @returns 策略名称
   */
  getName(): CacheStrategy;

  /**
   * 执行缓存策略
   * @param key 缓存键
   * @param fetchFn 获取源数据的函数
   * @param options 缓存选项
   * @returns 数据
   */
  execute<T = any>(
    key: string,
    fetchFn: () => Promise<T>,
    options?: Partial<CacheItemOptions>
  ): Promise<T>;
}

/**
 * 缓存工厂接口
 */
export interface ICacheFactory {
  /**
   * 创建缓存管理器
   * @returns 缓存管理器
   */
  createCacheManager(): ICacheManager;

  /**
   * 创建缓存提供者
   * @param type 提供者类型
   * @param config 提供者配置
   * @returns 缓存提供者
   */
  createProvider(type: string, config?: Record<string, any>): ICacheProvider;

  /**
   * 创建缓存策略
   * @param type 策略类型
   * @param cacheManager 缓存管理器
   * @returns 缓存策略
   */
  createStrategy(type: CacheStrategy, cacheManager: ICacheManager): ICacheStrategy;
}

/**
 * 缓存客户端接口
 */
export interface ICacheClient {
  /**
   * 获取缓存项，如果不存在则获取并缓存
   * @param key 缓存键
   * @param fetchFn 获取源数据的函数
   * @param options 缓存选项
   * @returns 数据
   */
  getOrFetch<T = any>(
    key: string,
    fetchFn: () => Promise<T>,
    options?: Partial<CacheItemOptions>
  ): Promise<T>;

  /**
   * 使用特定策略获取缓存项
   * @param strategy 缓存策略
   * @param key 缓存键
   * @param fetchFn 获取源数据的函数
   * @param options 缓存选项
   * @returns 数据
   */
  getWithStrategy<T = any>(
    strategy: CacheStrategy,
    key: string,
    fetchFn: () => Promise<T>,
    options?: Partial<CacheItemOptions>
  ): Promise<T>;

  /**
   * 获取缓存项
   * @param key 缓存键
   * @param options 缓存选项
   * @returns 缓存值或undefined
   */
  get<T = any>(key: string, options?: Partial<CacheItemOptions>): Promise<T | undefined>;

  /**
   * 设置缓存项
   * @param key 缓存键
   * @param value 缓存值
   * @param options 缓存选项
   * @returns 是否成功
   */
  set<T = any>(key: string, value: T, options?: Partial<CacheItemOptions>): Promise<boolean>;

  /**
   * 删除缓存项
   * @param key 缓存键
   * @param options 缓存选项
   * @returns 是否成功
   */
  delete(key: string, options?: Partial<CacheItemOptions>): Promise<boolean>;

  /**
   * 按标签删除缓存项
   * @param tag 标签
   * @param level 可选缓存层级
   * @returns 删除的项数
   */
  deleteByTag(tag: string, level?: CacheLevel): Promise<number>;

  /**
   * 清空缓存
   * @param namespace 可选命名空间
   * @param level 可选缓存层级
   * @returns 是否成功
   */
  clear(namespace?: string, level?: CacheLevel): Promise<boolean>;

  /**
   * 获取缓存统计信息
   * @returns 统计信息
   */
  getStats(): Promise<Record<string, CacheStats>>;
} 