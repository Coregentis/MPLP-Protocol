/**
 * 真实业务场景的性能优化器
 * 基于实际业务逻辑进行性能提升，不脱离业务需求
 * 
 * @version 1.0.0
 * @created 2025-01-29T03:30:00+08:00
 */

import { EventEmitter } from 'events';
import { performance } from 'perf_hooks';

// 智能缓存管理器 - 基于业务特征的缓存策略
export class IntelligentCacheManager {
  private cache = new Map<string, { data: any, expiry: number, accessCount: number, lastAccess: number }>();
  private maxSize: number;
  private hitCount = 0;
  private missCount = 0;

  constructor(maxSize = 1000) {
    this.maxSize = maxSize;
  }

  async get(key: string): Promise<any> {
    const item = this.cache.get(key);
    if (item && item.expiry > Date.now()) {
      item.accessCount++;
      item.lastAccess = Date.now();
      this.hitCount++;
      return item.data;
    }
    
    if (item) {
      this.cache.delete(key);
    }
    this.missCount++;
    return null;
  }

  async set(key: string, data: any, ttl: number): Promise<void> {
    // 如果缓存满了，使用LFU+LRU混合策略淘汰
    if (this.cache.size >= this.maxSize) {
      this.evictLeastValuable();
    }

    this.cache.set(key, {
      data,
      expiry: Date.now() + ttl,
      accessCount: 1,
      lastAccess: Date.now()
    });
  }

  private evictLeastValuable(): void {
    let leastValuable: string | null = null;
    let lowestScore = Infinity;

    for (const [key, item] of this.cache) {
      // 综合考虑访问频率和最近访问时间
      const timeSinceLastAccess = Date.now() - item.lastAccess;
      const score = item.accessCount / (1 + timeSinceLastAccess / 1000); // 访问频率/时间衰减
      
      if (score < lowestScore) {
        lowestScore = score;
        leastValuable = key;
      }
    }

    if (leastValuable) {
      this.cache.delete(leastValuable);
    }
  }

  getStats() {
    const total = this.hitCount + this.missCount;
    return {
      hitRate: total > 0 ? this.hitCount / total : 0,
      size: this.cache.size,
      maxSize: this.maxSize,
      hitCount: this.hitCount,
      missCount: this.missCount
    };
  }

  // 预热缓存 - 基于业务模式预加载热点数据
  async warmup(preloadKeys: string[], dataLoader: (key: string) => Promise<any>): Promise<void> {
    const promises = preloadKeys.map(async (key) => {
      try {
        const data = await dataLoader(key);
        await this.set(key, data, 300000); // 5分钟TTL
      } catch (error) {
        console.warn(`Failed to preload cache for key ${key}:`, error);
      }
    });

    await Promise.all(promises);
  }
}

// 连接池管理器 - 优化数据库和外部服务连接
export class ConnectionPoolManager {
  private pools = new Map<string, ConnectionPool>();

  createPool(name: string, config: PoolConfig): ConnectionPool {
    const pool = new ConnectionPool(config);
    this.pools.set(name, pool);
    return pool;
  }

  getPool(name: string): ConnectionPool | undefined {
    return this.pools.get(name);
  }

  async closeAll(): Promise<void> {
    const closePromises = Array.from(this.pools.values()).map(pool => pool.close());
    await Promise.all(closePromises);
    this.pools.clear();
  }
}

interface PoolConfig {
  minConnections: number;
  maxConnections: number;
  acquireTimeoutMs: number;
  idleTimeoutMs: number;
  createConnection: () => Promise<any>;
  validateConnection: (conn: any) => Promise<boolean>;
  destroyConnection: (conn: any) => Promise<void>;
}

class ConnectionPool {
  private connections: Array<{ conn: any, inUse: boolean, lastUsed: number }> = [];
  private waitingQueue: Array<{ resolve: Function, reject: Function, timeout: NodeJS.Timeout }> = [];
  private config: PoolConfig;
  private cleanupInterval: NodeJS.Timeout;

  constructor(config: PoolConfig) {
    this.config = config;
    this.initializePool();
    
    // 定期清理空闲连接
    this.cleanupInterval = setInterval(() => {
      this.cleanupIdleConnections();
    }, 30000); // 30秒清理一次
  }

