/**
 * SystemMonitor - 系统监控器
 * 负责执行状态监控、性能指标收集、结构化日志、错误追踪
 * 为调试和运维提供支持
 *
 * 基于SCTM+GLFB+ITCM增强框架设计
 */

/// <reference types="node" />
import { UUID, Timestamp } from '../../modules/core/types';

// ===== 监控配置接口 =====

export interface MonitoringConfig {
  enableMetrics: boolean;
  enableLogging: boolean;
  enableTracing: boolean;
  enableAlerting: boolean;
  metricsInterval: number;
  logLevel: LogLevel;
  retentionDays: number;
  alertThresholds: AlertThresholds;
}

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface AlertThresholds {
  cpuUsage: number;
  memoryUsage: number;
  errorRate: number;
  responseTime: number;
  connectionCount: number;
}

// ===== 执行状态监控接口 =====

export interface ExecutionStatus {
  executionId: UUID;
  workflowId: UUID;
  status: ExecutionState;
  startTime: Timestamp;
  endTime?: Timestamp;
  duration?: number;
  currentStage?: string;
  progress: ExecutionProgress;
  metrics: ExecutionMetrics;
  errors: ExecutionError[];
}

export type ExecutionState = 'pending' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';

export interface ExecutionProgress {
  totalStages: number;
  completedStages: number;
  failedStages: number;
  progressPercentage: number;
  estimatedTimeRemaining?: number;
}

export interface ExecutionMetrics {
  cpuUsage: number;
  memoryUsage: number;
  networkIO: number;
  diskIO: number;
  moduleCallCount: number;
  averageResponseTime: number;
}

export interface ExecutionError {
  errorId: UUID;
  errorType: string;
  message: string;
  stackTrace?: string;
  timestamp: Timestamp;
  context?: Record<string, unknown>;
}

// ===== 性能指标接口 =====

export interface PerformanceMetrics {
  timestamp: Timestamp;
  system: SystemMetrics;
  application: ApplicationMetrics;
  business: BusinessMetrics;
}

export interface SystemMetrics {
  cpu: CpuMetrics;
  memory: MemoryMetrics;
  disk: DiskMetrics;
  network: NetworkMetrics;
}

export interface CpuMetrics {
  usage: number;
  loadAverage: number[];
  processes: number;
  threads: number;
}

export interface MemoryMetrics {
  total: number;
  used: number;
  free: number;
  cached: number;
  heapUsed: number;
  heapTotal: number;
}

export interface DiskMetrics {
  usage: number;
  readOps: number;
  writeOps: number;
  readBytes: number;
  writeBytes: number;
}

export interface NetworkMetrics {
  connections: number;
  bytesIn: number;
  bytesOut: number;
  packetsIn: number;
  packetsOut: number;
  errors: number;
}

export interface ApplicationMetrics {
  activeExecutions: number;
  completedExecutions: number;
  failedExecutions: number;
  averageExecutionTime: number;
  moduleCallRate: number;
  errorRate: number;
  throughput: number;
}

export interface BusinessMetrics {
  workflowsPerHour: number;
  successRate: number;
  userSatisfactionScore: number;
  costPerExecution: number;
  resourceEfficiency: number;
}

// ===== 结构化日志接口 =====

export interface LogEntry {
  logId: UUID;
  timestamp: Timestamp;
  level: LogLevel;
  message: string;
  category: string;
  source: string;
  executionId?: UUID;
  workflowId?: UUID;
  moduleId?: string;
  userId?: string;
  sessionId?: string;
  context?: Record<string, unknown>;
  metadata?: LogMetadata;
}

export interface LogMetadata {
  version: string;
  environment: string;
  hostname: string;
  processId: number;
  threadId?: string;
  correlationId?: UUID;
  traceId?: UUID;
  spanId?: UUID;
}

// ===== 错误追踪接口 =====

export interface ErrorTrace {
  traceId: UUID;
  errorId: UUID;
  timestamp: Timestamp;
  errorType: string;
  severity: ErrorSeverity;
  message: string;
  stackTrace: string;
  source: ErrorSource;
  context: ErrorContext;
  resolution?: ErrorResolution;
}

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface ErrorSource {
  moduleId: string;
  serviceId?: string;
  functionName?: string;
  fileName?: string;
  lineNumber?: number;
}

export interface ErrorContext {
  executionId?: UUID;
  workflowId?: UUID;
  userId?: string;
  sessionId?: string;
  requestId?: UUID;
  parameters?: Record<string, unknown>;
  environment: Record<string, unknown>;
}

export interface ErrorResolution {
  status: 'pending' | 'investigating' | 'resolved' | 'ignored';
  assignedTo?: string;
  resolution?: string;
  resolvedAt?: Timestamp;
  preventionMeasures?: string[];
}

// ===== 告警接口 =====

