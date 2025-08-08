/**
 * 模块适配器基类
 * @description 为各个MPLP协议模块提供统一的适配器接口
 * @author MPLP Team
 * @version 1.0.0
 */

import { Logger } from '../../../../public/utils/logger';
import {
  IModuleAdapter,
  ModuleMetadata,
  OperationResult,
  StageStatus,
  WorkflowStage
} from '../../types';

/**
 * 模块适配器配置接口
 */
export interface ModuleAdapterConfig {
  timeout_ms?: number;
  retry_attempts?: number;
  retry_delay_ms?: number;
  enable_health_check?: boolean;
  health_check_interval_ms?: number;
}

/**
 * 模块适配器基类
 */
export abstract class ModuleAdapterBase implements IModuleAdapter {
  protected logger: Logger;
  protected config: ModuleAdapterConfig;
  protected status: StageStatus = StageStatus.PENDING;
  protected lastHealthCheck?: Date;
  protected healthCheckTimer?: NodeJS.Timeout;

  constructor(
    protected stage: WorkflowStage,
    config: ModuleAdapterConfig = {}
  ) {
    this.config = {
      timeout_ms: 30000,
      retry_attempts: 3,
      retry_delay_ms: 1000,
      enable_health_check: true,
      health_check_interval_ms: 60000,
      ...config
    };

    this.logger = new Logger(`${stage}Adapter`);
    
    if (this.config.enable_health_check) {
      this.startHealthCheck();
    }
  }

  /**
   * 执行模块操作（抽象方法，由子类实现）
   */
  abstract execute(input: Record<string, any>): Promise<OperationResult>;

  /**
   * 获取模块状态
   */
  async getStatus(): Promise<StageStatus> {
    return this.status;
  }

  /**
   * 健康检查
   */
  async healthCheck(): Promise<boolean> {
    try {
      const isHealthy = await this.performHealthCheck();
      this.lastHealthCheck = new Date();
      
      if (isHealthy) {
        this.status = StageStatus.PENDING; // 健康状态，准备接受任务
      } else {
        this.status = StageStatus.FAILED;
      }
      
      return isHealthy;
    } catch (error) {
      this.logger.error('健康检查失败', {
        stage: this.stage,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      this.status = StageStatus.FAILED;
      return false;
    }
  }

  /**
   * 获取模块元数据
   */
  getMetadata(): ModuleMetadata {
    return {
      name: `${this.stage}-adapter`,
      version: '1.0.0',
      stage: this.stage,
      description: `Adapter for ${this.stage} module`,
      capabilities: this.getCapabilities()
    };
  }

  /**
   * 执行带重试的操作
   */
  protected async executeWithRetry<T>(
    operation: () => Promise<T>,
    context: string
  ): Promise<T> {
    let lastError: Error | null = null;
    const maxAttempts = this.config.retry_attempts || 3;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        this.logger.debug(`执行操作: ${context}`, {
          stage: this.stage,
          attempt,
          maxAttempts
        });

        const result = await this.executeWithTimeout(operation);
        
        if (attempt > 1) {
          this.logger.info(`操作重试成功: ${context}`, {
            stage: this.stage,
            attempt
          });
        }
        
        return result;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        this.logger.warn(`操作失败: ${context}`, {
          stage: this.stage,
          attempt,
          maxAttempts,
          error: lastError.message
        });

        if (attempt < maxAttempts) {
          const delay = this.config.retry_delay_ms || 1000;
          await this.sleep(delay * attempt); // 指数退避
        }
      }
    }

    throw lastError || new Error(`Operation failed after ${maxAttempts} attempts`);
  }

  /**
   * 执行带超时的操作
   */
  protected async executeWithTimeout<T>(
    operation: () => Promise<T>
  ): Promise<T> {
    const timeout = this.config.timeoutMs || 30000;
    
    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Operation timeout after ${timeout}ms`));
      }, timeout);

      operation()
        .then(result => {
          clearTimeout(timer);
          resolve(result);
        })
        .catch(error => {
          clearTimeout(timer);
          reject(error);
        });
    });
  }

  /**
   * 验证输入数据
   */
  protected validateInput(input: Record<string, any>, requiredFields: string[]): void {
    for (const field of requiredFields) {
      if (!(field in input) || input[field] === undefined || input[field] === null) {
        throw new Error(`Required field missing: ${field}`);
      }
    }
  }

  /**
   * 构建成功结果
   */
  protected buildSuccessResult<T>(data: T, message?: string): OperationResult<T> {
    return {
      success: true,
      data,
      details: message ? { message } : undefined
    };
  }

  /**
   * 构建失败结果
   */
  protected buildErrorResult(error: string, details?: Record<string, any>): OperationResult {
    return {
      success: false,
      error,
      details
    };
  }

  /**
   * 记录操作开始
   */
  protected logOperationStart(operation: string, input: Record<string, any>): void {
    this.status = StageStatus.RUNNING;
    this.logger.info(`开始执行: ${operation}`, {
      stage: this.stage,
      input: this.sanitizeLogData(input)
    });
  }

  /**
   * 记录操作完成
   */
  protected logOperationComplete(operation: string, result: any): void {
    this.status = StageStatus.COMPLETED;
    this.logger.info(`执行完成: ${operation}`, {
      stage: this.stage,
      result: this.sanitizeLogData(result)
    });
  }

  /**
   * 记录操作失败
   */
  protected logOperationError(operation: string, error: Error): void {
    this.status = StageStatus.FAILED;
    this.logger.error(`执行失败: ${operation}`, {
      stage: this.stage,
      error: error.message,
      stack: error.stack
    });
  }

  /**
   * 清理日志数据（移除敏感信息）
   */
  protected sanitizeLogData(data: any): any {
    if (!data || typeof data !== 'object') {
      return data;
    }

    const sensitiveFields = ['password', 'token', 'secret', 'key', 'auth'];
    const sanitized = { ...data };

    for (const field of sensitiveFields) {
      if (field in sanitized) {
        sanitized[field] = '***';
      }
    }

    return sanitized;
  }

  /**
   * 启动健康检查
   */
  private startHealthCheck(): void {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
    }

    const interval = this.config.health_check_interval_ms || 60000;
    this.healthCheckTimer = setInterval(async () => {
      await this.healthCheck();
    }, interval);
  }

  /**
   * 停止健康检查
   */
  public stopHealthCheck(): void {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = undefined;
    }
  }

  /**
   * 睡眠函数
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ===== 抽象方法，由子类实现 =====

  /**
   * 执行具体的健康检查（由子类实现）
   */
  protected abstract performHealthCheck(): Promise<boolean>;

  /**
   * 获取模块能力列表（由子类实现）
   */
  protected abstract getCapabilities(): string[];

  // ===== 清理资源 =====

  /**
   * 清理资源
   */
  public dispose(): void {
    this.stopHealthCheck();
    this.logger.info('模块适配器已清理', { stage: this.stage });
  }
}
