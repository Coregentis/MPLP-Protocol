/**
 * Core模块入口
 * 
 * 初始化和组装Core协调器模块的所有组件
 * Core模块是MPLP v1.0的核心协调器，负责统一管理和协调其他9个模块
 * 
 * @version 1.0.0
 * @created 2025-08-06
 */

import { EventBus } from '../../core/event-bus';
import { WorkflowManager } from '../../core/workflow/workflow-manager';
import { Logger } from '../../public/utils/logger';

// Application层
import { CoreOrchestratorService } from './application/services/core-orchestrator.service';

// Infrastructure层
import { InMemoryWorkflowExecutionRepository } from './infrastructure/repositories/workflow-execution.repository';

// API层
import { CoreController } from './api/core.controller';

// Types
import { CoreOrchestratorConfig, WorkflowStage, ExecutionMode } from './types';

/**
 * Core模块初始化选项
 */
export interface CoreModuleOptions {
  /**
   * 协调器配置
   */
  config?: CoreOrchestratorConfig;
  
  /**
   * 是否启用日志
   */
  enableLogging?: boolean;
  
  /**
   * 是否启用指标收集
   */
  enableMetrics?: boolean;
  
  /**
   * 是否启用事件系统
   */
  enableEvents?: boolean;
  
  /**
   * 自定义事件总线
   */
  eventBus?: EventBus;
  
  /**
   * 自定义工作流管理器
   */
  workflowManager?: WorkflowManager;
}

/**
 * Core模块导出的组件
 */
export interface CoreModuleExports {
  /**
   * Core协调器服务
   */
  orchestrator: CoreOrchestratorService;
  
  /**
   * Core控制器
   */
  controller: CoreController;
  
  /**
   * 工作流执行仓储
   */
  repository: InMemoryWorkflowExecutionRepository;
  
  /**
   * 事件总线
   */
  eventBus: EventBus;
  
  /**
   * 工作流管理器
   */
  workflowManager: WorkflowManager;
}

/**
 * 初始化Core模块
 */
export async function initializeCoreModule(
  options: CoreModuleOptions = {}
): Promise<CoreModuleExports> {
  const logger = new Logger('CoreModule');
  
  try {
    logger.info('Initializing Core module - MPLP v1.0 L4 Intelligent Agent Operating System');
    
    // 合并配置
    const config: CoreOrchestratorConfig = {
      module_timeout_ms: 30000,
      max_concurrent_executions: 50,
      enable_metrics: true,
      enable_events: true,
      default_workflow: {
        name: 'Default MPLP Workflow',
        stages: [
          WorkflowStage.CONTEXT, 
          WorkflowStage.PLAN, 
          WorkflowStage.CONFIRM, 
          WorkflowStage.TRACE
        ],
        execution_mode: ExecutionMode.SEQUENTIAL,
        timeoutMs: 300000,
        max_concurrent_executions: 10,
        retry_policy: {
          maxAttempts: 3,
          delayMs: 1000,
          backoffFactor: 2.0
        }
      },
      ...options.config
    };
    
    // 创建基础设施层组件
    const repository = new InMemoryWorkflowExecutionRepository();
    logger.info('Created workflow execution repository');
    
    // 创建事件总线
    const eventBus = options.eventBus || new EventBus();
    logger.info('Initialized event bus');
    
    // 创建工作流管理器
    const workflowManager = options.workflowManager || new WorkflowManager({
      maxConcurrentWorkflows: config.max_concurrent_executions || 50,
      defaultTimeout: config.module_timeout_ms || 30000,
      enableRetry: true,
      maxRetries: 3,
      retryDelay: 1000,
      enableMetrics: config.enable_metrics !== false
    });
    logger.info('Initialized workflow manager');
    
    // 创建应用层服务
    const orchestrator = new CoreOrchestratorService(
      repository, 
      config, 
      eventBus, 
      workflowManager
    );
    logger.info('Created core orchestrator service');
    
    // 创建API层控制器
    const controller = new CoreController(orchestrator);
    logger.info('Created core controller');
    
    logger.info('Core module initialization completed successfully');
    logger.info(`Core module capabilities: ${JSON.stringify({
      total_modules: 10,
      supported_stages: ['context', 'plan', 'confirm', 'trace', 'role', 'extension', 'collab', 'dialog', 'network'],
      architecture: 'L4 Intelligent Agent Operating System',
      max_concurrent_executions: config.max_concurrent_executions,
      module_timeout_ms: config.module_timeout_ms
    })}`);
    
    return {
      orchestrator,
      controller,
      repository,
      eventBus,
      workflowManager
    };
    
  } catch (error) {
    logger.error('Failed to initialize Core module', error);
    throw new Error(`Core module initialization failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * 销毁Core模块
 */
export async function destroyCoreModule(moduleExports: CoreModuleExports): Promise<void> {
  const logger = new Logger('CoreModule');
  
  try {
    logger.info('Destroying Core module');
    
    // 停止工作流管理器
    if (moduleExports.workflowManager && typeof moduleExports.workflowManager.stop === 'function') {
      await moduleExports.workflowManager.stop();
    }

    // 清理事件总线
    if (moduleExports.eventBus && typeof moduleExports.eventBus.removeAllListeners === 'function') {
      moduleExports.eventBus.removeAllListeners();
    }
    
    logger.info('Core module destroyed successfully');
    
  } catch (error) {
    logger.error('Failed to destroy Core module', error);
    throw new Error(`Core module destruction failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * 默认Core模块配置
 */
export const DEFAULT_CORE_MODULE_OPTIONS: CoreModuleOptions = {
  enableLogging: true,
  enableMetrics: true,
  enableEvents: true,
  config: {
    module_timeout_ms: 30000,
    max_concurrent_executions: 50,
    enable_metrics: true,
    enable_events: true,
    default_workflow: {
      name: 'Default MPLP Workflow',
      stages: [WorkflowStage.CONTEXT, WorkflowStage.PLAN, WorkflowStage.CONFIRM, WorkflowStage.TRACE],
      execution_mode: ExecutionMode.SEQUENTIAL,
      timeoutMs: 300000,
      max_concurrent_executions: 10,
      retry_policy: {
        maxAttempts: 3,
        delayMs: 1000,
        backoffFactor: 2.0
      }
    }
  }
};

/**
 * Core模块元数据
 */
export const CORE_MODULE_METADATA = {
  name: 'MPLP Core Protocol',
  version: '1.0.0',
  description: 'Core协调协议 - MPLP v1.0 十模块协议簇的统一协调和工作流管理',
  author: 'MPLP Team',
  role: 'orchestrator',
  capabilities: [
    'workflow_orchestration',
    'module_coordination', 
    'event_handling',
    'status_monitoring',
    'error_recovery',
    'performance_metrics'
  ],
  supported_modules: [
    'context', 'plan', 'confirm', 'trace', 'role', 
    'extension', 'collab', 'dialog', 'network'
  ],
  total_modules: 10,
  architecture: 'L4 Intelligent Agent Operating System'
};
