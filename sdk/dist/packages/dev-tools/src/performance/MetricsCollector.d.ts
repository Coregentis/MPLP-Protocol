/**
 * @fileoverview Metrics Collector - Collect performance metrics
 * @version 1.1.0-beta
 * @author MPLP Team
 */
import { EventEmitter } from 'events';
import { PerformanceMetric, SystemMetrics } from '../types/performance';
/**
 * Metrics collector for collecting performance metrics
 */
export declare class MetricsCollector extends EventEmitter {
    private isActive;
    private collectionInterval?;
    private metrics;
    private readonly maxMetrics;
    private readonly collectionIntervalMs;
    constructor();
    /**
     * Start metrics collection
     */
    start(): Promise<void>;
    /**
     * Stop metrics collection
     */
    stop(): Promise<void>;
    /**
     * Collect custom metric
     */
    collectMetric(name: string, value: number, tags?: Record<string, string>, metadata?: Record<string, any>): void;
    /**
     * Get all metrics
     */
    getAllMetrics(): PerformanceMetric[];
    /**
     * Get metrics by name
     */
    getMetricsByName(name: string): PerformanceMetric[];
    /**
     * Get metrics by tag
     */
    getMetricsByTag(tagKey: string, tagValue?: string): PerformanceMetric[];
    /**
     * Get metrics in time range
     */
    getMetricsInTimeRange(startTime: Date, endTime: Date): PerformanceMetric[];
    /**
     * Get system metrics
     */
    getSystemMetrics(): SystemMetrics;
    /**
     * Clear all metrics
     */
    clearMetrics(): void;
    /**
     * Get collection statistics
     */
    getStatistics(): any;
    /**
     * Start automatic collection
     */
    private startCollection;
    /**
     * Collect system metrics automatically
     */
    private collectSystemMetrics;
    /**
     * Add metric to collection
     */
    private addMetric;
    /**
     * Calculate CPU usage percentage
     */
    private calculateCPUUsage;
    /**
     * Get time range of collected metrics
     */
    private getTimeRange;
}
//# sourceMappingURL=MetricsCollector.d.ts.map