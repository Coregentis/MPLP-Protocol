/**
 * @fileoverview Health Monitoring and Metrics Collection System
 * @version 1.1.0-beta
 */

import { EventEmitter } from 'events';
// import { LoggerManager } from '../logging/EnhancedLogger';

/**
 * Health check status
 */
export enum HealthStatus {
  HEALTHY = 'healthy',
  DEGRADED = 'degraded',
  UNHEALTHY = 'unhealthy',
  UNKNOWN = 'unknown'
}

/**
 * Health check result
 */
export interface HealthCheckResult {
  name: string;
  status: HealthStatus;
  message?: string;
  timestamp: Date;
  duration: number; // in milliseconds
  metadata?: Record<string, unknown>;
}

/**
 * System metrics
 */
export interface SystemMetrics {
  timestamp: Date;
  system: {
    cpu: {
      usage: number; // percentage
      loadAverage: number[];
    };
    memory: {
      used: number; // bytes
      total: number; // bytes
      percentage: number;
    };
    disk: {
      used: number; // bytes
      total: number; // bytes
      percentage: number;
    };
    uptime: number; // seconds
  };
  application: {
    pid: number;
    version: string;
    environment: string;
    startTime: Date;
    requestCount: number;
    errorCount: number;
    responseTime: {
      avg: number;
      p95: number;
      p99: number;
    };
  };
  business?: Record<string, unknown>;
}

/**
 * Health check function type
 */
export type HealthCheckFunction = () => Promise<HealthCheckResult>;

/**
 * Metrics collector function type
 */
export type MetricsCollectorFunction = () => Promise<Record<string, unknown>>;

/**
 * Health monitor configuration
 */
export interface HealthMonitorConfig {
  checkInterval: number; // milliseconds
  metricsInterval: number; // milliseconds
  enableAutoChecks: boolean;
  enableMetricsCollection: boolean;
  healthCheckTimeout: number; // milliseconds
  retainMetricsCount: number;
  alertThresholds: {
    cpu: number; // percentage
    memory: number; // percentage
    disk: number; // percentage
    errorRate: number; // percentage
    responseTime: number; // milliseconds
  };
}

/**
 * Health Monitor implementation
 */
export class HealthMonitor extends EventEmitter {
  private config: HealthMonitorConfig;
  // private logger = LoggerManager.getInstance().getLogger('HealthMonitor');
  private healthChecks: Map<string, HealthCheckFunction> = new Map();
  private metricsCollectors: Map<string, MetricsCollectorFunction> = new Map();
  private lastHealthResults: Map<string, HealthCheckResult> = new Map();
  private metricsHistory: SystemMetrics[] = [];
  private checkInterval: NodeJS.Timeout | undefined;
  private metricsInterval: NodeJS.Timeout | undefined;
  private startTime: Date = new Date();
  private requestCount: number = 0;
  private errorCount: number = 0;
  private responseTimes: number[] = [];

  constructor(config: Partial<HealthMonitorConfig> = {}) {
    super();
    
    this.config = {
      checkInterval: 30000, // 30 seconds
      metricsInterval: 60000, // 1 minute
      enableAutoChecks: true,
      enableMetricsCollection: true,
      healthCheckTimeout: 5000, // 5 seconds
      retainMetricsCount: 100,
      alertThresholds: {
        cpu: 80,
        memory: 85,
        disk: 90,
        errorRate: 5,
        responseTime: 1000
      },
      ...config
    };

    this.setupDefaultHealthChecks();
    this.setupDefaultMetricsCollectors();
    
    if (this.config.enableAutoChecks) {
      this.startAutoChecks();
    }
    
    if (this.config.enableMetricsCollection) {
      this.startMetricsCollection();
    }
  }

  /**
   * Register a health check
   */
  public registerHealthCheck(name: string, checkFunction: HealthCheckFunction): void {
    this.healthChecks.set(name, checkFunction);
    console.log(`Health check registered: ${name}`);
  }

