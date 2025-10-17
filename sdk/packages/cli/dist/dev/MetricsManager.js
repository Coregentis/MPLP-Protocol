"use strict";
/**
 * @fileoverview Metrics manager implementation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricsManager = void 0;
const events_1 = require("events");
const MPLPEventManager_1 = require("../core/MPLPEventManager");
/**
 * Metrics manager implementation
 */
class MetricsManager extends events_1.EventEmitter {
    constructor() {
        super();
        this._isCollecting = false;
        this.startTime = 0;
        this.updateInterval = 5000; // 5 seconds
        this.eventManager = new MPLPEventManager_1.MPLPEventManager();
        this._metrics = this.createInitialMetrics();
    }
    // ===== EventEmitter兼容方法 =====
    on(event, listener) { this.eventManager.on(event, listener); return this; }
    emit(event, ...args) { return this.eventManager.emit(event, ...args); }
    off(event, listener) { this.eventManager.off(event, listener); return this; }
    removeAllListeners(event) { this.eventManager.removeAllListeners(event); return this; }
    /**
     * Get current metrics
     */
    get metrics() {
        return { ...this._metrics };
    }
    /**
     * Get collecting status
     */
    get isCollecting() {
        return this._isCollecting;
    }
    /**
     * Start metrics collection
     */
    start() {
        if (this._isCollecting) {
            return;
        }
        this.startTime = Date.now();
        this._isCollecting = true;
        // Start periodic metrics update
        this.metricsInterval = setInterval(() => {
            this.updateMetrics();
        }, this.updateInterval);
        this.emit('metrics:start');
    }
    /**
     * Stop metrics collection
     */
    stop() {
        if (!this._isCollecting) {
            return;
        }
        this._isCollecting = false;
        if (this.metricsInterval) {
            clearInterval(this.metricsInterval);
            this.metricsInterval = undefined;
        }
        this.emit('metrics:stop');
    }
    /**
     * Record a request
     */
    recordRequest() {
        this._metrics.requests++;
        this.emit('metrics:request');
    }
    /**
     * Record an error
     */
    recordError() {
        this._metrics.errors++;
        this.emit('metrics:error');
    }
    /**
     * Record build time
     */
    recordBuildTime(duration) {
        this._metrics.buildTime = duration;
        this.emit('metrics:build', duration);
    }
    /**
     * Get current metrics
     */
    getMetrics() {
        this.updateMetrics();
        return { ...this._metrics };
    }
    /**
     * Reset metrics
     */
    resetMetrics() {
        this._metrics = this.createInitialMetrics();
        this.startTime = Date.now();
        this.emit('metrics:reset');
    }
    /**
     * Create initial metrics
     */
    createInitialMetrics() {
        return {
            uptime: 0,
            requests: 0,
            errors: 0,
            buildTime: 0,
            memoryUsage: process.memoryUsage(),
            cpuUsage: process.cpuUsage()
        };
    }
    /**
     * Update metrics
     */
    updateMetrics() {
        if (!this._isCollecting) {
            return;
        }
        // Update uptime
        this._metrics.uptime = Date.now() - this.startTime;
        // Update memory usage
        this._metrics.memoryUsage = process.memoryUsage();
        // Update CPU usage
        this._metrics.cpuUsage = process.cpuUsage();
        this.emit('metrics:update', this._metrics);
    }
}
exports.MetricsManager = MetricsManager;
//# sourceMappingURL=MetricsManager.js.map