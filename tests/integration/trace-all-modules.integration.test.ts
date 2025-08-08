import { Context } from '../../src/modules/context/domain/entities/context.entity';
import { Plan } from '../../src/modules/plan/domain/entities/plan.entity';
import { Confirm } from '../../src/modules/confirm/domain/entities/confirm.entity';
import { Trace } from '../../src/modules/trace/domain/entities/trace.entity';
import { TraceFactory } from '../../src/modules/trace/domain/factories/trace.factory';
import { TraceEvent, TraceType, TraceSeverity } from '../../src/modules/trace/types';
import { Role } from '../../src/modules/role/domain/entities/role.entity';
import { Extension } from '../../src/modules/extension/domain/entities/extension.entity';
import { Collab } from '../../src/modules/collab/domain/entities/collab.entity';
import { Dialog } from '../../src/modules/dialog/domain/entities/dialog.entity';
import { Network } from '../../src/modules/network/domain/entities/network.entity';
import { v4 as uuidv4 } from 'uuid';

describe('Trace-All Modules Integration Tests', () => {
  let trace: Trace;

  beforeEach(() => {
    const traceEvent: TraceEvent = {
      name: 'system_monitoring',
      source: {
        component: 'integration_test',
        module: 'trace',
        version: '1.0.0'
      },
      data: {
        test_session: 'all_modules_trace',
        timestamp: new Date().toISOString()
      },
      created_by: 'test-system'
    };

    const now = new Date().toISOString();
    trace = new Trace(
      uuidv4(),                    // trace_id
      uuidv4(),                    // context_id
      '1.0.0',                     // protocol_version
      'execution',                 // trace_type
      'info',                      // severity
      traceEvent,                  // event
      now,                         // timestamp
      now,                         // created_at
      now                          // updated_at
    );
  });

  describe('Context模块事件追踪', () => {
    it('应该追踪Context生命周期事件', () => {
      const context = new Context({
        session_id: 'session-trace-001',
        agent_id: 'agent-trace-001',
        configuration: {
          max_agents: 3,
          timeout: 30000,
          retry_policy: {
            max_retries: 2,
            backoff_ms: 1000
          }
        },
        created_by: 'user-001'
      });

      // 追踪Context创建事件
      const contextCreatedTrace = TraceFactory.create({
        context_id: context.context_id,
        trace_type: 'execution',
        severity: 'info',
        event: {
          type: 'lifecycle',
          name: 'context_created',
          category: 'system',
          source: {
            component: 'context_module',
            module: 'context'
          },
          data: {
            context_id: context.context_id,
            session_id: context.session_id,
            agent_id: context.agent_id,
            configuration: context.configuration
          }
        }
      });

      expect(contextCreatedTrace.event.name).toBe('context_created');
      expect(contextCreatedTrace.event.data.context_id).toBe(context.context_id);

      // 追踪Context状态变更事件
      context.start();
      const contextStartedTrace = new Trace({
        context_id: context.context_id,
        event_type: 'context_status_changed',
        source: 'context_module',
        data: {
          context_id: context.context_id,
          old_status: 'pending',
          new_status: 'active',
          timestamp: new Date().toISOString()
        },
        created_by: 'system'
      });

      expect(contextStartedTrace.event_type).toBe('context_status_changed');
      expect(contextStartedTrace.data.new_status).toBe('active');
    });
  });

  describe('Plan模块事件追踪', () => {
    it('应该追踪Plan执行和任务状态事件', () => {
      const plan = new Plan({
        context_id: 'plan-trace-context',
        name: 'Traced Plan',
        description: 'Plan for event tracing',
        tasks: [
          {
            task_id: 'traced-task-001',
            name: 'Traced Task',
            description: 'Task for tracing',
            dependencies: [],
            estimated_duration: 2000,
            priority: 'medium',
            status: 'pending',
            assigned_agents: ['agent-trace-002'],
            created_by: 'user-001'
          }
        ],
        created_by: 'user-001'
      });

      // 追踪Plan创建事件
      const planCreatedTrace = TraceFactory.create({
        context_id: plan.context_id,
        plan_id: plan.plan_id,
        trace_type: 'execution',
        severity: 'info',
        event: {
          type: 'lifecycle',
          name: 'plan_created',
          category: 'business',
          source: {
            component: 'plan_module',
            module: 'plan'
          },
          data: {
            plan_id: plan.plan_id,
            name: plan.name,
            task_count: plan.tasks.length,
            estimated_total_duration: plan.tasks.reduce((sum, task) => sum + task.estimated_duration, 0)
          }
        }
      });

      expect(planCreatedTrace.event.name).toBe('plan_created');
      expect(planCreatedTrace.event.data.task_count).toBe(1);

      // 追踪任务状态变更事件
      plan.start();
      plan.updateTaskStatus('traced-task-001', 'in_progress');

      const taskStatusTrace = TraceFactory.create({
        context_id: plan.context_id,
        plan_id: plan.plan_id,
        trace_type: 'execution',
        severity: 'info',
        event: {
          type: 'state_change',
          name: 'task_status_changed',
          category: 'business',
          source: {
            component: 'plan_module',
            module: 'plan'
          },
          data: {
            plan_id: plan.plan_id,
            task_id: 'traced-task-001',
            old_status: 'pending',
            new_status: 'in_progress',
            assigned_agents: ['agent-trace-002']
          }
        }
      });

      expect(taskStatusTrace.event.name).toBe('task_status_changed');
      expect(taskStatusTrace.event.data.new_status).toBe('in_progress');
    });
  });

  describe('Confirm模块事件追踪', () => {
    it('应该追踪确认流程的所有事件', () => {
      const confirm = new Confirm({
        context_id: uuidv4(),
        request_type: 'plan_execution',
        title: 'Traced Confirmation',
        description: 'Confirmation for tracing',
        required_approvals: 1,
        approval_criteria: {
          minimum_approvers: 1,
          required_roles: ['admin'],
          unanimous_required: false
        },
        timeout_ms: 300000,
        created_by: 'user-001'
      });

      // 追踪确认创建事件
      const confirmCreatedTrace = new Trace({
        context_id: confirm.context_id,
        event_type: 'confirm_created',
        source: 'confirm_module',
        data: {
          confirm_id: confirm.confirm_id,
          request_type: confirm.request_type,
          required_approvals: confirm.required_approvals,
          timeout_ms: confirm.timeout_ms
        },
        created_by: 'system'
      });

      expect(confirmCreatedTrace.event_type).toBe('confirm_created');
      expect(confirmCreatedTrace.data.request_type).toBe('plan_execution');

      // 追踪确认提交事件
      confirm.submit();
      const confirmSubmittedTrace = new Trace({
        context_id: confirm.context_id,
        event_type: 'confirm_submitted',
        source: 'confirm_module',
        data: {
          confirm_id: confirm.confirm_id,
          submitted_at: confirm.submitted_at?.toISOString(),
          status: confirm.status
        },
        created_by: 'system'
      });

      expect(confirmSubmittedTrace.event_type).toBe('confirm_submitted');
      expect(confirmSubmittedTrace.data.status).toBe('submitted');

      // 追踪审批事件
      confirm.addApprover({
        user_id: 'admin-trace-001',
        role: 'admin',
        permissions: ['approve', 'reject']
      });

      confirm.approve('admin-trace-001', 'Approved for tracing');

      const confirmApprovedTrace = new Trace({
        context_id: confirm.context_id,
        event_type: 'confirm_approved',
        source: 'confirm_module',
        data: {
          confirm_id: confirm.confirm_id,
          approver_id: 'admin-trace-001',
          approval_comment: 'Approved for tracing',
          final_status: confirm.status
        },
        created_by: 'system'
      });

      expect(confirmApprovedTrace.event_type).toBe('confirm_approved');
      expect(confirmApprovedTrace.data.final_status).toBe('approved');
    });
  });

  describe('Role模块事件追踪', () => {
    it('应该追踪角色和权限变更事件', () => {
      const role = new Role({
        context_id: uuidv4(),
        name: 'Traced Admin',
        description: 'Admin role for tracing',
        permissions: ['read', 'write'],
        created_by: 'user-001'
      });

      // 追踪角色创建事件
      const roleCreatedTrace = new Trace({
        context_id: 'role-trace-context',
        event_type: 'role_created',
        source: 'role_module',
        data: {
          role_id: role.role_id,
          name: role.name,
          permissions: role.permissions,
          created_by: role.created_by
        },
        created_by: 'system'
      });

      expect(roleCreatedTrace.event_type).toBe('role_created');
      expect(roleCreatedTrace.data.permissions).toContain('read');

      // 追踪权限变更事件
      role.addPermission('admin');
      const permissionAddedTrace = new Trace({
        context_id: 'role-trace-context',
        event_type: 'permission_added',
        source: 'role_module',
        data: {
          role_id: role.role_id,
          added_permission: 'admin',
          current_permissions: role.permissions
        },
        created_by: 'system'
      });

      expect(permissionAddedTrace.event_type).toBe('permission_added');
      expect(permissionAddedTrace.data.added_permission).toBe('admin');
    });
  });

  describe('Extension模块事件追踪', () => {
    it('应该追踪扩展生命周期事件', () => {
      const extension = new Extension({
        context_id: uuidv4(),
        name: 'Traced Extension',
        version: '1.0.0',
        description: 'Extension for tracing',
        entry_point: 'traced-extension.js',
        dependencies: [],
        created_by: 'user-001'
      });

      // 追踪扩展安装事件
      const extensionInstalledTrace = new Trace({
        context_id: 'extension-trace-context',
        event_type: 'extension_installed',
        source: 'extension_module',
        data: {
          extension_id: extension.extension_id,
          name: extension.name,
          version: extension.version,
          entry_point: extension.entry_point
        },
        created_by: 'system'
      });

      expect(extensionInstalledTrace.event_type).toBe('extension_installed');
      expect(extensionInstalledTrace.data.version).toBe('1.0.0');

      // 追踪扩展启用事件
      extension.enable();
      const extensionEnabledTrace = new Trace({
        context_id: 'extension-trace-context',
        event_type: 'extension_enabled',
        source: 'extension_module',
        data: {
          extension_id: extension.extension_id,
          status: extension.status,
          enabled_at: new Date().toISOString()
        },
        created_by: 'system'
      });

      expect(extensionEnabledTrace.event_type).toBe('extension_enabled');
      expect(extensionEnabledTrace.data.status).toBe('enabled');
    });
  });

  describe('Collab模块事件追踪', () => {
    it('应该追踪协作和决策事件', () => {
      const collab = new Collab({
        context_id: uuidv4(),
        plan_id: uuidv4(),
        name: 'Traced Collaboration',
        description: 'Collaboration for tracing',
        participants: [
          {
            agent_id: 'agent-collab-001',
            role: 'coordinator',
            permissions: ['vote', 'propose'],
            status: 'active'
          },
          {
            agent_id: 'agent-collab-002',
            role: 'participant',
            permissions: ['vote'],
            status: 'active'
          }
        ],
        decision_mechanism: {
          type: 'majority_vote',
          threshold: 0.5,
          timeout_ms: 30000
        },
        created_by: 'user-001'
      });

      // 追踪协作创建事件
      const collabCreatedTrace = new Trace({
        context_id: collab.context_id,
        event_type: 'collab_created',
        source: 'collab_module',
        data: {
          collab_id: collab.collab_id,
          participant_count: collab.participants.length,
          decision_mechanism: collab.decision_mechanism.type
        },
        created_by: 'system'
      });

      expect(collabCreatedTrace.event_type).toBe('collab_created');
      expect(collabCreatedTrace.data.participant_count).toBe(2);

      // 追踪决策事件
      collab.start();
      collab.proposeDecision({
        proposal_id: 'proposal-trace-001',
        title: 'Traced Decision',
        description: 'Decision for tracing',
        proposed_by: 'agent-collab-001',
        options: ['approve', 'reject'],
        voting_deadline: new Date(Date.now() + 30000)
      });

      const decisionProposedTrace = new Trace({
        context_id: collab.context_id,
        event_type: 'decision_proposed',
        source: 'collab_module',
        data: {
          collab_id: collab.collab_id,
          proposal_id: 'proposal-trace-001',
          proposed_by: 'agent-collab-001',
          options: ['approve', 'reject']
        },
        created_by: 'system'
      });

      expect(decisionProposedTrace.event_type).toBe('decision_proposed');
      expect(decisionProposedTrace.data.proposed_by).toBe('agent-collab-001');
    });
  });

  describe('Dialog模块事件追踪', () => {
    it('应该追踪对话和消息事件', () => {
      const dialog = new Dialog({
        session_id: 'dialog-trace-session',
        context_id: 'dialog-trace-context',
        name: 'Traced Dialog',
        participants: [
          {
            agent_id: 'agent-dialog-001',
            role_id: 'moderator',
            permissions: ['read', 'write', 'moderate'],
            status: 'active'
          },
          {
            agent_id: 'agent-dialog-002',
            role_id: 'participant',
            permissions: ['read', 'write'],
            status: 'active'
          }
        ],
        message_format: {
          type: 'text',
          encoding: 'utf-8',
          max_length: 1000
        },
        created_by: 'user-001'
      });

      // 追踪对话创建事件
      const dialogCreatedTrace = new Trace({
        context_id: dialog.context_id,
        event_type: 'dialog_created',
        source: 'dialog_module',
        data: {
          dialog_id: dialog.dialog_id,
          session_id: dialog.session_id,
          participant_count: dialog.participants.length,
          message_format: dialog.message_format.type
        },
        created_by: 'system'
      });

      expect(dialogCreatedTrace.event_type).toBe('dialog_created');
      expect(dialogCreatedTrace.data.participant_count).toBe(2);

      // 追踪对话启动事件
      dialog.start();
      const dialogStartedTrace = new Trace({
        context_id: dialog.context_id,
        event_type: 'dialog_started',
        source: 'dialog_module',
        data: {
          dialog_id: dialog.dialog_id,
          status: dialog.status,
          started_at: new Date().toISOString()
        },
        created_by: 'system'
      });

      expect(dialogStartedTrace.event_type).toBe('dialog_started');
      expect(dialogStartedTrace.data.status).toBe('active');
    });
  });

  describe('Network模块事件追踪', () => {
    it('应该追踪网络拓扑和节点事件', () => {
      const network = new Network({
        context_id: 'network-trace-context',
        name: 'Traced Network',
        topology: 'mesh',
        discovery_mechanism: {
          type: 'broadcast',
          registry_config: {
            endpoint: 'http://registry:8080',
            authentication: false,
            refresh_interval: 30000
          }
        },
        routing_strategy: {
          algorithm: 'shortest_path',
          load_balancing: {
            method: 'round_robin'
          }
        },
        created_by: 'user-001'
      });

      // 追踪网络创建事件
      const networkCreatedTrace = new Trace({
        context_id: network.context_id,
        event_type: 'network_created',
        source: 'network_module',
        data: {
          network_id: network.network_id,
          topology: network.topology,
          discovery_type: network.discovery_mechanism.type,
          routing_algorithm: network.routing_strategy.algorithm
        },
        created_by: 'system'
      });

      expect(networkCreatedTrace.event_type).toBe('network_created');
      expect(networkCreatedTrace.data.topology).toBe('mesh');

      // 追踪节点添加事件
      network.addNode({
        agent_id: 'agent-network-001',
        node_type: 'coordinator',
        status: 'online',
        address: {
          host: '192.168.1.100',
          port: 8080,
          protocol: 'http'
        },
        capabilities: ['coordination'],
        metadata: { trace: true }
      });

      const nodeAddedTrace = new Trace({
        context_id: network.context_id,
        event_type: 'node_added',
        source: 'network_module',
        data: {
          network_id: network.network_id,
          node_id: network.nodes[0].node_id,
          agent_id: 'agent-network-001',
          node_type: 'coordinator',
          address: network.nodes[0].address
        },
        created_by: 'system'
      });

      expect(nodeAddedTrace.event_type).toBe('node_added');
      expect(nodeAddedTrace.data.agent_id).toBe('agent-network-001');
    });
  });

  describe('跨模块事件关联追踪', () => {
    it('应该追踪跨模块的事件关联', () => {
      const contextId = 'cross-module-trace-context';

      // 创建Context
      const context = new Context({
        session_id: 'cross-module-session',
        agent_id: 'agent-cross-001',
        configuration: {
          max_agents: 5,
          timeout: 60000,
          retry_policy: {
            max_retries: 3,
            backoff_ms: 1000
          }
        },
        created_by: 'user-001'
      });

      // 创建关联的Plan
      const plan = new Plan({
        context_id: contextId,
        name: 'Cross-Module Plan',
        description: 'Plan for cross-module tracing',
        tasks: [
          {
            task_id: 'cross-task-001',
            name: 'Cross Task',
            description: 'Task for cross-module testing',
            dependencies: [],
            estimated_duration: 3000,
            priority: 'high',
            status: 'pending',
            assigned_agents: ['agent-cross-001'],
            created_by: 'user-001'
          }
        ],
        created_by: 'user-001'
      });

      // 创建关联的Confirm
      const confirm = new Confirm({
        context_id: contextId,
        plan_id: plan.plan_id,
        request_type: 'plan_execution',
        title: 'Cross-Module Approval',
        description: 'Approval for cross-module plan',
        required_approvals: 1,
        approval_criteria: {
          minimum_approvers: 1,
          required_roles: ['admin'],
          unanimous_required: false
        },
        timeout_ms: 300000,
        created_by: 'user-001'
      });

      // 创建跨模块事件关联追踪
      const crossModuleTrace = new Trace({
        context_id: contextId,
        event_type: 'cross_module_workflow',
        source: 'integration_system',
        data: {
          workflow_id: 'cross-workflow-001',
          context_id: context.context_id,
          plan_id: plan.plan_id,
          confirm_id: confirm.confirm_id,
          modules_involved: ['context', 'plan', 'confirm'],
          workflow_stage: 'initialization'
        },
        created_by: 'system'
      });

      expect(crossModuleTrace.event_type).toBe('cross_module_workflow');
      expect(crossModuleTrace.data.modules_involved).toHaveLength(3);
      expect(crossModuleTrace.data.modules_involved).toContain('context');
      expect(crossModuleTrace.data.modules_involved).toContain('plan');
      expect(crossModuleTrace.data.modules_involved).toContain('confirm');
    });
  });
});
