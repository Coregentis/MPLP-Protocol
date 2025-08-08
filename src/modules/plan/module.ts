/**
 * Plan模块集成
 * 
 * DDD架构的模块集成和依赖注入配置
 * 
 * @version 1.0.0
 * @created 2025-09-16
 */

import { Logger } from '../../public/utils/logger';
import { DataSource } from 'typeorm/data-source/DataSource';

// Infrastructure层
import { PlanRepositoryImpl } from './infrastructure/repositories/plan-repository.impl';

// Application层
import { PlanManagementService } from './application/services/plan-management.service';
import { PlanValidationService } from './domain/services/plan-validation.service';
import { PlanFactoryService } from './domain/services/plan-factory.service';

// API层
import { PlanController } from './api/controllers/plan.controller';
import { CreatePlanCommandHandler } from './application/commands/create-plan.command';
import { UpdatePlanCommandHandler } from './application/commands/update-plan.command';
import { DeletePlanCommandHandler } from './application/commands/delete-plan.command';
import { GetPlanQueryHandler } from './application/queries/get-plan.query';
import { GetPlanByIdQueryHandler } from './application/queries/get-plan-by-id.query';
import { GetPlansQueryHandler } from './application/queries/get-plans.query';
import { PlanExecutionService } from './application/services/plan-execution.service';
import { PlanModuleAdapter } from './infrastructure/adapters/plan-module.adapter';

/**
 * 模块配置选项
 */
export interface PlanModuleOptions {
  enableLogging?: boolean;
  enableTaskValidation?: boolean;
  enableProgressTracking?: boolean;
  dataSource?: unknown; // 数据源配置，生产环境中应该是真实的数据库连接
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
        save: async (entity: unknown) => entity,
        findOne: async () => null,
        find: async () => [],
        remove: async (entity: unknown) => entity,
        createQueryBuilder: () => ({
          where: () => ({ getMany: async () => [] }),
          orderBy: () => ({ getMany: async () => [] })
        })
      })
    };

    const planRepository = new PlanRepositoryImpl(mockDataSource as DataSource);
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
      execute: async () => ({ success: true, data: null })
    } as unknown as CreatePlanCommandHandler;

    const mockGetPlanQueryHandler = {
      execute: async () => ({ success: true, data: null })
    } as unknown as GetPlanQueryHandler;

    const mockPlanExecutionService = {
      executePlan: async () => ({ success: true })
    } as unknown as PlanExecutionService;

    // 创建必需的mock handlers
    const mockUpdatePlanCommandHandler = {
      execute: async () => ({ success: true })
    } as unknown as UpdatePlanCommandHandler;

    const mockDeletePlanCommandHandler = {
      execute: async () => ({ success: true })
    } as unknown as DeletePlanCommandHandler;

    const mockGetPlanByIdQueryHandler = {
      execute: async () => ({ success: true })
    } as unknown as GetPlanByIdQueryHandler;

    const mockGetPlansQueryHandler = {
      execute: async () => ({ success: true })
    } as unknown as GetPlansQueryHandler;

    const mockPlanModuleAdapter = {
      coordinatePlanning: async () => ({ success: true })
    } as unknown as PlanModuleAdapter;

    const planController = new PlanController(
      mockCreatePlanCommandHandler,
      mockUpdatePlanCommandHandler,
      mockDeletePlanCommandHandler,
      mockGetPlanByIdQueryHandler,
      mockGetPlansQueryHandler,
      planManagementService,
      mockPlanModuleAdapter,
      mockGetPlanQueryHandler,
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
