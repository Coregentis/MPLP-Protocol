/**
 * MPLP性能监控服务实现
 *
 * 提供性能指标收集、存储、分析和报告的核心服务实现。
 * 遵循厂商中立原则，支持不同的指标收集和存储方式。
 *
 * @version v1.0.0
 * @created 2025-07-16T10:00:00+08:00
 */

import {
  IPerformanceMonitorService,
  IMetricRegistry,
  IMetricCollector,
  IMetricStorage,
  IMetricAnalyzer,
  IMetricReporter,
  ITimerMetric,
  MetricOptions,
  PerformanceMonitorConfig,
  MetricType
} from './interfaces';
import { MetricRegistry } from './metric-registry';
import { DefaultMetricCollector } from './collectors/default-collector';
import { MemoryMetricStorage } from './storage/memory-storage';
import { DefaultMetricAnalyzer } from './analyzers/default-analyzer';

/**
 * 默认性能监控配置
 */
const DEFAULT_CONFIG: PerformanceMonitorConfig = {
  defaultCollectionIntervalMs: 60000, // 默认1分钟收集一次
  defaultReportingIntervalMs: 300000, // 默认5分钟报告一次
  enabledMetricTypes: [
    MetricType.COUNTER,
    MetricType.GAUGE,
    MetricType.HISTOGRAM,
    MetricType.TIMER,
    MetricType.METER
  ],
  storage: {
    type: 'memory',
    options: {
      maxEntries: 10000 // 默认最多存储10000条指标
    }
  }
};

/**
 * 性能监控服务实现
 */
export class PerformanceMonitor implements IPerformanceMonitorService {
  public readonly registry: IMetricRegistry;
  public readonly collector: IMetricCollector;
  public readonly storage: IMetricStorage;
  public readonly analyzer: IMetricAnalyzer;
  
  private readonly config: PerformanceMonitorConfig;
  private reporters: IMetricReporter[] = [];
  private isRunning = false;
  private collectionInterval: NodeJS.Timeout | null = null;
  
