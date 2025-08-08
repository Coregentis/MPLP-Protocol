/**
 * 缓存系统接口定义
 * @description 定义缓存系统的核心接口和类型
 * @author MPLP Team
 * @version 1.0.1
 */

/**
 * 缓存级别枚举
 */
export enum CacheLevel {
  L1 = 'l1',
  L2 = 'l2',
  L3 = 'l3',
  DISTRIBUTED = 'distributed',
  MEMORY = 'memory',
  REDIS = 'redis',
  FILE = 'file',
  LOCAL = 'local'
}

/**
 * 缓存策略枚举
 */
export enum CacheStrategy {
  LRU = 'lru',
  LFU = 'lfu',
  FIFO = 'fifo',
  RANDOM = 'random',
  TTL = 'ttl',
  CACHE_FIRST = 'cache_first',
  CACHE_ASIDE = 'cache_aside',
  WRITE_THROUGH = 'write_through',
  WRITE_BEHIND = 'write_behind',
  CACHE_ONLY = 'cache_only',
  SOURCE_ONLY = 'source_only'
}

/**
 * 缓存项选项
 */
export interface CacheItemOptions {
  ttl?: number;
  priority?: number;
  tags?: string[];
  compress?: boolean;
  serialize?: boolean;
}

/**
 * 缓存统计别名
 */
export type CacheStats = ICacheStats;

/**
 * 缓存管理器接口
 */
export interface ICacheManager extends ICacheProvider {
  getStats(): ICacheStats;
  clearCache(): Promise<void>;
  warmup(keys: string[]): Promise<void>;
  backup(destination: string): Promise<void>;
  restore(source: string): Promise<void>;
}

/**
 * 缓存提供者接口
 */
export interface ICacheProvider {
  get<T = unknown>(key: string): Promise<T | undefined>;
  set<T = unknown>(key: string, value: T, ttl?: number): Promise<boolean>;
  delete(key: string): Promise<boolean>;
  has(key: string): Promise<boolean>;
  clear(): Promise<boolean>;
  clearPattern(pattern: string): Promise<number>;
  getKeys(): Promise<string[]>;
  getSize(): Promise<number>;
}

/**
 * 缓存策略接口
 */
export interface ICacheStrategy {
  shouldCache(key: string, value: unknown): boolean;
  getTTL(key: string, value: unknown): number;
  onHit(key: string, value: unknown): void;
  onMiss(key: string): void;
  onSet(key: string, value: unknown): void;
  onDelete(key: string): void;
}

/**
 * 缓存序列化器接口
 */
export interface ICacheSerializer {
  serialize<T>(value: T): string | Buffer;
  deserialize<T>(data: string | Buffer): T;
  canSerialize(value: unknown): boolean;
}

/**
 * 缓存压缩器接口
 */
export interface ICacheCompressor {
  compress(data: string | Buffer): Promise<Buffer>;
  decompress(data: Buffer): Promise<string | Buffer>;
  shouldCompress(data: string | Buffer): boolean;
}

/**
 * 缓存事件接口
 */
export interface ICacheEventEmitter {
  on(event: CacheEvent, listener: CacheEventListener): void;
  off(event: CacheEvent, listener: CacheEventListener): void;
  emit(event: CacheEvent, data: CacheEventData): void;
}

/**
 * 缓存事件类型
 */
export type CacheEvent = 
  | 'hit' 
  | 'miss' 
  | 'set' 
  | 'delete' 
  | 'clear' 
  | 'expire' 
  | 'evict' 
  | 'error';

/**
 * 缓存事件监听器
 */
export type CacheEventListener = (data: CacheEventData) => void;

/**
 * 缓存事件数据
 */
export interface CacheEventData {
  key?: string;
  value?: unknown;
  ttl?: number;
  reason?: string;
  error?: Error;
  timestamp: number;
}

/**
 * 缓存配置接口
 */
export interface ICacheConfig {
  defaultTTL: number;
  maxSize: number;
  enableMetrics: boolean;
  enableEvents: boolean;
  strategy: 'lru' | 'lfu' | 'fifo' | 'random';
  serializer?: ICacheSerializer;
  compressor?: ICacheCompressor;
}

/**
 * 缓存统计接口
 */
export interface ICacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  evictions: number;
  errors: number;
  totalSize: number;
  hitRate: number;
  memoryUsage: number;
  uptime: number;
}

/**
 * 缓存健康检查接口
 */
export interface ICacheHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  latency: number;
  memoryUsage: number;
  connectionStatus: 'connected' | 'disconnected' | 'reconnecting';
  lastError?: Error;
  checks: {
    connectivity: boolean;
    memory: boolean;
    performance: boolean;
  };
}

/**
 * 分布式缓存接口
 */
export interface IDistributedCache extends ICacheProvider {
  lock(key: string, ttl?: number): Promise<boolean>;
  unlock(key: string): Promise<boolean>;
  increment(key: string, delta?: number): Promise<number>;
  decrement(key: string, delta?: number): Promise<number>;
  expire(key: string, ttl: number): Promise<boolean>;
  persist(key: string): Promise<boolean>;
  ttl(key: string): Promise<number>;
}

/**
 * 缓存中间件接口
 */
export interface ICacheMiddleware {
  name: string;
  priority: number;
  beforeGet?(key: string): Promise<string>;
  afterGet?<T>(key: string, value: T | undefined): Promise<T | undefined>;
  beforeSet?<T>(key: string, value: T, ttl?: number): Promise<{ key: string; value: T; ttl?: number }>;
  afterSet?<T>(key: string, value: T, success: boolean): Promise<void>;
  beforeDelete?(key: string): Promise<string>;
  afterDelete?(key: string, success: boolean): Promise<void>;
}

/**
 * 缓存装饰器选项
 */
export interface CacheDecoratorOptions {
  ttl?: number;
  key?: string | ((args: unknown[]) => string);
  condition?: (args: unknown[]) => boolean;
  unless?: (result: unknown) => boolean;
  namespace?: string;
}

/**
 * 缓存工厂接口
 */
export interface ICacheFactory {
  createProvider(type: string, config: Record<string, unknown>): ICacheProvider;
  createClient(provider: ICacheProvider, config: Record<string, unknown>): ICacheProvider;
  createStrategy(type: string, config: Record<string, unknown>): ICacheStrategy;
  createSerializer(type: string): ICacheSerializer;
  createCompressor(type: string): ICacheCompressor;
}

/**
 * 缓存适配器接口
 */
export interface ICacheAdapter {
  name: string;
  version: string;
  connect(config: Record<string, unknown>): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
  getHealth(): Promise<ICacheHealth>;
  getProvider(): ICacheProvider;
}

/**
 * 缓存分片接口
 */
export interface ICacheShard {
  id: string;
  weight: number;
  provider: ICacheProvider;
  isHealthy(): boolean;
}

/**
 * 一致性哈希接口
 */
export interface IConsistentHash {
  addShard(shard: ICacheShard): void;
  removeShard(shardId: string): void;
  getShard(key: string): ICacheShard | undefined;
  getShards(): ICacheShard[];
  rebalance(): void;
}

/**
 * 缓存预热接口
 */
export interface ICacheWarmer {
  warmup(keys: string[]): Promise<void>;
  warmupPattern(pattern: string): Promise<void>;
  isWarmedUp(): boolean;
  getWarmupProgress(): number;
}

/**
 * 缓存备份接口
 */
export interface ICacheBackup {
  backup(destination: string): Promise<void>;
  restore(source: string): Promise<void>;
  schedule(cron: string, destination: string): void;
  getBackupInfo(): Promise<Record<string, unknown>>;
}
