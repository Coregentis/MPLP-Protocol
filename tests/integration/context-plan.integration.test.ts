import { Context } from '../../src/modules/context/domain/entities/context.entity';
import { Plan } from '../../src/modules/plan/domain/entities/plan.entity';
import { ContextStatus, PlanStatus } from '../../src/shared/types/common.types';

describe('Context-Plan Integration Tests', () => {
  describe('Context驱动Plan创建', () => {
    it('应该基于Context自动生成Plan', () => {
      // 创建Context
      const context = new Context({
        session_id: 'session-001',
        agent_id: 'agent-001',
        configuration: {
          max_agents: 5,
          timeout: 30000,
          retry_policy: {
            max_retries: 3,
            backoff_ms: 1000
          }
        },
        created_by: 'user-001'
      });

      // 基于Context创建Plan
      const plan = new Plan({
        context_id: context.context_id,
        name: `Plan for ${context.session_id}`,
        description: 'Auto-generated plan based on context',
        tasks: [
          {
            task_id: 'task-001',
            name: 'Initialize Context',
            description: 'Initialize the context environment',
            dependencies: [],
            estimated_duration: 5000,
            priority: 'high',
            status: 'pending',
            assigned_agents: ['agent-001'],
            created_by: 'user-001'
          }
        ],
        created_by: 'user-001'
      });

      // 验证Plan与Context的关联
      expect(plan.context_id).toBe(context.context_id);
      expect(plan.tasks).toHaveLength(1);
      expect(plan.tasks[0].assigned_agents).toContain('agent-001');
    });

    it('应该根据Context配置调整Plan参数', () => {
      // 创建具有特定配置的Context
      const context = new Context({
        session_id: 'session-002',
        agent_id: 'agent-002',
        configuration: {
          max_agents: 10,
          timeout: 60000,
          retry_policy: {
            max_retries: 5,
            backoff_ms: 2000
          }
        },
        created_by: 'user-001'
      });

      // 基于Context配置创建Plan
      const plan = new Plan({
        context_id: context.context_id,
        name: 'High-capacity Plan',
        description: 'Plan optimized for high agent capacity',
        tasks: [],
        execution_config: {
          max_parallel_tasks: context.configuration.max_agents,
          timeout: context.configuration.timeout,
          retry_policy: context.configuration.retry_policy
        },
        created_by: 'user-001'
      });

      // 验证Plan配置与Context一致
      expect(plan.execution_config?.max_parallel_tasks).toBe(10);
      expect(plan.execution_config?.timeout).toBe(60000);
      expect(plan.execution_config?.retry_policy?.max_retries).toBe(5);
    });
  });

  describe('Plan状态同步到Context', () => {
    let context: Context;
    let plan: Plan;

    beforeEach(() => {
      context = new Context({
        session_id: 'session-003',
        agent_id: 'agent-003',
        configuration: {
          max_agents: 3,
          timeout: 15000,
          retry_policy: {
            max_retries: 2,
            backoff_ms: 500
          }
        },
        created_by: 'user-001'
      });

      plan = new Plan({
        context_id: context.context_id,
        name: 'Sync Test Plan',
        description: 'Plan for testing status synchronization',
        tasks: [
          {
            task_id: 'task-001',
            name: 'Test Task',
            description: 'A test task',
            dependencies: [],
            estimated_duration: 1000,
            priority: 'medium',
            status: 'pending',
            assigned_agents: ['agent-003'],
            created_by: 'user-001'
          }
        ],
        created_by: 'user-001'
      });
    });

    it('应该在Plan启动时更新Context状态', () => {
      // 启动Context
      context.start();
      expect(context.status).toBe('active');

      // 启动Plan
      plan.start();
      expect(plan.status).toBe('active');

      // 验证两者状态一致
      expect(context.status).toBe('active');
      expect(plan.status).toBe('active');
    });

    it('应该在Plan完成时更新Context进度', () => {
      // 启动Context和Plan
      context.start();
      plan.start();

      // 完成Plan中的任务
      plan.updateTaskStatus('task-001', 'completed');
      
      // 验证Plan进度
      const progress = plan.getProgress();
      expect(progress.completed_tasks).toBe(1);
      expect(progress.total_tasks).toBe(1);
      expect(progress.completion_percentage).toBe(100);

      // 完成Plan
      plan.complete();
      expect(plan.status).toBe('completed');
    });

    it('应该处理Plan失败对Context的影响', () => {
      // 启动Context和Plan
      context.start();
      plan.start();

      // Plan执行失败
      const failureReason = 'Task execution failed';
      plan.fail(failureReason);

      // 验证Plan状态
      expect(plan.status).toBe('failed');
      expect(plan.metadata?.failure_reason).toBe(failureReason);

      // Context应该能够处理Plan失败
      // 这里可以添加Context对Plan失败的响应逻辑
    });
  });

  describe('Context-Plan资源共享', () => {
    it('应该在Plan中使用Context的Agent资源', () => {
      // 创建包含多个Agent的Context
      const context = new Context({
        session_id: 'session-004',
        agent_id: 'agent-004',
        configuration: {
          max_agents: 5,
          timeout: 30000,
          retry_policy: {
            max_retries: 3,
            backoff_ms: 1000
          }
        },
        created_by: 'user-001'
      });

      // 模拟Context中的可用Agent
      const availableAgents = ['agent-004', 'agent-005', 'agent-006'];

      // 创建使用Context Agent资源的Plan
      const plan = new Plan({
        context_id: context.context_id,
        name: 'Multi-Agent Plan',
        description: 'Plan utilizing multiple agents from context',
        tasks: [
          {
            task_id: 'task-001',
            name: 'Parallel Task 1',
            description: 'First parallel task',
            dependencies: [],
            estimated_duration: 3000,
            priority: 'high',
            status: 'pending',
            assigned_agents: [availableAgents[0]],
            created_by: 'user-001'
          },
          {
            task_id: 'task-002',
            name: 'Parallel Task 2',
            description: 'Second parallel task',
            dependencies: [],
            estimated_duration: 3000,
            priority: 'high',
            status: 'pending',
            assigned_agents: [availableAgents[1]],
            created_by: 'user-001'
          }
        ],
        created_by: 'user-001'
      });

      // 验证Plan使用了Context的Agent资源
      expect(plan.tasks[0].assigned_agents[0]).toBe(availableAgents[0]);
      expect(plan.tasks[1].assigned_agents[0]).toBe(availableAgents[1]);
      
      // 验证不超过Context的Agent限制
      const totalAssignedAgents = new Set(
        plan.tasks.flatMap(task => task.assigned_agents)
      ).size;
      expect(totalAssignedAgents).toBeLessThanOrEqual(context.configuration.max_agents);
    });

    it('应该在Context资源不足时调整Plan', () => {
      // 创建资源受限的Context
      const context = new Context({
        session_id: 'session-005',
        agent_id: 'agent-007',
        configuration: {
          max_agents: 2, // 限制为2个Agent
          timeout: 15000,
          retry_policy: {
            max_retries: 1,
            backoff_ms: 500
          }
        },
        created_by: 'user-001'
      });

      // 尝试创建需要更多Agent的Plan
      const plan = new Plan({
        context_id: context.context_id,
        name: 'Resource-Limited Plan',
        description: 'Plan that must adapt to resource constraints',
        tasks: [
          {
            task_id: 'task-001',
            name: 'Sequential Task 1',
            description: 'First task in sequence',
            dependencies: [],
            estimated_duration: 2000,
            priority: 'high',
            status: 'pending',
            assigned_agents: ['agent-007'],
            created_by: 'user-001'
          },
          {
            task_id: 'task-002',
            name: 'Sequential Task 2',
            description: 'Second task in sequence',
            dependencies: ['task-001'], // 依赖第一个任务
            estimated_duration: 2000,
            priority: 'medium',
            status: 'pending',
            assigned_agents: ['agent-008'],
            created_by: 'user-001'
          }
        ],
        created_by: 'user-001'
      });

      // 验证Plan适应了资源限制
      expect(plan.tasks).toHaveLength(2);
      
      // 验证任务有正确的依赖关系（串行执行以适应资源限制）
      expect(plan.tasks[1].dependencies).toContain('task-001');
      
      // 验证总Agent数不超过限制
      const uniqueAgents = new Set(
        plan.tasks.flatMap(task => task.assigned_agents)
      );
      expect(uniqueAgents.size).toBeLessThanOrEqual(context.configuration.max_agents);
    });
  });

  describe('Context-Plan生命周期协调', () => {
    it('应该协调Context和Plan的生命周期', async () => {
      const context = new Context({
        session_id: 'session-006',
        agent_id: 'agent-009',
        configuration: {
          max_agents: 3,
          timeout: 10000,
          retry_policy: {
            max_retries: 2,
            backoff_ms: 1000
          }
        },
        created_by: 'user-001'
      });

      const plan = new Plan({
        context_id: context.context_id,
        name: 'Lifecycle Test Plan',
        description: 'Plan for testing lifecycle coordination',
        tasks: [
          {
            task_id: 'task-001',
            name: 'Lifecycle Task',
            description: 'Task for lifecycle testing',
            dependencies: [],
            estimated_duration: 1000,
            priority: 'high',
            status: 'pending',
            assigned_agents: ['agent-009'],
            created_by: 'user-001'
          }
        ],
        created_by: 'user-001'
      });

      // 测试启动顺序：Context先启动
      context.start();
      expect(context.status).toBe('active');

      // 然后启动Plan
      plan.start();
      expect(plan.status).toBe('active');

      // 测试暂停协调
      context.pause();
      expect(context.status).toBe('inactive');
      
      // Plan也应该能够暂停
      plan.pause();
      expect(plan.status).toBe('inactive');

      // 测试恢复协调
      context.resume();
      expect(context.status).toBe('active');
      
      plan.resume();
      expect(plan.status).toBe('active');

      // 测试完成协调
      plan.updateTaskStatus('task-001', 'completed');
      plan.complete();
      expect(plan.status).toBe('completed');

      // Context可以在Plan完成后完成
      context.complete();
      expect(context.status).toBe('completed');
    });
  });
});
