/**
 * MPLP基础指标实现
 *
 * 提供所有指标类型的通用基类实现。
 *
 * @version v1.0.0
 * @created 2025-07-16T11:30:00+08:00
 */

import { IMetric, MetricType, MetricOptions, MetricTags } from '../interfaces';

/**
 * 基础指标抽象类
 */
export abstract class BaseMetric<T = number> implements IMetric<T> {
  public readonly name: string;
  public readonly type: MetricType;
  public readonly description?: string;
  public readonly unit?: string;
  public readonly tags?: MetricTags;
  public value: T;
  public timestamp: number;

  /**
   * 创建基础指标
   * @param name 指标名称
   * @param type 指标类型
   * @param initialValue 初始值
   * @param options 指标选项
   */
  constructor(name: string, type: MetricType, initialValue: T, options?: MetricOptions) {
    this.name = name;
    this.type = type;
    this.value = initialValue;
    this.description = options?.description;
    this.unit = options?.unit;
    this.tags = options?.tags;
    this.timestamp = Date.now();
  }

  /**
   * 更新时间戳
   */
  protected updateTimestamp(): void {
    this.timestamp = Date.now();
  }

  /**
   * 将指标转换为JSON对象
   * @returns 指标的JSON表示
   */
  public toJSON(): object {
    return {
      name: this.name,
      type: this.type,
      value: this.value,
      timestamp: this.timestamp,
      description: this.description,
      unit: this.unit,
      tags: this.tags
    };
  }
} 