/**
 * Plan模块初始化
 * 
 * @description Plan模块的统一初始化和配置管理
 * @version 1.0.0
 * @layer 模块层 - 初始化
 * @pattern 与Context模块使用IDENTICAL的模块初始化模式
 */

import {
  PlanModuleAdapter,
  PlanModuleAdapterConfig,
  createPlanModuleAdapter
} from './infrastructure/adapters/plan-module.adapter';
import { PlanEntity } from './domain/entities/plan.entity';
import { PlanManagementService } from './application/services/plan-management.service';
import { PlanProtocol } from './infrastructure/protocols/plan.protocol';
import { IPlanRepository } from './domain/repositories/plan-repository.interface';
import { PlanEntityData } from './api/mappers/plan.mapper';

/**
 * Plan模块选项
 */
export interface PlanModuleOptions {
  enableLogging?: boolean;
  enableCaching?: boolean;
  enableMetrics?: boolean;
  repositoryType?: 'memory' | 'database' | 'file';
  maxCacheSize?: number;
  cacheTimeout?: number;
  enableOptimization?: boolean;
  enableRiskAssessment?: boolean;
  enableFailureRecovery?: boolean;
  dataSource?: unknown;
}

/**
 * Plan模块结果
 */
export interface PlanModuleResult {
  // 核心组件
  planEntity: typeof PlanEntity;
  planRepository: IPlanRepository;
  planService: PlanManagementService;
  planProtocol: PlanProtocol;
  planAdapter: PlanModuleAdapter;
  
  // 便捷方法
  createPlan: (data: Partial<PlanEntityData>) => Promise<PlanEntity>;
  getPlan: (planId: string) => Promise<PlanEntity | null>;
  updatePlan: (planId: string, updates: Partial<PlanEntityData>) => Promise<PlanEntity>;
  deletePlan: (planId: string) => Promise<boolean>;
  
  // 模块信息
  moduleInfo: {
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
 * 初始化Plan模块
 * 
 * @description 创建并配置Plan模块的所有组件
 * @param options 模块配置选项
 * @returns 初始化完成的模块结果
 */
export async function initializePlanModule(
  options: PlanModuleOptions = {}
): Promise<PlanModuleResult> {
  // 转换选项为适配器配置
  const adapterConfig: PlanModuleAdapterConfig = {
    enableLogging: options.enableLogging,
    enableCaching: options.enableCaching,
    enableMetrics: options.enableMetrics,
    repositoryType: options.repositoryType,
    maxCacheSize: options.maxCacheSize,
    cacheTimeout: options.cacheTimeout,
    enableOptimization: options.enableOptimization,
    enableRiskAssessment: options.enableRiskAssessment,
    enableFailureRecovery: options.enableFailureRecovery
  };

  // 创建适配器和组件
  const adapterResult = await createPlanModuleAdapter(adapterConfig);
  
  // 创建便捷方法
  const createPlan = async (data: Partial<PlanEntityData>): Promise<PlanEntity> => {
    return await adapterResult.adapter.createPlan(data);
  };

  const getPlan = async (planId: string): Promise<PlanEntity | null> => {
    return await adapterResult.adapter.getPlan(planId);
  };

  const updatePlan = async (planId: string, updates: Partial<PlanEntityData>): Promise<PlanEntity> => {
    return await adapterResult.adapter.updatePlan(planId, updates);
  };

  const deletePlan = async (planId: string): Promise<boolean> => {
    return await adapterResult.adapter.deletePlan(planId);
  };

  // 获取模块信息
  const moduleInfo = adapterResult.adapter.getModuleInfo();

  return {
    // 核心组件
    planEntity: PlanEntity,
    planRepository: adapterResult.repository,
    planService: adapterResult.service,
    planProtocol: adapterResult.protocol,
    planAdapter: adapterResult.adapter,
    
    // 便捷方法
    createPlan,
    getPlan,
    updatePlan,
    deletePlan,
    
    // 模块信息
    moduleInfo
  };
}

/**
 * Plan模块单例管理器
 * 
 * @description 提供Plan模块的单例访问和管理
 */
export class PlanModuleManager {
  private static instance: PlanModuleResult | null = null;
  private static options: PlanModuleOptions = {};

  /**
   * 获取模块实例
   */
  static async getInstance(options: PlanModuleOptions = {}): Promise<PlanModuleResult> {
    if (!this.instance) {
      this.options = { ...this.options, ...options };
      this.instance = await initializePlanModule(this.options);
    }
    return this.instance;
  }

  /**
   * 重置模块实例
   */
  static reset(): void {
    this.instance = null;
    this.options = {};
  }

  /**
   * 检查模块是否已初始化
   */
  static isInitialized(): boolean {
    return this.instance !== null;
  }

  /**
   * 获取模块健康状态
   */
  static async getHealthStatus(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    components: Record<string, boolean>;
    timestamp: string;
  }> {
    if (!this.instance) {
      return {
        status: 'unhealthy',
        components: {},
        timestamp: new Date().toISOString()
      };
    }

    return await this.instance.planAdapter.healthCheck();
  }
}

/**
 * Plan模块工厂函数
 * 
 * @description 快速创建Plan模块实例的工厂函数
 * @param options 模块选项
 * @returns 模块实例
 */
export const createPlanModule = initializePlanModule;

/**
 * Plan模块默认配置
 */
export const DEFAULT_PLAN_MODULE_OPTIONS: PlanModuleOptions = {
  enableLogging: true,
  enableCaching: false,
  enableMetrics: false,
  repositoryType: 'memory',
  maxCacheSize: 1000,
  cacheTimeout: 300000, // 5分钟
  enableOptimization: true,
  enableRiskAssessment: true,
  enableFailureRecovery: true
};

/**
 * Plan模块信息常量
 */
export const PLAN_MODULE_INFO = {
  name: 'plan',
  version: '1.0.0',
  description: 'MPLP智能任务规划协调模块',
  layer: 'L2',
  status: 'implementing',
  features: [
    '智能任务规划',
    '计划执行管理',
    '任务协调',
    '依赖管理',
    '计划优化',
    '风险评估',
    '故障恢复',
    '性能监控',
    '审计追踪',
    '版本历史',
    '搜索索引',
    '缓存策略',
    '事件集成'
  ],
  dependencies: [
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
} as const;
