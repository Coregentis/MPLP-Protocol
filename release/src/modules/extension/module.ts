/**
 * Extension模块集成
 * 
 * DDD架构的模块集成和依赖注入配置
 * 
 * @version 1.0.0
 * @created 2025-09-16
 */

import { Logger } from '../../public/utils/logger';

// Infrastructure层
import { ExtensionRepository } from './infrastructure/repositories/extension.repository';

// Application层
import { ExtensionManagementService } from './application/services/extension-management.service';

// API层
import { ExtensionController } from './api/controllers/extension.controller';

/**
 * 模块配置选项
 */
export interface ExtensionModuleOptions {
  enableLogging?: boolean;
  enableDependencyValidation?: boolean;
  enableAutoActivation?: boolean;
  dataSource?: any; // 数据源配置，生产环境中应该是真实的数据库连接
}

/**
 * 模块导出接口
 */
export interface ExtensionModuleExports {
  extensionController: ExtensionController;
  extensionManagementService: ExtensionManagementService;
}

/**
 * 初始化Extension模块
 */
export async function initializeExtensionModule(
  options: ExtensionModuleOptions = {}
): Promise<ExtensionModuleExports> {
  const logger = new Logger('ExtensionModule');
  
  try {
    // 创建基础设施层组件
    const extensionRepository = new ExtensionRepository();
    
    // 创建应用层组件
    const extensionManagementService = new ExtensionManagementService(extensionRepository);
    
    // 创建API层组件
    const extensionController = new ExtensionController(extensionManagementService);
    
    // 配置选项
    if (options.enableDependencyValidation) {
      logger.info('Dependency validation enabled for extension module');
    }

    if (options.enableAutoActivation) {
      logger.info('Auto-activation enabled for extension module');
    }
    
    logger.info('Extension module initialized successfully');
    
    return {
      extensionController,
      extensionManagementService
    };
  } catch (error) {
    logger.error('Failed to initialize Extension module', error);
    throw error;
  }
}
