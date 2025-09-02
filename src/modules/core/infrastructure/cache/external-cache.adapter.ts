/**
 * 外部缓存适配器 - 统一缓存系统集成
 * 支持Redis、Memcached等外部缓存系统
 * 基于SCTM+GLFB+ITCM增强框架设计
 * 
 * @description 提供厂商中立的外部缓存集成接口
 * @version 1.0.0
 * @layer 基础设施层 - 适配器
 */

import { UUID, Timestamp } from '../../types';

// ===== 外部缓存配置接口 =====

export interface ExternalCacheConfig {
  provider: CacheProvider;
  connectionString: string;
  options: CacheProviderOptions;
  retryPolicy: CacheRetryPolicy;
  compression: boolean;
  encryption: boolean;
  serialization: 'json' | 'msgpack' | 'binary';
  clustering: boolean;
  maxConnections: number;
  connectionTimeout: number;
}

export type CacheProvider = 'redis' | 'memcached' | 'memory' | 'hybrid';

export interface CacheProviderOptions {
  redis?: RedisOptions;
  memcached?: MemcachedOptions;
  hybrid?: HybridOptions;
}

export interface RedisOptions {
  db: number;
  keyPrefix: string;
  maxRetriesPerRequest: number;
  retryDelayOnFailover: number;
  enableCluster: boolean;
  clusterNodes?: string[];
  sentinels?: Array<{ host: string; port: number }>;
}

export interface MemcachedOptions {
  poolSize: number;
  timeout: number;
  retries: number;
  retry: number;
  remove: boolean;
  failOverServers?: string[];
}

export interface HybridOptions {
  l1Cache: 'memory';
  l2Cache: 'redis' | 'memcached';
  l1Size: number;
  l1TTL: number;
  syncStrategy: 'write-through' | 'write-behind' | 'write-around';
}

export interface CacheRetryPolicy {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  jitter: boolean;
}

// ===== 缓存条目接口 =====

export interface CacheEntry<T = unknown> {
  key: string;
  value: T;
  ttl: number;
  createdAt: Timestamp;
  accessedAt: Timestamp;
  accessCount: number;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export interface CacheOperationOptions {
  ttl?: number;
  tags?: string[];
  namespace?: string;
  compression?: boolean;
  encryption?: boolean;
  priority?: 'low' | 'normal' | 'high';
}

// ===== 缓存统计接口 =====

export interface CacheStatistics {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  evictions: number;
  errors: number;
  totalSize: number;
  hitRate: number;
  missRate: number;
  averageLatency: number;
  memoryUsage: number;
  connectionStatus: CacheConnectionStatus;
  lastActivity: Timestamp;
}

export type CacheConnectionStatus = 'connected' | 'disconnected' | 'reconnecting' | 'error';

// ===== 缓存连接接口 =====

interface CacheConnection {
  provider: CacheProvider;
  connected: boolean;
  client?: unknown; // 实际的缓存客户端实例
  config?: Record<string, unknown>;
}

// ===== 外部缓存适配器实现 =====

export class ExternalCacheAdapter {
  private config: ExternalCacheConfig;
  private provider: CacheProvider;
  private connection: CacheConnection | null = null;
  private statistics: CacheStatistics;
  private reconnectTimer: NodeJS.Timeout | null = null;

  constructor(config: ExternalCacheConfig) {
    this.config = config;
    this.provider = config.provider;
    this.statistics = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      evictions: 0,
      errors: 0,
      totalSize: 0,
      hitRate: 0,
      missRate: 0,
      averageLatency: 0,
      memoryUsage: 0,
      connectionStatus: 'disconnected',
      lastActivity: new Date().toISOString()
    };
  }

