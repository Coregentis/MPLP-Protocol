/**
 * CoreOrchestrator统一入口
 * 
 * @description 提供CoreOrchestrator的统一初始化、配置和管理接口
 * @version 1.0.0
 * @layer 模块层 - 统一入口
 * @pattern 与Context、Plan、Role等模块使用IDENTICAL的统一入口模式
 */

import { CoreOrchestratorFactory, CoreOrchestratorFactoryResult, CoreOrchestratorFactoryConfig } from './infrastructure/factories/core-orchestrator.factory';
import { CoreOrchestrator } from '../../core/orchestrator/core.orchestrator';
import { ReservedInterfaceActivator } from './domain/activators/reserved-interface.activator';

/**
 * CoreOrchestrator初始化选项
 */
export interface CoreOrchestratorOptions {
  environment?: 'development' | 'production' | 'testing';
  enableLogging?: boolean;
  enableMetrics?: boolean;
  enableCaching?: boolean;
  maxConcurrentWorkflows?: number;
  workflowTimeout?: number;
  enableReservedInterfaces?: boolean;
  enableModuleCoordination?: boolean;
  customConfig?: CoreOrchestratorFactoryConfig;
}

/**
 * CoreOrchestrator初始化结果
 */
export interface CoreOrchestratorResult {
  orchestrator: CoreOrchestrator;
  interfaceActivator: ReservedInterfaceActivator;
  healthCheck: () => Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    components: Record<string, boolean>;
    metrics: Record<string, number>;
  }>;
  shutdown: () => Promise<void>;
  getStatistics: () => Promise<{
    activeWorkflows: number;
    completedWorkflows: number;
    failedWorkflows: number;
    averageExecutionTime: number;
    resourceUtilization: number;
    moduleCoordinationCount: number;
    interfaceActivationCount: number;
  }>;
  getModuleInfo: () => {
    name: string;
    version: string;
    description: string;
    layer: string;
    status: string;
    capabilities: string[];
    supportedModules: string[];
  };
}

/**
 * 初始化CoreOrchestrator
 * 
 * @description 创建并配置CoreOrchestrator实例，返回统一的访问接口
 */
export async function initializeCoreOrchestrator(options: CoreOrchestratorOptions = {}): Promise<CoreOrchestratorResult> {
  // 1. 获取工厂实例
  const factory = CoreOrchestratorFactory.getInstance();

  // 2. 根据环境选择配置
  let factoryResult: CoreOrchestratorFactoryResult;
  
  if (options.customConfig) {
    factoryResult = await factory.createCoreOrchestrator(options.customConfig);
  } else {
    switch (options.environment) {
      case 'production':
        factoryResult = await factory.createProductionOrchestrator();
        break;
      case 'testing':
        factoryResult = await factory.createTestOrchestrator();
        break;
      case 'development':
      default:
        factoryResult = await factory.createDevelopmentOrchestrator();
        break;
    }
  }

  // 3. 应用自定义选项
  if (options.enableLogging !== undefined || options.enableMetrics !== undefined) {
    // 如果有自定义选项，重新创建配置
    const customConfig: CoreOrchestratorFactoryConfig = {
      enableLogging: options.enableLogging,
      enableMetrics: options.enableMetrics,
      enableCaching: options.enableCaching,
      maxConcurrentWorkflows: options.maxConcurrentWorkflows,
      workflowTimeout: options.workflowTimeout,
      enableReservedInterfaces: options.enableReservedInterfaces,
      enableModuleCoordination: options.enableModuleCoordination
    };
    factoryResult = await factory.createCoreOrchestrator(customConfig);
  }

  // 4. 创建统计信息函数
  const getStatistics = async () => {
    const workflowStats = await factoryResult.managementService.getWorkflowStatistics();
    return {
      activeWorkflows: workflowStats.activeWorkflows,
      completedWorkflows: workflowStats.completedWorkflows,
      failedWorkflows: workflowStats.failedWorkflows,
      averageExecutionTime: workflowStats.averageDuration,
      resourceUtilization: 50, // 简化实现
      moduleCoordinationCount: 0, // TODO: 实现实际的协调计数
      interfaceActivationCount: 0 // TODO: 实现实际的激活计数
    };
  };

  // 5. 创建模块信息函数
  const getModuleInfo = () => {
    return {
      name: 'CoreOrchestrator',
      version: '1.0.0',
      description: 'MPLP生态系统中央协调器 - L3执行层核心组件',
      layer: 'L3',
      status: 'active',
      capabilities: [
        '工作流编排',
        '模块协调',
        '预留接口激活',
        '资源管理',
        '性能监控',
        '事务管理',
        '状态同步',
        '事件总线协调',
        '安全验证',
        '错误处理'
      ],
      supportedModules: [
        'context', 'plan', 'role', 'confirm', 'trace',
        'extension', 'dialog', 'collab', 'network'
      ]
    };
  };

  return {
    orchestrator: factoryResult.orchestrator,
    interfaceActivator: factoryResult.interfaceActivator,
    healthCheck: factoryResult.healthCheck,
    shutdown: factoryResult.shutdown,
    getStatistics,
    getModuleInfo
  };
}

