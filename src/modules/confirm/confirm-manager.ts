/**
 * MPLP Confirm模块管理器
 * 
 * @version v1.0.2
 * @updated 2025-07-10T17:15:00+08:00
 * @compliance 100% Schema合规性 - 基于confirm-protocol.json重构
 * @description 高级管理层，封装服务层复杂性，提供业务友好的接口
 */

import { ConfirmService } from './confirm-service';
import { 
  ConfirmProtocol, 
  CreateConfirmRequest,
  UpdateConfirmRequest,
  ConfirmResponse,
  BatchConfirmRequest,
  BatchConfirmResponse,
  StepActionRequest,
  WorkflowActionResponse,
  ConfirmFilter,
  ConfirmationType,
  ConfirmStatus,
  Priority,
  UUID,
  ConfirmError,
  ValidationError
} from './types';
import { logger } from '../../utils/logger';

/**
 * Confirm模块管理器配置
 */
interface ConfirmManagerConfig {
  autoInitialize?: boolean;
  enablePerformanceMonitoring?: boolean;
  defaultTimeout?: number;
  maxConcurrentRequests?: number;
}

/**
 * 管理器状态
 */
interface ManagerStatus {
  initialized: boolean;
  uptime_ms: number;
  total_requests: number;
  active_confirmations: number;
  error_count: number;
  last_error?: string;
}

/**
 * Confirm模块管理器
 * 
 * 负责协调Confirm模块的各项功能，提供统一的管理接口：
 * - 服务层封装和简化
 * - 业务逻辑协调
 * - 性能监控和健康检查
 * - 配置管理和状态跟踪
 */
export class ConfirmManager {
  private confirmService: ConfirmService;
  private isInitialized: boolean = false;
  private startTime: number = Date.now();
  private requestCount: number = 0;
  private errorCount: number = 0;
  private lastError?: string;
  private config: ConfirmManagerConfig;

  /**
   * 构造函数
   */
  constructor(config: ConfirmManagerConfig = {}) {
    this.config = {
      autoInitialize: true,
      enablePerformanceMonitoring: true,
      defaultTimeout: 30000,
      maxConcurrentRequests: 100,
      ...config
    };
    
    this.confirmService = new ConfirmService();
    
    logger.info('ConfirmManager constructed', {
      manager: 'confirm',
      config: this.config,
      timestamp: new Date().toISOString()
    });

    if (this.config.autoInitialize) {
      this.initialize().catch(error => {
        logger.error('Auto-initialization failed', { error: error.message });
      });
    }
  }

