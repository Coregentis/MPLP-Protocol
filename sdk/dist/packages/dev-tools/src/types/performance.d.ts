/**
 * @fileoverview Performance Types - Type definitions for performance tools
 * @version 1.1.0-beta
 * @author MPLP Team
 */
/**
 * Performance metric entry
 */
export interface PerformanceMetric {
    name: string;
    value: number;
    timestamp: Date;
    tags?: Record<string, string>;
    metadata?: Record<string, any>;
}
/**
 * Performance statistics
 */
export interface PerformanceStats {
    count: number;
    min: number;
    max: number;
    average: number;
    median: number;
    p95: number;
    p99: number;
    standardDeviation?: number;
}
/**
 * Performance summary
 */
export interface PerformanceSummary {
    isActive: boolean;
    uptime: number;
    totalMetrics: number;
    metricTypes: number;
    metrics: Record<string, PerformanceStats>;
    systemMetrics?: SystemMetrics;
}
/**
 * System metrics
 */
export interface SystemMetrics {
    cpu: {
        usage: number;
        loadAverage: number[];
    };
    memory: {
        used: number;
        total: number;
        percentage: number;
        heap: {
            used: number;
            total: number;
        };
    };
    disk: {
        used: number;
        total: number;
        percentage: number;
    };
    network: {
        bytesIn: number;
        bytesOut: number;
        packetsIn: number;
        packetsOut: number;
    };
}
/**
 * Performance alert
 */
export interface PerformanceAlert {
    id: string;
    type: 'threshold' | 'anomaly' | 'trend';
    severity: 'low' | 'medium' | 'high' | 'critical';
    metric: string;
    message: string;
    value: number;
    threshold?: number;
    timestamp: Date;
    resolved?: boolean;
    resolvedAt?: Date;
}
/**
 * Performance benchmark
 */
export interface PerformanceBenchmark {
    name: string;
    description: string;
    iterations: number;
    warmupIterations: number;
    results: BenchmarkResult[];
    summary: PerformanceStats;
}
/**
 * Benchmark result
 */
export interface BenchmarkResult {
    iteration: number;
    duration: number;
    memoryUsed: number;
    timestamp: Date;
    success: boolean;
    error?: string;
}
/**
 * Performance profiler data
 */
export interface ProfilerData {
    id: string;
    name: string;
    startTime: Date;
    endTime?: Date;
    duration?: number;
    samples: ProfilerSample[];
    callTree: CallTreeNode;
    hotSpots: HotSpot[];
}
/**
 * Profiler sample
 */
export interface ProfilerSample {
    timestamp: Date;
    stackTrace: string[];
    cpuUsage: number;
    memoryUsage: number;
}
/**
 * Call tree node
 */
export interface CallTreeNode {
    functionName: string;
    fileName: string;
    lineNumber: number;
    selfTime: number;
    totalTime: number;
    callCount: number;
    children: CallTreeNode[];
}
/**
 * Hot spot
 */
export interface HotSpot {
    functionName: string;
    fileName: string;
    lineNumber: number;
    selfTime: number;
    totalTime: number;
    percentage: number;
    callCount: number;
}
/**
 * Resource monitor data
 */
export interface ResourceMonitorData {
    timestamp: Date;
    cpu: number;
    memory: number;
    disk: number;
    network: {
        in: number;
        out: number;
    };
    handles: number;
    threads: number;
}
/**
 * Performance configuration
 */
export interface PerformanceConfig {
    enabled?: boolean;
    sampleInterval?: number;
    maxSamples?: number;
    enableSystemMetrics?: boolean;
    enableProfiling?: boolean;
    alertThresholds?: Record<string, number>;
    benchmarkConfig?: BenchmarkConfig;
}
/**
 * Benchmark configuration
 */
export interface BenchmarkConfig {
    iterations: number;
    warmupIterations: number;
    timeout: number;
    memoryLimit: number;
    parallel: boolean;
}
/**
 * Performance event
 */
export interface PerformanceEvent {
    type: 'metric' | 'alert' | 'benchmark' | 'profile';
    timestamp: Date;
    data: any;
    source?: string;
    tags?: Record<string, string>;
}
//# sourceMappingURL=performance.d.ts.map