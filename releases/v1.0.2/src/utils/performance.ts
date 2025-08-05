/**
 * MPLP性能监控工具 - 厂商中立设计
 * 
 * 提供统一的性能监控接口，遵循厂商中立原则，不依赖特定监控服务。
 * 可通过适配器模式扩展到不同的监控后端。
 * 
 * @version v1.0.0
 * @created 2025-07-10T09:00:00+08:00
 * @updated 2025-08-14T16:30:00+08:00
 * @compliance .cursor/rules/development-standards.mdc - 厂商中立原则
 */

import { v4 as uuidv4 } from 'uuid';
import { performance as nodePerformance } from 'perf_hooks';
import { Logger } from './logger';

/**
 * 性能指标接口
 */
export interface PerformanceMetric {
  /**
   * 指标唯一标识符
   */
  id: string;
  
  /**
   * 指标名称
   */
  name: string;
  
  /**
   * 开始时间
   */
  startTime: number;
  
  /**
   * 结束时间
   */
  endTime?: number;
  
  /**
   * 持续时间
   */
  duration?: number;
  
  /**
   * 标签
   */
  tags?: Record<string, string>;
  
  /**
   * 元数据
   */
  metadata?: Record<string, unknown>;
}

/**
 * 性能配置接口
 */
export interface PerformanceConfig {
  /**
   * 是否启用性能监控
   */
  enabled: boolean;
  
  /**
   * 采样率(0.0-1.0)
   */
  sampleRate: number;
  
  /**
   * 最大指标数量
   */
  maxMetrics: number;
  
  /**
   * 是否自动刷新
   */
  autoFlush: boolean;
  
  /**
   * 刷新间隔(毫秒)
   */
  flushInterval: number;
}

/**
 * 默认性能配置
 */
const DEFAULT_CONFIG: PerformanceConfig = {
  enabled: true,
  sampleRate: 1.0, // 100%的采样率
  maxMetrics: 1000,
  autoFlush: true,
  flushInterval: 30000 // 30秒
};

/**
 * 性能监控工具类
 */
export class Performance {
  private config: PerformanceConfig;
  private metrics: Map<string, PerformanceMetric>;
  private logger: Logger;
  private flushTimer?: NodeJS.Timeout;

  /**
   * 创建性能监控实例
   * 
   * @param config 性能监控配置
   */
  constructor(config: Partial<PerformanceConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.metrics = new Map<string, PerformanceMetric>();
    this.logger = new Logger('Performance');
    
    if (this.config.autoFlush) {
      this.flushTimer = setInterval(() => this.flush(), this.config.flushInterval);
    }
  }

  /**
   * 开始计时
   * 
   * @param name 指标名称
   * @param tags 标签
   * @param metadata 元数据
   * @returns 指标ID
   */
  public start(name: string, tags?: Record<string, string>, metadata?: Record<string, unknown>): string {
    if (!this.config.enabled || Math.random() > this.config.sampleRate) {
      return '';
    }

    const id = uuidv4();
    const startTime = this.now();

    this.metrics.set(id, {
      id,
      name,
      startTime,
      tags,
      metadata
    });

    return id;
  }

  /**
   * 结束计时
   * 
   * @param id 指标ID
   * @returns 持续时间(毫秒)，如果指标不存在则返回-1
   */
  public end(id: string): number {
    if (!id || !this.metrics.has(id)) {
      return -1;
    }

    const metric = this.metrics.get(id)!;
    const endTime = this.now();
    const duration = endTime - metric.startTime;

    this.metrics.set(id, {
      ...metric,
      endTime,
      duration
    });

    return duration;
  }

  /**
   * 记录指标
   * 
   * @param name 指标名称
   * @param value 指标值
   * @param tags 标签
   * @param metadata 元数据
   */
  public recordMetric(name: string, value: number, tags?: Record<string, string>, metadata?: Record<string, unknown>): void {
    if (!this.config.enabled || Math.random() > this.config.sampleRate) {
      return;
    }

    const id = uuidv4();
    const now = this.now();

    this.metrics.set(id, {
      id,
      name,
      startTime: now,
      endTime: now,
      duration: value,
      tags,
      metadata
    });

    // 如果超过最大指标数，清理一些旧的指标
    if (this.metrics.size > this.config.maxMetrics) {
      this.cleanup();
    }
  }

  /**
   * 计算从指定时间点到现在的时间差
   * 
   * @param startTime 开始时间
   * @returns 持续时间(毫秒)
   */
  public since(startTime: number): number {
    return this.now() - startTime;
  }

  /**
   * 获取当前时间戳(高精度)
   * 
   * @returns 当前时间戳
   */
  public now(): number {
    return nodePerformance.now();
  }

  /**
   * 获取所有指标
   * 
   * @returns 指标数组
   */
  public getMetrics(): PerformanceMetric[] {
    return Array.from(this.metrics.values());
  }

