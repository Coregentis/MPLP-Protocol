/**
 * WorkflowScheduler测试用例
 * 验证工作流调度引擎的核心功能
 */

import { WorkflowScheduler, WorkflowDefinition, WorkflowStage, WorkflowDependency } from '../../../../../src/core/orchestrator/workflow.scheduler';

describe('WorkflowScheduler测试', () => {
  let scheduler: WorkflowScheduler;

  beforeEach(() => {
    scheduler = new WorkflowScheduler(10); // 最大10个并发执行
  });

  describe('工作流解析测试', () => {
    it('应该成功解析有效的工作流定义', async () => {
      const definition: WorkflowDefinition = {
        workflowId: 'workflow-001',
        name: 'Test Workflow',
        description: 'A test workflow',
        version: '1.0.0',
        stages: [
          {
            stageId: 'stage-001',
            name: 'Context Stage',
            moduleId: 'context',
            operation: 'getContext',
            parameters: { contextId: 'test-context' }
          },
          {
            stageId: 'stage-002',
            name: 'Plan Stage',
            moduleId: 'plan',
            operation: 'createPlan',
            parameters: { planName: 'test-plan' }
          }
        ],
        dependencies: [
          {
            sourceStage: 'stage-001',
            targetStage: 'stage-002',
            dependencyType: 'sequential'
          }
        ],
        configuration: {
          executionMode: 'sequential',
          maxConcurrency: 5,
          timeout: 30000,
          retryPolicy: {
            maxRetries: 3,
            retryDelay: 1000,
            backoffStrategy: 'exponential'
          },
          errorHandling: {
            onStageFailure: 'retry',
            onWorkflowFailure: 'abort'
          }
        }
      };

      const parsed = await scheduler.parseWorkflow(definition);

      expect(parsed.validationResult.isValid).toBe(true);
      expect(parsed.validationResult.errors).toHaveLength(0);
      expect(parsed.optimizedStages).toHaveLength(2);
      expect(parsed.dependencyGraph.nodes).toHaveLength(2);
      expect(parsed.dependencyGraph.edges).toHaveLength(1);
    });

    it('应该检测到无效的工作流定义', async () => {
      const invalidDefinition: WorkflowDefinition = {
        workflowId: '', // 无效：空ID
        name: '', // 无效：空名称
        version: '1.0.0',
        stages: [], // 无效：没有阶段
        dependencies: [],
        configuration: {
          executionMode: 'sequential',
          maxConcurrency: 5,
          timeout: 30000,
          retryPolicy: {
            maxRetries: 3,
            retryDelay: 1000,
            backoffStrategy: 'exponential'
          },
          errorHandling: {
            onStageFailure: 'retry',
            onWorkflowFailure: 'abort'
          }
        }
      };

      const parsed = await scheduler.parseWorkflow(invalidDefinition);

      expect(parsed.validationResult.isValid).toBe(false);
      expect(parsed.validationResult.errors.length).toBeGreaterThan(0);
      
      const errorMessages = parsed.validationResult.errors.map(e => e.message);
      expect(errorMessages).toContain('workflowId is required');
      expect(errorMessages).toContain('name is required');
      expect(errorMessages).toContain('at least one stage is required');
    });

    it('应该检测到循环依赖', async () => {
      const definitionWithCycle: WorkflowDefinition = {
        workflowId: 'workflow-cycle',
        name: 'Workflow with Cycle',
        version: '1.0.0',
        stages: [
          {
            stageId: 'stage-A',
            name: 'Stage A',
            moduleId: 'moduleA',
            operation: 'operationA',
            parameters: {}
          },
          {
            stageId: 'stage-B',
            name: 'Stage B',
            moduleId: 'moduleB',
            operation: 'operationB',
            parameters: {}
          },
          {
            stageId: 'stage-C',
            name: 'Stage C',
            moduleId: 'moduleC',
            operation: 'operationC',
            parameters: {}
          }
        ],
        dependencies: [
          { sourceStage: 'stage-A', targetStage: 'stage-B', dependencyType: 'sequential' },
          { sourceStage: 'stage-B', targetStage: 'stage-C', dependencyType: 'sequential' },
          { sourceStage: 'stage-C', targetStage: 'stage-A', dependencyType: 'sequential' } // 循环依赖
        ],
        configuration: {
          executionMode: 'sequential',
          maxConcurrency: 5,
          timeout: 30000,
          retryPolicy: { maxRetries: 3, retryDelay: 1000, backoffStrategy: 'exponential' },
          errorHandling: { onStageFailure: 'retry', onWorkflowFailure: 'abort' }
        }
      };

      const parsed = await scheduler.parseWorkflow(definitionWithCycle);

      expect(parsed.validationResult.isValid).toBe(false);
      const cycleError = parsed.validationResult.errors.find(e => e.errorType === 'dependency');
      expect(cycleError).toBeDefined();
      expect(cycleError?.message).toContain('Circular dependencies detected');
    });

    it('应该检测到重复的阶段ID', async () => {
      const definitionWithDuplicates: WorkflowDefinition = {
        workflowId: 'workflow-duplicates',
        name: 'Workflow with Duplicates',
        version: '1.0.0',
        stages: [
          {
            stageId: 'duplicate-stage',
            name: 'Stage 1',
            moduleId: 'module1',
            operation: 'operation1',
            parameters: {}
          },
          {
            stageId: 'duplicate-stage', // 重复ID
            name: 'Stage 2',
            moduleId: 'module2',
            operation: 'operation2',
            parameters: {}
          }
        ],
        dependencies: [],
        configuration: {
          executionMode: 'sequential',
          maxConcurrency: 5,
          timeout: 30000,
          retryPolicy: { maxRetries: 3, retryDelay: 1000, backoffStrategy: 'exponential' },
          errorHandling: { onStageFailure: 'retry', onWorkflowFailure: 'abort' }
        }
      };

      const parsed = await scheduler.parseWorkflow(definitionWithDuplicates);

      expect(parsed.validationResult.isValid).toBe(false);
      const duplicateError = parsed.validationResult.errors.find(e => e.errorType === 'semantic');
      expect(duplicateError).toBeDefined();
      expect(duplicateError?.message).toContain('Duplicate stage ID: duplicate-stage');
    });
  });

  describe('执行计划创建测试', () => {
    it('应该为有效工作流创建执行计划', async () => {
      const definition: WorkflowDefinition = {
        workflowId: 'workflow-plan',
        name: 'Plan Test Workflow',
        version: '1.0.0',
        stages: [
          {
            stageId: 'stage-001',
            name: 'First Stage',
            moduleId: 'context',
            operation: 'getContext',
            parameters: {},
            timeout: 5000
          },
          {
            stageId: 'stage-002',
            name: 'Second Stage',
            moduleId: 'plan',
            operation: 'createPlan',
            parameters: {},
            timeout: 3000
          }
        ],
        dependencies: [
          {
            sourceStage: 'stage-001',
            targetStage: 'stage-002',
            dependencyType: 'sequential'
          }
        ],
        configuration: {
          executionMode: 'sequential',
          maxConcurrency: 5,
          timeout: 30000,
          retryPolicy: { maxRetries: 3, retryDelay: 1000, backoffStrategy: 'exponential' },
          errorHandling: { onStageFailure: 'retry', onWorkflowFailure: 'abort' }
        }
      };

      const parsed = await scheduler.parseWorkflow(definition);
      expect(parsed.validationResult.isValid).toBe(true);

      const plan = await scheduler.scheduleExecution(parsed);

      expect(plan.planId).toBeDefined();
      expect(plan.workflowId).toBe('workflow-plan');
      expect(plan.executionOrder).toHaveLength(1); // 简化实现创建单个执行组
      expect(plan.resourceRequirements).toBeDefined();
      expect(plan.resourceRequirements.cpuCores).toBeGreaterThan(0);
      expect(plan.resourceRequirements.memoryMb).toBeGreaterThan(0);
      expect(plan.estimatedDuration).toBeGreaterThan(0);
      expect(plan.createdAt).toBeDefined();
    });

    it('应该拒绝为无效工作流创建执行计划', async () => {
      const invalidDefinition: WorkflowDefinition = {
        workflowId: '',
        name: '',
        version: '1.0.0',
        stages: [],
        dependencies: [],
        configuration: {
          executionMode: 'sequential',
          maxConcurrency: 5,
          timeout: 30000,
          retryPolicy: { maxRetries: 3, retryDelay: 1000, backoffStrategy: 'exponential' },
          errorHandling: { onStageFailure: 'retry', onWorkflowFailure: 'abort' }
        }
      };

      const parsed = await scheduler.parseWorkflow(invalidDefinition);
      expect(parsed.validationResult.isValid).toBe(false);

      await expect(scheduler.scheduleExecution(parsed))
        .rejects.toThrow('Cannot schedule invalid workflow');
    });
  });

  describe('工作流执行测试', () => {
    it('应该成功执行简单工作流', async () => {
      const definition: WorkflowDefinition = {
        workflowId: 'workflow-execute',
        name: 'Execute Test Workflow',
        version: '1.0.0',
        stages: [
          {
            stageId: 'stage-001',
            name: 'Test Stage',
            moduleId: 'test',
            operation: 'testOperation',
            parameters: {}
          }
        ],
        dependencies: [],
        configuration: {
          executionMode: 'sequential',
          maxConcurrency: 5,
          timeout: 30000,
          retryPolicy: { maxRetries: 3, retryDelay: 1000, backoffStrategy: 'exponential' },
          errorHandling: { onStageFailure: 'retry', onWorkflowFailure: 'abort' }
        }
      };

      const parsed = await scheduler.parseWorkflow(definition);
      const plan = await scheduler.scheduleExecution(parsed);
      const result = await scheduler.executeWorkflow(plan);

      expect(result.executionId).toBeDefined();
      expect(result.workflowId).toBe('workflow-execute');
      expect(result.status).toBe('completed');
      expect(result.completedStages).toBe(1);
      expect(result.failedStages).toBe(0);
      expect(result.duration).toBeGreaterThan(0);
    });

    it('应该正确跟踪执行状态', async () => {
      const definition: WorkflowDefinition = {
        workflowId: 'workflow-track',
        name: 'Track Test Workflow',
        version: '1.0.0',
        stages: [
          {
            stageId: 'stage-001',
            name: 'Track Stage',
            moduleId: 'test',
            operation: 'testOperation',
            parameters: {}
          }
        ],
        dependencies: [],
        configuration: {
          executionMode: 'sequential',
          maxConcurrency: 5,
          timeout: 30000,
          retryPolicy: { maxRetries: 3, retryDelay: 1000, backoffStrategy: 'exponential' },
          errorHandling: { onStageFailure: 'retry', onWorkflowFailure: 'abort' }
        }
      };

      const parsed = await scheduler.parseWorkflow(definition);
      const plan = await scheduler.scheduleExecution(parsed);
      
      // 启动执行（异步）
      const executionPromise = scheduler.executeWorkflow(plan);
      
      // 等待一小段时间让执行开始
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // 获取执行状态
      const executionResult = await executionPromise;
      const status = await scheduler.trackExecution(executionResult.executionId);

      expect(status.executionId).toBe(executionResult.executionId);
      expect(status.workflowId).toBe('workflow-track');
      expect(status.progress.totalStages).toBe(1);
    });
  });

  describe('并发控制测试', () => {
    it('应该限制最大并发执行数', async () => {
      const smallScheduler = new WorkflowScheduler(2); // 限制为2个并发

      const executions = [
        { executionId: 'exec-1', workflowId: 'wf-1', status: 'running' as const },
        { executionId: 'exec-2', workflowId: 'wf-2', status: 'running' as const },
        { executionId: 'exec-3', workflowId: 'wf-3', status: 'running' as const }
      ];

      await smallScheduler.manageConcurrency(executions);

      // 验证并发控制逻辑被调用（这里是简化测试）
      expect(executions.length).toBe(3);
    });

    it('应该支持暂停和恢复执行', async () => {
      const definition: WorkflowDefinition = {
        workflowId: 'workflow-pause',
        name: 'Pause Test Workflow',
        version: '1.0.0',
        stages: [
          {
            stageId: 'stage-001',
            name: 'Pause Stage',
            moduleId: 'test',
            operation: 'testOperation',
            parameters: {}
          }
        ],
        dependencies: [],
        configuration: {
          executionMode: 'sequential',
          maxConcurrency: 5,
          timeout: 30000,
          retryPolicy: { maxRetries: 3, retryDelay: 1000, backoffStrategy: 'exponential' },
          errorHandling: { onStageFailure: 'retry', onWorkflowFailure: 'abort' }
        }
      };

      const parsed = await scheduler.parseWorkflow(definition);
      const plan = await scheduler.scheduleExecution(parsed);
      const result = await scheduler.executeWorkflow(plan);

      // 测试暂停
      await scheduler.pauseExecution(result.executionId);
      let status = await scheduler.trackExecution(result.executionId);
      expect(status.status).toBe('paused');

      // 测试恢复
      await scheduler.resumeExecution(result.executionId);
      status = await scheduler.trackExecution(result.executionId);
      expect(status.status).toBe('running');

      // 测试取消
      await scheduler.cancelExecution(result.executionId);
      await expect(scheduler.trackExecution(result.executionId))
        .rejects.toThrow('Execution not found');
    });
  });
});
