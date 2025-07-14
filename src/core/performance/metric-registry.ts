/**
 * MPLP指标注册表实现
 *
 * 负责创建和管理各类型的性能指标。
 * 提供指标创建、获取和删除功能。
 *
 * @version v1.0.0
 * @created 2025-07-16T11:00:00+08:00
 */

import {
  IMetricRegistry,
  IMetric,
  ICounterMetric,
  IGaugeMetric,
  IHistogramMetric,
  ITimerMetric,
  IMeterMetric,
  MetricType,
  MetricOptions
} from './interfaces';
import { CounterMetric } from './metrics/counter-metric';
import { GaugeMetric } from './metrics/gauge-metric';
import { HistogramMetric } from './metrics/histogram-metric';
import { TimerMetric } from './metrics/timer-metric';
import { MeterMetric } from './metrics/meter-metric';

/**
 * 指标注册表实现
 */
export class MetricRegistry implements IMetricRegistry {
  // 使用更通用的类型，允许不同类型的值
  private metrics = new Map<string, IMetric<any>>();
  
  /**
   * 创建或获取计数器指标
   * @param name 指标名称
   * @param options 指标选项
   * @returns 计数器指标
   */
  public counter(name: string, options?: MetricOptions): ICounterMetric {
    const existing = this.getMetric(name);
    if (existing && existing.type === MetricType.COUNTER) {
      return existing as ICounterMetric;
    }
    
    const counter = new CounterMetric(name, options);
    this.metrics.set(name, counter);
    return counter;
  }
  
  /**
   * 创建或获取度量指标
   * @param name 指标名称
   * @param options 指标选项
   * @returns 度量指标
   */
  public gauge(name: string, options?: MetricOptions): IGaugeMetric {
    const existing = this.getMetric(name);
    if (existing && existing.type === MetricType.GAUGE) {
      return existing as IGaugeMetric;
    }
    
    const gauge = new GaugeMetric(name, options);
    this.metrics.set(name, gauge);
    return gauge;
  }
  
  /**
   * 创建或获取直方图指标
   * @param name 指标名称
   * @param options 指标选项
   * @returns 直方图指标
   */
  public histogram(name: string, options?: MetricOptions): IHistogramMetric {
    const existing = this.getMetric(name);
    if (existing && existing.type === MetricType.HISTOGRAM) {
      // 使用类型守卫确保类型安全
      if (this.isHistogramMetric(existing)) {
        return existing;
      }
    }
    
    const histogram = new HistogramMetric(name, options);
    this.metrics.set(name, histogram);
    return histogram;
  }
  
  /**
   * 创建或获取计时器指标
   * @param name 指标名称
   * @param options 指标选项
   * @returns 计时器指标
   */
  public timer(name: string, options?: MetricOptions): ITimerMetric {
    const existing = this.getMetric(name);
    if (existing && existing.type === MetricType.TIMER) {
      // 使用类型守卫确保类型安全
      if (this.isTimerMetric(existing)) {
        return existing;
      }
    }
    
    const timer = new TimerMetric(name, options);
    this.metrics.set(name, timer);
    return timer;
  }
  
  /**
   * 创建或获取吞吐率指标
   * @param name 指标名称
   * @param options 指标选项
   * @returns 吞吐率指标
   */
  public meter(name: string, options?: MetricOptions): IMeterMetric {
    const existing = this.getMetric(name);
    if (existing && existing.type === MetricType.METER) {
      return existing as IMeterMetric;
    }
    
    const meter = new MeterMetric(name, options);
    this.metrics.set(name, meter);
    return meter;
  }
  
  /**
   * 获取指标
   * @param name 指标名称
   * @returns 指标实例，如果不存在则返回undefined
   */
  public getMetric(name: string): IMetric<any> | undefined {
    return this.metrics.get(name);
  }
  
  /**
   * 获取所有指标
   * @returns 所有指标的数组
   */
  public getAllMetrics(): IMetric<any>[] {
    return Array.from(this.metrics.values());
  }
  
  /**
   * 移除指标
   * @param name 指标名称
   * @returns 是否成功移除
   */
  public removeMetric(name: string): boolean {
    return this.metrics.delete(name);
  }
  
  /**
   * 清除所有指标
   */
  public clear(): void {
    this.metrics.clear();
  }
  
  /**
   * 类型守卫：检查是否为直方图指标
   * @param metric 待检查的指标
   * @returns 是否为直方图指标
   */
  private isHistogramMetric(metric: IMetric<any>): metric is IHistogramMetric {
    return (
      metric.type === MetricType.HISTOGRAM &&
      'update' in metric &&
      'getPercentile' in metric &&
      'getMean' in metric &&
      'getMedian' in metric &&
      'getMax' in metric &&
      'getMin' in metric &&
      Array.isArray(metric.value)
    );
  }
  
  /**
   * 类型守卫：检查是否为计时器指标
   * @param metric 待检查的指标
   * @returns 是否为计时器指标
   */
  private isTimerMetric(metric: IMetric<any>): metric is ITimerMetric {
    return (
      metric.type === MetricType.TIMER &&
      'startTimer' in metric &&
      'recordTime' in metric &&
      'getPercentile' in metric &&
      'getMean' in metric &&
      'getMedian' in metric &&
      Array.isArray(metric.value)
    );
  }
} 