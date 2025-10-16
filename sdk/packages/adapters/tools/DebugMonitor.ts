/**
 * @fileoverview Debug Monitor - Real-time debugging and monitoring for platform adapters
 */

import { EventEmitter } from 'events';
import { BaseAdapter } from '../src/core/BaseAdapter';
import { ActionResult, ContentItem } from '../src/core/types';

/**
 * Debug event types
 */
export interface DebugEvents {
  'adapter.initialize': { adapter: string; timestamp: number };
  'adapter.authenticate': { adapter: string; success: boolean; duration: number };
  'adapter.post': { adapter: string; content: ContentItem; result: ActionResult; duration: number };
  'adapter.error': { adapter: string; error: Error; context: any };
  'adapter.rateLimit': { adapter: string; remaining: number; resetTime: number };
  'adapter.webhook': { adapter: string; event: string; data: any };
}

/**
 * Performance metrics
 */
export interface PerformanceMetrics {
  adapter: string;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  rateLimitHits: number;
  lastActivity: number;
}

/**
 * Debug log entry
 */
export interface DebugLogEntry {
  timestamp: number;
  level: 'debug' | 'info' | 'warn' | 'error';
  adapter: string;
  event: string;
  message: string;
  data?: any;
  duration?: number;
}

/**
 * Monitor configuration
 */
export interface MonitorConfig {
  enableLogging: boolean;
  enableMetrics: boolean;
  enableRealtime: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  metricsInterval: number; // ms
  maxLogEntries: number;
  outputFile?: string;
}

/**
 * Debug and monitoring system for adapters
 */
export class DebugMonitor extends EventEmitter {
  private config: MonitorConfig;
  private adapters: Map<string, BaseAdapter> = new Map();
  private metrics: Map<string, PerformanceMetrics> = new Map();
  private logs: DebugLogEntry[] = [];
  private metricsTimer?: NodeJS.Timeout;

  constructor(config: Partial<MonitorConfig> = {}) {
    super();
    
    this.config = {
      enableLogging: true,
      enableMetrics: true,
      enableRealtime: true,
      logLevel: 'info',
      metricsInterval: 60000, // 1 minute
      maxLogEntries: 1000,
      ...config
    };

    if (this.config.enableMetrics) {
      this.startMetricsCollection();
    }
  }

  /**
   * Add adapter to monitoring
   */
  public addAdapter(adapter: BaseAdapter): void {
    const name = adapter.constructor.name;
    this.adapters.set(name, adapter);
    
    // Initialize metrics
    this.metrics.set(name, {
      adapter: name,
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      minResponseTime: Infinity,
      maxResponseTime: 0,
      rateLimitHits: 0,
      lastActivity: Date.now()
    });

    // Attach event listeners
    this.attachAdapterListeners(adapter);
    
    this.log('info', name, 'adapter.added', 'Adapter added to monitoring');
  }

  /**
   * Remove adapter from monitoring
   */
  public removeAdapter(adapter: BaseAdapter): void {
    const name = adapter.constructor.name;
    this.adapters.delete(name);
    this.metrics.delete(name);
    
    this.log('info', name, 'adapter.removed', 'Adapter removed from monitoring');
  }

  /**
   * Get performance metrics for all adapters
   */
  public getMetrics(): Map<string, PerformanceMetrics> {
    return new Map(this.metrics);
  }

  /**
   * Get metrics for specific adapter
   */
  public getAdapterMetrics(adapterName: string): PerformanceMetrics | undefined {
    return this.metrics.get(adapterName);
  }

  /**
   * Get recent logs
   */
  public getLogs(count?: number): DebugLogEntry[] {
    return count ? this.logs.slice(-count) : [...this.logs];
  }

  /**
   * Get logs for specific adapter
   */
  public getAdapterLogs(adapterName: string, count?: number): DebugLogEntry[] {
    const adapterLogs = this.logs.filter(log => log.adapter === adapterName);
    return count ? adapterLogs.slice(-count) : adapterLogs;
  }

  /**
   * Clear logs
   */
  public clearLogs(): void {
    this.logs = [];
    this.log('info', 'monitor', 'logs.cleared', 'Debug logs cleared');
  }

