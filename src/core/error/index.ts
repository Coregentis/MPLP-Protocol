/**
 * MPLP错误处理系统
 * 
 * 提供统一的错误处理功能，包括错误类型、错误代码、错误处理器和中间件
 * 
 * @version 1.0.0
 * @since 2025-07-23
 */

// 导出错误处理接口
export {
  ErrorType,
  RecoveryAction,
  ErrorSeverity,
  StackTraceItem,
  RecoveryActionItem,
  ErrorInformation,
  IErrorHandler,
  ErrorContext,
  ErrorConverter,
  ErrorHandlingConfig,
  IErrorHandlerFactory,
  HttpErrorResponse
} from '../../interfaces/error-handling.interface';

// 导出错误类
export {
  MPLPError,
  SystemError,
  BusinessError,
  ValidationError,
  NetworkError,
  TimeoutError,
  SecurityError
} from './base-error';

// 导出错误代码
export {
  SystemErrorCodes,
  BusinessErrorCodes,
  ValidationErrorCodes,
  SecurityErrorCodes,
  NetworkErrorCodes,
  TimeoutErrorCodes,
  ErrorCodes
} from './error-codes';

// 导出错误处理器
export { 
  ErrorHandler,
  ErrorHandlerFactory
} from './error-handler';

// 导出HTTP错误处理中间件
export {
  createHttpErrorMiddleware,
  createNotFoundMiddleware
} from './http-error-middleware';

// 导入所需的类型和函数
import { ErrorHandlingConfig } from '../../interfaces/error-handling.interface';
import { ErrorHandlerFactory } from './error-handler';
import { createHttpErrorMiddleware, createNotFoundMiddleware } from './http-error-middleware';

// 创建默认错误处理器实例
export const defaultErrorHandler = ErrorHandlerFactory.createErrorHandler();

/**
 * 创建错误处理系统
 * 
 * @param config 错误处理配置
 * @returns 错误处理系统
 */
export function createErrorHandlingSystem(config?: Partial<ErrorHandlingConfig>) {
  const errorHandler = ErrorHandlerFactory.createErrorHandler(config);
  const httpErrorMiddleware = createHttpErrorMiddleware(errorHandler);
  const notFoundMiddleware = createNotFoundMiddleware();
  
  return {
    errorHandler,
    httpErrorMiddleware,
    notFoundMiddleware
  };
} 