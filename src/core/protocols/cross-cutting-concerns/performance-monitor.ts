/**
 * MPLP性能监控管理器
 * 
 * @description L3层统一性能监控，提供指标收集、分析和告警功能
 * @version 1.0.0
 * @integration 与所有10个模块统一集成
 */

/**
 * 性能指标接口
 */
export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: string;
  tags?: Record<string, string>;
  metadata?: Record<string, unknown>;
}

/**
 * 性能监控配置
 */
export interface PerformanceConfig {
  enabled: boolean;
  collectionInterval: number; // 毫秒
  retentionPeriod: number; // 毫秒
  alertThresholds: Record<string, number>;
  exportFormats: string[];
}

/**
 * 性能告警
 */
export interface PerformanceAlert {
  id: string;
  metricName: string;
  threshold: number;
  currentValue: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  message: string;
  resolved: boolean;
}

/**
 * 操作性能跟踪
 */
export interface OperationTrace {
  operationId: string;
  operationName: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  status: 'running' | 'completed' | 'failed';
  metadata?: Record<string, unknown>;
}

/**
 * MPLP性能监控管理器
 * 
 * @description 统一的性能监控实现，所有模块使用相同的监控策略
 */
export class MLPPPerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private alerts: PerformanceAlert[] = [];
  private activeTraces = new Map<string, OperationTrace>();
  private config: PerformanceConfig = {
    enabled: true,
    collectionInterval: 30000, // 30秒
    retentionPeriod: 24 * 60 * 60 * 1000, // 24小时
    alertThresholds: {
      'response_time_ms': 1000,
      'memory_usage_mb': 512,
      'cpu_usage_percent': 80,
      'error_rate_percent': 5
    },
    exportFormats: ['prometheus', 'json']
  };

  /**
   * 记录性能指标
   */
  async recordMetric(
    name: string,
    value: number,
    unit: string,
    tags?: Record<string, string>
  ): Promise<void> {
    if (!this.config.enabled) return;

    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      timestamp: new Date().toISOString(),
      tags,
      metadata: {
        source: 'mplp_performance_monitor'
      }
    };

    this.metrics.push(metric);
    
    // 检查告警阈值
    await this.checkAlertThresholds(metric);
    
    // 清理过期指标
    this.cleanupOldMetrics();
  }

  /**
   * 开始操作跟踪
   */
  startTrace(operationName: string, metadata?: Record<string, unknown>): string {
    const operationId = `trace-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    
    const trace: OperationTrace = {
      operationId,
      operationName,
      startTime: Date.now(),
      status: 'running',
      metadata
    };

    this.activeTraces.set(operationId, trace);
    return operationId;
  }

  /**
   * 结束操作跟踪
   */
  async endTrace(
    operationId: string,
    status: 'completed' | 'failed' = 'completed'
  ): Promise<OperationTrace | null> {
    const trace = this.activeTraces.get(operationId);
    if (!trace) return null;

    trace.endTime = Date.now();
    trace.duration = trace.endTime - trace.startTime;
    trace.status = status;

    this.activeTraces.delete(operationId);

    // 记录操作性能指标
    await this.recordMetric(
      `operation_duration_ms`,
      trace.duration,
      'milliseconds',
      {
        operation: trace.operationName,
        status: trace.status
      }
    );

    return trace;
  }

  /**
   * 获取性能指标
   */
  getMetrics(
    filter?: {
      name?: string;
      startTime?: string;
      endTime?: string;
      tags?: Record<string, string>;
    }
  ): PerformanceMetric[] {
    if (!filter) {
      return this.metrics;
    }

    return this.metrics.filter(metric => {
      // 按名称过滤
      if (filter.name && metric.name !== filter.name) {
        return false;
      }

      // 按时间范围过滤
      const metricTime = new Date(metric.timestamp).getTime();
      if (filter.startTime && metricTime < new Date(filter.startTime).getTime()) {
        return false;
      }
      if (filter.endTime && metricTime > new Date(filter.endTime).getTime()) {
        return false;
      }

      // 按标签过滤
      if (filter.tags && metric.tags) {
        for (const [key, value] of Object.entries(filter.tags)) {
          if (metric.tags[key] !== value) {
            return false;
          }
        }
      }

      return true;
    });
  }

  /**
   * 获取实时性能统计
   */
  getRealTimeStats(): Record<string, unknown> {
    const now = Date.now();
    const recentMetrics = this.metrics.filter(
      m => new Date(m.timestamp).getTime() > now - 5 * 60 * 1000 // 最近5分钟
    );

    const stats: Record<string, unknown> = {
      totalMetrics: this.metrics.length,
      recentMetrics: recentMetrics.length,
      activeTraces: this.activeTraces.size,
      activeAlerts: this.alerts.filter(a => !a.resolved).length
    };

    // 计算各类指标的统计信息
    const metricGroups = recentMetrics.reduce((groups, metric) => {
      if (!groups[metric.name]) {
        groups[metric.name] = [];
      }
      groups[metric.name].push(metric.value);
      return groups;
    }, {} as Record<string, number[]>);

    Object.entries(metricGroups).forEach(([name, values]) => {
      if (values.length > 0) {
        stats[`${name}_avg`] = values.reduce((a, b) => a + b, 0) / values.length;
        stats[`${name}_min`] = Math.min(...values);
        stats[`${name}_max`] = Math.max(...values);
      }
    });

    return stats;
  }

  /**
   * 获取活动告警
   */
  getActiveAlerts(): PerformanceAlert[] {
    return this.alerts.filter(alert => !alert.resolved);
  }

  /**
   * 解决告警
   */
  async resolveAlert(alertId: string): Promise<boolean> {
    const alert = this.alerts.find(a => a.id === alertId);
    if (!alert) {
      return false;
    }

    if (alert.resolved) {
      return true; // 已经解决
    }

    alert.resolved = true;

    // 记录告警解决指标
    await this.recordMetric(
      'alert_resolved',
      1,
      'count',
      {
        alert_id: alertId,
        metric_name: alert.metricName,
        severity: alert.severity
      }
    );

    console.log(`Alert resolved: ${alertId} (${alert.metricName})`);
    return true;
  }

  /**
   * 导出性能数据
   */
  async exportMetrics(_format: string = 'json'): Promise<string> {
    // TODO: 等待CoreOrchestrator激活 - 实现多格式导出
    switch (_format) {
      case 'prometheus':
        return this.exportPrometheusFormat();
      case 'json':
      default:
        return JSON.stringify({
          metrics: this.metrics,
          alerts: this.alerts,
          stats: this.getRealTimeStats()
        }, null, 2);
    }
  }

  /**
   * 更新监控配置
   */
  updateConfig(newConfig: Partial<PerformanceConfig>): void {
    const oldConfig = { ...this.config };
    this.config = { ...this.config, ...newConfig };

    // 记录配置更新
    console.log('Performance monitor configuration updated:', {
      oldConfig: oldConfig,
      newConfig: this.config,
      changes: Object.keys(newConfig)
    });

    // 如果禁用了监控，清理现有数据
    if (newConfig.enabled === false) {
      this.metrics = [];
      this.alerts = [];
      this.activeTraces.clear();
      console.log('Performance monitoring disabled, data cleared');
    }

    // 如果更新了保留期，清理过期数据
    if (newConfig.retentionPeriod !== undefined) {
      this.cleanupOldMetrics();
    }
  }

  /**
   * 检查告警阈值
   */
  private async checkAlertThresholds(metric: PerformanceMetric): Promise<void> {
    const threshold = this.config.alertThresholds[metric.name];
    if (threshold && metric.value > threshold) {
      const alert: PerformanceAlert = {
        id: `alert-${Date.now()}`,
        metricName: metric.name,
        threshold,
        currentValue: metric.value,
        severity: this.calculateSeverity(metric.value, threshold),
        timestamp: new Date().toISOString(),
        message: `Metric ${metric.name} exceeded threshold: ${metric.value} > ${threshold}`,
        resolved: false
      };

      this.alerts.push(alert);
    }
  }

  /**
   * 计算告警严重程度
   */
  private calculateSeverity(value: number, threshold: number): PerformanceAlert['severity'] {
    const ratio = value / threshold;
    if (ratio >= 2) return 'critical';
    if (ratio >= 1.5) return 'high';
    if (ratio >= 1.2) return 'medium';
    return 'low';
  }

  /**
   * 清理过期指标
   */
  private cleanupOldMetrics(): void {
    const cutoffTime = Date.now() - this.config.retentionPeriod;
    this.metrics = this.metrics.filter(
      metric => new Date(metric.timestamp).getTime() > cutoffTime
    );
  }

  /**
   * 导出Prometheus格式
   */
  private exportPrometheusFormat(): string {
    const lines: string[] = [];

    // 添加通用信息
    lines.push('# MPLP Performance Metrics Export');
    lines.push(`# Generated at: ${new Date().toISOString()}`);
    lines.push('');

    const metricGroups = this.metrics.reduce((groups, metric) => {
      if (!groups[metric.name]) {
        groups[metric.name] = [];
      }
      groups[metric.name].push(metric);
      return groups;
    }, {} as Record<string, PerformanceMetric[]>);

    Object.entries(metricGroups).forEach(([name, metrics]) => {
      // 清理指标名称，确保符合Prometheus规范
      const cleanName = name.replace(/[^a-zA-Z0-9_]/g, '_');

      lines.push(`# HELP ${cleanName} Performance metric from MPLP`);
      lines.push(`# TYPE ${cleanName} gauge`);

      metrics.forEach(metric => {
        const tags = metric.tags ?
          Object.entries(metric.tags)
            .map(([k, v]) => `${k.replace(/[^a-zA-Z0-9_]/g, '_')}="${v}"`)
            .join(',') : '';
        const tagString = tags ? `{${tags}}` : '';
        lines.push(`${cleanName}${tagString} ${metric.value} ${new Date(metric.timestamp).getTime()}`);
      });

      lines.push(''); // 空行分隔不同指标
    });

    return lines.join('\n');
  }

  /**
   * 健康检查
   */
  async healthCheck(): Promise<boolean> {
    try {
      // 检查性能监控器的基本功能
      await this.recordMetric('health_check', 1, 'count');
      return true;
    } catch {
      return false;
    }
  }
}
