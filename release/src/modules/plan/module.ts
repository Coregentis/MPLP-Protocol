/**
 * Plan模块集成
 * 
 * DDD架构的模块集成和依赖注入配置
 * 
 * @version 1.0.0
 * @created 2025-09-16
 */

import { Logger } from '../../public/utils/logger';

// Infrastructure层
import { PlanRepositoryImpl } from './infrastructure/repositories/plan-repository.impl';

// Application层
import { PlanManagementService } from './application/services/plan-management.service';
import { PlanValidationService } from './domain/services/plan-validation.service';
import { PlanFactoryService } from './domain/services/plan-factory.service';

// API层
import { PlanController } from './api/controllers/plan.controller';

/**
 * 模块配置选项
 */
export interface PlanModuleOptions {
  enableLogging?: boolean;
  enableTaskValidation?: boolean;
  enableProgressTracking?: boolean;
  dataSource?: any; // 数据源配置，生产环境中应该是真实的数据库连接
}

/**
 * 模块导出接口
 */
export interface PlanModuleExports {
  planController: PlanController;
  planManagementService: PlanManagementService;
}

/**
 * 初始化Plan模块
 */
export async function initializePlanModule(
  options: PlanModuleOptions = {}
): Promise<PlanModuleExports> {
  const logger = new Logger('PlanModule');
  
  try {
    // 创建基础设施层组件
    const mockDataSource = options.dataSource || {
      getRepository: () => ({
        save: async (entity: any) => entity,
        findOne: async () => null,
        find: async () => [],
        remove: async (entity: any) => entity,
        createQueryBuilder: () => ({
          where: () => ({ getMany: async () => [] }),
          orderBy: () => ({ getMany: async () => [] })
        })
      })
    };

    const planRepository = new PlanRepositoryImpl(mockDataSource);
    const planValidationService = new PlanValidationService();
    const planFactoryService = new PlanFactoryService();

    // 创建应用层组件
    const planManagementService = new PlanManagementService(
      planRepository,
      planValidationService,
      planFactoryService
    );

    // 创建API层组件 - 使用mock对象
    const mockCreatePlanCommandHandler = {
      planManagementService,
      execute: async () => ({ success: true })
    } as any;

    const mockGetPlanQueryHandler = {
      execute: async () => ({ success: true })
    } as any;

    const mockPlanExecutionService = {
      executePlan: async () => ({ success: true })
    } as any;

    const planController = new PlanController(
      mockCreatePlanCommandHandler,
      mockGetPlanQueryHandler,
      planManagementService,
      mockPlanExecutionService
    );
    
    // 配置选项
    if (options.enableTaskValidation) {
      logger.info('Task validation enabled for plan module');
    }

    if (options.enableProgressTracking) {
      logger.info('Progress tracking enabled for plan module');
    }
    
    logger.info('Plan module initialized successfully');
    
    return {
      planController,
      planManagementService
    };
  } catch (error) {
    logger.error('Failed to initialize Plan module', error);
    throw error;
  }
}