  /**
   * Register a metrics collector
   */
  public registerMetricsCollector(name: string, collectorFunction: MetricsCollectorFunction): void {
    this.metricsCollectors.set(name, collectorFunction);
    console.log(`Metrics collector registered: ${name}`);
  }

  /**
   * Run all health checks
   */
  public async runHealthChecks(): Promise<Map<string, HealthCheckResult>> {
    const results = new Map<string, HealthCheckResult>();
    
    for (const [name, checkFunction] of this.healthChecks) {
      try {
        const startTime = Date.now();
        
        // Run health check with timeout
        const result = await Promise.race([
          checkFunction(),
          this.createTimeoutPromise(name)
        ]);
        
        const duration = Date.now() - startTime;
        const finalResult = { ...result, duration };
        
        results.set(name, finalResult);
        this.lastHealthResults.set(name, finalResult);
        
        console.log(`Health check completed: ${name}`, {
          status: finalResult.status,
          duration: finalResult.duration
        });
        
      } catch (error) {
        const errorResult: HealthCheckResult = {
          name,
          status: HealthStatus.UNHEALTHY,
          message: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date(),
          duration: this.config.healthCheckTimeout
        };
        
        results.set(name, errorResult);
        this.lastHealthResults.set(name, errorResult);
        
        console.error(`Health check failed: ${name}`, error instanceof Error ? error : new Error(String(error)));
      }
    }
    
    // Emit health check completed event
    this.emit('healthChecksCompleted', results);
    
    return results;
  }

  /**
   * Collect system metrics
   */
  public async collectMetrics(): Promise<SystemMetrics> {
    const timestamp = new Date();
    
    // Collect system metrics
    const systemMetrics = await this.collectSystemMetrics();
    
    // Collect application metrics
    const applicationMetrics = this.collectApplicationMetrics();
    
    // Collect business metrics
    const businessMetrics = await this.collectBusinessMetrics();
    
    const metrics: SystemMetrics = {
      timestamp,
      system: systemMetrics,
      application: applicationMetrics,
      business: businessMetrics
    };
    
    // Add to history
    this.metricsHistory.push(metrics);
    
    // Trim history if needed
    if (this.metricsHistory.length > this.config.retainMetricsCount) {
      this.metricsHistory = this.metricsHistory.slice(-this.config.retainMetricsCount);
    }
    
    // Check for alerts
    this.checkAlertThresholds(metrics);
    
    // Emit metrics collected event
    this.emit('metricsCollected', metrics);
    
    console.log('Metrics collected', {
      cpu: metrics.system.cpu.usage,
      memory: metrics.system.memory.percentage,
      requests: metrics.application.requestCount,
      errors: metrics.application.errorCount
    });
    
    return metrics;
  }

  /**
   * Get overall health status
   */
  public getOverallHealthStatus(): HealthStatus {
    if (this.lastHealthResults.size === 0) {
      return HealthStatus.UNKNOWN;
    }
    
    let _healthyCount = 0;
    let degradedCount = 0;
    let unhealthyCount = 0;
    
    for (const result of this.lastHealthResults.values()) {
      switch (result.status) {
        case HealthStatus.HEALTHY:
          _healthyCount++;
          break;
        case HealthStatus.DEGRADED:
          degradedCount++;
          break;
        case HealthStatus.UNHEALTHY:
          unhealthyCount++;
          break;
      }
    }
    
    // If any check is unhealthy, overall is unhealthy
    if (unhealthyCount > 0) {
      return HealthStatus.UNHEALTHY;
    }
    
    // If any check is degraded, overall is degraded
    if (degradedCount > 0) {
      return HealthStatus.DEGRADED;
    }
    
    // All checks are healthy
    return HealthStatus.HEALTHY;
  }

  /**
   * Get health summary
   */
  public getHealthSummary(): {
    status: HealthStatus;
    checks: HealthCheckResult[];
    timestamp: Date;
    uptime: number;
  } {
    return {
      status: this.getOverallHealthStatus(),
      checks: Array.from(this.lastHealthResults.values()),
      timestamp: new Date(),
      uptime: Date.now() - this.startTime.getTime()
    };
  }

