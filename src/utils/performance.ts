/**
 * MPLP Performance Monitor v1.0
 * 高精度性能监控工具，用于MPLP协议性能优化
 */

import { Timestamp } from '../types/index';
import { ExtensionPerformanceMetrics } from '../modules/extension/types';

export interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, unknown>;
}

export interface PerformanceReport {
  totalOperations: number;
  averageTime: number;
  minTime: number;
  maxTime: number;
  p95Time: number;
  p99Time: number;
  operationsPerSecond: number;
  reportGeneratedAt: Timestamp;
}

/**
 * 将性能报告转换为Schema标准的ExtensionPerformanceMetrics
 */
export function toExtensionPerformanceMetrics(report: PerformanceReport): ExtensionPerformanceMetrics {
  return {
    average_execution_time_ms: report.averageTime,
    total_executions: report.totalOperations,
    success_rate: 1.0, // 默认成功率为100%
    memory_usage_mb: 0  // 需要单独计算内存使用
  };
}

export class Performance {
  private metrics: Map<string, PerformanceMetric[]> = new Map();
  private activeMetrics: Map<string, PerformanceMetric> = new Map();

  /**
   * Get high-resolution timestamp
   */
  now(): number {
    return performance.now();
  }

  /**
   * Calculate time elapsed since start time
   */
  since(startTime: number): number {
    return this.now() - startTime;
  }

  /**
   * Start a named performance measurement
   */
  start(name: string, metadata?: Record<string, unknown>): string {
    const metricId = `${name}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const metric: PerformanceMetric = {
      name,
      startTime: this.now(),
      metadata
    };

    this.activeMetrics.set(metricId, metric);
    return metricId;
  }

  /**
   * End a named performance measurement
   */
  end(metricId: string): number {
    const metric = this.activeMetrics.get(metricId);
    if (!metric) {
      throw new Error(`Performance metric ${metricId} not found`);
    }

    metric.endTime = this.now();
    metric.duration = metric.endTime - metric.startTime;

    // Store completed metric
    if (!this.metrics.has(metric.name)) {
      this.metrics.set(metric.name, []);
    }
    this.metrics.get(metric.name)!.push(metric);

    // Remove from active metrics
    this.activeMetrics.delete(metricId);

    return metric.duration;
  }

  /**
   * Measure a synchronous operation
   */
  measure<T>(name: string, operation: () => T, metadata?: Record<string, unknown>): { result: T; duration: number } {
    const startTime = this.now();
    const result = operation();
    const duration = this.since(startTime);

    this.recordMetric(name, duration, metadata);
    
    return { result, duration };
  }

  /**
   * Measure an asynchronous operation
   */
  async measureAsync<T>(
    name: string, 
    operation: () => Promise<T>, 
    metadata?: Record<string, unknown>
  ): Promise<{ result: T; duration: number }> {
    const startTime = this.now();
    const result = await operation();
    const duration = this.since(startTime);

    this.recordMetric(name, duration, metadata);
    
    return { result, duration };
  }

  /**
   * Record a completed metric
   */
  private recordMetric(name: string, duration: number, metadata?: Record<string, unknown>): void {
    const metric: PerformanceMetric = {
      name,
      startTime: 0, // Not needed for completed metrics
      endTime: 0,   // Not needed for completed metrics
      duration,
      metadata
    };

    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)!.push(metric);
  }

  /**
   * Get performance report for a specific metric
   */
  getReport(metricName: string): PerformanceReport | null {
    const metrics = this.metrics.get(metricName);
    if (!metrics || metrics.length === 0) {
      return null;
    }

    const durations = metrics
      .filter(m => m.duration !== undefined)
      .map(m => m.duration!)
      .sort((a, b) => a - b);

    if (durations.length === 0) {
      return null;
    }

    const totalOperations = durations.length;
    const totalTime = durations.reduce((sum, d) => sum + d, 0);
    const averageTime = totalTime / totalOperations;
    const minTime = durations[0];
    const maxTime = durations[durations.length - 1];
    
    // Calculate percentiles
    const p95Index = Math.floor(durations.length * 0.95);
    const p99Index = Math.floor(durations.length * 0.99);
    const p95Time = durations[p95Index] || maxTime;
    const p99Time = durations[p99Index] || maxTime;

    // Calculate operations per second based on average time
    const operationsPerSecond = averageTime > 0 ? 1000 / averageTime : 0;

    return {
      totalOperations,
      averageTime: Math.round(averageTime * 100) / 100,
      minTime: Math.round(minTime * 100) / 100,
      maxTime: Math.round(maxTime * 100) / 100,
      p95Time: Math.round(p95Time * 100) / 100,
      p99Time: Math.round(p99Time * 100) / 100,
      operationsPerSecond: Math.round(operationsPerSecond * 100) / 100,
      reportGeneratedAt: new Date().toISOString() as Timestamp // Assuming Timestamp is string or number
    };
  }

  /**
   * Get all available metric names
   */
  getMetricNames(): string[] {
    return Array.from(this.metrics.keys());
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics.clear();
    this.activeMetrics.clear();
  }

  /**
   * Clear metrics for a specific name
   */
  clearMetric(metricName: string): void {
    this.metrics.delete(metricName);
    
    // Also clear any active metrics with this name
    for (const [id, metric] of this.activeMetrics) {
      if (metric.name === metricName) {
        this.activeMetrics.delete(id);
      }
    }
  }

  /**
   * Get summary of all metrics
   */
  getSummary(): Record<string, PerformanceReport> {
    const summary: Record<string, PerformanceReport> = {};
    
    for (const metricName of this.getMetricNames()) {
      const report = this.getReport(metricName);
      if (report) {
        summary[metricName] = report;
      }
    }

    return summary;
  }

  /**
   * Check if any metrics exceed performance thresholds
   */
  checkThresholds(thresholds: Record<string, number>): Array<{ metric: string; actual: number; threshold: number }> {
    const violations: Array<{ metric: string; actual: number; threshold: number }> = [];

    for (const [metricName, threshold] of Object.entries(thresholds)) {
      const report = this.getReport(metricName);
      if (report && report.p95Time > threshold) {
        violations.push({
          metric: metricName,
          actual: report.p95Time,
          threshold
        });
      }
    }

    return violations;
  }

  /**
   * Static method decorator for measuring performance
   */
  static measure(metricName: string) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
      const originalMethod = descriptor.value;

      descriptor.value = async function (...args: any[]) {
        const startTime = performance.now();
        
        try {
          const result = await originalMethod.apply(this, args);
          const duration = performance.now() - startTime;
          
          // Log performance metric (in production, you might want to store this differently)
          console.debug(`[Performance] ${metricName}: ${duration.toFixed(2)}ms`);
          
          return result;
        } catch (error) {
          const duration = performance.now() - startTime;
          console.debug(`[Performance] ${metricName} (ERROR): ${duration.toFixed(2)}ms`);
          throw error;
        }
      };

      return descriptor;
    };
  }
}

export default Performance;

// 导出别名以保持向后兼容
export const PerformanceMonitor = Performance; 