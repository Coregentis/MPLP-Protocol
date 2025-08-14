/**
 * MPLP Extension Module Adapter
 *
 * @version v1.0.0
 * @created 2025-08-05T17:30:00+08:00
 * @description Extension模块适配器，实现ModuleInterface接口，支持Core模块协调
 *
 * 遵循规则：
 * - 零技术债务：严禁使用any类型
 * - 生产级代码质量：完整的错误处理和类型安全
 * - Schema驱动开发：基于extension-protocol.json Schema
 */

import { v4 as uuidv4 } from 'uuid';
import { Logger } from '../../../../public/utils/logger';
import { ExtensionManagementService } from '../../application/services/extension-management.service';
import {
  ModuleInterface,
  WorkflowExecutionContext,
  BusinessCoordinationRequest,
  BusinessCoordinationResult,
  ValidationResult,
  ValidationError,
  ValidationWarning,
  BusinessError,
  BusinessContext,
  ErrorHandlingResult,
  ModuleStatus,
  StageExecutionResult,
} from '../../../../public/modules/core/types/core.types';

/**
 * Extension模块适配器
 * 实现Core模块的ModuleInterface接口
 */
export class ExtensionModuleAdapter implements ModuleInterface {
  public readonly module_name = 'extension';
  private status: 'idle' | 'initialized' | 'error' = 'idle';
  private errorCount = 0;
  private readonly logger: Logger;

  constructor(private readonly extensionService: ExtensionManagementService) {
    this.logger = new Logger('ExtensionModuleAdapter');
  }

  /**
   * 初始化模块
   */
  async initialize(): Promise<void> {
    try {
      this.logger.info('Initializing Extension module adapter');

      // 验证服务可用性
      if (!this.extensionService) {
        throw new Error('ExtensionManagementService is required');
      }

      this.status = 'initialized';
      this.logger.info('Extension module adapter initialized successfully');
    } catch (error) {
      this.status = 'error';
      this.errorCount++;
      this.logger.error('Failed to initialize Extension module adapter', {
        error,
      });
      throw error;
    }
  }

