/**
 * MPLP性能监控框架入口
 *
 * 提供性能指标收集、存储、分析和报告的功能。
 *
 * @version v1.0.0
 * @created 2025-07-16T13:10:00+08:00
 */

// 接口导出
export * from './interfaces';

// 实现类导出
export { PerformanceMonitor } from './performance-monitor';
export { MonitorClient } from './monitor-client';
export { MetricRegistry } from './metric-registry';
export { DefaultMetricCollector } from './collectors/default-collector';
export { MemoryMetricStorage } from './storage/memory-storage';
export { DefaultMetricAnalyzer } from './analyzers/default-analyzer';

// 指标类型导出
export { CounterMetric } from './metrics/counter-metric';
export { GaugeMetric } from './metrics/gauge-metric';
export { HistogramMetric } from './metrics/histogram-metric';
export { TimerMetric } from './metrics/timer-metric';
export { MeterMetric } from './metrics/meter-metric';

// 基础类型导出
export { BaseMetric } from './metrics/base-metric';

/**
 * 创建默认监控客户端
 * 这是使用性能监控框架的推荐方式
 * 
 * @returns 预配置的监控客户端
 * 
 * @example
 * ```typescript
 * import { createMonitor } from '@mplp/core/performance';
 * 
 * const monitor = createMonitor();
 * await monitor.start();
 * 
 * // 使用监控客户端
 * monitor.counter('my_counter').increment();
 * ```
 */
import { MonitorClient } from './monitor-client';
export function createMonitor(): MonitorClient {
  return new MonitorClient();
} 