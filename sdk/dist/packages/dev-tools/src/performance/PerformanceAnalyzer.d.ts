/**
 * @fileoverview Performance Analyzer - Analyze application performance
 * @version 1.1.0-beta
 * @author MPLP Team
 */
import { EventEmitter } from 'events';
/**
 * Performance analyzer for analyzing application performance
 */
export declare class PerformanceAnalyzer extends EventEmitter {
    private isActive;
    private metrics;
    private startTime;
    constructor();
    /**
     * Start performance analysis
     */
    start(): Promise<void>;
    /**
     * Stop performance analysis
     */
    stop(): Promise<void>;
    /**
     * Record performance metric
     */
    recordMetric(name: string, value: number): void;
    /**
     * Get metric statistics
     */
    getMetricStats(name: string): any;
    /**
     * Get all metrics
     */
    getAllMetrics(): Record<string, any>;
    /**
     * Clear all metrics
     */
    clearMetrics(): void;
    /**
     * Get performance summary
     */
    getPerformanceSummary(): any;
}
//# sourceMappingURL=PerformanceAnalyzer.d.ts.map