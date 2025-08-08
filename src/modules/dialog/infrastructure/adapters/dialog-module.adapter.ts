/**
 * MPLP Dialog Module Adapter
 *
 * @version v1.0.0
 * @created 2025-08-05T15:30:00+08:00
 * @description Dialog模块适配器，实现Core的ModuleInterface接口
 */

import { v4 as uuidv4 } from 'uuid';
import { Logger } from '../../../../public/utils/logger';
import { DialogService } from '../../application/services/dialog.service';
import {
  ModuleInterface,
  ModuleStatus,
  WorkflowExecutionContext,
  StageExecutionResult,
  BusinessCoordinationRequest,
  BusinessCoordinationResult,
  ValidationResult,
  ValidationError,
  ValidationWarning,
  BusinessError,
  BusinessContext,
  ErrorHandlingResult,
  DialogCoordinationRequest,
  DialogResult,
  DialogTurn
} from '../../../../public/modules/core/types/core.types';

/**
 * Dialog模块适配器类
 * 实现Core模块的ModuleInterface接口
 */
export class DialogModuleAdapter implements ModuleInterface {
  public readonly module_name = 'dialog';
  private logger = new Logger('DialogModuleAdapter');
  private moduleStatus: ModuleStatus = {
    module_name: 'dialog',
    status: 'idle',
    error_count: 0
  };

  constructor(private dialogService: DialogService) {}

  /**
   * 初始化模块
   */
  async initialize(): Promise<void> {
    try {
      this.logger.info('Initializing Dialog module adapter');
      this.moduleStatus.status = 'initialized';
      this.logger.info('Dialog module adapter initialized successfully');
    } catch (error) {
      this.moduleStatus.status = 'error';
      this.moduleStatus.error_count++;
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error('Failed to initialize Dialog module adapter', { error: errorMessage });
      throw error;
    }
  }

  /**
   * 执行工作流阶段 - 技术层面
   */
  async executeStage(context: WorkflowExecutionContext): Promise<StageExecutionResult> {
    const startTime = Date.now();

    try {
      this.logger.info('Executing Dialog stage', {
        contextId: context.contextId,
        stage: context.current_stage
      });

      this.moduleStatus.status = 'running';

      // 基于上下文执行对话管理
      const dialogResult = await this.processDialogStage(context);

      const result: StageExecutionResult = {
        stage: 'dialog',
        status: 'completed',
        result: dialogResult,
        duration_ms: Date.now() - startTime,
        started_at: new Date(startTime).toISOString(),
        completed_at: new Date().toISOString()
      };

      this.moduleStatus.status = 'idle';
      this.logger.info('Dialog stage executed successfully', {
        contextId: context.contextId,
        duration: result.duration_ms
      });

      return result;
    } catch (error) {
      this.moduleStatus.status = 'error';
      this.moduleStatus.error_count++;
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error('Dialog stage execution failed', {
        contextId: context.contextId,
        error: errorMessage
      });

      return {
        stage: 'dialog',
        status: 'failed',
        result: { error: errorMessage },
        duration_ms: Date.now() - startTime,
        started_at: new Date(startTime).toISOString(),
        completed_at: new Date().toISOString()
      };
    }
  }

