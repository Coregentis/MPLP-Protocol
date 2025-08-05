/**
 * MPLP Core协议示例代码
 * @description 展示Core协议的各种使用场景和最佳实践
 * @author MPLP Team
 * @version 1.0.0
 */

import {
  createCoreOrchestrator,
  createCoreModule,
  CoreOrchestratorService,
  ModuleAdapterBase,
  WorkflowStage,
  WorkflowStatus,
  ExecutionMode,
  Priority,
  EventType,
  OperationResult
} from '../src/modules/core';

// ===== 示例1：基本工作流执行 =====

async function basicWorkflowExample() {
  console.log('=== 示例1：基本工作流执行 ===');
  
  // 创建Core协调器
  const orchestrator = createCoreOrchestrator({
    module_timeout_ms: 30000,
    max_concurrent_executions: 10,
    enable_metrics: true,
    enable_events: true
  });

  // 注册简单的模块适配器
  await orchestrator.registerModuleAdapter(WorkflowStage.CONTEXT, new ExampleContextAdapter());
  await orchestrator.registerModuleAdapter(WorkflowStage.PLAN, new ExamplePlanAdapter());
  await orchestrator.registerModuleAdapter(WorkflowStage.CONFIRM, new ExampleConfirmAdapter());

  try {
    // 执行基本工作流
    const result = await orchestrator.executeWorkflow('example-context-001', {
      name: '基本示例工作流',
      description: '演示Core协议的基本使用',
      stages: [WorkflowStage.CONTEXT, WorkflowStage.PLAN, WorkflowStage.CONFIRM],
      execution_mode: ExecutionMode.SEQUENTIAL,
      timeout_ms: 60000
    });

    if (result.success) {
      console.log('✅ 工作流执行成功');
      console.log('工作流ID:', result.data!.workflow_id);
      console.log('执行状态:', result.data!.status);
      console.log('完成阶段:', result.data!.completed_stages);
      console.log('执行时长:', result.data!.duration_ms, 'ms');
    } else {
      console.error('❌ 工作流执行失败:', result.error);
    }
  } catch (error) {
    console.error('❌ 系统错误:', error);
  }
}

// ===== 示例2：完整MPLP工作流 =====

async function fullMPLPWorkflowExample() {
  console.log('\n=== 示例2：完整MPLP工作流 ===');
  
  const orchestrator = createCoreOrchestrator();

  // 注册所有9个协议模块的适配器
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
    await orchestrator.registerModuleAdapter(stage, new GenericExampleAdapter(stage));
  }

  try {
    const result = await orchestrator.executeWorkflow('full-mplp-001', {
      name: '完整MPLP生命周期工作流',
      description: '包含所有9个协议模块的完整工作流',
      stages: stages,
      execution_mode: ExecutionMode.SEQUENTIAL,
      timeout_ms: 120000,
      retry_policy: {
        max_attempts: 3,
        delay_ms: 1000,
        backoff_factor: 2.0
      }
    });

    if (result.success) {
      console.log('✅ 完整MPLP工作流执行成功');
      console.log('总执行时长:', result.data!.duration_ms, 'ms');
      
      // 显示各阶段执行结果
      Object.entries(result.data!.stage_results).forEach(([stage, stageResult]) => {
        console.log(`  ${stage}: ${stageResult.status} (${stageResult.duration_ms}ms)`);
      });
    }
  } catch (error) {
    console.error('❌ 完整工作流执行失败:', error);
  }
}

// ===== 示例3：并行执行工作流 =====

async function parallelWorkflowExample() {
  console.log('\n=== 示例3：并行执行工作流 ===');
  
  const orchestrator = createCoreOrchestrator({
    max_concurrent_executions: 5
  });

  // 注册L4智能协议模块
  await orchestrator.registerModuleAdapter(WorkflowStage.COLLAB, new GenericExampleAdapter(WorkflowStage.COLLAB));
  await orchestrator.registerModuleAdapter(WorkflowStage.DIALOG, new GenericExampleAdapter(WorkflowStage.DIALOG));
  await orchestrator.registerModuleAdapter(WorkflowStage.NETWORK, new GenericExampleAdapter(WorkflowStage.NETWORK));

  try {
    const startTime = Date.now();
    
    const result = await orchestrator.executeWorkflow('parallel-001', {
      name: 'L4智能协议并行工作流',
      description: '演示L4智能协议的并行执行',
      stages: [WorkflowStage.COLLAB, WorkflowStage.DIALOG, WorkflowStage.NETWORK],
      execution_mode: ExecutionMode.PARALLEL,
      timeout_ms: 30000
    });

    const totalTime = Date.now() - startTime;

    if (result.success) {
      console.log('✅ 并行工作流执行成功');
      console.log('总耗时:', totalTime, 'ms');
      console.log('工作流耗时:', result.data!.duration_ms, 'ms');
      console.log('并行执行效率提升:', Math.round((1 - result.data!.duration_ms! / totalTime) * 100), '%');
    }
  } catch (error) {
    console.error('❌ 并行工作流执行失败:', error);
  }
}

