/**
 * MPLP计数器指标实现
 *
 * 计数器指标用于跟踪单调递增的数值，如请求总数。
 *
 * @version v1.0.0
 * @created 2025-07-16T11:40:00+08:00
 */

import { ICounterMetric, MetricType, MetricOptions } from '../interfaces';
import { BaseMetric } from './base-metric';

/**
 * 计数器指标实现
 */
export class CounterMetric extends BaseMetric<number> implements ICounterMetric {
  public readonly type = MetricType.COUNTER;

  /**
   * 创建计数器指标
   * @param name 指标名称
   * @param options 指标选项
   */
  constructor(name: string, options?: MetricOptions) {
    super(name, MetricType.COUNTER, 0, options);
  }

  /**
   * 增加计数
   * @param value 增加的值，默认为1
   */
  public increment(value: number = 1): void {
    this.value += value;
    this.updateTimestamp();
  }

  /**
   * 重置计数
   */
  public reset(): void {
    this.value = 0;
    this.updateTimestamp();
  }
} 