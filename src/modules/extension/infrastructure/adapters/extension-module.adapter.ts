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
  StageExecutionResult
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

  constructor(
    private readonly extensionService: ExtensionManagementService
  ) {
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
      this.logger.error('Failed to initialize Extension module adapter', { error });
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
      this.logger.info('Executing extension stage', { context_id: context.contextId });

      // 处理扩展阶段
      const result = await this.processExtensionStage(context);

      const completedAt = new Date().toISOString();
      const duration = Date.now() - startTime;

      return {
        stage: 'extension',
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

      this.logger.error('Extension stage execution failed', { 
        context_id: context.contextId, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });

      return {
        stage: 'extension',
        status: 'failed',
        result: {
          error: error instanceof Error ? error.message : 'Unknown error',
          context_id: context.contextId,
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
      this.logger.info('Executing extension business coordination', { 
        coordination_id: request.coordination_id 
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

      this.logger.error('Extension business coordination failed', { 
        coordination_id: request.coordination_id, 
        error: error instanceof Error ? error.message : 'Unknown error' 
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
            timestamp: new Date().toISOString()
          },
          metadata: {
            source_module: 'extension',
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
        if (!inputObj.plugins || !Array.isArray(inputObj.plugins)) {
          errors.push({
            error_code: 'MISSING_FIELDS',
            error_message: 'plugins field is required and must be an array',
            field_path: 'plugins'
          });
        }

        if (!inputObj.context) {
          errors.push({
            error_code: 'MISSING_FIELDS',
            error_message: 'context field is required',
            field_path: 'context'
          });
        }

        // 验证插件数组
        if (Array.isArray(inputObj.plugins) && inputObj.plugins.length === 0) {
          warnings.push({
            warning_code: 'EMPTY_PLUGINS',
            warning_message: 'No plugins specified for extension processing',
            field_path: 'plugins'
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
      this.logger.warn('Handling extension error', { 
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
            timestamp: new Date().toISOString()
          },
          metadata: {
            source_module: 'extension',
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
      last_execution: new Date().toISOString()
    };
  }

  /**
   * 处理扩展阶段
   */
  private async processExtensionStage(context: WorkflowExecutionContext): Promise<Record<string, unknown>> {
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
      extension_id: uuidv4(),
      coordination_type: request.coordination_type,
      plugins_executed: ['plugin-1', 'plugin-2'],
      execution_result: 'success',
      timestamp: new Date().toISOString()
    };
  }
}
