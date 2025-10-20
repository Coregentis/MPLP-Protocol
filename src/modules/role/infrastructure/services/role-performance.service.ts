/**
 * Role模块企业级性能监控服务
 * 
 * @description 提供详细性能指标收集、实时告警、权限检查算法优化等企业级功能
 * @version 1.0.0
 * @layer 基础设施层 - 服务
 */

import { RoleLoggerService, createRoleLogger, LogLevel } from './role-logger.service';
import { MLPPPerformanceMonitor } from '../../../../core/protocols/cross-cutting-concerns/performance-monitor';

/**
 * 性能指标类型
 */
export enum PerformanceMetricType {
  LATENCY = 'latency',
  THROUGHPUT = 'throughput',
  ERROR_RATE = 'error_rate',
  MEMORY_USAGE = 'memory_usage',
  CPU_USAGE = 'cpu_usage',
  CACHE_HIT_RATE = 'cache_hit_rate',
  PERMISSION_CHECK = 'permission_check',
  ROLE_OPERATION = 'role_operation'
}

/**
 * 性能告警级别
 */
export enum AlertLevel {
  INFO = 'info',
  WARNING = 'warning',
  CRITICAL = 'critical',
  EMERGENCY = 'emergency'
}

/**
 * 性能指标接口
 */
export interface RolePerformanceMetric {
  id: string;
  type: PerformanceMetricType;
  name: string;
  value: number;
  unit: string;
  timestamp: number;
  tags: Record<string, string>;
  metadata?: Record<string, unknown>;
}

/**
 * 性能告警接口
 */
export interface PerformanceAlert {
  id: string;
  level: AlertLevel;
  metric: string;
  threshold: number;
  currentValue: number;
  message: string;
  timestamp: number;
  resolved: boolean;
  resolvedAt?: number;
}

/**
 * 操作追踪接口
 */
export interface OperationTrace {
  traceId: string;
  operationName: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  status: 'running' | 'completed' | 'failed';
  metadata?: Record<string, unknown>;
  childTraces?: OperationTrace[];
}

/**
 * 性能基准接口
 */
export interface PerformanceBenchmark {
  operation: string;
  p50: number;
  p95: number;
  p99: number;
  mean: number;
  min: number;
  max: number;
  sampleCount: number;
  lastUpdated: number;
}

/**
 * 性能配置接口
 */
export interface RolePerformanceConfig {
  enabled: boolean;
  collectionInterval: number;
  retentionPeriod: number;
  alertThresholds: Record<string, number>;
  benchmarkEnabled: boolean;
  realTimeAlertsEnabled: boolean;
  detailedTracing: boolean;
  optimizationEnabled: boolean;
}

/**
 * Role模块企业级性能监控服务
 * 
 * @description 高性能监控系统，支持实时告警、基准测试、算法优化
 */
export class RolePerformanceService {
  private metrics: RolePerformanceMetric[] = [];
  private alerts: PerformanceAlert[] = [];
  private traces = new Map<string, OperationTrace>();
  private benchmarks = new Map<string, PerformanceBenchmark>();
  private logger: RoleLoggerService;
  private config: Required<RolePerformanceConfig>;
  private metricsTimer?: ReturnType<typeof setTimeout>;
  private cleanupTimer?: ReturnType<typeof setTimeout>;

  constructor(
    config: Partial<RolePerformanceConfig> = {},
    private mlppPerformanceMonitor?: MLPPPerformanceMonitor
  ) {
    this.config = {
      enabled: true,
      collectionInterval: 30000, // 30秒
      retentionPeriod: 24 * 60 * 60 * 1000, // 24小时
      alertThresholds: {
        'permission_check_latency_ms': 10,
        'role_operation_latency_ms': 100,
        'memory_usage_mb': 256,
        'error_rate_percent': 5,
        'cache_hit_rate_percent': 80
      },
      benchmarkEnabled: true,
      realTimeAlertsEnabled: true,
      detailedTracing: true,
      optimizationEnabled: true,
      ...config
    };

    this.logger = createRoleLogger({
      module: 'RolePerformance',
      level: LogLevel.INFO,
      enableStructured: true,
      environment: process.env.NODE_ENV as 'development' | 'production' | 'test' || 'development'
    });

    if (this.config.enabled) {
      this.startMetricsCollection();
      this.startCleanupTimer();
    }
  }

  /**
   * 开始操作追踪
   */
  startTrace(operationName: string, metadata?: Record<string, unknown>): string {
    const traceId = this.generateTraceId();
    const trace: OperationTrace = {
      traceId,
      operationName,
      startTime: Date.now(),
      status: 'running',
      metadata
    };

    this.traces.set(traceId, trace);
    
    if (this.config.detailedTracing) {
      this.logger.debug('Operation trace started', { traceId, operationName, metadata });
    }

    return traceId;
  }

