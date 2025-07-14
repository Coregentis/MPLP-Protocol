/**
 * MPLP性能监控客户端
 *
 * 提供简单易用的性能监控API，封装底层复杂性。
 *
 * @version v1.0.0
 * @created 2025-07-16T13:00:00+08:00
 */

import { 
  MetricType, 
  MetricOptions, 
  IMetric, 
  ICounterMetric, 
  IGaugeMetric, 
  IHistogramMetric, 
  ITimerMetric, 
  IMeterMetric,
  PerformanceMonitorConfig
} from './interfaces';
import { PerformanceMonitor } from './performance-monitor';

/**
 * 性能监控客户端
 * 
 * 提供简单易用的API接口，屏蔽底层实现细节。
 */
export class MonitorClient {
  private monitor: PerformanceMonitor;
  private initialized = false;
  
  /**
   * 创建性能监控客户端
   * @param config 监控配置
   */
  constructor(config?: Partial<PerformanceMonitorConfig>) {
    this.monitor = new PerformanceMonitor(config);
  }
  
  /**
   * 初始化客户端
   */
  public async init(): Promise<void> {
    if (!this.initialized) {
      await this.monitor.init();
      this.initialized = true;
    }
  }
  
  /**
   * 启动监控
   */
  public async start(): Promise<void> {
    if (!this.initialized) {
      await this.init();
    }
    
    await this.monitor.start();
  }
  
  /**
   * 停止监控
   */
  public async stop(): Promise<void> {
    await this.monitor.stop();
  }
  
  /**
   * 计数器
   * 
   * 用于跟踪单调递增的计数，如请求总数。
   * 
   * @param name 指标名称
   * @param options 指标选项
   * @returns 计数器指标
   * 
   * @example
   * ```typescript
   * const requestCounter = monitor.counter('api.requests');
   * requestCounter.increment();
   * ```
   */
  public counter(name: string, options?: MetricOptions): ICounterMetric {
    return this.monitor.registry.counter(name, options);
  }
  
  /**
   * 度量
   * 
   * 用于跟踪可上下波动的值，如内存使用率。
   * 
   * @param name 指标名称
   * @param options 指标选项
   * @returns 度量指标
   * 
   * @example
   * ```typescript
   * const memoryGauge = monitor.gauge('system.memory');
   * memoryGauge.update(process.memoryUsage().heapUsed);
   * ```
   */
  public gauge(name: string, options?: MetricOptions): IGaugeMetric {
    return this.monitor.registry.gauge(name, options);
  }
  
  /**
   * 直方图
   * 
   * 用于跟踪值的分布情况，如请求大小分布。
   * 
   * @param name 指标名称
   * @param options 指标选项
   * @returns 直方图指标
   * 
   * @example
   * ```typescript
   * const requestSizeHistogram = monitor.histogram('api.request_size');
   * requestSizeHistogram.update(request.body.length);
   * ```
   */
  public histogram(name: string, options?: MetricOptions): IHistogramMetric {
    return this.monitor.registry.histogram(name, options);
  }
  
  /**
   * 计时器
   * 
   * 用于测量操作耗时，如API响应时间。
   * 
   * @param name 指标名称
   * @param options 指标选项
   * @returns 计时器指标
   * 
   * @example
   * ```typescript
   * const responseTimer = monitor.timer('api.response_time');
   * const stopTimer = responseTimer.startTimer();
   * // 执行操作
   * stopTimer(); // 停止计时并记录耗时
   * ```
   */
  public timer(name: string, options?: MetricOptions): ITimerMetric {
    return this.monitor.registry.timer(name, options);
  }
  
  /**
   * 吞吐率
   * 
   * 用于测量事件发生频率，如每秒请求数。
   * 
   * @param name 指标名称
   * @param options 指标选项
   * @returns 吞吐率指标
   * 
   * @example
   * ```typescript
   * const requestMeter = monitor.meter('api.requests_per_second');
   * requestMeter.mark(); // 记录一次请求
   * ```
   */
  public meter(name: string, options?: MetricOptions): IMeterMetric {
    return this.monitor.registry.meter(name, options);
  }
  
  /**
   * 计时函数执行
   * 
   * 用于测量同步函数的执行时间。
   * 
   * @param name 指标名称
   * @param fn 要执行的函数
   * @param options 指标选项
   * @returns 函数执行结果
   * 
   * @example
   * ```typescript
   * const result = monitor.time('process_data', () => {
   *   // 处理数据的代码
   *   return processedData;
   * });
   * ```
   */
  public time<T>(name: string, fn: () => T, options?: MetricOptions): T {
    return this.monitor.time(name, fn, options);
  }
  
  /**
   * 计时异步函数执行
   * 
   * 用于测量异步函数的执行时间。
   * 
   * @param name 指标名称
   * @param fn 要执行的异步函数
   * @param options 指标选项
   * @returns 函数执行结果的Promise
   * 
   * @example
   * ```typescript
   * const result = await monitor.timeAsync('fetch_data', async () => {
   *   // 异步获取数据的代码
   *   return await fetchData();
   * });
   * ```
   */
  public async timeAsync<T>(name: string, fn: () => Promise<T>, options?: MetricOptions): Promise<T> {
    return this.monitor.timeAsync(name, fn, options);
  }
  
  /**
   * 添加API请求监控中间件
   * 
   * 用于Express应用，自动监控API请求。
   * 
   * @returns Express中间件函数
   * 
   * @example
   * ```typescript
   * const app = express();
   * app.use(monitor.apiMetricsMiddleware());
   * ```
   */
  public apiMetricsMiddleware(): Function {
    const requestCounter = this.counter('api.requests', {
      description: 'API请求计数',
      unit: 'requests'
    });
    
    const responseTimer = this.timer('api.response_time', {
      description: 'API响应时间',
      unit: 'ms'
    });
    
    const activeRequests = this.gauge('api.active_requests', {
      description: '当前活跃请求数',
      unit: 'requests'
    });
    
    // Express中间件函数
    return (req: any, res: any, next: Function) => {
      // 增加请求计数
      requestCounter.increment();
      
      // 增加活跃请求计数
      activeRequests.increment();
      
      // 开始计时
      const stopTimer = responseTimer.startTimer();
      
      // 监控请求完成
      const end = res.end;
      res.end = (...args: any[]) => {
        // 恢复原始end方法
        res.end = end;
        
        // 停止计时
        stopTimer();
        
        // 减少活跃请求计数
        activeRequests.decrement();
        
        // 调用原始end方法
        return res.end(...args);
      };
      
      // 继续处理请求
      next();
    };
  }
} 