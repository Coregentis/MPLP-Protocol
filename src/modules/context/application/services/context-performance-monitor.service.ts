/**
 * Context性能监控服务
 * 
 * 提供Context模块的性能监控、指标收集和分析功能
 * 为企业级部署和TracePilot集成提供支持
 * 
 * @version 1.0.0
 * @created 2025-08-08
 */

import { Logger } from '../../../../public/utils/logger';
import { UUID } from '../../../../public/shared/types';

/**
 * 性能指标接口
 */
export interface PerformanceMetrics {
  contextId: UUID;
  timestamp: Date;
  responseTime: number;
  operationCount: number;
  errorCount: number;
  memoryUsage?: number;
  cpuUsage?: number;
}

/**
 * 操作性能统计
 */
export interface OperationStats {
  operationType: string;
  totalCount: number;
  successCount: number;
  errorCount: number;
  averageResponseTime: number;
  maxResponseTime: number;
}

/**
 * Context性能监控服务
 * 
 * 设计原则：
 * - 轻量级实现，适合v1.0
 * - 为企业级监控预留扩展接口
 * - 支持TracePilot的调试需求
 */
export class ContextPerformanceMonitorService {
  private readonly logger = new Logger('ContextPerformanceMonitor');
  private readonly metricsHistory = new Map<UUID, PerformanceMetrics[]>();
  private readonly operationStats = new Map<string, OperationStats>();

  /**
   * 记录操作性能指标
   */
  recordOperationMetrics(
    contextId: UUID,
    operationType: string,
    responseTime: number,
    success: boolean
  ): void {
    try {
      const key = `${contextId}-${operationType}`;
      const existing = this.operationStats.get(key) || {
        operationType,
        totalCount: 0,
        successCount: 0,
        errorCount: 0,
        averageResponseTime: 0,
        maxResponseTime: 0
      };

      existing.totalCount++;
      if (success) {
        existing.successCount++;
      } else {
        existing.errorCount++;
      }

      existing.maxResponseTime = Math.max(existing.maxResponseTime, responseTime);
      existing.averageResponseTime = (
        (existing.averageResponseTime * (existing.totalCount - 1) + responseTime) / 
        existing.totalCount
      );

      this.operationStats.set(key, existing);

      this.logger.debug('Recorded operation metrics', {
        contextId,
        operationType,
        responseTime,
        success
      });
    } catch (error) {
      this.logger.error('Failed to record operation metrics', { error, contextId, operationType });
    }
  }

  /**
   * 记录整体性能指标
   */
  recordPerformanceMetrics(metrics: PerformanceMetrics): void {
    try {
      const existing = this.metricsHistory.get(metrics.contextId) || [];
      existing.push(metrics);

      // 保持最近50条记录（简化版本）
      if (existing.length > 50) {
        existing.shift();
      }

      this.metricsHistory.set(metrics.contextId, existing);

      this.logger.debug('Recorded performance metrics', {
        contextId: metrics.contextId,
        responseTime: metrics.responseTime
      });
    } catch (error) {
      this.logger.error('Failed to record performance metrics', { error, metrics });
    }
  }

  /**
   * 获取Context性能报告
   */
  getPerformanceReport(contextId: UUID): {
    metrics: PerformanceMetrics[];
    operationStats: OperationStats[];
    summary: {
      averageResponseTime: number;
      totalOperations: number;
      errorRate: number;
    };
  } {
    try {
      const metrics = this.metricsHistory.get(contextId) || [];
      const operationStats = Array.from(this.operationStats.entries())
        .filter(([key]) => key.startsWith(contextId))
        .map(([, stats]) => stats);

      const totalOperations = operationStats.reduce((sum, stats) => sum + stats.totalCount, 0);
      const totalErrors = operationStats.reduce((sum, stats) => sum + stats.errorCount, 0);
      const averageResponseTime = operationStats.length > 0 
        ? operationStats.reduce((sum, stats) => sum + stats.averageResponseTime, 0) / operationStats.length
        : 0;
      const errorRate = totalOperations > 0 ? (totalErrors / totalOperations) * 100 : 0;

      return {
        metrics,
        operationStats,
        summary: {
          averageResponseTime,
          totalOperations,
          errorRate
        }
      };
    } catch (error) {
      this.logger.error('Failed to generate performance report', { error, contextId });
      throw error;
    }
  }

  /**
   * 检查性能告警（简化版本）
   */
  checkPerformanceAlerts(contextId: UUID): {
    alerts: Array<{
      type: 'high_response_time' | 'high_error_rate';
      severity: 'warning' | 'critical';
      message: string;
      value: number;
    }>;
  } {
    const alerts: any[] = [];

    try {
      const report = this.getPerformanceReport(contextId);

      // 检查响应时间告警
      if (report.summary.averageResponseTime > 1000) {
        alerts.push({
          type: 'high_response_time',
          severity: report.summary.averageResponseTime > 5000 ? 'critical' : 'warning',
          message: 'Average response time is too high',
          value: report.summary.averageResponseTime
        });
      }

      // 检查错误率告警
      if (report.summary.errorRate > 5) {
        alerts.push({
          type: 'high_error_rate',
          severity: report.summary.errorRate > 10 ? 'critical' : 'warning',
          message: 'Error rate is too high',
          value: report.summary.errorRate
        });
      }

      return { alerts };
    } catch (error) {
      this.logger.error('Failed to check performance alerts', { error, contextId });
      return { alerts: [] };
    }
  }

  /**
   * 清理过期数据
   */
  cleanupExpiredData(maxAgeHours: number = 24): void {
    try {
      const cutoffTime = new Date(Date.now() - maxAgeHours * 60 * 60 * 1000);

      for (const [contextId, metrics] of Array.from(this.metricsHistory.entries())) {
        const filteredMetrics = metrics.filter((m: PerformanceMetrics) => m.timestamp > cutoffTime);
        if (filteredMetrics.length === 0) {
          this.metricsHistory.delete(contextId);
        } else {
          this.metricsHistory.set(contextId, filteredMetrics);
        }
      }

      this.logger.info('Cleaned up expired performance data', { 
        cutoffTime, 
        remainingContexts: this.metricsHistory.size 
      });
    } catch (error) {
      this.logger.error('Failed to cleanup expired data', { error });
    }
  }

  /**
   * 获取系统级性能统计
   * 为企业级监控预留的接口
   */
  getSystemPerformanceStats(): {
    totalContexts: number;
    totalOperations: number;
    averageResponseTime: number;
    systemErrorRate: number;
  } {
    try {
      const totalContexts = this.metricsHistory.size;
      const allStats = Array.from(this.operationStats.values());
      
      const totalOperations = allStats.reduce((sum, stats) => sum + stats.totalCount, 0);
      const totalErrors = allStats.reduce((sum, stats) => sum + stats.errorCount, 0);
      const averageResponseTime = allStats.length > 0
        ? allStats.reduce((sum, stats) => sum + stats.averageResponseTime, 0) / allStats.length
        : 0;
      const systemErrorRate = totalOperations > 0 ? (totalErrors / totalOperations) * 100 : 0;

      return {
        totalContexts,
        totalOperations,
        averageResponseTime,
        systemErrorRate
      };
    } catch (error) {
      this.logger.error('Failed to get system performance stats', { error });
      return {
        totalContexts: 0,
        totalOperations: 0,
        averageResponseTime: 0,
        systemErrorRate: 0
      };
    }
  }
}
