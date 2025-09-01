/**
 * Context服务协调器 - GLFB反馈循环实现
 * 
 * @description 基于GLFB反馈循环机制，协调3个核心服务的协作和数据流
 * 演示：ContextManagementService、ContextAnalyticsService、ContextSecurityService的统一协调
 * @version 2.0.0
 * @layer 应用层 - 协调器
 * @refactor 17→3服务简化后的统一协调机制
 */

import { ContextManagementService } from '../services/context-management.service';
import { ContextAnalyticsService } from '../services/context-analytics.service';
import { ContextSecurityService } from '../services/context-security.service';
import { ContextEntity } from '../../domain/entities/context.entity';
import { UUID } from '../../../../shared/types';
import { CreateContextData } from '../../types';

// ===== 协调器接口定义 =====
export interface ContextOperationResult {
  success: boolean;
  contextId: UUID;
  operation: string;
  timestamp: Date;
  data?: ContextEntity | Record<string, string | number | boolean | Date>;
  errors?: string[];
  warnings?: string[];
  performance?: {
    duration: number;
    servicesInvolved: string[];
  };
}

export interface ContextHealthCheck {
  contextId: UUID;
  overallHealth: 'healthy' | 'warning' | 'critical';
  managementHealth: 'healthy' | 'warning' | 'critical';
  analyticsHealth: 'healthy' | 'warning' | 'critical';
  securityHealth: 'healthy' | 'warning' | 'critical';
  recommendations: string[];
  lastChecked: Date;
}

// 使用从types模块导入的CreateContextData类型

export interface ILogger {
  info(message: string, meta?: Record<string, unknown>): void;
  warn(message: string, meta?: Record<string, unknown>): void;
  error(message: string, error?: Error, meta?: Record<string, unknown>): void;
  debug(message: string, meta?: Record<string, unknown>): void;
}

/**
 * Context服务协调器
 * 
 * @description 实现GLFB反馈循环机制，协调3个核心服务的协作
 * 职责：服务协调、数据流管理、错误处理、性能监控、健康检查
 */
export class ContextServicesCoordinator {
  
  constructor(
    private readonly managementService: ContextManagementService,
    private readonly analyticsService: ContextAnalyticsService,
    private readonly securityService: ContextSecurityService,
    private readonly logger: ILogger
  ) {}

  // ===== 全局协调操作 - GLFB全局维度 =====

