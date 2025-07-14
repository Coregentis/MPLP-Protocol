/**
 * MPLP基础错误类
 * 
 * 所有错误类型的基类，提供统一的错误结构和行为
 * 
 * @version 1.0.0
 * @since 2025-07-23
 */

import { ErrorType } from '../../interfaces/error-handling.interface';

/**
 * 基础错误类
 * 所有MPLP错误的基类
 */
export class MPLPError extends Error {
  /**
   * 错误代码
   */
  public readonly code: string;
  
  /**
   * 错误类型
   */
  public readonly type: ErrorType;
  
  /**
   * 错误详情
   */
  public readonly details?: unknown;
  
  /**
   * 错误时间戳
   */
  public readonly timestamp: string;
  
  /**
   * 是否可重试
   */
  public readonly retryable: boolean;
  
  /**
   * 创建基础错误实例
   * 
   * @param message 错误消息
   * @param code 错误代码
   * @param type 错误类型
   * @param details 错误详情
   * @param retryable 是否可重试
   */
  constructor(
    message: string,
    code: string,
    type: ErrorType = 'system',
    details?: unknown,
    retryable = false
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.type = type;
    this.details = details;
    this.timestamp = new Date().toISOString();
    this.retryable = retryable;
    
    // 确保错误对象的堆栈跟踪正确捕获
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  /**
   * 获取错误信息对象
   * 用于序列化错误信息
   */
  public toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      type: this.type,
      details: this.details,
      timestamp: this.timestamp,
      retryable: this.retryable,
      stack: this.stack
    };
  }
  
  /**
   * 获取错误的简短描述
   */
  public toString(): string {
    return `[${this.code}] ${this.message}`;
  }
}

/**
 * 系统错误类
 * 表示系统级别的错误，如内部服务器错误、配置错误等
 */
export class SystemError extends MPLPError {
  constructor(message: string, code: string, details?: unknown, retryable = false) {
    super(message, code, 'system', details, retryable);
  }
}

/**
 * 业务错误类
 * 表示业务逻辑错误，如资源不存在、状态无效等
 */
export class BusinessError extends MPLPError {
  constructor(message: string, code: string, details?: unknown, retryable = false) {
    super(message, code, 'business', details, retryable);
  }
}

/**
 * 验证错误类
 * 表示数据验证错误，如必填字段缺失、格式无效等
 */
export class ValidationError extends MPLPError {
  constructor(message: string, code: string, details?: unknown, retryable = false) {
    super(message, code, 'validation', details, retryable);
  }
}

/**
 * 网络错误类
 * 表示网络通信错误，如连接超时、主机不可达等
 */
export class NetworkError extends MPLPError {
  constructor(message: string, code: string, details?: unknown, retryable = true) {
    super(message, code, 'network', details, retryable);
  }
}

/**
 * 超时错误类
 * 表示操作超时错误，如请求超时、处理超时等
 */
export class TimeoutError extends MPLPError {
  constructor(message: string, code: string, details?: unknown, retryable = true) {
    super(message, code, 'timeout', details, retryable);
  }
}

/**
 * 安全错误类
 * 表示安全相关错误，如认证失败、授权失败等
 */
export class SecurityError extends MPLPError {
  constructor(message: string, code: string, details?: unknown, retryable = false) {
    super(message, code, 'security', details, retryable);
  }
} 