  /**
   * Get latest metrics
   */
  public getLatestMetrics(): SystemMetrics | undefined {
    return this.metricsHistory[this.metricsHistory.length - 1];
  }

  /**
   * Get metrics history
   */
  public getMetricsHistory(count?: number): SystemMetrics[] {
    if (count) {
      return this.metricsHistory.slice(-count);
    }
    return [...this.metricsHistory];
  }

  /**
   * Record request
   */
  public recordRequest(responseTime: number, isError: boolean = false): void {
    this.requestCount++;
    
    if (isError) {
      this.errorCount++;
    }
    
    this.responseTimes.push(responseTime);
    
    // Keep only recent response times for calculation
    if (this.responseTimes.length > 1000) {
      this.responseTimes = this.responseTimes.slice(-500);
    }
  }

  /**
   * Start automatic health checks
   */
  public startAutoChecks(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
    
    this.checkInterval = setInterval(async () => {
      try {
        await this.runHealthChecks();
      } catch (error) {
        console.error('Auto health check failed:', error instanceof Error ? error : new Error(String(error)));
      }
    }, this.config.checkInterval);
    
    console.log(`Auto health checks started (interval: ${this.config.checkInterval}ms)`);
  }

  /**
   * Start metrics collection
   */
  public startMetricsCollection(): void {
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
    }
    
    this.metricsInterval = setInterval(async () => {
      try {
        await this.collectMetrics();
      } catch (error) {
        console.error('Metrics collection failed:', error instanceof Error ? error : new Error(String(error)));
      }
    }, this.config.metricsInterval);
    