  /**
   * 执行业务协调 - 业务层面
   */
  async executeBusinessCoordination(request: BusinessCoordinationRequest): Promise<BusinessCoordinationResult> {
    const startTime = Date.now();

    try {
      this.logger.info('Executing Dialog business coordination', {
        coordinationId: request.coordination_id,
        type: request.coordination_type
      });

      this.moduleStatus.status = 'running';

      // 将通用请求转换为Dialog特定请求
      const dialogRequest = this.convertToDialogRequest(request);

      // 执行对话协调
      const dialogResult = await this.coordinateDialog(dialogRequest);

      const result: BusinessCoordinationResult = {
        coordination_id: request.coordination_id,
        module: 'dialog',
        status: 'completed',
        output_data: {
          data_type: 'dialog_data',
          data_version: '1.0.0',
          payload: dialogResult,
          metadata: {
            source_module: 'dialog',
            target_modules: ['core'],
            data_schema_version: '1.0.0',
            validation_status: 'valid',
            security_level: 'internal'
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        execution_metrics: {
          start_time: new Date(startTime).toISOString(),
          end_time: new Date().toISOString(),
          duration_ms: Date.now() - startTime,
          memory_usage: process.memoryUsage().heapUsed
        },
        timestamp: new Date().toISOString()
      };

      this.moduleStatus.status = 'idle';
      this.logger.info('Dialog business coordination completed', {
        coordinationId: request.coordination_id,
        duration: result.execution_metrics.duration_ms
      });

      return result;
    } catch (error) {
      this.moduleStatus.status = 'error';
      this.moduleStatus.error_count++;
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error('Dialog business coordination failed', {
        coordinationId: request.coordination_id,
        error: errorMessage
      });

      return {
        coordination_id: request.coordination_id,
        module: 'dialog',
        status: 'failed',
        output_data: {
          data_type: 'dialog_data',
          data_version: '1.0.0',
          payload: { error: errorMessage },
          metadata: {
            source_module: 'dialog',
            target_modules: ['core'],
            data_schema_version: '1.0.0',
            validation_status: 'invalid',
            security_level: 'internal'
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        execution_metrics: {
          start_time: new Date(startTime).toISOString(),
          end_time: new Date().toISOString(),
          duration_ms: Date.now() - startTime,
          memory_usage: process.memoryUsage().heapUsed
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * 清理资源
   */
  async cleanup(): Promise<void> {
    try {
      this.logger.info('Cleaning up Dialog module adapter');
      this.moduleStatus.status = 'idle';
      this.logger.info('Dialog module adapter cleanup completed');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error('Dialog module adapter cleanup failed', { error: errorMessage });
      throw error;
    }
  }

  /**
   * 获取模块状态
   */
  getStatus(): ModuleStatus {
    return { ...this.moduleStatus };
  }

  /**
   * 验证输入数据
   */
  async validateInput(input: unknown): Promise<ValidationResult> {
    try {
      const errors: ValidationError[] = [];
      const warnings: ValidationWarning[] = [];

      // 基本类型检查
      if (!input || typeof input !== 'object') {
        errors.push({
          field_path: 'root',
          error_code: 'INVALID_TYPE',
          error_message: 'Input must be a valid object'
        });
        return { is_valid: false, errors, warnings };
      }

      const inputObj = input as Record<string, unknown>;

      // 验证必需字段
      const requiredFields = ['participants', 'context'];
      const missingFields = requiredFields.filter(field => !(field in inputObj));

      if (missingFields.length > 0) {
        errors.push({
          field_path: 'root',
          error_code: 'MISSING_FIELDS',
          error_message: `Missing required fields: ${missingFields.join(', ')}`
        });
      }

      // 验证参与者
      if (!Array.isArray(inputObj.participants) || inputObj.participants.length === 0) {
        errors.push({
          field_path: 'participants',
          error_code: 'INVALID_PARTICIPANTS',
          error_message: 'Participants must be a non-empty array'
        });
      }

      return {
        is_valid: errors.length === 0,
        errors,
        warnings
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        is_valid: false,
        errors: [{
          field_path: 'root',
          error_code: 'VALIDATION_EXCEPTION',
          error_message: `Validation error: ${errorMessage}`
        }],
        warnings: []
      };
    }
  }

  /**
   * 处理错误
   */
  async handleError(error: BusinessError, context: BusinessContext): Promise<ErrorHandlingResult> {
    try {
      this.logger.error('Handling Dialog module error', {
        error: error.error_message,
        context: context.contextId
      });

      // 根据错误类型决定处理策略
      let recovery_action: 'retry' | 'skip' | 'rollback' | 'escalate' = 'escalate';

      if (error.error_type === 'timeout_error') {
        recovery_action = 'retry';
      } else if (error.error_type === 'validation_error') {
        recovery_action = 'skip';
      }

      return {
        handled: true,
        recovery_action
      };
    } catch (handlingError) {
      const errorMessage = handlingError instanceof Error ? handlingError.message : String(handlingError);
      this.logger.error('Error handling failed', { error: errorMessage });

      return {
        handled: false,
        recovery_action: 'escalate'
      };
    }
  }

  // ==================== Private Helper Methods ====================

  /**
   * 处理对话阶段
   */
  private async processDialogStage(context: WorkflowExecutionContext): Promise<Record<string, unknown>> {
    // 输入验证
    if (!context.contextId) {
      throw new Error('Invalid context: missing context_id');
    }

    if (!context.data_store) {
      throw new Error('Invalid context: missing data_store');
    }

    // 模拟对话处理
    return {
      dialog_id: uuidv4(),
      participants: ['agent1', 'agent2'],
      messages_count: 3,
      status: 'completed',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * 转换为Dialog请求
   */
  private convertToDialogRequest(request: BusinessCoordinationRequest): DialogCoordinationRequest {
    const inputData = request.input_data;

    return {
      contextId: request.contextId,
      turn_strategy: 'adaptive',
      parameters: {
        min_turns: 1,
        max_turns: 10,
        exit_criteria: inputData.payload.exit_criteria
      },
      state_management: {
        persistence: true,
        transitions: ['active', 'completed'],
        rollback_support: false
      }
    };
  }

  /**
   * 协调对话
   */
  private async coordinateDialog(request: DialogCoordinationRequest): Promise<DialogResult> {
    // 模拟对话轮次
    const turns: DialogTurn[] = [];
    const maxTurns = request.parameters.max_turns || 5;

    for (let i = 0; i < Math.min(maxTurns, 3); i++) {
      turns.push({
        turn_id: `turn_${i + 1}`,
        timestamp: new Date().toISOString(),
        action: 'dialog_exchange',
        result: 'success'
      });
    }

    return {
      dialog_id: uuidv4(),
      turns,
      final_state: {
        status: 'completed',
        turn_count: turns.length,
        strategy: request.turn_strategy
      },
      timestamp: new Date().toISOString()
    };
  }
}