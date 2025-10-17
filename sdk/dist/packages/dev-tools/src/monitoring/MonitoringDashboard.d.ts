/**
 * @fileoverview Monitoring Dashboard - Real-time monitoring dashboard
 * @version 1.1.0-beta
 * @author MPLP Team
 */
import { EventEmitter } from 'events';
import { MonitoringConfig, DashboardData, SystemHealth } from '../types/monitoring';
/**
 * Monitoring dashboard for real-time system monitoring
 */
export declare class MonitoringDashboard extends EventEmitter {
    private config;
    private isActive;
    private updateInterval?;
    private dashboardData;
    constructor(config?: MonitoringConfig);
    /**
     * Start monitoring dashboard
     */
    start(): Promise<void>;
    /**
     * Stop monitoring dashboard
     */
    stop(): Promise<void>;
    /**
     * Get current dashboard data
     */
    getDashboardData(): DashboardData;
    /**
     * Update panel data
     */
    updatePanel(panelId: string, data: any): void;
    /**
     * Add new panel
     */
    addPanel(panelId: string, type: string, data: any): void;
    /**
     * Remove panel
     */
    removePanel(panelId: string): void;
    /**
     * Get system health
     */
    getSystemHealth(): SystemHealth;
    /**
     * Get monitoring statistics
     */
    getStatistics(): any;
    /**
     * Start update loop
     */
    private startUpdateLoop;
    /**
     * Update dashboard data
     */
    private updateDashboard;
    /**
     * Get CPU usage (mock implementation)
     */
    private getCPUUsage;
    /**
     * Get memory usage
     */
    private getMemoryUsage;
}
//# sourceMappingURL=MonitoringDashboard.d.ts.map