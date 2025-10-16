import { ModuleManager } from '../modules/ModuleManager';
import { EventEmitter } from 'events';
import { Logger } from '../logging/Logger';

/**
 * Health check function type
 */
export type HealthCheckFunction = () => Promise<HealthCheckResult>;

/**
 * Health check result
 */
export interface HealthCheckResult {
  healthy: boolean;
  message?: string;
  data?: Record<string, any>;
  duration?: number;
  timestamp?: Date;
}

/**
 * Health check configuration
 */
export interface HealthCheckConfig {
  name: string;
  description?: string;
  checkFunction: HealthCheckFunction;
  interval?: number; // in milliseconds
  timeout?: number; // in milliseconds
  retries?: number;
  critical?: boolean; // if true, failure affects overall health
  tags?: string[];
}

/**
 * Health status levels
 */
export enum HealthStatus {
  HEALTHY = 'healthy',
  DEGRADED = 'degraded',
  UNHEALTHY = 'unhealthy',
  UNKNOWN = 'unknown',
}

/**
 * Detailed health report
 */
export interface HealthReport {
  status: HealthStatus;
  timestamp: Date;
  uptime: number;
  checks: Record<string, HealthCheckResult>;
  modules: Record<string, any>;
  system: {
    memory: NodeJS.MemoryUsage;
    cpu?: number;
    loadAverage?: number[];
    platform: string;
    nodeVersion: string;
  };
  metrics: Record<string, any>;
  summary: {
    total: number;
    healthy: number;
    unhealthy: number;
    critical: number;
  };
}

/**
 * Health check metrics
 */
export interface HealthMetrics {
  checkCount: number;
  successCount: number;
  failureCount: number;
  averageResponseTime: number;
  lastCheckTime?: Date;
  uptimePercentage: number;
}

/**
 * Enhanced Health Checker
 *
 * Advanced health monitoring system with custom checks, detailed reporting,
 * metrics collection, and alerting capabilities.
 */
export class HealthChecker extends EventEmitter {
  private moduleManager: ModuleManager;
  private logger: Logger;
  private interval?: NodeJS.Timeout;
  private isRunning: boolean = false;
  private checkIntervalMs: number = 30000; // 30 seconds
  private customChecks: Map<string, HealthCheckConfig> = new Map();
  private checkResults: Map<string, HealthCheckResult> = new Map();
  private metrics: Map<string, HealthMetrics> = new Map();
  private lastReport: HealthReport | null = null;
  private startTime: Date = new Date();
  private lastFullCheck?: Date;

  constructor(moduleManager: ModuleManager, logger: Logger) {
    super();
    this.moduleManager = moduleManager;
    this.logger = logger;

    // Register default system checks
    this.registerDefaultChecks();
  }