export interface Alert {
  alertId: UUID;
  timestamp: Timestamp;
  severity: AlertSeverity;
  type: AlertType;
  title: string;
  description: string;
  source: string;
  metrics: Record<string, number>;
  threshold: number;
  currentValue: number;
  status: AlertStatus;
  acknowledgedBy?: string;
  acknowledgedAt?: Timestamp;
  resolvedAt?: Timestamp;
}

export type AlertSeverity = 'info' | 'warning' | 'error' | 'critical';
export type AlertType = 'performance' | 'error' | 'resource' | 'security' | 'business';
export type AlertStatus = 'active' | 'acknowledged' | 'resolved' | 'suppressed';

// ===== 系统监控器实现 =====

export class SystemMonitor {
  private config: MonitoringConfig;
  private executionStatuses = new Map<UUID, ExecutionStatus>();
  private logEntries: LogEntry[] = [];
  private errorTraces: ErrorTrace[] = [];
  private alerts: Alert[] = [];
  private metricsHistory: PerformanceMetrics[] = [];
  private monitoringInterval: NodeJS.Timeout | null = null;

  constructor(config: Partial<MonitoringConfig> = {}) {
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

  /**
   * 开始执行监控
   */
  startExecutionMonitoring(executionId: UUID, workflowId: UUID): void {
    const status: ExecutionStatus = {
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

  /**
   * 更新执行状态
   */
  updateExecutionStatus(executionId: UUID, updates: Partial<ExecutionStatus>): void {
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

  /**
   * 停止执行监控
   */
  stopExecutionMonitoring(executionId: UUID): void {
    const status = this.executionStatuses.get(executionId);
    if (status) {
      status.status = 'completed';
      status.endTime = new Date().toISOString();
      status.duration = new Date(status.endTime).getTime() - new Date(status.startTime).getTime();
    }

    this.log('info', `Execution monitoring stopped: ${executionId}`, 'execution', { executionId });
  }

  /**
   * 收集性能指标
   */
  async collectPerformanceMetrics(): Promise<PerformanceMetrics> {
    const timestamp = new Date().toISOString();
    const memUsage = process.memoryUsage();

    const metrics: PerformanceMetrics = {
      timestamp,
      system: {
        cpu: {
          usage: 0, // 简化实现
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

    // 检查告警阈值
    this.checkAlertThresholds(metrics);

    return metrics;
  }

  /**
   * 记录日志
   */
  log(level: LogLevel, message: string, category: string, context?: Record<string, unknown>): void {
    if (!this.config.enableLogging) return;

    const logEntry: LogEntry = {
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

    // 输出到控制台
    console.log(`[${logEntry.timestamp}] ${level.toUpperCase()} [${category}] ${message}`, context || '');
  }

  /**
   * 追踪错误
   */
  traceError(error: Error, context: Partial<ErrorContext> = {}): ErrorTrace {
    if (!this.config.enableTracing) {
      return {} as ErrorTrace;
    }

    const trace: ErrorTrace = {
      traceId: this.generateUUID(),
      errorId: this.generateUUID(),
      timestamp: new Date().toISOString(),
      errorType: error.constructor.name,
      severity: this.determineSeverity(error),
      message: error.message,
      stackTrace: error.stack || '',
      source: {
        moduleId: 'core',
        functionName: this.extractFunctionName(error.stack || undefined),
        fileName: this.extractFileName(error.stack || undefined),
        lineNumber: this.extractLineNumber(error.stack || undefined)
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

    // 记录错误日志
    this.log('error', `Error traced: ${error.message}`, 'error', { traceId: trace.traceId });

    return trace;
  }

  /**
   * 创建告警
   */
  createAlert(type: AlertType, title: string, description: string, metrics: Record<string, number>): Alert {
    const alert: Alert = {
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

  /**
   * 获取监控统计
   */
  getMonitoringStatistics(): MonitoringStatistics {
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

  // ===== 私有辅助方法 =====

  private startMonitoring(): void {
    if (this.config.enableMetrics) {
      this.monitoringInterval = setInterval(async () => {
        try {
          await this.collectPerformanceMetrics();
        } catch (error) {
          this.log('error', 'Failed to collect metrics', 'monitoring', { error: error instanceof Error ? error.message : 'Unknown error' });
        }
      }, this.config.metricsInterval);
    }
  }

  private getActiveExecutionCount(): number {
    return Array.from(this.executionStatuses.values())
      .filter(status => status.status === 'running').length;
  }

  private getCompletedExecutionCount(): number {
    return Array.from(this.executionStatuses.values())
      .filter(status => status.status === 'completed').length;
  }

  private getFailedExecutionCount(): number {
    return Array.from(this.executionStatuses.values())
      .filter(status => status.status === 'failed').length;
  }

  private getAverageExecutionTime(): number {
    const completed = Array.from(this.executionStatuses.values())
      .filter(status => status.status === 'completed' && status.duration);
    
    if (completed.length === 0) return 0;
    
    const totalTime = completed.reduce((sum, status) => sum + (status.duration || 0), 0);
    return totalTime / completed.length;
  }

  private getErrorRate(): number {
    const total = this.executionStatuses.size;
    const failed = this.getFailedExecutionCount();
    return total > 0 ? (failed / total) * 100 : 0;
  }

  private getThroughput(): number {
    // 简化实现：每分钟完成的执行数
    return this.getCompletedExecutionCount();
  }

  private getWorkflowsPerHour(): number {
    // 简化实现：基于完成的执行数估算
    return this.getCompletedExecutionCount() * 60;
  }

  private getSuccessRate(): number {
    const total = this.getCompletedExecutionCount() + this.getFailedExecutionCount();
    const successful = this.getCompletedExecutionCount();
    return total > 0 ? (successful / total) * 100 : 100;
  }

  private getActiveConnectionCount(): number {
    // 简化实现：返回活跃执行数作为连接数估算
    return this.getActiveExecutionCount();
  }

  private checkAlertThresholds(metrics: PerformanceMetrics): void {
    if (!this.config.enableAlerting) return;

    // 检查CPU使用率
    if (metrics.system.cpu.usage > this.config.alertThresholds.cpuUsage) {
      this.createAlert('performance', 'High CPU Usage', 
        `CPU usage is ${metrics.system.cpu.usage}%`, 
        { cpuUsage: metrics.system.cpu.usage });
    }

    // 检查内存使用率
    const memoryUsage = (metrics.system.memory.used / metrics.system.memory.total) * 100;
    if (memoryUsage > this.config.alertThresholds.memoryUsage) {
      this.createAlert('performance', 'High Memory Usage',
        `Memory usage is ${memoryUsage.toFixed(2)}%`,
        { memoryUsage });
    }

    // 检查错误率
    if (metrics.application.errorRate > this.config.alertThresholds.errorRate) {
      this.createAlert('error', 'High Error Rate',
        `Error rate is ${metrics.application.errorRate.toFixed(2)}%`,
        { errorRate: metrics.application.errorRate });
    }
  }

  private determineSeverity(error: Error): ErrorSeverity {
    const message = error.message.toLowerCase();

    // 优先检查critical和fatal关键词
    if (message.includes('critical') || message.includes('fatal')) {
      return 'critical';
    } else if (message.includes('warning') || message.includes('deprecated')) {
      return 'medium';
    } else if (message.includes('error') && !message.includes('normal error')) {
      return 'high';
    }
    // 默认为low，包括"normal error"
    return 'low';
  }

  private determineAlertSeverity(type: AlertType, _metrics: Record<string, number>): AlertSeverity {
    // 简化实现：基于类型和指标值确定严重程度
    if (type === 'error' || type === 'security') {
      return 'error';
    } else if (type === 'performance') {
      return 'warning';
    }
    return 'info';
  }

  private getThresholdForType(type: AlertType): number {
    switch (type) {
      case 'performance': return this.config.alertThresholds.cpuUsage;
      case 'error': return this.config.alertThresholds.errorRate;
      case 'resource': return this.config.alertThresholds.memoryUsage;
      default: return 0;
    }
  }

  private getCurrentValueForType(type: AlertType, metrics: Record<string, number>): number {
    switch (type) {
      case 'performance': return metrics.cpuUsage || 0;
      case 'error': return metrics.errorRate || 0;
      case 'resource': return metrics.memoryUsage || 0;
      default: return 0;
    }
  }

  private extractFunctionName(stack?: string): string {
    if (!stack) return 'unknown';
    const match = stack.match(/at\s+([^\s]+)/);
    return match?.[1] ?? 'unknown';
  }

  private extractFileName(stack?: string): string {
    if (!stack) return 'unknown';
    const match = stack.match(/\(([^:]+):/);
    return match?.[1] ?? 'unknown';
  }

  private extractLineNumber(stack?: string): number {
    if (!stack) return 0;
    const match = stack.match(/:(\d+):/);
    return match?.[1] ? parseInt(match[1], 10) : 0;
  }

  private cleanupOldMetrics(): void {
    const cutoff = new Date(Date.now() - this.config.retentionDays * 24 * 60 * 60 * 1000);
    this.metricsHistory = this.metricsHistory.filter(m => new Date(m.timestamp) > cutoff);
  }

  private cleanupOldLogs(): void {
    const cutoff = new Date(Date.now() - this.config.retentionDays * 24 * 60 * 60 * 1000);
    this.logEntries = this.logEntries.filter(l => new Date(l.timestamp) > cutoff);
  }

  private cleanupOldTraces(): void {
    const cutoff = new Date(Date.now() - this.config.retentionDays * 24 * 60 * 60 * 1000);
    this.errorTraces = this.errorTraces.filter(t => new Date(t.timestamp) > cutoff);
  }

  private generateUUID(): UUID {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * 清理监控器
   */
  destroy(): void {
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

// ===== 辅助接口 =====

export interface MonitoringStatistics {
  activeExecutions: number;
  totalLogEntries: number;
  totalErrorTraces: number;
  activeAlerts: number;
  metricsDataPoints: number;
  uptime: number;
  lastMetricsCollection?: Timestamp;
}
