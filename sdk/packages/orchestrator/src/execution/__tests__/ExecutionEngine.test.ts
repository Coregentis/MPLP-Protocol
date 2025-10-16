/**
 * @fileoverview Tests for ExecutionEngine
 */

import { ExecutionEngine } from '../ExecutionEngine';
import { WorkflowBuilder } from '../../workflow/WorkflowBuilder';
import {
  IAgent,
  WorkflowStatus,
  StepStatus,
  WorkflowExecutionError,
  StepExecutionError,
  AgentStepConfig
} from '../../types';

// Mock agent for testing with execution capabilities
const createMockAgent = (id: string, name: string = 'Test Agent'): IAgent & { sendMessage: (message: any) => Promise<void>; execute: (action: string, parameters: any) => Promise<any> } => ({
  id,
  name,
  status: 'idle',
  // MPLP V1.0 Alpha标准接口实现
  async sendMessage(message: any): Promise<void> {
    // Mock implementation for sendMessage
    return Promise.resolve();
  },
  async execute(action: string, parameters: any): Promise<any> {
    // Mock implementation for execute
    return Promise.resolve({
      action,
      parameters,
      result: 'success',
      timestamp: new Date().toISOString()
    });
  }
});

describe('ExecutionEngine测试', () => {
  let engine: ExecutionEngine;

  beforeEach(() => {
    engine = new ExecutionEngine();
  });

  describe('智能体管理', () => {
    it('应该注册智能体', () => {
      const agent = createMockAgent('test-agent');
      
      engine.registerAgent(agent);
      
      const retrievedAgent = engine.getAgent('test-agent');
      expect(retrievedAgent).toBe(agent);
    });

    it('应该注销智能体', () => {
      const agent = createMockAgent('test-agent');
      
      engine.registerAgent(agent);
      engine.unregisterAgent('test-agent');
      
      const retrievedAgent = engine.getAgent('test-agent');
      expect(retrievedAgent).toBeUndefined();
    });
  });

  describe('工作流执行', () => {
    it('应该执行简单的工作流', async () => {
      const agent = createMockAgent('test-agent');
      engine.registerAgent(agent);

      const workflow = new WorkflowBuilder('TestWorkflow')
        .step('step1', {
          name: 'Test Step',
          agentId: 'test-agent',
          action: 'test'
        })
        .build();

      const result = await engine.executeWorkflow(workflow);

      expect(result.status).toBe(WorkflowStatus.COMPLETED);
      expect(result.workflowId).toBe(workflow.id);
      expect(result.steps).toHaveLength(1);
      expect(result.steps[0]?.status).toBe(StepStatus.COMPLETED);
    });

    it('应该处理工作流执行错误', async () => {
      const workflow = new WorkflowBuilder('TestWorkflow')
        .step('step1', {
          name: 'Test Step',
          agentId: 'missing-agent',
          action: 'test'
        })
        .build();

      await expect(engine.executeWorkflow(workflow))
        .rejects.toThrow(StepExecutionError);
    });

    it('应该执行带有依赖的工作流', async () => {
      const agent1 = createMockAgent('agent1');
      const agent2 = createMockAgent('agent2');
      engine.registerAgent(agent1);
      engine.registerAgent(agent2);

      const workflow = new WorkflowBuilder('TestWorkflow')
        .step('step1', {
          name: 'First Step',
          agentId: 'agent1',
          action: 'test'
        })
        .step('step2', {
          name: 'Second Step',
          agentId: 'agent2',
          action: 'test',
          dependencies: ['step1']
        })
        .build();

      const result = await engine.executeWorkflow(workflow);

      expect(result.status).toBe(WorkflowStatus.COMPLETED);
      expect(result.steps).toHaveLength(2);
      expect(result.steps.every(step => step.status === StepStatus.COMPLETED)).toBe(true);
    });

    it('应该执行并行步骤', async () => {
      const agent1 = createMockAgent('agent1');
      const agent2 = createMockAgent('agent2');
      engine.registerAgent(agent1);
      engine.registerAgent(agent2);

      const workflow = new WorkflowBuilder('TestWorkflow')
        .parallel('parallel1', {
          name: 'Parallel Steps',
          steps: [
            {
              id: 'sub1',
              type: 'agent',
              name: 'Sub Step 1',
              agentId: 'agent1',
              action: 'test'
            } as AgentStepConfig,
            {
              id: 'sub2',
              type: 'agent',
              name: 'Sub Step 2',
              agentId: 'agent2',
              action: 'test'
            } as AgentStepConfig
          ]
        })
        .build();

      const result = await engine.executeWorkflow(workflow);

      expect(result.status).toBe(WorkflowStatus.COMPLETED);
      expect(result.steps.length).toBeGreaterThan(0);
      expect(result.steps.some(step => step.stepId === 'parallel1')).toBe(true);
    });

    it('应该执行顺序步骤', async () => {
      const agent1 = createMockAgent('agent1');
      const agent2 = createMockAgent('agent2');
      engine.registerAgent(agent1);
      engine.registerAgent(agent2);

      const workflow = new WorkflowBuilder('TestWorkflow')
        .sequential('seq1', {
          name: 'Sequential Steps',
          steps: [
            {
              id: 'sub1',
              type: 'agent',
              name: 'Sub Step 1',
              agentId: 'agent1',
              action: 'test'
            } as AgentStepConfig,
            {
              id: 'sub2',
              type: 'agent',
              name: 'Sub Step 2',
              agentId: 'agent2',
              action: 'test'
            } as AgentStepConfig
          ]
        })
        .build();

      const result = await engine.executeWorkflow(workflow);

      expect(result.status).toBe(WorkflowStatus.COMPLETED);
      expect(result.steps.length).toBeGreaterThan(0);
      expect(result.steps.some(step => step.stepId === 'seq1')).toBe(true);
    });

    it('应该执行条件步骤', async () => {
      const agent = createMockAgent('test-agent');
      engine.registerAgent(agent);

      const workflow = new WorkflowBuilder('TestWorkflow')
        .condition('cond1', {
          name: 'Conditional Step',
          condition: {
            predicate: async () => true,
            description: 'Always true'
          },
          thenStep: {
            id: 'then1',
            type: 'agent',
            name: 'Then Step',
            agentId: 'test-agent',
            action: 'test'
          } as AgentStepConfig
        })
        .build();

      const result = await engine.executeWorkflow(workflow);

      expect(result.status).toBe(WorkflowStatus.COMPLETED);
      expect(result.steps.length).toBeGreaterThan(0);
      expect(result.steps.some(step => step.stepId === 'cond1')).toBe(true);
    });

    it('应该执行循环步骤', async () => {
      const agent = createMockAgent('test-agent');
      engine.registerAgent(agent);

      let counter = 0;
      const workflow = new WorkflowBuilder('TestWorkflow')
        .loop('loop1', {
          name: 'Loop Step',
          condition: {
            predicate: async () => {
              counter++;
              return counter <= 2;
            },
            description: 'Loop twice'
          },
          body: {
            id: 'body1',
            type: 'agent',
            name: 'Loop Body',
            agentId: 'test-agent',
            action: 'test'
          } as AgentStepConfig,
          maxIterations: 5
        })
        .build();

      const result = await engine.executeWorkflow(workflow);

      expect(result.status).toBe(WorkflowStatus.COMPLETED);
      expect(result.steps.length).toBeGreaterThan(0);
      expect(result.steps.some(step => step.stepId === 'loop1')).toBe(true);
    });
  });

  describe('执行管理', () => {
    it('应该获取执行结果', async () => {
      const agent = createMockAgent('test-agent');
      engine.registerAgent(agent);

      const workflow = new WorkflowBuilder('TestWorkflow')
        .step('step1', {
          name: 'Test Step',
          agentId: 'test-agent',
          action: 'test'
        })
        .build();

      const result = await engine.executeWorkflow(workflow);
      const retrievedResult = engine.getExecution(result.executionId);

      expect(retrievedResult).toBe(result);
    });

    it('应该列出所有执行', async () => {
      const agent = createMockAgent('test-agent');
      engine.registerAgent(agent);

      const workflow = new WorkflowBuilder('TestWorkflow')
        .step('step1', {
          name: 'Test Step',
          agentId: 'test-agent',
          action: 'test'
        })
        .build();

      await engine.executeWorkflow(workflow);
      const executions = engine.listExecutions();

      expect(executions).toHaveLength(1);
    });

    it('应该返回undefined对于不存在的执行', () => {
      const result = engine.getExecution('nonexistent');
      expect(result).toBeUndefined();
    });
  });

  describe('事件发射', () => {
    it('应该发射工作流完成事件', async () => {
      const agent = createMockAgent('test-agent');
      engine.registerAgent(agent);

      const workflow = new WorkflowBuilder('TestWorkflow')
        .step('step1', {
          name: 'Test Step',
          agentId: 'test-agent',
          action: 'test'
        })
        .build();

      const completedHandler = jest.fn();
      engine.on('workflowCompleted', completedHandler);

      await engine.executeWorkflow(workflow);

      expect(completedHandler).toHaveBeenCalledTimes(1);
    });

    it('应该发射步骤完成事件', async () => {
      const agent = createMockAgent('test-agent');
      engine.registerAgent(agent);

      const workflow = new WorkflowBuilder('TestWorkflow')
        .step('step1', {
          name: 'Test Step',
          agentId: 'test-agent',
          action: 'test'
        })
        .build();

      const stepCompletedHandler = jest.fn();
      engine.on('stepCompleted', stepCompletedHandler);

      await engine.executeWorkflow(workflow);

      expect(stepCompletedHandler).toHaveBeenCalledTimes(1);
    });

    it('应该发射进度事件', async () => {
      const agent = createMockAgent('test-agent');
      engine.registerAgent(agent);

      const workflow = new WorkflowBuilder('TestWorkflow')
        .step('step1', {
          name: 'Test Step',
          agentId: 'test-agent',
          action: 'test'
        })
        .build();

      const progressHandler = jest.fn();
      engine.on('progress', progressHandler);

      await engine.executeWorkflow(workflow);

      expect(progressHandler).toHaveBeenCalled();
    });
  });
});