  /**
   * Start real-time monitoring dashboard
   */
  public startDashboard(port: number = 3001): void {
    if (!this.config.enableRealtime) {
      throw new Error('Real-time monitoring is disabled');
    }

    const express = require('express');
    const http = require('http');
    const socketIo = require('socket.io');

    const app = express();
    const server = http.createServer(app);
    const io = socketIo(server);

    // Serve static dashboard files
    app.use(express.static(__dirname + '/dashboard'));

    // API endpoints
    app.get('/api/metrics', (req: any, res: any) => {
      const metrics = Object.fromEntries(this.metrics);
      res.json(metrics);
    });

    app.get('/api/logs', (req: any, res: any) => {
      const count = parseInt(req.query.count) || 100;
      res.json(this.getLogs(count));
    });

    app.get('/api/adapters', (req: any, res: any) => {
      const adapters = Array.from(this.adapters.keys()).map(name => ({
        name,
        status: this.adapters.get(name)?.isAuthenticated ? 'connected' : 'disconnected',
        capabilities: this.adapters.get(name)?.capabilities
      }));
      res.json(adapters);
    });

    // WebSocket for real-time updates
    io.on('connection', (socket: any) => {
      console.log('Dashboard client connected');
      
      // Send initial data
      socket.emit('metrics', Object.fromEntries(this.metrics));
      socket.emit('logs', this.getLogs(50));
      
      // Forward real-time events
      const eventHandler = (event: string, data: any) => {
        socket.emit('event', { event, data, timestamp: Date.now() });
      };
      
      this.on('debug.event', eventHandler);
      
      socket.on('disconnect', () => {
        console.log('Dashboard client disconnected');
        this.off('debug.event', eventHandler);
      });
    });

    server.listen(port, () => {
      console.log(`🖥️  Debug dashboard running on http://localhost:${port}`);
    });
  }

  /**
   * Export metrics and logs to file
   */
  public exportData(filePath?: string): void {
    const data = {
      timestamp: Date.now(),
      metrics: Object.fromEntries(this.metrics),
      logs: this.logs,
      config: this.config
    };

    const fs = require('fs');
    const path = require('path');
    
    const outputPath = filePath || this.config.outputFile || 
      path.join(__dirname, `../reports/debug-export-${Date.now()}.json`);
    
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf8');
    
    this.log('info', 'monitor', 'data.exported', `Data exported to ${outputPath}`);
  }

  /**
   * Attach event listeners to adapter
   */
  private attachAdapterListeners(adapter: BaseAdapter): void {
    const name = adapter.constructor.name;

    // Wrap methods to capture metrics
    this.wrapMethod(adapter, 'initialize', name);
    this.wrapMethod(adapter, 'authenticate', name);
    this.wrapMethod(adapter, 'post', name);
    this.wrapMethod(adapter, 'comment', name);
    this.wrapMethod(adapter, 'like', name);
    this.wrapMethod(adapter, 'share', name);
    this.wrapMethod(adapter, 'delete', name);
    this.wrapMethod(adapter, 'getProfile', name);
    this.wrapMethod(adapter, 'getContent', name);
    this.wrapMethod(adapter, 'search', name);

    // Listen to adapter events
    adapter.on('error', (error: Error) => {
      this.handleAdapterError(name, error);
    });

    adapter.on('rateLimit', (info: any) => {
      this.handleRateLimit(name, info);
    });

    adapter.on('webhook', (event: string, data: any) => {
      this.handleWebhook(name, event, data);
    });
  }

