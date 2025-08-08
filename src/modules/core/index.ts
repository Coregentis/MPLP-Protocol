/**
 * Core协议模块入口
 * @description MPLP Core协议的统一导出入口
 * @author MPLP Team
 * @version 1.0.0
 */

// ===== 类型定义 =====
export * from './types';

// ===== 领域层 =====
export { WorkflowExecution } from './domain/entities/workflow-execution.entity';
export { 
  IWorkflowExecutionRepository,
  WorkflowQueryCriteria 
} from './domain/repositories/workflow-execution.repository.interface';

// ===== 应用层 =====
export { CoreOrchestratorService } from './application/services/core-orchestrator.service';
export { 
  ModuleAdapterBase,
  ModuleAdapterConfig 
} from './application/services/module-adapter.base';

// ===== 基础设施层 =====
export { InMemoryWorkflowExecutionRepository } from './infrastructure/repositories/workflow-execution.repository';

// ===== API层 =====
export { 
  CoreController,
  ExecuteWorkflowRequest,
  GetWorkflowStatusRequest,
  WorkflowControlRequest
} from './api/core.controller';

// ===== 便捷工厂函数 =====

import { EventBus } from '../../core/event-bus';
import { WorkflowManager } from '../../core/workflow/workflow-manager';
import { CoreOrchestratorService } from './application/services/core-orchestrator.service';
import { InMemoryWorkflowExecutionRepository } from './infrastructure/repositories/workflow-execution.repository';
import { CoreController } from './api/core.controller';
import { CoreOrchestratorConfig, WorkflowStage, ExecutionMode } from './types';

/**
 * 创建Core协调器服务实例
 */
export function createCoreOrchestrator(config?: CoreOrchestratorConfig): CoreOrchestratorService {
  const repository = new InMemoryWorkflowExecutionRepository();
  const eventBus = new EventBus();
  const workflowManager = new WorkflowManager({
    maxConcurrentWorkflows: config?.max_concurrent_executions || 50,
    defaultTimeout: config?.module_timeout_ms || 30000,
    enableRetry: true,
    maxRetries: 3,
    retryDelay: 1000,
    enableMetrics: config?.enable_metrics !== false
  });

  return new CoreOrchestratorService(repository, config, eventBus, workflowManager);
}

/**
 * 创建Core控制器实例
 */
export function createCoreController(orchestrator?: CoreOrchestratorService): CoreController {
  const coreOrchestrator = orchestrator || createCoreOrchestrator();
  return new CoreController(coreOrchestrator);
}

/**
 * 创建完整的Core模块实例
 */
export function createCoreModule(config?: CoreOrchestratorConfig): {
  orchestrator: CoreOrchestratorService;
  controller: CoreController;
  repository: InMemoryWorkflowExecutionRepository;
} {
  const repository = new InMemoryWorkflowExecutionRepository();
  const eventBus = new EventBus();
  const workflowManager = new WorkflowManager({
    maxConcurrentWorkflows: config?.max_concurrent_executions || 50,
    defaultTimeout: config?.module_timeout_ms || 30000,
    enableRetry: true,
    maxRetries: 3,
    retryDelay: 1000,
    enableMetrics: config?.enable_metrics !== false
  });

  const orchestrator = new CoreOrchestratorService(repository, config, eventBus, workflowManager);
  const controller = new CoreController(orchestrator);

  return {
    orchestrator,
    controller,
    repository
  };
}

// ===== 默认配置 =====

/**
 * 默认Core协调器配置
 */
export const DEFAULT_CORE_CONFIG: CoreOrchestratorConfig = {
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
};

// ===== 版本信息 =====

/**
 * Core协议版本信息
 */
export const CORE_PROTOCOL_VERSION = '1.0.0';

/**
 * Core模块元数据
 */
export const CORE_MODULE_METADATA = {
  name: 'MPLP Core Protocol',
  version: CORE_PROTOCOL_VERSION,
  description: 'Core协调协议 - MPLP v1.0 十模块协议簇的统一协调和工作流管理',
  author: 'MPLP Team',
  capabilities: [
    'workflow_orchestration',
    'module_coordination',
    'event_handling',
    'status_monitoring',
    'error_recovery',
    'performance_metrics'
  ],
  supported_stages: [
    'context',
    'plan',
    'confirm',
    'trace',
    'role',
    'extension',
    'collab',
    'dialog',
    'network'
  ],
  total_modules: 10,
  architecture: 'L4 Intelligent Agent Operating System'
};
