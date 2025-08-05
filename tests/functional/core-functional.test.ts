/**
 * Core协议功能场景测试
 * @description 基于真实用户需求的Core协议功能验证
 * @author MPLP Team
 * @version 1.0.0
 */

import {
  createCoreOrchestrator,
  createCoreModule,
  CoreOrchestratorService,
  WorkflowExecution,
  WorkflowStage,
  WorkflowStatus,
  ExecutionMode,
  Priority,
  StageStatus,
  IModuleAdapter,
  ModuleAdapterBase,
  OperationResult,
  ModuleMetadata
} from '../../src/modules/core';

describe('Core协议功能场景测试 - 基于真实用户需求', () => {
  let coreOrchestrator: CoreOrchestratorService;
  let mockModuleAdapters: Map<WorkflowStage, IModuleAdapter>;

  beforeEach(async () => {
    // 创建Core协调器
    coreOrchestrator = createCoreOrchestrator({
      module_timeout_ms: 5000,
      max_concurrent_executions: 10,
      enable_metrics: true,
      enable_events: true
    });

    // 创建Mock模块适配器
    mockModuleAdapters = new Map();
    
    // 为每个工作流阶段创建Mock适配器
    const stages = [WorkflowStage.CONTEXT, WorkflowStage.PLAN, WorkflowStage.CONFIRM, WorkflowStage.TRACE];
    
    for (const stage of stages) {
      const adapter = new MockModuleAdapter(stage);
      mockModuleAdapters.set(stage, adapter);
      await coreOrchestrator.registerModuleAdapter(stage, adapter);
    }
  });

  afterEach(() => {
    // 清理Mock适配器
    mockModuleAdapters.forEach(adapter => {
      if (adapter instanceof MockModuleAdapter) {
        adapter.dispose();
      }
    });
  });

  describe('1. 基础工作流执行场景 - 项目经理日常使用', () => {
    it('应该让项目经理能够执行标准的MPLP工作流', async () => {
      // 用户场景：项目经理启动一个新项目的完整MPLP工作流
      const contextId = 'project-001';
      
      const result = await coreOrchestrator.executeWorkflow(contextId, {
        name: '新项目启动工作流',
        stages: [WorkflowStage.CONTEXT, WorkflowStage.PLAN, WorkflowStage.CONFIRM, WorkflowStage.TRACE],
        execution_mode: ExecutionMode.SEQUENTIAL,
        timeout_ms: 30000
      });

      // 验证工作流执行成功
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data!.status).toBe(WorkflowStatus.COMPLETED);
      expect(result.data!.completed_stages).toHaveLength(4);
      expect(result.data!.completed_stages).toEqual([
        WorkflowStage.CONTEXT,
        WorkflowStage.PLAN,
        WorkflowStage.CONFIRM,
        WorkflowStage.TRACE
      ]);

      // 验证每个阶段都有结果
      expect(result.data!.stage_results).toHaveProperty(WorkflowStage.CONTEXT);
      expect(result.data!.stage_results).toHaveProperty(WorkflowStage.PLAN);
      expect(result.data!.stage_results).toHaveProperty(WorkflowStage.CONFIRM);
      expect(result.data!.stage_results).toHaveProperty(WorkflowStage.TRACE);

      // 验证执行时间合理
      expect(result.data!.duration_ms).toBeGreaterThan(0);
      expect(result.data!.duration_ms).toBeLessThan(30000);
    });

    it('应该让项目经理能够执行并行工作流以提高效率', async () => {
      // 用户场景：项目经理需要快速执行多个独立的工作流阶段
      const contextId = 'project-002';
      
      const result = await coreOrchestrator.executeWorkflow(contextId, {
        name: '并行效率工作流',
        stages: [WorkflowStage.CONTEXT, WorkflowStage.PLAN, WorkflowStage.TRACE], // 跳过Confirm以测试并行
        execution_mode: ExecutionMode.PARALLEL,
        timeout_ms: 15000
      });

      // 验证并行执行成功
      expect(result.success).toBe(true);
      expect(result.data!.status).toBe(WorkflowStatus.COMPLETED);
      expect(result.data!.completed_stages).toHaveLength(3);

      // 验证并行执行时间更短（应该比顺序执行快）
      expect(result.data!.duration_ms).toBeLessThan(15000);
    });
  });

  describe('2. 工作流状态管理场景 - 运维人员监控需求', () => {
    it('应该让运维人员能够实时监控工作流执行状态', async () => {
      // 用户场景：运维人员需要监控正在执行的工作流状态
      const contextId = 'monitoring-001';
      
      // 启动一个长时间运行的工作流（通过Mock控制）
      const workflowPromise = coreOrchestrator.executeWorkflow(contextId, {
        name: '监控测试工作流',
        stages: [WorkflowStage.CONTEXT],
        execution_mode: ExecutionMode.SEQUENTIAL
      });

      // 等待一小段时间让工作流开始
      await new Promise(resolve => setTimeout(resolve, 100));

      // 获取活跃工作流列表
      const activeWorkflows = await coreOrchestrator.getActiveExecutions();
      expect(activeWorkflows.length).toBeGreaterThan(0);

      // 等待工作流完成
      const result = await workflowPromise;
      expect(result.success).toBe(true);

      // 验证工作流不再活跃
      const finalActiveWorkflows = await coreOrchestrator.getActiveExecutions();
      expect(finalActiveWorkflows.length).toBe(0);
    });

    it('应该让运维人员能够获取所有模块的健康状态', async () => {
      // 用户场景：运维人员检查所有MPLP模块的健康状态
      const moduleStatuses = await coreOrchestrator.getModuleStatuses();

      // 验证所有注册的模块都有状态
      expect(moduleStatuses).toHaveProperty(WorkflowStage.CONTEXT);
      expect(moduleStatuses).toHaveProperty(WorkflowStage.PLAN);
      expect(moduleStatuses).toHaveProperty(WorkflowStage.CONFIRM);
      expect(moduleStatuses).toHaveProperty(WorkflowStage.TRACE);

      // 验证状态值有效
      Object.values(moduleStatuses).forEach(status => {
        expect(Object.values(StageStatus)).toContain(status);
      });
    });
  });

  describe('3. 工作流控制场景 - 管理员操作需求', () => {
    it('应该让管理员能够暂停和恢复工作流执行', async () => {
      // 用户场景：管理员需要暂停一个正在执行的工作流进行维护
      const contextId = 'control-001';
      
      // 设置Mock适配器延迟执行
      const contextAdapter = mockModuleAdapters.get(WorkflowStage.CONTEXT) as MockModuleAdapter;
      contextAdapter.setExecutionDelay(2000);

      // 启动工作流
      const workflowPromise = coreOrchestrator.executeWorkflow(contextId, {
        name: '可控制工作流',
        stages: [WorkflowStage.CONTEXT],
        execution_mode: ExecutionMode.SEQUENTIAL
      });

      // 等待工作流开始
      await new Promise(resolve => setTimeout(resolve, 100));

      // 获取工作流ID
      const activeWorkflows = await coreOrchestrator.getActiveExecutions();
      expect(activeWorkflows.length).toBe(1);
      const workflowId = activeWorkflows[0];

      // 暂停工作流
      const pauseResult = await coreOrchestrator.pauseWorkflow(workflowId);
      expect(pauseResult.success).toBe(true);

      // 验证工作流状态
      const statusAfterPause = await coreOrchestrator.getExecutionStatus(workflowId);
      expect(statusAfterPause.success).toBe(true);
      expect(statusAfterPause.data!.status).toBe(WorkflowStatus.PAUSED);

      // 恢复工作流
      const resumeResult = await coreOrchestrator.resumeWorkflow(workflowId);
      expect(resumeResult.success).toBe(true);

      // 等待工作流完成
      const result = await workflowPromise;
      expect(result.success).toBe(true);
    });

    it('应该让管理员能够取消不需要的工作流', async () => {
      // 用户场景：管理员需要取消一个错误启动的工作流
      const contextId = 'cancel-001';
      
      // 设置Mock适配器长时间延迟
      const contextAdapter = mockModuleAdapters.get(WorkflowStage.CONTEXT) as MockModuleAdapter;
      contextAdapter.setExecutionDelay(5000);

      // 启动工作流
      const workflowPromise = coreOrchestrator.executeWorkflow(contextId, {
        name: '待取消工作流',
        stages: [WorkflowStage.CONTEXT],
        execution_mode: ExecutionMode.SEQUENTIAL
      });

      // 等待工作流开始
      await new Promise(resolve => setTimeout(resolve, 100));

      // 获取工作流ID并取消
      const activeWorkflows = await coreOrchestrator.getActiveExecutions();
      const workflowId = activeWorkflows[0];
      
      const cancelResult = await coreOrchestrator.cancelWorkflow(workflowId);
      expect(cancelResult.success).toBe(true);

      // 验证工作流被取消
      const statusAfterCancel = await coreOrchestrator.getExecutionStatus(workflowId);
      expect(statusAfterCancel.success).toBe(true);
      expect(statusAfterCancel.data!.status).toBe(WorkflowStatus.CANCELLED);

      // 工作流应该不再活跃
      const finalActiveWorkflows = await coreOrchestrator.getActiveExecutions();
      expect(finalActiveWorkflows).not.toContain(workflowId);
    });
  });

  describe('4. 错误处理场景 - 系统健壮性验证', () => {
    it('应该能够处理模块执行失败的情况', async () => {
      // 用户场景：某个模块出现故障，系统应该优雅处理
      const contextId = 'error-001';
      
      // 设置Mock适配器模拟失败
      const planAdapter = mockModuleAdapters.get(WorkflowStage.PLAN) as MockModuleAdapter;
      planAdapter.setFailureMode(true, 'Plan module simulated failure');

      const result = await coreOrchestrator.executeWorkflow(contextId, {
        name: '错误处理测试工作流',
        stages: [WorkflowStage.CONTEXT, WorkflowStage.PLAN],
        execution_mode: ExecutionMode.SEQUENTIAL
      });

      // 验证工作流失败但有详细错误信息
      expect(result.success).toBe(false);
      expect(result.error).toContain('Plan module simulated failure');
    });

    it('应该能够处理无效的工作流配置', async () => {
      // 用户场景：用户提供了无效的配置，系统应该给出清晰的错误提示
      const contextId = 'invalid-config-001';
      
      const result = await coreOrchestrator.executeWorkflow(contextId, {
        name: '', // 无效的空名称
        stages: [], // 无效的空阶段列表
        execution_mode: ExecutionMode.SEQUENTIAL
      });

      // 验证配置验证失败
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid workflow configuration');
    });
  });

  describe('5. 性能和并发场景 - 企业级使用需求', () => {
    it('应该能够处理多个并发工作流执行', async () => {
      // 用户场景：企业环境中多个项目同时启动工作流
      const concurrentCount = 5;
      const workflowPromises: Promise<any>[] = [];

      for (let i = 0; i < concurrentCount; i++) {
        const promise = coreOrchestrator.executeWorkflow(`concurrent-${i}`, {
          name: `并发工作流-${i}`,
          stages: [WorkflowStage.CONTEXT, WorkflowStage.PLAN],
          execution_mode: ExecutionMode.SEQUENTIAL
        });
        workflowPromises.push(promise);
      }

      // 等待所有工作流完成
      const results = await Promise.all(workflowPromises);

      // 验证所有工作流都成功完成
      results.forEach((result, index) => {
        expect(result.success).toBe(true);
        expect(result.data.status).toBe(WorkflowStatus.COMPLETED);
      });
    });

    it('应该能够在达到并发限制时拒绝新的工作流', async () => {
      // 用户场景：系统达到最大并发限制时的保护机制
      
      // 创建一个低并发限制的协调器
      const limitedOrchestrator = createCoreOrchestrator({
        max_concurrent_executions: 2
      });

      // 注册适配器
      for (const [stage, adapter] of mockModuleAdapters) {
        await limitedOrchestrator.registerModuleAdapter(stage, adapter);
      }

      // 设置长延迟以保持工作流活跃
      const contextAdapter = mockModuleAdapters.get(WorkflowStage.CONTEXT) as MockModuleAdapter;
      contextAdapter.setExecutionDelay(2000);

      // 启动最大数量的工作流
      const workflowPromises = [];
      for (let i = 0; i < 2; i++) {
        const promise = limitedOrchestrator.executeWorkflow(`limited-${i}`, {
          name: `限制测试工作流-${i}`,
          stages: [WorkflowStage.CONTEXT],
          execution_mode: ExecutionMode.SEQUENTIAL
        });
        workflowPromises.push(promise);
      }

      // 等待工作流开始
      await new Promise(resolve => setTimeout(resolve, 100));

      // 尝试启动超出限制的工作流
      const excessResult = await limitedOrchestrator.executeWorkflow('excess', {
        name: '超出限制的工作流',
        stages: [WorkflowStage.CONTEXT],
        execution_mode: ExecutionMode.SEQUENTIAL
      });

      // 验证被拒绝
      expect(excessResult.success).toBe(false);
      expect(excessResult.error).toContain('Maximum concurrent executions reached');

      // 等待原有工作流完成
      await Promise.all(workflowPromises);
    });
  });
});

