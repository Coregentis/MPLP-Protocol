/**
 * @fileoverview Metrics manager implementation
 */
import { EventEmitter } from 'events';
import { IMetricsManager, ServerMetrics } from './types';
/**
 * Metrics manager implementation
 */
export declare class MetricsManager extends EventEmitter implements IMetricsManager {
    private eventManager;
    private _metrics;
    private _isCollecting;
    private startTime;
    private metricsInterval?;
    private readonly updateInterval;
    constructor();
    on(event: string, listener: (...args: any[]) => void): this;
    emit(event: string, ...args: any[]): boolean;
    off(event: string, listener: (...args: any[]) => void): this;
    removeAllListeners(event?: string): this;
    /**
     * Get current metrics
     */
    get metrics(): ServerMetrics;
    /**
     * Get collecting status
     */
    get isCollecting(): boolean;
    /**
     * Start metrics collection
     */
    start(): void;
    /**
     * Stop metrics collection
     */
    stop(): void;
    /**
     * Record a request
     */
    recordRequest(): void;
    /**
     * Record an error
     */
    recordError(): void;
    /**
     * Record build time
     */
    recordBuildTime(duration: number): void;
    /**
     * Get current metrics
     */
    getMetrics(): ServerMetrics;
    /**
     * Reset metrics
     */
    resetMetrics(): void;
    /**
     * Create initial metrics
     */
    private createInitialMetrics;
    /**
     * Update metrics
     */
    private updateMetrics;
}
//# sourceMappingURL=MetricsManager.d.ts.map