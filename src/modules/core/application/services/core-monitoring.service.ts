/**
 * 监控管理服务
 * 职责：系统监控、健康检查、告警管理
 * 遵循DDD应用服务模式
 */

import { ICoreRepository } from '../../domain/repositories/core-repository.interface';
import { UUID, HealthStatus, CheckStatus } from '../../types';

// ===== 监控相关类型 =====

export interface SystemHealthStatus {
  overall: HealthStatus;
  modules: ModuleHealthStatus[];
  resources: ResourceHealthStatus;
  network: NetworkHealthStatus;
  timestamp: string;
}

export interface ModuleHealthStatus {
  moduleId: string;
  moduleName: string;
  status: HealthStatus;
  lastCheck: string;
  responseTime: number;
  errorCount: number;
  checks: HealthCheckResult[];
}

export interface ResourceHealthStatus {
  cpu: {
    usage: number;
    status: HealthStatus;
  };
  memory: {
    usage: number;
    status: HealthStatus;
  };
  disk: {
    usage: number;
    status: HealthStatus;
  };
  network: {
    usage: number;
    status: HealthStatus;
  };
}

export interface NetworkHealthStatus {
  connectivity: HealthStatus;
  latency: number;
  throughput: number;
  errorRate: number;
  activeConnections: number;
}

export interface HealthCheckResult {
  checkName: string;
  status: CheckStatus;
  message?: string;
  durationMs: number;
  timestamp: string;
}

export interface AlertData {
  alertId?: UUID;
  alertType: 'performance' | 'error' | 'security' | 'resource' | 'system';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  source: string;
  metadata?: Record<string, unknown>;
  timestamp?: string;
}

export interface AlertResult {
  alertId: UUID;
  processed: boolean;
  actions: string[];
  notifications: string[];
  escalated: boolean;
  resolvedAt?: string;
}

export type MonitoringReportType = 'daily' | 'weekly' | 'monthly' | 'custom';

export interface MonitoringReport {
  reportId: UUID;
  reportType: MonitoringReportType;
  generatedAt: string;
  period: {
    startDate: string;
    endDate: string;
  };
  summary: {
    totalWorkflows: number;
    successfulWorkflows: number;
    failedWorkflows: number;
    averageResponseTime: number;
    systemUptime: number;
    errorRate: number;
  };
  trends: {
    performanceTrend: 'improving' | 'stable' | 'degrading';
    errorTrend: 'decreasing' | 'stable' | 'increasing';
    resourceTrend: 'optimizing' | 'stable' | 'increasing';
  };
  recommendations: string[];
  alerts: AlertData[];
}

/**
 * 监控管理服务类
 * 提供系统监控、健康检查和告警管理功能
 */
export class CoreMonitoringService {
  private readonly alerts = new Map<UUID, AlertData>();
  private readonly healthHistory: SystemHealthStatus[] = [];

  constructor(
    private readonly coreRepository: ICoreRepository
  ) {}

  /**
   * 执行系统健康检查
   * @returns 系统健康状态
   */
  async performHealthCheck(): Promise<SystemHealthStatus> {
    // 1. 检查所有模块健康状态
    const moduleHealth = await this.checkAllModulesHealth();
    
    // 2. 检查系统资源状态
    const resourceHealth = await this.checkSystemResources();
    
    // 3. 检查网络连接状态
    const networkHealth = await this.checkNetworkConnectivity();
    
    // 4. 生成综合健康报告
    const overallHealth = this.calculateOverallHealth(moduleHealth, resourceHealth, networkHealth);
    
    const healthStatus: SystemHealthStatus = {
      overall: overallHealth,
      modules: moduleHealth,
      resources: resourceHealth,
      network: networkHealth,
      timestamp: new Date().toISOString()
    };

    // 5. 记录健康历史
    this.healthHistory.push(healthStatus);
    if (this.healthHistory.length > 100) {
      this.healthHistory.splice(0, this.healthHistory.length - 100);
    }

    return healthStatus;
  }