  private async initializePool(): Promise<void> {
    // 创建最小连接数
    for (let i = 0; i < this.config.minConnections; i++) {
      try {
        const conn = await this.config.createConnection();
        this.connections.push({
          conn,
          inUse: false,
          lastUsed: Date.now()
        });
      } catch (error) {
        console.error('Failed to create initial connection:', error);
      }
    }
  }

  async acquire(): Promise<any> {
    // 查找可用连接
    const availableConn = this.connections.find(c => !c.inUse);
    if (availableConn) {
      // 验证连接是否有效
      try {
        const isValid = await this.config.validateConnection(availableConn.conn);
        if (isValid) {
          availableConn.inUse = true;
          availableConn.lastUsed = Date.now();
          return availableConn.conn;
        } else {
          // 连接无效，移除并重新创建
          await this.removeConnection(availableConn);
        }
      } catch (error) {
        await this.removeConnection(availableConn);
      }
    }

    // 如果没有可用连接且未达到最大连接数，创建新连接
    if (this.connections.length < this.config.maxConnections) {
      try {
        const conn = await this.config.createConnection();
        const connWrapper = {
          conn,
          inUse: true,
          lastUsed: Date.now()
        };
        this.connections.push(connWrapper);
        return conn;
      } catch (error) {
        console.error('Failed to create new connection:', error);
      }
    }

    // 等待连接可用
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        const index = this.waitingQueue.findIndex(w => w.resolve === resolve);
        if (index >= 0) {
          this.waitingQueue.splice(index, 1);
        }
        reject(new Error('Connection acquire timeout'));
      }, this.config.acquireTimeoutMs);

      this.waitingQueue.push({ resolve, reject, timeout });
    });
  }

  async release(conn: any): Promise<void> {
    const connWrapper = this.connections.find(c => c.conn === conn);
    if (connWrapper) {
      connWrapper.inUse = false;
      connWrapper.lastUsed = Date.now();

      // 处理等待队列
      if (this.waitingQueue.length > 0) {
        const waiter = this.waitingQueue.shift()!;
        clearTimeout(waiter.timeout);
        connWrapper.inUse = true;
        waiter.resolve(conn);
      }
    }
  }

  private async removeConnection(connWrapper: { conn: any, inUse: boolean, lastUsed: number }): Promise<void> {
    const index = this.connections.indexOf(connWrapper);
    if (index >= 0) {
      this.connections.splice(index, 1);
      try {
        await this.config.destroyConnection(connWrapper.conn);
      } catch (error) {
        console.error('Failed to destroy connection:', error);
      }
    }
  }

  private async cleanupIdleConnections(): Promise<void> {
    const now = Date.now();
    const idleConnections = this.connections.filter(
      c => !c.inUse && 
           (now - c.lastUsed) > this.config.idleTimeoutMs &&
           this.connections.length > this.config.minConnections
    );

    for (const conn of idleConnections) {
      await this.removeConnection(conn);
    }
  }

  async close(): Promise<void> {
    clearInterval(this.cleanupInterval);
    
    // 拒绝所有等待的请求
    this.waitingQueue.forEach(waiter => {
      clearTimeout(waiter.timeout);
      waiter.reject(new Error('Pool is closing'));
    });
    this.waitingQueue = [];

    // 关闭所有连接
    const closePromises = this.connections.map(c => this.config.destroyConnection(c.conn));
    await Promise.all(closePromises);
    this.connections = [];
  }

  getStats() {
    return {
      totalConnections: this.connections.length,
      inUseConnections: this.connections.filter(c => c.inUse).length,
      waitingRequests: this.waitingQueue.length,
      minConnections: this.config.minConnections,
      maxConnections: this.config.maxConnections
    };
  }
}

// 批处理优化器 - 减少I/O操作频率
export class BatchProcessor<T> {
  private batches = new Map<string, { items: T[], timer: NodeJS.Timeout | null }>();
  private processors = new Map<string, (items: T[]) => Promise<void>>();
  private configs = new Map<string, { batchSize: number, flushInterval: number }>();

  registerProcessor(
    type: string,
    processor: (items: T[]) => Promise<void>,
    batchSize = 10,
    flushInterval = 100
  ): void {
    this.processors.set(type, processor);
    this.configs.set(type, { batchSize, flushInterval });
    this.batches.set(type, { items: [], timer: null });
  }