  /**
   * Wrap adapter method for monitoring
   */
  private wrapMethod(adapter: any, methodName: string, adapterName: string): void {
    const original = adapter[methodName];
    if (typeof original !== 'function') return;

    adapter[methodName] = async (...args: any[]) => {
      const startTime = Date.now();
      const metrics = this.metrics.get(adapterName)!;
      
      try {
        this.log('debug', adapterName, `${methodName}.start`, `Starting ${methodName}`, { args });
        
        const result = await original.apply(adapter, args);
        const duration = Date.now() - startTime;
        
        // Update metrics
        metrics.totalRequests++;
        metrics.successfulRequests++;
        metrics.lastActivity = Date.now();
        
        // Update response time metrics
        if (duration < metrics.minResponseTime) {
          metrics.minResponseTime = duration;
        }
        if (duration > metrics.maxResponseTime) {
          metrics.maxResponseTime = duration;
        }
        metrics.averageResponseTime = 
          (metrics.averageResponseTime * (metrics.totalRequests - 1) + duration) / metrics.totalRequests;

        this.log('debug', adapterName, `${methodName}.success`, `${methodName} completed`, { 
          duration, 
          result: methodName === 'authenticate' ? { success: result } : result 
        });

        // Emit real-time event
        if (this.config.enableRealtime) {
          this.emit('debug.event', `${adapterName}.${methodName}`, { 
            success: true, 
            duration, 
            result 
          });
        }

        return result;
      } catch (error) {
        const duration = Date.now() - startTime;
        
        // Update metrics
        metrics.totalRequests++;
        metrics.failedRequests++;
        metrics.lastActivity = Date.now();

        this.log('error', adapterName, `${methodName}.error`, `${methodName} failed`, { 
          duration, 
          error: (error as Error).message 
        });

        // Emit real-time event
        if (this.config.enableRealtime) {
          this.emit('debug.event', `${adapterName}.${methodName}`, { 
            success: false, 
            duration, 
            error: (error as Error).message 
          });
        }

        throw error;
      }
    };
  }

  /**
   * Handle adapter error
   */
  private handleAdapterError(adapterName: string, error: Error): void {
    this.log('error', adapterName, 'adapter.error', error.message, { 
      stack: error.stack 
    });

    if (this.config.enableRealtime) {
      this.emit('debug.event', `${adapterName}.error`, { error: error.message });
    }
  }

  /**
   * Handle rate limit event
   */
  private handleRateLimit(adapterName: string, info: any): void {
    const metrics = this.metrics.get(adapterName);
    if (metrics) {
      metrics.rateLimitHits++;
    }

    this.log('warn', adapterName, 'adapter.rateLimit', 'Rate limit hit', info);

    if (this.config.enableRealtime) {
      this.emit('debug.event', `${adapterName}.rateLimit`, info);
    }
  }

  /**
   * Handle webhook event
   */
  private handleWebhook(adapterName: string, event: string, data: any): void {
    this.log('info', adapterName, 'adapter.webhook', `Webhook received: ${event}`, data);

    if (this.config.enableRealtime) {
      this.emit('debug.event', `${adapterName}.webhook`, { event, data });
    }
  }

  /**
   * Log debug message
   */
  private log(level: 'debug' | 'info' | 'warn' | 'error', adapter: string, event: string, message: string, data?: any): void {
    if (!this.config.enableLogging) return;
    
    // Check log level
    const levels = ['debug', 'info', 'warn', 'error'];
    if (levels.indexOf(level) < levels.indexOf(this.config.logLevel)) {
      return;
    }

    const entry: DebugLogEntry = {
      timestamp: Date.now(),
      level,
      adapter,
      event,
      message,
      data
    };

    this.logs.push(entry);

    // Trim logs if needed
    if (this.logs.length > this.config.maxLogEntries) {
      this.logs = this.logs.slice(-this.config.maxLogEntries);
    }

    // Console output
    const timestamp = new Date(entry.timestamp).toISOString();
    const levelEmoji = { debug: '🔍', info: 'ℹ️', warn: '⚠️', error: '❌' }[level];
    console.log(`${timestamp} ${levelEmoji} [${adapter}] ${message}`);
    
    if (data && level === 'error') {
      console.error(data);
    }

    // Emit log event
    this.emit('log', entry);
  }

  /**
   * Start metrics collection
   */
  private startMetricsCollection(): void {
    this.metricsTimer = setInterval(() => {
      this.collectMetrics();
    }, this.config.metricsInterval);
  }

