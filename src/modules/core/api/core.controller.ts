/**
 * Core协议API控制器
 * @description 提供Core协议的HTTP API接口
 * @author MPLP Team
 * @version 1.0.0
 */

import { Logger } from '../../../public/utils/logger';
import { validateCoreProtocol } from '../../../schemas/index';
import { CoreOrchestratorService } from '../application/services/core-orchestrator.service';
import {
  WorkflowConfig,
  ExecutionContext,
  OperationResult,
  WorkflowExecutionResult,
  ExecutionStatus,
  WorkflowStage,
  StageStatus,
  Priority,
  ExecutionMode
} from '../types';

/**
 * 工作流执行请求接口
 */
export interface ExecuteWorkflowRequest {
  context_id: string;
  workflow_config?: Partial<WorkflowConfig>;
  execution_context?: Partial<ExecutionContext>;
}

/**
 * 工作流状态查询请求接口
 */
export interface GetWorkflowStatusRequest {
  workflow_id: string;
}

/**
 * 工作流控制请求接口
 */
export interface WorkflowControlRequest {
  workflow_id: string;
  action: 'pause' | 'resume' | 'cancel';
}

/**
 * Core协议API控制器
 */
export class CoreController {
  private logger: Logger;

  constructor(
    private coreOrchestrator: CoreOrchestratorService
  ) {
    this.logger = new Logger('CoreController');
  }

