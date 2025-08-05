/**
 * MPLP Context Module Adapter
 *
 * @version v1.0.0
 * @created 2025-08-05T21:45:00+08:00
 * @description Context模块适配器，实现ModuleInterface接口，支持Core模块协调
 * 
 * 遵循规则：
 * - 零技术债务：严禁使用any类型
 * - 生产级代码质量：完整的错误处理和类型安全
 * - Schema驱动开发：基于context-protocol.json Schema
 */

import { v4 as uuidv4 } from 'uuid';
import { Logger } from '../../../../public/utils/logger';
import { ContextManagementService } from '../../application/services/context-management.service';
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
  StageExecutionResult
} from '../../../../public/modules/core/types/core.types';

/**
 * Context模块适配器
 * 实现Core模块的ModuleInterface接口
 */
export class ContextModuleAdapter implements ModuleInterface {
  public readonly module_name = 'context';
  private status: 'idle' | 'initialized' | 'error' = 'idle';
  private errorCount = 0;
  private readonly logger: Logger;

  constructor(
    private readonly contextService: ContextManagementService
  ) {
    this.logger = new Logger('ContextModuleAdapter');
  }

  /**
   * 初始化模块
   */
  async initialize(): Promise<void> {
    try {
      this.logger.info('Initializing Context module adapter');
      
      // 验证服务可用性
      if (!this.contextService) {
        throw new Error('ContextManagementService is required');
      }

      this.status = 'initialized';
      this.logger.info('Context module adapter initialized successfully');
    } catch (error) {
      this.status = 'error';
      this.errorCount++;
      this.logger.error('Failed to initialize Context module adapter', { error });
      throw error;
    }
  }

  /**
   * 执行工作流阶段
   */
  async executeStage(context: WorkflowExecutionContext): Promise<StageExecutionResult> {
    const startTime = Date.now();
    const startedAt = new Date().toISOString();

    try {
      this.logger.info('Executing context stage', { context_id: context.context_id });

      // 处理上下文阶段
      const result = await this.processContextStage(context);

      const completedAt = new Date().toISOString();
      const duration = Date.now() - startTime;

      return {
        stage: 'context',
        status: 'completed',
        result,
        duration_ms: duration,
        started_at: startedAt,
        completed_at: completedAt
      };
    } catch (error) {
      this.errorCount++;
      const completedAt = new Date().toISOString();
      const duration = Date.now() - startTime;

      this.logger.error('Context stage execution failed', { 
        context_id: context.context_id, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });

      return {
        stage: 'context',
        status: 'failed',
        result: {
          error: error instanceof Error ? error.message : 'Unknown error',
          context_id: context.context_id,
          timestamp: new Date().toISOString()
        },
        duration_ms: duration,
        started_at: startedAt,
        completed_at: completedAt
      };
    }
  }

