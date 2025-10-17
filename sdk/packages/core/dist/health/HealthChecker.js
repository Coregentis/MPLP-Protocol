"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthChecker = exports.HealthStatus = void 0;
const events_1 = require("events");
/**
 * Health status levels
 */
var HealthStatus;
(function (HealthStatus) {
    HealthStatus["HEALTHY"] = "healthy";
    HealthStatus["DEGRADED"] = "degraded";
    HealthStatus["UNHEALTHY"] = "unhealthy";
    HealthStatus["UNKNOWN"] = "unknown";
})(HealthStatus || (exports.HealthStatus = HealthStatus = {}));
/**
 * Enhanced Health Checker
 *
 * Advanced health monitoring system with custom checks, detailed reporting,
 * metrics collection, and alerting capabilities.
 */
class HealthChecker extends events_1.EventEmitter {
    constructor(moduleManager, logger) {
        super();
        this.isRunning = false;
        this.checkIntervalMs = 30000; // 30 seconds
        this.customChecks = new Map();
        this.checkResults = new Map();
        this.metrics = new Map();
        this.lastReport = null;
        this.startTime = new Date();
        this.moduleManager = moduleManager;
        this.logger = logger;
        // Register default system checks
        this.registerDefaultChecks();
    }
    /**
     * Registers default system health checks
     */
    registerDefaultChecks() {
        // Memory usage check
        this.registerHealthCheck({
            name: 'memory',
            description: 'System memory usage check',
            checkFunction: async () => {
                const memUsage = process.memoryUsage();
                const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
                const heapTotalMB = Math.round(memUsage.heapTotal / 1024 / 1024);
                const usage = heapUsedMB / heapTotalMB;
                return {
                    healthy: usage < 0.9, // Alert if using more than 90% of heap
                    message: `Memory usage: ${heapUsedMB}MB / ${heapTotalMB}MB (${Math.round(usage * 100)}%)`,
                    data: {
                        heapUsed: heapUsedMB,
                        heapTotal: heapTotalMB,
                        usage: usage,
                        rss: Math.round(memUsage.rss / 1024 / 1024),
                        external: Math.round(memUsage.external / 1024 / 1024),
                    },
                };
            },
            interval: 60000, // Check every minute
            critical: true,
        });
        // Event loop lag check
        this.registerHealthCheck({
            name: 'eventLoop',
            description: 'Event loop lag check',
            checkFunction: async () => {
                const start = process.hrtime.bigint();
                await new Promise(resolve => setImmediate(resolve));
                const lag = Number(process.hrtime.bigint() - start) / 1000000; // Convert to ms
                return {
                    healthy: lag < 100, // Alert if lag > 100ms
                    message: `Event loop lag: ${lag.toFixed(2)}ms`,
                    data: { lag },
                };
            },
            interval: 30000,
            critical: true,
        });
        // Module health check
        this.registerHealthCheck({
            name: 'modules',
            description: 'All modules health check',
            checkFunction: async () => {
                const moduleHealth = await this.moduleManager.getModuleHealthInfo();
                const unhealthyModules = Object.values(moduleHealth).filter(h => !h.healthy);
                return {
                    healthy: unhealthyModules.length === 0,
                    message: unhealthyModules.length > 0
                        ? `${unhealthyModules.length} unhealthy modules: ${unhealthyModules.map(m => m.name).join(', ')}`
                        : 'All modules healthy',
                    data: moduleHealth,
                };
            },
            interval: 15000,
            critical: true,
        });
    }
    /**
     * Registers a custom health check
     */
    registerHealthCheck(config) {
        this.logger.info(`Registering health check: ${config.name}`);
        // Validate configuration
        if (!config.name || !config.checkFunction) {
            throw new Error('Health check must have a name and check function');
        }
        // Set defaults
        const fullConfig = {
            interval: 60000, // 1 minute default
            timeout: 5000, // 5 seconds default
            retries: 3,
            critical: false,
            tags: [],
            ...config,
        };
        this.customChecks.set(config.name, fullConfig);
        // Initialize metrics
        this.metrics.set(config.name, {
            checkCount: 0,
            successCount: 0,
            failureCount: 0,
            averageResponseTime: 0,
            uptimePercentage: 100,
        });
        this.emit('healthCheckRegistered', { name: config.name, config: fullConfig });
    }
    /**
     * Unregisters a health check
     */
    unregisterHealthCheck(name) {
        if (this.customChecks.has(name)) {
            this.customChecks.delete(name);
            this.checkResults.delete(name);
            this.metrics.delete(name);
            this.logger.info(`Unregistered health check: ${name}`);
            this.emit('healthCheckUnregistered', { name });
        }
    }
    /**
     * Initializes the health checker
     */
    async initialize() {
        this.logger.info('Initializing HealthChecker...');
        // Perform initial health check and generate report
        await this.getHealthReport();
        this.emit('initialized');
        this.logger.info('HealthChecker initialized successfully');
    }
    /**
     * Starts health monitoring
     */
    async start() {
        if (this.isRunning) {
            return;
        }
        this.isRunning = true;
        this.interval = setInterval(async () => {
            await this.performHealthCheck();
        }, this.checkIntervalMs);
    }
    /**
     * Stops health monitoring
     */
    async stop() {
        if (!this.isRunning) {
            return;
        }
        this.isRunning = false;
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = undefined;
        }
    }
    /**
     * Gets the last cached health report
     */
    getLastHealthReport() {
        return this.lastReport;
    }
    /**
     * Gets a comprehensive health report
     */
    async getHealthReport() {
        // Perform fresh health checks
        await this.performFullHealthCheck();
        const moduleStatuses = this.moduleManager.getModuleStatuses();
        const checkResults = Object.fromEntries(this.checkResults);
        // Calculate overall status
        const criticalChecks = Array.from(this.customChecks.values()).filter(c => c.critical);
        const criticalResults = criticalChecks.map(c => this.checkResults.get(c.name)).filter(Boolean);
        const unhealthyCritical = criticalResults.filter(r => !r.healthy);
        let overallStatus;
        if (unhealthyCritical.length > 0) {
            overallStatus = HealthStatus.UNHEALTHY;
        }
        else {
            const allResults = Array.from(this.checkResults.values());
            const unhealthyCount = allResults.filter(r => !r.healthy).length;
            if (unhealthyCount === 0) {
                overallStatus = HealthStatus.HEALTHY;
            }
            else if (unhealthyCount / allResults.length < 0.3) {
                overallStatus = HealthStatus.DEGRADED;
            }
            else {
                overallStatus = HealthStatus.UNHEALTHY;
            }
        }
        // Collect system information
        const systemInfo = {
            memory: process.memoryUsage(),
            platform: process.platform,
            nodeVersion: process.version,
            loadAverage: process.platform !== 'win32' ? require('os').loadavg() : undefined,
        };
        // Calculate summary
        const allResults = Array.from(this.checkResults.values());
        const summary = {
            total: allResults.length,
            healthy: allResults.filter(r => r.healthy).length,
            unhealthy: allResults.filter(r => !r.healthy).length,
            critical: criticalResults.length,
        };
        const report = {
            status: overallStatus,
            timestamp: new Date(),
            uptime: Date.now() - this.startTime.getTime(),
            checks: checkResults,
            modules: moduleStatuses,
            system: systemInfo,
            metrics: this.getMetricsSummary(),
            summary,
        };
        this.lastFullCheck = new Date();
        this.lastReport = report;
        this.emit('healthReportGenerated', report);
        return report;
    }
    /**
     * Gets the current health status (simplified)
     */
    async getHealthStatus() {
        const report = await this.getHealthReport();
        return {
            status: report.status,
            timestamp: report.timestamp.toISOString(),
            uptime: report.uptime,
            summary: {
                healthy: report.summary.healthy,
                unhealthy: report.summary.unhealthy,
                total: report.summary.total,
            },
        };
    }
    /**
     * Gets metrics for a specific health check
     */
    getHealthCheckMetrics(name) {
        return this.metrics.get(name);
    }
    /**
     * Gets all health check metrics
     */
    getAllMetrics() {
        return Object.fromEntries(this.metrics);
    }
    /**
     * Gets a summary of all metrics
     */
    getMetricsSummary() {
        const summary = {};
        for (const [name, metrics] of this.metrics) {
            summary[name] = {
                successRate: metrics.checkCount > 0 ? (metrics.successCount / metrics.checkCount) * 100 : 0,
                averageResponseTime: metrics.averageResponseTime,
                uptime: metrics.uptimePercentage,
                lastCheck: metrics.lastCheckTime,
            };
        }
        return summary;
    }
    /**
     * Performs all health checks
     */
    async performFullHealthCheck() {
        const checkPromises = Array.from(this.customChecks.entries()).map(async ([name, config]) => {
            try {
                await this.executeHealthCheck(name, config);
            }
            catch (error) {
                this.logger.error(`Health check '${name}' failed:`, error);
            }
        });
        await Promise.all(checkPromises);
    }
    /**
     * Executes a single health check with timeout and retry logic
     */
    async executeHealthCheck(name, config) {
        const startTime = Date.now();
        let result;
        let attempts = 0;
        const maxAttempts = (config.retries || 0) + 1; // retries + initial attempt
        while (attempts < maxAttempts) {
            attempts++;
            try {
                // Execute with timeout
                result = await this.executeWithTimeout(config.checkFunction, config.timeout || 5000);
                result.duration = Date.now() - startTime;
                result.timestamp = new Date();
                // If successful, break out of retry loop
                if (result.healthy) {
                    break;
                }
                // If not healthy and we have more attempts, continue
                if (attempts < maxAttempts) {
                    this.logger.warn(`Health check '${name}' failed, retrying... (${attempts}/${maxAttempts})`);
                    await this.delay(1000); // Wait 1 second before retry
                }
            }
            catch (error) {
                result = {
                    healthy: false,
                    message: `Health check failed: ${error instanceof Error ? error.message : String(error)}`,
                    duration: Date.now() - startTime,
                    timestamp: new Date(),
                };
                if (attempts < maxAttempts) {
                    this.logger.warn(`Health check '${name}' threw error, retrying... (${attempts}/${maxAttempts}):`, error);
                    await this.delay(1000);
                }
            }
        }
        // Store result and update metrics
        this.checkResults.set(name, result);
        this.updateMetrics(name, result);
        // Emit events
        if (result.healthy) {
            this.emit('healthCheckPassed', { name, result: result });
        }
        else {
            this.emit('healthCheckFailed', { name, result: result, critical: config.critical });
            if (config.critical) {
                this.emit('criticalHealthCheckFailed', { name, result: result });
            }
        }
    }
    /**
     * Executes a function with timeout
     */
    async executeWithTimeout(fn, timeoutMs) {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error(`Health check timed out after ${timeoutMs}ms`));
            }, timeoutMs);
            fn()
                .then(result => {
                clearTimeout(timeout);
                resolve(result);
            })
                .catch(error => {
                clearTimeout(timeout);
                reject(error);
            });
        });
    }
    /**
     * Updates metrics for a health check
     */
    updateMetrics(name, result) {
        const metrics = this.metrics.get(name);
        if (!metrics)
            return;
        metrics.checkCount++;
        metrics.lastCheckTime = result.timestamp;
        if (result.healthy) {
            metrics.successCount++;
        }
        else {
            metrics.failureCount++;
        }
        // Update average response time
        if (result.duration) {
            const totalTime = metrics.averageResponseTime * (metrics.checkCount - 1) + result.duration;
            metrics.averageResponseTime = totalTime / metrics.checkCount;
        }
        // Update uptime percentage
        metrics.uptimePercentage = (metrics.successCount / metrics.checkCount) * 100;
    }
    /**
     * Utility delay function
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    /**
     * Performs periodic health checks
     */
    async performHealthCheck() {
        try {
            await this.performFullHealthCheck();
            // Check if we need to emit alerts
            const report = await this.getHealthReport();
            if (report.status === HealthStatus.UNHEALTHY) {
                this.emit('systemUnhealthy', report);
            }
            else if (report.status === HealthStatus.DEGRADED) {
                this.emit('systemDegraded', report);
            }
        }
        catch (error) {
            this.logger.error('Periodic health check failed:', error);
            this.emit('healthCheckError', { error });
        }
    }
    /**
     * Gets health check configuration
     */
    getHealthCheckConfig(name) {
        return this.customChecks.get(name);
    }
    /**
     * Lists all registered health checks
     */
    listHealthChecks() {
        return Array.from(this.customChecks.keys());
    }
    /**
     * Gets the last full health check time
     */
    getLastCheckTime() {
        return this.lastFullCheck;
    }
    /**
     * Cleanup resources
     */
    destroy() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = undefined;
        }
        this.isRunning = false;
        this.removeAllListeners();
        this.logger.info('HealthChecker destroyed');
        this.emit('destroyed');
    }
}
exports.HealthChecker = HealthChecker;
//# sourceMappingURL=HealthChecker.js.map