// ===== 示例4：工作流状态监控 =====

async function workflowMonitoringExample() {
  console.log('\n=== 示例4：工作流状态监控 ===');
  
  const orchestrator = createCoreOrchestrator();
  
  // 注册适配器
  await orchestrator.registerModuleAdapter(WorkflowStage.CONTEXT, new SlowExampleAdapter(WorkflowStage.CONTEXT, 2000));
  await orchestrator.registerModuleAdapter(WorkflowStage.PLAN, new SlowExampleAdapter(WorkflowStage.PLAN, 3000));

  try {
    // 启动长时间运行的工作流
    const workflowPromise = orchestrator.executeWorkflow('monitoring-001', {
      name: '监控示例工作流',
      stages: [WorkflowStage.CONTEXT, WorkflowStage.PLAN],
      execution_mode: ExecutionMode.SEQUENTIAL
    });

    // 监控工作流状态
    const monitorInterval = setInterval(async () => {
      const activeWorkflows = await orchestrator.getActiveExecutions();
      
      if (activeWorkflows.length > 0) {
        console.log('📊 活跃工作流数量:', activeWorkflows.length);
        
        for (const workflowId of activeWorkflows) {
          const status = await orchestrator.getExecutionStatus(workflowId);
          if (status.success) {
            console.log(`  工作流 ${workflowId}:`);
            console.log(`    状态: ${status.data!.status}`);
            console.log(`    当前阶段: ${status.data!.current_stage || '无'}`);
            console.log(`    已完成阶段: ${status.data!.completed_stages?.length || 0}`);
          }
        }
      } else {
        console.log('📊 没有活跃的工作流');
        clearInterval(monitorInterval);
      }
    }, 1000);

    // 等待工作流完成
    const result = await workflowPromise;
    clearInterval(monitorInterval);

    if (result.success) {
      console.log('✅ 监控工作流执行完成');
    }
  } catch (error) {
    console.error('❌ 监控示例失败:', error);
  }
}

// ===== 示例5：事件处理 =====

async function eventHandlingExample() {
  console.log('\n=== 示例5：事件处理 ===');
  
  const orchestrator = createCoreOrchestrator({
    enable_events: true
  });

  // 注册事件监听器
  orchestrator.addEventListener(EventType.WORKFLOW_STARTED, (event) => {
    console.log('🚀 工作流开始:', event.data.workflow_id);
  });

  orchestrator.addEventListener(EventType.STAGE_STARTED, (event) => {
    console.log('▶️  阶段开始:', event.data.stage);
  });

  orchestrator.addEventListener(EventType.STAGE_COMPLETED, (event) => {
    console.log('✅ 阶段完成:', event.data.stage);
  });

  orchestrator.addEventListener(EventType.WORKFLOW_COMPLETED, (event) => {
    console.log('🎉 工作流完成:', event.data.workflow_id);
  });

  orchestrator.addEventListener(EventType.WORKFLOW_FAILED, (event) => {
    console.log('❌ 工作流失败:', event.data.workflow_id, event.data.error);
  });

  // 注册适配器
  await orchestrator.registerModuleAdapter(WorkflowStage.CONTEXT, new GenericExampleAdapter(WorkflowStage.CONTEXT));
  await orchestrator.registerModuleAdapter(WorkflowStage.PLAN, new GenericExampleAdapter(WorkflowStage.PLAN));

  try {
    const result = await orchestrator.executeWorkflow('events-001', {
      name: '事件处理示例工作流',
      stages: [WorkflowStage.CONTEXT, WorkflowStage.PLAN],
      execution_mode: ExecutionMode.SEQUENTIAL
    });

    console.log('事件处理示例完成');
  } catch (error) {
    console.error('❌ 事件处理示例失败:', error);
  }
}

// ===== 示例6：工作流控制 =====

