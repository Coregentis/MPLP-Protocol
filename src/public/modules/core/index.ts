/**
 * Core模块主入口
 * 
 * 导出Core运行时调度器的公共API
 * 
 * @version 1.0.0
 * @created 2025-09-16
 */

// ===== 核心组件导出 =====
export * from './orchestrator/core-orchestrator';
export * from './workflow/workflow-manager';
export * from './coordination/module-coordinator';

// ===== 类型定义导出 =====
export * from './types/core.types';

// ===== 工厂函数 =====
import { CoreOrchestrator } from './orchestrator/core-orchestrator';
import { WorkflowManager, WorkflowTemplates } from './workflow/workflow-manager';
import { ModuleCoordinator } from './coordination/module-coordinator';
import { OrchestratorConfiguration } from './types/core.types';

// 导入各模块的管理服务
import { ContextManagementService } from '../../../modules/context/application/services/context-management.service';
import { PlanManagementService } from '../../../modules/plan/application/services/plan-management.service';
import { ConfirmManagementService } from '../../../modules/confirm/application/services/confirm-management.service';
import { TraceManagementService } from '../../../modules/trace/application/services/trace-management.service';
import { RoleManagementService } from '../../../modules/role/application/services/role-management.service';
import { ExtensionManagementService } from '../../../modules/extension/application/services/extension-management.service';

/**
 * Core模块配置选项
 */
export interface CoreModuleOptions {
  orchestrator_config?: Partial<OrchestratorConfiguration>;
  enable_performance_monitoring?: boolean;
  enable_event_logging?: boolean;
  default_workflow_template?: string;
}

/**
 * Core模块导出接口
 */
export interface CoreModuleExports {
  orchestrator: CoreOrchestrator;
  workflowManager: WorkflowManager;
  moduleCoordinator: ModuleCoordinator;
}

/**
 * 初始化Core模块
 */
export async function initializeCoreModule(
  moduleServices: {
    contextService: ContextManagementService;
    planService: PlanManagementService;
    confirmService: ConfirmManagementService;
    traceService: TraceManagementService;
    roleService: RoleManagementService;
    extensionService: ExtensionManagementService;
  },
  options: CoreModuleOptions = {}
): Promise<CoreModuleExports> {
  // 创建工作流管理器
  const workflowManager = new WorkflowManager();

  // 创建模块协调器
  const moduleCoordinator = new ModuleCoordinator(
    moduleServices.contextService,
    moduleServices.planService,
    moduleServices.confirmService,
    moduleServices.traceService,
    moduleServices.roleService,
    moduleServices.extensionService
  );

  // 检查模块依赖
  const dependencyCheck = moduleCoordinator.checkModuleDependencies();
  if (!dependencyCheck.satisfied) {
    throw new Error(`Missing required modules: ${dependencyCheck.missing.join(', ')}`);
  }

  // 创建调度器配置
  const defaultConfig: OrchestratorConfiguration = {
    default_workflow: options.default_workflow_template 
      ? workflowManager.getTemplate(options.default_workflow_template) || WorkflowTemplates.STANDARD_MPLP
      : WorkflowTemplates.STANDARD_MPLP,
    moduleTimeoutMs: 30000,
    maxConcurrentExecutions: 10,
    enable_performance_monitoring: options.enable_performance_monitoring ?? true,
    enable_event_logging: options.enable_event_logging ?? true
  };

  const orchestratorConfig: OrchestratorConfiguration = {
    ...defaultConfig,
    ...options.orchestrator_config
  };

  // 创建核心调度器
  const orchestrator = new CoreOrchestrator(orchestratorConfig);

  // 注册所有模块
  const moduleInterfaces = moduleCoordinator.getAllModuleInterfaces();
  for (const moduleInterface of moduleInterfaces) {
    orchestrator.registerModule(moduleInterface);
  }

  // 初始化调度器
  await orchestrator.initialize();

  return {
    orchestrator,
    workflowManager,
    moduleCoordinator
  };
}

/**
 * 创建默认Core模块实例
 */
export async function createDefaultCoreModule(
  moduleServices: {
    contextService: ContextManagementService;
    planService: PlanManagementService;
    confirmService: ConfirmManagementService;
    traceService: TraceManagementService;
    roleService: RoleManagementService;
    extensionService: ExtensionManagementService;
  }
): Promise<CoreModuleExports> {
  return await initializeCoreModule(moduleServices, {
    default_workflow_template: 'standard',
    enable_performance_monitoring: true,
    enable_event_logging: true
  });
}

/**
 * 导出工作流模板
 */
export { WorkflowTemplates };

/**
 * 模块信息
 */
export const CORE_MODULE_INFO = {
  name: 'core',
  version: '1.0.0',
  description: 'MPLP Core Runtime Orchestrator - 协调和调度所有9个协议模块',
  dependencies: ['context', 'plan', 'confirm', 'trace', 'role', 'extension', 'collab', 'dialog', 'network'],
  capabilities: [
    'workflow_orchestration',
    'module_coordination',
    'execution_management',
    'performance_monitoring',
    'event_logging',
    'error_handling'
  ]
} as const;