  /**
   * 执行工作流
   * POST /api/core/workflows/execute
   */
  async executeWorkflow(request: ExecuteWorkflowRequest): Promise<OperationResult<WorkflowExecutionResult>> {
    try {
      this.logger.info('收到工作流执行请求', {
        context_id: request.context_id,
        workflow_config: request.workflow_config
      });

      // 1. 验证请求参数
      const validationResult = this.validateExecuteWorkflowRequest(request);
      if (!validationResult.success) {
        return validationResult;
      }

      // 2. 执行工作流
      const result = await this.coreOrchestrator.executeWorkflow(
        request.context_id,
        request.workflow_config
      );

      this.logger.info('工作流执行完成', {
        context_id: request.context_id,
        success: result.success,
        workflow_id: result.data?.workflow_id
      });

      return result;

    } catch (error) {
      this.logger.error('工作流执行失败', {
        context_id: request.context_id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Workflow execution failed'
      };
    }
  }

  /**
   * 获取工作流状态
   * GET /api/core/workflows/{workflow_id}/status
   */
  async getWorkflowStatus(request: GetWorkflowStatusRequest): Promise<OperationResult<ExecutionStatus>> {
    try {
      this.logger.debug('获取工作流状态', {
        workflow_id: request.workflow_id
      });

      // 1. 验证请求参数
      if (!request.workflow_id) {
        return {
          success: false,
          error: 'workflow_id is required'
        };
      }

      // 2. 获取状态
      const result = await this.coreOrchestrator.getExecutionStatus(request.workflow_id);

      this.logger.debug('工作流状态获取完成', {
        workflow_id: request.workflow_id,
        success: result.success,
        status: result.data?.status
      });

      return result;

    } catch (error) {
      this.logger.error('获取工作流状态失败', {
        workflow_id: request.workflow_id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get workflow status'
      };
    }
  }

  /**
   * 获取活跃工作流列表
   * GET /api/core/workflows/active
   */
  async getActiveWorkflows(): Promise<OperationResult<string[]>> {
    try {
      this.logger.debug('获取活跃工作流列表');

      const activeWorkflows = await this.coreOrchestrator.getActiveExecutions();

      this.logger.debug('活跃工作流列表获取完成', {
        count: activeWorkflows.length
      });

      return {
        success: true,
        data: activeWorkflows
      };

    } catch (error) {
      this.logger.error('获取活跃工作流列表失败', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get active workflows'
      };
    }
  }

  /**
   * 获取模块状态
   * GET /api/core/modules/status
   */
  async getModuleStatuses(): Promise<OperationResult<Record<string, StageStatus>>> {
    try {
      this.logger.debug('获取模块状态');

      const moduleStatuses = await this.coreOrchestrator.getModuleStatuses();

      this.logger.debug('模块状态获取完成', {
        modules: Object.keys(moduleStatuses)
      });

      return {
        success: true,
        data: moduleStatuses
      };

    } catch (error) {
      this.logger.error('获取模块状态失败', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get module statuses'
      };
    }
  }

  /**
   * 控制工作流（暂停/恢复/取消）
   * POST /api/core/workflows/{workflow_id}/control
   */
  async controlWorkflow(request: WorkflowControlRequest): Promise<OperationResult<boolean>> {
    try {
      this.logger.info('收到工作流控制请求', {
        workflow_id: request.workflow_id,
        action: request.action
      });

      // 1. 验证请求参数
      const validationResult = this.validateWorkflowControlRequest(request);
      if (!validationResult.success) {
        return validationResult;
      }

      // 2. 执行控制操作
      let result: OperationResult<boolean>;

      switch (request.action) {
        case 'pause':
          result = await this.coreOrchestrator.pauseWorkflow(request.workflow_id);
          break;
        case 'resume':
          result = await this.coreOrchestrator.resumeWorkflow(request.workflow_id);
          break;
        case 'cancel':
          result = await this.coreOrchestrator.cancelWorkflow(request.workflow_id);
          break;
        default:
          return {
            success: false,
            error: `Unsupported action: ${request.action}`
          };
      }

      this.logger.info('工作流控制完成', {
        workflow_id: request.workflow_id,
        action: request.action,
        success: result.success
      });

      return result;

    } catch (error) {
      this.logger.error('工作流控制失败', {
        workflow_id: request.workflow_id,
        action: request.action,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Workflow control failed'
      };
    }
  }

  /**
   * 获取Core协议健康状态
   * GET /api/core/health
   */
  async getHealthStatus(): Promise<OperationResult<{
    status: 'healthy' | 'unhealthy';
    timestamp: string;
    modules: Record<string, StageStatus>;
    active_workflows: number;
  }>> {
    try {
      this.logger.debug('获取Core协议健康状态');

      const moduleStatuses = await this.coreOrchestrator.getModuleStatuses();
      const activeWorkflows = await this.coreOrchestrator.getActiveExecutions();

      // 检查整体健康状态
      const unhealthyModules = Object.values(moduleStatuses).filter(
        status => status === StageStatus.FAILED
      );
      const overallStatus = unhealthyModules.length === 0 ? 'healthy' : 'unhealthy';

      const healthStatus = {
        status: overallStatus as 'healthy' | 'unhealthy',
        timestamp: new Date().toISOString(),
        modules: moduleStatuses,
        active_workflows: activeWorkflows.length
      };

      this.logger.debug('Core协议健康状态获取完成', {
        status: overallStatus,
        moduleCount: Object.keys(moduleStatuses).length,
        activeWorkflows: activeWorkflows.length
      });

      return {
        success: true,
        data: healthStatus
      };

    } catch (error) {
      this.logger.error('获取Core协议健康状态失败', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get health status'
      };
    }
  }

  // ===== 私有验证方法 =====

  /**
   * 验证工作流执行请求
   */
  private validateExecuteWorkflowRequest(request: ExecuteWorkflowRequest): OperationResult {
    if (!request.context_id) {
      return {
        success: false,
        error: 'context_id is required'
      };
    }

    if (request.workflow_config) {
      // 验证工作流配置
      if (request.workflow_config.stages) {
        const validStages = Object.values(WorkflowStage);
        const invalidStages = request.workflow_config.stages.filter(
          stage => !validStages.includes(stage)
        );
        
        if (invalidStages.length > 0) {
          return {
            success: false,
            error: `Invalid stages: ${invalidStages.join(', ')}`
          };
        }
      }

      if (request.workflow_config.execution_mode) {
        const validModes = Object.values(ExecutionMode);
        if (!validModes.includes(request.workflow_config.execution_mode)) {
          return {
            success: false,
            error: `Invalid execution_mode: ${request.workflow_config.execution_mode}`
          };
        }
      }

      if (request.workflow_config.timeout_ms && request.workflow_config.timeout_ms < 1000) {
        return {
          success: false,
          error: 'timeout_ms must be at least 1000ms'
        };
      }
    }

    if (request.execution_context) {
      if (request.execution_context.priority) {
        const validPriorities = Object.values(Priority);
        if (!validPriorities.includes(request.execution_context.priority)) {
          return {
            success: false,
            error: `Invalid priority: ${request.execution_context.priority}`
          };
        }
      }
    }

    return { success: true };
  }

  /**
   * 验证工作流控制请求
   */
  private validateWorkflowControlRequest(request: WorkflowControlRequest): OperationResult {
    if (!request.workflow_id) {
      return {
        success: false,
        error: 'workflow_id is required'
      };
    }

    const validActions = ['pause', 'resume', 'cancel'];
    if (!validActions.includes(request.action)) {
      return {
        success: false,
        error: `Invalid action: ${request.action}. Valid actions: ${validActions.join(', ')}`
      };
    }

    return { success: true };
  }
}
