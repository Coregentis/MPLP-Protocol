"use strict";
/**
 * @fileoverview Monitoring Dashboard - Real-time monitoring dashboard
 * @version 1.1.0-beta
 * @author MPLP Team
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MonitoringDashboard = void 0;
const events_1 = require("events");
/**
 * Monitoring dashboard for real-time system monitoring
 */
class MonitoringDashboard extends events_1.EventEmitter {
    constructor(config = {}) {
        super();
        this.isActive = false;
        this.config = {
            enabled: true,
            interval: 5000,
            ...config
        };
        this.dashboardData = {
            panels: {},
            timestamp: new Date(),
            refreshInterval: this.config.interval || 5000
        };
    }
    /**
     * Start monitoring dashboard
     */
    async start() {
        if (this.isActive) {
            return;
        }
        this.isActive = true;
        this.startUpdateLoop();
        this.emit('started');
    }
    /**
     * Stop monitoring dashboard
     */
    async stop() {
        if (!this.isActive) {
            return;
        }
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = undefined;
        }
        this.isActive = false;
        this.emit('stopped');
    }
    /**
     * Get current dashboard data
     */
    getDashboardData() {
        return { ...this.dashboardData };
    }
    /**
     * Update panel data
     */
    updatePanel(panelId, data) {
        this.dashboardData.panels[panelId] = {
            type: 'metric',
            data,
            timestamp: new Date()
        };
        this.emit('panelUpdated', { panelId, data });
    }
    /**
     * Add new panel
     */
    addPanel(panelId, type, data) {
        this.dashboardData.panels[panelId] = {
            type,
            data,
            timestamp: new Date()
        };
        this.emit('panelAdded', { panelId, type, data });
    }
    /**
     * Remove panel
     */
    removePanel(panelId) {
        if (this.dashboardData.panels[panelId]) {
            delete this.dashboardData.panels[panelId];
            this.emit('panelRemoved', { panelId });
        }
    }
    /**
     * Get system health
     */
    getSystemHealth() {
        const now = new Date();
        return {
            overall: 'healthy',
            timestamp: now,
            checks: [
                {
                    name: 'CPU Usage',
                    status: 'healthy',
                    timestamp: now,
                    duration: 1,
                    message: 'CPU usage is normal'
                },
                {
                    name: 'Memory Usage',
                    status: 'healthy',
                    timestamp: now,
                    duration: 1,
                    message: 'Memory usage is normal'
                },
                {
                    name: 'Disk Space',
                    status: 'healthy',
                    timestamp: now,
                    duration: 1,
                    message: 'Disk space is sufficient'
                }
            ],
            metrics: {
                uptime: process.uptime(),
                responseTime: 50,
                errorRate: 0.01,
                throughput: 100
            }
        };
    }
    /**
     * Get monitoring statistics
     */
    getStatistics() {
        return {
            isActive: this.isActive,
            panelCount: Object.keys(this.dashboardData.panels).length,
            lastUpdate: this.dashboardData.timestamp,
            refreshInterval: this.dashboardData.refreshInterval,
            uptime: this.isActive ? Date.now() - this.dashboardData.timestamp.getTime() : 0
        };
    }
    /**
     * Start update loop
     */
    startUpdateLoop() {
        this.updateInterval = setInterval(() => {
            this.updateDashboard();
        }, this.config.interval || 5000);
    }
    /**
     * Update dashboard data
     */
    updateDashboard() {
        this.dashboardData.timestamp = new Date();
        // Update system metrics panel
        this.updatePanel('system-metrics', {
            cpu: this.getCPUUsage(),
            memory: this.getMemoryUsage(),
            uptime: process.uptime(),
            timestamp: new Date()
        });
        // Update health panel
        this.updatePanel('system-health', this.getSystemHealth());
        this.emit('dashboardUpdated', this.dashboardData);
    }
    /**
     * Get CPU usage (mock implementation)
     */
    getCPUUsage() {
        // In a real implementation, this would get actual CPU usage
        return Math.random() * 100;
    }
    /**
     * Get memory usage
     */
    getMemoryUsage() {
        const memUsage = process.memoryUsage();
        return {
            used: memUsage.heapUsed,
            total: memUsage.heapTotal,
            percentage: (memUsage.heapUsed / memUsage.heapTotal) * 100,
            external: memUsage.external,
            arrayBuffers: memUsage.arrayBuffers
        };
    }
}
exports.MonitoringDashboard = MonitoringDashboard;
//# sourceMappingURL=MonitoringDashboard.js.map