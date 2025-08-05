/**
 * 多智能体项目管理端到端工作流测试
 * @description 基于真实用户需求的完整工作流场景测试
 * @author MPLP Team
 * @version 2.0.0
 * @created 2025-08-04 22:19
 * 
 * 测试场景：
 * 1. 用户创建一个多智能体协作项目
 * 2. 系统动态分配角色和权限
 * 3. 智能体们协作决策项目方案
 * 4. 执行项目并跟踪进度
 */

import { v4 as uuidv4 } from 'uuid';
import { CoreOrchestrator } from '../../src/public/modules/core/orchestrator/core-orchestrator';
import { CollabModuleAdapter } from '../../src/modules/collab/infrastructure/adapters/collab-module.adapter';
import { RoleModuleAdapter } from '../../src/modules/role/infrastructure/adapters/role-module.adapter';
import { CollabService } from '../../src/modules/collab/application/services/collab.service';
import { RoleManagementService } from '../../src/modules/role/application/services/role-management.service';
import { MemoryCollabRepository } from '../../src/modules/collab/infrastructure/repositories/memory-collab.repository';
import { RoleRepository } from '../../src/modules/role/infrastructure/repositories/role.repository';
import { EventBus } from '../../src/core/event-bus';
import { 
  ExtendedWorkflowConfig,
  CoordinationEvent
} from '../../src/public/modules/core/types/core.types';

