/**
 * MPLP错误处理管理器
 * 
 * @description L3层统一错误处理，提供错误捕获、记录和恢复功能
 * @version 1.0.0
 * @integration 与所有10个模块统一集成
 */

/**
 * 错误级别枚举
 */
export type ErrorLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

/**
 * MPLP错误接口
 */
export interface MLPPError {
  id: string;
  level: ErrorLevel;
  message: string;
  timestamp: string;
  source: string;
  stack?: string;
  metadata?: Record<string, unknown>;
}

/**
 * MPLP错误处理管理器
 * 
 * @description 统一的错误处理实现，所有模块使用相同的错误处理策略
 */
export class MLPPErrorHandler {
  private errors: MLPPError[] = [];

  /**
   * 记录错误
   */
  async logError(
    level: ErrorLevel,
    message: string,
    source: string,
    error?: Error,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    const mlppError: MLPPError = {
      id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      level,
      message,
      timestamp: new Date().toISOString(),
      source,
      stack: error?.stack,
      metadata
    };

    this.errors.push(mlppError);
    
    // 保持错误日志大小限制
    if (this.errors.length > 1000) {
      this.errors = this.errors.slice(-500);
    }
  }

  /**
   * 获取错误日志
   */
  getErrors(filter?: { level?: ErrorLevel; source?: string }): MLPPError[] {
    if (!filter) return this.errors;
    
    return this.errors.filter(error => {
      if (filter.level && error.level !== filter.level) return false;
      if (filter.source && error.source !== filter.source) return false;
      return true;
    });
  }

  /**
   * 处理未捕获的错误
   */
  async handleUncaughtError(error: Error, source: string): Promise<void> {
    await this.logError('fatal', error.message, source, error);
  }

  /**
   * 健康检查
   */
  async healthCheck(): Promise<boolean> {
    return true;
  }
}