/**
 * Mock模块适配器，用于测试
 */
class MockModuleAdapter extends ModuleAdapterBase {
  private executionDelay = 100;
  private shouldFail = false;
  private failureMessage = 'Mock failure';

  constructor(stage: WorkflowStage) {
    super(stage, {
      timeout_ms: 10000,
      retry_attempts: 1,
      enable_health_check: false
    });
  }

  async execute(input: Record<string, any>): Promise<OperationResult> {
    this.logOperationStart('mock-execution', input);

    try {
      // 模拟执行延迟
      await new Promise(resolve => setTimeout(resolve, this.executionDelay));

      // 模拟失败
      if (this.shouldFail) {
        throw new Error(this.failureMessage);
      }

      // 模拟成功结果
      const result = {
        [`${this.stage}_id`]: `mock-${this.stage}-${Date.now()}`,
        status: 'completed',
        timestamp: new Date().toISOString(),
        input_received: Object.keys(input)
      };

      this.logOperationComplete('mock-execution', result);
      return this.buildSuccessResult(result);

    } catch (error) {
      this.logOperationError('mock-execution', error as Error);
      return this.buildErrorResult(error instanceof Error ? error.message : 'Mock execution failed');
    }
  }

  protected async performHealthCheck(): Promise<boolean> {
    return !this.shouldFail;
  }

  protected getCapabilities(): string[] {
    return [`mock-${this.stage}`, 'testing', 'simulation'];
  }

  // 测试辅助方法
  setExecutionDelay(delay: number): void {
    this.executionDelay = delay;
  }

  setFailureMode(shouldFail: boolean, message?: string): void {
    this.shouldFail = shouldFail;
    if (message) {
      this.failureMessage = message;
    }
  }
}
