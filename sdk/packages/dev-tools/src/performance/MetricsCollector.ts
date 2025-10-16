/**
 * @fileoverview Metrics Collector - Collect performance metrics
 * @version 1.1.0-beta
 * @author MPLP Team
 */

import { PerformanceMetric, SystemMetrics } from '../types/performance';
import { MPLPEventManager } from '../utils/MPLPEventManager';

/**
 * Metrics collector for collecting performance metrics
 */
export class MetricsCollector {
  private eventManager: MPLPEventManager;
  private isActive = false;
  private collectionInterval?: NodeJS.Timeout;
  private metrics: PerformanceMetric[] = [];
  private readonly maxMetrics = 10000;
  private readonly collectionIntervalMs = 1000;

  constructor() {
    this.eventManager = new MPLPEventManager();
  }

  // EventEmitter兼容方法 - 基于MPLP V1.0 Alpha架构
  public on(event: string, listener: (...args: any[]) => void): this {
    this.eventManager.on(event, listener);
    return this;
  }

  public emit(event: string, ...args: any[]): boolean {
    return this.eventManager.emit(event, ...args);
  }

  public off(event: string, listener: (...args: any[]) => void): this {
    this.eventManager.off(event, listener);
    return this;
  }

  public removeAllListeners(event?: string): this {
    this.eventManager.removeAllListeners(event);
    return this;
  }

  /**
   * Start metrics collection
   */
  async start(): Promise<void> {
    if (this.isActive) {
      return;
    }

    this.isActive = true;
    this.startCollection();
    this.emit('started');
  }

  /**
   * Stop metrics collection
   */
  async stop(): Promise<void> {
    if (!this.isActive) {
      return;
    }

    if (this.collectionInterval) {
      clearInterval(this.collectionInterval);
      this.collectionInterval = undefined;
    }

    this.isActive = false;
    this.emit('stopped');
  }

  /**
   * Collect custom metric
   */
  collectMetric(name: string, value: number, tags?: Record<string, string>, metadata?: Record<string, any>): void {
    if (!this.isActive) {
      return;
    }

    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: new Date(),
      tags,
      metadata
    };

    this.addMetric(metric);
    this.emit('metricCollected', metric);
  }

  /**
   * Get all metrics
   */
  getAllMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * Get metrics by name
   */
  getMetricsByName(name: string): PerformanceMetric[] {
    return this.metrics.filter(metric => metric.name === name);
  }

  /**
   * Get metrics by tag
   */
  getMetricsByTag(tagKey: string, tagValue?: string): PerformanceMetric[] {
    return this.metrics.filter(metric => {
      if (!metric.tags || !metric.tags[tagKey]) {
        return false;
      }
      return tagValue ? metric.tags[tagKey] === tagValue : true;
    });
  }

  /**
   * Get metrics in time range
   */
  getMetricsInTimeRange(startTime: Date, endTime: Date): PerformanceMetric[] {
    return this.metrics.filter(metric => 
      metric.timestamp >= startTime && metric.timestamp <= endTime
    );
  }

  /**
   * Get system metrics
   */
  getSystemMetrics(): SystemMetrics {
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    return {
      cpu: {
        usage: this.calculateCPUUsage(cpuUsage),
        loadAverage: process.platform !== 'win32' ? require('os').loadavg() : [0, 0, 0]
      },
      memory: {
        used: memUsage.heapUsed,
        total: memUsage.heapTotal,
        percentage: (memUsage.heapUsed / memUsage.heapTotal) * 100,
        heap: {
          used: memUsage.heapUsed,
          total: memUsage.heapTotal
        }
      },
      disk: {
        used: 0, // Would need additional library for real disk usage
        total: 0,
        percentage: 0
      },
      network: {
        bytesIn: 0, // Would need additional library for real network stats
        bytesOut: 0,
        packetsIn: 0,
        packetsOut: 0
      }
    };
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.metrics = [];
    this.emit('metricsCleared');
  }

  /**
   * Get collection statistics
   */
  getStatistics(): any {
    const metricsByName = new Map<string, number>();
    const metricsByTag = new Map<string, number>();

    this.metrics.forEach(metric => {
      metricsByName.set(metric.name, (metricsByName.get(metric.name) || 0) + 1);
      
      if (metric.tags) {
        Object.keys(metric.tags).forEach(tagKey => {
          metricsByTag.set(tagKey, (metricsByTag.get(tagKey) || 0) + 1);
        });
      }
    });

    return {
      isActive: this.isActive,
      totalMetrics: this.metrics.length,
      uniqueMetricNames: metricsByName.size,
      metricsByName: Object.fromEntries(metricsByName),
      tagKeys: Array.from(metricsByTag.keys()),
      timeRange: this.getTimeRange(),
      systemMetrics: this.getSystemMetrics()
    };
  }

  /**
   * Start automatic collection
   */
  private startCollection(): void {
    this.collectionInterval = setInterval(() => {
      this.collectSystemMetrics();
    }, this.collectionIntervalMs);
  }

  /**
   * Collect system metrics automatically
   */
  private collectSystemMetrics(): void {
    const systemMetrics = this.getSystemMetrics();
    
    // Collect CPU metrics
    this.collectMetric('system.cpu.usage', systemMetrics.cpu.usage, { type: 'system' });
    
    // Collect memory metrics
    this.collectMetric('system.memory.used', systemMetrics.memory.used, { type: 'system' });
    this.collectMetric('system.memory.percentage', systemMetrics.memory.percentage, { type: 'system' });
    
    // Collect process metrics
    this.collectMetric('process.uptime', process.uptime(), { type: 'process' });
    this.collectMetric('process.memory.heap.used', systemMetrics.memory.heap.used, { type: 'process' });
    this.collectMetric('process.memory.heap.total', systemMetrics.memory.heap.total, { type: 'process' });
  }

  /**
   * Add metric to collection
   */
  private addMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);

    // Keep only the most recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
  }

  /**
   * Calculate CPU usage percentage
   */
  private calculateCPUUsage(cpuUsage: NodeJS.CpuUsage): number {
    // This is a simplified calculation
    // In a real implementation, you'd need to track previous values
    const totalUsage = cpuUsage.user + cpuUsage.system;
    return Math.min(100, (totalUsage / 1000000) * 100); // Convert microseconds to percentage
  }

  /**
   * Get time range of collected metrics
   */
  private getTimeRange(): { start?: Date; end?: Date } {
    if (this.metrics.length === 0) {
      return {};
    }

    const timestamps = this.metrics.map(metric => metric.timestamp);
    return {
      start: new Date(Math.min(...timestamps.map(t => t.getTime()))),
      end: new Date(Math.max(...timestamps.map(t => t.getTime())))
    };
  }
}
