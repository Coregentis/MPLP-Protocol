/**
 * MPLP HTTP错误处理中间件
 * 
 * 用于处理API请求中的错误，将错误转换为标准HTTP响应
 * 
 * @version 1.0.0
 * @since 2025-07-23
 */

import { Request, Response, NextFunction } from 'express';
import { IErrorHandler } from '../../interfaces/error-handling.interface';
import { MPLPError, ValidationError, SecurityError, BusinessError } from './base-error';
import { logger } from '../../utils/logger';

/**
 * HTTP状态码映射
 */
const HTTP_STATUS_CODES: Record<string, number> = {
  // 系统错误 -> 500 Internal Server Error
  'system': 500,
  
  // 业务错误 -> 400 Bad Request
  'business': 400,
  
  // 验证错误 -> 422 Unprocessable Entity
  'validation': 422,
  
  // 网络错误 -> 502 Bad Gateway
  'network': 502,
  
  // 超时错误 -> 504 Gateway Timeout
  'timeout': 504,
  
  // 安全错误 -> 403 Forbidden
  'security': 403
};

/**
 * 特定错误代码状态码映射
 */
const ERROR_CODE_STATUS_MAPPING: Record<string, number> = {
  // 认证错误
  'SECURITY-4001': 401, // AUTHENTICATION_FAILED
  'SECURITY-4002': 401, // INVALID_CREDENTIALS
  'SECURITY-4003': 401, // TOKEN_EXPIRED
  'SECURITY-4004': 401, // TOKEN_INVALID
  'SECURITY-4005': 401, // SESSION_EXPIRED
  
  // 授权错误
  'SECURITY-4101': 403, // AUTHORIZATION_FAILED
  'SECURITY-4102': 403, // INSUFFICIENT_PERMISSIONS
  'SECURITY-4103': 403, // ACCESS_DENIED
  'SECURITY-4104': 403, // RESOURCE_ACCESS_DENIED
  'SECURITY-4105': 403, // OPERATION_FORBIDDEN
  
  // 资源错误
  'BUSINESS-2101': 404, // CONTEXT_NOT_FOUND
  'BUSINESS-2201': 404, // PLAN_NOT_FOUND
  'BUSINESS-2301': 404, // CONFIRMATION_NOT_FOUND
  'BUSINESS-2401': 404, // TRACE_NOT_FOUND
  'BUSINESS-2501': 404, // ROLE_NOT_FOUND
  'BUSINESS-2601': 404, // EXTENSION_NOT_FOUND
  
  // 冲突错误
  'BUSINESS-2004': 409, // RESOURCE_CONFLICT
  'BUSINESS-2102': 409, // CONTEXT_ALREADY_EXISTS
  'BUSINESS-2202': 409, // PLAN_ALREADY_EXISTS
  'BUSINESS-2602': 409, // EXTENSION_ALREADY_EXISTS
  
  // 速率限制错误
  'SECURITY-4202': 429, // RATE_LIMIT_EXCEEDED
  
  // 服务不可用错误
  'SYSTEM-1002': 503, // SERVICE_UNAVAILABLE
  'NETWORK-5202': 503  // SERVICE_UNAVAILABLE
};

/**
 * 创建HTTP错误处理中间件
 * 
 * @param errorHandler 错误处理器
 * @returns Express中间件函数
 */
export function createHttpErrorMiddleware(errorHandler: IErrorHandler) {
  return function httpErrorMiddleware(
    err: unknown,
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    try {
      // 处理错误
      const errorInfo = errorHandler.handleError(err, {
        module: 'api',
        component: 'http',
        function: `${req.method} ${req.path}`,
        request_id: req.headers['x-request-id'] as string || req.headers['x-correlation-id'] as string,
        additional_data: {
          method: req.method,
          path: req.path,
          query: req.query,
          ip: req.ip,
          user_agent: req.headers['user-agent']
        }
      });
      
      // 确定HTTP状态码
      let statusCode = 500;
      
      // 首先检查特定错误代码的映射
      if (errorInfo.error_code && ERROR_CODE_STATUS_MAPPING[errorInfo.error_code]) {
        statusCode = ERROR_CODE_STATUS_MAPPING[errorInfo.error_code];
      } 
      // 然后检查错误类型的映射
      else if (errorInfo.error_type && HTTP_STATUS_CODES[errorInfo.error_type]) {
        statusCode = HTTP_STATUS_CODES[errorInfo.error_type];
      }
      
      // 构建HTTP响应
      const responseBody = {
        success: false,
        error: {
          code: errorInfo.error_code,
          message: errorInfo.error_message,
          type: errorInfo.error_type,
          details: err instanceof MPLPError ? err.details : undefined
        },
        trace_id: req.headers['x-request-id'] as string || req.headers['x-correlation-id'] as string,
        timestamp: new Date().toISOString()
      };
      
      // 发送响应
      res.status(statusCode).json(responseBody);
      
    } catch (handlerError) {
      // 处理错误处理器本身的错误
      logger.error('Error in HTTP error middleware', {
        original_error: err instanceof Error ? err.message : String(err),
        handler_error: handlerError instanceof Error ? handlerError.message : String(handlerError)
      });
      
      // 发送通用错误响应
      res.status(500).json({
        success: false,
        error: {
          code: 'SYSTEM-1001',
          message: 'Internal server error',
          type: 'system'
        },
        timestamp: new Date().toISOString()
      });
    }
  };
}

/**
 * 创建404错误处理中间件
 * 
 * @returns Express中间件函数
 */
export function createNotFoundMiddleware() {
  return function notFoundMiddleware(req: Request, res: Response): void {
    logger.warn('Route not found', {
      method: req.method,
      path: req.path,
      ip: req.ip,
      user_agent: req.headers['user-agent']
    });
    
    res.status(404).json({
      success: false,
      error: {
        code: 'SYSTEM-1402',
        message: `Route not found: ${req.method} ${req.path}`,
        type: 'system'
      },
      timestamp: new Date().toISOString()
    });
  };
} 