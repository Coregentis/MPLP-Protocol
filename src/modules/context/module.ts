/**
 * Context模块初始化
 * 
 * @description Context模块的统一初始化和配置管理
 * @version 1.0.0
 * @layer 模块层 - 初始化
 */

import { ContextModuleAdapter, ContextModuleAdapterConfig } from './infrastructure/adapters/context-module.adapter';
import { ContextController } from './api/controllers/context.controller';
import { ContextManagementService } from './application/services/context-management.service';
import { MemoryContextRepository } from './infrastructure/repositories/context.repository';

/**
 * Context模块选项
 */
export interface ContextModuleOptions {
  enableLogging?: boolean;
  enableCaching?: boolean;
  enableMetrics?: boolean;
  repositoryType?: 'memory' | 'database' | 'file';
  dataSource?: unknown;
  maxCacheSize?: number;
  cacheTimeout?: number;
}

/**
 * Context模块结果
 */
export interface ContextModuleResult {
  contextController: ContextController;
  contextManagementService: ContextManagementService;
  contextRepository: MemoryContextRepository;
  contextModuleAdapter: ContextModuleAdapter;
  healthCheck: () => Promise<boolean>;
  shutdown: () => Promise<void>;
  getStatistics: () => Promise<Record<string, unknown>>;
}

/**
 * 初始化Context模块
 * 
 * @description 创建和配置Context模块的所有组件
 * @param options - 模块配置选项
 * @returns Promise<ContextModuleResult> - 初始化结果
 */
export async function initializeContextModule(
  options: ContextModuleOptions = {}
): Promise<ContextModuleResult> {
  try {
    // 准备适配器配置
    const adapterConfig: ContextModuleAdapterConfig = {
      enableLogging: options.enableLogging ?? true,
      enableCaching: options.enableCaching ?? false,
      enableMetrics: options.enableMetrics ?? false,
      repositoryType: options.repositoryType ?? 'memory',
      maxCacheSize: options.maxCacheSize ?? 1000,
      cacheTimeout: options.cacheTimeout ?? 300000
    };

    // 创建模块适配器
    const contextModuleAdapter = new ContextModuleAdapter(adapterConfig);

    // 初始化适配器
    await contextModuleAdapter.initialize();

    // 获取组件实例
    const contextController = contextModuleAdapter.getController();
    const contextManagementService = contextModuleAdapter.getService();
    const contextRepository = contextModuleAdapter.getRepository();

    // 创建便捷方法
    const healthCheck = async (): Promise<boolean> => {
      const health = await contextModuleAdapter.healthCheck();
      return health.status === 'healthy';
    };

    const shutdown = async (): Promise<void> => {
      await contextModuleAdapter.shutdown();
    };

    const getStatistics = async (): Promise<Record<string, unknown>> => {
      return await contextModuleAdapter.getStatistics();
    };

    // 记录初始化成功
    if (adapterConfig.enableLogging) {
      // TODO: 使用适当的日志机制
      void 'Context module initialized successfully';
      void adapterConfig;
    }

    return {
      contextController,
      contextManagementService,
      contextRepository,
      contextModuleAdapter,
      healthCheck,
      shutdown,
      getStatistics
    };

  } catch (error) {
    const errorMessage = `Failed to initialize Context module: ${error instanceof Error ? error.message : 'Unknown error'}`;
    
    if (options.enableLogging !== false) {
      // TODO: 使用适当的错误处理机制
      void errorMessage;
    }
    
    throw new Error(errorMessage);
  }
}

/**
 * 创建Context模块的快速配置
 * 
 * @description 提供常用配置的快速创建方法
 */
export const ContextModulePresets = {
  
  /**
   * 开发环境配置
   */
  development: (): ContextModuleOptions => ({
    enableLogging: true,
    enableCaching: false,
    enableMetrics: true,
    repositoryType: 'memory',
    maxCacheSize: 100,
    cacheTimeout: 60000 // 1分钟
  }),

  /**
   * 测试环境配置
   */
  testing: (): ContextModuleOptions => ({
    enableLogging: false,
    enableCaching: false,
    enableMetrics: false,
    repositoryType: 'memory',
    maxCacheSize: 50,
    cacheTimeout: 30000 // 30秒
  }),

  /**
   * 生产环境配置
   */
  production: (): ContextModuleOptions => ({
    enableLogging: true,
    enableCaching: true,
    enableMetrics: true,
    repositoryType: 'database',
    maxCacheSize: 10000,
    cacheTimeout: 600000 // 10分钟
  }),

  /**
   * 高性能配置
   */
  highPerformance: (): ContextModuleOptions => ({
    enableLogging: false,
    enableCaching: true,
    enableMetrics: true,
    repositoryType: 'memory',
    maxCacheSize: 50000,
    cacheTimeout: 1800000 // 30分钟
  })
};

/**
 * Context模块工厂
 * 
 * @description 提供不同环境的Context模块创建方法
 */
export class ContextModuleFactory {
  
  /**
   * 创建开发环境的Context模块
   */
  static async createForDevelopment(): Promise<ContextModuleResult> {
    return await initializeContextModule(ContextModulePresets.development());
  }

  /**
   * 创建测试环境的Context模块
   */
  static async createForTesting(): Promise<ContextModuleResult> {
    return await initializeContextModule(ContextModulePresets.testing());
  }

  /**
   * 创建生产环境的Context模块
   */
  static async createForProduction(): Promise<ContextModuleResult> {
    return await initializeContextModule(ContextModulePresets.production());
  }

  /**
   * 创建高性能的Context模块
   */
  static async createForHighPerformance(): Promise<ContextModuleResult> {
    return await initializeContextModule(ContextModulePresets.highPerformance());
  }

  /**
   * 创建自定义配置的Context模块
   */
  static async createWithCustomConfig(options: ContextModuleOptions): Promise<ContextModuleResult> {
    return await initializeContextModule(options);
  }
}

/**
 * 默认导出：初始化函数
 */
export default initializeContextModule;

/**
 * Context模块版本信息
 */
export const ContextModuleInfo = {
  name: 'Context',
  version: '1.0.0',
  description: 'MPLP Context Module - Multi-Agent Protocol Lifecycle Platform Context Management',
  author: 'MPLP Team',
  license: 'MIT',
  dependencies: {
    'typescript': '^5.0.0'
  },
  features: [
    'Context lifecycle management',
    'Shared state management',
    'Access control and permissions',
    'Audit trail and compliance',
    'Performance monitoring',
    'Version history',
    'Search and indexing',
    'Caching and synchronization',
    'Error handling and recovery',
    'Integration endpoints',
    'Event-driven architecture'
  ],
  architecture: {
    layer: 'L2 Coordination Layer',
    pattern: 'Domain-Driven Design (DDD)',
    concerns: [
      'security',
      'performance', 
      'eventBus',
      'errorHandler',
      'coordination',
      'orchestration',
      'stateSync',
      'transaction',
      'protocolVersion'
    ]
  }
};
