/**
 * Context模块入口
 * 
 * 初始化和组装Context模块的所有组件
 * 
 * @version 1.0.0
 * @created 2025-09-16
 */

// 从typeorm的具体路径导入DataSource
import { DataSource } from 'typeorm/data-source/DataSource';
import { ContextController } from './api/controllers/context.controller';
import { ContextFactory } from './domain/factories/context.factory';
import { ContextValidationService } from './domain/services/context-validation.service';
import { ContextRepository } from './infrastructure/repositories/context.repository';
import { ContextManagementService } from './application/services/context-management.service';
import { SharedStateManagementService } from './application/services/shared-state-management.service';
import { AccessControlManagementService } from './application/services/access-control-management.service';
import { CreateContextHandler } from './application/commands/create-context.handler';
import { GetContextByIdHandler } from './application/queries/get-context-by-id.handler';
import { Logger } from '../../public/utils/logger';

/**
 * Context模块初始化选项
 */
export interface ContextModuleOptions {
  /**
   * 数据源
   */
  dataSource?: DataSource;
}

/**
 * Context模块导出的组件
 */
export interface ContextModuleExports {
  /**
   * Context控制器
   */
  contextController: ContextController;
}

/**
 * 初始化Context模块
 */
export async function initializeContextModule(options: ContextModuleOptions): Promise<ContextModuleExports> {
  const logger = new Logger('ContextModule');
  logger.info('Initializing Context module');
  
  try {
    // 创建领域层组件
    const _contextFactory = new ContextFactory();
    const _validationService = new ContextValidationService();

    // 创建基础设施层组件
    if (!options.dataSource) {
      throw new Error('DataSource is required for ContextModule');
    }
    const contextRepository = new ContextRepository();

    // 创建应用层服务
    const _sharedStateService = new SharedStateManagementService();
    const _accessControlService = new AccessControlManagementService();

    // 创建应用层组件
    const contextManagementService = new ContextManagementService(
      contextRepository
    );
    
    // 创建命令和查询处理器
    const createContextHandler = new CreateContextHandler(contextManagementService);
    const getContextByIdHandler = new GetContextByIdHandler(contextManagementService);
    
    // 创建API层组件
    const contextController = new ContextController(
      createContextHandler,
      getContextByIdHandler,
      contextManagementService
    );
    
    logger.info('Context module initialized successfully');
    
    return {
      contextController
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Failed to initialize Context module', error);
    throw new Error(`Context module initialization failed: ${errorMessage}`);
  }
} 