async function workflowControlExample() {
  console.log('\n=== 示例6：工作流控制 ===');
  
  const orchestrator = createCoreOrchestrator();
  
  // 注册慢速适配器用于演示控制
  await orchestrator.registerModuleAdapter(WorkflowStage.CONTEXT, new SlowExampleAdapter(WorkflowStage.CONTEXT, 5000));

  try {
    // 启动工作流
    const workflowPromise = orchestrator.executeWorkflow('control-001', {
      name: '控制示例工作流',
      stages: [WorkflowStage.CONTEXT],
      execution_mode: ExecutionMode.SEQUENTIAL
    });

    // 等待工作流开始
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 获取工作流ID
    const activeWorkflows = await orchestrator.getActiveExecutions();
    if (activeWorkflows.length > 0) {
      const workflowId = activeWorkflows[0];
      
      console.log('⏸️  暂停工作流...');
      const pauseResult = await orchestrator.pauseWorkflow(workflowId);
      if (pauseResult.success) {
        console.log('✅ 工作流已暂停');
        
        // 等待2秒后恢复
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        console.log('▶️  恢复工作流...');
        const resumeResult = await orchestrator.resumeWorkflow(workflowId);
        if (resumeResult.success) {
          console.log('✅ 工作流已恢复');
        }
      }
    }

    // 等待工作流完成
    const result = await workflowPromise;
    if (result.success) {
      console.log('✅ 控制示例工作流完成');
    }
  } catch (error) {
    console.error('❌ 工作流控制示例失败:', error);
  }
}

// ===== 示例7：错误处理和重试 =====

async function errorHandlingExample() {
  console.log('\n=== 示例7：错误处理和重试 ===');
  
  const orchestrator = createCoreOrchestrator();
  
  // 注册会失败的适配器
  await orchestrator.registerModuleAdapter(WorkflowStage.CONTEXT, new GenericExampleAdapter(WorkflowStage.CONTEXT));
  await orchestrator.registerModuleAdapter(WorkflowStage.PLAN, new FailingExampleAdapter(WorkflowStage.PLAN));

  try {
    const result = await orchestrator.executeWorkflow('error-001', {
      name: '错误处理示例工作流',
      stages: [WorkflowStage.CONTEXT, WorkflowStage.PLAN],
      execution_mode: ExecutionMode.SEQUENTIAL,
      retry_policy: {
        max_attempts: 3,
        delay_ms: 1000,
        backoff_factor: 2.0
      }
    });

    if (!result.success) {
      console.log('❌ 工作流按预期失败:', result.error);
      console.log('这演示了Core协议的错误处理机制');
    }
  } catch (error) {
    console.error('❌ 错误处理示例失败:', error);
  }
}

// ===== 适配器实现示例 =====

class ExampleContextAdapter extends ModuleAdapterBase {
  constructor() {
    super(WorkflowStage.CONTEXT, {
      timeout_ms: 10000,
      retry_attempts: 2,
      enable_health_check: true
    });
  }

  async execute(input: Record<string, any>): Promise<OperationResult> {
    this.logOperationStart('context-execution', input);
    
    try {
      // 模拟Context模块的处理
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const result = {
        context_id: `ctx-${Date.now()}`,
        session_id: input.session_id || input.workflow_id,
        configuration: { timeout: 30000 },
        status: 'completed',
        timestamp: new Date().toISOString()
      };

      this.logOperationComplete('context-execution', result);
      return this.buildSuccessResult(result);
    } catch (error) {
      this.logOperationError('context-execution', error as Error);
      return this.buildErrorResult(error instanceof Error ? error.message : 'Context execution failed');
    }
  }

  protected async performHealthCheck(): Promise<boolean> {
    return true;
  }

  protected getCapabilities(): string[] {
    return ['context-management', 'session-handling'];
  }
}

class ExamplePlanAdapter extends ModuleAdapterBase {
  constructor() {
    super(WorkflowStage.PLAN, {
      timeout_ms: 10000,
      retry_attempts: 2,
      enable_health_check: true
    });
  }

  async execute(input: Record<string, any>): Promise<OperationResult> {
    this.logOperationStart('plan-execution', input);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const result = {
        plan_id: `plan-${Date.now()}`,
        context_id: input.context_result?.context_id || input.context_id,
        name: 'Example Plan',
        status: 'completed',
        timestamp: new Date().toISOString()
      };

      this.logOperationComplete('plan-execution', result);
      return this.buildSuccessResult(result);
    } catch (error) {
      this.logOperationError('plan-execution', error as Error);
      return this.buildErrorResult(error instanceof Error ? error.message : 'Plan execution failed');
    }
  }

  protected async performHealthCheck(): Promise<boolean> {
    return true;
  }

  protected getCapabilities(): string[] {
    return ['plan-creation', 'task-scheduling'];
  }
}

class ExampleConfirmAdapter extends ModuleAdapterBase {
  constructor() {
    super(WorkflowStage.CONFIRM, {
      timeout_ms: 10000,
      retry_attempts: 2,
      enable_health_check: true
    });
  }

