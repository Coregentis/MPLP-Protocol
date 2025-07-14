/**
 * MPLP吞吐率指标实现
 *
 * 吞吐率指标用于测量事件发生的频率，如每秒请求数。
 *
 * @version v1.0.0
 * @created 2025-07-16T12:20:00+08:00
 */

import { IMeterMetric, MetricType, MetricOptions } from '../interfaces';
import { BaseMetric } from './base-metric';

/**
 * 指数加权移动平均值（EWMA）
 */
class EWMA {
  private alpha: number;
  private rate = 0;
  private initialized = false;
  private lastTick: number;
  private count = 0;
  
  /**
   * 创建EWMA
   * @param alpha 指数因子（越小，对历史值依赖越强）
   * @param interval 更新间隔（毫秒）
   */
  constructor(alpha: number, interval: number) {
    this.alpha = alpha;
    this.lastTick = Date.now();
    
    // 每隔interval毫秒更新一次
    setInterval(() => this.tick(), interval);
  }
  
  /**
   * 标记事件发生
   * @param n 事件数量
   */
  public mark(n: number): void {
    this.count += n;
  }
  
  /**
   * 获取当前速率
   * @returns 速率（事件数/秒）
   */
  public getRate(): number {
    return this.rate;
  }
  
  /**
   * 更新速率
   */
  private tick(): void {
    const now = Date.now();
    const interval = (now - this.lastTick) / 1000; // 转换为秒
    this.lastTick = now;
    
    // 计算当前速率（事件数/秒）
    const instantRate = interval > 0 ? this.count / interval : 0;
    this.count = 0;
    
    if (this.initialized) {
      // 使用EWMA公式更新速率
      this.rate += this.alpha * (instantRate - this.rate);
    } else {
      this.rate = instantRate;
      this.initialized = true;
    }
  }
}

/**
 * 吞吐率指标实现
 */
export class MeterMetric extends BaseMetric<number> implements IMeterMetric {
  public readonly type = MetricType.METER;
  
  // 不同时间窗口的EWMA
  private m1Rate: EWMA;  // 1分钟EWMA
  private m5Rate: EWMA;  // 5分钟EWMA
  private m15Rate: EWMA; // 15分钟EWMA
  private count = 0;
  private startTime: number;
  
  /**
   * 创建吞吐率指标
   * @param name 指标名称
   * @param options 指标选项
   */
  constructor(name: string, options?: MetricOptions) {
    const meterOptions = options || {};
    if (!meterOptions.unit) {
      meterOptions.unit = 'events/s';
    }
    
    super(name, MetricType.METER, 0, meterOptions);
    
    // 创建不同时间窗口的EWMA
    // 参数来自Exponentially Weighted Moving Average算法
    // 时间常数分别为1min, 5min, 15min
    this.m1Rate = new EWMA(1 - Math.exp(-5 / 60), 5000);
    this.m5Rate = new EWMA(1 - Math.exp(-5 / 300), 5000);
    this.m15Rate = new EWMA(1 - Math.exp(-5 / 900), 5000);
    
    this.startTime = Date.now();
  }
  
  /**
   * 记录事件发生
   * @param value 事件数量，默认为1
   */
  public mark(value: number = 1): void {
    this.count += value;
    this.value = this.count;
    
    // 更新各个时间窗口的速率
    this.m1Rate.mark(value);
    this.m5Rate.mark(value);
    this.m15Rate.mark(value);
    
    this.updateTimestamp();
  }
  
  /**
   * 获取1分钟吞吐率
   * @returns 1分钟吞吐率（事件数/秒）
   */
  public get1MinuteRate(): number {
    return this.m1Rate.getRate();
  }
  
  /**
   * 获取5分钟吞吐率
   * @returns 5分钟吞吐率（事件数/秒）
   */
  public get5MinuteRate(): number {
    return this.m5Rate.getRate();
  }
  
  /**
   * 获取15分钟吞吐率
   * @returns 15分钟吞吐率（事件数/秒）
   */
  public get15MinuteRate(): number {
    return this.m15Rate.getRate();
  }
  
  /**
   * 获取平均吞吐率
   * @returns 平均吞吐率（事件数/秒）
   */
  public getMeanRate(): number {
    const elapsed = (Date.now() - this.startTime) / 1000;
    return elapsed > 0 ? this.count / elapsed : 0;
  }
} 