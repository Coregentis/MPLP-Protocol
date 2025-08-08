/**
 * MPLP Network Module Adapter
 *
 * @version v1.0.0
 * @created 2025-08-05T19:30:00+08:00
 * @description Network模块适配器，实现ModuleInterface接口，支持Core模块协调
 * 
 * 遵循规则：
 * - 零技术债务：严禁使用any类型
 * - 生产级代码质量：完整的错误处理和类型安全
 * - Schema驱动开发：基于network-protocol.json Schema
 */

import { v4 as uuidv4 } from 'uuid';
import { Logger } from '../../../../public/utils/logger';
import { NetworkService } from '../../application/services/network.service';
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
 * Network模块适配器
 * 实现Core模块的ModuleInterface接口
 */
export class NetworkModuleAdapter implements ModuleInterface {
  public readonly module_name = 'network';
  private status: 'idle' | 'initialized' | 'error' = 'idle';
  private errorCount = 0;
  private readonly logger: Logger;

  constructor(
    private readonly networkService: NetworkService
  ) {
    this.logger = new Logger('NetworkModuleAdapter');
  }

  /**
   * 初始化模块
   */
  async initialize(): Promise<void> {
    try {
      this.logger.info('Initializing Network module adapter');
      
      // 验证服务可用性
      if (!this.networkService) {
        throw new Error('NetworkService is required');
      }

      this.status = 'initialized';
      this.logger.info('Network module adapter initialized successfully');
    } catch (error) {
      this.status = 'error';
      this.errorCount++;
      this.logger.error('Failed to initialize Network module adapter', { error });
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
      this.logger.info('Executing network stage', { context_id: context.contextId });

      // 处理网络阶段
      const result = await this.processNetworkStage(context);

      const completedAt = new Date().toISOString();
      const duration = Date.now() - startTime;

      return {
        stage: 'network',
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

      this.logger.error('Network stage execution failed', { 
        context_id: context.contextId, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });

      return {
        stage: 'network',
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
      this.logger.info('Executing network business coordination', { 
        coordination_id: request.coordination_id 
      });

      // 处理业务协调请求
      const result = await this.processBusinessCoordination(request);

      const executionTime = Date.now() - startTime;

      return {
        coordination_id: request.coordination_id,
        module: 'network',
        status: 'completed',
        output_data: {
          data_type: 'network_data',
          data_version: '1.0.0',
          payload: result,
          metadata: {
            source_module: 'network',
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

      this.logger.error('Network business coordination failed', { 
        coordination_id: request.coordination_id, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });

      return {
        coordination_id: request.coordination_id,
        module: 'network',
        status: 'failed',
        output_data: {
          data_type: 'network_data',
          data_version: '1.0.0',
          payload: {
            error: error instanceof Error ? error.message : 'Unknown error',
            coordination_id: request.coordination_id,
            timestamp: new Date().toISOString()
          },
          metadata: {
            source_module: 'network',
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
        if (!inputObj.nodes || !Array.isArray(inputObj.nodes)) {
          errors.push({
            error_code: 'MISSING_FIELDS',
            error_message: 'nodes field is required and must be an array',
            field_path: 'nodes'
          });
        }

        if (!inputObj.topology) {
          errors.push({
            error_code: 'MISSING_FIELDS',
            error_message: 'topology field is required',
            field_path: 'topology'
          });
        }

        // 验证节点数组
        if (Array.isArray(inputObj.nodes) && inputObj.nodes.length === 0) {
          warnings.push({
            warning_code: 'EMPTY_NODES',
            warning_message: 'No nodes specified for network processing',
            field_path: 'nodes'
          });
        }

        // 验证节点数量限制 (Schema限制: maxItems: 1000)
        if (Array.isArray(inputObj.nodes) && inputObj.nodes.length > 1000) {
          errors.push({
            error_code: 'NODES_LIMIT_EXCEEDED',
            error_message: 'Number of nodes cannot exceed 1000',
            field_path: 'nodes'
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
      this.logger.warn('Handling network error', { 
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
          data_type: 'network_data',
          data_version: '1.0.0',
          payload: {
            error_id: error.error_id,
            recovery_strategy: recoveryAction,
            timestamp: new Date().toISOString()
          },
          metadata: {
            source_module: 'network',
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
      this.logger.info('Cleaning up Network module adapter');
      this.status = 'idle';
      this.logger.info('Network module adapter cleanup completed');
    } catch (error) {
      this.logger.error('Network module adapter cleanup failed', { error });
      throw error;
    }
  }

  /**
   * 获取模块状态
   */
  getStatus(): ModuleStatus {
    return {
      module_name: 'network',
      status: this.status,
      error_count: this.errorCount,
      last_execution: new Date().toISOString()
    };
  }

  /**
   * 处理网络阶段
   */
  private async processNetworkStage(context: WorkflowExecutionContext): Promise<Record<string, unknown>> {
    // 输入验证
    if (!context.contextId) {
      throw new Error('Invalid context: missing context_id');
    }

    if (!context.data_store) {
      throw new Error('Invalid context: missing data_store');
    }

    // 模拟网络处理
    return {
      network_id: uuidv4(),
      nodes_discovered: ['node-1', 'node-2', 'node-3'],
      topology_type: 'mesh',
      routing_strategy: 'shortest_path',
      nodes_count: 3,
      edges_count: 3,
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
      network_id: uuidv4(),
      coordination_type: request.coordination_type,
      nodes_processed: ['node-1', 'node-2'],
      routing_result: 'optimal_path_found',
      execution_result: 'success',
      timestamp: new Date().toISOString()
    };
  }
}