  /**
   * 结束操作追踪
   */
  async endTrace(traceId: string, status: 'completed' | 'failed' = 'completed', error?: Error): Promise<void> {
    const trace = this.traces.get(traceId);
    if (!trace) {
      this.logger.warn('Trace not found', { traceId });
      return;
    }

    const endTime = Date.now();
    const duration = endTime - trace.startTime;

    trace.endTime = endTime;
    trace.duration = duration;
    trace.status = status;

    // 记录性能指标
    await this.recordMetric({
      type: PerformanceMetricType.LATENCY,
      name: `${trace.operationName}_latency`,
      value: duration,
      unit: 'ms',
      tags: {
        operation: trace.operationName,
        status,
        traceId
      },
      metadata: { ...trace.metadata, error: error?.message }
    });

    // 更新基准测试
    if (this.config.benchmarkEnabled && status === 'completed') {
      await this.updateBenchmark(trace.operationName, duration);
    }

    // 同步到MLPP性能监控器
    if (this.mlppPerformanceMonitor) {
      await this.mlppPerformanceMonitor.recordMetric(
        `role_${trace.operationName}_duration`,
        duration,
        'ms',
        { operation: trace.operationName, status }
      );
    }

    if (this.config.detailedTracing) {
      this.logger.info('Operation trace completed', {
        traceId,
        operationName: trace.operationName,
        duration,
        status
      });
    }

    // 清理追踪记录
    this.traces.delete(traceId);
  }

  /**
   * 记录性能指标
   */
  async recordMetric(metricData: Omit<RolePerformanceMetric, 'id' | 'timestamp'>): Promise<void> {
    if (!this.config.enabled) return;

    const metric: RolePerformanceMetric = {
      id: this.generateMetricId(),
      timestamp: Date.now(),
      ...metricData
    };

    this.metrics.push(metric);

    // 检查告警阈值
    if (this.config.realTimeAlertsEnabled) {
      await this.checkAlertThresholds(metric);
    }

    // 同步到MLPP性能监控器
    if (this.mlppPerformanceMonitor) {
      await this.mlppPerformanceMonitor.recordMetric(
        metric.name,
        metric.value,
        metric.unit,
        metric.tags
      );
    }

    this.logger.debug('Performance metric recorded', {
      metricId: metric.id,
      name: metric.name,
      value: metric.value,
      unit: metric.unit
    });
  }

  /**
   * 优化权限检查算法
   */
  async optimizePermissionCheck<T>(
    operation: () => Promise<T>,
    context: { roleId?: string; permission?: string; resourceId?: string }
  ): Promise<T> {
    const traceId = this.startTrace('permission_check', context);
    const startTime = performance.now();

    try {
      // 执行权限检查
      const result = await operation();
      const duration = performance.now() - startTime;

      // 记录成功指标
      await this.recordMetric({
        type: PerformanceMetricType.PERMISSION_CHECK,
        name: 'permission_check_success',
        value: duration,
        unit: 'ms',
        tags: {
          roleId: context.roleId || 'unknown',
          permission: context.permission || 'unknown',
          status: 'success'
        }
      });

      await this.endTrace(traceId, 'completed');
      return result;

    } catch (error) {
      const duration = performance.now() - startTime;

      // 记录错误指标
      await this.recordMetric({
        type: PerformanceMetricType.PERMISSION_CHECK,
        name: 'permission_check_error',
        value: duration,
        unit: 'ms',
        tags: {
          roleId: context.roleId || 'unknown',
          permission: context.permission || 'unknown',
          status: 'error'
        }
      });

      await this.endTrace(traceId, 'failed', error instanceof Error ? error : new Error('Unknown error'));
      throw error;
    }
  }

  /**
   * 获取性能统计
   */
  getPerformanceStats(): {
    totalMetrics: number;
    activeTraces: number;
    totalAlerts: number;
    unresolvedAlerts: number;
    benchmarks: Record<string, PerformanceBenchmark>;
    recentMetrics: RolePerformanceMetric[];
  } {
    const recentMetrics = this.metrics
      .filter(m => Date.now() - m.timestamp < 300000) // 最近5分钟
      .slice(-50); // 最多50个

    return {
      totalMetrics: this.metrics.length,
      activeTraces: this.traces.size,
      totalAlerts: this.alerts.length,
      unresolvedAlerts: this.alerts.filter(a => !a.resolved).length,
      benchmarks: Object.fromEntries(this.benchmarks),
      recentMetrics
    };
  }

