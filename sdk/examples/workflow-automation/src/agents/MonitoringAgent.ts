/**
 * @fileoverview Monitoring Agent for workflow performance tracking and alerting
 * @version 1.1.0-beta
 */

import { MPLPAgent, AgentConfig as MPLPAgentConfig } from '@mplp/agent-builder';
import {
  MonitoringAgentInput,
  MonitoringAgentOutput,
  MonitoringAlert,
  AgentConfig,
  WorkflowMetrics,
  AgentPerformanceMetrics
} from '../types';
import { appConfig } from '../config/AppConfig';

export class MonitoringAgent extends MPLPAgent {
  private readonly metricsInterval: number;
  private readonly alertThresholds: Map<string, AlertThreshold>;
  private readonly metricsHistory: Map<string, MetricDataPoint[]>;
  private monitoringTimer?: NodeJS.Timeout | undefined;

  constructor(config: AgentConfig) {
    // Convert our AgentConfig to MPLP AgentConfig
    const mplpConfig: MPLPAgentConfig = {
      id: config.id,
      name: config.name,
      description: `${config.type} agent`,
      capabilities: ['monitoring', 'data_analysis'],
      metadata: config.metadata
    };
    super(mplpConfig);
    this.metricsInterval = appConfig.monitoring.interval;
    this.alertThresholds = this.initializeAlertThresholds();
    this.metricsHistory = new Map();
    
    if (appConfig.monitoring.enabled) {
      this.startMonitoring();
    }
  }

