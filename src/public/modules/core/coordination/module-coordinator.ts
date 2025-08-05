/**
 * 模块协调器
 * 
 * 负责协调各个协议模块之间的交互和数据传递
 * 
 * @version 1.0.0
 * @created 2025-09-16
 */

import { UUID } from '../../../shared/types';
import { Logger } from '../../../utils/logger';
import {
  ProtocolModule,
  ModuleInterface,
  ModuleStatus,
  ExecutionContext,
  CoordinationEvent
} from '../types/core.types';

// 导入各模块的管理服务
import { ContextManagementService } from '../../../../modules/context/application/services/context-management.service';
import { PlanManagementService } from '../../../../modules/plan/application/services/plan-management.service';
import { ConfirmManagementService } from '../../../../modules/confirm/application/services/confirm-management.service';
import { TraceManagementService } from '../../../../modules/trace/application/services/trace-management.service';
import { RoleManagementService } from '../../../../modules/role/application/services/role-management.service';
import { ExtensionManagementService } from '../../../../modules/extension/application/services/extension-management.service';

/**
 * 模块适配器接口
 */
interface ModuleAdapter {
  execute(context: ExecutionContext): Promise<any>;
  getStatus(): ModuleStatus;
}

/**
 * Context模块适配器
 */
class ContextModuleAdapter implements ModuleAdapter {
  constructor(private contextService: ContextManagementService) {}

  async execute(context: ExecutionContext): Promise<any> {
    // 从执行上下文获取或创建Context
    const contextData = context.metadata.contextData || {
      name: `Execution-${context.execution_id}`,
      description: 'Auto-generated context for workflow execution'
    };

    const result = await this.contextService.createContext(contextData);
    if (!result.success) {
      const errorMessage = Array.isArray(result.error) ? result.error.join(', ') : result.error || 'Failed to create context';
      throw new Error(errorMessage);
    }

    return result.data;
  }

  getStatus(): ModuleStatus {
    return {
      module_name: 'context',
      status: 'idle',
      error_count: 0,
      performance_metrics: {
        average_execution_time_ms: 100,
        total_executions: 0,
        success_rate: 1.0,
        error_rate: 0.0,
        last_updated: new Date().toISOString()
      }
    };
  }
}

/**
 * Plan模块适配器
 */
class PlanModuleAdapter implements ModuleAdapter {
  constructor(private planService: PlanManagementService) {}

  async execute(context: ExecutionContext): Promise<any> {
    // 获取Context结果
    const contextResult = context.stage_results.get('context');
    if (!contextResult) {
      throw new Error('Context result not found');
    }

    const planData = context.metadata.planData || {
      context_id: contextResult.context_id,
      name: `Plan-${context.execution_id}`,
      description: 'Auto-generated plan for workflow execution',
      tasks: []
    };

    const result = await this.planService.createPlan(planData);
    if (!result.success) {
      throw new Error(result.error || 'Failed to create plan');
    }

    return result.data;
  }

  getStatus(): ModuleStatus {
    return {
      module_name: 'plan',
      status: 'idle',
      error_count: 0,
      performance_metrics: {
        average_execution_time_ms: 200,
        total_executions: 0,
        success_rate: 1.0,
        error_rate: 0.0,
        last_updated: new Date().toISOString()
      }
    };
  }
}

/**
 * Confirm模块适配器
 */
class ConfirmModuleAdapter implements ModuleAdapter {
  constructor(private confirmService: ConfirmManagementService) {}

  async execute(context: ExecutionContext): Promise<any> {
    // 获取Context和Plan结果
    const contextResult = context.stage_results.get('context');
    const planResult = context.stage_results.get('plan');
    
    if (!contextResult || !planResult) {
      throw new Error('Context or Plan result not found');
    }

    const confirmData = context.metadata.confirmData || {
      context_id: contextResult.context_id,
      plan_id: planResult.plan_id,
      confirmation_type: 'plan_approval',
      priority: 'medium',
      subject: {
        title: `Approval for Plan-${planResult.plan_id}`,
        description: 'Auto-generated confirmation for workflow execution'
      },
      requester: {
        user_id: 'system',
        role: 'system',
        request_reason: 'Automated workflow execution'
      },
      approval_workflow: {
        workflow_type: 'sequential',
        steps: [{
          step_name: 'Auto Approval',
          step_order: 1,
          approver_role: 'system',
          is_required: true
        }]
      }
    };

    const result = await this.confirmService.createConfirm(confirmData);
    if (!result.success) {
      throw new Error(result.error || 'Failed to create confirmation');
    }

    return result.data;
  }

  getStatus(): ModuleStatus {
    return {
      module_name: 'confirm',
      status: 'idle',
      error_count: 0,
      performance_metrics: {
        average_execution_time_ms: 150,
        total_executions: 0,
        success_rate: 1.0,
        error_rate: 0.0,
        last_updated: new Date().toISOString()
      }
    };
  }
}

