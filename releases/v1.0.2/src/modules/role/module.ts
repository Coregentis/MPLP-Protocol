/**
 * Role模块集成
 * 
 * DDD架构的模块集成和依赖注入配置
 * 
 * @version 1.0.0
 * @created 2025-09-16
 */

import { Logger } from '../../utils/logger';

// Infrastructure层
import { RoleRepository } from './infrastructure/repositories/role.repository';

// Application层
import { RoleManagementService } from './application/services/role-management.service';

// API层
import { RoleController } from './api/controllers/role.controller';

/**
 * 模块配置选项
 */
export interface RoleModuleOptions {
  enableLogging?: boolean;
  enablePermissionValidation?: boolean;
  enableAuditLogging?: boolean;
  dataSource?: any; // 数据源配置，生产环境中应该是真实的数据库连接
}

/**
 * 模块导出接口
 */
export interface RoleModuleExports {
  roleController: RoleController;
  roleManagementService: RoleManagementService;
}

/**
 * 初始化Role模块
 */
export async function initializeRoleModule(
  options: RoleModuleOptions = {}
): Promise<RoleModuleExports> {
  const logger = new Logger('RoleModule');
  
  try {
    // 创建基础设施层组件
    const roleRepository = new RoleRepository();
    
    // 创建应用层组件
    const roleManagementService = new RoleManagementService(roleRepository);
    
    // 创建API层组件
    const roleController = new RoleController(roleManagementService);
    
    // 配置选项
    if (options.enablePermissionValidation) {
      logger.info('Permission validation enabled for role module');
    }

    if (options.enableAuditLogging) {
      logger.info('Audit logging enabled for role module');
    }
    
    logger.info('Role module initialized successfully');
    
    return {
      roleController,
      roleManagementService
    };
  } catch (error) {
    logger.error('Failed to initialize Role module', error);
    throw error;
  }
}