  public async sendMessage(message: MonitoringAgentInput): Promise<void> {
    try {
      const result = await this.collectMetrics(message);
      this.emit('metrics_collected', {
        timeWindow: message.timeWindow,
        result,
        timestamp: new Date()
      });
    } catch (error) {
      this.emit('monitoring_error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      });
      throw error;
    }
  }

  public async execute(action: string, parameters: MonitoringAgentInput): Promise<MonitoringAgentOutput> {
    switch (action) {
      case 'collect_metrics':
        return await this.collectMetrics(parameters);
      case 'generate_report':
        return await this.generateReport(parameters);
      case 'check_alerts':
        return await this.checkAlerts(parameters);
      case 'get_health_score':
        return await this.getHealthScore(parameters);
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }

  private async collectMetrics(input: MonitoringAgentInput): Promise<MonitoringAgentOutput> {
    const { timeWindow, metrics = [], filters = {} } = input;
    
    // Collect workflow metrics
    const workflowMetrics = await this.collectWorkflowMetrics(timeWindow, filters);
    
    // Collect agent performance metrics
    const agentMetrics = await this.collectAgentMetrics(timeWindow, filters);
    
    // Collect system metrics
    const systemMetrics = await this.collectSystemMetrics(timeWindow);
    
    // Combine all metrics
    const allMetrics = {
      ...workflowMetrics,
      ...agentMetrics,
      ...systemMetrics
    };
    
    // Filter requested metrics if specified
    const filteredMetrics = metrics.length > 0 ? 
      this.filterMetrics(allMetrics, metrics) : 
      allMetrics;
    
    // Store metrics in history
    this.storeMetricsHistory(filteredMetrics, timeWindow.end);
    
    // Check for alerts
    const alerts = this.checkMetricAlerts(filteredMetrics);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(filteredMetrics, alerts);
    
    // Calculate health score
    const healthScore = this.calculateHealthScore(filteredMetrics);
    
    return {
      metrics: filteredMetrics,
      alerts,
      recommendations,
      healthScore
    };
  }

  private async generateReport(input: MonitoringAgentInput): Promise<MonitoringAgentOutput> {
    const result = await this.collectMetrics(input);
    
    // Add trend analysis
    const trends = this.analyzeTrends(input.timeWindow);
    
    // Add comparative analysis
    const comparison = this.compareWithPreviousPeriod(input.timeWindow);
    
    // Enhanced recommendations with trends
    const enhancedRecommendations = [
      ...result.recommendations,
      ...this.generateTrendBasedRecommendations(trends),
      ...this.generateComparisonBasedRecommendations(comparison)
    ];
    
    return {
      ...result,
      recommendations: enhancedRecommendations,
      metadata: {
        trends,
        comparison,
        reportGeneratedAt: new Date().toISOString()
      }
    };
  }

  private async checkAlerts(input: MonitoringAgentInput): Promise<MonitoringAgentOutput> {
    const result = await this.collectMetrics(input);
    
    // Focus on alerts only
    const criticalAlerts = result.alerts.filter(alert => alert.type === 'critical');
    const warningAlerts = result.alerts.filter(alert => alert.type === 'warning');
    
    return {
      metrics: {},
      alerts: result.alerts,
      recommendations: this.generateAlertBasedRecommendations(criticalAlerts, warningAlerts),
      healthScore: result.healthScore
    };
  }

  private async getHealthScore(input: MonitoringAgentInput): Promise<MonitoringAgentOutput> {
    const result = await this.collectMetrics(input);
    
    return {
      metrics: { healthScore: result.healthScore },
      alerts: result.alerts.filter(alert => alert.type === 'critical'),
      recommendations: result.healthScore < 0.7 ? 
        ['System health is below optimal. Review critical alerts and performance metrics.'] : 
        ['System health is good.'],
      healthScore: result.healthScore
    };
  }

  private async collectWorkflowMetrics(timeWindow: { start: Date; end: Date }, filters: Record<string, unknown>): Promise<Record<string, number>> {
    // Simulate workflow metrics collection
    const baseMetrics = {
      totalTickets: Math.floor(Math.random() * 1000) + 500,
      resolvedTickets: Math.floor(Math.random() * 800) + 400,
      escalatedTickets: Math.floor(Math.random() * 100) + 20,
      averageResolutionTime: Math.random() * 60 + 15, // 15-75 minutes
      customerSatisfaction: Math.random() * 2 + 3, // 3-5 scale
      automationRate: Math.random() * 0.3 + 0.6 // 60-90%
    };
    
    // Apply filters if any
    if (filters.category) {
      // Simulate category-specific metrics
      baseMetrics.totalTickets = Math.floor(baseMetrics.totalTickets * 0.3);
      baseMetrics.resolvedTickets = Math.floor(baseMetrics.resolvedTickets * 0.3);
    }
    
    return baseMetrics;
  }

  private async collectAgentMetrics(timeWindow: { start: Date; end: Date }, filters: Record<string, unknown>): Promise<Record<string, number>> {
    // Simulate agent performance metrics
    return {
      classificationAccuracy: Math.random() * 0.2 + 0.8, // 80-100%
      responseGenerationTime: Math.random() * 5 + 2, // 2-7 seconds
      escalationAccuracy: Math.random() * 0.3 + 0.7, // 70-100%
      agentUtilization: Math.random() * 0.4 + 0.5, // 50-90%
      errorRate: Math.random() * 0.05, // 0-5%
      throughput: Math.floor(Math.random() * 100) + 50 // 50-150 tasks/hour
    };
  }

  private async collectSystemMetrics(timeWindow: { start: Date; end: Date }): Promise<Record<string, number>> {
    // Simulate system performance metrics
    return {
      cpuUsage: Math.random() * 0.4 + 0.3, // 30-70%
      memoryUsage: Math.random() * 0.3 + 0.4, // 40-70%
      responseTime: Math.random() * 200 + 100, // 100-300ms
      errorRate: Math.random() * 0.02, // 0-2%
      uptime: 0.999, // 99.9%
      concurrentConnections: Math.floor(Math.random() * 500) + 100 // 100-600
    };
  }

  private filterMetrics(allMetrics: Record<string, number>, requestedMetrics: string[]): Record<string, number> {
    const filtered: Record<string, number> = {};
    
    for (const metric of requestedMetrics) {
      if (allMetrics[metric] !== undefined) {
        filtered[metric] = allMetrics[metric];
      }
    }
    
    return filtered;
  }

  private storeMetricsHistory(metrics: Record<string, number>, timestamp: Date): void {
    for (const [metricName, value] of Object.entries(metrics)) {
      if (!this.metricsHistory.has(metricName)) {
        this.metricsHistory.set(metricName, []);
      }
      
      const history = this.metricsHistory.get(metricName)!;
      history.push({ timestamp, value });
      
      // Keep only last 100 data points
      if (history.length > 100) {
        history.shift();
      }
    }
  }

  private checkMetricAlerts(metrics: Record<string, number>): MonitoringAlert[] {
    const alerts: MonitoringAlert[] = [];
    
    for (const [metricName, value] of Object.entries(metrics)) {
      const threshold = this.alertThresholds.get(metricName);
      if (!threshold) continue;
      
      let alertType: MonitoringAlert['type'] | null = null;
      
      if (threshold.critical && this.exceedsThreshold(value, threshold.critical, threshold.direction)) {
        alertType = 'critical';
      } else if (threshold.warning && this.exceedsThreshold(value, threshold.warning, threshold.direction)) {
        alertType = 'warning';
      }
      
      if (alertType) {
        alerts.push({
          id: `alert_${metricName}_${Date.now()}`,
          type: alertType,
          message: `${metricName} ${threshold.direction === 'above' ? 'exceeds' : 'below'} ${alertType} threshold`,
          metric: metricName,
          threshold: alertType === 'critical' ? threshold.critical! : threshold.warning!,
          currentValue: value,
          timestamp: new Date(),
          resolved: false
        });
      }
    }
    
    return alerts;
  }

  private exceedsThreshold(value: number, threshold: number, direction: 'above' | 'below'): boolean {
    return direction === 'above' ? value > threshold : value < threshold;
  }

  private generateRecommendations(metrics: Record<string, number>, alerts: MonitoringAlert[]): string[] {
    const recommendations: string[] = [];
    
    // Critical alerts recommendations
    const criticalAlerts = alerts.filter(alert => alert.type === 'critical');
    if (criticalAlerts.length > 0) {
      recommendations.push('Immediate attention required: Critical alerts detected');
    }
    
    // Performance recommendations
    if (metrics.automationRate && metrics.automationRate < 0.7) {
      recommendations.push('Consider improving automation rules to increase automation rate');
    }
    
    if (metrics.averageResolutionTime && metrics.averageResolutionTime > 60) {
      recommendations.push('Average resolution time is high. Review workflow efficiency');
    }
    
    if (metrics.customerSatisfaction && metrics.customerSatisfaction < 3.5) {
      recommendations.push('Customer satisfaction is below target. Review response quality');
    }
    
    if (metrics.escalationAccuracy && metrics.escalationAccuracy < 0.8) {
      recommendations.push('Escalation accuracy is low. Review escalation criteria');
    }
    
    // System recommendations
    if (metrics.cpuUsage && metrics.cpuUsage > 0.8) {
      recommendations.push('High CPU usage detected. Consider scaling resources');
    }
    
    if (metrics.errorRate && metrics.errorRate > 0.03) {
      recommendations.push('Error rate is elevated. Review system logs for issues');
    }
    
    return recommendations;
  }

  private calculateHealthScore(metrics: Record<string, number>): number {
    const weights: Record<string, number> = {
      automationRate: 0.2,
      customerSatisfaction: 0.2,
      escalationAccuracy: 0.15,
      classificationAccuracy: 0.15,
      uptime: 0.1,
      errorRate: 0.1,
      responseTime: 0.1
    };
    
    let totalScore = 0;
    let totalWeight = 0;
    
    for (const [metric, weight] of Object.entries(weights)) {
      if (metrics[metric] !== undefined) {
        const normalizedScore = this.normalizeMetricScore(metric, metrics[metric]);
        totalScore += normalizedScore * weight;
        totalWeight += weight;
      }
    }
    
    return totalWeight > 0 ? totalScore / totalWeight : 0.5;
  }

  private normalizeMetricScore(metric: string, value: number): number {
    // Normalize different metrics to 0-1 scale
    switch (metric) {
      case 'automationRate':
      case 'escalationAccuracy':
      case 'classificationAccuracy':
      case 'uptime':
        return value; // Already 0-1
      
      case 'customerSatisfaction':
        return (value - 1) / 4; // Convert 1-5 scale to 0-1
      
      case 'errorRate':
        return Math.max(0, 1 - value * 20); // Lower error rate = higher score
      
      case 'responseTime':
        return Math.max(0, 1 - value / 1000); // Lower response time = higher score
      
      default:
        return 0.5; // Default neutral score
    }
  }

  private analyzeTrends(timeWindow: { start: Date; end: Date }): Record<string, string> {
    // Simulate trend analysis
    return {
      automationRate: 'increasing',
      customerSatisfaction: 'stable',
      averageResolutionTime: 'decreasing',
      errorRate: 'stable'
    };
  }

  private compareWithPreviousPeriod(timeWindow: { start: Date; end: Date }): Record<string, number> {
    // Simulate comparison with previous period (percentage change)
    return {
      totalTickets: 5.2, // 5.2% increase
      resolvedTickets: 8.1, // 8.1% increase
      automationRate: 2.3, // 2.3% increase
      customerSatisfaction: -1.5 // 1.5% decrease
    };
  }

  private generateTrendBasedRecommendations(trends: Record<string, string>): string[] {
    const recommendations: string[] = [];
    
    for (const [metric, trend] of Object.entries(trends)) {
      if (trend === 'decreasing' && metric === 'customerSatisfaction') {
        recommendations.push('Customer satisfaction is trending down. Investigate recent changes');
      }
      if (trend === 'increasing' && metric === 'errorRate') {
        recommendations.push('Error rate is trending up. Monitor system stability');
      }
    }
    
    return recommendations;
  }

  private generateComparisonBasedRecommendations(comparison: Record<string, number>): string[] {
    const recommendations: string[] = [];
    
    for (const [metric, change] of Object.entries(comparison)) {
      if (Math.abs(change) > 10) {
        recommendations.push(`${metric} has changed significantly (${change > 0 ? '+' : ''}${change.toFixed(1)}%) compared to previous period`);
      }
    }
    
    return recommendations;
  }

  private generateAlertBasedRecommendations(criticalAlerts: MonitoringAlert[], warningAlerts: MonitoringAlert[]): string[] {
    const recommendations: string[] = [];
    
    if (criticalAlerts.length > 0) {
      recommendations.push(`${criticalAlerts.length} critical alert(s) require immediate attention`);
    }
    
    if (warningAlerts.length > 3) {
      recommendations.push(`${warningAlerts.length} warning alerts detected. Review system performance`);
    }
    
    return recommendations;
  }

  private startMonitoring(): void {
    this.monitoringTimer = setInterval(async () => {
      try {
        const now = new Date();
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
        
        const result = await this.collectMetrics({
          timeWindow: { start: oneHourAgo, end: now }
        });
        
        // Emit monitoring update
        this.emit('monitoring_update', {
          metrics: result.metrics,
          alerts: result.alerts,
          healthScore: result.healthScore,
          timestamp: now
        });
        
      } catch (error) {
        this.emit('monitoring_error', {
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date()
        });
      }
    }, this.metricsInterval);
  }

  public stopMonitoring(): void {
    if (this.monitoringTimer) {
      clearInterval(this.monitoringTimer);
      this.monitoringTimer = undefined;
    }
  }

  private initializeAlertThresholds(): Map<string, AlertThreshold> {
    const thresholds = new Map<string, AlertThreshold>();
    
    thresholds.set('automationRate', {
      warning: 0.7,
      critical: 0.5,
      direction: 'below'
    });
    
    thresholds.set('customerSatisfaction', {
      warning: 3.5,
      critical: 3.0,
      direction: 'below'
    });
    
    thresholds.set('errorRate', {
      warning: 0.03,
      critical: 0.05,
      direction: 'above'
    });
    
    thresholds.set('responseTime', {
      warning: 500,
      critical: 1000,
      direction: 'above'
    });
    
    thresholds.set('cpuUsage', {
      warning: 0.8,
      critical: 0.9,
      direction: 'above'
    });
    
    thresholds.set('memoryUsage', {
      warning: 0.8,
      critical: 0.9,
      direction: 'above'
    });
    
    return thresholds;
  }
}

// Supporting interfaces
interface AlertThreshold {
  readonly warning?: number;
  readonly critical?: number;
  readonly direction: 'above' | 'below';
}

interface MetricDataPoint {
  readonly timestamp: Date;
  readonly value: number;
}