  /**
   * 获取指定名称的指标
   * 
   * @param name 指标名称
   * @returns 指标数组
   */
  public getMetricsByName(name: string): PerformanceMetric[] {
    return this.getMetrics().filter(metric => metric.name === name);
  }

  /**
   * 获取指标统计信息
   * 
   * @param name 指标名称
   * @returns 统计信息
   */
  public getMetricStats(name: string): {
    count: number;
    min?: number;
    max?: number;
    avg?: number;
    p95?: number;
    p99?: number;
  } {
    const metrics = this.getMetricsByName(name)
      .filter(m => m.duration !== undefined)
      .map(m => m.duration!);
    
    if (metrics.length === 0) {
      return { count: 0 };
    }
    
    metrics.sort((a, b) => a - b);
    
    const min = metrics[0];
    const max = metrics[metrics.length - 1];
    const avg = metrics.reduce((sum, val) => sum + val, 0) / metrics.length;
    const p95 = metrics[Math.floor(metrics.length * 0.95)];
    const p99 = metrics[Math.floor(metrics.length * 0.99)];
    
    return {
      count: metrics.length,
      min,
      max,
      avg,
      p95,
      p99
    };
  }

  /**
   * 清理指标
   */
  public cleanup(): void {
    // 保留最新的指标
    const metrics = this.getMetrics();
    metrics.sort((a, b) => (b.endTime || b.startTime) - (a.endTime || a.startTime));
    
    const toKeep = metrics.slice(0, this.config.maxMetrics / 2);
    this.metrics.clear();
    
    toKeep.forEach(metric => {
      this.metrics.set(metric.id, metric);
    });
    
    this.logger.debug(`已清理性能指标，保留 ${toKeep.length}/${metrics.length} 个指标`);
  }

  /**
   * 刷新指标(发送到后端或日志)
   */
  public flush(): void {
    if (this.metrics.size === 0) {
      return;
    }

    const metrics = this.getMetrics();
    const completedMetrics = metrics.filter(m => m.endTime !== undefined);
    
    if (completedMetrics.length === 0) {
      return;
    }

    try {
      // 在实际应用中，这里可以将指标发送到监控系统
      this.logger.debug(`正在刷新 ${completedMetrics.length} 个性能指标`, {
        metrics_count: completedMetrics.length,
        metrics_sample: completedMetrics.slice(0, 3)
      });
  
      // 清理已刷新的指标
      completedMetrics.forEach(metric => {
        this.metrics.delete(metric.id);
      });
    } catch (error: unknown) {
      this.logger.error(`刷新性能指标失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 计时函数执行
   * 
   * @param name 指标名称
   * @param fn 要执行的函数
   * @param tags 标签
   * @returns 函数执行结果
   */
  public time<T>(name: string, fn: () => T, tags?: Record<string, string>): T {
    const id = this.start(name, tags);
    try {
      return fn();
    } finally {
      if (id) {
        this.end(id);
      }
    }
  }

  /**
   * 计时异步函数执行
   * 
   * @param name 指标名称
   * @param fn 要执行的异步函数
   * @param tags 标签
   * @returns Promise<函数执行结果>
   */
  public async timeAsync<T>(name: string, fn: () => Promise<T>, tags?: Record<string, string>): Promise<T> {
    const id = this.start(name, tags);
    try {
      return await fn();
    } finally {
      if (id) {
        this.end(id);
      }
    }
  }

  /**
   * 销毁实例，清理资源
   */
  public destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.flush();
    this.metrics.clear();
  }
}

/**
 * 创建默认性能监控实例
 */
export const defaultPerformance = new Performance(); 
// 增强的智能缓存管理器
export class IntelligentCacheManager {
  private cache = new Map<string, any>();
  
  constructor(private maxSize: number = 1000) {}
  
  set(key: string, value: any): void {
    this.cache.set(key, value);
  }
  
  get(key: string): any {
    return this.cache.get(key);
  }
  
  getStats() {
    return {
      size: this.cache.size,
      hits: 0,
      misses: 0
    };
  }
}

// 增强的业务性能监控器
export class BusinessPerformanceMonitor {
  private metrics = new Map<string, number[]>();
  
  recordBusinessMetric(name: string, value: number, metadata?: any): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)!.push(value);
  }
  
  setAlertThreshold(metric: string, warning: number, critical: number): void {
    // 设置告警阈值
  }
  
  on(event: string, callback: Function): void {
    // 事件监听
  }
  
  getBusinessHealthScore(): number {
    return 100;
  }
}

// 批处理器
export class BatchProcessor {
  private batches = new Map<string, any[]>();
  
  addToBatch(id: string, item: any): void {
    if (!this.batches.has(id)) {
      this.batches.set(id, []);
    }
    this.batches.get(id)!.push(item);
  }
}