  /**
   * Collect periodic metrics
   */
  private collectMetrics(): void {
    const summary = {
      timestamp: Date.now(),
      totalAdapters: this.adapters.size,
      activeAdapters: 0,
      totalRequests: 0,
      totalErrors: 0,
      averageResponseTime: 0
    };

    for (const [name, metrics] of this.metrics) {
      if (Date.now() - metrics.lastActivity < this.config.metricsInterval * 2) {
        summary.activeAdapters++;
      }
      summary.totalRequests += metrics.totalRequests;
      summary.totalErrors += metrics.failedRequests;
      summary.averageResponseTime += metrics.averageResponseTime;
    }

    if (summary.totalAdapters > 0) {
      summary.averageResponseTime /= summary.totalAdapters;
    }

    this.log('info', 'monitor', 'metrics.collected', 'Periodic metrics collected', summary);

    if (this.config.enableRealtime) {
      this.emit('debug.event', 'monitor.metrics', summary);
    }
  }

  /**
   * Stop monitoring
   */
  public stop(): void {
    if (this.metricsTimer) {
      clearInterval(this.metricsTimer);
      this.metricsTimer = undefined;
    }

    this.log('info', 'monitor', 'monitor.stopped', 'Debug monitor stopped');
  }

  /**
   * Generate monitoring report
   */
  public generateReport(): string {
    const now = Date.now();
    const totalMetrics = Array.from(this.metrics.values());
    
    let report = `# Adapter Monitoring Report\n\n`;
    report += `**Generated**: ${new Date(now).toISOString()}\n`;
    report += `**Monitoring Duration**: ${Math.round((now - (this.logs[0]?.timestamp || now)) / 1000 / 60)} minutes\n\n`;

    // Summary
    const totalRequests = totalMetrics.reduce((sum, m) => sum + m.totalRequests, 0);
    const totalErrors = totalMetrics.reduce((sum, m) => sum + m.failedRequests, 0);
    const avgResponseTime = totalMetrics.reduce((sum, m) => sum + m.averageResponseTime, 0) / totalMetrics.length;

    report += `## Summary\n\n`;
    report += `- **Total Adapters**: ${this.adapters.size}\n`;
    report += `- **Total Requests**: ${totalRequests}\n`;
    report += `- **Total Errors**: ${totalErrors}\n`;
    report += `- **Error Rate**: ${totalRequests > 0 ? ((totalErrors / totalRequests) * 100).toFixed(2) : 0}%\n`;
    report += `- **Average Response Time**: ${avgResponseTime.toFixed(2)}ms\n\n`;

    // Per-adapter metrics
    report += `## Adapter Metrics\n\n`;
    for (const [name, metrics] of this.metrics) {
      const errorRate = metrics.totalRequests > 0 ? 
        ((metrics.failedRequests / metrics.totalRequests) * 100).toFixed(2) : '0';
      
      report += `### ${name}\n\n`;
      report += `- **Total Requests**: ${metrics.totalRequests}\n`;
      report += `- **Success Rate**: ${(100 - parseFloat(errorRate)).toFixed(2)}%\n`;
      report += `- **Average Response Time**: ${metrics.averageResponseTime.toFixed(2)}ms\n`;
      report += `- **Min/Max Response Time**: ${metrics.minResponseTime}ms / ${metrics.maxResponseTime}ms\n`;
      report += `- **Rate Limit Hits**: ${metrics.rateLimitHits}\n`;
      report += `- **Last Activity**: ${new Date(metrics.lastActivity).toISOString()}\n\n`;
    }

    // Recent errors
    const recentErrors = this.logs.filter(log => log.level === 'error').slice(-10);
    if (recentErrors.length > 0) {
      report += `## Recent Errors\n\n`;
      for (const error of recentErrors) {
        report += `- **${new Date(error.timestamp).toISOString()}** [${error.adapter}] ${error.message}\n`;
      }
      report += '\n';
    }

    return report;
  }
}

/**
 * Create debug monitor instance
 */
export function createDebugMonitor(config?: Partial<MonitorConfig>): DebugMonitor {
  return new DebugMonitor(config);
}

/**
 * Global debug monitor instance
 */
export const globalMonitor = new DebugMonitor({
  enableLogging: true,
  enableMetrics: true,
  enableRealtime: false,
  logLevel: 'info'
});
