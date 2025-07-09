/**
 * MPLP v1.0 Express服务器配置
 * 
 * @version v1.0.0
 * @created 2025-07-09T21:00:00+08:00
 * @compliance .cursor/rules/technical-standards.mdc - Express服务器配置
 * @compliance .cursor/rules/security-requirements.mdc - 安全中间件
 * @compliance .cursor/rules/monitoring-logging.mdc - 监控和日志
 * @performance API响应P95<100ms，健康检查<3秒
 */

import express, { Application, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { config } from '@/config';
import { logger } from '@/utils/logger';
import { PerformanceMonitor } from '@/utils/performance';
import { TracePilotAdapter } from '@/mcp/tracepilot-adapter';
import { healthRouter } from '@/routes/health';
import { metricsRouter } from '@/routes/metrics';

/**
 * 创建Express应用实例
 */
export async function createServer(): Promise<Application> {
  const app = express();

  // 初始化TracePilot适配器
  const tracePilotAdapter = new TracePilotAdapter(config.tracepilot);
  
  // 将TracePilot适配器添加到app locals，供其他模块使用
  app.locals.tracePilotAdapter = tracePilotAdapter;

  logger.info('🔧 配置Express中间件...', {
    environment: config.app.environment,
    tracePilotEnabled: config.tracepilot.integration.enabled
  });

  // 安全中间件 (security-requirements.mdc)
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"]
      }
    },
    crossOriginEmbedderPolicy: false
  }));

  // CORS配置
  app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
  }));

  // 压缩中间件
  app.use(compression());

  // 请求日志 (monitoring-logging.mdc)
  app.use(morgan('combined', {
    stream: {
      write: (message: string) => {
        logger.info(message.trim(), { source: 'morgan' });
      }
    }
  }));

  // 请求体解析
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // 速率限制 (security-requirements.mdc)
  const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15分钟
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
    message: {
      success: false,
      error: 'Too many requests from this IP',
      error_code: 'RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false
  });
  app.use(limiter);

  // 性能监控中间件 (performance-standards.mdc)
  app.use(performanceMiddleware);

  // TracePilot请求追踪中间件
  app.use(tracePilotTrackingMiddleware(tracePilotAdapter));

  // 请求ID中间件
  app.use(requestIdMiddleware);

  // 路由配置
  await configureRoutes(app);

  // 全局错误处理中间件
  app.use(errorHandlerMiddleware);

  // 404处理
  app.use(notFoundMiddleware);

  logger.info('✅ Express服务器配置完成', {
    middlewares: [
      'helmet',
      'cors', 
      'compression',
      'morgan',
      'rateLimit',
      'performance',
      'tracePilot'
    ]
  });

  return app;
}

/**
 * 配置应用路由
 */
async function configureRoutes(app: Application): Promise<void> {
  logger.info('🛣️  配置应用路由...');

  // 健康检查路由
  app.use('/health', healthRouter);

  // 监控指标路由
  app.use('/metrics', metricsRouter);

  // API版本路由
  app.use('/api/v1', await createApiRoutes());

  // 根路径
  app.get('/', (req: Request, res: Response) => {
    res.json({
      success: true,
      message: 'MPLP v1.0 API Server',
      version: config.app.version,
      timestamp: new Date().toISOString(),
      tracePilotEnabled: config.tracepilot.integration.enabled,
      governance: {
        version: '2.2',
        plan_confirm_trace_delivery: true
      }
    });
  });

  logger.info('✅ 路由配置完成');
}

/**
 * 创建API路由
 */
async function createApiRoutes(): Promise<express.Router> {
  const router = express.Router();

  // 占位符路由，后续会添加6个核心模块的路由
  router.get('/status', (req: Request, res: Response) => {
    res.json({
      success: true,
      modules: {
        context: 'pending',
        plan: 'pending',
        confirm: 'pending',
        trace: 'pending', 
        role: 'pending',
        extension: 'pending'
      },
      tracePilot: {
        enabled: config.tracepilot.integration.enabled,
        status: 'connected' // 这里后续会实现真实的连接状态检查
      }
    });
  });

  return router;
}

