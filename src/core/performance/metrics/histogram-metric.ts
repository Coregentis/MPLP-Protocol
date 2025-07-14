/**
 * MPLP直方图指标实现
 *
 * 直方图指标用于跟踪数值分布情况，如请求延迟分布。
 *
 * @version v1.0.0
 * @created 2025-07-16T12:00:00+08:00
 */

import { IHistogramMetric, MetricType, MetricOptions } from '../interfaces';
import { BaseMetric } from './base-metric';

/**
 * 直方图指标实现
 */
export class HistogramMetric extends BaseMetric<number[]> implements IHistogramMetric {
  public readonly type = MetricType.HISTOGRAM;
  
  // 存储已排序的值，便于计算百分位数
  private sortedValues: number[] = [];
  private needsSort = false;
  
  /**
   * 创建直方图指标
   * @param name 指标名称
   * @param options 指标选项
   */
  constructor(name: string, options?: MetricOptions) {
    super(name, MetricType.HISTOGRAM, [], options);
  }
  
  /**
   * 添加观测值
   * @param value 观测值
   */
  public update(value: number): void {
    this.value.push(value);
    this.needsSort = true;
    this.updateTimestamp();
  }
  
  /**
   * 获取指定百分位数的值
   * @param p 百分位数（0-1之间）
   * @returns 百分位数对应的值
   */
  public getPercentile(p: number): number {
    if (p < 0 || p > 1) {
      throw new Error('百分位数必须在0和1之间');
    }
    
    if (this.value.length === 0) {
      return 0;
    }
    
    this.ensureSorted();
    
    if (p === 0) {
      return this.sortedValues[0];
    }
    
    if (p === 1) {
      return this.sortedValues[this.sortedValues.length - 1];
    }
    
    const pos = p * (this.sortedValues.length - 1);
    const lower = Math.floor(pos);
    const upper = Math.ceil(pos);
    
    if (lower === upper) {
      return this.sortedValues[lower];
    }
    
    const weight = pos - lower;
    return this.sortedValues[lower] * (1 - weight) + this.sortedValues[upper] * weight;
  }
  
  /**
   * 获取平均值
   * @returns 平均值
   */
  public getMean(): number {
    if (this.value.length === 0) {
      return 0;
    }
    
    const sum = this.value.reduce((a, b) => a + b, 0);
    return sum / this.value.length;
  }
  
  /**
   * 获取中位数
   * @returns 中位数
   */
  public getMedian(): number {
    return this.getPercentile(0.5);
  }
  
  /**
   * 获取最大值
   * @returns 最大值
   */
  public getMax(): number {
    if (this.value.length === 0) {
      return 0;
    }
    
    this.ensureSorted();
    return this.sortedValues[this.sortedValues.length - 1];
  }
  
  /**
   * 获取最小值
   * @returns 最小值
   */
  public getMin(): number {
    if (this.value.length === 0) {
      return 0;
    }
    
    this.ensureSorted();
    return this.sortedValues[0];
  }
  
  /**
   * 确保值已排序
   */
  private ensureSorted(): void {
    if (this.needsSort) {
      this.sortedValues = [...this.value].sort((a, b) => a - b);
      this.needsSort = false;
    }
  }
} 