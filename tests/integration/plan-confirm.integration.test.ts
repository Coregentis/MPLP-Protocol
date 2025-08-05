import { Plan } from '../../src/modules/plan/domain/entities/plan.entity';
import { Confirm } from '../../src/modules/confirm/domain/entities/confirm.entity';
import { PlanStatus, ConfirmStatus } from '../../src/shared/types/common.types';

describe('Plan-Confirm Integration Tests', () => {
  describe('Plan执行前确认流程', () => {
    it('应该在Plan启动前要求确认', () => {
      // 创建需要确认的Plan
      const plan = new Plan({
        context_id: 'context-001',
        name: 'Critical Plan',
        description: 'A plan that requires confirmation before execution',
        tasks: [
          {
            task_id: 'task-001',
            name: 'Critical Task',
            description: 'A critical task requiring approval',
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

      // 创建对应的确认请求
      const confirm = new Confirm({
        context_id: plan.context_id,
        plan_id: plan.plan_id,
        request_type: 'plan_execution',
        title: `Confirm execution of ${plan.name}`,
        description: `Please confirm the execution of plan: ${plan.description}`,
        required_approvals: 1,
        approval_criteria: {
          minimum_approvers: 1,
          required_roles: ['admin'],
          unanimous_required: false
        },
        timeout_ms: 300000, // 5分钟超时
        created_by: 'user-001'
      });

      // 验证确认请求与Plan的关联
      expect(confirm.plan_id).toBe(plan.plan_id);
      expect(confirm.context_id).toBe(plan.context_id);
      expect(confirm.request_type).toBe('plan_execution');
      expect(confirm.status).toBe('pending');
    });

    it('应该在确认批准后允许Plan执行', () => {
      const plan = new Plan({
        context_id: 'context-002',
        name: 'Approved Plan',
        description: 'Plan awaiting approval',
        tasks: [
          {
            task_id: 'task-001',
            name: 'Approved Task',
            description: 'Task that will be approved',
            dependencies: [],
            estimated_duration: 3000,
            priority: 'medium',
            status: 'pending',
            assigned_agents: ['agent-002'],
            created_by: 'user-001'
          }
        ],
        created_by: 'user-001'
      });

      const confirm = new Confirm({
        context_id: plan.context_id,
        plan_id: plan.plan_id,
        request_type: 'plan_execution',
        title: 'Plan Execution Approval',
        description: 'Requesting approval for plan execution',
        required_approvals: 1,
        approval_criteria: {
          minimum_approvers: 1,
          required_roles: ['admin'],
          unanimous_required: false
        },
        timeout_ms: 300000,
        created_by: 'user-001'
      });

      // 提交确认请求
      confirm.submit();
      expect(confirm.status).toBe('submitted');

      // 添加审批者并批准
      confirm.addApprover({
        user_id: 'admin-001',
        role: 'admin',
        permissions: ['approve', 'reject']
      });

      confirm.approve('admin-001', 'Plan looks good to execute');
      expect(confirm.status).toBe('approved');

      // 确认批准后，Plan可以启动
      plan.start();
      expect(plan.status).toBe('active');
    });

    it('应该在确认拒绝后阻止Plan执行', () => {
      const plan = new Plan({
        context_id: 'context-003',
        name: 'Rejected Plan',
        description: 'Plan that will be rejected',
        tasks: [
          {
            task_id: 'task-001',
            name: 'Rejected Task',
            description: 'Task that will be rejected',
            dependencies: [],
            estimated_duration: 2000,
            priority: 'low',
            status: 'pending',
            assigned_agents: ['agent-003'],
            created_by: 'user-001'
          }
        ],
        created_by: 'user-001'
      });

      const confirm = new Confirm({
        context_id: plan.context_id,
        plan_id: plan.plan_id,
        request_type: 'plan_execution',
        title: 'Plan Execution Approval',
        description: 'Requesting approval for plan execution',
        required_approvals: 1,
        approval_criteria: {
          minimum_approvers: 1,
          required_roles: ['admin'],
          unanimous_required: false
        },
        timeout_ms: 300000,
        created_by: 'user-001'
      });

      // 提交并拒绝确认请求
      confirm.submit();
      confirm.addApprover({
        user_id: 'admin-002',
        role: 'admin',
        permissions: ['approve', 'reject']
      });

      confirm.reject('admin-002', 'Plan needs more review');
      expect(confirm.status).toBe('rejected');

      // 确认被拒绝后，Plan不应该能够启动
      expect(() => plan.start()).toThrow();
    });
  });

  describe('任务级确认流程', () => {
    it('应该为关键任务创建单独的确认', () => {
      const plan = new Plan({
        context_id: 'context-004',
        name: 'Multi-Task Plan',
        description: 'Plan with multiple tasks requiring different approval levels',
        tasks: [
          {
            task_id: 'task-001',
            name: 'Regular Task',
            description: 'A regular task',
            dependencies: [],
            estimated_duration: 1000,
            priority: 'low',
            status: 'pending',
            assigned_agents: ['agent-004'],
            created_by: 'user-001'
          },
          {
            task_id: 'task-002',
            name: 'Critical Task',
            description: 'A critical task requiring approval',
            dependencies: ['task-001'],
            estimated_duration: 5000,
            priority: 'critical',
            status: 'pending',
            assigned_agents: ['agent-004'],
            created_by: 'user-001'
          }
        ],
        created_by: 'user-001'
      });

      // 为关键任务创建确认
      const taskConfirm = new Confirm({
        context_id: plan.context_id,
        plan_id: plan.plan_id,
        task_id: 'task-002',
        request_type: 'task_execution',
        title: 'Critical Task Approval',
        description: 'Approval required for critical task execution',
        required_approvals: 2, // 需要2个批准
        approval_criteria: {
          minimum_approvers: 2,
          required_roles: ['admin', 'supervisor'],
          unanimous_required: true
        },
        timeout_ms: 600000, // 10分钟超时
        created_by: 'user-001'
      });

      // 验证任务级确认
      expect(taskConfirm.task_id).toBe('task-002');
      expect(taskConfirm.request_type).toBe('task_execution');
      expect(taskConfirm.required_approvals).toBe(2);
      expect(taskConfirm.approval_criteria.unanimous_required).toBe(true);
    });

    it('应该在任务确认批准后允许任务执行', () => {
      const plan = new Plan({
        context_id: 'context-005',
        name: 'Task Approval Plan',
        description: 'Plan for testing task-level approval',
        tasks: [
          {
            task_id: 'task-001',
            name: 'Approved Task',
            description: 'Task requiring approval',
            dependencies: [],
            estimated_duration: 3000,
            priority: 'high',
            status: 'pending',
            assigned_agents: ['agent-005'],
            created_by: 'user-001'
          }
        ],
        created_by: 'user-001'
      });

      const taskConfirm = new Confirm({
        context_id: plan.context_id,
        plan_id: plan.plan_id,
        task_id: 'task-001',
        request_type: 'task_execution',
        title: 'Task Execution Approval',
        description: 'Approval for task execution',
        required_approvals: 1,
        approval_criteria: {
          minimum_approvers: 1,
          required_roles: ['supervisor'],
          unanimous_required: false
        },
        timeout_ms: 300000,
        created_by: 'user-001'
      });

      // 启动Plan（但任务需要单独确认）
      plan.start();
      expect(plan.status).toBe('active');

      // 任务应该仍然是pending状态，等待确认
      expect(plan.tasks[0].status).toBe('pending');

      // 提交并批准任务确认
      taskConfirm.submit();
      taskConfirm.addApprover({
        user_id: 'supervisor-001',
        role: 'supervisor',
        permissions: ['approve', 'reject']
      });

      taskConfirm.approve('supervisor-001', 'Task approved for execution');
      expect(taskConfirm.status).toBe('approved');

      // 任务确认批准后，可以更新任务状态
      plan.updateTaskStatus('task-001', 'in_progress');
      expect(plan.tasks[0].status).toBe('in_progress');
    });
  });

  describe('确认超时处理', () => {
    it('应该处理确认超时对Plan的影响', async () => {
      const plan = new Plan({
        context_id: 'context-006',
        name: 'Timeout Test Plan',
        description: 'Plan for testing confirmation timeout',
        tasks: [
          {
            task_id: 'task-001',
            name: 'Timeout Task',
            description: 'Task that will timeout',
            dependencies: [],
            estimated_duration: 1000,
            priority: 'medium',
            status: 'pending',
            assigned_agents: ['agent-006'],
            created_by: 'user-001'
          }
        ],
        created_by: 'user-001'
      });

      const confirm = new Confirm({
        context_id: plan.context_id,
        plan_id: plan.plan_id,
        request_type: 'plan_execution',
        title: 'Timeout Test Approval',
        description: 'Approval that will timeout',
        required_approvals: 1,
        approval_criteria: {
          minimum_approvers: 1,
          required_roles: ['admin'],
          unanimous_required: false
        },
        timeout_ms: 100, // 很短的超时时间用于测试
        created_by: 'user-001'
      });

      // 提交确认请求
      confirm.submit();
      expect(confirm.status).toBe('submitted');

      // 等待超时
      await new Promise(resolve => setTimeout(resolve, 150));

      // 手动触发超时检查（在实际系统中这会由定时器处理）
      if (Date.now() - confirm.submitted_at!.getTime() > confirm.timeout_ms) {
        confirm.timeout();
      }

      expect(confirm.status).toBe('timeout');

      // 确认超时后，Plan应该无法启动
      expect(() => plan.start()).toThrow();
    });

    it('应该支持确认超时后的重新提交', () => {
      const plan = new Plan({
        context_id: 'context-007',
        name: 'Resubmit Plan',
        description: 'Plan for testing resubmission after timeout',
        tasks: [
          {
            task_id: 'task-001',
            name: 'Resubmit Task',
            description: 'Task for resubmission test',
            dependencies: [],
            estimated_duration: 2000,
            priority: 'medium',
            status: 'pending',
            assigned_agents: ['agent-007'],
            created_by: 'user-001'
          }
        ],
        created_by: 'user-001'
      });

      const confirm = new Confirm({
        context_id: plan.context_id,
        plan_id: plan.plan_id,
        request_type: 'plan_execution',
        title: 'Resubmit Test Approval',
        description: 'Approval for resubmission test',
        required_approvals: 1,
        approval_criteria: {
          minimum_approvers: 1,
          required_roles: ['admin'],
          unanimous_required: false
        },
        timeout_ms: 300000,
        created_by: 'user-001'
      });

      // 第一次提交
      confirm.submit();
      expect(confirm.status).toBe('submitted');

      // 模拟超时
      confirm.timeout();
      expect(confirm.status).toBe('timeout');

      // 重新提交
      confirm.resubmit();
      expect(confirm.status).toBe('submitted');

      // 添加审批者并批准
      confirm.addApprover({
        user_id: 'admin-003',
        role: 'admin',
        permissions: ['approve', 'reject']
      });

      confirm.approve('admin-003', 'Approved after resubmission');
      expect(confirm.status).toBe('approved');

      // 重新提交并批准后，Plan可以启动
      plan.start();
      expect(plan.status).toBe('active');
    });
  });

  describe('批量确认处理', () => {
    it('应该支持Plan中多个任务的批量确认', () => {
      const plan = new Plan({
        context_id: 'context-008',
        name: 'Batch Approval Plan',
        description: 'Plan with multiple tasks requiring batch approval',
        tasks: [
          {
            task_id: 'task-001',
            name: 'Batch Task 1',
            description: 'First task in batch',
            dependencies: [],
            estimated_duration: 1000,
            priority: 'medium',
            status: 'pending',
            assigned_agents: ['agent-008'],
            created_by: 'user-001'
          },
          {
            task_id: 'task-002',
            name: 'Batch Task 2',
            description: 'Second task in batch',
            dependencies: [],
            estimated_duration: 1000,
            priority: 'medium',
            status: 'pending',
            assigned_agents: ['agent-008'],
            created_by: 'user-001'
          },
          {
            task_id: 'task-003',
            name: 'Batch Task 3',
            description: 'Third task in batch',
            dependencies: [],
            estimated_duration: 1000,
            priority: 'medium',
            status: 'pending',
            assigned_agents: ['agent-008'],
            created_by: 'user-001'
          }
        ],
        created_by: 'user-001'
      });

      // 创建批量确认请求
      const batchConfirm = new Confirm({
        context_id: plan.context_id,
        plan_id: plan.plan_id,
        request_type: 'batch_task_execution',
        title: 'Batch Task Approval',
        description: 'Batch approval for multiple tasks',
        required_approvals: 1,
        approval_criteria: {
          minimum_approvers: 1,
          required_roles: ['admin'],
          unanimous_required: false
        },
        timeout_ms: 300000,
        metadata: {
          task_ids: ['task-001', 'task-002', 'task-003'],
          batch_type: 'parallel_execution'
        },
        created_by: 'user-001'
      });

      // 验证批量确认
      expect(batchConfirm.request_type).toBe('batch_task_execution');
      expect(batchConfirm.metadata?.task_ids).toHaveLength(3);
      expect(batchConfirm.metadata?.task_ids).toContain('task-001');
      expect(batchConfirm.metadata?.task_ids).toContain('task-002');
      expect(batchConfirm.metadata?.task_ids).toContain('task-003');

      // 提交并批准批量确认
      batchConfirm.submit();
      batchConfirm.addApprover({
        user_id: 'admin-004',
        role: 'admin',
        permissions: ['approve', 'reject']
      });

      batchConfirm.approve('admin-004', 'Batch tasks approved');
      expect(batchConfirm.status).toBe('approved');

      // 批量确认批准后，所有任务都可以执行
      plan.start();
      plan.updateTaskStatus('task-001', 'in_progress');
      plan.updateTaskStatus('task-002', 'in_progress');
      plan.updateTaskStatus('task-003', 'in_progress');

      expect(plan.tasks[0].status).toBe('in_progress');
      expect(plan.tasks[1].status).toBe('in_progress');
      expect(plan.tasks[2].status).toBe('in_progress');
    });
  });
});