/**
 * 快速初始化CoreOrchestrator（使用默认配置）
 */
export async function quickInitializeCoreOrchestrator(): Promise<CoreOrchestratorResult> {
  return await initializeCoreOrchestrator({
    environment: 'development',
    enableLogging: true,
    enableMetrics: true,
    enableReservedInterfaces: true,
    enableModuleCoordination: true
  });
}

/**
 * 初始化生产环境CoreOrchestrator
 */
export async function initializeProductionCoreOrchestrator(): Promise<CoreOrchestratorResult> {
  return await initializeCoreOrchestrator({
    environment: 'production',
    enableLogging: true,
    enableMetrics: true,
    enableCaching: true,
    maxConcurrentWorkflows: 1000,
    workflowTimeout: 300000,
    enableReservedInterfaces: true,
    enableModuleCoordination: true
  });
}

/**
 * 初始化测试环境CoreOrchestrator
 */
export async function initializeTestCoreOrchestrator(): Promise<CoreOrchestratorResult> {
  return await initializeCoreOrchestrator({
    environment: 'testing',
    enableLogging: false,
    enableMetrics: false,
    enableReservedInterfaces: false,
    enableModuleCoordination: false
  });
}

/**
 * 创建CoreOrchestrator配置预设
 */
export function createCoreOrchestratorConfig(preset: 'minimal' | 'standard' | 'enterprise'): CoreOrchestratorOptions {
  switch (preset) {
    case 'minimal':
      return {
        environment: 'development',
        enableLogging: false,
        enableMetrics: false,
        enableCaching: false,
        maxConcurrentWorkflows: 5,
        workflowTimeout: 30000,
        enableReservedInterfaces: false,
        enableModuleCoordination: false
      };
    
    case 'standard':
      return {
        environment: 'development',
        enableLogging: true,
        enableMetrics: true,
        enableCaching: false,
        maxConcurrentWorkflows: 50,
        workflowTimeout: 120000,
        enableReservedInterfaces: true,
        enableModuleCoordination: true
      };
    
    case 'enterprise':
      return {
        environment: 'production',
        enableLogging: true,
        enableMetrics: true,
        enableCaching: true,
        maxConcurrentWorkflows: 1000,
        workflowTimeout: 300000,
        enableReservedInterfaces: true,
        enableModuleCoordination: true
      };
    
    default:
      throw new Error(`Unknown preset: ${preset}`);
  }
}

/**
 * 验证CoreOrchestrator配置
 */
export function validateCoreOrchestratorConfig(options: CoreOrchestratorOptions): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 验证并发工作流数量
  if (options.maxConcurrentWorkflows !== undefined && options.maxConcurrentWorkflows < 1) {
    errors.push('maxConcurrentWorkflows must be at least 1');
  }

  if (options.maxConcurrentWorkflows && options.maxConcurrentWorkflows > 10000) {
    warnings.push('maxConcurrentWorkflows is very high, consider system resources');
  }

  // 验证工作流超时
  if (options.workflowTimeout && options.workflowTimeout < 1000) {
    warnings.push('workflowTimeout is very short, workflows may timeout prematurely');
  }

  // 验证环境配置
  if (options.environment === 'production' && !options.enableMetrics) {
    warnings.push('Metrics should be enabled in production environment');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

// ===== 便捷导出 =====

/**
 * CoreOrchestrator默认配置
 */
export const DEFAULT_CORE_ORCHESTRATOR_CONFIG: CoreOrchestratorOptions = {
  environment: 'development',
  enableLogging: true,
  enableMetrics: true,
  enableCaching: false,
  maxConcurrentWorkflows: 100,
  workflowTimeout: 300000,
  enableReservedInterfaces: true,
  enableModuleCoordination: true
};

// 导出核心类型和接口
export * from '../../core/orchestrator/core.orchestrator';
export * from './domain/activators/reserved-interface.activator';
export * from './infrastructure/factories/core-orchestrator.factory';
