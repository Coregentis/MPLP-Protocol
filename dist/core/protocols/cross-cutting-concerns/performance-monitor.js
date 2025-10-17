"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MLPPPerformanceMonitor = void 0;
class MLPPPerformanceMonitor {
    metrics = [];
    alerts = [];
    activeTraces = new Map();
    config = {
        enabled: true,
        collectionInterval: 30000,
        retentionPeriod: 24 * 60 * 60 * 1000,
        alertThresholds: {
            'response_time_ms': 1000,
            'memory_usage_mb': 512,
            'cpu_usage_percent': 80,
            'error_rate_percent': 5
        },
        exportFormats: ['prometheus', 'json']
    };
    async recordMetric(name, value, unit, tags) {
        if (!this.config.enabled)
            return;
        const metric = {
            name,
            value,
            unit,
            timestamp: new Date().toISOString(),
            tags,
            metadata: {
                source: 'mplp_performance_monitor'
            }
        };
        this.metrics.push(metric);
        await this.checkAlertThresholds(metric);
        this.cleanupOldMetrics();
    }
    startTrace(operationName, metadata) {
        const operationId = `trace-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
        const trace = {
            operationId,
            operationName,
            startTime: Date.now(),
            status: 'running',
            metadata
        };
        this.activeTraces.set(operationId, trace);
        return operationId;
    }
    async endTrace(operationId, status = 'completed') {
        const trace = this.activeTraces.get(operationId);
        if (!trace)
            return null;
        trace.endTime = Date.now();
        trace.duration = trace.endTime - trace.startTime;
        trace.status = status;
        this.activeTraces.delete(operationId);
        await this.recordMetric(`operation_duration_ms`, trace.duration, 'milliseconds', {
            operation: trace.operationName,
            status: trace.status
        });
        return trace;
    }
    getMetrics(filter) {
        if (!filter) {
            return this.metrics;
        }
        return this.metrics.filter(metric => {
            if (filter.name && metric.name !== filter.name) {
                return false;
            }
            const metricTime = new Date(metric.timestamp).getTime();
            if (filter.startTime && metricTime < new Date(filter.startTime).getTime()) {
                return false;
            }
            if (filter.endTime && metricTime > new Date(filter.endTime).getTime()) {
                return false;
            }
            if (filter.tags && metric.tags) {
                for (const [key, value] of Object.entries(filter.tags)) {
                    if (metric.tags[key] !== value) {
                        return false;
                    }
                }
            }
            return true;
        });
    }
    getRealTimeStats() {
        const now = Date.now();
        const recentMetrics = this.metrics.filter(m => new Date(m.timestamp).getTime() > now - 5 * 60 * 1000);
        const stats = {
            totalMetrics: this.metrics.length,
            recentMetrics: recentMetrics.length,
            activeTraces: this.activeTraces.size,
            activeAlerts: this.alerts.filter(a => !a.resolved).length
        };
        const metricGroups = recentMetrics.reduce((groups, metric) => {
            if (!groups[metric.name]) {
                groups[metric.name] = [];
            }
            groups[metric.name].push(metric.value);
            return groups;
        }, {});
        Object.entries(metricGroups).forEach(([name, values]) => {
            if (values.length > 0) {
                stats[`${name}_avg`] = values.reduce((a, b) => a + b, 0) / values.length;
                stats[`${name}_min`] = Math.min(...values);
                stats[`${name}_max`] = Math.max(...values);
            }
        });
        return stats;
    }
    getActiveAlerts() {
        return this.alerts.filter(alert => !alert.resolved);
    }
    async resolveAlert(alertId) {
        const alert = this.alerts.find(a => a.id === alertId);
        if (!alert) {
            return false;
        }
        if (alert.resolved) {
            return true;
        }
        alert.resolved = true;
        await this.recordMetric('alert_resolved', 1, 'count', {
            alert_id: alertId,
            metric_name: alert.metricName,
            severity: alert.severity
        });
        console.log(`Alert resolved: ${alertId} (${alert.metricName})`);
        return true;
    }
    async exportMetrics(_format = 'json') {
        switch (_format) {
            case 'prometheus':
                return this.exportPrometheusFormat();
            case 'json':
            default:
                return JSON.stringify({
                    metrics: this.metrics,
                    alerts: this.alerts,
                    stats: this.getRealTimeStats()
                }, null, 2);
        }
    }
    updateConfig(newConfig) {
        const oldConfig = { ...this.config };
        this.config = { ...this.config, ...newConfig };
        console.log('Performance monitor configuration updated:', {
            oldConfig: oldConfig,
            newConfig: this.config,
            changes: Object.keys(newConfig)
        });
        if (newConfig.enabled === false) {
            this.metrics = [];
            this.alerts = [];
            this.activeTraces.clear();
            console.log('Performance monitoring disabled, data cleared');
        }
        if (newConfig.retentionPeriod !== undefined) {
            this.cleanupOldMetrics();
        }
    }
    async checkAlertThresholds(metric) {
        const threshold = this.config.alertThresholds[metric.name];
        if (threshold && metric.value > threshold) {
            const alert = {
                id: `alert-${Date.now()}`,
                metricName: metric.name,
                threshold,
                currentValue: metric.value,
                severity: this.calculateSeverity(metric.value, threshold),
                timestamp: new Date().toISOString(),
                message: `Metric ${metric.name} exceeded threshold: ${metric.value} > ${threshold}`,
                resolved: false
            };
            this.alerts.push(alert);
        }
    }
    calculateSeverity(value, threshold) {
        const ratio = value / threshold;
        if (ratio >= 2)
            return 'critical';
        if (ratio >= 1.5)
            return 'high';
        if (ratio >= 1.2)
            return 'medium';
        return 'low';
    }
    cleanupOldMetrics() {
        const cutoffTime = Date.now() - this.config.retentionPeriod;
        this.metrics = this.metrics.filter(metric => new Date(metric.timestamp).getTime() > cutoffTime);
    }
    exportPrometheusFormat() {
        const lines = [];
        lines.push('# MPLP Performance Metrics Export');
        lines.push(`# Generated at: ${new Date().toISOString()}`);
        lines.push('');
        const metricGroups = this.metrics.reduce((groups, metric) => {
            if (!groups[metric.name]) {
                groups[metric.name] = [];
            }
            groups[metric.name].push(metric);
            return groups;
        }, {});
        Object.entries(metricGroups).forEach(([name, metrics]) => {
            const cleanName = name.replace(/[^a-zA-Z0-9_]/g, '_');
            lines.push(`# HELP ${cleanName} Performance metric from MPLP`);
            lines.push(`# TYPE ${cleanName} gauge`);
            metrics.forEach(metric => {
                const tags = metric.tags ?
                    Object.entries(metric.tags)
                        .map(([k, v]) => `${k.replace(/[^a-zA-Z0-9_]/g, '_')}="${v}"`)
                        .join(',') : '';
                const tagString = tags ? `{${tags}}` : '';
                lines.push(`${cleanName}${tagString} ${metric.value} ${new Date(metric.timestamp).getTime()}`);
            });
            lines.push('');
        });
        return lines.join('\n');
    }
    async healthCheck() {
        try {
            await this.recordMetric('health_check', 1, 'count');
            return true;
        }
        catch {
            return false;
        }
    }
}
exports.MLPPPerformanceMonitor = MLPPPerformanceMonitor;
