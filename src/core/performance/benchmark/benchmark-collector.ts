/**
 * MPLP基准测试收集器
 *
 * 提供基准测试过程中的指标收集功能。
 * 实现IBenchmarkCollector接口，用于收集测试执行过程中的性能指标。
 *
 * @version v1.0.0
 * @created 2025-07-17T11:00:00+08:00
 */

import * as os from 'os';
import { performance } from 'perf_hooks';
import { IBenchmarkCollector } from './interfaces';
import { IMetric, MetricType } from '../interfaces';
import { CounterMetric } from '../metrics/counter-metric';
import { GaugeMetric } from '../metrics/gauge-metric';
import { HistogramMetric } from '../metrics/histogram-metric';

/**
 * 默认基准测试收集器
 */
export class BenchmarkCollector implements IBenchmarkCollector {
  private metrics: IMetric[] = [];
  private isCollecting: boolean = false;
  private startTime: number = 0;
  private intervalId?: NodeJS.Timeout;
  private collectionIntervalMs: number;

  /**
   * 创建基准测试收集器
   * @param collectionIntervalMs 收集间隔（毫秒）
   */
  constructor(collectionIntervalMs: number = 1000) {
    this.collectionIntervalMs = collectionIntervalMs;
  }

  /**
   * 开始收集指标
   */
  public start(): void {
    if (this.isCollecting) {
      return;
    }

    this.isCollecting = true;
    this.startTime = performance.now();
    this.collectSystemMetrics();

    // 定期收集系统指标
    this.intervalId = setInterval(() => {
      this.collectSystemMetrics();
    }, this.collectionIntervalMs);
  }

  /**
   * 停止收集指标
   */
  public stop(): void {
    if (!this.isCollecting) {
      return;
    }

    this.isCollecting = false;
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }

    // 收集最终系统指标
    this.collectSystemMetrics();
  }

  /**
   * 收集指标
   * @returns 收集的指标数组
   */
  public collect(): IMetric[] {
    return [...this.metrics];
  }

  /**
   * 清除收集的指标
   */
  public clear(): void {
    this.metrics = [];
  }

  /**
   * 添加自定义指标
   * @param metric 指标
   */
  public addMetric(metric: IMetric): void {
    this.metrics.push(metric);
  }

  /**
   * 收集系统指标
   */
  private collectSystemMetrics(): void {
    const timestamp = new Date().toISOString();
    const elapsedMs = performance.now() - this.startTime;

    // CPU使用率
    const cpus = os.cpus();
    const cpuUsage = process.cpuUsage();
    const totalCpuUsage = cpuUsage.user + cpuUsage.system;

    // 内存使用
    const memoryUsage = process.memoryUsage();
    const totalMemoryMb = os.totalmem() / (1024 * 1024);
    const freeMemoryMb = os.freemem() / (1024 * 1024);
    const usedMemoryMb = totalMemoryMb - freeMemoryMb;
    const heapUsedMb = memoryUsage.heapUsed / (1024 * 1024);
    const heapTotalMb = memoryUsage.heapTotal / (1024 * 1024);
    const rssMemoryMb = memoryUsage.rss / (1024 * 1024);

    // 添加CPU指标
    const cpuGauge = new GaugeMetric('system.cpu.usage');
    cpuGauge.update(totalCpuUsage);
    if (cpuGauge.tags) {
      cpuGauge.tags.type = 'system';
      cpuGauge.tags.unit = 'microseconds';
    }
    this.metrics.push(cpuGauge);

    // 添加内存指标
    const memUsedGauge = new GaugeMetric('system.memory.used');
    memUsedGauge.update(usedMemoryMb);
    if (memUsedGauge.tags) {
      memUsedGauge.tags.type = 'system';
      memUsedGauge.tags.unit = 'MB';
    }
    this.metrics.push(memUsedGauge);

    const memFreeGauge = new GaugeMetric('system.memory.free');
    memFreeGauge.update(freeMemoryMb);
    if (memFreeGauge.tags) {
      memFreeGauge.tags.type = 'system';
      memFreeGauge.tags.unit = 'MB';
    }
    this.metrics.push(memFreeGauge);

    const heapUsedGauge = new GaugeMetric('system.memory.heap.used');
    heapUsedGauge.update(heapUsedMb);
    if (heapUsedGauge.tags) {
      heapUsedGauge.tags.type = 'system';
      heapUsedGauge.tags.unit = 'MB';
    }
    this.metrics.push(heapUsedGauge);

    const heapTotalGauge = new GaugeMetric('system.memory.heap.total');
    heapTotalGauge.update(heapTotalMb);
    if (heapTotalGauge.tags) {
      heapTotalGauge.tags.type = 'system';
      heapTotalGauge.tags.unit = 'MB';
    }
    this.metrics.push(heapTotalGauge);

    const rssGauge = new GaugeMetric('system.memory.rss');
    rssGauge.update(rssMemoryMb);
    if (rssGauge.tags) {
      rssGauge.tags.type = 'system';
      rssGauge.tags.unit = 'MB';
    }
    this.metrics.push(rssGauge);

    // 添加事件循环延迟指标
    this.collectEventLoopDelay();

    // 添加已运行时间指标
    const elapsedGauge = new GaugeMetric('benchmark.elapsed');
    elapsedGauge.update(elapsedMs);
    if (elapsedGauge.tags) {
      elapsedGauge.tags.type = 'benchmark';
      elapsedGauge.tags.unit = 'ms';
    }
    this.metrics.push(elapsedGauge);
  }

  /**
   * 收集事件循环延迟指标
   */
  private collectEventLoopDelay(): void {
    // 简单的事件循环延迟测量
    const start = performance.now();
    
    setTimeout(() => {
      const end = performance.now();
      const delay = end - start;
      
      // 减去1ms的预期延迟
      const actualDelay = Math.max(0, delay - 1);
      
      const delayGauge = new GaugeMetric('system.eventloop.delay');
      delayGauge.update(actualDelay);
      if (delayGauge.tags) {
        delayGauge.tags.type = 'system';
        delayGauge.tags.unit = 'ms';
      }
      this.metrics.push(delayGauge);
    }, 1);
  }
} 