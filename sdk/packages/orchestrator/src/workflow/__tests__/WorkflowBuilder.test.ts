/**
 * @fileoverview Tests for WorkflowBuilder
 */

import { WorkflowBuilder } from '../WorkflowBuilder';
import { 
  WorkflowDefinitionError, 
  StepPriority,
  AgentStepConfig,
  ParallelStepConfig,
  SequentialStepConfig,
  ConditionalStepConfig,
  LoopStepConfig
} from '../../types';

describe('WorkflowBuilder测试', () => {
  describe('基础构建功能', () => {
    it('应该创建基本的工作流', () => {
      const workflow = new WorkflowBuilder('TestWorkflow')
        .description('Test workflow description')
        .version('1.0.0')
        .step('test-step', {
          name: 'Test Step',
          agentId: 'test-agent',
          action: 'test'
        })
        .build();

      expect(workflow.name).toBe('TestWorkflow');
      expect(workflow.description).toBe('Test workflow description');
      expect(workflow.version).toBe('1.0.0');
      expect(workflow.id).toBeDefined();
      expect(workflow.steps).toHaveLength(1);
    });

    it('应该支持自定义工作流ID', () => {
      const customId = 'custom-workflow-id';
      const workflow = new WorkflowBuilder('TestWorkflow', customId)
        .step('test-step', {
          name: 'Test Step',
          agentId: 'test-agent',
          action: 'test'
        })
        .build();

      expect(workflow.id).toBe(customId);
    });

    it('应该支持静态创建方法', () => {
      const workflow = WorkflowBuilder.create('TestWorkflow')
        .step('test-step', {
          name: 'Test Step',
          agentId: 'test-agent',
          action: 'test'
        })
        .build();

      expect(workflow.name).toBe('TestWorkflow');
      expect(workflow.id).toBeDefined();
    });

    it('应该支持链式调用', () => {
      const builder = new WorkflowBuilder('TestWorkflow');
      const result = builder
        .description('Test')
        .version('1.0.0')
        .timeout(5000)
        .retries(3);

      expect(result).toBe(builder);
    });
  });

  describe('智能体步骤', () => {
    it('应该添加智能体步骤', () => {
      const workflow = new WorkflowBuilder('TestWorkflow')
        .step('step1', {
          name: 'Test Agent Step',
          agentId: 'test-agent',
          action: 'process',
          parameters: { key: 'value' }
        })
        .build();

      expect(workflow.steps).toHaveLength(1);
      
      const step = workflow.steps[0] as AgentStepConfig;
      expect(step.type).toBe('agent');
      expect(step.id).toBe('step1');
      expect(step.name).toBe('Test Agent Step');
      expect(step.agentId).toBe('test-agent');
      expect(step.action).toBe('process');
      expect(step.parameters).toEqual({ key: 'value' });
    });

    it('应该验证智能体步骤配置', () => {
      expect(() => {
        new WorkflowBuilder('TestWorkflow')
          .step('step1', {
            name: 'Test Step',
            agentId: '',
            action: 'process'
          } as any);
      }).toThrow(WorkflowDefinitionError);

      expect(() => {
        new WorkflowBuilder('TestWorkflow')
          .step('step1', {
            name: 'Test Step',
            agentId: 'test-agent',
            action: ''
          } as any);
      }).toThrow(WorkflowDefinitionError);
    });

    it('应该支持步骤优先级和依赖', () => {
      const workflow = new WorkflowBuilder('TestWorkflow')
        .step('step1', {
          name: 'First Step',
          agentId: 'agent1',
          action: 'process',
          priority: StepPriority.HIGH,
          dependencies: [],
          timeout: 5000,
          retries: 2
        })
        .step('step2', {
          name: 'Second Step',
          agentId: 'agent2',
          action: 'process',
          dependencies: ['step1']
        })
        .build();

      const step1 = workflow.steps[0] as AgentStepConfig;
      const step2 = workflow.steps[1] as AgentStepConfig;

      expect(step1.priority).toBe(StepPriority.HIGH);
      expect(step1.timeout).toBe(5000);
      expect(step1.retries).toBe(2);
      expect(step2.dependencies).toEqual(['step1']);
    });
  });

  describe('并行步骤', () => {
    it('应该添加并行步骤', () => {
      const workflow = new WorkflowBuilder('TestWorkflow')
        .parallel('parallel1', {
          name: 'Parallel Execution',
          steps: [
            {
              id: 'sub1',
              type: 'agent',
              name: 'Sub Step 1',
              agentId: 'agent1',
              action: 'process'
            } as AgentStepConfig,
            {
              id: 'sub2',
              type: 'agent',
              name: 'Sub Step 2',
              agentId: 'agent2',
              action: 'process'
            } as AgentStepConfig
          ],
          concurrency: 2,
          failFast: true
        })
        .build();

      const step = workflow.steps[0] as ParallelStepConfig;
      expect(step.type).toBe('parallel');
      expect(step.steps).toHaveLength(2);
      expect(step.concurrency).toBe(2);
      expect(step.failFast).toBe(true);
    });

    it('应该验证并行步骤配置', () => {
      expect(() => {
        new WorkflowBuilder('TestWorkflow')
          .parallel('parallel1', {
            name: 'Empty Parallel',
            steps: []
          } as any);
      }).toThrow(WorkflowDefinitionError);

      expect(() => {
        new WorkflowBuilder('TestWorkflow')
          .parallel('parallel1', {
            name: 'Invalid Concurrency',
            steps: [
              {
                id: 'sub1',
                type: 'agent',
                name: 'Sub Step',
                agentId: 'agent1',
                action: 'process'
              }
            ],
            concurrency: 0
          } as any);
      }).toThrow(WorkflowDefinitionError);
    });
  });

  describe('顺序步骤', () => {
    it('应该添加顺序步骤', () => {
      const workflow = new WorkflowBuilder('TestWorkflow')
        .sequential('seq1', {
          name: 'Sequential Execution',
          steps: [
            {
              id: 'sub1',
              type: 'agent',
              name: 'First Sub Step',
              agentId: 'agent1',
              action: 'process'
            } as AgentStepConfig,
            {
              id: 'sub2',
              type: 'agent',
              name: 'Second Sub Step',
              agentId: 'agent2',
              action: 'process'
            } as AgentStepConfig
          ]
        })
        .build();

      const step = workflow.steps[0] as SequentialStepConfig;
      expect(step.type).toBe('sequential');
      expect(step.steps).toHaveLength(2);
    });

    it('应该验证顺序步骤配置', () => {
      expect(() => {
        new WorkflowBuilder('TestWorkflow')
          .sequential('seq1', {
            name: 'Empty Sequential',
            steps: []
          } as any);
      }).toThrow(WorkflowDefinitionError);
    });
  });

  describe('条件步骤', () => {
    it('应该添加条件步骤', () => {
      const condition = {
        predicate: jest.fn().mockResolvedValue(true),
        description: 'Test condition'
      };

      const thenStep: AgentStepConfig = {
        id: 'then1',
        type: 'agent',
        name: 'Then Step',
        agentId: 'agent1',
        action: 'process'
      };

      const elseStep: AgentStepConfig = {
        id: 'else1',
        type: 'agent',
        name: 'Else Step',
        agentId: 'agent2',
        action: 'process'
      };

      const workflow = new WorkflowBuilder('TestWorkflow')
        .condition('cond1', {
          name: 'Conditional Step',
          condition,
          thenStep,
          elseStep
        })
        .build();

      const step = workflow.steps[0] as ConditionalStepConfig;
      expect(step.type).toBe('conditional');
      expect(step.condition).toBe(condition);
      expect(step.thenStep).toBe(thenStep);
      expect(step.elseStep).toBe(elseStep);
    });

    it('应该验证条件步骤配置', () => {
      expect(() => {
        new WorkflowBuilder('TestWorkflow')
          .condition('cond1', {
            name: 'Invalid Condition',
            condition: null as any,
            thenStep: {
              id: 'then1',
              type: 'agent',
              name: 'Then Step',
              agentId: 'agent1',
              action: 'process'
            } as AgentStepConfig
          });
      }).toThrow(WorkflowDefinitionError);

      expect(() => {
        new WorkflowBuilder('TestWorkflow')
          .condition('cond1', {
            name: 'Missing Then Step',
            condition: {
              predicate: jest.fn(),
              description: 'Test'
            },
            thenStep: null as any
          });
      }).toThrow(WorkflowDefinitionError);
    });
  });

  describe('循环步骤', () => {
    it('应该添加循环步骤', () => {
      const condition = {
        predicate: jest.fn().mockResolvedValue(true),
        description: 'Loop condition'
      };

      const body: AgentStepConfig = {
        id: 'body1',
        type: 'agent',
        name: 'Loop Body',
        agentId: 'agent1',
        action: 'process'
      };

      const workflow = new WorkflowBuilder('TestWorkflow')
        .loop('loop1', {
          name: 'Loop Step',
          condition,
          body,
          maxIterations: 10
        })
        .build();

      const step = workflow.steps[0] as LoopStepConfig;
      expect(step.type).toBe('loop');
      expect(step.condition).toBe(condition);
      expect(step.body).toBe(body);
      expect(step.maxIterations).toBe(10);
    });

    it('应该验证循环步骤配置', () => {
      expect(() => {
        new WorkflowBuilder('TestWorkflow')
          .loop('loop1', {
            name: 'Invalid Loop',
            condition: null as any,
            body: {
              id: 'body1',
              type: 'agent',
              name: 'Body',
              agentId: 'agent1',
              action: 'process'
            } as AgentStepConfig
          });
      }).toThrow(WorkflowDefinitionError);

      expect(() => {
        new WorkflowBuilder('TestWorkflow')
          .loop('loop1', {
            name: 'Invalid Max Iterations',
            condition: {
              predicate: jest.fn(),
              description: 'Test'
            },
            body: {
              id: 'body1',
              type: 'agent',
              name: 'Body',
              agentId: 'agent1',
              action: 'process'
            } as AgentStepConfig,
            maxIterations: 0
          });
      }).toThrow(WorkflowDefinitionError);
    });
  });

  describe('工作流配置', () => {
    it('应该设置超时时间', () => {
      const workflow = new WorkflowBuilder('TestWorkflow')
        .timeout(10000)
        .step('test-step', {
          name: 'Test Step',
          agentId: 'test-agent',
          action: 'test'
        })
        .build();

      expect(workflow.timeout).toBe(10000);
    });

    it('应该设置重试次数', () => {
      const workflow = new WorkflowBuilder('TestWorkflow')
        .retries(5)
        .step('test-step', {
          name: 'Test Step',
          agentId: 'test-agent',
          action: 'test'
        })
        .build();

      expect(workflow.retries).toBe(5);
    });

    it('应该设置元数据', () => {
      const metadata = { author: 'test', version: '1.0' };
      const workflow = new WorkflowBuilder('TestWorkflow')
        .metadata(metadata)
        .step('test-step', {
          name: 'Test Step',
          agentId: 'test-agent',
          action: 'test'
        })
        .build();

      expect(workflow.metadata).toEqual(metadata);
    });

    it('应该合并元数据', () => {
      const workflow = new WorkflowBuilder('TestWorkflow')
        .metadata({ key1: 'value1' })
        .metadata({ key2: 'value2' })
        .step('test-step', {
          name: 'Test Step',
          agentId: 'test-agent',
          action: 'test'
        })
        .build();

      expect(workflow.metadata).toEqual({
        key1: 'value1',
        key2: 'value2'
      });
    });
  });

  describe('验证', () => {
    it('应该拒绝重复的步骤ID', () => {
      expect(() => {
        new WorkflowBuilder('TestWorkflow')
          .step('step1', {
            name: 'First Step',
            agentId: 'agent1',
            action: 'process'
          })
          .step('step1', {
            name: 'Duplicate Step',
            agentId: 'agent2',
            action: 'process'
          });
      }).toThrow(WorkflowDefinitionError);
    });

    it('应该拒绝无效的步骤ID', () => {
      expect(() => {
        new WorkflowBuilder('TestWorkflow')
          .step('', {
            name: 'Invalid ID Step',
            agentId: 'agent1',
            action: 'process'
          });
      }).toThrow(WorkflowDefinitionError);
    });

    it('应该拒绝无效的超时时间', () => {
      expect(() => {
        new WorkflowBuilder('TestWorkflow').timeout(0);
      }).toThrow(WorkflowDefinitionError);

      expect(() => {
        new WorkflowBuilder('TestWorkflow').timeout(-1000);
      }).toThrow(WorkflowDefinitionError);
    });

    it('应该拒绝无效的重试次数', () => {
      expect(() => {
        new WorkflowBuilder('TestWorkflow').retries(-1);
      }).toThrow(WorkflowDefinitionError);
    });

    it('应该验证步骤依赖存在', () => {
      expect(() => {
        new WorkflowBuilder('TestWorkflow')
          .step('step1', {
            name: 'Step with Invalid Dependency',
            agentId: 'agent1',
            action: 'process',
            dependencies: ['nonexistent-step']
          })
          .build();
      }).toThrow(WorkflowDefinitionError);
    });

    it('应该检测循环依赖', () => {
      expect(() => {
        new WorkflowBuilder('TestWorkflow')
          .step('step1', {
            name: 'Step 1',
            agentId: 'agent1',
            action: 'process',
            dependencies: ['step2']
          })
          .step('step2', {
            name: 'Step 2',
            agentId: 'agent2',
            action: 'process',
            dependencies: ['step1']
          })
          .build();
      }).toThrow(WorkflowDefinitionError);
    });

    it('应该拒绝空的工作流', () => {
      expect(() => {
        new WorkflowBuilder('TestWorkflow').build();
      }).toThrow(WorkflowDefinitionError);
    });

    it('应该拒绝无效的工作流名称', () => {
      expect(() => {
        new WorkflowBuilder('').build();
      }).toThrow(WorkflowDefinitionError);
    });
  });

  describe('复杂工作流', () => {
    it('应该构建复杂的多步骤工作流', () => {
      const workflow = new WorkflowBuilder('ComplexWorkflow')
        .description('A complex multi-step workflow')
        .version('2.0.0')
        .timeout(30000)
        .retries(3)
        .metadata({ complexity: 'high', category: 'test' })
        .step('init', {
          name: 'Initialize',
          agentId: 'init-agent',
          action: 'initialize',
          priority: StepPriority.HIGH
        })
        .parallel('process', {
          name: 'Parallel Processing',
          dependencies: ['init'],
          steps: [
            {
              id: 'process1',
              type: 'agent',
              name: 'Process 1',
              agentId: 'processor1',
              action: 'process'
            } as AgentStepConfig,
            {
              id: 'process2',
              type: 'agent',
              name: 'Process 2',
              agentId: 'processor2',
              action: 'process'
            } as AgentStepConfig
          ],
          concurrency: 2,
          failFast: false
        })
        .condition('check', {
          name: 'Quality Check',
          dependencies: ['process'],
          condition: {
            predicate: async (context) => {
              return context.variables.get('quality_score') as number > 0.8;
            },
            description: 'Check if quality score is above threshold'
          },
          thenStep: {
            id: 'approve',
            type: 'agent',
            name: 'Approve',
            agentId: 'approver',
            action: 'approve'
          } as AgentStepConfig,
          elseStep: {
            id: 'reject',
            type: 'agent',
            name: 'Reject',
            agentId: 'approver',
            action: 'reject'
          } as AgentStepConfig
        })
        .step('finalize', {
          name: 'Finalize',
          agentId: 'finalizer',
          action: 'finalize',
          dependencies: ['check']
        })
        .build();

      expect(workflow.steps).toHaveLength(4);
      expect(workflow.name).toBe('ComplexWorkflow');
      expect(workflow.timeout).toBe(30000);
      expect(workflow.retries).toBe(3);
      
      // Verify step types and dependencies
      expect(workflow.steps[0]?.type).toBe('agent');
      expect(workflow.steps[1]?.type).toBe('parallel');
      expect(workflow.steps[2]?.type).toBe('conditional');
      expect(workflow.steps[3]?.type).toBe('agent');

      expect(workflow.steps[1]?.dependencies).toEqual(['init']);
      expect(workflow.steps[2]?.dependencies).toEqual(['process']);
      expect(workflow.steps[3]?.dependencies).toEqual(['check']);
    });
  });
});