/**
 * 性能监控中间件
 */
function performanceMiddleware(req: Request, res: Response, next: NextFunction): void {
  const startTime = process.hrtime.bigint();
  
  res.on('finish', () => {
    const endTime = process.hrtime.bigint();
    const responseTimeMs = Number(endTime - startTime) / 1000000;
    
    // 记录性能指标
    logger.info('API请求性能', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      responseTime: responseTimeMs,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });
    
    // 性能告警 (performance-standards.mdc)
    if (responseTimeMs > 100) {
      logger.warn('API响应时间超标', {
        method: req.method,
        url: req.url,
        responseTime: responseTimeMs,
        target: 100
      });
    }
  });
  
  next();
}

/**
 * TracePilot追踪中间件
 */
function tracePilotTrackingMiddleware(tracePilotAdapter: TracePilotAdapter) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const traceId = req.get('X-Trace-ID') || generateTraceId();
    
    // 添加追踪信息到请求对象
    req.traceId = traceId;
    req.tracePilotAdapter = tracePilotAdapter;
    
    // 设置响应头
    res.setHeader('X-Trace-ID', traceId);
    
    const startTime = Date.now();
    
    res.on('finish', async () => {
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      try {
        // 同步请求追踪到TracePilot
        await tracePilotAdapter.syncTraceData({
          trace_id: traceId,
          operation_name: `${req.method} ${req.path}`,
          start_time: new Date(startTime).toISOString(),
          end_time: new Date(endTime).toISOString(),
          duration_ms: duration,
          context_id: req.get('X-Context-ID') || 'anonymous',
          version: '1.0.0',
          timestamp: new Date().toISOString(),
          trace_type: 'operation',
          status: res.statusCode >= 400 ? 'failed' : 'completed',
          performance_metrics: {
            cpu_usage: 0, // 后续实现
            memory_usage_mb: process.memoryUsage().heapUsed / 1024 / 1024,
            network_io_bytes: 0,
            disk_io_bytes: 0,
            db_query_count: 0,
            db_query_time_ms: 0,
            api_call_count: 1,
            api_call_time_ms: duration,
            custom_metrics: {
              http_status_code: res.statusCode,
              request_size_bytes: parseInt(req.get('Content-Length') || '0', 10)
            }
          },
          tags: {
            method: req.method,
            path: req.path,
            status_code: res.statusCode.toString(),
            user_agent: req.get('User-Agent') || 'unknown'
          }
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'TracePilot sync error';
        logger.error('TracePilot同步失败', {
          traceId,
          error: errorMessage
        });
      }
    });
    
    next();
  };
}

/**
 * 请求ID中间件
 */
function requestIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  const requestId = req.get('X-Request-ID') || generateRequestId();
  req.requestId = requestId;
  res.setHeader('X-Request-ID', requestId);
  next();
}

/**
 * 全局错误处理中间件
 */
function errorHandlerMiddleware(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  logger.error('未处理的错误', {
    error: error.message,
    stack: error.stack,
    method: req.method,
    url: req.url,
    traceId: req.traceId,
    requestId: req.requestId
  });

  const statusCode = (error as any).statusCode || 500;
  const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
  
  res.status(statusCode).json({
    success: false,
    error: errorMessage,
    error_code: (error as any).code || 'INTERNAL_ERROR',
    timestamp: new Date().toISOString(),
    request_id: req.requestId,
    trace_id: req.traceId
  });
}

/**
 * 404处理中间件
 */
function notFoundMiddleware(req: Request, res: Response): void {
  logger.warn('404 - 路由未找到', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  res.status(404).json({
    success: false,
    error: 'Route not found',
    error_code: 'ROUTE_NOT_FOUND',
    timestamp: new Date().toISOString(),
    request_id: req.requestId
  });
}

/**
 * 生成追踪ID
 */
function generateTraceId(): string {
  return `trace-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 生成请求ID
 */
function generateRequestId(): string {
  return `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// 扩展Express Request接口
declare global {
  namespace Express {
    interface Request {
      traceId?: string;
      requestId?: string;
      tracePilotAdapter?: TracePilotAdapter;
    }
  }
} 