  /**
   * 初始化管理器
   * 
   * @returns Promise<void>
   */
  public async initialize(): Promise<void> {
    try {
      if (this.isInitialized) {
        logger.warn('ConfirmManager already initialized');
        return;
      }

      // 验证服务层健康状态
      const healthStatus = await this.confirmService.getHealthStatus();
      if (healthStatus.status !== 'healthy') {
        throw new Error(`Service layer unhealthy: ${JSON.stringify(healthStatus.checks)}`);
      }

      this.isInitialized = true;
      this.startTime = Date.now();
      
      logger.info('ConfirmManager initialized successfully', {
        manager: 'confirm',
        service_health: healthStatus.status,
        initialization_time: new Date().toISOString()
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.lastError = errorMessage;
      this.errorCount++;
      
      logger.error('Failed to initialize ConfirmManager', {
        error: errorMessage,
        manager: 'confirm'
      });
      throw error;
    }
  }

  /**
   * 创建确认请求（业务友好接口）
   * 
   * @param request 创建请求参数
   * @returns Promise<ConfirmResponse>
   */
  public async createConfirmation(request: CreateConfirmRequest): Promise<ConfirmResponse> {
    this.ensureInitialized();
    this.requestCount++;
    
    try {
      logger.debug('Creating confirmation via manager', {
        type: request.confirmation_type,
        priority: request.priority,
        context_id: request.context_id
      });

      const result = await this.confirmService.createConfirmation(request);
      
      if (!result.success) {
        this.errorCount++;
        this.lastError = result.error?.message;
      }

      return result;

    } catch (error) {
      this.errorCount++;
      this.lastError = error instanceof Error ? error.message : String(error);
      
      logger.error('Failed to create confirmation via manager', {
        error: this.lastError,
        request_type: request.confirmation_type
      });

      throw error;
    }
  }

  /**
   * 更新确认状态（业务友好接口）
   * 
   * @param confirmId 确认ID
   * @param updates 更新内容
   * @returns Promise<ConfirmResponse>
   */
  public async updateConfirmation(
    confirmId: UUID, 
    updates: Partial<UpdateConfirmRequest>
  ): Promise<ConfirmResponse> {
    this.ensureInitialized();
    this.requestCount++;

    try {
      const updateRequest: UpdateConfirmRequest = {
        confirm_id: confirmId,
        ...updates
      };

      logger.debug('Updating confirmation via manager', {
        confirm_id: confirmId,
        updates: Object.keys(updates)
      });

      const result = await this.confirmService.updateConfirmation(confirmId, updateRequest);
      
      if (!result.success) {
        this.errorCount++;
        this.lastError = result.error?.message;
      }

      return result;

    } catch (error) {
      this.errorCount++;
      this.lastError = error instanceof Error ? error.message : String(error);
      
      logger.error('Failed to update confirmation via manager', {
        error: this.lastError,
        confirm_id: confirmId
      });

      throw error;
    }
  }

  /**
   * 处理工作流步骤操作（业务友好接口）
   * 
   * @param confirmId 确认ID
   * @param action 步骤操作
   * @returns Promise<WorkflowActionResponse>
   */
  public async processStepAction(
    confirmId: UUID, 
    action: StepActionRequest
  ): Promise<WorkflowActionResponse> {
    this.ensureInitialized();
    this.requestCount++;

    try {
      logger.debug('Processing step action via manager', {
        confirm_id: confirmId,
        step_id: action.step_id,
        action: action.action
      });

      const result = await this.confirmService.processStepAction(confirmId, action);
      return result;

    } catch (error) {
      this.errorCount++;
      this.lastError = error instanceof Error ? error.message : String(error);
      
      logger.error('Failed to process step action via manager', {
        error: this.lastError,
        confirm_id: confirmId,
        step_id: action.step_id
      });

      throw error;
    }
  }

  /**
   * 查询确认列表（业务友好接口）
   * 
   * @param filter 查询过滤器
   * @returns Promise<ConfirmProtocol[]>
   */
  public async queryConfirmations(filter?: ConfirmFilter): Promise<ConfirmProtocol[]> {
    this.ensureInitialized();
    this.requestCount++;

    try {
      logger.debug('Querying confirmations via manager', { filter });

      const results = await this.confirmService.queryConfirmations(filter);
      return results;

    } catch (error) {
      this.errorCount++;
      this.lastError = error instanceof Error ? error.message : String(error);
      
      logger.error('Failed to query confirmations via manager', {
        error: this.lastError,
        filter
      });

      throw error;
    }
  }

  /**
   * 批量处理确认请求（业务友好接口）
   * 
   * @param batchRequest 批量请求
   * @returns Promise<BatchConfirmResponse>
   */
  public async processBatchConfirmations(batchRequest: BatchConfirmRequest): Promise<BatchConfirmResponse> {
    this.ensureInitialized();
    this.requestCount++;

    try {
      logger.info('Processing batch confirmations via manager', {
        batch_size: batchRequest.requests.length,
        options: batchRequest.batch_options
      });

      const result = await this.confirmService.batchCreateConfirmations(batchRequest);
      
      if (!result.success) {
        this.errorCount++;
        this.lastError = `Batch processing failed: ${result.summary.failed}/${result.summary.total} items failed`;
      }

      return result;

    } catch (error) {
      this.errorCount++;
      this.lastError = error instanceof Error ? error.message : String(error);
      
      logger.error('Failed to process batch confirmations via manager', {
        error: this.lastError,
        batch_size: batchRequest.requests.length
      });

      throw error;
    }
  }

  /**
   * 快速创建简单确认（便捷方法）
   * 
   * @param contextId 上下文ID
   * @param type 确认类型
   * @param priority 优先级
   * @param title 标题
   * @param description 描述
   * @returns Promise<ConfirmResponse>
   */
  public async createSimpleConfirmation(
    contextId: UUID,
    type: ConfirmationType,
    priority: Priority,
    title: string,
    description: string
  ): Promise<ConfirmResponse> {
    const request: CreateConfirmRequest = {
      context_id: contextId,
      confirmation_type: type,
      priority,
      subject: {
        title,
        description,
        impact_assessment: {
          scope: 'task',
          business_impact: 'low',
          technical_impact: 'low'
        }
      }
    };

    return this.createConfirmation(request);
  }

  /**
   * 获取管理器状态
   * 
   * @returns ManagerStatus
   */
  public getStatus(): ManagerStatus {
    return {
      initialized: this.isInitialized,
      uptime_ms: Date.now() - this.startTime,
      total_requests: this.requestCount,
      active_confirmations: 0, // TODO: 实现活跃确认计数
      error_count: this.errorCount,
      last_error: this.lastError
    };
  }

  /**
   * 健康检查
   * 
   * @returns Promise<{ status: string; details: any }>
   */
  public async healthCheck(): Promise<{ status: string; details: any }> {
    try {
      const serviceHealth = await this.confirmService.getHealthStatus();
      const managerStatus = this.getStatus();
      
      const isHealthy = this.isInitialized && 
                       serviceHealth.status === 'healthy' && 
                       (this.errorCount === 0 || this.requestCount > 0 && this.errorCount / this.requestCount < 0.1);

      return {
        status: isHealthy ? 'healthy' : 'unhealthy',
        details: {
          manager: managerStatus,
          service: serviceHealth,
          timestamp: new Date().toISOString(),
          config: this.config
        }
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        status: 'unhealthy',
        details: {
          error: errorMessage,
          manager_status: this.getStatus(),
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  /**
   * 关闭管理器
   * 
   * @returns Promise<void>
   */
  public async shutdown(): Promise<void> {
    try {
      logger.info('Shutting down ConfirmManager', {
        manager: 'confirm',
        final_status: this.getStatus()
      });

      this.isInitialized = false;
      
      // TODO: 清理资源、关闭连接等

      logger.info('ConfirmManager shutdown completed');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Error during ConfirmManager shutdown', {
        error: errorMessage,
        manager: 'confirm'
      });
      throw error;
    }
  }

  /**
   * 确保管理器已初始化
   * 
   * @private
   */
  private ensureInitialized(): void {
    if (!this.isInitialized) {
      throw new ValidationError('ConfirmManager is not initialized. Call initialize() first.');
    }
  }
} 