/**
 * MPLP默认指标收集器实现
 *
 * 定期收集注册表中的指标，提供自动收集机制。
 *
 * @version v1.0.0
 * @created 2025-07-16T12:40:00+08:00
 */

import { IMetricCollector, IMetricRegistry, IMetric } from '../interfaces';

/**
 * 默认指标收集器实现
 */
export class DefaultMetricCollector implements IMetricCollector {
  private registry: IMetricRegistry;
  private collectionInterval: NodeJS.Timeout | null = null;
  private isCollectingFlag = false;
  
  /**
   * 创建默认指标收集器
   * @param registry 指标注册表
   */
  constructor(registry: IMetricRegistry) {
    this.registry = registry;
  }
  
  /**
   * 收集所有指标
   * @returns 收集到的指标列表
   */
  public collect(): IMetric[] {
    // 从注册表中获取所有指标
    return this.registry.getAllMetrics();
  }
  
  /**
   * 启动定期收集
   * @param intervalMs 收集间隔（毫秒）
   */
  public startCollection(intervalMs: number): void {
    // 如果已经在收集中，先停止
    if (this.collectionInterval) {
      this.stopCollection();
    }
    
    // 设置收集标志
    this.isCollectingFlag = true;
    
    // 启动定期收集任务
    this.collectionInterval = setInterval(() => {
      // 收集指标
      const metrics = this.collect();
      
      // 这里可以添加处理收集到的指标的逻辑
      // 例如发送到存储、触发回调等
      this.onCollect(metrics);
      
    }, intervalMs);
  }
  
  /**
   * 停止收集
   */
  public stopCollection(): void {
    if (this.collectionInterval) {
      clearInterval(this.collectionInterval);
      this.collectionInterval = null;
    }
    
    this.isCollectingFlag = false;
  }
  
  /**
   * 检查是否正在收集
   * @returns 是否正在收集
   */
  public isCollecting(): boolean {
    return this.isCollectingFlag;
  }
  
  /**
   * 处理收集到的指标
   * 子类可以重写此方法以提供自定义处理逻辑
   * @param metrics 收集到的指标
   */
  protected onCollect(metrics: IMetric[]): void {
    // 默认实现不做任何处理
    // 子类可以重写此方法以提供自定义处理逻辑
  }
} 