/**
 * 企业级审批和决策协调模块集成
 *
 * L2协调层的企业级审批专业化组件
 * 支持5种approval_workflow类型的企业级审批工作流处理
 *
 * @version 2.0.0
 * @created 2025-08-18
 * @updated 2025-08-18 - TDD重构完成
 */

import { Logger } from '../../public/utils/logger';

// Infrastructure层
import { ConfirmRepository } from './infrastructure/repositories/confirm.repository';

// Application层
import { ConfirmManagementService } from './application/services/confirm-management.service';

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
 * 初始化企业级审批和决策协调模块
 */
export async function initializeConfirmModule(
  options: ConfirmModuleOptions = {}
): Promise<ConfirmModuleExports> {
  const logger = new Logger('ConfirmModule');

  try {
    // 创建基础设施层组件
    const confirmRepository = new ConfirmRepository();

    // 创建应用层组件
    const confirmManagementService = new ConfirmManagementService(confirmRepository);

    // 启用企业级功能
    if (options.enablePerformanceMonitoring) {
      confirmManagementService.enablePerformanceMonitoring();
    }
    confirmManagementService.enableAIAnalysis();
    confirmManagementService.enableComplianceCheck();

    // 创建API层组件
    const confirmController = new ConfirmController(confirmManagementService);

    logger.info('企业级审批和决策协调模块初始化成功');

    return {
      confirmController,
      confirmManagementService
    };
  } catch (error) {
    logger.error('Failed to initialize Confirm module', error);
    throw error;
  }
}
