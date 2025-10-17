import { ModuleManager } from '../modules/ModuleManager';
import { EventEmitter } from 'events';
import { Logger } from '../logging/Logger';
/**
 * Health check function type
 */
export type HealthCheckFunction = () => Promise<HealthCheckResult>;
/**
 * Health check result
 */
export interface HealthCheckResult {
    healthy: boolean;
    message?: string;
    data?: Record<string, any>;
    duration?: number;
    timestamp?: Date;
}
/**
 * Health check configuration
 */
export interface HealthCheckConfig {
    name: string;
    description?: string;
    checkFunction: HealthCheckFunction;
    interval?: number;
    timeout?: number;
    retries?: number;
    critical?: boolean;
    tags?: string[];
}
/**
 * Health status levels
 */
export declare enum HealthStatus {
    HEALTHY = "healthy",
    DEGRADED = "degraded",
    UNHEALTHY = "unhealthy",
    UNKNOWN = "unknown"
}
/**
 * Detailed health report
 */
export interface HealthReport {
    status: HealthStatus;
    timestamp: Date;
    uptime: number;
    checks: Record<string, HealthCheckResult>;
    modules: Record<string, any>;
    system: {
        memory: NodeJS.MemoryUsage;
        cpu?: number;
        loadAverage?: number[];
        platform: string;
        nodeVersion: string;
    };
    metrics: Record<string, any>;
    summary: {
        total: number;
        healthy: number;
        unhealthy: number;
        critical: number;
    };
}
/**
 * Health check metrics
 */
export interface HealthMetrics {
    checkCount: number;
    successCount: number;
    failureCount: number;
    averageResponseTime: number;
    lastCheckTime?: Date;
    uptimePercentage: number;
}
/**
 * Enhanced Health Checker
 *
 * Advanced health monitoring system with custom checks, detailed reporting,
 * metrics collection, and alerting capabilities.
 */
export declare class HealthChecker extends EventEmitter {
    private moduleManager;
    private logger;
    private interval?;
    private isRunning;
    private checkIntervalMs;
    private customChecks;
    private checkResults;
    private metrics;
    private lastReport;
    private startTime;
    private lastFullCheck?;
    constructor(moduleManager: ModuleManager, logger: Logger);
    /**
     * Registers default system health checks
     */
    private registerDefaultChecks;
    /**
     * Registers a custom health check
     */
    registerHealthCheck(config: HealthCheckConfig): void;
    /**
     * Unregisters a health check
     */
    unregisterHealthCheck(name: string): void;
    /**
     * Initializes the health checker
     */
    initialize(): Promise<void>;
    /**
     * Starts health monitoring
     */
    start(): Promise<void>;
    /**
     * Stops health monitoring
     */
    stop(): Promise<void>;
    /**
     * Gets the last cached health report
     */
    getLastHealthReport(): HealthReport | null;
    /**
     * Gets a comprehensive health report
     */
    getHealthReport(): Promise<HealthReport>;
    /**
     * Gets the current health status (simplified)
     */
    getHealthStatus(): Promise<{
        status: HealthStatus;
        timestamp: string;
        uptime: number;
        summary: {
            healthy: number;
            unhealthy: number;
            total: number;
        };
    }>;
    /**
     * Gets metrics for a specific health check
     */
    getHealthCheckMetrics(name: string): HealthMetrics | undefined;
    /**
     * Gets all health check metrics
     */
    getAllMetrics(): Record<string, HealthMetrics>;
    /**
     * Gets a summary of all metrics
     */
    private getMetricsSummary;
    /**
     * Performs all health checks
     */
    private performFullHealthCheck;
    /**
     * Executes a single health check with timeout and retry logic
     */
    private executeHealthCheck;
    /**
     * Executes a function with timeout
     */
    private executeWithTimeout;
    /**
     * Updates metrics for a health check
     */
    private updateMetrics;
    /**
     * Utility delay function
     */
    private delay;
    /**
     * Performs periodic health checks
     */
    private performHealthCheck;
    /**
     * Gets health check configuration
     */
    getHealthCheckConfig(name: string): HealthCheckConfig | undefined;
    /**
     * Lists all registered health checks
     */
    listHealthChecks(): string[];
    /**
     * Gets the last full health check time
     */
    getLastCheckTime(): Date | undefined;
    /**
     * Cleanup resources
     */
    destroy(): void;
}
//# sourceMappingURL=HealthChecker.d.ts.map