describe('多智能体项目管理端到端工作流测试', () => {
  let coreOrchestrator: CoreOrchestrator;
  let collabAdapter: CollabModuleAdapter;
  let roleAdapter: RoleModuleAdapter;
  let eventBus: EventBus;
  let workflowEvents: CoordinationEvent[];

  beforeEach(async () => {
    // 创建事件总线
    eventBus = new EventBus();

    // 创建Collab适配器
    const collabRepository = new MemoryCollabRepository();
    const collabService = new CollabService(collabRepository, eventBus);
    collabAdapter = new CollabModuleAdapter(collabService);
    await collabAdapter.initialize();

    // 创建Role适配器
    const roleRepository = new RoleRepository();
    const roleManagementService = new RoleManagementService(roleRepository);
    roleAdapter = new RoleModuleAdapter(roleManagementService);
    await roleAdapter.initialize();

    // 创建Core协调器
    coreOrchestrator = new CoreOrchestrator({
      default_workflow: {
        stages: ['context', 'plan', 'confirm', 'trace'],
        parallel_execution: false,
        timeout_ms: 30000,
        retry_policy: { max_retries: 3, delay_ms: 1000 }
      },
      module_timeout_ms: 5000,
      max_concurrent_executions: 10,
      enable_performance_monitoring: true,
      enable_event_logging: true
    });

    // 注册模块
    coreOrchestrator.registerModule(collabAdapter);
    coreOrchestrator.registerModule(roleAdapter);

    // 设置事件监听器
    workflowEvents = [];
    coreOrchestrator.addEventListener((event) => {
      workflowEvents.push(event);
    });

    await coreOrchestrator.initialize();
  });

  afterEach(async () => {
    await coreOrchestrator.cleanup();
    await collabAdapter.cleanup();
    await roleAdapter.cleanup();
  });

  describe('场景1：多智能体协作项目启动', () => {
    test('应该成功执行完整的项目启动工作流', async () => {
      const projectId = uuidv4();
      
      // 定义扩展工作流配置（只使用已注册的模块）
      const workflowConfig: ExtendedWorkflowConfig = {
        stages: ['role', 'collab'],
        execution_mode: 'sequential',
        timeout_ms: 60000,
        
        // 角色配置：动态创建项目管理角色
        roleConfig: {
          creation_strategy: 'dynamic',
          parameters: {
            creation_rules: ['project_management', 'team_coordination']
          },
          capability_management: {
            skills: ['project_planning', 'team_management', 'decision_making'],
            expertise_level: 8,
            learning_enabled: true
          }
        },
        
        // 协作配置：建立项目团队决策机制
        collabConfig: {
          participants: ['project_manager', 'tech_lead', 'product_owner'],
          strategy: 'consensus',
          parameters: {
            threshold: 0.75
          }
        }
      };

      // 执行扩展工作流
      const result = await coreOrchestrator.executeExtendedWorkflow(projectId, workflowConfig);

      // 验证工作流执行结果
      expect(result.status).toBe('completed');
      expect(result.stages).toHaveLength(2); // 只有role和collab两个阶段
      expect(result.stages.every(s => s.status === 'completed')).toBe(true);
      expect(result.total_duration_ms).toBeGreaterThanOrEqual(0);

      // 验证角色创建
      const roleStage = result.stages.find(s => s.stage === 'role');
      expect(roleStage).toBeDefined();
      expect(roleStage!.result.role_id).toBeDefined();
      expect(roleStage!.result.capabilities).toContain('project_planning');
      expect(roleStage!.result.capabilities).toContain('advanced_operations'); // 专业水平 >= 7

      // 验证协作决策
      const collabStage = result.stages.find(s => s.stage === 'collab');
      expect(collabStage).toBeDefined();
      expect(collabStage!.result.decision_id).toBeDefined();
      expect(collabStage!.result.participants_votes).toBeDefined();

      // 验证事件序列（验证实际发出的事件）
      const eventTypes = workflowEvents.map(e => e.event_type);

      // 验证角色相关事件
      expect(eventTypes).toContain('role_created');
      expect(eventTypes).toContain('role_activated');

      // 验证决策相关事件
      expect(eventTypes).toContain('decision_started');
      expect(eventTypes).toContain('decision_completed');

      // 验证事件数量合理
      expect(workflowEvents.length).toBeGreaterThan(0);

      // 打印事件类型用于调试（可选）
      console.log('Workflow events:', eventTypes);
    });
  });

  describe('场景2：动态角色分配和权限管理', () => {
    test('应该根据项目需求动态分配角色和权限', async () => {
      const contextId = uuidv4();

      // 第一步：创建项目经理角色
      const managerResult = await coreOrchestrator.coordinateLifecycle({
        contextId,
        creation_strategy: 'template_based',
        parameters: {
          template_source: 'project_manager_template'
        },
        capability_management: {
          skills: ['leadership', 'planning', 'communication'],
          expertise_level: 9,
          learning_enabled: true
        }
      });

      expect(managerResult.role_id).toBeDefined();
      expect(managerResult.capabilities).toContain('leadership');
      expect(managerResult.capabilities).toContain('expert_operations'); // 专业水平 >= 9

      // 第二步：基于项目经理的决策创建开发团队
      const teamDecision = await coreOrchestrator.coordinateDecision({
        contextId: managerResult.role_id, // 使用项目经理角色作为上下文
        participants: ['project_manager', 'hr_manager'],
        strategy: 'weighted_voting',
        parameters: {
          weights: {
            'project_manager': 3.0, // 项目经理有更高权重
            'hr_manager': 1.0
          }
        }
      });

      expect(teamDecision.decision_id).toBeDefined();
      expect(teamDecision.participants_votes).toBeDefined();

      // 第三步：根据决策结果创建开发者角色
      if (teamDecision.consensus_reached) {
        const developerResult = await coreOrchestrator.coordinateLifecycle({
          contextId: teamDecision.decision_id,
          creation_strategy: 'ai_generated',
          parameters: {
            generation_criteria: {
              access_level: 'high',
              specialization: 'full_stack_development'
            }
          },
          capability_management: {
            skills: ['coding', 'testing', 'debugging'],
            expertise_level: 7,
            learning_enabled: true
          }
        });

        expect(developerResult.role_id).toBeDefined();
        expect(developerResult.capabilities).toContain('coding');
        expect(developerResult.capabilities).toContain('advanced_operations');
      }

      // 验证完整的角色管理事件序列
      const roleEvents = workflowEvents.filter(e => e.event_type.includes('role'));
      expect(roleEvents.length).toBeGreaterThanOrEqual(4); // 至少2个角色 × 2个事件（创建+激活）

      const decisionEvents = workflowEvents.filter(e => e.event_type.includes('decision'));
      expect(decisionEvents.length).toBeGreaterThanOrEqual(2); // 决策开始+完成
    });
  });

  describe('场景3：复杂决策协调流程', () => {
    test('应该支持多层级的决策协调', async () => {
      const projectId = uuidv4();

      // 第一层：高级管理层决策（使用委托决策）
      const executiveDecision = await coreOrchestrator.coordinateDecision({
        contextId: projectId,
        participants: ['ceo', 'cto', 'cpo'],
        strategy: 'delegation', // 委托给CEO决策
        parameters: {}
      });

      expect(executiveDecision.decision_id).toBeDefined();
      expect(executiveDecision.result).toMatch(/^(approved|rejected)$/);

      // 第二层：如果高层批准，进行技术团队共识决策
      if (executiveDecision.result === 'approved') {
        const techTeamDecision = await coreOrchestrator.coordinateDecision({
          contextId: executiveDecision.decision_id,
          participants: ['tech_lead', 'senior_dev1', 'senior_dev2', 'architect'],
          strategy: 'consensus',
          parameters: {
            threshold: 0.8 // 需要80%共识
          }
        });

        expect(techTeamDecision.decision_id).toBeDefined();
        expect(techTeamDecision.participants_votes).toBeDefined();
        expect(Object.keys(techTeamDecision.participants_votes)).toHaveLength(4);

        // 第三层：如果技术团队达成共识，进行实施团队简单投票
        if (techTeamDecision.consensus_reached) {
          const implementationDecision = await coreOrchestrator.coordinateDecision({
            contextId: techTeamDecision.decision_id,
            participants: ['dev1', 'dev2', 'dev3', 'qa1', 'qa2'],
            strategy: 'simple_voting',
            parameters: {}
          });

          expect(implementationDecision.decision_id).toBeDefined();
          expect(Object.keys(implementationDecision.participants_votes)).toHaveLength(5);
        }
      }

      // 验证决策链的事件序列
      const decisionEvents = workflowEvents.filter(e => e.event_type.includes('decision'));
      expect(decisionEvents.length).toBeGreaterThanOrEqual(2); // 至少有高层决策的事件

      // 验证事件的时间顺序
      const decisionStartEvents = workflowEvents.filter(e => e.event_type === 'decision_started');
      const decisionCompleteEvents = workflowEvents.filter(e => e.event_type === 'decision_completed');
      
      expect(decisionStartEvents.length).toBeGreaterThanOrEqual(1);
      expect(decisionCompleteEvents.length).toBeGreaterThanOrEqual(1);
      expect(decisionStartEvents.length).toBe(decisionCompleteEvents.length);
    });
  });

  describe('场景4：工作流性能和可靠性', () => {
    test('应该在合理时间内完成复杂工作流', async () => {
      const startTime = Date.now();
      const contextId = uuidv4();

      // 并发执行多个协调任务
      const tasks = [
        coreOrchestrator.coordinateLifecycle({
          contextId,
          creation_strategy: 'static',
          parameters: {}
        }),
        coreOrchestrator.coordinateDecision({
          contextId,
          participants: ['agent1', 'agent2'],
          strategy: 'simple_voting',
          parameters: {}
        }),
        coreOrchestrator.coordinateLifecycle({
          contextId,
          creation_strategy: 'dynamic',
          parameters: { creation_rules: ['basic_access'] }
        })
      ];

      const results = await Promise.all(tasks);
      const endTime = Date.now();

      // 验证所有任务都成功完成
      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result).toBeDefined();
      });

      // 验证性能要求
      expect(endTime - startTime).toBeLessThan(5000); // 应该在5秒内完成

      // 验证并发事件处理
      expect(workflowEvents.length).toBeGreaterThan(0);
      
      // 验证事件的完整性
      const roleEvents = workflowEvents.filter(e => e.event_type.includes('role'));
      const decisionEvents = workflowEvents.filter(e => e.event_type.includes('decision'));
      
      expect(roleEvents.length).toBeGreaterThanOrEqual(4); // 2个角色 × 2个事件
      expect(decisionEvents.length).toBeGreaterThanOrEqual(2); // 1个决策 × 2个事件
    });

    test('应该正确处理工作流中的错误和恢复', async () => {
      const contextId = uuidv4();

      // 执行一个会失败的任务
      await expect(coreOrchestrator.coordinateLifecycle({
        contextId,
        creation_strategy: 'template_based',
        parameters: {} // 缺少template_source，会失败
      })).rejects.toThrow();

      // 验证系统仍然可以处理正常任务
      const validResult = await coreOrchestrator.coordinateDecision({
        contextId,
        participants: ['agent1', 'agent2'],
        strategy: 'simple_voting',
        parameters: {}
      });

      expect(validResult.decision_id).toBeDefined();

      // 验证错误不影响后续操作
      const anotherValidResult = await coreOrchestrator.coordinateLifecycle({
        contextId,
        creation_strategy: 'static',
        parameters: {}
      });

      expect(anotherValidResult.role_id).toBeDefined();
    });
  });
});
