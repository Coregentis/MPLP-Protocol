"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemMonitor = void 0;
class SystemMonitor {
    config;
    executionStatuses = new Map();
    logEntries = [];
    errorTraces = [];
    alerts = [];
    metricsHistory = [];
    monitoringInterval = null;
    constructor(config = {}) {
        this.config = {
            enableMetrics: config.enableMetrics ?? true,
            enableLogging: config.enableLogging ?? true,
            enableTracing: config.enableTracing ?? true,
            enableAlerting: config.enableAlerting ?? true,
            metricsInterval: config.metricsInterval ?? 30000,
            logLevel: config.logLevel ?? 'info',
            retentionDays: config.retentionDays ?? 30,
            alertThresholds: {
                cpuUsage: 80,
                memoryUsage: 85,
                errorRate: 5,
                responseTime: 1000,
                connectionCount: 1000,
                ...config.alertThresholds
            }
        };
        this.startMonitoring();
    }
    startExecutionMonitoring(executionId, workflowId) {
        const status = {
            executionId,
            workflowId,
            status: 'running',
            startTime: new Date().toISOString(),
            progress: {
                totalStages: 0,
                completedStages: 0,
                failedStages: 0,
                progressPercentage: 0
            },
            metrics: {
                cpuUsage: 0,
                memoryUsage: 0,
                networkIO: 0,
                diskIO: 0,
                moduleCallCount: 0,
                averageResponseTime: 0
            },
            errors: []
        };
        this.executionStatuses.set(executionId, status);
        this.log('info', `Execution monitoring started: ${executionId}`, 'execution', { executionId, workflowId });
    }
    updateExecutionStatus(executionId, updates) {
        const status = this.executionStatuses.get(executionId);
        if (!status) {
            this.log('warn', `Execution not found for status update: ${executionId}`, 'execution');
            return;
        }
        Object.assign(status, updates);
        if (updates.status === 'completed' || updates.status === 'failed' || updates.status === 'cancelled') {
            status.endTime = new Date().toISOString();
            status.duration = new Date(status.endTime).getTime() - new Date(status.startTime).getTime();
        }
        this.log('debug', `Execution status updated: ${executionId}`, 'execution', { executionId, status: updates.status });
    }
    stopExecutionMonitoring(executionId) {
        const status = this.executionStatuses.get(executionId);
        if (status) {
            status.status = 'completed';
            status.endTime = new Date().toISOString();
            status.duration = new Date(status.endTime).getTime() - new Date(status.startTime).getTime();
        }
        this.log('info', `Execution monitoring stopped: ${executionId}`, 'execution', { executionId });
    }
    async collectPerformanceMetrics() {
        const timestamp = new Date().toISOString();
        const memUsage = process.memoryUsage();
        const metrics = {
            timestamp,
            system: {
                cpu: {
                    usage: 0,
                    loadAverage: [0, 0, 0],
                    processes: 1,
                    threads: 1
                },
                memory: {
                    total: memUsage.heapTotal,
                    used: memUsage.heapUsed,
                    free: memUsage.heapTotal - memUsage.heapUsed,
                    cached: 0,
                    heapUsed: memUsage.heapUsed,
                    heapTotal: memUsage.heapTotal
                },
                disk: {
                    usage: 0,
                    readOps: 0,
                    writeOps: 0,
                    readBytes: 0,
                    writeBytes: 0
                },
                network: {
                    connections: this.getActiveConnectionCount(),
                    bytesIn: 0,
                    bytesOut: 0,
                    packetsIn: 0,
                    packetsOut: 0,
                    errors: 0
                }
            },
            application: {
                activeExecutions: this.getActiveExecutionCount(),
                completedExecutions: this.getCompletedExecutionCount(),
                failedExecutions: this.getFailedExecutionCount(),
                averageExecutionTime: this.getAverageExecutionTime(),
                moduleCallRate: 0,
                errorRate: this.getErrorRate(),
                throughput: this.getThroughput()
            },
            business: {
                workflowsPerHour: this.getWorkflowsPerHour(),
                successRate: this.getSuccessRate(),
                userSatisfactionScore: 0,
                costPerExecution: 0,
                resourceEfficiency: 0
            }
        };
        if (this.config.enableMetrics) {
            this.metricsHistory.push(metrics);
            this.cleanupOldMetrics();
        }
        this.checkAlertThresholds(metrics);
        return metrics;
    }
    log(level, message, category, context) {
        if (!this.config.enableLogging)
            return;
        const logEntry = {
            logId: this.generateUUID(),
            timestamp: new Date().toISOString(),
            level,
            message,
            category,
            source: 'SystemMonitor',
            context,
            metadata: {
                version: '1.0.0',
                environment: process.env.NODE_ENV || 'development',
                hostname: 'localhost',
                processId: process.pid
            }
        };
        this.logEntries.push(logEntry);
        this.cleanupOldLogs();
        console.log(`[${logEntry.timestamp}] ${level.toUpperCase()} [${category}] ${message}`, context || '');
    }
    traceError(error, context = {}) {
        if (!this.config.enableTracing) {
            return {};
        }
        const trace = {
            traceId: this.generateUUID(),
            errorId: this.generateUUID(),
            timestamp: new Date().toISOString(),
            errorType: error.constructor.name,
            severity: this.determineSeverity(error),
            message: error.message,
            stackTrace: error.stack || '',
            source: {
                moduleId: 'core',
                functionName: this.extractFunctionName(error.stack),
                fileName: this.extractFileName(error.stack),
                lineNumber: this.extractLineNumber(error.stack)
            },
            context: {
                environment: {
                    nodeVersion: process.version,
                    platform: process.platform,
                    arch: process.arch
                },
                ...context
            }
        };
        this.errorTraces.push(trace);
        this.cleanupOldTraces();
        this.log('error', `Error traced: ${error.message}`, 'error', { traceId: trace.traceId });
        return trace;
    }
    createAlert(type, title, description, metrics) {
        const alert = {
            alertId: this.generateUUID(),
            timestamp: new Date().toISOString(),
            severity: this.determineAlertSeverity(type, metrics),
            type,
            title,
            description,
            source: 'SystemMonitor',
            metrics,
            threshold: this.getThresholdForType(type),
            currentValue: this.getCurrentValueForType(type, metrics),
            status: 'active'
        };
        this.alerts.push(alert);
        this.log('warn', `Alert created: ${title}`, 'alert', { alertId: alert.alertId });
        return alert;
    }
    getMonitoringStatistics() {
        return {
            activeExecutions: this.getActiveExecutionCount(),
            totalLogEntries: this.logEntries.length,
            totalErrorTraces: this.errorTraces.length,
            activeAlerts: this.alerts.filter(a => a.status === 'active').length,
            metricsDataPoints: this.metricsHistory.length,
            uptime: process.uptime(),
            lastMetricsCollection: this.metricsHistory[this.metricsHistory.length - 1]?.timestamp
        };
    }
    startMonitoring() {
        if (this.config.enableMetrics) {
            this.monitoringInterval = setInterval(async () => {
                try {
                    await this.collectPerformanceMetrics();
                }
                catch (error) {
                    this.log('error', 'Failed to collect metrics', 'monitoring', { error: error instanceof Error ? error.message : 'Unknown error' });
                }
            }, this.config.metricsInterval);
        }
    }
    getActiveExecutionCount() {
        return Array.from(this.executionStatuses.values())
            .filter(status => status.status === 'running').length;
    }
    getCompletedExecutionCount() {
        return Array.from(this.executionStatuses.values())
            .filter(status => status.status === 'completed').length;
    }
    getFailedExecutionCount() {
        return Array.from(this.executionStatuses.values())
            .filter(status => status.status === 'failed').length;
    }
    getAverageExecutionTime() {
        const completed = Array.from(this.executionStatuses.values())
            .filter(status => status.status === 'completed' && status.duration);
        if (completed.length === 0)
            return 0;
        const totalTime = completed.reduce((sum, status) => sum + (status.duration || 0), 0);
        return totalTime / completed.length;
    }
    getErrorRate() {
        const total = this.executionStatuses.size;
        const failed = this.getFailedExecutionCount();
        return total > 0 ? (failed / total) * 100 : 0;
    }
    getThroughput() {
        return this.getCompletedExecutionCount();
    }
    getWorkflowsPerHour() {
        return this.getCompletedExecutionCount() * 60;
    }
    getSuccessRate() {
        const total = this.getCompletedExecutionCount() + this.getFailedExecutionCount();
        const successful = this.getCompletedExecutionCount();
        return total > 0 ? (successful / total) * 100 : 100;
    }
    getActiveConnectionCount() {
        return this.getActiveExecutionCount();
    }
    checkAlertThresholds(metrics) {
        if (!this.config.enableAlerting)
            return;
        if (metrics.system.cpu.usage > this.config.alertThresholds.cpuUsage) {
            this.createAlert('performance', 'High CPU Usage', `CPU usage is ${metrics.system.cpu.usage}%`, { cpuUsage: metrics.system.cpu.usage });
        }
        const memoryUsage = (metrics.system.memory.used / metrics.system.memory.total) * 100;
        if (memoryUsage > this.config.alertThresholds.memoryUsage) {
            this.createAlert('performance', 'High Memory Usage', `Memory usage is ${memoryUsage.toFixed(2)}%`, { memoryUsage });
        }
        if (metrics.application.errorRate > this.config.alertThresholds.errorRate) {
            this.createAlert('error', 'High Error Rate', `Error rate is ${metrics.application.errorRate.toFixed(2)}%`, { errorRate: metrics.application.errorRate });
        }
    }
    determineSeverity(error) {
        const message = error.message.toLowerCase();
        if (message.includes('critical') || message.includes('fatal')) {
            return 'critical';
        }
        else if (message.includes('warning') || message.includes('deprecated')) {
            return 'medium';
        }
        else if (message.includes('error') && !message.includes('normal error')) {
            return 'high';
        }
        return 'low';
    }
    determineAlertSeverity(type, _metrics) {
        if (type === 'error' || type === 'security') {
            return 'error';
        }
        else if (type === 'performance') {
            return 'warning';
        }
        return 'info';
    }
    getThresholdForType(type) {
        switch (type) {
            case 'performance': return this.config.alertThresholds.cpuUsage;
            case 'error': return this.config.alertThresholds.errorRate;
            case 'resource': return this.config.alertThresholds.memoryUsage;
            default: return 0;
        }
    }
    getCurrentValueForType(type, metrics) {
        switch (type) {
            case 'performance': return metrics.cpuUsage || 0;
            case 'error': return metrics.errorRate || 0;
            case 'resource': return metrics.memoryUsage || 0;
            default: return 0;
        }
    }
    extractFunctionName(stack) {
        if (!stack)
            return 'unknown';
        const match = stack.match(/at\s+([^\s]+)/);
        return match ? match[1] : 'unknown';
    }
    extractFileName(stack) {
        if (!stack)
            return 'unknown';
        const match = stack.match(/\(([^:]+):/);
        return match ? match[1] : 'unknown';
    }
    extractLineNumber(stack) {
        if (!stack)
            return 0;
        const match = stack.match(/:(\d+):/);
        return match ? parseInt(match[1], 10) : 0;
    }
    cleanupOldMetrics() {
        const cutoff = new Date(Date.now() - this.config.retentionDays * 24 * 60 * 60 * 1000);
        this.metricsHistory = this.metricsHistory.filter(m => new Date(m.timestamp) > cutoff);
    }
    cleanupOldLogs() {
        const cutoff = new Date(Date.now() - this.config.retentionDays * 24 * 60 * 60 * 1000);
        this.logEntries = this.logEntries.filter(l => new Date(l.timestamp) > cutoff);
    }
    cleanupOldTraces() {
        const cutoff = new Date(Date.now() - this.config.retentionDays * 24 * 60 * 60 * 1000);
        this.errorTraces = this.errorTraces.filter(t => new Date(t.timestamp) > cutoff);
    }
    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
    destroy() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }
        this.executionStatuses.clear();
        this.logEntries.length = 0;
        this.errorTraces.length = 0;
        this.alerts.length = 0;
        this.metricsHistory.length = 0;
    }
}
exports.SystemMonitor = SystemMonitor;