  /**
   * 获取性能健康状态
   */
  getHealthStatus(): {
    status: 'healthy' | 'degraded' | 'unhealthy';
    score: number;
    issues: string[];
    recommendations: string[];
  } {
    const stats = this.getPerformanceStats();
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    // 检查未解决的告警
    if (stats.unresolvedAlerts > 0) {
      issues.push(`${stats.unresolvedAlerts} unresolved alerts`);
      score -= stats.unresolvedAlerts * 10;
    }

    // 检查活跃追踪数量
    if (stats.activeTraces > 100) {
      issues.push('High number of active traces');
      score -= 20;
      recommendations.push('Consider increasing cleanup frequency');
    }

    // 检查基准性能
    for (const [operation, benchmark] of this.benchmarks) {
      const threshold = this.config.alertThresholds[`${operation}_latency_ms`];
      if (threshold !== undefined && benchmark.p95 > threshold) {
        issues.push(`${operation} P95 latency exceeds threshold`);
        score -= 15;
        recommendations.push(`Optimize ${operation} performance`);
      }
    }

    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    if (score < 80) status = 'degraded';
    if (score < 60) status = 'unhealthy';

    return { status, score, issues, recommendations };
  }

  /**
   * 检查告警阈值
   */
  private async checkAlertThresholds(metric: RolePerformanceMetric): Promise<void> {
    const thresholdKey = `${metric.name}_${metric.unit}`;
    const threshold = this.config.alertThresholds[thresholdKey];

    if (threshold && metric.value > threshold) {
      const alert: PerformanceAlert = {
        id: this.generateAlertId(),
        level: this.determineAlertLevel(metric.value, threshold),
        metric: metric.name,
        threshold,
        currentValue: metric.value,
        message: `${metric.name} (${metric.value}${metric.unit}) exceeds threshold (${threshold}${metric.unit})`,
        timestamp: Date.now(),
        resolved: false
      };

      this.alerts.push(alert);

      this.logger.warn('Performance alert triggered', {
        alertId: alert.id,
        level: alert.level,
        metric: alert.metric,
        currentValue: alert.currentValue,
        threshold: alert.threshold
      });

      // 发送实时告警
      if (this.config.realTimeAlertsEnabled) {
        await this.sendRealTimeAlert(alert);
      }
    }
  }

  /**
   * 确定告警级别
   */
  private determineAlertLevel(value: number, threshold: number): AlertLevel {
    const ratio = value / threshold;

    if (ratio >= 3) return AlertLevel.EMERGENCY;
    if (ratio >= 2) return AlertLevel.CRITICAL;
    if (ratio >= 1.5) return AlertLevel.WARNING;
    return AlertLevel.INFO;
  }

  /**
   * 发送实时告警
   */
  private async sendRealTimeAlert(alert: PerformanceAlert): Promise<void> {
    // 这里可以集成外部告警系统
    this.logger.error('Real-time performance alert', undefined, {
      alertId: alert.id,
      level: alert.level,
      message: alert.message,
      timestamp: new Date(alert.timestamp).toISOString()
    });

    // 如果有MLPP性能监控器，也发送告警
    if (this.mlppPerformanceMonitor) {
      await this.mlppPerformanceMonitor.recordMetric(
        'role_performance_alert',
        1,
        'count',
        {
          level: alert.level,
          metric: alert.metric,
          alert_id: alert.id
        }
      );
    }
  }

  /**
   * 更新基准测试
   */
  private async updateBenchmark(operation: string, duration: number): Promise<void> {
    let benchmark = this.benchmarks.get(operation);

    if (!benchmark) {
      benchmark = {
        operation,
        p50: duration,
        p95: duration,
        p99: duration,
        mean: duration,
        min: duration,
        max: duration,
        sampleCount: 1,
        lastUpdated: Date.now()
      };
    } else {
      // 更新统计信息（简化实现，实际应该使用更精确的百分位计算）
      const newCount = benchmark.sampleCount + 1;
      benchmark.mean = (benchmark.mean * benchmark.sampleCount + duration) / newCount;
      benchmark.min = Math.min(benchmark.min, duration);
      benchmark.max = Math.max(benchmark.max, duration);
      benchmark.sampleCount = newCount;
      benchmark.lastUpdated = Date.now();

      // 简化的百分位更新
      if (duration < benchmark.p50) benchmark.p50 = duration;
      if (duration > benchmark.p95) benchmark.p95 = duration;
      if (duration > benchmark.p99) benchmark.p99 = duration;
    }

    this.benchmarks.set(operation, benchmark);
  }