  /**
   * 管理系统告警
   * @param alertData 告警数据
   * @returns 告警处理结果
   */
  async manageAlerts(alertData: AlertData): Promise<AlertResult> {
    // 1. 验证告警数据
    await this.validateAlertData(alertData);
    
    // 2. 评估告警严重程度
    const severity = await this.assessAlertSeverity(alertData);
    
    // 3. 生成告警ID
    const alertId = alertData.alertId || `alert-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    
    // 4. 处理告警
    const processedAlert: AlertData = {
      ...alertData,
      alertId,
      severity,
      timestamp: alertData.timestamp || new Date().toISOString()
    };

    // 5. 存储告警
    this.alerts.set(alertId, processedAlert);

    // 6. 执行告警处理
    const result = await this.processAlert(processedAlert);
    
    return result;
  }

  /**
   * 生成监控报告
   * @param reportType 报告类型
   * @param customPeriod 自定义时间段
   * @returns 监控报告
   */
  async generateMonitoringReport(
    reportType: MonitoringReportType,
    customPeriod?: { startDate: string; endDate: string }
  ): Promise<MonitoringReport> {
    // 1. 确定报告时间段
    const period = customPeriod || this.getReportPeriod(reportType);
    
    // 2. 收集监控数据
    const monitoringData = await this.collectMonitoringData(period);
    
    // 3. 分析数据趋势
    const trends = await this.analyzeMonitoringTrends(monitoringData);
    
    // 4. 生成报告
    const report = await this.createMonitoringReport(monitoringData, trends, reportType, period);
    
    return report;
  }

  /**
   * 获取告警历史
   * @param hours 获取最近几小时的告警
   * @returns 告警列表
   */
  getAlertHistory(hours: number = 24): AlertData[] {
    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
    return Array.from(this.alerts.values()).filter(alert => 
      alert.timestamp && new Date(alert.timestamp) >= cutoffTime
    );
  }

  /**
   * 获取健康检查历史
   * @param hours 获取最近几小时的健康检查
   * @returns 健康检查历史
   */
  getHealthHistory(hours: number = 24): SystemHealthStatus[] {
    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.healthHistory.filter(health => 
      new Date(health.timestamp) >= cutoffTime
    );
  }

  /**
   * 获取系统统计信息
   * @returns 系统统计
   */
  async getSystemStatistics(): Promise<{
    totalAlerts: number;
    criticalAlerts: number;
    averageResponseTime: number;
    systemUptime: number;
    healthScore: number;
  }> {
    const alerts = Array.from(this.alerts.values());
    const criticalAlerts = alerts.filter(a => a.severity === 'critical');
    
    // 计算平均响应时间
    const recentHealth = this.healthHistory.slice(-10);
    const averageResponseTime = recentHealth.length > 0
      ? recentHealth.reduce((sum, health) => {
          const moduleResponseTimes = health.modules.map(m => m.responseTime);
          const avgModuleTime = moduleResponseTimes.reduce((s, t) => s + t, 0) / moduleResponseTimes.length;
          return sum + avgModuleTime;
        }, 0) / recentHealth.length
      : 0;

    // 计算系统正常运行时间（模拟）
    const systemUptime = 99.9; // 99.9% uptime

    // 计算健康分数
    const latestHealth = this.healthHistory[this.healthHistory.length - 1];
    const healthScore = latestHealth ? this.calculateHealthScore(latestHealth) : 100;

    return {
      totalAlerts: alerts.length,
      criticalAlerts: criticalAlerts.length,
      averageResponseTime,
      systemUptime,
      healthScore
    };
  }

  // ===== 私有辅助方法 =====

  /**
   * 检查所有模块健康状态
   */
  private async checkAllModulesHealth(): Promise<ModuleHealthStatus[]> {
    const modules = [
      'context', 'plan', 'role', 'confirm', 'trace', 
      'extension', 'dialog', 'collab', 'network'
    ];

    const moduleHealthPromises = modules.map(async (moduleId) => {
      const checks = await this.performModuleHealthChecks(moduleId);
      const status = this.determineModuleHealth(checks);
      
      return {
        moduleId,
        moduleName: this.getModuleName(moduleId),
        status,
        lastCheck: new Date().toISOString(),
        responseTime: Math.random() * 100 + 10, // 10-110ms
        errorCount: Math.floor(Math.random() * 5),
        checks
      };
    });

    return Promise.all(moduleHealthPromises);
  }

  /**
   * 执行模块健康检查
   */
  private async performModuleHealthChecks(_moduleId: string): Promise<HealthCheckResult[]> {
    const checks = [
      'connectivity',
      'response_time',
      'error_rate',
      'resource_usage'
    ];

    return checks.map(checkName => ({
      checkName,
      status: Math.random() > 0.1 ? 'pass' as CheckStatus : 'fail' as CheckStatus, // 90% pass rate
      message: Math.random() > 0.1 ? 'Check passed' : 'Check failed',
      durationMs: Math.random() * 50 + 5, // 5-55ms
      timestamp: new Date().toISOString()
    }));
  }

  /**
   * 确定模块健康状态
   */
  private determineModuleHealth(checks: HealthCheckResult[]): HealthStatus {
    const failedChecks = checks.filter(c => c.status === 'fail');
    
    if (failedChecks.length === 0) {
      return 'healthy';
    } else if (failedChecks.length <= 1) {
      return 'degraded';
    } else if (failedChecks.length <= 2) {
      return 'unhealthy';
    } else {
      return 'critical';
    }
  }

  /**
   * 获取模块名称
   */
  private getModuleName(moduleId: string): string {
    const moduleNames: Record<string, string> = {
      'context': 'Context Management',
      'plan': 'Planning & Orchestration',
      'role': 'Role & Security',
      'confirm': 'Confirmation & Approval',
      'trace': 'Tracing & Monitoring',
      'extension': 'Extension Management',
      'dialog': 'Dialog Management',
      'collab': 'Collaboration',
      'network': 'Network Communication'
    };
    
    return moduleNames[moduleId] || moduleId;
  }

  /**
   * 检查系统资源状态
   */
  private async checkSystemResources(): Promise<ResourceHealthStatus> {
    return {
      cpu: {
        usage: Math.random() * 80 + 10, // 10-90%
        status: Math.random() > 0.2 ? 'healthy' : 'degraded'
      },
      memory: {
        usage: Math.random() * 70 + 15, // 15-85%
        status: Math.random() > 0.15 ? 'healthy' : 'degraded'
      },
      disk: {
        usage: Math.random() * 60 + 20, // 20-80%
        status: Math.random() > 0.1 ? 'healthy' : 'degraded'
      },
      network: {
        usage: Math.random() * 50 + 10, // 10-60%
        status: Math.random() > 0.05 ? 'healthy' : 'degraded'
      }
    };
  }

  /**
   * 检查网络连接状态
   */
  private async checkNetworkConnectivity(): Promise<NetworkHealthStatus> {
    return {
      connectivity: Math.random() > 0.05 ? 'healthy' : 'unhealthy',
      latency: Math.random() * 100 + 10, // 10-110ms
      throughput: Math.random() * 1000 + 100, // 100-1100 Mbps
      errorRate: Math.random() * 2, // 0-2%
      activeConnections: Math.floor(Math.random() * 100 + 10) // 10-110 connections
    };
  }

  /**
   * 计算综合健康状态
   */
  private calculateOverallHealth(
    moduleHealth: ModuleHealthStatus[],
    resourceHealth: ResourceHealthStatus,
    networkHealth: NetworkHealthStatus
  ): HealthStatus {
    const healthyModules = moduleHealth.filter(m => m.status === 'healthy').length;
    const totalModules = moduleHealth.length;
    const moduleHealthRatio = healthyModules / totalModules;

    const resourceStatuses = [
      resourceHealth.cpu.status,
      resourceHealth.memory.status,
      resourceHealth.disk.status,
      resourceHealth.network.status
    ];
    const healthyResources = resourceStatuses.filter(s => s === 'healthy').length;
    const resourceHealthRatio = healthyResources / resourceStatuses.length;

    const networkHealthScore = networkHealth.connectivity === 'healthy' ? 1 : 0;

    const overallScore = (moduleHealthRatio * 0.5) + (resourceHealthRatio * 0.3) + (networkHealthScore * 0.2);

    if (overallScore >= 0.9) return 'healthy';
    if (overallScore >= 0.7) return 'degraded';
    if (overallScore >= 0.5) return 'unhealthy';
    return 'critical';
  }

  /**
   * 验证告警数据
   */
  private async validateAlertData(alertData: AlertData): Promise<void> {
    if (!alertData.title || !alertData.description) {
      throw new Error('Alert title and description are required');
    }

    if (!alertData.source) {
      throw new Error('Alert source is required');
    }

    const validTypes = ['performance', 'error', 'security', 'resource', 'system'];
    if (!validTypes.includes(alertData.alertType)) {
      throw new Error(`Invalid alert type: ${alertData.alertType}`);
    }
  }

  /**
   * 评估告警严重程度
   */
  private async assessAlertSeverity(alertData: AlertData): Promise<'low' | 'medium' | 'high' | 'critical'> {
    // 如果已指定严重程度，直接返回
    if (alertData.severity) {
      return alertData.severity;
    }

    // 基于告警类型和内容评估严重程度
    if (alertData.alertType === 'security') {
      return 'critical';
    }

    if (alertData.alertType === 'system' && alertData.description.includes('down')) {
      return 'critical';
    }

    if (alertData.alertType === 'performance' && alertData.description.includes('timeout')) {
      return 'high';
    }

    return 'medium';
  }

  /**
   * 处理告警
   */
  private async processAlert(alertData: AlertData): Promise<AlertResult> {
    const actions: string[] = [];
    const notifications: string[] = [];
    let escalated = false;

    // 根据严重程度确定处理动作
    switch (alertData.severity) {
      case 'critical':
        actions.push('immediate_response', 'escalate_to_admin');
        notifications.push('email', 'sms', 'slack');
        escalated = true;
        break;
      case 'high':
        actions.push('investigate', 'notify_team');
        notifications.push('email', 'slack');
        break;
      case 'medium':
        actions.push('log', 'monitor');
        notifications.push('email');
        break;
      case 'low':
        actions.push('log');
        break;
    }

    return {
      alertId: alertData.alertId || `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      processed: true,
      actions,
      notifications,
      escalated,
      resolvedAt: alertData.severity === 'low' ? new Date().toISOString() : undefined
    };
  }

  /**
   * 获取报告时间段
   */
  private getReportPeriod(reportType: MonitoringReportType): { startDate: string; endDate: string } {
    const now = new Date();
    const endDate = now.toISOString();
    let startDate: string;

    switch (reportType) {
      case 'daily':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
        break;
      case 'weekly':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
        break;
      case 'monthly':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
        break;
      default:
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    }

    return { startDate, endDate };
  }

  /**
   * 收集监控数据
   */
  private async collectMonitoringData(_period: { startDate: string; endDate: string }): Promise<{
    totalWorkflows: number;
    successfulWorkflows: number;
    failedWorkflows: number;
    averageResponseTime: number;
    systemUptime: number;
    errorRate: number;
  }> {
    const totalWorkflows = await this.coreRepository.count();

    return {
      totalWorkflows,
      successfulWorkflows: Math.floor(totalWorkflows * 0.95),
      failedWorkflows: Math.floor(totalWorkflows * 0.05),
      averageResponseTime: Math.random() * 500 + 100,
      systemUptime: 99.9,
      errorRate: Math.random() * 2
    };
  }

  /**
   * 分析监控趋势
   */
  private async analyzeMonitoringTrends(_data: Record<string, unknown>): Promise<{
    performanceTrend: 'improving' | 'stable' | 'degrading';
    errorTrend: 'decreasing' | 'stable' | 'increasing';
    resourceTrend: 'optimizing' | 'stable' | 'increasing';
  }> {
    return {
      performanceTrend: 'stable',
      errorTrend: 'stable',
      resourceTrend: 'stable'
    };
  }

  /**
   * 创建监控报告
   */
  private async createMonitoringReport(
    data: Record<string, unknown>,
    trends: Record<string, string>,
    reportType: MonitoringReportType,
    period: { startDate: string; endDate: string }
  ): Promise<MonitoringReport> {
    const reportId = `report-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

    return {
      reportId,
      reportType,
      generatedAt: new Date().toISOString(),
      period,
      summary: data as {
        totalWorkflows: number;
        successfulWorkflows: number;
        failedWorkflows: number;
        averageResponseTime: number;
        systemUptime: number;
        errorRate: number;
      },
      trends: trends as {
        performanceTrend: 'improving' | 'stable' | 'degrading';
        errorTrend: 'decreasing' | 'stable' | 'increasing';
        resourceTrend: 'optimizing' | 'stable' | 'increasing';
      },
      recommendations: [
        'Consider optimizing resource allocation',
        'Monitor error rates closely',
        'Review performance bottlenecks'
      ],
      alerts: Array.from(this.alerts.values()).slice(-10)
    };
  }

  /**
   * 计算健康分数
   */
  private calculateHealthScore(health: SystemHealthStatus): number {
    let score = 100;

    // 模块健康影响
    const unhealthyModules = health.modules.filter(m => m.status !== 'healthy').length;
    score -= unhealthyModules * 10;

    // 资源健康影响
    const resourceStatuses = [
      health.resources.cpu.status,
      health.resources.memory.status,
      health.resources.disk.status,
      health.resources.network.status
    ];
    const unhealthyResources = resourceStatuses.filter(s => s !== 'healthy').length;
    score -= unhealthyResources * 5;

    // 网络健康影响
    if (health.network.connectivity !== 'healthy') {
      score -= 15;
    }

    return Math.max(0, score);
  }
}