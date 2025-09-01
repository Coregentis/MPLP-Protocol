/**
 * Core模块初始化
 * 
 * @description 基于Context、Plan、Role、Confirm等模块的企业级标准，提供Core模块的统一初始化和配置管理
 * @version 1.0.0
 * @layer 模块层 - 初始化
 * @pattern 与Context、Plan、Role等模块使用IDENTICAL的模块初始化模式
 */

import { CoreModuleAdapter, CoreModuleAdapterConfig } from './infrastructure/adapters/core-module.adapter';
import { CoreController } from './api/controllers/core.controller';
import { CoreManagementService } from './application/services/core-management.service';
import { CoreMonitoringService } from './application/services/core-monitoring.service';
import { CoreOrchestrationService } from './application/services/core-orchestration.service';
import { CoreResourceService } from './application/services/core-resource.service';
import { CoreReservedInterfacesService } from './application/services/core-reserved-interfaces.service';
import { CoreServicesCoordinator } from './application/coordinators/core-services-coordinator';
import { MemoryCoreRepository } from './infrastructure/repositories/core.repository';
import { CoreProtocol } from './infrastructure/protocols/core.protocol';
// import { UUID } from './types'; // 暂未使用

/**
 * Core模块选项
 */
export interface CoreModuleOptions {
  enableLogging?: boolean;
  enableCaching?: boolean;
  enableMetrics?: boolean;
  repositoryType?: 'memory' | 'database' | 'file';
  dataSource?: unknown;
  maxCacheSize?: number;
  cacheTimeout?: number;
  enableCoordination?: boolean;
  enableReservedInterfaces?: boolean;
}

/**
 * Core模块初始化结果
 */
export interface CoreModuleResult {
  coreController: CoreController;
  managementService: CoreManagementService;
  monitoringService: CoreMonitoringService;
  orchestrationService: CoreOrchestrationService;
  resourceService: CoreResourceService;
  reservedInterfacesService?: CoreReservedInterfacesService;
  coordinator?: CoreServicesCoordinator;
  repository: MemoryCoreRepository;
  protocol: CoreProtocol;
  moduleAdapter: CoreModuleAdapter;
  healthCheck: () => Promise<{ 
    status: 'healthy' | 'degraded' | 'unhealthy'; 
    components: Record<string, boolean>;
    timestamp: string;
  }>;
  shutdown: () => Promise<void>;
  getStatistics: () => Promise<{
    totalWorkflows: number;
    activeWorkflows: number;
    completedWorkflows: number;
    failedWorkflows: number;
    averageDuration: number;
    resourceUtilization: number;
  }>;
  getModuleInfo: () => {
    name: string;
    version: string;
    description: string;
    layer: string;
    status: string;
    features: string[];
    dependencies: string[];
  };
}

/**
 * 初始化Core模块
 * 
 * @description 创建并配置Core模块的所有组件，返回统一的访问接口
 */
export async function initializeCoreModule(options: CoreModuleOptions = {}): Promise<CoreModuleResult> {
  // 1. 准备适配器配置
  const adapterConfig: CoreModuleAdapterConfig = {
    enableLogging: options.enableLogging ?? true,
    enableCaching: options.enableCaching ?? false,
    enableMetrics: options.enableMetrics ?? false,
    repositoryType: options.repositoryType ?? 'memory',
    maxCacheSize: options.maxCacheSize ?? 1000,
    cacheTimeout: options.cacheTimeout ?? 300000, // 5分钟
    enableCoordination: options.enableCoordination ?? true,
    enableReservedInterfaces: options.enableReservedInterfaces ?? true
  };

  // 2. 创建模块适配器
  const moduleAdapter = new CoreModuleAdapter(adapterConfig);

  // 3. 等待适配器初始化完成
  // 注意：适配器在构造函数中异步初始化，这里需要等待
  await new Promise(resolve => setTimeout(resolve, 100));

  // 4. 获取核心组件
  const components = moduleAdapter.getComponents();

  // 5. 创建控制器
  const coreController = new CoreController(
    components.managementService,
    components.orchestrationService,
    components.resourceService,
    components.monitoringService
  );

  // 6. 创建健康检查函数
  const healthCheck = async () => {
    return await moduleAdapter.getHealthStatus();
  };

  // 7. 创建关闭函数
  const shutdown = async () => {
    // 执行清理操作
    if (adapterConfig.enableLogging) {
      // eslint-disable-next-line no-console
      console.log('Shutting down Core module...');
    }
    // TODO: 实现具体的清理逻辑
  };

  // 8. 创建统计信息函数
  const getStatistics = async () => {
    const stats = await components.managementService.getWorkflowStatistics();
    return {
      ...stats,
      resourceUtilization: 50 // 简化实现，添加缺失的字段
    };
  };

  // 9. 创建模块信息函数
  const getModuleInfo = () => {
    return moduleAdapter.getModuleInfo();
  };

  // 10. 返回模块结果
  return {
    coreController,
    managementService: components.managementService,
    monitoringService: components.monitoringService,
    orchestrationService: components.orchestrationService,
    resourceService: components.resourceService,
    reservedInterfacesService: components.reservedInterfacesService,
    coordinator: components.coordinator,
    repository: components.repository as MemoryCoreRepository,
    protocol: components.protocol,
    moduleAdapter,
    healthCheck,
    shutdown,
    getStatistics,
    getModuleInfo
  };
}