/**
 * Trace模块适配器
 */
class TraceModuleAdapter implements ModuleAdapter {
  constructor(private traceService: TraceManagementService) {}

  async execute(context: ExecutionContext): Promise<any> {
    // 获取Context结果
    const contextResult = context.stage_results.get('context');
    if (!contextResult) {
      throw new Error('Context result not found');
    }

    const traceData = context.metadata.traceData || {
      context_id: contextResult.context_id,
      trace_type: 'execution',
      severity: 'info',
      event: {
        type: 'completion',
        name: 'Workflow Execution',
        category: 'system',
        source: {
          component: 'core-orchestrator',
          module: 'workflow'
        },
        data: {
          execution_id: context.execution_id,
          stages: context.workflow_config.stages
        }
      }
    };

    const result = await this.traceService.createTrace(traceData);
    if (!result.success) {
      throw new Error(result.error || 'Failed to create trace');
    }

    return result.data;
  }

  getStatus(): ModuleStatus {
    return {
      module_name: 'trace',
      status: 'idle',
      error_count: 0,
      performance_metrics: {
        average_execution_time_ms: 50,
        total_executions: 0,
        success_rate: 1.0,
        error_rate: 0.0,
        last_updated: new Date().toISOString()
      }
    };
  }
}

/**
 * 模块协调器
 */
export class ModuleCoordinator {
  private readonly logger: Logger;
  private readonly moduleAdapters: Map<ProtocolModule, ModuleAdapter> = new Map();
  private readonly moduleInterfaces: Map<ProtocolModule, ModuleInterface> = new Map();

  constructor(
    contextService: ContextManagementService,
    planService: PlanManagementService,
    confirmService: ConfirmManagementService,
    traceService: TraceManagementService,
    roleService: RoleManagementService,
    extensionService: ExtensionManagementService
  ) {
    this.logger = new Logger('ModuleCoordinator');
    
    // 创建模块适配器
    this.moduleAdapters.set('context', new ContextModuleAdapter(contextService));
    this.moduleAdapters.set('plan', new PlanModuleAdapter(planService));
    this.moduleAdapters.set('confirm', new ConfirmModuleAdapter(confirmService));
    this.moduleAdapters.set('trace', new TraceModuleAdapter(traceService));
    
    // 创建模块接口
    this.createModuleInterfaces();
  }

  /**
   * 创建模块接口
   */
  private createModuleInterfaces(): void {
    for (const [moduleName, adapter] of this.moduleAdapters) {
      const moduleInterface: ModuleInterface = {
        module_name: moduleName,
        initialize: async () => {
          this.logger.info(`Module initialized: ${moduleName}`);
        },
        executeStage: async (context: any) => {
          return await adapter.execute(context);
        },
        executeBusinessCoordination: async (request: any) => {
          return await adapter.execute(request);
        },
        validateInput: async (input: any) => {
          return { is_valid: true, errors: [], warnings: [] };
        },
        handleError: async (error: any, context: any) => {
          return { handled: true, recovery_action: 'retry' };
        },
        cleanup: async () => {
          this.logger.info(`Module cleaned up: ${moduleName}`);
        },
        getStatus: () => adapter.getStatus()
      };
      
      this.moduleInterfaces.set(moduleName, moduleInterface);
    }
  }

  /**
   * 获取模块接口
   */
  getModuleInterface(moduleName: ProtocolModule): ModuleInterface | undefined {
    return this.moduleInterfaces.get(moduleName);
  }

  /**
   * 获取所有模块接口
   */
  getAllModuleInterfaces(): ModuleInterface[] {
    return Array.from(this.moduleInterfaces.values());
  }

  /**
   * 检查模块依赖
   */
  checkModuleDependencies(): { satisfied: boolean; missing: ProtocolModule[] } {
    const requiredModules: ProtocolModule[] = ['context', 'plan', 'confirm', 'trace'];
    const missing: ProtocolModule[] = [];

    for (const module of requiredModules) {
      if (!this.moduleInterfaces.has(module)) {
        missing.push(module);
      }
    }

    return {
      satisfied: missing.length === 0,
      missing
    };
  }

  /**
   * 获取模块健康状态
   */
  getModuleHealthStatus(): Map<ProtocolModule, boolean> {
    const healthStatus = new Map<ProtocolModule, boolean>();

    for (const [moduleName, moduleInterface] of this.moduleInterfaces) {
      try {
        const status = moduleInterface.getStatus();
        healthStatus.set(moduleName, status.status !== 'error');
      } catch (error) {
        healthStatus.set(moduleName, false);
        this.logger.error(`Failed to get status for module: ${moduleName}`, error);
      }
    }

    return healthStatus;
  }
}