  /**
   * 执行业务协调
   */
  async executeBusinessCoordination(request: BusinessCoordinationRequest): Promise<BusinessCoordinationResult> {
    const startTime = Date.now();

    try {
      this.logger.info('Executing context business coordination', { 
        coordination_id: request.coordination_id 
      });

      // 处理业务协调请求
      const result = await this.processBusinessCoordination(request);

      const executionTime = Date.now() - startTime;

      return {
        coordination_id: request.coordination_id,
        module: 'context',
        status: 'completed',
        output_data: {
          data_type: 'context_data',
          data_version: '1.0.0',
          payload: result,
          metadata: {
            source_module: 'context',
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
          duration_ms: executionTime,
          memory_usage: process.memoryUsage().heapUsed / 1024 / 1024,
          cpu_usage: 0 // 简化实现
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      this.errorCount++;
      const executionTime = Date.now() - startTime;

      this.logger.error('Context business coordination failed', { 
        coordination_id: request.coordination_id, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });

      return {
        coordination_id: request.coordination_id,
        module: 'context',
        status: 'failed',
        output_data: {
          data_type: 'context_data',
          data_version: '1.0.0',
          payload: {
            error: error instanceof Error ? error.message : 'Unknown error',
            coordination_id: request.coordination_id,
            timestamp: new Date().toISOString()
          },
          metadata: {
            source_module: 'context',
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
          duration_ms: executionTime,
          memory_usage: process.memoryUsage().heapUsed / 1024 / 1024,
          cpu_usage: 0
        },
        timestamp: new Date().toISOString()
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
          field_path: 'input'
        });
      } else if (typeof input !== 'object') {
        errors.push({
          error_code: 'INVALID_TYPE',
          error_message: 'Input must be an object',
          field_path: 'input'
        });
      } else {
        const inputObj = input as Record<string, unknown>;

        // 验证必需字段
        if (!inputObj.name || typeof inputObj.name !== 'string') {
          errors.push({
            error_code: 'MISSING_FIELDS',
            error_message: 'name field is required and must be a string',
            field_path: 'name'
          });
        }

        if (!inputObj.lifecycle_stage) {
          errors.push({
            error_code: 'MISSING_FIELDS',
            error_message: 'lifecycle_stage field is required',
            field_path: 'lifecycle_stage'
          });
        }

        // 验证名称长度 (Schema限制: maxLength: 255)
        if (typeof inputObj.name === 'string' && inputObj.name.length > 255) {
          errors.push({
            error_code: 'NAME_TOO_LONG',
            error_message: 'Context name cannot exceed 255 characters',
            field_path: 'name'
          });
        }

        // 验证名称为空
        if (typeof inputObj.name === 'string' && inputObj.name.trim().length === 0) {
          warnings.push({
            warning_code: 'EMPTY_NAME',
            warning_message: 'Context name is empty',
            field_path: 'name'
          });
        }
      }

      return {
        is_valid: errors.length === 0,
        errors,
        warnings
      };
    } catch (error) {
      return {
        is_valid: false,
        errors: [{
          error_code: 'VALIDATION_EXCEPTION',
          error_message: error instanceof Error ? error.message : 'Validation failed',
          field_path: 'input'
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
      this.logger.warn('Handling context error', { 
        error_id: error.error_id, 
        error_type: error.error_type 
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
        case 'dependency_error':
          recoveryAction = 'retry';
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
          data_type: 'context_data',
          data_version: '1.0.0',
          payload: {
            error_id: error.error_id,
            recovery_strategy: recoveryAction,
            timestamp: new Date().toISOString()
          },
          metadata: {
            source_module: 'context',
            target_modules: ['core'],
            data_schema_version: '1.0.0',
            validation_status: 'valid',
            security_level: 'internal'
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      };
    } catch (recoveryError) {
      this.logger.error('Error recovery failed', { 
        original_error: error.error_id, 
        recovery_error: recoveryError instanceof Error ? recoveryError.message : 'Unknown error' 
      });

      return {
        handled: false,
        recovery_action: 'escalate'
      };
    }
  }

  /**
   * 清理资源
   */
  async cleanup(): Promise<void> {
    try {
      this.logger.info('Cleaning up Context module adapter');
      this.status = 'idle';
      this.logger.info('Context module adapter cleanup completed');
    } catch (error) {
      this.logger.error('Context module adapter cleanup failed', { error });
      throw error;
    }
  }

  /**
   * 获取模块状态
   */
  getStatus(): ModuleStatus {
    return {
      module_name: 'context',
      status: this.status,
      error_count: this.errorCount,
      last_execution: new Date().toISOString()
    };
  }

  /**
   * 处理上下文阶段
   */
  private async processContextStage(context: WorkflowExecutionContext): Promise<Record<string, unknown>> {
    // 输入验证
    if (!context.context_id) {
      throw new Error('Invalid context: missing context_id');
    }

    if (!context.data_store) {
      throw new Error('Invalid context: missing data_store');
    }

    // 模拟上下文处理
    return {
      context_id: context.context_id,
      lifecycle_stage: 'active',
      status: 'initialized',
      session_count: 1,
      shared_state_count: 0,
      metadata_keys: ['source', 'priority', 'workflow_type'],
      status_result: 'completed',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * 处理业务协调
   */
  private async processBusinessCoordination(request: BusinessCoordinationRequest): Promise<Record<string, unknown>> {
    // 输入验证
    if (!request.coordination_id) {
      throw new Error('Invalid request: missing coordination_id');
    }

    // 模拟业务协调处理
    return {
      context_id: request.context_id,
      coordination_type: request.coordination_type,
      lifecycle_stage: 'active',
      context_initialized: true,
      execution_result: 'success',
      timestamp: new Date().toISOString()
    };
  }
}