  async execute(input: Record<string, any>): Promise<OperationResult> {
    this.logOperationStart('confirm-execution', input);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const result = {
        confirm_id: `confirm-${Date.now()}`,
        plan_id: input.plan_id || input.previous_results?.plan?.result?.plan_id,
        decision: 'approved',
        status: 'completed',
        timestamp: new Date().toISOString()
      };

      this.logOperationComplete('confirm-execution', result);
      return this.buildSuccessResult(result);
    } catch (error) {
      this.logOperationError('confirm-execution', error as Error);
      return this.buildErrorResult(error instanceof Error ? error.message : 'Confirm execution failed');
    }
  }

  protected async performHealthCheck(): Promise<boolean> {
    return true;
  }

  protected getCapabilities(): string[] {
    return ['approval-processing', 'decision-making'];
  }
}

class GenericExampleAdapter extends ModuleAdapterBase {
  constructor(stage: WorkflowStage) {
    super(stage, {
      timeout_ms: 10000,
      retry_attempts: 2,
      enable_health_check: true
    });
  }

  async execute(input: Record<string, any>): Promise<OperationResult> {
    this.logOperationStart('generic-execution', input);
    
    try {
      // 模拟处理时间
      await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 200));
      
      const result = {
        [`${this.stage}_id`]: `${this.stage}-${Date.now()}`,
        workflow_id: input.workflow_id,
        status: 'completed',
        timestamp: new Date().toISOString()
      };

      this.logOperationComplete('generic-execution', result);
      return this.buildSuccessResult(result);
    } catch (error) {
      this.logOperationError('generic-execution', error as Error);
      return this.buildErrorResult(error instanceof Error ? error.message : 'Generic execution failed');
    }
  }

  protected async performHealthCheck(): Promise<boolean> {
    return true;
  }

  protected getCapabilities(): string[] {
    return [`${this.stage}-processing`, 'example-implementation'];
  }
}

class SlowExampleAdapter extends ModuleAdapterBase {
  constructor(stage: WorkflowStage, private delay: number) {
    super(stage, {
      timeout_ms: delay + 5000,
      retry_attempts: 1,
      enable_health_check: true
    });
  }

  async execute(input: Record<string, any>): Promise<OperationResult> {
    this.logOperationStart('slow-execution', input);
    
    try {
      // 模拟慢速处理
      await new Promise(resolve => setTimeout(resolve, this.delay));
      
      const result = {
        [`${this.stage}_id`]: `${this.stage}-${Date.now()}`,
        workflow_id: input.workflow_id,
        delay: this.delay,
        status: 'completed',
        timestamp: new Date().toISOString()
      };

      this.logOperationComplete('slow-execution', result);
      return this.buildSuccessResult(result);
    } catch (error) {
      this.logOperationError('slow-execution', error as Error);
      return this.buildErrorResult(error instanceof Error ? error.message : 'Slow execution failed');
    }
  }

  protected async performHealthCheck(): Promise<boolean> {
    return true;
  }

  protected getCapabilities(): string[] {
    return [`slow-${this.stage}-processing`, 'delay-simulation'];
  }
}

class FailingExampleAdapter extends ModuleAdapterBase {
  constructor(stage: WorkflowStage) {
    super(stage, {
      timeout_ms: 5000,
      retry_attempts: 1,
      enable_health_check: false
    });
  }

  async execute(input: Record<string, any>): Promise<OperationResult> {
    this.logOperationStart('failing-execution', input);
    
    const error = new Error(`${this.stage} module intentional failure for demonstration`);
    this.logOperationError('failing-execution', error);
    
    return this.buildErrorResult(error.message);
  }

  protected async performHealthCheck(): Promise<boolean> {
    return false;
  }

  protected getCapabilities(): string[] {
    return [`failing-${this.stage}`, 'error-simulation'];
  }
}

// ===== 主函数：运行所有示例 =====

async function runAllExamples() {
  console.log('🚀 MPLP Core协议示例演示开始\n');
  
  try {
    await basicWorkflowExample();
    await fullMPLPWorkflowExample();
    await parallelWorkflowExample();
    await workflowMonitoringExample();
    await eventHandlingExample();
    await workflowControlExample();
    await errorHandlingExample();
    
    console.log('\n🎉 所有示例演示完成！');
  } catch (error) {
    console.error('\n❌ 示例演示过程中发生错误:', error);
  }
}

// 如果直接运行此文件，则执行所有示例
if (require.main === module) {
  runAllExamples().catch(console.error);
}

export {
  basicWorkflowExample,
  fullMPLPWorkflowExample,
  parallelWorkflowExample,
  workflowMonitoringExample,
  eventHandlingExample,
  workflowControlExample,
  errorHandlingExample,
  runAllExamples
};
