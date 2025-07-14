/**
 * MPLP v1.0 Express服务器配置
 * 
 * @version v1.0.2
 * @created 2025-07-09T21:00:00+08:00
 * @updated 2025-07-16T16:00:00+08:00
 * @compliance .cursor/rules/technical-standards.mdc - Express服务器配置
 * @compliance .cursor/rules/security-requirements.mdc - 安全中间件
 * @compliance .cursor/rules/monitoring-logging.mdc - 监控和日志
 * @compliance .cursor/rules/vendor-neutral-design.mdc - 厂商中立设计
 * @performance API响应P95<100ms，健康检查<3秒
 */

import express, { Application, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import { logger } from './utils/logger';
import { PerformanceMonitor } from './utils/performance';
// 更新导入，使用厂商中立的适配器工厂
import { TraceAdapterFactory } from './adapters/trace/adapter-factory';
import { healthRouter } from './routes/health';
import { metricsRouter } from './routes/metrics';
import { v4 as uuidv4 } from 'uuid';
import { ITraceAdapter, AdapterType } from './interfaces/trace-adapter.interface';
import { MPLPTraceData } from './types/trace';
import { createErrorHandlingSystem, ErrorSeverity } from './core/error';

/**
 * 创建Express应用实例
 */
export async function createServer(): Promise<Application> {
  const app = express();

  // 初始化追踪适配器（厂商中立）
  const isEnhanced = process.env.TRACE_ADAPTER_ENHANCED === 'true' || process.env.TRACEPILOT_ENHANCED === 'true';
  
  // 获取厂商中立的适配器工厂实例
  const adapterFactory = TraceAdapterFactory.getInstance();
  
  // 创建厂商中立的适配器
  const traceAdapter = adapterFactory.createAdapter(
    isEnhanced ? AdapterType.ENHANCED : AdapterType.BASE,
    {
      name: isEnhanced ? 'enhanced-trace-adapter' : 'base-trace-adapter',
      version: '1.0.1',
      batchSize: config.traceAdapter.batchSize,
      timeout: config.traceAdapter.timeout,
      cacheEnabled: true,
      // 增强型适配器特定配置
      ...(isEnhanced ? {
        enableAdvancedAnalytics: true,
        enableRecoverySuggestions: true,
        enableDevelopmentIssueDetection: true
      } : {})
    }
  );
  
  // 将追踪适配器添加到app locals，供其他模块使用
  app.locals.traceAdapter = traceAdapter;

  logger.info('🔧 配置Express中间件...', {
    environment: config.app.environment,
    traceAdapterType: isEnhanced ? 'enhanced' : 'base'
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

  // 追踪请求中间件（厂商中立）
  app.use(traceTrackingMiddleware(traceAdapter));

  // 请求ID中间件
  app.use(requestIdMiddleware);

  // 路由配置
  await configureRoutes(app);

  // 创建错误处理系统
  const { httpErrorMiddleware, notFoundMiddleware } = createErrorHandlingSystem({
    include_stack_trace: process.env.NODE_ENV !== 'production',
    localization_enabled: true,
    default_locale: process.env.DEFAULT_LOCALE || 'en',
    log_level: process.env.NODE_ENV === 'production' ? ErrorSeverity.ERROR : ErrorSeverity.DEBUG,
    capture_async_errors: true,
    max_stack_depth: process.env.NODE_ENV === 'production' ? 5 : 20
  });

  // 全局错误处理中间件
  app.use(httpErrorMiddleware);

  // 404处理
  app.use(notFoundMiddleware);

  logger.info('✅ Express服务器配置完成', {
    middlewares: [
      'helmet',
      'cors',
      'compression',
      'morgan',
      'json',
      'urlencoded',
      'rateLimit',
      'performance',
      'traceTracking',
      'requestId'
    ],
    routes: [
      '/health',
      '/metrics',
      '/api/v1/*'
    ]
  });

  return app;
}

/**
 * 配置路由
 */
async function configureRoutes(app: Application): Promise<void> {
  // 健康检查路由
  app.use('/health', healthRouter);
  
  // 指标路由
  app.use('/metrics', metricsRouter);
  
  // API路由
  const apiRouter = await createApiRoutes(app);
  app.use('/api/v1', apiRouter);
  
  logger.info('🔌 路由已配置', {
    routes: ['/health', '/metrics', '/api/v1'],
    traceAdapterEnabled: config.traceAdapter.integration.enabled,
    governance: {
      version: '2.2',
      plan_confirm_trace_delivery: true
    }
  });
}

/**
 * 创建API路由
 */
async function createApiRoutes(app: Application): Promise<express.Router> {
  const router = express.Router();

  // 导入Context模块
  const { createContextModule, createDefaultContextConfig } = await import('@/modules/context');
  const { AppDataSource } = await import('@/database/data-source');
  
  // 初始化Context模块
  try {
    const contextConfig = createDefaultContextConfig();
    const contextModule = await createContextModule({
      dataSource: AppDataSource,
      config: contextConfig,
      // Redis和SocketIO稍后集成
      redisClient: undefined,
      socketServer: undefined,
      // 使用traceAdapter替代tracePilotAdapter
      tracePilotAdapter: app.locals.traceAdapter
    });

    // 集成Context路由
    router.use('/contexts', contextModule.router);
    
    logger.info('Context模块已集成到API路由', {
      module: 'Context',
      routes: '/api/v1/contexts'
    });

  } catch (error) {
    logger.error('Context模块集成失败', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }

  // 模块状态路由
  router.get('/status', (req: Request, res: Response) => {
    res.json({
      success: true,
      modules: {
        context: 'active', // Context模块已实现
        plan: 'pending',
        confirm: 'pending',
        trace: 'pending', 
        role: 'pending',
        extension: 'pending'
      },
      version: config.app.version,
      environment: config.app.environment,
      trace_adapter: app.locals.traceAdapter.getAdapterInfo()
    });
  });

  return router;
}

/**
 * 生成追踪ID
 */
function generateTraceId(): string {
  return uuidv4();
}

/**
 * 请求ID中间件
 */
function requestIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  const requestId = req.get('X-Request-ID') || uuidv4();
  req.requestId = requestId;
  res.setHeader('X-Request-ID', requestId);
  next();
}

/**
 * 性能监控中间件
 */
function performanceMiddleware(req: Request, res: Response, next: NextFunction): void {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const responseTimeMs = Date.now() - startTime;
    
    if (responseTimeMs > 100) {
      logger.warn('响应时间超过100ms', {
        path: req.path,
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
 * 追踪中间件（厂商中立）
 */
function traceTrackingMiddleware(traceAdapter: ITraceAdapter) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const traceId = req.get('X-Trace-ID') || generateTraceId();
    
    // 添加追踪信息到请求对象
    req.traceId = traceId;
    req.traceAdapter = traceAdapter;
    
    // 设置响应头
    res.setHeader('X-Trace-ID', traceId);
    
    const startTime = Date.now();
    
    res.on('finish', async () => {
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      try {
        // 同步请求追踪（厂商中立）
        await traceAdapter.syncTraceData({
          trace_id: traceId,
          operation_name: `${req.method} ${req.path}`,
          start_time: new Date(startTime).toISOString(),
          end_time: new Date(endTime).toISOString(),
          duration_ms: duration,
          context_id: req.get('X-Context-ID') || 'anonymous',
          protocol_version: '1.0.0',
          timestamp: new Date().toISOString(),
          trace_type: 'operation',
          source: 'http_server',
          status: res.statusCode >= 400 ? 'failed' : 'completed',
          performance_metrics: {
            cpu_usage: 0, // 后续实现
            memory_usage_mb: process.memoryUsage().heapUsed / 1024 / 1024,
            network_io_bytes: 0,
            disk_io_bytes: 0
          },
          metadata: {
            method: req.method,
            path: req.path,
            status_code: res.statusCode,
            user_agent: req.get('User-Agent'),
            ip: req.ip
          },
          events: [],
          error_info: res.statusCode >= 400 ? {
            error_type: 'HTTP_ERROR',
            error_message: `HTTP ${res.statusCode}`,
            stack_trace: '',
            timestamp: new Date().toISOString()
          } : null,
          parent_trace_id: req.get('X-Parent-Trace-ID') || null,
          adapter_metadata: {
            agent_id: traceAdapter.getAdapterInfo().type,
            session_id: req.requestId || uuidv4(),
            operation_complexity: 'low',
            expected_duration_ms: 100,
            quality_gates: {
              max_duration_ms: 500,
              max_memory_mb: 100,
              max_error_rate: 0.01,
              required_events: []
            }
          }
        });
      } catch (error) {
        logger.error('Failed to sync trace data', {
          error: error instanceof Error ? error.message : 'Unknown error',
          trace_id: traceId
        });
      }
    });
    
    next();
  };
}

/**
 * 错误处理中间件
 */
function errorHandlerMiddleware(err: Error, req: Request, res: Response, next: NextFunction): void {
  logger.error('服务器错误', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    trace_id: req.traceId
  });
  
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    error_code: 'INTERNAL_SERVER_ERROR',
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
    error: 'Not Found',
    error_code: 'NOT_FOUND'
  });
}

// 扩展Request接口
declare global {
  namespace Express {
    interface Request {
      requestId?: string;
      traceId?: string;
      traceAdapter?: ITraceAdapter;
    }
  }
} 