  /**
   * 创建上下文 - 全服务协调
   * 实现GLFB全局反馈：Management → Security → Analytics 的协调流程
   */
  async createContextWithFullCoordination(
    data: CreateContextData,
    userId: UUID
  ): Promise<ContextOperationResult> {
    const startTime = Date.now();
    const operation = 'create_context_coordinated';
    const servicesInvolved: string[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      this.logger.info('Starting coordinated context creation', { 
        name: data.name, 
        userId 
      });

      // 1. 安全预检查 (Security Service)
      servicesInvolved.push('ContextSecurityService');
      const canCreate = await this.securityService.validateAccess(
        'system' as UUID, // 系统级操作
        userId,
        'create'
      );

      if (!canCreate) {
        errors.push('User does not have permission to create contexts');
        return this.createErrorResult(operation, errors, servicesInvolved, startTime);
      }

      // 2. 创建上下文 (Management Service)
      servicesInvolved.push('ContextManagementService');
      const context = await this.managementService.createContext(data);

      // 3. 初始化搜索索引 (Analytics Service)
      servicesInvolved.push('ContextAnalyticsService');
      try {
        await this.analyticsService.updateSearchIndex(context.contextId);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        warnings.push(`Failed to initialize search index: ${errorMessage}`);
        this.logger.warn('Search index initialization failed', {
          contextId: context.contextId,
          error: errorMessage
        });
      }

      // 4. 应用默认安全策略 (Security Service)
      try {
        await this.securityService.applySecurityPolicy(context.contextId, {
          id: 'default-policy',
          type: 'access_control',
          name: 'Default Access Control',
          rules: [
            { condition: 'user.authenticated', action: 'allow' },
            { condition: 'user.role.admin', action: 'allow' }
          ],
          enabled: true
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        warnings.push(`Failed to apply default security policy: ${errorMessage}`);
        this.logger.warn('Default security policy application failed', {
          contextId: context.contextId,
          error: errorMessage
        });
      }

      const duration = Date.now() - startTime;
      
      this.logger.info('Coordinated context creation completed', { 
        contextId: context.contextId,
        duration,
        servicesInvolved: servicesInvolved.length,
        warnings: warnings.length
      });

      return {
        success: true,
        contextId: context.contextId,
        operation,
        timestamp: new Date(),
        data: context,
        warnings: warnings.length > 0 ? warnings : undefined,
        performance: {
          duration,
          servicesInvolved
        }
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      errors.push(errorMessage);
      this.logger.error('Coordinated context creation failed', error as Error, {
        name: data.name,
        userId,
        servicesInvolved
      });

      return this.createErrorResult(operation, errors, servicesInvolved, startTime);
    }
  }

  // ===== 局部协调操作 - GLFB局部维度 =====

  /**
   * 上下文健康检查 - 跨服务状态验证
   * 实现GLFB局部反馈：各服务独立检查 → 综合评估
   */
  async performHealthCheck(contextId: UUID): Promise<ContextHealthCheck> {
    try {
      this.logger.info('Performing context health check', { contextId });

      // 并行执行各服务的健康检查
      const [managementHealth, analyticsHealth, securityHealth] = await Promise.allSettled([
        this.checkManagementHealth(contextId),
        this.checkAnalyticsHealth(contextId),
        this.checkSecurityHealth(contextId)
      ]);

      // 评估各服务健康状态
      const mgmtStatus = managementHealth.status === 'fulfilled' ? 
        managementHealth.value : 'critical';
      const analyticsStatus = analyticsHealth.status === 'fulfilled' ? 
        analyticsHealth.value : 'critical';
      const securityStatus = securityHealth.status === 'fulfilled' ? 
        securityHealth.value : 'critical';

      // 计算整体健康状态
      const overallHealth = this.calculateOverallHealth(mgmtStatus, analyticsStatus, securityStatus);

      // 生成建议
      const recommendations = this.generateHealthRecommendations(
        mgmtStatus, 
        analyticsStatus, 
        securityStatus
      );

      const healthCheck: ContextHealthCheck = {
        contextId,
        overallHealth,
        managementHealth: mgmtStatus,
        analyticsHealth: analyticsStatus,
        securityHealth: securityStatus,
        recommendations,
        lastChecked: new Date()
      };

      this.logger.info('Context health check completed', { 
        contextId, 
        overallHealth,
        recommendationsCount: recommendations.length 
      });

      return healthCheck;

    } catch (error) {
      this.logger.error('Context health check failed', error as Error, { contextId });
      
      return {
        contextId,
        overallHealth: 'critical',
        managementHealth: 'critical',
        analyticsHealth: 'critical',
        securityHealth: 'critical',
        recommendations: ['System health check failed - investigate immediately'],
        lastChecked: new Date()
      };
    }
  }

  // ===== 反馈循环操作 - GLFB反馈循环 =====

  /**
   * 上下文优化建议 - 基于跨服务分析
   * 实现GLFB反馈循环：分析 → 建议 → 应用 → 验证
   */
  async generateOptimizationRecommendations(contextId: UUID): Promise<{
    contextId: UUID;
    recommendations: Array<{
      category: 'performance' | 'security' | 'usage' | 'maintenance';
      priority: 'high' | 'medium' | 'low';
      description: string;
      action: string;
      estimatedImpact: string;
    }>;
    generatedAt: Date;
  }> {
    try {
      this.logger.info('Generating optimization recommendations', { contextId });

      // 1. 收集各服务的分析数据
      const [analysis, securityAudit] = await Promise.all([
        this.analyticsService.analyzeContext(contextId),
        this.securityService.performSecurityAudit(contextId)
      ]);

      const recommendations = [];

      // 2. 基于性能分析生成建议
      if (analysis.performance.responseTime.average > 100) {
        recommendations.push({
          category: 'performance' as const,
          priority: 'high' as const,
          description: 'Response time exceeds target (100ms)',
          action: 'Optimize database queries and implement better caching',
          estimatedImpact: 'Reduce response time by 30-50%'
        });
      }

      if (analysis.performance.cacheMetrics.hitRate < 0.8) {
        recommendations.push({
          category: 'performance' as const,
          priority: 'medium' as const,
          description: 'Cache hit rate below optimal threshold (80%)',
          action: 'Review cache strategy and increase TTL for stable data',
          estimatedImpact: 'Improve cache hit rate to 85%+'
        });
      }

      // 3. 基于安全审计生成建议
      if (securityAudit.securityScore < 80) {
        recommendations.push({
          category: 'security' as const,
          priority: 'high' as const,
          description: `Security score below target (${securityAudit.securityScore}/100)`,
          action: 'Review access controls and implement additional security measures',
          estimatedImpact: 'Improve security score to 85%+'
        });
      }

      // 4. 基于使用情况生成建议
      if (analysis.usage.accessCount < 10) {
        recommendations.push({
          category: 'usage' as const,
          priority: 'low' as const,
          description: 'Low usage detected - context may be underutilized',
          action: 'Review context visibility and user onboarding process',
          estimatedImpact: 'Increase user engagement by 20%+'
        });
      }

      // 5. 基于维护需求生成建议
      const context = await this.managementService.getContext(contextId);
      if (context && this.isMaintenanceNeeded(context)) {
        recommendations.push({
          category: 'maintenance' as const,
          priority: 'medium' as const,
          description: 'Context requires routine maintenance',
          action: 'Schedule maintenance window for optimization and cleanup',
          estimatedImpact: 'Improve overall system stability'
        });
      }

      this.logger.info('Optimization recommendations generated', { 
        contextId, 
        recommendationsCount: recommendations.length 
      });

      return {
        contextId,
        recommendations,
        generatedAt: new Date()
      };

    } catch (error) {
      this.logger.error('Failed to generate optimization recommendations', error as Error, { contextId });
      throw error;
    }
  }

  // ===== 私有辅助方法 =====

  private async checkManagementHealth(contextId: UUID): Promise<'healthy' | 'warning' | 'critical'> {
    try {
      const context = await this.managementService.getContext(contextId);
      return context ? 'healthy' : 'critical';
    } catch {
      return 'critical';
    }
  }

  private async checkAnalyticsHealth(contextId: UUID): Promise<'healthy' | 'warning' | 'critical'> {
    try {
      const performance = await this.analyticsService.analyzePerformance(contextId);
      return performance.responseTime.average < 200 ? 'healthy' : 'warning';
    } catch {
      return 'critical';
    }
  }

  private async checkSecurityHealth(contextId: UUID): Promise<'healthy' | 'warning' | 'critical'> {
    try {
      const audit = await this.securityService.performSecurityAudit(contextId);
      if (audit.securityScore >= 80) return 'healthy';
      if (audit.securityScore >= 60) return 'warning';
      return 'critical';
    } catch {
      return 'critical';
    }
  }

  private calculateOverallHealth(
    mgmt: 'healthy' | 'warning' | 'critical',
    analytics: 'healthy' | 'warning' | 'critical',
    security: 'healthy' | 'warning' | 'critical'
  ): 'healthy' | 'warning' | 'critical' {
    const scores = { healthy: 3, warning: 2, critical: 1 };
    const totalScore = scores[mgmt] + scores[analytics] + scores[security];
    
    if (totalScore >= 8) return 'healthy';
    if (totalScore >= 6) return 'warning';
    return 'critical';
  }

  private generateHealthRecommendations(
    mgmt: 'healthy' | 'warning' | 'critical',
    analytics: 'healthy' | 'warning' | 'critical',
    security: 'healthy' | 'warning' | 'critical'
  ): string[] {
    const recommendations: string[] = [];
    
    if (mgmt === 'critical') recommendations.push('Investigate context management service issues');
    if (analytics === 'critical') recommendations.push('Review analytics service configuration');
    if (security === 'critical') recommendations.push('Address security vulnerabilities immediately');
    
    if (mgmt === 'warning') recommendations.push('Monitor context management performance');
    if (analytics === 'warning') recommendations.push('Optimize analytics queries and caching');
    if (security === 'warning') recommendations.push('Review and update security policies');
    
    return recommendations;
  }

  private isMaintenanceNeeded(context: ContextEntity): boolean {
    if (!context.updatedAt) return false;

    const daysSinceUpdate = Math.floor(
      (Date.now() - context.updatedAt.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysSinceUpdate > 30; // 30天未更新需要维护
  }

  private createErrorResult(
    operation: string,
    errors: string[],
    servicesInvolved: string[],
    startTime: number
  ): ContextOperationResult {
    return {
      success: false,
      contextId: 'unknown' as UUID,
      operation,
      timestamp: new Date(),
      errors,
      performance: {
        duration: Date.now() - startTime,
        servicesInvolved
      }
    };
  }
}
