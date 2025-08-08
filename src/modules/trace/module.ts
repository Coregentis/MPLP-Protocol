/**
 * Trace模块集成
 * 
 * DDD架构的模块集成和依赖注入配置
 * 
 * @version 1.0.0
 * @created 2025-09-16
 */

import { Logger } from '../../public/utils/logger';

// Domain层
import { TraceFactory } from './domain/factories/trace.factory';
import { TraceAnalysisService } from './domain/services/trace-analysis.service';

// Infrastructure层
import { TraceRepository } from './infrastructure/repositories/trace.repository';

// Application层
import { TraceManagementService } from './application/services/trace-management.service';

// API层
import { TraceController } from './api/controllers/trace.controller';

/**
 * 模块配置选项
 */
export interface TraceModuleOptions {
  enableLogging?: boolean;
  enablePerformanceMonitoring?: boolean;
  enableAutoCorrelation?: boolean;
  dataSource?: unknown; // 数据源配置，生产环境中应该是真实的数据库连接
  retentionDays?: number; // 追踪数据保留天数
}

/**
 * 模块导出接口
 */
export interface TraceModuleExports {
  traceController: TraceController;
  traceManagementService: TraceManagementService;
  traceAnalysisService: TraceAnalysisService;
}

/**
 * 初始化Trace模块
 */
export async function initializeTraceModule(
  options: TraceModuleOptions = {}
): Promise<TraceModuleExports> {
  const logger = new Logger('TraceModule');
  
  try {
    // 创建领域层组件
    const traceFactory = new TraceFactory();
    const analysisService = new TraceAnalysisService();
    
    // 创建基础设施层组件
    const traceRepository = new TraceRepository();
    
    // 创建应用层组件
    const traceManagementService = new TraceManagementService(
      traceRepository,
      traceFactory,
      analysisService
    );
    
    // 创建API层组件
    const traceController = new TraceController(traceManagementService);
    
    // 配置选项
    if (options.enableAutoCorrelation) {
      logger.info('Auto-correlation enabled for trace module');
      // 这里可以添加自动关联检测的定时任务
    }

    if (options.retentionDays) {
      logger.info(`Trace retention set to ${options.retentionDays} days`);
      // 这里可以添加定期清理过期追踪的定时任务
    }
    
    logger.info('Trace module initialized successfully');
    
    return {
      traceController,
      traceManagementService,
      traceAnalysisService: analysisService
    };
  } catch (error) {
    logger.error('Failed to initialize Trace module', error);
    throw error;
  }
}
