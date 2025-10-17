"use strict";
/**
 * @fileoverview Performance Analyzer - Analyze application performance
 * @version 1.1.0-beta
 * @author MPLP Team
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerformanceAnalyzer = void 0;
const events_1 = require("events");
/**
 * Performance analyzer for analyzing application performance
 */
class PerformanceAnalyzer extends events_1.EventEmitter {
    constructor() {
        super();
        this.isActive = false;
        this.metrics = new Map();
        this.startTime = 0;
    }
    /**
     * Start performance analysis
     */
    async start() {
        if (this.isActive) {
            return;
        }
        this.isActive = true;
        this.startTime = Date.now();
        this.emit('started');
    }
    /**
     * Stop performance analysis
     */
    async stop() {
        if (!this.isActive) {
            return;
        }
        this.isActive = false;
        this.emit('stopped');
    }
    /**
     * Record performance metric
     */
    recordMetric(name, value) {
        if (!this.isActive) {
            return;
        }
        if (!this.metrics.has(name)) {
            this.metrics.set(name, []);
        }
        this.metrics.get(name).push(value);
        this.emit('metricRecorded', { name, value });
    }
    /**
     * Get metric statistics
     */
    getMetricStats(name) {
        const values = this.metrics.get(name);
        if (!values || values.length === 0) {
            return null;
        }
        const sorted = [...values].sort((a, b) => a - b);
        const sum = values.reduce((a, b) => a + b, 0);
        return {
            count: values.length,
            min: sorted[0],
            max: sorted[sorted.length - 1],
            average: sum / values.length,
            median: sorted[Math.floor(sorted.length / 2)],
            p95: sorted[Math.floor(sorted.length * 0.95)],
            p99: sorted[Math.floor(sorted.length * 0.99)]
        };
    }
    /**
     * Get all metrics
     */
    getAllMetrics() {
        const result = {};
        for (const [name] of this.metrics) {
            result[name] = this.getMetricStats(name);
        }
        return result;
    }
    /**
     * Clear all metrics
     */
    clearMetrics() {
        this.metrics.clear();
        this.emit('metricsCleared');
    }
    /**
     * Get performance summary
     */
    getPerformanceSummary() {
        const uptime = this.isActive ? Date.now() - this.startTime : 0;
        const totalMetrics = Array.from(this.metrics.values()).reduce((sum, values) => sum + values.length, 0);
        return {
            isActive: this.isActive,
            uptime,
            totalMetrics,
            metricTypes: this.metrics.size,
            metrics: this.getAllMetrics()
        };
    }
}
exports.PerformanceAnalyzer = PerformanceAnalyzer;
//# sourceMappingURL=PerformanceAnalyzer.js.map