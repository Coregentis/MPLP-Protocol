/**
 * Confirm模块集成
 * 
 * DDD架构的模块集成和依赖注入配置
 * 
 * @version 1.0.0
 * @created 2025-09-16
 */

import { Logger } from '../../public/utils/logger';

// Domain层
import { ConfirmFactory } from './domain/factories/confirm.factory';
import { ConfirmValidationService } from './domain/services/confirm-validation.service';

// Infrastructure层
import { ConfirmRepository } from './infrastructure/repositories/confirm.repository';

// Application层
import { ConfirmManagementService } from './application/services/confirm-management.service';
import { CreateConfirmHandler } from './application/commands/create-confirm.command';
import { GetConfirmByIdHandler } from './application/queries/get-confirm-by-id.query';

// API层
import { ConfirmController } from './api/controllers/confirm.controller';

/**
 * 模块配置选项
 */
export interface ConfirmModuleOptions {
  enableLogging?: boolean;
  enablePerformanceMonitoring?: boolean;
  dataSource?: unknown; // 数据源配置，生产环境中应该是真实的数据库连接
}

/**
 * 模块导出接口
 */
export interface ConfirmModuleExports {
  confirmController: ConfirmController;
  confirmManagementService: ConfirmManagementService;
}

/**
 * 初始化Confirm模块
 */
export async function initializeConfirmModule(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
  options: ConfirmModuleOptions = {}
): Promise<ConfirmModuleExports> {
  const logger = new Logger('ConfirmModule');
  
  try {
    // 创建领域层组件
    const confirmFactory = new ConfirmFactory();
    const validationService = new ConfirmValidationService();
    
    // 创建基础设施层组件
    const confirmRepository = new ConfirmRepository();
    
    // 创建应用层组件
    const confirmManagementService = new ConfirmManagementService(
      confirmRepository,
      confirmFactory,
      validationService
    );
    
    // 创建命令和查询处理器
    const createConfirmHandler = new CreateConfirmHandler(confirmManagementService);
    const getConfirmByIdHandler = new GetConfirmByIdHandler(confirmManagementService);
    
    // 创建API层组件
    const confirmController = new ConfirmController(
      createConfirmHandler,
      getConfirmByIdHandler,
      confirmManagementService
    );
    
    logger.info('Confirm module initialized successfully');
    
    return {
      confirmController,
      confirmManagementService
    };
  } catch (error) {
    logger.error('Failed to initialize Confirm module', error);
    throw error;
  }
}
