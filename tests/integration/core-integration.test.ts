/**
 * Core协议集成测试
 * @description 验证Core协议与现有9个MPLP协议模块的集成
 * @author MPLP Team
 * @version 1.0.0
 */

import {
  createCoreOrchestrator,
  CoreOrchestratorService,
  WorkflowStage,
  WorkflowStatus,
  ExecutionMode,
  Priority,
  StageStatus,
  ModuleAdapterBase,
  OperationResult
} from '../../src/modules/core';

// 注意：这个集成测试使用模拟适配器来测试Core协议与9个协议模块的集成
// 真实的协议模块集成将在生产环境中通过实际的模块适配器实现

describe('Core协议集成测试 - 与现有9个协议模块的协作验证', () => {
  let coreOrchestrator: CoreOrchestratorService;
  let moduleManagers: Map<WorkflowStage, any>;

  beforeEach(async () => {
    // 创建Core协调器
    coreOrchestrator = createCoreOrchestrator({
      module_timeout_ms: 10000,
      max_concurrent_executions: 5,
      enable_metrics: true,
      enable_events: true
    });

    // 创建模拟的协议模块适配器（简化版本，专注于Core协议集成测试）
    moduleManagers = new Map();

    // 为每个协议阶段创建集成适配器并注册到Core协调器
    const stages = [
      WorkflowStage.CONTEXT,
      WorkflowStage.PLAN,
      WorkflowStage.CONFIRM,
      WorkflowStage.TRACE,
      WorkflowStage.ROLE,
      WorkflowStage.EXTENSION,
      WorkflowStage.COLLAB,
      WorkflowStage.DIALOG,
      WorkflowStage.NETWORK
    ];

    for (const stage of stages) {
      const adapter = new IntegrationModuleAdapter(stage);
      await coreOrchestrator.registerModuleAdapter(stage, adapter);
    }
  });

  describe('1. 完整MPLP工作流集成测试', () => {
    it('应该能够执行包含所有9个协议的完整工作流', async () => {
      // 用户场景：执行一个包含所有MPLP协议的完整项目生命周期
      const contextId = 'full-integration-001';
      
      const result = await coreOrchestrator.executeWorkflow(contextId, {
        name: '完整MPLP生命周期工作流',
        stages: [
          WorkflowStage.CONTEXT,
          WorkflowStage.PLAN,
          WorkflowStage.CONFIRM,
          WorkflowStage.TRACE,
          WorkflowStage.ROLE,
          WorkflowStage.EXTENSION,
          WorkflowStage.COLLAB,
          WorkflowStage.DIALOG,
          WorkflowStage.NETWORK
        ],
        execution_mode: ExecutionMode.SEQUENTIAL,
        timeout_ms: 60000
      });

      // 验证工作流执行成功
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data!.status).toBe(WorkflowStatus.COMPLETED);
      expect(result.data!.completed_stages).toHaveLength(9);

      // 验证所有9个协议都被执行
      const expectedStages = [
        WorkflowStage.CONTEXT,
        WorkflowStage.PLAN,
        WorkflowStage.CONFIRM,
        WorkflowStage.TRACE,
        WorkflowStage.ROLE,
        WorkflowStage.EXTENSION,
        WorkflowStage.COLLAB,
        WorkflowStage.DIALOG,
        WorkflowStage.NETWORK
      ];
      
      expectedStages.forEach(stage => {
        expect(result.data!.completed_stages).toContain(stage);
        expect(result.data!.stage_results).toHaveProperty(stage);
        expect(result.data!.stage_results[stage].status).toBe('completed');
      });
    });

    it('应该能够执行核心6协议工作流（传统MPLP）', async () => {
      // 用户场景：执行传统的6协议MPLP工作流
      const contextId = 'core-six-001';
      
      const result = await coreOrchestrator.executeWorkflow(contextId, {
        name: '核心6协议工作流',
        stages: [
          WorkflowStage.CONTEXT,
          WorkflowStage.PLAN,
          WorkflowStage.CONFIRM,
          WorkflowStage.TRACE,
          WorkflowStage.ROLE,
          WorkflowStage.EXTENSION
        ],
        execution_mode: ExecutionMode.SEQUENTIAL,
        timeout_ms: 30000
      });

      // 验证核心6协议工作流成功
      expect(result.success).toBe(true);
      expect(result.data!.status).toBe(WorkflowStatus.COMPLETED);
      expect(result.data!.completed_stages).toHaveLength(6);
    });

    it('应该能够执行L4智能协议工作流（高级MPLP）', async () => {
      // 用户场景：执行L4智能协议工作流
      const contextId = 'l4-intelligent-001';
      
      const result = await coreOrchestrator.executeWorkflow(contextId, {
        name: 'L4智能协议工作流',
        stages: [
          WorkflowStage.COLLAB,
          WorkflowStage.DIALOG,
          WorkflowStage.NETWORK
        ],
        execution_mode: ExecutionMode.PARALLEL, // L4协议可以并行执行
        timeout_ms: 20000
      });

      // 验证L4智能协议工作流成功
      expect(result.success).toBe(true);
      expect(result.data!.status).toBe(WorkflowStatus.COMPLETED);
      expect(result.data!.completed_stages).toHaveLength(3);
    });
  });

  describe('2. 数据流传递集成测试', () => {
    it('应该能够在协议间正确传递数据', async () => {
      // 用户场景：验证协议间的数据流传递
      const contextId = 'data-flow-001';
      
      const result = await coreOrchestrator.executeWorkflow(contextId, {
        name: '数据流传递测试',
        stages: [
          WorkflowStage.CONTEXT,
          WorkflowStage.PLAN,
          WorkflowStage.CONFIRM
        ],
        execution_mode: ExecutionMode.SEQUENTIAL
      });

      expect(result.success).toBe(true);

      // 验证数据流传递
      const contextResult = result.data!.stage_results[WorkflowStage.CONTEXT];
      const planResult = result.data!.stage_results[WorkflowStage.PLAN];
      const confirmResult = result.data!.stage_results[WorkflowStage.CONFIRM];

      // Context应该产生context_id
      expect(contextResult.result).toHaveProperty('context_id');
      
      // Plan应该接收context_id并产生plan_id
      expect(planResult.result).toHaveProperty('plan_id');
      expect(planResult.result).toHaveProperty('context_id');
      
      // Confirm应该接收plan_id并产生confirm_id
      expect(confirmResult.result).toHaveProperty('confirm_id');
      expect(confirmResult.result).toHaveProperty('plan_id');
    });
  });

  describe('3. 模块状态监控集成测试', () => {
    it('应该能够监控所有9个协议模块的状态', async () => {
      // 用户场景：运维人员监控所有协议模块的健康状态
      const moduleStatuses = await coreOrchestrator.getModuleStatuses();

      // 验证所有9个协议模块都有状态
      const expectedStages = [
        WorkflowStage.CONTEXT,
        WorkflowStage.PLAN,
        WorkflowStage.CONFIRM,
        WorkflowStage.TRACE,
        WorkflowStage.ROLE,
        WorkflowStage.EXTENSION,
        WorkflowStage.COLLAB,
        WorkflowStage.DIALOG,
        WorkflowStage.NETWORK
      ];

      expectedStages.forEach(stage => {
        expect(moduleStatuses).toHaveProperty(stage);
        expect(Object.values(StageStatus)).toContain(moduleStatuses[stage]);
      });

      // 验证所有模块都是健康状态
      Object.values(moduleStatuses).forEach(status => {
        expect(status).not.toBe(StageStatus.FAILED);
      });
    });
  });

  describe('4. 错误处理和恢复集成测试', () => {
    it('应该能够处理单个协议模块的失败', async () => {
      // 用户场景：某个协议模块失败时的系统恢复
      const contextId = 'error-handling-001';
      
      // 模拟Plan模块失败
      const planAdapter = new FailingModuleAdapter(WorkflowStage.PLAN);
      await coreOrchestrator.registerModuleAdapter(WorkflowStage.PLAN, planAdapter);

      const result = await coreOrchestrator.executeWorkflow(contextId, {
        name: '错误处理测试工作流',
        stages: [
          WorkflowStage.CONTEXT,
          WorkflowStage.PLAN,
          WorkflowStage.CONFIRM
        ],
        execution_mode: ExecutionMode.SEQUENTIAL
      });

      // 验证工作流失败但有详细错误信息
      expect(result.success).toBe(false);
      expect(result.error).toContain('plan module failure simulation');
    });
  });

  describe('5. 性能和并发集成测试', () => {
    it('应该能够处理多个协议的并发执行', async () => {
      // 用户场景：高负载环境下的并发协议执行
      const concurrentWorkflows = 3;
      const promises: Promise<any>[] = [];

      for (let i = 0; i < concurrentWorkflows; i++) {
        const promise = coreOrchestrator.executeWorkflow(`concurrent-${i}`, {
          name: `并发集成测试-${i}`,
          stages: [
            WorkflowStage.CONTEXT,
            WorkflowStage.PLAN,
            WorkflowStage.COLLAB,
            WorkflowStage.DIALOG
          ],
          execution_mode: ExecutionMode.SEQUENTIAL
        });
        promises.push(promise);
      }

      const results = await Promise.all(promises);

      // 验证所有并发工作流都成功
      results.forEach((result, index) => {
        expect(result.success).toBe(true);
        expect(result.data.status).toBe(WorkflowStatus.COMPLETED);
        expect(result.data.completed_stages).toHaveLength(4);
      });
    });
  });
});

