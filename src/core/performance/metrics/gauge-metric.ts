/**
 * MPLP度量指标实现
 *
 * 度量指标用于表示可以上下波动的值，如当前内存使用率。
 *
 * @version v1.0.0
 * @created 2025-07-16T11:50:00+08:00
 */

import { IGaugeMetric, MetricType, MetricOptions } from '../interfaces';
import { BaseMetric } from './base-metric';

/**
 * 度量指标实现
 */
export class GaugeMetric extends BaseMetric<number> implements IGaugeMetric {
  public readonly type = MetricType.GAUGE;

  /**
   * 创建度量指标
   * @param name 指标名称
   * @param options 指标选项
   */
  constructor(name: string, options?: MetricOptions) {
    super(name, MetricType.GAUGE, 0, options);
  }

  /**
   * 更新当前值
   * @param value 新值
   */
  public update(value: number): void {
    this.value = value;
    this.updateTimestamp();
  }

  /**
   * 增加值
   * @param value 增加的值，默认为1
   */
  public increment(value: number = 1): void {
    this.value += value;
    this.updateTimestamp();
  }

  /**
   * 减少值
   * @param value 减少的值，默认为1
   */
  public decrement(value: number = 1): void {
    this.value -= value;
    this.updateTimestamp();
  }
} 