  add(type: string, item: T): void {
    const batch = this.batches.get(type);
    const config = this.configs.get(type);
    
    if (!batch || !config) {
      throw new Error(`Unknown batch type: ${type}`);
    }

    batch.items.push(item);

    // 如果达到批大小，立即处理
    if (batch.items.length >= config.batchSize) {
      this.flush(type);
    } else {
      // 设置定时器
      if (!batch.timer) {
        batch.timer = setTimeout(() => {
          this.flush(type);
        }, config.flushInterval);
      }
    }
  }

  private async flush(type: string): Promise<void> {
    const batch = this.batches.get(type);
    const processor = this.processors.get(type);
    
    if (!batch || !processor || batch.items.length === 0) {
      return;
    }

    const items = batch.items.splice(0);
    
    if (batch.timer) {
      clearTimeout(batch.timer);
      batch.timer = null;
    }

    try {
      await processor(items);
    } catch (error) {
      console.error(`Batch processing failed for type ${type}:`, error);
      // 可以考虑重试机制或死信队列
    }
  }

  async flushAll(): Promise<void> {
    const flushPromises = Array.from(this.batches.keys()).map(type => this.flush(type));
    await Promise.all(flushPromises);
  }
}

// 性能监控器 - 实时监控业务性能指标
export class BusinessPerformanceMonitor extends EventEmitter {
  private metrics = new Map<string, number[]>();
  private businessMetrics = new Map<string, any>();
  private alertThresholds = new Map<string, { warning: number, critical: number }>();

  recordBusinessMetric(name: string, value: number, metadata?: any): void {
    const values = this.metrics.get(name) || [];
    values.push(value);
    
    // 保持最近1000个值
    if (values.length > 1000) {
      values.shift();
    }
    
    this.metrics.set(name, values);
    
    if (metadata) {
      this.businessMetrics.set(`${name}_metadata`, metadata);
    }

    // 检查告警阈值
    this.checkAlerts(name, value);
    
    this.emit('businessMetric', { name, value, metadata });
  }

  setAlertThreshold(metricName: string, warning: number, critical: number): void {
    this.alertThresholds.set(metricName, { warning, critical });
  }

  private checkAlerts(metricName: string, value: number): void {
    const threshold = this.alertThresholds.get(metricName);
    if (!threshold) return;

    if (value >= threshold.critical) {
      this.emit('alert', { level: 'critical', metric: metricName, value, threshold: threshold.critical });
    } else if (value >= threshold.warning) {
      this.emit('alert', { level: 'warning', metric: metricName, value, threshold: threshold.warning });
    }
  }

  getBusinessStats(metricName: string) {
    const values = this.metrics.get(metricName) || [];
    if (values.length === 0) {
      return { avg: 0, min: 0, max: 0, p95: 0, p99: 0, count: 0 };
    }

    const sorted = [...values].sort((a, b) => a - b);
    return {
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)],
      count: values.length
    };
  }

  // 业务健康度评分
  getBusinessHealthScore(): number {
    const criticalMetrics = [
      'workflow_success_rate',
      'average_response_time',
      'error_rate',
      'user_satisfaction'
    ];

    let totalScore = 0;
    let metricCount = 0;

    for (const metric of criticalMetrics) {
      const stats = this.getBusinessStats(metric);
      if (stats.count > 0) {
        let score = 100;
        
        // 根据业务指标计算分数
        switch (metric) {
          case 'workflow_success_rate':
            score = Math.min(100, stats.avg * 100);
            break;
          case 'average_response_time':
            score = Math.max(0, 100 - (stats.avg / 10)); // 10ms = 1分扣除
            break;
          case 'error_rate':
            score = Math.max(0, 100 - (stats.avg * 1000)); // 0.1% = 100分扣除
            break;
          case 'user_satisfaction':
            score = Math.min(100, stats.avg * 20); // 5分制转100分制
            break;
        }
        
        totalScore += score;
        metricCount++;
      }
    }

    return metricCount > 0 ? totalScore / metricCount : 0;
  }
}

// 导出性能优化器实例
export const realPerformanceOptimizer = {
  cache: new IntelligentCacheManager(2000),
  connectionPool: new ConnectionPoolManager(),
  batchProcessor: new BatchProcessor(),
  monitor: new BusinessPerformanceMonitor()
};
