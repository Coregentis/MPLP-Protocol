/**
 * @fileoverview Performance Analyzer - Analyze application performance
 * @version 1.1.0-beta
 * @author MPLP Team
 */

import { MPLPEventManager } from '../utils/MPLPEventManager';

/**
 * Performance analyzer for analyzing application performance
 */
export class PerformanceAnalyzer {
  private eventManager: MPLPEventManager;
  private isActive = false;
  private metrics: Map<string, number[]> = new Map();
  private startTime = 0;

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
   * Start performance analysis
   */
  async start(): Promise<void> {
    if (this.isActive) {
      return;
    }

    this.isActive = true;
    this.startTime = Date.now();
    this.emit('started');
  }

  /**
   * Stop performance analysis
   */
  async stop(): Promise<void> {
    if (!this.isActive) {
      return;
    }

    this.isActive = false;
    this.emit('stopped');
  }

  /**
   * Record performance metric
   */
  recordMetric(name: string, value: number): void {
    if (!this.isActive) {
      return;
    }

    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    this.metrics.get(name)!.push(value);
    this.emit('metricRecorded', { name, value });
  }

  /**
   * Get metric statistics
   */
  getMetricStats(name: string): any {
    const values = this.metrics.get(name);
    if (!values || values.length === 0) {
      return null;
    }

    const sorted = [...values].sort((a, b) => a - b);
    const sum = values.reduce((a, b) => a + b, 0);

    return {
      count: values.length,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      average: sum / values.length,
      median: sorted[Math.floor(sorted.length / 2)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)]
    };
  }

  /**
   * Get all metrics
   */
  getAllMetrics(): Record<string, any> {
    const result: Record<string, any> = {};
    
    for (const [name] of this.metrics) {
      result[name] = this.getMetricStats(name);
    }

    return result;
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.metrics.clear();
    this.emit('metricsCleared');
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary(): any {
    const uptime = this.isActive ? Date.now() - this.startTime : 0;
    const totalMetrics = Array.from(this.metrics.values()).reduce((sum, values) => sum + values.length, 0);

    return {
      isActive: this.isActive,
      uptime,
      totalMetrics,
      metricTypes: this.metrics.size,
      metrics: this.getAllMetrics()
    };
  }
}
