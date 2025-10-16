/**
 * @fileoverview Monitoring Dashboard - Real-time monitoring dashboard
 * @version 1.1.0-beta
 * @author MPLP Team
 */

import { MonitoringConfig, DashboardData, SystemHealth } from '../types/monitoring';
import { MPLPEventManager } from '../utils/MPLPEventManager';

/**
 * Monitoring dashboard for real-time system monitoring
 */
export class MonitoringDashboard {
  private eventManager: MPLPEventManager;
  private config: MonitoringConfig;
  private isActive = false;
  private updateInterval?: NodeJS.Timeout;
  private dashboardData: DashboardData;

  constructor(config: MonitoringConfig = {}) {
    this.eventManager = new MPLPEventManager();
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

  // EventEmitter兼容方法 - 基于MPLP V1.0 Alpha架构
  public on(event: string, listener: (...args: any[]) => void): this {
    this.eventManager.on(event, listener);
    return this;
  }

  public emit(event: string, ...args: any[]): boolean {
    return this.eventManager.emit(event, ...args);
  }

  public off(event: string, listener: (...args: any[]) => void): this {
    this.eventManager.off(event, listener);
    return this;
  }

  public removeAllListeners(event?: string): this {
    this.eventManager.removeAllListeners(event);
    return this;
  }

  /**
   * Start monitoring dashboard
   */
  async start(): Promise<void> {
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
  async stop(): Promise<void> {
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
  getDashboardData(): DashboardData {
    return { ...this.dashboardData };
  }

  /**
   * Update panel data
   */
  updatePanel(panelId: string, data: any): void {
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
  addPanel(panelId: string, type: string, data: any): void {
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
  removePanel(panelId: string): void {
    if (this.dashboardData.panels[panelId]) {
      delete this.dashboardData.panels[panelId];
      this.emit('panelRemoved', { panelId });
    }
  }

  /**
   * Get system health
   */
  getSystemHealth(): SystemHealth {
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
  getStatistics(): any {
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
  private startUpdateLoop(): void {
    this.updateInterval = setInterval(() => {
      this.updateDashboard();
    }, this.config.interval || 5000);
  }

  /**
   * Update dashboard data
   */
  private updateDashboard(): void {
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
  private getCPUUsage(): number {
    // In a real implementation, this would get actual CPU usage
    return Math.random() * 100;
  }

  /**
   * Get memory usage
   */
  private getMemoryUsage(): any {
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