  /**
   * Registers default system health checks
   */
  private registerDefaultChecks(): void {
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
          message:
            unhealthyModules.length > 0
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
  registerHealthCheck(config: HealthCheckConfig): void {
    this.logger.info(`Registering health check: ${config.name}`);

    // Validate configuration
    if (!config.name || !config.checkFunction) {
      throw new Error('Health check must have a name and check function');
    }

    // Set defaults
    const fullConfig: HealthCheckConfig = {
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
  unregisterHealthCheck(name: string): void {
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
  async initialize(): Promise<void> {
    this.logger.info('Initializing HealthChecker...');

    // Perform initial health check and generate report
    await this.getHealthReport();

    this.emit('initialized');
    this.logger.info('HealthChecker initialized successfully');
  }

  /**
   * Starts health monitoring
   */
  async start(): Promise<void> {
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
  async stop(): Promise<void> {
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
  getLastHealthReport(): HealthReport | null {
    return this.lastReport;
  }

  /**
   * Gets a comprehensive health report
   */
  async getHealthReport(): Promise<HealthReport> {
    // Perform fresh health checks
    await this.performFullHealthCheck();

    const moduleStatuses = this.moduleManager.getModuleStatuses();
    const checkResults = Object.fromEntries(this.checkResults);

    // Calculate overall status
    const criticalChecks = Array.from(this.customChecks.values()).filter(c => c.critical);
    const criticalResults = criticalChecks.map(c => this.checkResults.get(c.name)).filter(Boolean);
    const unhealthyCritical = criticalResults.filter(r => !r!.healthy);

    let overallStatus: HealthStatus;
    if (unhealthyCritical.length > 0) {
      overallStatus = HealthStatus.UNHEALTHY;
    } else {
      const allResults = Array.from(this.checkResults.values());
      const unhealthyCount = allResults.filter(r => !r.healthy).length;
      if (unhealthyCount === 0) {
        overallStatus = HealthStatus.HEALTHY;
      } else if (unhealthyCount / allResults.length < 0.3) {
        overallStatus = HealthStatus.DEGRADED;
      } else {
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

    const report: HealthReport = {
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
  async getHealthStatus(): Promise<{
    status: HealthStatus;
    timestamp: string;
    uptime: number;
    summary: { healthy: number; unhealthy: number; total: number };
  }> {
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
  getHealthCheckMetrics(name: string): HealthMetrics | undefined {
    return this.metrics.get(name);
  }

  /**
   * Gets all health check metrics
   */
  getAllMetrics(): Record<string, HealthMetrics> {
    return Object.fromEntries(this.metrics);
  }

  /**
   * Gets a summary of all metrics
   */
  private getMetricsSummary(): Record<string, any> {
    const summary: Record<string, any> = {};

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
  private async performFullHealthCheck(): Promise<void> {
    const checkPromises = Array.from(this.customChecks.entries()).map(async ([name, config]) => {
      try {
        await this.executeHealthCheck(name, config);
      } catch (error) {
        this.logger.error(`Health check '${name}' failed:`, error);
      }
    });

    await Promise.all(checkPromises);
  }

  /**
   * Executes a single health check with timeout and retry logic
   */
  private async executeHealthCheck(name: string, config: HealthCheckConfig): Promise<void> {
    const startTime = Date.now();
    let result: HealthCheckResult;
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
      } catch (error) {
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
    this.checkResults.set(name, result!);
    this.updateMetrics(name, result!);

    // Emit events
    if (result!.healthy) {
      this.emit('healthCheckPassed', { name, result: result! });
    } else {
      this.emit('healthCheckFailed', { name, result: result!, critical: config.critical });

      if (config.critical) {
        this.emit('criticalHealthCheckFailed', { name, result: result! });
      }
    }
  }

  /**
   * Executes a function with timeout
   */
  private async executeWithTimeout<T>(fn: () => Promise<T>, timeoutMs: number): Promise<T> {
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
  private updateMetrics(name: string, result: HealthCheckResult): void {
    const metrics = this.metrics.get(name);
    if (!metrics) return;

    metrics.checkCount++;
    metrics.lastCheckTime = result.timestamp;

    if (result.healthy) {
      metrics.successCount++;
    } else {
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
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Performs periodic health checks
   */
  private async performHealthCheck(): Promise<void> {
    try {
      await this.performFullHealthCheck();

      // Check if we need to emit alerts
      const report = await this.getHealthReport();

      if (report.status === HealthStatus.UNHEALTHY) {
        this.emit('systemUnhealthy', report);
      } else if (report.status === HealthStatus.DEGRADED) {
        this.emit('systemDegraded', report);
      }
    } catch (error) {
      this.logger.error('Periodic health check failed:', error);
      this.emit('healthCheckError', { error });
    }
  }

  /**
   * Gets health check configuration
   */
  getHealthCheckConfig(name: string): HealthCheckConfig | undefined {
    return this.customChecks.get(name);
  }

  /**
   * Lists all registered health checks
   */
  listHealthChecks(): string[] {
    return Array.from(this.customChecks.keys());
  }

  /**
   * Gets the last full health check time
   */
  getLastCheckTime(): Date | undefined {
    return this.lastFullCheck;
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
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