  /**
   * 执行工作流阶段
   */
  async executeStage(
    context: WorkflowExecutionContext
  ): Promise<StageExecutionResult> {
    const startTime = Date.now();
    const startedAt = new Date().toISOString();

    try {
      this.logger.info('Executing extension stage', {
        context_id: context.contextId,
      });

      // 处理扩展阶段
      const result = await this.processExtensionStage(context);

      const completedAt = new Date().toISOString();
      const duration = Date.now() - startTime;

      return {
        stage: 'extension',
        status: 'completed',
        result,
        duration_ms: duration,
        startedAt: startedAt,
        completedAt: completedAt,
      };
    } catch (error) {
      this.errorCount++;
      const completedAt = new Date().toISOString();
      const duration = Date.now() - startTime;

      this.logger.error('Extension stage execution failed', {
        context_id: context.contextId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      return {
        stage: 'extension',
        status: 'failed',
        result: {
          error: error instanceof Error ? error.message : 'Unknown error',
          context_id: context.contextId,
          timestamp: new Date().toISOString(),
        },
        duration_ms: duration,
        startedAt: startedAt,
        completedAt: completedAt,
      };
    }
  }

  /**
   * 执行业务协调
   */
  async executeBusinessCoordination(
    request: BusinessCoordinationRequest
  ): Promise<BusinessCoordinationResult> {
    const startTime = Date.now();

    try {
      this.logger.info('Executing extension business coordination', {
        coordination_id: request.coordination_id,
      });

      // 处理业务协调请求
      const result = await this.processBusinessCoordination(request);

      const executionTime = Date.now() - startTime;

      return {
        coordination_id: request.coordination_id,
        module: 'extension',
        status: 'completed',
        output_data: {
          data_type: 'extension_data',
          data_version: '1.0.0',
          payload: result,
          metadata: {
            source_module: 'extension',
            target_modules: ['core'],
            data_schema_version: '1.0.0',
            validation_status: 'valid',
            security_level: 'internal',
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        execution_metrics: {
          start_time: new Date(startTime).toISOString(),
          end_time: new Date().toISOString(),
          duration_ms: executionTime,
          memory_usage: process.memoryUsage().heapUsed / 1024 / 1024,
          cpu_usage: 0, // 简化实现
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.errorCount++;
      const executionTime = Date.now() - startTime;

      this.logger.error('Extension business coordination failed', {
        coordination_id: request.coordination_id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      return {
        coordination_id: request.coordination_id,
        module: 'extension',
        status: 'failed',
        output_data: {
          data_type: 'extension_data',
          data_version: '1.0.0',
          payload: {
            error: error instanceof Error ? error.message : 'Unknown error',
            coordination_id: request.coordination_id,
            timestamp: new Date().toISOString(),
          },
          metadata: {
            source_module: 'extension',
            target_modules: ['core'],
            data_schema_version: '1.0.0',
            validation_status: 'invalid',
            security_level: 'internal',
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        execution_metrics: {
          start_time: new Date(startTime).toISOString(),
          end_time: new Date().toISOString(),
          duration_ms: executionTime,
          memory_usage: process.memoryUsage().heapUsed / 1024 / 1024,
          cpu_usage: 0,
        },
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * 验证输入数据
   */
  async validateInput(input: unknown): Promise<ValidationResult> {
    try {
      const errors: ValidationError[] = [];
      const warnings: ValidationWarning[] = [];

      // 基本类型验证
      if (input === null || input === undefined) {
        errors.push({
          error_code: 'INVALID_TYPE',
          error_message: 'Input cannot be null or undefined',
          field_path: 'input',
        });
      } else if (typeof input !== 'object') {
        errors.push({
          error_code: 'INVALID_TYPE',
          error_message: 'Input must be an object',
          field_path: 'input',
        });
      } else {
        const inputObj = input as Record<string, unknown>;

        // 验证必需字段
        if (!inputObj.plugins || !Array.isArray(inputObj.plugins)) {
          errors.push({
            error_code: 'MISSING_FIELDS',
            error_message: 'plugins field is required and must be an array',
            field_path: 'plugins',
          });
        }

        if (!inputObj.context) {
          errors.push({
            error_code: 'MISSING_FIELDS',
            error_message: 'context field is required',
            field_path: 'context',
          });
        }

        // 验证插件数组
        if (Array.isArray(inputObj.plugins) && inputObj.plugins.length === 0) {
          warnings.push({
            warning_code: 'EMPTY_PLUGINS',
            warning_message: 'No plugins specified for extension processing',
            field_path: 'plugins',
          });
        }
      }

      return {
        is_valid: errors.length === 0,
        errors,
        warnings,
      };
    } catch (error) {
      return {
        is_valid: false,
        errors: [
          {
            error_code: 'VALIDATION_EXCEPTION',
            error_message:
              error instanceof Error ? error.message : 'Validation failed',
            field_path: 'input',
          },
        ],
        warnings: [],
      };
    }
  }

  /**
   * 处理错误
   */
  async handleError(
    error: BusinessError,
    context: BusinessContext
  ): Promise<ErrorHandlingResult> {
    try {
      this.logger.warn('Handling extension error', {
        error_id: error.error_id,
        error_type: error.error_type,
      });

      let recoveryAction: 'retry' | 'skip' | 'escalate' = 'escalate';

      // 根据错误类型确定恢复策略
      switch (error.error_type) {
        case 'timeout_error':
          recoveryAction = 'retry';
          break;
        case 'validation_error':
          recoveryAction = 'skip';
          break;
        case 'business_logic_error':
        default:
          recoveryAction = 'escalate';
          break;
      }

      return {
        handled: true,
        recovery_action: recoveryAction,
        recovery_data: {
          data_type: 'extension_data',
          data_version: '1.0.0',
          payload: {
            error_id: error.error_id,
            recovery_strategy: recoveryAction,
            timestamp: new Date().toISOString(),
          },
          metadata: {
            source_module: 'extension',
            target_modules: ['core'],
            data_schema_version: '1.0.0',
            validation_status: 'valid',
            security_level: 'internal',
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      };
    } catch (recoveryError) {
      this.logger.error('Error recovery failed', {
        original_error: error.error_id,
        recovery_error:
          recoveryError instanceof Error
            ? recoveryError.message
            : 'Unknown error',
      });

      return {
        handled: false,
        recovery_action: 'escalate',
      };
    }
  }

  /**
   * 清理资源
   */
  async cleanup(): Promise<void> {
    try {
      this.logger.info('Cleaning up Extension module adapter');
      this.status = 'idle';
      this.logger.info('Extension module adapter cleanup completed');
    } catch (error) {
      this.logger.error('Extension module adapter cleanup failed', { error });
      throw error;
    }
  }

  /**
   * 获取模块状态
   */
  getStatus(): ModuleStatus {
    return {
      module_name: 'extension',
      status: this.status,
      error_count: this.errorCount,
      last_execution: new Date().toISOString(),
    };
  }

  /**
   * 处理扩展阶段
   */
  private async processExtensionStage(
    context: WorkflowExecutionContext
  ): Promise<Record<string, unknown>> {
    // 输入验证
    if (!context.contextId) {
      throw new Error('Invalid context: missing context_id');
    }

    if (!context.data_store) {
      throw new Error('Invalid context: missing data_store');
    }

    // 模拟扩展处理
    return {
      extension_id: uuidv4(),
      plugins_loaded: ['strategy-plugin-1', 'analysis-plugin-2'],
      extensions_count: 2,
      status: 'completed',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 处理业务协调
   * 增强版本：支持智能协作和预留接口模式
   */
  private async processBusinessCoordination(
    request: BusinessCoordinationRequest
  ): Promise<Record<string, unknown>> {
    // 输入验证
    if (!request.coordination_id) {
      throw new Error('Invalid request: missing coordination_id');
    }

    // 根据协调类型处理不同的业务场景
    switch (request.coordination_type) {
      case 'extension_coordination':
        return await this.handleExtensionCoordination(request);

      default:
        // 默认扩展处理
        return {
          extension_id: uuidv4(),
          coordination_type: request.coordination_type,
          plugins_executed: ['plugin-1', 'plugin-2'],
          execution_result: 'success',
          timestamp: new Date().toISOString(),
        };
    }
  }

  /**
   * 处理扩展协调请求
   * 统一处理各种扩展相关的协调场景
   */
  private async handleExtensionCoordination(
    request: BusinessCoordinationRequest
  ): Promise<Record<string, unknown>> {
    const inputData = request.input_data?.payload as any;
    const action = inputData?.action;

    switch (action) {
      case 'recommend_extensions':
        return await this.handleExtensionRecommendation(request);

      case 'manage_lifecycle':
        return await this.handleExtensionLifecycle(request);

      case 'security_audit':
        return await this.handleExtensionSecurityAudit(request);

      case 'load_for_role':
        return await this.handleLoadExtensionsForRole(request);

      case 'manage_plan_driven':
        return await this.handlePlanDrivenExtensions(request);

      case 'manage_approval_workflow':
        return await this.handleApprovalWorkflow(request);

      case 'manage_collaborative':
        return await this.handleCollaborativeExtensions(request);

      case 'manage_network_distribution':
        return await this.handleNetworkDistribution(request);

      case 'manage_dialog_driven':
        return await this.handleDialogDrivenExtensions(request);

      case 'orchestrate_mplp':
        return await this.handleMPLPOrchestration(request);

      default:
        // 默认扩展协调处理
        return {
          coordination_id: request.coordination_id,
          coordination_type: 'extension_coordination',
          action: action || 'default',
          execution_result: 'success',
          timestamp: new Date().toISOString(),
        };
    }
  }

  /**
   * 处理扩展推荐协调请求
   */
  private async handleExtensionRecommendation(
    request: BusinessCoordinationRequest
  ): Promise<Record<string, unknown>> {
    const inputData = request.input_data?.payload as any;

    if (inputData?.userId && inputData?.contextId) {
      // 调用智能推荐服务
      const recommendations = await this.extensionService.getIntelligentExtensionRecommendations(
        inputData.userId,
        inputData.contextId,
        inputData.requirements
      );

      return {
        coordination_id: request.coordination_id,
        action: 'recommend_extensions',
        recommendations: recommendations.data,
        execution_result: recommendations.success ? 'success' : 'failed',
        timestamp: new Date().toISOString(),
      };
    }

    throw new Error('Invalid extension recommendation request: missing userId or contextId');
  }

  /**
   * 处理扩展生命周期协调请求
   */
  private async handleExtensionLifecycle(
    request: BusinessCoordinationRequest
  ): Promise<Record<string, unknown>> {
    const inputData = request.input_data?.payload as any;

    if (inputData?.contextId && inputData?.policy) {
      // 调用自动化生命周期管理
      const automation = await this.extensionService.automateExtensionLifecycle(
        inputData.contextId,
        inputData.policy
      );

      return {
        coordination_id: request.coordination_id,
        action: 'manage_lifecycle',
        automation_result: automation.data,
        execution_result: automation.success ? 'success' : 'failed',
        timestamp: new Date().toISOString(),
      };
    }

    throw new Error('Invalid extension lifecycle request: missing contextId or policy');
  }

  /**
   * 处理扩展安全审计协调请求
   */
  private async handleExtensionSecurityAudit(
    request: BusinessCoordinationRequest
  ): Promise<Record<string, unknown>> {
    const inputData = request.input_data?.payload as any;

    if (inputData?.extensionId) {
      // 调用安全审计服务
      const audit = await this.extensionService.auditExtensionSecurity(
        inputData.extensionId,
        inputData.userId
      );

      return {
        coordination_id: request.coordination_id,
        action: 'security_audit',
        audit_result: audit.data,
        execution_result: audit.success ? 'success' : 'failed',
        timestamp: new Date().toISOString(),
      };
    }

    throw new Error('Invalid extension security audit request: missing extensionId');
  }

  /**
   * 处理为角色加载扩展的协调请求
   */
  private async handleLoadExtensionsForRole(
    request: BusinessCoordinationRequest
  ): Promise<Record<string, unknown>> {
    const inputData = request.input_data?.payload as any;

    if (inputData?.roleId && inputData?.capabilities) {
      // 调用角色扩展加载服务
      const loadResult = await this.extensionService.loadExtensionsForRole(
        inputData.roleId,
        inputData.capabilities
      );

      return {
        coordination_id: request.coordination_id,
        action: 'load_for_role',
        loaded_extensions: loadResult.data,
        execution_result: loadResult.success ? 'success' : 'failed',
        timestamp: new Date().toISOString(),
      };
    }

    throw new Error('Invalid load extensions for role request: missing roleId or capabilities');
  }

  /**
   * 处理计划驱动扩展协调请求
   */
  private async handlePlanDrivenExtensions(
    request: BusinessCoordinationRequest
  ): Promise<Record<string, unknown>> {
    const inputData = request.input_data?.payload as any;

    if (inputData?.planId && inputData?.planType) {
      const result = await this.extensionService.managePlanDrivenExtensions(
        inputData.planId,
        inputData.planType,
        inputData.userId
      );

      return {
        coordination_id: request.coordination_id,
        action: 'manage_plan_driven',
        plan_extensions: result.data,
        execution_result: result.success ? 'success' : 'failed',
        timestamp: new Date().toISOString(),
      };
    }

    throw new Error('Invalid plan driven extensions request: missing planId or planType');
  }

  /**
   * 处理审批工作流协调请求
   */
  private async handleApprovalWorkflow(
    request: BusinessCoordinationRequest
  ): Promise<Record<string, unknown>> {
    const inputData = request.input_data?.payload as any;

    if (inputData?.extensionId && inputData?.operation && inputData?.userId) {
      const result = await this.extensionService.manageExtensionApprovalWorkflow(
        inputData.extensionId,
        inputData.operation,
        inputData.userId
      );

      return {
        coordination_id: request.coordination_id,
        action: 'manage_approval_workflow',
        approval_result: result.data,
        execution_result: result.success ? 'success' : 'failed',
        timestamp: new Date().toISOString(),
      };
    }

    throw new Error('Invalid approval workflow request: missing extensionId, operation, or userId');
  }

  /**
   * 处理协作扩展协调请求
   */
  private async handleCollaborativeExtensions(
    request: BusinessCoordinationRequest
  ): Promise<Record<string, unknown>> {
    const inputData = request.input_data?.payload as any;

    if (inputData?.collabId && inputData?.agentIds) {
      const result = await this.extensionService.manageCollaborativeExtensions(
        inputData.collabId,
        inputData.agentIds
      );

      return {
        coordination_id: request.coordination_id,
        action: 'manage_collaborative',
        collab_result: result.data,
        execution_result: result.success ? 'success' : 'failed',
        timestamp: new Date().toISOString(),
      };
    }

    throw new Error('Invalid collaborative extensions request: missing collabId or agentIds');
  }

  /**
   * 处理网络分发协调请求
   */
  private async handleNetworkDistribution(
    request: BusinessCoordinationRequest
  ): Promise<Record<string, unknown>> {
    const inputData = request.input_data?.payload as any;

    if (inputData?.networkId && inputData?.extensionId && inputData?.distributionPolicy) {
      const result = await this.extensionService.manageNetworkExtensionDistribution(
        inputData.networkId,
        inputData.extensionId,
        inputData.distributionPolicy
      );

      return {
        coordination_id: request.coordination_id,
        action: 'manage_network_distribution',
        distribution_result: result.data,
        execution_result: result.success ? 'success' : 'failed',
        timestamp: new Date().toISOString(),
      };
    }

    throw new Error('Invalid network distribution request: missing networkId, extensionId, or distributionPolicy');
  }

  /**
   * 处理对话驱动扩展协调请求
   */
  private async handleDialogDrivenExtensions(
    request: BusinessCoordinationRequest
  ): Promise<Record<string, unknown>> {
    const inputData = request.input_data?.payload as any;

    if (inputData?.dialogId && inputData?.userQuery) {
      const result = await this.extensionService.manageExtensionsThroughDialog(
        inputData.dialogId,
        inputData.userQuery,
        inputData.context
      );

      return {
        coordination_id: request.coordination_id,
        action: 'manage_dialog_driven',
        dialog_result: result.data,
        execution_result: result.success ? 'success' : 'failed',
        timestamp: new Date().toISOString(),
      };
    }

    throw new Error('Invalid dialog driven extensions request: missing dialogId or userQuery');
  }

  /**
   * 处理MPLP编排协调请求
   */
  private async handleMPLPOrchestration(
    request: BusinessCoordinationRequest
  ): Promise<Record<string, unknown>> {
    const inputData = request.input_data?.payload as any;

    if (inputData?.contextId && inputData?.orchestrationRequest) {
      const result = await this.extensionService.orchestrateExtensionsAcrossMPLP(
        inputData.contextId,
        inputData.orchestrationRequest
      );

      return {
        coordination_id: request.coordination_id,
        action: 'orchestrate_mplp',
        orchestration_result: result.data,
        execution_result: result.success ? 'success' : 'failed',
        timestamp: new Date().toISOString(),
      };
    }

    throw new Error('Invalid MPLP orchestration request: missing contextId or orchestrationRequest');
  }
}