  /**
   * 连接到外部缓存系统
   */
  async connect(): Promise<void> {
    try {
      switch (this.provider) {
        case 'redis':
          await this.connectRedis();
          break;
        case 'memcached':
          await this.connectMemcached();
          break;
        case 'hybrid':
          await this.connectHybrid();
          break;
        case 'memory':
          await this.connectMemory();
          break;
        default:
          throw new Error(`Unsupported cache provider: ${this.provider}`);
      }

      this.statistics.connectionStatus = 'connected';
      console.log(`Connected to ${this.provider} cache system`);

    } catch (error) {
      this.statistics.connectionStatus = 'error';
      throw new Error(`Failed to connect to ${this.provider}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * 断开连接
   */
  async disconnect(): Promise<void> {
    try {
      if (this.connection?.client) {
        await this.disconnectProvider();
        this.connection = null;
      }

      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }

      this.statistics.connectionStatus = 'disconnected';
      console.log(`Disconnected from ${this.provider} cache system`);

    } catch (error) {
      console.error(`Error disconnecting from ${this.provider}:`, error);
    }
  }

  /**
   * 获取缓存值
   */
  async get<T = unknown>(key: string, options: CacheOperationOptions = {}): Promise<T | undefined> {
    if (this.statistics.connectionStatus !== 'connected') {
      throw new Error('Cache system not connected');
    }

    const startTime = Date.now();
    const fullKey = this.buildKey(key, options.namespace);

    try {
      const result = await this.getFromProvider<T>(fullKey);
      
      if (result !== undefined) {
        this.statistics.hits++;
        this.updateLatency(Date.now() - startTime);
        this.statistics.lastActivity = new Date().toISOString();
        return result;
      } else {
        this.statistics.misses++;
        return undefined;
      }

    } catch (error) {
      this.statistics.errors++;
      console.error(`Cache get error for key ${fullKey}:`, error);
      throw error;
    }
  }

  /**
   * 设置缓存值
   */
  async set<T = unknown>(key: string, value: T, options: CacheOperationOptions = {}): Promise<boolean> {
    if (this.statistics.connectionStatus !== 'connected') {
      throw new Error('Cache system not connected');
    }

    const startTime = Date.now();
    const fullKey = this.buildKey(key, options.namespace);

    try {
      const success = await this.setToProvider(fullKey, value, options);
      
      if (success) {
        this.statistics.sets++;
        this.updateLatency(Date.now() - startTime);
        this.statistics.lastActivity = new Date().toISOString();
      }

      return success;

    } catch (error) {
      this.statistics.errors++;
      console.error(`Cache set error for key ${fullKey}:`, error);
      throw error;
    }
  }

  /**
   * 删除缓存值
   */
  async delete(key: string, options: CacheOperationOptions = {}): Promise<boolean> {
    if (this.statistics.connectionStatus !== 'connected') {
      throw new Error('Cache system not connected');
    }

    const fullKey = this.buildKey(key, options.namespace);

    try {
      const success = await this.deleteFromProvider(fullKey);
      
      if (success) {
        this.statistics.deletes++;
        this.statistics.lastActivity = new Date().toISOString();
      }

      return success;

    } catch (error) {
      this.statistics.errors++;
      console.error(`Cache delete error for key ${fullKey}:`, error);
      throw error;
    }
  }

  /**
   * 检查缓存键是否存在
   */
  async has(key: string, options: CacheOperationOptions = {}): Promise<boolean> {
    if (this.statistics.connectionStatus !== 'connected') {
      throw new Error('Cache system not connected');
    }

    const fullKey = this.buildKey(key, options.namespace);

    try {
      return await this.hasInProvider(fullKey);
    } catch (error) {
      this.statistics.errors++;
      console.error(`Cache has error for key ${fullKey}:`, error);
      return false;
    }
  }

  /**
   * 清空缓存
   */
  async clear(namespace?: string): Promise<boolean> {
    if (this.statistics.connectionStatus !== 'connected') {
      throw new Error('Cache system not connected');
    }

    try {
      const success = await this.clearProvider(namespace);
      
      if (success) {
        this.statistics.lastActivity = new Date().toISOString();
      }

      return success;

    } catch (error) {
      this.statistics.errors++;
      console.error('Cache clear error:', error);
      throw error;
    }
  }

  /**
   * 获取缓存统计信息
   */
  getStatistics(): CacheStatistics {
    // 计算命中率和未命中率
    const totalRequests = this.statistics.hits + this.statistics.misses;
    if (totalRequests > 0) {
      this.statistics.hitRate = (this.statistics.hits / totalRequests) * 100;
      this.statistics.missRate = (this.statistics.misses / totalRequests) * 100;
    }

    return { ...this.statistics };
  }

  // ===== 提供商特定实现 =====

  private async connectRedis(): Promise<void> {
    try {
      const redisOptions = this.config.options.redis;
      if (!redisOptions) {
        throw new Error('Redis options not configured');
      }

      console.log('Connecting to Redis cache...');
      
      // 解析连接参数
      const connectionParams = {
        host: this.extractHostFromConnectionString(),
        port: this.extractPortFromConnectionString(),
        db: redisOptions.db,
        keyPrefix: redisOptions.keyPrefix,
        maxRetriesPerRequest: redisOptions.maxRetriesPerRequest,
        retryDelayOnFailover: redisOptions.retryDelayOnFailover,
        enableCluster: redisOptions.enableCluster,
        clusterNodes: redisOptions.clusterNodes,
        sentinels: redisOptions.sentinels
      };

      // 验证连接参数
      if (!connectionParams.host || !connectionParams.port) {
        throw new Error('Invalid Redis connection string');
      }

      // 模拟连接延迟
      await this.simulateConnection();

      // 在生产环境中，这里会创建真实的Redis客户端连接
      // if (connectionParams.enableCluster && connectionParams.clusterNodes) {
      //   const redis = new Redis.Cluster(connectionParams.clusterNodes);
      // } else if (connectionParams.sentinels) {
      //   const redis = new Redis({ sentinels: connectionParams.sentinels });
      // } else {
      //   const redis = new Redis(connectionParams);
      // }
      // await redis.ping();
      
      this.connection = { 
        provider: 'redis', 
        connected: true,
        config: connectionParams
      };
      
      console.log(`Connected to Redis at ${connectionParams.host}:${connectionParams.port}`);
      
    } catch (error) {
      throw new Error(`Redis connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async connectMemcached(): Promise<void> {
    try {
      const memcachedOptions = this.config.options.memcached;
      if (!memcachedOptions) {
        throw new Error('Memcached options not configured');
      }

      console.log('Connecting to Memcached cache...');

      // 解析服务器地址
      const servers = this.config.connectionString.split(',').map(server => server.trim());
      if (!servers.length) {
        throw new Error('No Memcached servers configured');
      }

      const connectionParams = {
        servers,
        poolSize: memcachedOptions.poolSize,
        timeout: memcachedOptions.timeout,
        retries: memcachedOptions.retries,
        retry: memcachedOptions.retry,
        remove: memcachedOptions.remove,
        failOverServers: memcachedOptions.failOverServers
      };

      // 模拟连接延迟
      await this.simulateConnection();

      // 在生产环境中，这里会创建真实的Memcached客户端连接
      // const memcached = new Memcached(connectionParams.servers, {
      //   poolSize: connectionParams.poolSize,
      //   timeout: connectionParams.timeout,
      //   retries: connectionParams.retries,
      //   retry: connectionParams.retry,
      //   remove: connectionParams.remove,
      //   failOverServers: connectionParams.failOverServers
      // });

      this.connection = {
        provider: 'memcached',
        connected: true,
        config: connectionParams
      };

      console.log(`Connected to Memcached servers: ${connectionParams.servers.join(', ')}`);

    } catch (error) {
      throw new Error(`Memcached connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async connectHybrid(): Promise<void> {
    try {
      const hybridOptions = this.config.options.hybrid;
      if (!hybridOptions) {
        throw new Error('Hybrid cache options not configured');
      }

      console.log('Connecting to Hybrid cache system...');

      // 初始化L1缓存（内存）
      const l1Cache = new Map<string, CacheEntry>();

      // 初始化L2缓存连接（根据配置选择Redis或Memcached）
      let l2Connection: CacheConnection;
      if (hybridOptions.l2Cache === 'redis') {
        await this.connectRedis();
        l2Connection = this.connection!;
      } else {
        await this.connectMemcached();
        l2Connection = this.connection!;
      }

      const connectionParams = {
        l1Cache,
        l2Connection,
        l1Size: hybridOptions.l1Size,
        l1TTL: hybridOptions.l1TTL,
        syncStrategy: hybridOptions.syncStrategy
      };

      this.connection = {
        provider: 'hybrid',
        connected: true,
        config: connectionParams
      };

      console.log(`Connected to Hybrid cache (L1: ${hybridOptions.l1Cache}, L2: ${hybridOptions.l2Cache})`);

    } catch (error) {
      throw new Error(`Hybrid cache connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async connectMemory(): Promise<void> {
    // 内存缓存不需要外部连接，但需要初始化内部数据结构
    const memoryCache = new Map<string, CacheEntry>();

    this.connection = {
      provider: 'memory',
      connected: true,
      client: memoryCache
    };

    console.log('Connected to memory cache');
  }

  // ===== 提供商操作实现 =====

  private async getFromProvider<T>(key: string): Promise<T | undefined> {
    switch (this.provider) {
      case 'redis':
        return await this.getFromRedis<T>(key);
      case 'memcached':
        return await this.getFromMemcached<T>(key);
      case 'hybrid':
        return await this.getFromHybrid<T>(key);
      case 'memory':
        return await this.getFromMemory<T>(key);
      default:
        throw new Error(`Unsupported provider: ${this.provider}`);
    }
  }

  private async setToProvider<T>(key: string, value: T, options: CacheOperationOptions): Promise<boolean> {
    switch (this.provider) {
      case 'redis':
        return await this.setToRedis(key, value, options);
      case 'memcached':
        return await this.setToMemcached(key, value, options);
      case 'hybrid':
        return await this.setToHybrid(key, value, options);
      case 'memory':
        return await this.setToMemory(key, value, options);
      default:
        throw new Error(`Unsupported provider: ${this.provider}`);
    }
  }

  private async deleteFromProvider(key: string): Promise<boolean> {
    switch (this.provider) {
      case 'redis':
        return await this.deleteFromRedis(key);
      case 'memcached':
        return await this.deleteFromMemcached(key);
      case 'hybrid':
        return await this.deleteFromHybrid(key);
      case 'memory':
        return await this.deleteFromMemory(key);
      default:
        throw new Error(`Unsupported provider: ${this.provider}`);
    }
  }

  private async hasInProvider(key: string): Promise<boolean> {
    switch (this.provider) {
      case 'redis':
        return await this.hasInRedis(key);
      case 'memcached':
        return await this.hasInMemcached(key);
      case 'hybrid':
        return await this.hasInHybrid(key);
      case 'memory':
        return await this.hasInMemory(key);
      default:
        throw new Error(`Unsupported provider: ${this.provider}`);
    }
  }

  private async clearProvider(namespace?: string): Promise<boolean> {
    switch (this.provider) {
      case 'redis':
        return await this.clearRedis(namespace);
      case 'memcached':
        return await this.clearMemcached(namespace);
      case 'hybrid':
        return await this.clearHybrid(namespace);
      case 'memory':
        return await this.clearMemory(namespace);
      default:
        throw new Error(`Unsupported provider: ${this.provider}`);
    }
  }

  // ===== Redis操作实现 =====

  private async getFromRedis<T>(key: string): Promise<T | undefined> {
    // 模拟Redis GET操作
    await this.simulateNetworkCall();

    // 在生产环境中，这里会调用真实的Redis客户端
    // const result = await this.connection?.client.get(key);
    // return result ? JSON.parse(result) : undefined;

    console.log(`Redis GET: ${key}`);
    return undefined; // 模拟未找到
  }

  private async setToRedis<T>(key: string, value: T, options: CacheOperationOptions): Promise<boolean> {
    // 模拟Redis SET操作
    await this.simulateNetworkCall();

    // 在生产环境中，这里会调用真实的Redis客户端
    // const serializedValue = JSON.stringify(value);
    // if (options.ttl) {
    //   await this.connection?.client.setex(key, options.ttl, serializedValue);
    // } else {
    //   await this.connection?.client.set(key, serializedValue);
    // }

    console.log(`Redis SET: ${key} (TTL: ${options.ttl || 'none'})`);
    return true;
  }

  private async deleteFromRedis(key: string): Promise<boolean> {
    // 模拟Redis DEL操作
    await this.simulateNetworkCall();

    // 在生产环境中，这里会调用真实的Redis客户端
    // const result = await this.connection?.client.del(key);
    // return result > 0;

    console.log(`Redis DEL: ${key}`);
    return true;
  }

  private async hasInRedis(key: string): Promise<boolean> {
    // 模拟Redis EXISTS操作
    await this.simulateNetworkCall();

    // 在生产环境中，这里会调用真实的Redis客户端
    // const result = await this.connection?.client.exists(key);
    // return result > 0;

    console.log(`Redis EXISTS: ${key}`);
    return false; // 模拟不存在
  }

  private async clearRedis(namespace?: string): Promise<boolean> {
    // 模拟Redis FLUSHDB或模式删除操作
    await this.simulateNetworkCall();

    // 在生产环境中，这里会调用真实的Redis客户端
    // if (namespace) {
    //   const keys = await this.connection?.client.keys(`${namespace}:*`);
    //   if (keys.length > 0) {
    //     await this.connection?.client.del(...keys);
    //   }
    // } else {
    //   await this.connection?.client.flushdb();
    // }

    console.log(`Redis CLEAR: ${namespace || 'all'}`);
    return true;
  }

  // ===== Memcached操作实现 =====

  private async getFromMemcached<T>(key: string): Promise<T | undefined> {
    // 模拟Memcached GET操作
    await this.simulateNetworkCall();

    // 在生产环境中，这里会调用真实的Memcached客户端
    // return new Promise((resolve, reject) => {
    //   this.connection?.client.get(key, (err, data) => {
    //     if (err) reject(err);
    //     else resolve(data ? JSON.parse(data) : undefined);
    //   });
    // });

    console.log(`Memcached GET: ${key}`);
    return undefined; // 模拟未找到
  }

  private async setToMemcached<T>(key: string, value: T, options: CacheOperationOptions): Promise<boolean> {
    // 模拟Memcached SET操作
    await this.simulateNetworkCall();

    // 在生产环境中，这里会调用真实的Memcached客户端
    // const serializedValue = JSON.stringify(value);
    // const ttl = options.ttl || 0; // 0表示永不过期
    // return new Promise((resolve, reject) => {
    //   this.connection?.client.set(key, serializedValue, ttl, (err) => {
    //     if (err) reject(err);
    //     else resolve(true);
    //   });
    // });

    console.log(`Memcached SET: ${key} (TTL: ${options.ttl || 'none'})`);
    return true;
  }

  private async deleteFromMemcached(key: string): Promise<boolean> {
    // 模拟Memcached DELETE操作
    await this.simulateNetworkCall();

    // 在生产环境中，这里会调用真实的Memcached客户端
    // return new Promise((resolve, reject) => {
    //   this.connection?.client.del(key, (err) => {
    //     if (err) reject(err);
    //     else resolve(true);
    //   });
    // });

    console.log(`Memcached DEL: ${key}`);
    return true;
  }

  private async hasInMemcached(key: string): Promise<boolean> {
    // Memcached没有直接的EXISTS命令，通过GET判断
    const value = await this.getFromMemcached(key);
    return value !== undefined;
  }

  private async clearMemcached(namespace?: string): Promise<boolean> {
    // 模拟Memcached FLUSH操作
    await this.simulateNetworkCall();

    // 在生产环境中，这里会调用真实的Memcached客户端
    // if (namespace) {
    //   // Memcached不支持模式删除，需要维护键列表
    //   console.warn('Memcached does not support pattern-based deletion');
    //   return false;
    // } else {
    //   return new Promise((resolve, reject) => {
    //     this.connection?.client.flush((err) => {
    //       if (err) reject(err);
    //       else resolve(true);
    //     });
    //   });
    // }

    console.log(`Memcached FLUSH: ${namespace || 'all'}`);
    return !namespace; // 只有全清空才支持
  }

  // ===== 混合缓存操作实现 =====

  private async getFromHybrid<T>(key: string): Promise<T | undefined> {
    const config = this.connection?.config as any;
    const l1Cache = config?.l1Cache as Map<string, CacheEntry>;

    // 先从L1缓存获取
    const l1Entry = l1Cache?.get(key);
    if (l1Entry && !this.isExpired(l1Entry)) {
      console.log(`Hybrid L1 HIT: ${key}`);
      return l1Entry.value as T;
    }

    // L1未命中，从L2缓存获取
    let l2Value: T | undefined;
    if (config?.l2Connection?.provider === 'redis') {
      l2Value = await this.getFromRedis<T>(key);
    } else {
      l2Value = await this.getFromMemcached<T>(key);
    }

    // 如果L2命中，回填到L1
    if (l2Value !== undefined && l1Cache) {
      const entry: CacheEntry<T> = {
        key,
        value: l2Value,
        ttl: config.l1TTL,
        createdAt: new Date().toISOString(),
        accessedAt: new Date().toISOString(),
        accessCount: 1
      };
      l1Cache.set(key, entry);
      console.log(`Hybrid L2 HIT, backfilled to L1: ${key}`);
    }

    return l2Value;
  }

  private async setToHybrid<T>(key: string, value: T, options: CacheOperationOptions): Promise<boolean> {
    const config = this.connection?.config as any;
    const l1Cache = config?.l1Cache as Map<string, CacheEntry>;

    // 根据同步策略处理
    switch (config?.syncStrategy) {
      case 'write-through':
        // 同时写入L1和L2
        if (l1Cache) {
          const entry: CacheEntry<T> = {
            key,
            value,
            ttl: config.l1TTL,
            createdAt: new Date().toISOString(),
            accessedAt: new Date().toISOString(),
            accessCount: 1
          };
          l1Cache.set(key, entry);
        }

        if (config?.l2Connection?.provider === 'redis') {
          return await this.setToRedis(key, value, options);
        } else {
          return await this.setToMemcached(key, value, options);
        }

      case 'write-behind':
        // 先写入L1，异步写入L2
        if (l1Cache) {
          const entry: CacheEntry<T> = {
            key,
            value,
            ttl: config.l1TTL,
            createdAt: new Date().toISOString(),
            accessedAt: new Date().toISOString(),
            accessCount: 1
          };
          l1Cache.set(key, entry);
        }

        // 异步写入L2（在实际实现中会使用队列）
        setTimeout(async () => {
          if (config?.l2Connection?.provider === 'redis') {
            await this.setToRedis(key, value, options);
          } else {
            await this.setToMemcached(key, value, options);
          }
        }, 0);

        return true;

      case 'write-around':
        // 只写入L2，不写入L1
        if (config?.l2Connection?.provider === 'redis') {
          return await this.setToRedis(key, value, options);
        } else {
          return await this.setToMemcached(key, value, options);
        }

      default:
        return false;
    }
  }

  private async deleteFromHybrid(key: string): Promise<boolean> {
    const config = this.connection?.config as any;
    const l1Cache = config?.l1Cache as Map<string, CacheEntry>;

    // 从L1删除
    l1Cache?.delete(key);

    // 从L2删除
    if (config?.l2Connection?.provider === 'redis') {
      return await this.deleteFromRedis(key);
    } else {
      return await this.deleteFromMemcached(key);
    }
  }

  private async hasInHybrid(key: string): Promise<boolean> {
    const config = this.connection?.config as any;
    const l1Cache = config?.l1Cache as Map<string, CacheEntry>;

    // 先检查L1
    const l1Entry = l1Cache?.get(key);
    if (l1Entry && !this.isExpired(l1Entry)) {
      return true;
    }

    // 检查L2
    if (config?.l2Connection?.provider === 'redis') {
      return await this.hasInRedis(key);
    } else {
      return await this.hasInMemcached(key);
    }
  }

  private async clearHybrid(namespace?: string): Promise<boolean> {
    const config = this.connection?.config as any;
    const l1Cache = config?.l1Cache as Map<string, CacheEntry>;

    // 清空L1
    if (namespace) {
      // 按命名空间清空L1
      for (const [key] of l1Cache?.entries() || []) {
        if (key.startsWith(`${namespace}:`)) {
          l1Cache?.delete(key);
        }
      }
    } else {
      l1Cache?.clear();
    }

    // 清空L2
    if (config?.l2Connection?.provider === 'redis') {
      return await this.clearRedis(namespace);
    } else {
      return await this.clearMemcached(namespace);
    }
  }

  // ===== 内存缓存操作实现 =====

  private async getFromMemory<T>(key: string): Promise<T | undefined> {
    const memoryCache = this.connection?.client as Map<string, CacheEntry>;
    const entry = memoryCache?.get(key);

    if (!entry) {
      return undefined;
    }

    // 检查是否过期
    if (this.isExpired(entry)) {
      memoryCache?.delete(key);
      return undefined;
    }

    // 更新访问信息
    entry.accessedAt = new Date().toISOString();
    entry.accessCount++;

    return entry.value as T;
  }

  private async setToMemory<T>(key: string, value: T, options: CacheOperationOptions): Promise<boolean> {
    const memoryCache = this.connection?.client as Map<string, CacheEntry>;

    if (!memoryCache) {
      return false;
    }

    const entry: CacheEntry<T> = {
      key,
      value,
      ttl: options.ttl || 0,
      createdAt: new Date().toISOString(),
      accessedAt: new Date().toISOString(),
      accessCount: 1,
      tags: options.tags,
      metadata: options.namespace ? { namespace: options.namespace } : undefined
    };

    memoryCache.set(key, entry);
    return true;
  }

  private async deleteFromMemory(key: string): Promise<boolean> {
    const memoryCache = this.connection?.client as Map<string, CacheEntry>;
    return memoryCache?.delete(key) || false;
  }

  private async hasInMemory(key: string): Promise<boolean> {
    const memoryCache = this.connection?.client as Map<string, CacheEntry>;
    const entry = memoryCache?.get(key);

    if (!entry) {
      return false;
    }

    // 检查是否过期
    if (this.isExpired(entry)) {
      memoryCache?.delete(key);
      return false;
    }

    return true;
  }

  private async clearMemory(namespace?: string): Promise<boolean> {
    const memoryCache = this.connection?.client as Map<string, CacheEntry>;

    if (!memoryCache) {
      return false;
    }

    if (namespace) {
      // 按命名空间清空
      for (const [key, entry] of memoryCache.entries()) {
        if (key.startsWith(`${namespace}:`) || entry.metadata?.namespace === namespace) {
          memoryCache.delete(key);
        }
      }
    } else {
      memoryCache.clear();
    }

    return true;
  }

  // ===== 辅助方法 =====

  private buildKey(key: string, namespace?: string): string {
    return namespace ? `${namespace}:${key}` : key;
  }

  private isExpired(entry: CacheEntry): boolean {
    if (entry.ttl <= 0) {
      return false; // 永不过期
    }

    const now = Date.now();
    const createdAt = new Date(entry.createdAt).getTime();
    return (now - createdAt) > (entry.ttl * 1000);
  }

  private updateLatency(latency: number): void {
    // 简单的移动平均
    this.statistics.averageLatency = (this.statistics.averageLatency + latency) / 2;
  }

  private async simulateConnection(): Promise<void> {
    // 模拟连接延迟
    const delay = Math.random() * 100 + 50; // 50-150ms
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  private async simulateNetworkCall(): Promise<void> {
    // 模拟网络调用延迟
    const delay = Math.random() * 20 + 5; // 5-25ms
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  private extractHostFromConnectionString(): string {
    try {
      if (this.config.connectionString.includes('://')) {
        const url = new URL(this.config.connectionString);
        return url.hostname;
      } else {
        // 处理简单的host:port格式
        const parts = this.config.connectionString.split(':');
        return parts[0] || 'localhost';
      }
    } catch (error) {
      return 'localhost';
    }
  }

  private extractPortFromConnectionString(): number {
    try {
      if (this.config.connectionString.includes('://')) {
        const url = new URL(this.config.connectionString);
        return url.port ? parseInt(url.port, 10) : this.getDefaultPort();
      } else {
        // 处理简单的host:port格式
        const parts = this.config.connectionString.split(':');
        return parts[1] ? parseInt(parts[1], 10) : this.getDefaultPort();
      }
    } catch (error) {
      return this.getDefaultPort();
    }
  }

  private getDefaultPort(): number {
    switch (this.provider) {
      case 'redis':
        return 6379;
      case 'memcached':
        return 11211;
      default:
        return 0;
    }
  }

  private async disconnectProvider(): Promise<void> {
    switch (this.provider) {
      case 'redis':
        // 在生产环境中，这里会断开Redis连接
        // await this.connection?.client.quit();
        console.log('Disconnected from Redis');
        break;
      case 'memcached':
        // 在生产环境中，这里会断开Memcached连接
        // this.connection?.client.end();
        console.log('Disconnected from Memcached');
        break;
      case 'hybrid':
        // 断开L2连接
        await this.disconnectProvider();
        console.log('Disconnected from Hybrid cache');
        break;
      case 'memory':
        // 内存缓存只需要清理数据
        const memoryCache = this.connection?.client as Map<string, CacheEntry>;
        memoryCache?.clear();
        console.log('Cleared memory cache');
        break;
    }
  }
}
