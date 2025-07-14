/**
 * MPLP Trace模块入口
 * 
 * @version v1.0.1
 * @created 2025-07-10T13:30:00+08:00
 * @compliance trace-protocol.json Schema v1.0.0 - 100%合规
 */

// 导出类型定义
export * from './types';

// 导出核心类
export { TraceManager } from './trace-manager';
export { TraceService, TraceServiceConfig } from './trace-service';

// 导出适配器工厂
export { 
  TraceAdapterFactory
} from '../../adapters/trace/adapter-factory';

// 重新导出AdapterType (从接口文件)
export { AdapterType } from '../../interfaces/trace-adapter.interface';

// 导出基础适配器
export { 
  BaseTraceAdapter, 
  BaseTraceAdapterConfig 
} from '../../adapters/trace/base-trace-adapter';

// 导出增强型适配器
export { 
  EnhancedTraceAdapter, 
  EnhancedTraceAdapterConfig 
} from '../../adapters/trace/enhanced-trace-adapter';

/**
 * 创建Trace模块实例
 * @returns Trace模块实例
 */
export function createTraceModule() {
  // 导入依赖
  const { Logger } = require('../../utils/logger');
  const logger = new Logger('TraceModule');
  
  // 创建适配器工厂
  const { TraceAdapterFactory } = require('../../adapters/trace/adapter-factory');
  const { AdapterType } = require('../../interfaces/trace-adapter.interface');
  const adapterFactory = TraceAdapterFactory.getInstance({
    defaultType: AdapterType.BASE,
    enableAutoDetection: true,
    enableCache: true,
    cacheSize: 10
  });
  
  // 创建默认适配器
  const defaultAdapter = adapterFactory.createAdapter();
  
  // 创建追踪管理器
  const { TraceManager } = require('./trace-manager');
  const traceManager = new TraceManager(defaultAdapter);
  
  // 创建追踪服务
  const { TraceService } = require('./trace-service');
  const traceService = new TraceService(traceManager, {
    enabled: true,
    sampling_rate: 1.0
  });
  
  logger.info('Trace module initialized');
  
  return {
    traceManager,
    traceService,
    adapterFactory
  };
}

/**
 * 创建自定义Trace模块实例
 * @param config 配置
 * @returns Trace模块实例
 */
export function createCustomTraceModule(config: {
  adapterType?: string;
  adapterConfig?: Record<string, unknown>;
  serviceConfig?: Record<string, unknown>;
}) {
  // 导入依赖
  const { Logger } = require('../../utils/logger');
  const logger = new Logger('TraceModule');
  
  // 创建适配器工厂
  const { TraceAdapterFactory } = require('../../adapters/trace/adapter-factory');
  const adapterFactory = TraceAdapterFactory.getInstance();
  
  // 创建自定义适配器
  const adapter = adapterFactory.createAdapter(
    config.adapterType,
    config.adapterConfig || {}
  );
  
  // 创建追踪管理器
  const { TraceManager } = require('./trace-manager');
  const traceManager = new TraceManager(adapter);
  
  // 创建追踪服务
  const { TraceService } = require('./trace-service');
  const traceService = new TraceService(traceManager, config.serviceConfig);
  
  logger.info('Custom trace module initialized', {
    adapter_type: config.adapterType,
    adapter_info: adapter.getAdapterInfo()
  });
  
  return {
    traceManager,
    traceService,
    adapterFactory,
    adapter
  };
} 