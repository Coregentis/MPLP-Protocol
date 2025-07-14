/**
 * MPLP错误处理系统使用示例
 * 
 * 演示如何使用错误处理系统处理不同类型的错误
 * 
 * @version 1.0.0
 * @since 2025-07-23
 */

import express from 'express';
import { 
  createErrorHandlingSystem, 
  MPLPError, 
  SystemError, 
  BusinessError,
  ValidationError,
  NetworkError,
  TimeoutError,
  SecurityError,
  ErrorCodes
} from '../core/error';
import { logger } from '../utils/logger';

/**
 * 创建示例Express应用
 */
function createExampleApp() {
  const app = express();
  
  // 创建错误处理系统
  const { errorHandler, httpErrorMiddleware, notFoundMiddleware } = createErrorHandlingSystem({
    include_stack_trace: true,
    localization_enabled: false,
    capture_async_errors: true,
    max_stack_depth: 10
  });
  
  // 添加请求ID中间件
  app.use((req, res, next) => {
    req.headers['x-request-id'] = `req-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
    next();
  });
  
  // 示例路由：系统错误
  app.get('/api/examples/errors/system', (req, res, next) => {
    try {
      throw new SystemError('A system error occurred', ErrorCodes.INTERNAL_ERROR);
    } catch (error) {
      next(error);
    }
  });
  
  // 示例路由：业务错误
  app.get('/api/examples/errors/business', (req, res, next) => {
    try {
      throw new BusinessError('Resource not found', ErrorCodes.CONTEXT_NOT_FOUND, { resourceId: '12345' });
    } catch (error) {
      next(error);
    }
  });
  
  // 示例路由：验证错误
  app.get('/api/examples/errors/validation', (req, res, next) => {
    try {
      throw new ValidationError('Invalid input data', ErrorCodes.VALIDATION_ERROR, {
        fields: [
          { field: 'name', message: 'Name is required' },
          { field: 'email', message: 'Invalid email format' }
        ]
      });
    } catch (error) {
      next(error);
    }
  });
  
  // 示例路由：网络错误
  app.get('/api/examples/errors/network', (req, res, next) => {
    try {
      throw new NetworkError('Failed to connect to external service', ErrorCodes.SERVICE_COMMUNICATION_ERROR, {
        service: 'payment-gateway',
        endpoint: '/api/payments'
      }, true);
    } catch (error) {
      next(error);
    }
  });
  
  // 示例路由：超时错误
  app.get('/api/examples/errors/timeout', (req, res, next) => {
    try {
      throw new TimeoutError('Operation timed out', ErrorCodes.REQUEST_TIMEOUT, {
        operation: 'database-query',
        timeout_ms: 5000
      }, true);
    } catch (error) {
      next(error);
    }
  });
  
  // 示例路由：安全错误
  app.get('/api/examples/errors/security', (req, res, next) => {
    try {
      throw new SecurityError('Insufficient permissions', ErrorCodes.INSUFFICIENT_PERMISSIONS, {
        required_permission: 'admin:write',
        user_permissions: ['user:read', 'user:write']
      });
    } catch (error) {
      next(error);
    }
  });
  
  // 示例路由：标准JS错误
  app.get('/api/examples/errors/standard', (req, res, next) => {
    try {
      throw new Error('A standard JavaScript error');
    } catch (error) {
      next(error);
    }
  });
  
  // 示例路由：异步错误
  app.get('/api/examples/errors/async', async (req, res, next) => {
    try {
      await Promise.reject(new BusinessError('Async operation failed', ErrorCodes.OPERATION_NOT_PERMITTED));
    } catch (error) {
      next(error);
    }
  });
  
  // 示例路由：手动错误处理
  app.get('/api/examples/errors/manual', (req, res) => {
    try {
      // 模拟错误
      throw new ValidationError('Manual validation error', ErrorCodes.SCHEMA_VALIDATION_FAILED);
    } catch (error) {
      // 手动处理错误
      const errorInfo = errorHandler.handleError(error, {
        module: 'example',
        component: 'manual-handler',
        function: 'GET /api/examples/errors/manual'
      });
      
      // 记录错误
      logger.error('Manual error handling', { errorInfo });
      
      // 发送响应
      res.status(422).json({
        success: false,
        error: {
          code: errorInfo.error_code,
          message: errorInfo.error_message,
          type: errorInfo.error_type
        }
      });
    }
  });
  
  // 示例路由：恢复建议
  app.get('/api/examples/errors/recovery', (req, res, next) => {
    try {
      // 模拟网络错误
      const error = new NetworkError('Network connection failed', ErrorCodes.CONNECTION_REFUSED, {
        host: 'api.example.com',
        port: 443
      }, true);
      
      // 获取恢复建议
      const recoveryActions = errorHandler.getRecoveryActions(error);
      
      // 发送响应
      res.json({
        error: {
          code: error.code,
          message: error.message,
          type: error.type
        },
        recovery_actions: recoveryActions
      });
    } catch (error) {
      next(error);
    }
  });
  
  // 添加错误处理中间件
  app.use(httpErrorMiddleware);
  
  // 添加404处理中间件
  app.use(notFoundMiddleware);
  
  return app;
}

/**
 * 启动示例应用
 */
function startExampleApp() {
  const app = createExampleApp();
  const port = process.env.PORT || 3000;
  
  app.listen(port, () => {
    logger.info(`Error handling example app listening on port ${port}`);
    logger.info('Available routes:');
    logger.info('- GET /api/examples/errors/system');
    logger.info('- GET /api/examples/errors/business');
    logger.info('- GET /api/examples/errors/validation');
    logger.info('- GET /api/examples/errors/network');
    logger.info('- GET /api/examples/errors/timeout');
    logger.info('- GET /api/examples/errors/security');
    logger.info('- GET /api/examples/errors/standard');
    logger.info('- GET /api/examples/errors/async');
    logger.info('- GET /api/examples/errors/manual');
    logger.info('- GET /api/examples/errors/recovery');
  });
}

// 如果直接运行此文件，启动示例应用
if (require.main === module) {
  startExampleApp();
}

export { createExampleApp }; 