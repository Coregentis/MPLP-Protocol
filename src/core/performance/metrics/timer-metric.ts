/**
 * MPLP计时器指标实现
 *
 * 计时器指标是直方图的特化版本，专门用于测量时间。
 *
 * @version v1.0.0
 * @created 2025-07-16T12:10:00+08:00
 */

import { ITimerMetric, MetricType, MetricOptions, ITimerMetricBase } from '../interfaces';
import { BaseMetric } from './base-metric';
import { HistogramMetric } from './histogram-metric';

/**
 * 计时器指标实现
 * 不直接继承HistogramMetric，而是组合使用
 */
export class TimerMetric extends BaseMetric<number[]> implements ITimerMetric {
  public readonly type = MetricType.TIMER;
  private histogram: HistogramMetric;
  
  /**
   * 创建计时器指标
   * @param name 指标名称
   * @param options 指标选项
   */
  constructor(name: string, options?: MetricOptions) {
    const timerOptions = options || {};
    if (!timerOptions.unit) {
      timerOptions.unit = 'ms';
    }
    super(name, MetricType.TIMER, [], timerOptions);
    this.histogram = new HistogramMetric(name + '_histogram', timerOptions);
  }
  
  /**
   * 开始计时
   * @returns 停止计时的函数
   */
  public startTimer(): () => void {
    const startTime = performance.now();
    
    // 返回停止计时函数
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      this.recordTime(duration);
    };
  }
  
  /**
   * 记录耗时
   * @param timeInMs 耗时（毫秒）
   */
  public recordTime(timeInMs: number): void {
    this.update(timeInMs);
  }

  /**
   * 添加观测值
   * @param value 观测值
   */
  public update(value: number): void {
    this.histogram.update(value);
    this.value = this.histogram.value;
    this.updateTimestamp();
  }
  
  /**
   * 获取指定百分位数的值
   * @param p 百分位数（0-1之间）
   * @returns 百分位数对应的值
   */
  public getPercentile(p: number): number {
    return this.histogram.getPercentile(p);
  }
  
  /**
   * 获取平均值
   * @returns 平均值
   */
  public getMean(): number {
    return this.histogram.getMean();
  }
  
  /**
   * 获取中位数
   * @returns 中位数
   */
  public getMedian(): number {
    return this.histogram.getMedian();
  }
  
  /**
   * 获取最大值
   * @returns 最大值
   */
  public getMax(): number {
    return this.histogram.getMax();
  }
  
  /**
   * 获取最小值
   * @returns 最小值
   */
  public getMin(): number {
    return this.histogram.getMin();
  }
} 