  /**
   * 开始指标收集
   */
  private startMetricsCollection(): void {
    this.metricsTimer = setInterval(async () => {
      await this.collectSystemMetrics();
    }, this.config.collectionInterval);
  }

  /**
   * 收集系统指标
   */
  private async collectSystemMetrics(): Promise<void> {
    try {
      // 内存使用量
      const memoryUsage = process.memoryUsage();
      await this.recordMetric({
        type: PerformanceMetricType.MEMORY_USAGE,
        name: 'role_memory_usage',
        value: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        unit: 'mb',
        tags: { component: 'role_module' }
      });

      // 活跃追踪数量
      await this.recordMetric({
        type: PerformanceMetricType.THROUGHPUT,
        name: 'active_traces_count',
        value: this.traces.size,
        unit: 'count',
        tags: { component: 'role_module' }
      });

      // 指标数量
      await this.recordMetric({
        type: PerformanceMetricType.THROUGHPUT,
        name: 'metrics_count',
        value: this.metrics.length,
        unit: 'count',
        tags: { component: 'role_module' }
      });

    } catch (error) {
      this.logger.error('Failed to collect system metrics', error instanceof Error ? error : undefined);
    }
  }

  /**
   * 开始清理定时器
   */
  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanupOldData();
    }, 300000); // 5分钟清理一次
  }

  /**
   * 清理过期数据
   */
  private cleanupOldData(): void {
    const now = Date.now();
    const retentionThreshold = now - this.config.retentionPeriod;

    // 清理过期指标
    const oldMetricsCount = this.metrics.length;
    this.metrics = this.metrics.filter(m => m.timestamp > retentionThreshold);
    const cleanedMetrics = oldMetricsCount - this.metrics.length;

    // 清理过期告警
    const oldAlertsCount = this.alerts.length;
    this.alerts = this.alerts.filter(a => a.timestamp > retentionThreshold);
    const cleanedAlerts = oldAlertsCount - this.alerts.length;

    // 清理长时间运行的追踪
    const longRunningThreshold = now - 300000; // 5分钟
    for (const [traceId, trace] of this.traces.entries()) {
      if (trace.startTime < longRunningThreshold) {
        this.logger.warn('Long-running trace detected', {
          traceId,
          operationName: trace.operationName,
          duration: now - trace.startTime
        });
        this.traces.delete(traceId);
      }
    }

    if (cleanedMetrics > 0 || cleanedAlerts > 0) {
      this.logger.info('Performance data cleanup completed', {
        cleanedMetrics,
        cleanedAlerts,
        remainingMetrics: this.metrics.length,
        remainingAlerts: this.alerts.length
      });
    }
  }

  /**
   * 生成追踪ID
   */
  private generateTraceId(): string {
    return `role-trace-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * 生成指标ID
   */
  private generateMetricId(): string {
    return `role-metric-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * 生成告警ID
   */
  private generateAlertId(): string {
    return `role-alert-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * 解决告警
   */
  async resolveAlert(alertId: string): Promise<boolean> {
    const alert = this.alerts.find(a => a.id === alertId);
    if (!alert) {
      return false;
    }

    alert.resolved = true;
    alert.resolvedAt = Date.now();

    this.logger.info('Performance alert resolved', {
      alertId,
      metric: alert.metric,
      resolvedAt: new Date(alert.resolvedAt).toISOString()
    });

    return true;
  }

  /**
   * 获取未解决的告警
   */
  getUnresolvedAlerts(): PerformanceAlert[] {
    return this.alerts.filter(a => !a.resolved);
  }

  /**
   * 获取操作基准
   */
  getOperationBenchmarks(): Map<string, PerformanceBenchmark> {
    return new Map(this.benchmarks);
  }

  /**
   * 重置基准测试
   */
  resetBenchmarks(): void {
    this.benchmarks.clear();
    this.logger.info('Performance benchmarks reset');
  }

  /**
   * 销毁性能监控服务
   */
  async destroy(): Promise<void> {
    if (this.metricsTimer) {
      clearInterval(this.metricsTimer);
    }
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }

    // 清理所有数据
    this.metrics = [];
    this.alerts = [];
    this.traces.clear();
    this.benchmarks.clear();

    this.logger.info('Performance monitoring service destroyed');
  }
}

/**
 * 创建Role性能监控服务实例的工厂函数
 */
export function createRolePerformanceService(
  config?: Partial<RolePerformanceConfig>,
  mlppPerformanceMonitor?: MLPPPerformanceMonitor
): RolePerformanceService {
  return new RolePerformanceService(config, mlppPerformanceMonitor);
}