    console.log(`Metrics collection started (interval: ${this.config.metricsInterval}ms)`);
  }

  /**
   * Stop monitoring
   */
  public stop(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = undefined;
    }
    
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
      this.metricsInterval = undefined;
    }
    
    console.log('Health monitoring stopped');
  }

  /**
   * Setup default health checks
   */
  private setupDefaultHealthChecks(): void {
    // Memory usage check
    this.registerHealthCheck('memory', async () => {
      const memUsage = process.memoryUsage();
      const usedMB = memUsage.heapUsed / 1024 / 1024;
      const totalMB = memUsage.heapTotal / 1024 / 1024;
      const percentage = (usedMB / totalMB) * 100;

      let status = HealthStatus.HEALTHY;
      if (percentage > this.config.alertThresholds.memory) {
        status = HealthStatus.UNHEALTHY;
      } else if (percentage > this.config.alertThresholds.memory * 0.8) {
        status = HealthStatus.DEGRADED;
      }

      return {
        name: 'memory',
        status,
        message: `Memory usage: ${usedMB.toFixed(2)}MB / ${totalMB.toFixed(2)}MB (${percentage.toFixed(1)}%)`,
        timestamp: new Date(),
        duration: 0,
        metadata: { usedMB, totalMB, percentage }
      };
    });

    // Error rate check
    this.registerHealthCheck('errorRate', async () => {
      const errorRate = this.requestCount > 0 ? (this.errorCount / this.requestCount) * 100 : 0;

      let status = HealthStatus.HEALTHY;
      if (errorRate > this.config.alertThresholds.errorRate) {
        status = HealthStatus.UNHEALTHY;
      } else if (errorRate > this.config.alertThresholds.errorRate * 0.5) {
        status = HealthStatus.DEGRADED;
      }

      return {
        name: 'errorRate',
        status,
        message: `Error rate: ${errorRate.toFixed(2)}% (${this.errorCount}/${this.requestCount})`,
        timestamp: new Date(),
        duration: 0,
        metadata: { errorRate, errorCount: this.errorCount, requestCount: this.requestCount }
      };
    });
  }

  /**
   * Setup default metrics collectors
   */
  private setupDefaultMetricsCollectors(): void {
    // Application metrics collector
    this.registerMetricsCollector('application', async () => {
      return {
        requestCount: this.requestCount,
        errorCount: this.errorCount,
        uptime: Date.now() - this.startTime.getTime(),
        memoryUsage: process.memoryUsage(),
        cpuUsage: process.cpuUsage()
      };
    });
  }

  /**
   * Collect system metrics
   */
  private async collectSystemMetrics(): Promise<SystemMetrics['system']> {
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    return {
      cpu: {
        usage: (cpuUsage.user + cpuUsage.system) / 1000000, // Convert to seconds
        loadAverage: [0, 0, 0] // Placeholder - would use os.loadavg() in real implementation
      },
      memory: {
        used: memUsage.heapUsed,
        total: memUsage.heapTotal,
        percentage: (memUsage.heapUsed / memUsage.heapTotal) * 100
      },
      disk: {
        used: 0, // Placeholder - would use fs.statSync() in real implementation
        total: 0,
        percentage: 0
      },
      uptime: process.uptime()
    };
  }

  /**
   * Collect application metrics
   */
  private collectApplicationMetrics(): SystemMetrics['application'] {
    const avgResponseTime = this.responseTimes.length > 0
      ? this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length
      : 0;

    const sortedTimes = [...this.responseTimes].sort((a, b) => a - b);
    const p95Index = Math.floor(sortedTimes.length * 0.95);
    const p99Index = Math.floor(sortedTimes.length * 0.99);

    return {
      pid: process.pid,
      version: process.env.npm_package_version || '1.1.0-beta',
      environment: process.env.NODE_ENV || 'development',
      startTime: this.startTime,
      requestCount: this.requestCount,
      errorCount: this.errorCount,
      responseTime: {
        avg: avgResponseTime,
        p95: sortedTimes[p95Index] || 0,
        p99: sortedTimes[p99Index] || 0
      }
    };
  }

  /**
   * Collect business metrics
   */
  private async collectBusinessMetrics(): Promise<Record<string, unknown>> {
    const businessMetrics: Record<string, unknown> = {};

    for (const [name, collector] of this.metricsCollectors) {
      try {
        const metrics = await collector();
        businessMetrics[name] = metrics;
      } catch (error) {
        console.error(`Business metrics collection failed for ${name}:`, error instanceof Error ? error : new Error(String(error)));
        businessMetrics[name] = { error: error instanceof Error ? error.message : 'Unknown error' };
      }
    }

    return businessMetrics;
  }

  /**
   * Check alert thresholds
   */
  private checkAlertThresholds(metrics: SystemMetrics): void {
    const alerts: string[] = [];

    // CPU alert
    if (metrics.system.cpu.usage > this.config.alertThresholds.cpu) {
      alerts.push(`High CPU usage: ${metrics.system.cpu.usage.toFixed(1)}%`);
    }

    // Memory alert
    if (metrics.system.memory.percentage > this.config.alertThresholds.memory) {
      alerts.push(`High memory usage: ${metrics.system.memory.percentage.toFixed(1)}%`);
    }

    // Response time alert
    if (metrics.application.responseTime.avg > this.config.alertThresholds.responseTime) {
      alerts.push(`High response time: ${metrics.application.responseTime.avg.toFixed(0)}ms`);
    }

    // Error rate alert
    const errorRate = metrics.application.requestCount > 0
      ? (metrics.application.errorCount / metrics.application.requestCount) * 100
      : 0;

    if (errorRate > this.config.alertThresholds.errorRate) {
      alerts.push(`High error rate: ${errorRate.toFixed(2)}%`);
    }

    if (alerts.length > 0) {
      this.emit('alert', { alerts, metrics, timestamp: new Date() });
      console.warn('Alert thresholds exceeded:', { alerts });
    }
  }

  /**
   * Create timeout promise for health checks
   */
  private createTimeoutPromise(checkName: string): Promise<HealthCheckResult> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Health check timeout: ${checkName}`));
      }, this.config.healthCheckTimeout);
    });
  }
}