/**
 * 集成模块适配器，模拟真实协议模块的行为用于集成测试
 */
class IntegrationModuleAdapter extends ModuleAdapterBase {
  constructor(stage: WorkflowStage) {
    super(stage, {
      timeout_ms: 10000,
      retry_attempts: 2,
      enable_health_check: true
    });
  }

  async execute(input: Record<string, any>): Promise<OperationResult> {
    this.logOperationStart('integration-module-execution', input);

    try {
      // 模拟协议模块的执行，生成符合各协议规范的结果
      const result = this.generateModuleResult(input);

      // 模拟执行延迟
      await new Promise(resolve => setTimeout(resolve, 50));

      this.logOperationComplete('integration-module-execution', result);
      return this.buildSuccessResult(result);

    } catch (error) {
      this.logOperationError('integration-module-execution', error as Error);
      return this.buildErrorResult(error instanceof Error ? error.message : 'Module execution failed');
    }
  }

  private generateModuleResult(input: Record<string, any>): any {
    const baseResult = {
      status: 'completed',
      timestamp: new Date().toISOString(),
      workflow_id: input.workflow_id,
      stage: this.stage
    };

    // 根据不同协议生成特定的结果数据
    switch (this.stage) {
      case WorkflowStage.CONTEXT:
        return {
          ...baseResult,
          context_id: `ctx-${Date.now()}`,
          session_id: input.session_id || input.workflow_id,
          configuration: { timeout: 30000 }
        };

      case WorkflowStage.PLAN:
        return {
          ...baseResult,
          plan_id: `plan-${Date.now()}`,
          context_id: input.context_result?.context_id || input.context_id,
          name: 'Integration Test Plan'
        };

      case WorkflowStage.CONFIRM:
        return {
          ...baseResult,
          confirm_id: `confirm-${Date.now()}`,
          plan_id: input.plan_id || input.previous_results?.plan?.result?.plan_id,
          decision: 'approved'
        };

      case WorkflowStage.TRACE:
        return {
          ...baseResult,
          trace_id: `trace-${Date.now()}`,
          events: ['workflow.started', 'stage.completed']
        };

      case WorkflowStage.ROLE:
        return {
          ...baseResult,
          role_id: `role-${Date.now()}`,
          permissions: ['read', 'write', 'execute']
        };

      case WorkflowStage.EXTENSION:
        return {
          ...baseResult,
          extension_id: `ext-${Date.now()}`,
          loaded_extensions: ['core-extension']
        };

      case WorkflowStage.COLLAB:
        return {
          ...baseResult,
          collab_id: `collab-${Date.now()}`,
          participants: ['agent-1', 'agent-2']
        };

      case WorkflowStage.DIALOG:
        return {
          ...baseResult,
          dialog_id: `dialog-${Date.now()}`,
          messages: ['Hello from Core orchestrator']
        };

      case WorkflowStage.NETWORK:
        return {
          ...baseResult,
          network_id: `network-${Date.now()}`,
          nodes: ['node-1', 'node-2']
        };

      default:
        return baseResult;
    }
  }

  protected async performHealthCheck(): Promise<boolean> {
    // 集成测试中的健康检查总是返回true
    return true;
  }

  protected getCapabilities(): string[] {
    return [`integration-${this.stage}`, 'testing', 'simulation'];
  }
}

/**
 * 失败模块适配器，用于测试错误处理
 */
class FailingModuleAdapter extends ModuleAdapterBase {
  constructor(stage: WorkflowStage) {
    super(stage, {
      timeout_ms: 5000,
      retry_attempts: 1,
      enable_health_check: false
    });
  }

  async execute(input: Record<string, any>): Promise<OperationResult> {
    this.logOperationStart('failing-module-execution', input);
    
    const error = new Error(`${this.stage} module failure simulation`);
    this.logOperationError('failing-module-execution', error);
    
    return this.buildErrorResult(error.message);
  }

  protected async performHealthCheck(): Promise<boolean> {
    return false;
  }

  protected getCapabilities(): string[] {
    return [`failing-${this.stage}`, 'testing', 'error-simulation'];
  }
}
