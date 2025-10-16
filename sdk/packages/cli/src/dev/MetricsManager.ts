/**
 * @fileoverview Metrics manager implementation
 */

import { EventEmitter } from 'events';
import { MPLPEventManager } from '../core/MPLPEventManager';
import { IMetricsManager, ServerMetrics } from './types';

/**
 * Metrics manager implementation
 */
export class MetricsManager extends EventEmitter implements IMetricsManager {
  private eventManager: MPLPEventManager;
  private _metrics: ServerMetrics;
  private _isCollecting = false;
  private startTime = 0;
  private metricsInterval?: NodeJS.Timeout;
  private readonly updateInterval = 5000; // 5 seconds

  constructor() {
    super();
    this.eventManager = new MPLPEventManager();
    this._metrics = this.createInitialMetrics();
  }

  // ===== EventEmitter兼容方法 =====
  public on(event: string, listener: (...args: any[]) => void): this { this.eventManager.on(event, listener); return this; }
  public emit(event: string, ...args: any[]): boolean { return this.eventManager.emit(event, ...args); }
  public off(event: string, listener: (...args: any[]) => void): this { this.eventManager.off(event, listener); return this; }
  public removeAllListeners(event?: string): this { this.eventManager.removeAllListeners(event); return this; }

  /**
   * Get current metrics
   */
  public get metrics(): ServerMetrics {
    return { ...this._metrics };
  }

  /**
   * Get collecting status
   */
  public get isCollecting(): boolean {
    return this._isCollecting;
  }

  /**
   * Start metrics collection
   */
  public start(): void {
    if (this._isCollecting) {
      return;
    }

    this.startTime = Date.now();
    this._isCollecting = true;
    
    // Start periodic metrics update
    this.metricsInterval = setInterval(() => {
      this.updateMetrics();
    }, this.updateInterval);

    this.emit('metrics:start');
  }

  /**
   * Stop metrics collection
   */
  public stop(): void {
    if (!this._isCollecting) {
      return;
    }

    this._isCollecting = false;
    
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
      this.metricsInterval = undefined;
    }

    this.emit('metrics:stop');
  }

  /**
   * Record a request
   */
  public recordRequest(): void {
    this._metrics.requests++;
    this.emit('metrics:request');
  }

  /**
   * Record an error
   */
  public recordError(): void {
    this._metrics.errors++;
    this.emit('metrics:error');
  }

  /**
   * Record build time
   */
  public recordBuildTime(duration: number): void {
    this._metrics.buildTime = duration;
    this.emit('metrics:build', duration);
  }

  /**
   * Get current metrics
   */
  public getMetrics(): ServerMetrics {
    this.updateMetrics();
    return { ...this._metrics };
  }

  /**
   * Reset metrics
   */
  public resetMetrics(): void {
    this._metrics = this.createInitialMetrics();
    this.startTime = Date.now();
    this.emit('metrics:reset');
  }

  /**
   * Create initial metrics
   */
  private createInitialMetrics(): ServerMetrics {
    return {
      uptime: 0,
      requests: 0,
      errors: 0,
      buildTime: 0,
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage()
    };
  }

  /**
   * Update metrics
   */
  private updateMetrics(): void {
    if (!this._isCollecting) {
      return;
    }

    // Update uptime
    this._metrics.uptime = Date.now() - this.startTime;

    // Update memory usage
    this._metrics.memoryUsage = process.memoryUsage();

    // Update CPU usage
    this._metrics.cpuUsage = process.cpuUsage();

    this.emit('metrics:update', this._metrics);
  }
}