  /**
   * 创建性能监控服务
   * @param config 监控配置
   * @param registry 可选的自定义指标注册表
   * @param collector 可选的自定义指标收集器
   * @param storage 可选的自定义指标存储
   * @param analyzer 可选的自定义指标分析器
   */
  constructor(
    config?: Partial<PerformanceMonitorConfig>,
    registry?: IMetricRegistry,
    collector?: IMetricCollector,
    storage?: IMetricStorage,
    analyzer?: IMetricAnalyzer
  ) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.registry = registry || new MetricRegistry();
    this.collector = collector || new DefaultMetricCollector(this.registry);
    this.storage = storage || this.createStorage();
    this.analyzer = analyzer || new DefaultMetricAnalyzer();
  }
  
  /**
   * 初始化性能监控服务
   */
  public async init(): Promise<void> {
    // 如果已经在运行，不做任何处理
    if (this.isRunning) {
      return;
    }
    
    // 注册默认指标
    this.registerDefaultMetrics();
    
    // 注册进程指标
    if (typeof process !== 'undefined') {
      this.registerProcessMetrics();
    }
    
    // 注册内存指标
    if (typeof global !== 'undefined') {
      this.registerMemoryMetrics();
    }
    
    // 标记为已初始化
    console.log('性能监控服务初始化完成');
  }
  
  /**
   * 启动性能监控服务
   */
  public async start(): Promise<void> {
    // 如果已经在运行，不做任何处理
    if (this.isRunning) {
      return;
    }
    
    // 确保已初始化
    await this.init();
    
    // 启动收集器
    if (this.config.defaultCollectionIntervalMs) {
      this.collector.startCollection(this.config.defaultCollectionIntervalMs);
    }
    
    // 启动报告器
    if (this.config.defaultReportingIntervalMs !== undefined) {
      const reportingInterval = this.config.defaultReportingIntervalMs;
      this.reporters.forEach(reporter => {
        reporter.scheduleReporting(reportingInterval);
      });
    }
    
    // 标记为运行状态
    this.isRunning = true;
    console.log('性能监控服务已启动');
  }
  
  /**
   * 停止性能监控服务
   */
  public async stop(): Promise<void> {
    // 如果没有运行，不做任何处理
    if (!this.isRunning) {
      return;
    }
    
    // 停止收集器
    this.collector.stopCollection();
    
    // 停止报告器
    this.reporters.forEach(reporter => {
      reporter.stopReporting();
    });
    
    // 标记为非运行状态
    this.isRunning = false;
    console.log('性能监控服务已停止');
  }
  
  /**
   * 添加指标报告器
   * @param reporter 指标报告器
   */
  public addReporter(reporter: IMetricReporter): void {
    this.reporters.push(reporter);
    
    // 如果服务已运行，立即启动报告器
    if (this.isRunning && this.config.defaultReportingIntervalMs !== undefined) {
      reporter.scheduleReporting(this.config.defaultReportingIntervalMs);
    }
  }
  
  /**
   * 移除指标报告器
   * @param reporter 指标报告器
   */
  public removeReporter(reporter: IMetricReporter): void {
    const index = this.reporters.indexOf(reporter);
    if (index !== -1) {
      reporter.stopReporting();
      this.reporters.splice(index, 1);
    }
  }
  
  /**
   * 创建计时器指标
   * @param name 指标名称
   * @param options 指标选项
   * @returns 计时器指标
   */
  public createTimer(name: string, options?: MetricOptions): ITimerMetric {
    return this.registry.timer(name, options);
  }
  
  /**
   * 对同步函数进行计时
   * @param name 指标名称
   * @param fn 要执行的函数
   * @param options 指标选项
   * @returns 函数执行结果
   */
  public time<T>(name: string, fn: () => T, options?: MetricOptions): T {
    const timer = this.registry.timer(name, options);
    const stopTimer = timer.startTimer();
    try {
      const result = fn();
      stopTimer();
      return result;
    } catch (error) {
      stopTimer();
      throw error;
    }
  }
  
  /**
   * 对异步函数进行计时
   * @param name 指标名称
   * @param fn 要执行的异步函数
   * @param options 指标选项
   * @returns 函数执行结果的Promise
   */
  public async timeAsync<T>(name: string, fn: () => Promise<T>, options?: MetricOptions): Promise<T> {
    const timer = this.registry.timer(name, options);
    const stopTimer = timer.startTimer();
    try {
      const result = await fn();
      stopTimer();
      return result;
    } catch (error) {
      stopTimer();
      throw error;
    }
  }
  
  /**
   * 创建配置指定的存储
   */
  private createStorage(): IMetricStorage {
    const storageConfig = this.config.storage || { type: 'memory' };
    
    switch (storageConfig.type) {
      case 'memory':
        return new MemoryMetricStorage(storageConfig.options);
      // 可以根据需要添加更多存储类型
      default:
        return new MemoryMetricStorage(storageConfig.options);
    }
  }
  
  /**
   * 注册默认指标
   */
  private registerDefaultMetrics(): void {
    // 创建服务运行时间指标
    this.registry.gauge('mplp.uptime', {
      description: '服务运行时间（毫秒）',
      unit: 'ms'
    });
    
    // 创建API请求计数器
    this.registry.counter('mplp.api.requests', {
      description: 'API请求总数',
      unit: 'requests'
    });
    
    // 创建API响应时间计时器
    this.registry.timer('mplp.api.response_time', {
      description: 'API响应时间',
      unit: 'ms'
    });
    
    // 创建活跃连接数指标
    this.registry.gauge('mplp.connections.active', {
      description: '当前活跃连接数',
      unit: 'connections'
    });
  }
  
  /**
   * 注册进程相关指标
   */
  private registerProcessMetrics(): void {
    // CPU使用率
    const cpuUsage = this.registry.gauge('process.cpu.usage', {
      description: '进程CPU使用率',
      unit: 'percent'
    });
    
    // 更新CPU使用率
    setInterval(() => {
      if (process.cpuUsage) {
        const usage = process.cpuUsage();
        const totalUsage = (usage.user + usage.system) / 1000000; // 转换为秒
        cpuUsage.update(totalUsage);
      }
    }, 5000);
    
    // 内存使用
    const memUsage = this.registry.gauge('process.memory.usage', {
      description: '进程内存使用',
      unit: 'bytes'
    });
    
    // 更新内存使用
    setInterval(() => {
      if (process.memoryUsage) {
        const usage = process.memoryUsage();
        memUsage.update(usage.rss);
      }
    }, 5000);
  }
  
  /**
   * 注册内存相关指标
   */
  private registerMemoryMetrics(): void {
    if (typeof global.gc === 'function') {
      // 创建GC指标
      const gcCount = this.registry.counter('memory.gc.count', {
        description: '垃圾回收次数',
        unit: 'count'
      });
      
      // 监听GC事件（需要使用--expose-gc运行Node）
      try {
        const v8 = require('v8');
        v8.on('gc', () => {
          gcCount.increment();
        });
      } catch (e) {
        // v8模块可能不可用，忽略错误
      }
    }
  }
} 