/**
 * 创建Core模块的快速配置
 */
export function createCoreModuleConfig(preset: 'development' | 'production' | 'testing'): CoreModuleOptions {
  switch (preset) {
    case 'development':
      return {
        enableLogging: true,
        enableCaching: false,
        enableMetrics: true,
        repositoryType: 'memory',
        enableCoordination: true,
        enableReservedInterfaces: true
      };
    
    case 'production':
      return {
        enableLogging: true,
        enableCaching: true,
        enableMetrics: true,
        repositoryType: 'database', // 生产环境使用数据库
        maxCacheSize: 10000,
        cacheTimeout: 600000, // 10分钟
        enableCoordination: true,
        enableReservedInterfaces: true
      };
    
    case 'testing':
      return {
        enableLogging: false,
        enableCaching: false,
        enableMetrics: false,
        repositoryType: 'memory',
        enableCoordination: false,
        enableReservedInterfaces: false
      };
    
    default:
      throw new Error(`Unknown preset: ${preset}`);
  }
}

/**
 * 验证Core模块配置
 */
export function validateCoreModuleConfig(options: CoreModuleOptions): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 验证仓库类型
  if (options.repositoryType && !['memory', 'database', 'file'].includes(options.repositoryType)) {
    errors.push(`Invalid repository type: ${options.repositoryType}`);
  }

  // 验证缓存配置
  if (options.enableCaching && options.maxCacheSize && options.maxCacheSize < 100) {
    warnings.push('Cache size is very small, consider increasing it for better performance');
  }

  // 验证超时配置
  if (options.cacheTimeout && options.cacheTimeout < 60000) {
    warnings.push('Cache timeout is very short, consider increasing it');
  }

  // 验证生产环境配置
  if (options.repositoryType === 'database' && !options.dataSource) {
    warnings.push('Database repository selected but no data source provided');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Core模块默认配置
 */
export const DEFAULT_CORE_MODULE_CONFIG: CoreModuleOptions = {
  enableLogging: true,
  enableCaching: false,
  enableMetrics: false,
  repositoryType: 'memory',
  maxCacheSize: 1000,
  cacheTimeout: 300000, // 5分钟
  enableCoordination: true,
  enableReservedInterfaces: true
};

// ===== 便捷导出 =====

/**
 * 使用默认配置快速初始化Core模块
 */
export async function quickInitializeCoreModule(): Promise<CoreModuleResult> {
  return await initializeCoreModule(DEFAULT_CORE_MODULE_CONFIG);
}

/**
 * 使用开发配置初始化Core模块
 */
export async function initializeCoreModuleForDevelopment(): Promise<CoreModuleResult> {
  return await initializeCoreModule(createCoreModuleConfig('development'));
}

/**
 * 使用生产配置初始化Core模块
 */
export async function initializeCoreModuleForProduction(dataSource?: unknown): Promise<CoreModuleResult> {
  const config = createCoreModuleConfig('production');
  if (dataSource) {
    config.dataSource = dataSource;
  }
  return await initializeCoreModule(config);
}

/**
 * 使用测试配置初始化Core模块
 */
export async function initializeCoreModuleForTesting(): Promise<CoreModuleResult> {
  return await initializeCoreModule(createCoreModuleConfig('testing'));
}
