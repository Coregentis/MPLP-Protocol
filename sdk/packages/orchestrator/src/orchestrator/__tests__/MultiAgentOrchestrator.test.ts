/**
 * @fileoverview Tests for MultiAgentOrchestrator
 */

import { MultiAgentOrchestrator } from '../MultiAgentOrchestrator';
import { WorkflowBuilder } from '../../workflow/WorkflowBuilder';
import {
  IAgent,
  WorkflowDefinition,
  WorkflowStatus,
  OrchestratorError,
  AgentNotFoundError,
  WorkflowNotFoundError,
  WorkflowDefinitionError
} from '../../types';

// Mock agent for testing
const createMockAgent = (id: string, name: string = 'Test Agent'): IAgent => ({
  id,
  name,
  status: 'idle'
});

describe('MultiAgentOrchestrator测试', () => {
  let orchestrator: MultiAgentOrchestrator;

  beforeEach(() => {
    orchestrator = new MultiAgentOrchestrator();
  });

  describe('智能体管理', () => {
    it('应该注册智能体', async () => {
      const agent = createMockAgent('test-agent');
      
      await orchestrator.registerAgent(agent);
      
      const retrievedAgent = orchestrator.getAgent('test-agent');
      expect(retrievedAgent).toBe(agent);
    });

    it('应该拒绝重复注册智能体', async () => {
      const agent = createMockAgent('test-agent');
      
      await orchestrator.registerAgent(agent);
      
      await expect(orchestrator.registerAgent(agent))
        .rejects.toThrow(OrchestratorError);
    });

    it('应该拒绝无效的智能体', async () => {
      const invalidAgent = { id: '', name: 'Invalid' } as IAgent;
      
      await expect(orchestrator.registerAgent(invalidAgent))
        .rejects.toThrow(OrchestratorError);
    });

    it('应该注销智能体', async () => {
      const agent = createMockAgent('test-agent');
      
      await orchestrator.registerAgent(agent);
      await orchestrator.unregisterAgent('test-agent');
      
      const retrievedAgent = orchestrator.getAgent('test-agent');
      expect(retrievedAgent).toBeUndefined();
    });

    it('应该拒绝注销不存在的智能体', async () => {
      await expect(orchestrator.unregisterAgent('nonexistent'))
        .rejects.toThrow(AgentNotFoundError);
    });

    it('应该列出所有智能体', async () => {
      const agent1 = createMockAgent('agent1');
      const agent2 = createMockAgent('agent2');
      
      await orchestrator.registerAgent(agent1);
      await orchestrator.registerAgent(agent2);
      
      const agents = orchestrator.listAgents();
      expect(agents).toHaveLength(2);
      expect(agents).toContain(agent1);
      expect(agents).toContain(agent2);
    });
  });

  describe('工作流管理', () => {
    it('应该注册工作流', async () => {
      const workflow = new WorkflowBuilder('TestWorkflow')
        .step('step1', {
          name: 'Test Step',
          agentId: 'test-agent',
          action: 'test'
        })
        .build();
      
      await orchestrator.registerWorkflow(workflow);
      
      const retrievedWorkflow = orchestrator.getWorkflow(workflow.id);
      expect(retrievedWorkflow).toBe(workflow);
    });

    it('应该拒绝重复注册工作流', async () => {
      const workflow = new WorkflowBuilder('TestWorkflow')
        .step('step1', {
          name: 'Test Step',
          agentId: 'test-agent',
          action: 'test'
        })
        .build();
      
      await orchestrator.registerWorkflow(workflow);
      
      await expect(orchestrator.registerWorkflow(workflow))
        .rejects.toThrow(WorkflowDefinitionError);
    });

    it('应该拒绝无效的工作流', async () => {
      const invalidWorkflow = { id: '', name: 'Invalid' } as WorkflowDefinition;
      
      await expect(orchestrator.registerWorkflow(invalidWorkflow))
        .rejects.toThrow(WorkflowDefinitionError);
    });

    it('应该注销工作流', async () => {
      const workflow = new WorkflowBuilder('TestWorkflow')
        .step('step1', {
          name: 'Test Step',
          agentId: 'test-agent',
          action: 'test'
        })
        .build();
      
      await orchestrator.registerWorkflow(workflow);
      await orchestrator.unregisterWorkflow(workflow.id);
      
      const retrievedWorkflow = orchestrator.getWorkflow(workflow.id);
      expect(retrievedWorkflow).toBeUndefined();
    });

    it('应该拒绝注销不存在的工作流', async () => {
      await expect(orchestrator.unregisterWorkflow('nonexistent'))
        .rejects.toThrow(WorkflowNotFoundError);
    });

    it('应该列出所有工作流', async () => {
      const workflow1 = new WorkflowBuilder('Workflow1')
        .step('step1', {
          name: 'Test Step',
          agentId: 'test-agent',
          action: 'test'
        })
        .build();
      
      const workflow2 = new WorkflowBuilder('Workflow2')
        .step('step1', {
          name: 'Test Step',
          agentId: 'test-agent',
          action: 'test'
        })
        .build();
      
      await orchestrator.registerWorkflow(workflow1);
      await orchestrator.registerWorkflow(workflow2);
      
      const workflows = orchestrator.listWorkflows();
      expect(workflows).toHaveLength(2);
      expect(workflows).toContain(workflow1);
      expect(workflows).toContain(workflow2);
    });
  });

  describe('工作流执行', () => {
    it('应该拒绝执行不存在的工作流', async () => {
      await expect(orchestrator.executeWorkflow('nonexistent'))
        .rejects.toThrow(WorkflowNotFoundError);
    });

    it('应该拒绝执行缺少智能体的工作流', async () => {
      const workflow = new WorkflowBuilder('TestWorkflow')
        .step('step1', {
          name: 'Test Step',
          agentId: 'missing-agent',
          action: 'test'
        })
        .build();
      
      await orchestrator.registerWorkflow(workflow);
      
      await expect(orchestrator.executeWorkflow(workflow.id))
        .rejects.toThrow(AgentNotFoundError);
    });

    it('应该获取执行状态', () => {
      const status = orchestrator.getExecutionStatus('nonexistent');
      expect(status).toBeUndefined();
    });

    it('应该列出所有执行', () => {
      const executions = orchestrator.listExecutions();
      expect(executions).toEqual([]);
    });
  });

  describe('事件处理', () => {
    it('应该注册进度处理器', () => {
      const handler = jest.fn();
      
      orchestrator.onProgress(handler);
      
      // 验证处理器已注册（通过内部事件系统）
      expect(orchestrator.listenerCount('progress')).toBe(1);
    });

    it('应该注册错误处理器', () => {
      const handler = jest.fn();
      
      orchestrator.onError(handler);
      
      // 验证处理器已注册（通过内部事件系统）
      expect(orchestrator.listenerCount('error')).toBe(1);
    });
  });

  describe('静态工厂方法', () => {
    it('应该创建编排器实例', () => {
      const instance = MultiAgentOrchestrator.create();
      
      expect(instance).toBeInstanceOf(MultiAgentOrchestrator);
    });

    it('应该创建工作流构建器', () => {
      const builder = MultiAgentOrchestrator.createWorkflow('TestWorkflow');
      
      expect(builder).toBeInstanceOf(WorkflowBuilder);
    });
  });

  describe('工作流验证', () => {
    it('应该验证工作流步骤ID唯一性', async () => {
      const workflow: WorkflowDefinition = {
        id: 'test-workflow',
        name: 'Test Workflow',
        steps: [
          {
            id: 'duplicate',
            type: 'agent',
            name: 'Step 1',
            agentId: 'agent1',
            action: 'test'
          },
          {
            id: 'duplicate',
            type: 'agent',
            name: 'Step 2',
            agentId: 'agent2',
            action: 'test'
          }
        ]
      };
      
      await expect(orchestrator.registerWorkflow(workflow))
        .rejects.toThrow(WorkflowDefinitionError);
    });

    it('应该验证工作流依赖存在', async () => {
      const workflow: WorkflowDefinition = {
        id: 'test-workflow',
        name: 'Test Workflow',
        steps: [
          {
            id: 'step1',
            type: 'agent',
            name: 'Step 1',
            agentId: 'agent1',
            action: 'test',
            dependencies: ['nonexistent']
          }
        ]
      };
      
      await expect(orchestrator.registerWorkflow(workflow))
        .rejects.toThrow(WorkflowDefinitionError);
    });
  });

  describe('企业级功能测试', () => {
    describe('性能监控', () => {
      it('应该记录性能指标', () => {
        orchestrator.recordPerformanceMetric('test_metric', { value: 100, success: true });
        const metrics = orchestrator.getPerformanceMetrics();
        expect(metrics.test_metric).toHaveLength(1);
        expect(metrics.test_metric[0].value).toEqual({ value: 100, success: true });
      });

      it('应该限制性能指标数量', () => {
        // 添加超过100个指标
        for (let i = 0; i < 150; i++) {
          orchestrator.recordPerformanceMetric('test_metric', { value: i });
        }
        const metrics = orchestrator.getPerformanceMetrics();
        expect(metrics.test_metric).toHaveLength(100);
      });

      it('应该获取智能体性能统计', () => {
        // 记录一些智能体性能数据
        orchestrator.recordPerformanceMetric('agent_test-agent', { executionTime: 100, success: true });
        orchestrator.recordPerformanceMetric('agent_test-agent', { executionTime: 200, success: false });

        const stats = orchestrator.getAgentPerformanceStats('test-agent');
        expect(stats).toBeDefined();
        expect(stats.totalExecutions).toBe(2);
        expect(stats.averageExecutionTime).toBe(150);
        expect(stats.successRate).toBe(0.5);
      });

      it('应该返回null对于没有数据的智能体', () => {
        const stats = orchestrator.getAgentPerformanceStats('non-existent-agent');
        expect(stats).toBeNull();
      });
    });

    describe('负载均衡', () => {
      beforeEach(async () => {
        // 注册多个相同类型的智能体
        await orchestrator.registerAgent({
          id: 'agent1',
          type: 'worker',
          execute: jest.fn().mockResolvedValue({ success: true })
        } as any);

        await orchestrator.registerAgent({
          id: 'agent2',
          type: 'worker',
          execute: jest.fn().mockResolvedValue({ success: true })
        } as any);
      });

      it('应该返回最优智能体', () => {
        const agent1 = orchestrator.getOptimalAgent('worker');
        const agent2 = orchestrator.getOptimalAgent('worker');

        expect(['agent1', 'agent2']).toContain(agent1);
        expect(['agent1', 'agent2']).toContain(agent2);
      });

      it('应该返回null对于不存在的智能体类型', () => {
        const agent = orchestrator.getOptimalAgent('non-existent-type');
        expect(agent).toBeNull();
      });

      it('应该设置智能体权重', async () => {
        await orchestrator.registerAgent({
          id: 'weighted-agent',
          execute: jest.fn().mockResolvedValue({ success: true })
        } as any);

        expect(() => orchestrator.setAgentWeight('weighted-agent', 2.0)).not.toThrow();
        expect(() => orchestrator.setAgentWeight('non-existent', 1.0)).toThrow();
      });
    });

    describe('审计和安全', () => {
      it('应该记录审计事件', () => {
        orchestrator.recordAuditEvent('test_event', { data: 'test' });
        const auditLog = orchestrator.getAuditLog(10);

        expect(auditLog).toHaveLength(1);
        expect(auditLog[0].event).toBe('test_event');
        expect(auditLog[0].details.data).toBe('test');
      });

      it('应该限制审计日志大小', () => {
        // 添加超过1000个审计事件
        for (let i = 0; i < 1200; i++) {
          orchestrator.recordAuditEvent('test_event', { index: i });
        }

        const auditLog = orchestrator.getAuditLog(1200);
        expect(auditLog.length).toBeLessThanOrEqual(1000);
      });

      it('应该设置和验证安全策略', () => {
        orchestrator.setSecurityPolicy('test_policy', {
          allowedAgents: ['agent1', 'agent2']
        });

        expect(orchestrator.validateSecurityPolicy('test_policy', { agentId: 'agent1' })).toBe(true);
        expect(orchestrator.validateSecurityPolicy('test_policy', { agentId: 'agent3' })).toBe(false);
        expect(orchestrator.validateSecurityPolicy('non_existent_policy', { agentId: 'agent1' })).toBe(true);
      });
    });

    describe('工作流模板', () => {
      const sampleTemplate: any = {
        id: 'template1',
        name: 'Sample Template',
        steps: [
          {
            id: 'step1',
            type: 'agent',
            agentId: '{{agentId}}',
            config: {
              message: 'Hello {{name}}'
            }
          }
        ],
        metadata: {
          description: 'A sample template'
        }
      };

      it('应该注册工作流模板', () => {
        orchestrator.registerWorkflowTemplate('template1', sampleTemplate);
        const templates = orchestrator.listWorkflowTemplates();

        expect(templates).toHaveLength(1);
        expect(templates[0]?.id).toBe('template1');
        expect(templates[0]?.name).toBe('Sample Template');
      });

      it('应该从模板创建工作流', () => {
        orchestrator.registerWorkflowTemplate('template1', sampleTemplate);

        const workflow = orchestrator.createWorkflowFromTemplate('template1', 'workflow1', {
          agentId: 'test-agent',
          name: 'World'
        });

        expect(workflow.id).toBe('workflow1');
        expect((workflow.steps[0] as any)?.agentId).toBe('test-agent');
        expect((workflow.steps[0] as any)?.config?.message).toBe('Hello World');
        expect(workflow.metadata?.templateId).toBe('template1');
      });

      it('应该抛出错误对于不存在的模板', () => {
        expect(() => {
          orchestrator.createWorkflowFromTemplate('non-existent', 'workflow1');
        }).toThrow('Template not found: non-existent');
      });
    });

    describe('高级分析', () => {
      it('应该获取工作流分析数据', () => {
        const analytics = orchestrator.getWorkflowAnalytics();

        expect(analytics).toBeDefined();
        expect(analytics.totalExecutions).toBeDefined();
        expect(analytics.successRate).toBeDefined();
        expect(analytics.averageExecutionTime).toBeDefined();
        expect(analytics.failureReasons).toBeDefined();
      });

      it('应该获取系统健康状态', () => {
        const health = orchestrator.getSystemHealth();

        expect(health).toBeDefined();
        expect(health.status).toBeDefined();
        expect(health.agents).toBeDefined();
        expect(health.workflows).toBeDefined();
        expect(health.executions).toBeDefined();
        expect(health.performance).toBeDefined();
        expect(health.timestamp).toBeDefined();
      });
    });
  });
});
