/**
 * CoreOrchestrator - MPLP生态系统中央协调器
 * L3执行层的核心实现
 * 职责：统一协调9个L2模块，实现完整的工作流编排
 */

import { CoreOrchestrationService } from '../../application/services/core-orchestration.service';
import { CoreResourceService } from '../../application/services/core-resource.service';
import { CoreMonitoringService } from '../../application/services/core-monitoring.service';
import {
  UUID,
  WorkflowConfig,
  WorkflowStatusType,
  Priority
} from '../../types';

// ===== L3管理器接口定义 =====

export interface SecurityManager {
  validateWorkflowExecution(contextId: string, workflowConfig: WorkflowConfig): Promise<void>;
  validateModuleAccess(moduleId: string, operation: string): Promise<boolean>;
}

export interface PerformanceMonitor {
  startTimer(operation: string): PerformanceTimer;
  recordMetric(name: string, value: number): void;
  getMetrics(): Promise<Record<string, number>>;
}

export interface PerformanceTimer {
  stop(): number;
  elapsed(): number;
}

export interface EventBusManager {
  publish(event: string, data: Record<string, unknown>): Promise<void>;
  subscribe(event: string, handler: (data: Record<string, unknown>) => void): void;
}

export interface ErrorHandler {
  handleError(error: Error, context: Record<string, unknown>): Promise<void>;
  createErrorReport(error: Error): ErrorReport;
}

export interface ErrorReport {
  errorId: string;
  message: string;
  stack?: string;
  context: Record<string, unknown>;
  timestamp: string;
}

export interface CoordinationManager {
  coordinateModules(modules: string[], operation: string): Promise<CoordinationResult>;
  validateCoordination(sourceModule: string, targetModule: string): Promise<boolean>;
}

export interface CoordinationResult {
  success: boolean;
  results: Record<string, unknown>;
  errors?: string[];
  executionTime: number;
}

export interface OrchestrationManager {
  createOrchestrationPlan(workflowConfig: WorkflowConfig): Promise<OrchestrationPlan>;
  executeOrchestrationPlan(plan: OrchestrationPlan): Promise<OrchestrationResult>;
}

export interface OrchestrationPlan {
  planId: string;
  stages: OrchestrationStage[];
  dependencies: Record<string, string[]>;
  estimatedDuration: number;
}

export interface OrchestrationStage {
  stageId: string;
  moduleName: string;
  operation: string;
  parameters: Record<string, unknown>;
  timeout: number;
}

export interface OrchestrationResult {
  planId: string;
  status: 'completed' | 'failed' | 'partial';
  stageResults: Record<string, StageExecutionResult>;
  totalDuration: number;
}

export interface StageExecutionResult {
  status: 'completed' | 'failed' | 'skipped';
  result?: Record<string, unknown>;
  error?: string;
  duration: number;
}

export interface StateSyncManager {
  syncState(moduleId: string, state: Record<string, unknown>): Promise<void>;
  getState(moduleId: string): Promise<Record<string, unknown>>;
  validateStateConsistency(): Promise<boolean>;
}

export interface TransactionManager {
  beginTransaction(): Promise<Transaction>;
  commitTransaction(transaction: Transaction): Promise<void>;
  rollbackTransaction(transaction: Transaction): Promise<void>;
}

export interface Transaction {
  transactionId: string;
  startTime: string;
  operations: TransactionOperation[];
}

export interface TransactionOperation {
  operationId: string;
  moduleId: string;
  operation: string;
  parameters: Record<string, unknown>;
  status: 'pending' | 'completed' | 'failed';
}

export interface ProtocolVersionManager {
  validateProtocolVersion(version: string): boolean;
  getCompatibleVersions(): string[];
  upgradeProtocol(fromVersion: string, toVersion: string): Promise<void>;
}

// ===== 工作流执行相关类型 =====

