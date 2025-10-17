"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RolePerformanceService = exports.AlertLevel = exports.PerformanceMetricType = void 0;
exports.createRolePerformanceService = createRolePerformanceService;
const role_logger_service_1 = require("./role-logger.service");
var PerformanceMetricType;
(function (PerformanceMetricType) {
    PerformanceMetricType["LATENCY"] = "latency";
    PerformanceMetricType["THROUGHPUT"] = "throughput";
    PerformanceMetricType["ERROR_RATE"] = "error_rate";
    PerformanceMetricType["MEMORY_USAGE"] = "memory_usage";
    PerformanceMetricType["CPU_USAGE"] = "cpu_usage";
    PerformanceMetricType["CACHE_HIT_RATE"] = "cache_hit_rate";
    PerformanceMetricType["PERMISSION_CHECK"] = "permission_check";
    PerformanceMetricType["ROLE_OPERATION"] = "role_operation";
})(PerformanceMetricType || (exports.PerformanceMetricType = PerformanceMetricType = {}));
var AlertLevel;
(function (AlertLevel) {
    AlertLevel["INFO"] = "info";
    AlertLevel["WARNING"] = "warning";
    AlertLevel["CRITICAL"] = "critical";
    AlertLevel["EMERGENCY"] = "emergency";
})(AlertLevel || (exports.AlertLevel = AlertLevel = {}));
class RolePerformanceService {
    mlppPerformanceMonitor;
    metrics = [];
    alerts = [];
    traces = new Map();
    benchmarks = new Map();
    logger;
    config;
    metricsTimer;
    cleanupTimer;
    constructor(config = {}, mlppPerformanceMonitor) {
        this.mlppPerformanceMonitor = mlppPerformanceMonitor;
        this.config = {
            enabled: true,
            collectionInterval: 30000,
            retentionPeriod: 24 * 60 * 60 * 1000,
            alertThresholds: {
                'permission_check_latency_ms': 10,
                'role_operation_latency_ms': 100,
                'memory_usage_mb': 256,
                'error_rate_percent': 5,
                'cache_hit_rate_percent': 80
            },
            benchmarkEnabled: true,
            realTimeAlertsEnabled: true,
            detailedTracing: true,
            optimizationEnabled: true,
            ...config
        };
        this.logger = (0, role_logger_service_1.createRoleLogger)({
            module: 'RolePerformance',
            level: role_logger_service_1.LogLevel.INFO,
            enableStructured: true,
            environment: process.env.NODE_ENV || 'development'
        });
        if (this.config.enabled) {
            this.startMetricsCollection();
            this.startCleanupTimer();
        }
    }
    startTrace(operationName, metadata) {
        const traceId = this.generateTraceId();
        const trace = {
            traceId,
            operationName,
            startTime: Date.now(),
            status: 'running',
            metadata
        };
        this.traces.set(traceId, trace);
        if (this.config.detailedTracing) {
            this.logger.debug('Operation trace started', { traceId, operationName, metadata });
        }
        return traceId;
    }
    async endTrace(traceId, status = 'completed', error) {
        const trace = this.traces.get(traceId);
        if (!trace) {
            this.logger.warn('Trace not found', { traceId });
            return;
        }
        const endTime = Date.now();
        const duration = endTime - trace.startTime;
        trace.endTime = endTime;
        trace.duration = duration;
        trace.status = status;
        await this.recordMetric({
            type: PerformanceMetricType.LATENCY,
            name: `${trace.operationName}_latency`,
            value: duration,
            unit: 'ms',
            tags: {
                operation: trace.operationName,
                status,
                traceId
            },
            metadata: { ...trace.metadata, error: error?.message }
        });
        if (this.config.benchmarkEnabled && status === 'completed') {
            await this.updateBenchmark(trace.operationName, duration);
        }
        if (this.mlppPerformanceMonitor) {
            await this.mlppPerformanceMonitor.recordMetric(`role_${trace.operationName}_duration`, duration, 'ms', { operation: trace.operationName, status });
        }
        if (this.config.detailedTracing) {
            this.logger.info('Operation trace completed', {
                traceId,
                operationName: trace.operationName,
                duration,
                status
            });
        }
        this.traces.delete(traceId);
    }
    async recordMetric(metricData) {
        if (!this.config.enabled)
            return;
        const metric = {
            id: this.generateMetricId(),
            timestamp: Date.now(),
            ...metricData
        };
        this.metrics.push(metric);
        if (this.config.realTimeAlertsEnabled) {
            await this.checkAlertThresholds(metric);
        }
        if (this.mlppPerformanceMonitor) {
            await this.mlppPerformanceMonitor.recordMetric(metric.name, metric.value, metric.unit, metric.tags);
        }
        this.logger.debug('Performance metric recorded', {
            metricId: metric.id,
            name: metric.name,
            value: metric.value,
            unit: metric.unit
        });
    }
    async optimizePermissionCheck(operation, context) {
        const traceId = this.startTrace('permission_check', context);
        const startTime = performance.now();
        try {
            const result = await operation();
            const duration = performance.now() - startTime;
            await this.recordMetric({
                type: PerformanceMetricType.PERMISSION_CHECK,
                name: 'permission_check_success',
                value: duration,
                unit: 'ms',
                tags: {
                    roleId: context.roleId || 'unknown',
                    permission: context.permission || 'unknown',
                    status: 'success'
                }
            });
            await this.endTrace(traceId, 'completed');
            return result;
        }
        catch (error) {
            const duration = performance.now() - startTime;
            await this.recordMetric({
                type: PerformanceMetricType.PERMISSION_CHECK,
                name: 'permission_check_error',
                value: duration,
                unit: 'ms',
                tags: {
                    roleId: context.roleId || 'unknown',
                    permission: context.permission || 'unknown',
                    status: 'error'
                }
            });
            await this.endTrace(traceId, 'failed', error instanceof Error ? error : new Error('Unknown error'));
            throw error;
        }
    }
    getPerformanceStats() {
        const recentMetrics = this.metrics
            .filter(m => Date.now() - m.timestamp < 300000)
            .slice(-50);
        return {
            totalMetrics: this.metrics.length,
            activeTraces: this.traces.size,
            totalAlerts: this.alerts.length,
            unresolvedAlerts: this.alerts.filter(a => !a.resolved).length,
            benchmarks: Object.fromEntries(this.benchmarks),
            recentMetrics
        };
    }
    getHealthStatus() {
        const stats = this.getPerformanceStats();
        const issues = [];
        const recommendations = [];
        let score = 100;
        if (stats.unresolvedAlerts > 0) {
            issues.push(`${stats.unresolvedAlerts} unresolved alerts`);
            score -= stats.unresolvedAlerts * 10;
        }
        if (stats.activeTraces > 100) {
            issues.push('High number of active traces');
            score -= 20;
            recommendations.push('Consider increasing cleanup frequency');
        }
        for (const [operation, benchmark] of this.benchmarks) {
            if (benchmark.p95 > this.config.alertThresholds[`${operation}_latency_ms`]) {
                issues.push(`${operation} P95 latency exceeds threshold`);
                score -= 15;
                recommendations.push(`Optimize ${operation} performance`);
            }
        }
        let status = 'healthy';
        if (score < 80)
            status = 'degraded';
        if (score < 60)
            status = 'unhealthy';
        return { status, score, issues, recommendations };
    }
    async checkAlertThresholds(metric) {
        const thresholdKey = `${metric.name}_${metric.unit}`;
        const threshold = this.config.alertThresholds[thresholdKey];
        if (threshold && metric.value > threshold) {
            const alert = {
                id: this.generateAlertId(),
                level: this.determineAlertLevel(metric.value, threshold),
                metric: metric.name,
                threshold,
                currentValue: metric.value,
                message: `${metric.name} (${metric.value}${metric.unit}) exceeds threshold (${threshold}${metric.unit})`,
                timestamp: Date.now(),
                resolved: false
            };
            this.alerts.push(alert);
            this.logger.warn('Performance alert triggered', {
                alertId: alert.id,
                level: alert.level,
                metric: alert.metric,
                currentValue: alert.currentValue,
                threshold: alert.threshold
            });
            if (this.config.realTimeAlertsEnabled) {
                await this.sendRealTimeAlert(alert);
            }
        }
    }
    determineAlertLevel(value, threshold) {
        const ratio = value / threshold;
        if (ratio >= 3)
            return AlertLevel.EMERGENCY;
        if (ratio >= 2)
            return AlertLevel.CRITICAL;
        if (ratio >= 1.5)
            return AlertLevel.WARNING;
        return AlertLevel.INFO;
    }
    async sendRealTimeAlert(alert) {
        this.logger.error('Real-time performance alert', undefined, {
            alertId: alert.id,
            level: alert.level,
            message: alert.message,
            timestamp: new Date(alert.timestamp).toISOString()
        });
        if (this.mlppPerformanceMonitor) {
            await this.mlppPerformanceMonitor.recordMetric('role_performance_alert', 1, 'count', {
                level: alert.level,
                metric: alert.metric,
                alert_id: alert.id
            });
        }
    }
    async updateBenchmark(operation, duration) {
        let benchmark = this.benchmarks.get(operation);
        if (!benchmark) {
            benchmark = {
                operation,
                p50: duration,
                p95: duration,
                p99: duration,
                mean: duration,
                min: duration,
                max: duration,
                sampleCount: 1,
                lastUpdated: Date.now()
            };
        }
        else {
            const newCount = benchmark.sampleCount + 1;
            benchmark.mean = (benchmark.mean * benchmark.sampleCount + duration) / newCount;
            benchmark.min = Math.min(benchmark.min, duration);
            benchmark.max = Math.max(benchmark.max, duration);
            benchmark.sampleCount = newCount;
            benchmark.lastUpdated = Date.now();
            if (duration < benchmark.p50)
                benchmark.p50 = duration;
            if (duration > benchmark.p95)
                benchmark.p95 = duration;
            if (duration > benchmark.p99)
                benchmark.p99 = duration;
        }
        this.benchmarks.set(operation, benchmark);
    }
    startMetricsCollection() {
        this.metricsTimer = setInterval(async () => {
            await this.collectSystemMetrics();
        }, this.config.collectionInterval);
    }
    async collectSystemMetrics() {
        try {
            const memoryUsage = process.memoryUsage();
            await this.recordMetric({
                type: PerformanceMetricType.MEMORY_USAGE,
                name: 'role_memory_usage',
                value: Math.round(memoryUsage.heapUsed / 1024 / 1024),
                unit: 'mb',
                tags: { component: 'role_module' }
            });
            await this.recordMetric({
                type: PerformanceMetricType.THROUGHPUT,
                name: 'active_traces_count',
                value: this.traces.size,
                unit: 'count',
                tags: { component: 'role_module' }
            });
            await this.recordMetric({
                type: PerformanceMetricType.THROUGHPUT,
                name: 'metrics_count',
                value: this.metrics.length,
                unit: 'count',
                tags: { component: 'role_module' }
            });
        }
        catch (error) {
            this.logger.error('Failed to collect system metrics', error instanceof Error ? error : undefined);
        }
    }
    startCleanupTimer() {
        this.cleanupTimer = setInterval(() => {
            this.cleanupOldData();
        }, 300000);
    }
    cleanupOldData() {
        const now = Date.now();
        const retentionThreshold = now - this.config.retentionPeriod;
        const oldMetricsCount = this.metrics.length;
        this.metrics = this.metrics.filter(m => m.timestamp > retentionThreshold);
        const cleanedMetrics = oldMetricsCount - this.metrics.length;
        const oldAlertsCount = this.alerts.length;
        this.alerts = this.alerts.filter(a => a.timestamp > retentionThreshold);
        const cleanedAlerts = oldAlertsCount - this.alerts.length;
        const longRunningThreshold = now - 300000;
        for (const [traceId, trace] of this.traces.entries()) {
            if (trace.startTime < longRunningThreshold) {
                this.logger.warn('Long-running trace detected', {
                    traceId,
                    operationName: trace.operationName,
                    duration: now - trace.startTime
                });
                this.traces.delete(traceId);
            }
        }
        if (cleanedMetrics > 0 || cleanedAlerts > 0) {
            this.logger.info('Performance data cleanup completed', {
                cleanedMetrics,
                cleanedAlerts,
                remainingMetrics: this.metrics.length,
                remainingAlerts: this.alerts.length
            });
        }
    }
    generateTraceId() {
        return `role-trace-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    }
    generateMetricId() {
        return `role-metric-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    }
    generateAlertId() {
        return `role-alert-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    }
    async resolveAlert(alertId) {
        const alert = this.alerts.find(a => a.id === alertId);
        if (!alert) {
            return false;
        }
        alert.resolved = true;
        alert.resolvedAt = Date.now();
        this.logger.info('Performance alert resolved', {
            alertId,
            metric: alert.metric,
            resolvedAt: new Date(alert.resolvedAt).toISOString()
        });
        return true;
    }
    getUnresolvedAlerts() {
        return this.alerts.filter(a => !a.resolved);
    }
    getOperationBenchmarks() {
        return new Map(this.benchmarks);
    }
    resetBenchmarks() {
        this.benchmarks.clear();
        this.logger.info('Performance benchmarks reset');
    }
    async destroy() {
        if (this.metricsTimer) {
            clearInterval(this.metricsTimer);
        }
        if (this.cleanupTimer) {
            clearInterval(this.cleanupTimer);
        }
        this.metrics = [];
        this.alerts = [];
        this.traces.clear();
        this.benchmarks.clear();
        this.logger.info('Performance monitoring service destroyed');
    }
}
exports.RolePerformanceService = RolePerformanceService;
function createRolePerformanceService(config, mlppPerformanceMonitor) {
    return new RolePerformanceService(config, mlppPerformanceMonitor);
}