export interface WorkflowExecutionRequest {
  contextId: string;
  workflowConfig: WorkflowConfig;
  priority?: Priority;
  metadata?: Record<string, unknown>;
}

export interface WorkflowResult {
  workflowId: UUID;
  executionId: UUID;
  status: WorkflowStatusType;
  startTime: string;
  endTime?: string;
  duration?: number;
  stageResults: Record<string, StageExecutionResult>;
  metadata?: Record<string, unknown>;
  performanceMetrics?: {
    totalExecutionTime: number;
    moduleCoordinationTime: number;
    resourceAllocationTime: number;
    averageStageTime: number;
  };
}

/**
 * CoreOrchestrator类
 * MPLP生态系统的中央协调器，实现L3执行层的核心功能
 */
export class CoreOrchestrator {
  constructor(
    private readonly orchestrationService: CoreOrchestrationService,
    private readonly resourceService: CoreResourceService,
    private readonly monitoringService: CoreMonitoringService,
    // 9个L3管理器注入
    private readonly securityManager: SecurityManager,
    private readonly performanceMonitor: PerformanceMonitor,
    private readonly eventBusManager: EventBusManager,
    private readonly errorHandler: ErrorHandler,
    private readonly coordinationManager: CoordinationManager,
    private readonly orchestrationManager: OrchestrationManager,
    private readonly stateSyncManager: StateSyncManager,
    private readonly transactionManager: TransactionManager,
    private readonly protocolVersionManager: ProtocolVersionManager
  ) {}

  /**
   * 执行完整工作流
   * 这是CoreOrchestrator的核心方法，协调整个MPLP生态系统
   */
  async executeWorkflow(request: WorkflowExecutionRequest): Promise<WorkflowResult> {
    const workflowId = this.generateWorkflowId();
    const executionId = this.generateExecutionId();
    const startTime = new Date().toISOString();

    // 1. 安全验证
    await this.securityManager.validateWorkflowExecution(request.contextId, request.workflowConfig);

    // 2. 性能监控开始
    const performanceTimer = this.performanceMonitor.startTimer('workflow_execution');

    // 3. 开始事务
    const transaction = await this.transactionManager.beginTransaction();

    try {
      // 4. 创建编排计划
      const orchestrationPlan = await this.orchestrationManager.createOrchestrationPlan(request.workflowConfig);

      // 5. 分配系统资源
      const resourceAllocation = await this.resourceService.allocateResources(executionId, {
        cpuCores: 4,
        memoryMb: 2048,
        diskSpaceMb: 1024,
        networkBandwidthMbps: 100,
        priority: request.priority || 'medium',
        estimatedDurationMs: orchestrationPlan.estimatedDuration
      });

      // 6. 发布工作流开始事件
      await this.eventBusManager.publish('workflow_started', {
        workflowId,
        executionId,
        contextId: request.contextId,
        stages: request.workflowConfig.stages,
        timestamp: startTime
      });

      // 7. 执行编排计划
      const orchestrationResult = await this.orchestrationManager.executeOrchestrationPlan(orchestrationPlan);

      // 8. 同步状态
      await this.stateSyncManager.validateStateConsistency();

      // 9. 提交事务
      await this.transactionManager.commitTransaction(transaction);

      // 10. 释放资源
      await this.resourceService.releaseResources(resourceAllocation.allocationId);

      // 11. 记录性能指标
      const totalExecutionTime = performanceTimer.stop();
      this.performanceMonitor.recordMetric('workflow_execution_time', totalExecutionTime);

      // 12. 发布工作流完成事件
      await this.eventBusManager.publish('workflow_completed', {
        workflowId,
        executionId,
        status: orchestrationResult.status,
        duration: totalExecutionTime,
        timestamp: new Date().toISOString()
      });

      const endTime = new Date().toISOString();

      return {
        workflowId,
        executionId,
        status: orchestrationResult.status === 'completed' ? 'completed' : 'failed',
        startTime,
        endTime,
        duration: totalExecutionTime,
        stageResults: orchestrationResult.stageResults,
        metadata: request.metadata,
        performanceMetrics: {
          totalExecutionTime,
          moduleCoordinationTime: orchestrationResult.totalDuration * 0.6,
          resourceAllocationTime: orchestrationResult.totalDuration * 0.2,
          averageStageTime: orchestrationResult.totalDuration / request.workflowConfig.stages.length
        }
      };

    } catch (error) {
      // 错误处理
      await this.handleWorkflowError(error as Error, {
        workflowId,
        executionId,
        contextId: request.contextId,
        transaction
      });

      // 回滚事务
      await this.transactionManager.rollbackTransaction(transaction);

      // 重新抛出错误，让调用者处理
      throw error;
    }
  }

  /**
   * 协调多个模块操作
   * 实现跨模块的统一协调
   */
  async coordinateModules(
    modules: string[],
    operation: string,
    _parameters: Record<string, unknown>
  ): Promise<CoordinationResult> {
    // 1. 验证模块协调权限
    for (const module of modules) {
      const hasAccess = await this.securityManager.validateModuleAccess(module, operation);
      if (!hasAccess) {
        throw new Error(`Access denied for module: ${module}`);
      }
    }

    // 2. 执行模块协调
    const result = await this.coordinationManager.coordinateModules(modules, operation);

    // 3. 发布协调事件
    await this.eventBusManager.publish('modules_coordinated', {
      modules,
      operation,
      result: result.success,
      timestamp: new Date().toISOString()
    });

    return result;
  }

  /**
   * 获取系统整体状态
   * 提供MPLP生态系统的综合状态视图
   */
  async getSystemStatus(): Promise<{
    overall: 'healthy' | 'degraded' | 'unhealthy' | 'critical';
    modules: Record<string, string>;
    resources: Record<string, number>;
    performance: Record<string, number>;
    timestamp: string;
  }> {
    // 1. 获取健康状态
    const healthStatus = await this.monitoringService.performHealthCheck();

    // 2. 获取性能指标
    const performanceMetrics = await this.performanceMonitor.getMetrics();

    // 3. 获取资源使用情况
    const resourceStats = await this.resourceService.getResourceUsageStatistics();

    return {
      overall: healthStatus.overall,
      modules: Object.fromEntries(
        healthStatus.modules.map(module => [module.moduleId, module.status])
      ),
      resources: {
        cpu: resourceStats.resourceUtilization.cpu,
        memory: resourceStats.resourceUtilization.memory,
        disk: resourceStats.resourceUtilization.disk,
        network: resourceStats.resourceUtilization.network
      },
      performance: performanceMetrics,
      timestamp: new Date().toISOString()
    };
  }

  // ===== 私有辅助方法 =====

  /**
   * 生成工作流ID
   */
  private generateWorkflowId(): UUID {
    return `workflow-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * 生成执行ID
   */
  private generateExecutionId(): UUID {
    return `exec-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * 处理工作流错误
   */
  private async handleWorkflowError(
    error: Error,
    context: {
      workflowId: UUID;
      executionId: UUID;
      contextId: string;
      transaction: Transaction;
    }
  ): Promise<void> {
    // 1. 创建错误报告
    const errorReport = this.errorHandler.createErrorReport(error);

    // 2. 处理错误
    await this.errorHandler.handleError(error, {
      workflowId: context.workflowId,
      executionId: context.executionId,
      contextId: context.contextId,
      transactionId: context.transaction.transactionId
    });

    // 3. 发布错误事件
    await this.eventBusManager.publish('workflow_error', {
      workflowId: context.workflowId,
      executionId: context.executionId,
      error: errorReport,
      timestamp: new Date().toISOString()
    });

    // 4. 记录错误指标
    this.performanceMonitor.recordMetric('workflow_error_count', 1);
  }
}
