/**
 * Collab + Role模块与Core模块集成测试
 * @description 验证Collab和Role模块与Core模块的协调接口集成
 * @author MPLP Team
 * @version 2.0.0
 * @created 2025-08-04 22:19
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
  DecisionCoordinationRequest, 
  LifecycleCoordinationRequest,
  DecisionResult,
  LifecycleResult,
  CoordinationEvent
} from '../../src/public/modules/core/types/core.types';

describe('Collab + Role模块与Core模块集成测试', () => {
  let coreOrchestrator: CoreOrchestrator;
  let collabAdapter: CollabModuleAdapter;
  let roleAdapter: RoleModuleAdapter;
  let eventBus: EventBus;
  let eventLog: CoordinationEvent[];

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

    // 注册模块到Core协调器
    coreOrchestrator.registerModule(collabAdapter);
    coreOrchestrator.registerModule(roleAdapter);

    // 设置事件监听器
    eventLog = [];
    coreOrchestrator.addEventListener((event) => {
      eventLog.push(event);
    });

    await coreOrchestrator.initialize();
  });

  afterEach(async () => {
    await coreOrchestrator.cleanup();
    await collabAdapter.cleanup();
    await roleAdapter.cleanup();
  });

  describe('模块注册和验证', () => {
    test('应该成功注册Collab和Role模块', () => {
      const validation = coreOrchestrator.validateModuleRegistration();

      // 验证模块注册状态 - Collab和Role模块不在必需模块列表中，所以不会出现在missingModules中
      expect(validation.missingModules).not.toContain('collab');
      expect(validation.missingModules).not.toContain('role');

      // 验证模块状态来确认注册成功
      const statusReport = coreOrchestrator.getModuleStatusReport();
      expect(statusReport.collab).toBeDefined();
      expect(statusReport.role).toBeDefined();
    });

    test('应该返回正确的模块状态', () => {
      const statusReport = coreOrchestrator.getModuleStatusReport();
      
      expect(statusReport.collab).toBeDefined();
      expect(statusReport.collab.module_name).toBe('collab');
      expect(statusReport.collab.status).toBe('initialized');
      
      expect(statusReport.role).toBeDefined();
      expect(statusReport.role.module_name).toBe('role');
      expect(statusReport.role.status).toBe('initialized');
    });
  });

  describe('Collab模块决策协调集成', () => {
    test('应该通过Core协调器成功执行决策协调', async () => {
      const request: DecisionCoordinationRequest = {
        contextId: uuidv4(),
        participants: ['agent1', 'agent2', 'agent3'],
        strategy: 'simple_voting',
        parameters: {}
      };

      const result: DecisionResult = await coreOrchestrator.coordinateDecision(request);

      expect(result.decision_id).toBeDefined();
      expect(result.result).toMatch(/^(approved|rejected)$/);
      expect(result.consensus_reached).toBeDefined();
      expect(result.participants_votes).toBeDefined();
      expect(Object.keys(result.participants_votes)).toHaveLength(3);

      // 验证事件发出
      const decisionEvents = eventLog.filter(e => 
        e.event_type === 'decision_started' || 
        e.event_type === 'decision_completed'
      );
      expect(decisionEvents.length).toBeGreaterThanOrEqual(2);
    });

    test('应该处理加权投票决策协调', async () => {
      const request: DecisionCoordinationRequest = {
        contextId: uuidv4(),
        participants: ['agent1', 'agent2'],
        strategy: 'weighted_voting',
        parameters: {
          weights: {
            'agent1': 2.0,
            'agent2': 1.0
          }
        }
      };

      const result: DecisionResult = await coreOrchestrator.coordinateDecision(request);

      expect(result.decision_id).toBeDefined();
      expect(result.participants_votes).toBeDefined();
      expect(Object.keys(result.participants_votes)).toHaveLength(2);
    });

    test('应该处理共识决策协调', async () => {
      const request: DecisionCoordinationRequest = {
        contextId: uuidv4(),
        participants: ['agent1', 'agent2', 'agent3', 'agent4'],
        strategy: 'consensus',
        parameters: {
          threshold: 0.75
        }
      };

      const result: DecisionResult = await coreOrchestrator.coordinateDecision(request);

      expect(result.decision_id).toBeDefined();
      expect(result.consensus_reached).toBeDefined();
      
      // 如果达成共识，应该有共识事件
      if (result.consensus_reached) {
        const consensusEvents = eventLog.filter(e => e.event_type === 'consensus_reached');
        expect(consensusEvents.length).toBeGreaterThanOrEqual(1);
      }
    });
  });

  describe('Role模块生命周期协调集成', () => {
    test('应该通过Core协调器成功执行生命周期管理', async () => {
      const request: LifecycleCoordinationRequest = {
        contextId: uuidv4(),
        creation_strategy: 'dynamic',
        parameters: {
          creation_rules: ['admin_access']
        },
        capability_management: {
          skills: ['management', 'coordination'],
          expertise_level: 7,
          learning_enabled: true
        }
      };

      const result: LifecycleResult = await coreOrchestrator.coordinateLifecycle(request);

      expect(result.role_id).toBeDefined();
      expect(result.role_data).toBeDefined();
      expect(result.capabilities).toContain('management');
      expect(result.capabilities).toContain('coordination');
      expect(result.capabilities).toContain('advanced_operations'); // 专业水平 >= 7

      // 验证角色事件
      const roleEvents = eventLog.filter(e => 
        e.event_type === 'role_created' || 
        e.event_type === 'role_activated'
      );
      expect(roleEvents.length).toBeGreaterThanOrEqual(2);
    });

    test('应该处理不同的角色创建策略', async () => {
      const strategies = ['static', 'dynamic', 'template_based', 'ai_generated'] as const;
      
      for (const strategy of strategies) {
        const request: LifecycleCoordinationRequest = {
          contextId: uuidv4(),
          creation_strategy: strategy,
          parameters: strategy === 'template_based' 
            ? { template_source: 'admin_template' }
            : strategy === 'ai_generated'
            ? { generation_criteria: { access_level: 'medium' } }
            : {}
        };

        const result = await coreOrchestrator.coordinateLifecycle(request);
        
        expect(result.role_id).toBeDefined();
        expect(result.role_data).toBeDefined();
        expect(result.role_data.name).toContain(`${strategy.split('_')[0]}_role_`);
      }
    });
  });

  describe('模块间协调和事件传播', () => {
    test('应该正确处理模块间的事件传播', async () => {
      // 先创建一个角色
      const roleRequest: LifecycleCoordinationRequest = {
        contextId: uuidv4(),
        creation_strategy: 'static',
        parameters: {}
      };

      const roleResult = await coreOrchestrator.coordinateLifecycle(roleRequest);
      
      // 然后进行决策协调，使用创建的角色
      const decisionRequest: DecisionCoordinationRequest = {
        contextId: roleResult.role_id, // 使用角色ID作为上下文
        participants: ['agent1', 'agent2'],
        strategy: 'simple_voting',
        parameters: {}
      };

      const decisionResult = await coreOrchestrator.coordinateDecision(decisionRequest);

      // 验证两个流程都成功
      expect(roleResult.role_id).toBeDefined();
      expect(decisionResult.decision_id).toBeDefined();

      // 验证事件序列
      const allEvents = eventLog.map(e => e.event_type);
      expect(allEvents).toContain('role_created');
      expect(allEvents).toContain('role_activated');
      expect(allEvents).toContain('decision_started');
      expect(allEvents).toContain('decision_completed');
    });

    test('应该支持并发的模块协调', async () => {
      const roleRequest: LifecycleCoordinationRequest = {
        contextId: uuidv4(),
        creation_strategy: 'static',
        parameters: {}
      };

      const decisionRequest: DecisionCoordinationRequest = {
        contextId: uuidv4(),
        participants: ['agent1', 'agent2'],
        strategy: 'simple_voting',
        parameters: {}
      };

      // 并发执行两个协调请求
      const [roleResult, decisionResult] = await Promise.all([
        coreOrchestrator.coordinateLifecycle(roleRequest),
        coreOrchestrator.coordinateDecision(decisionRequest)
      ]);

      expect(roleResult.role_id).toBeDefined();
      expect(decisionResult.decision_id).toBeDefined();

      // 验证两个流程的事件都被记录
      const roleEvents = eventLog.filter(e => e.event_type.includes('role'));
      const decisionEvents = eventLog.filter(e => e.event_type.includes('decision'));
      
      expect(roleEvents.length).toBeGreaterThan(0);
      expect(decisionEvents.length).toBeGreaterThan(0);
    });
  });

  describe('错误处理和恢复', () => {
    test('应该正确处理模块执行错误', async () => {
      const invalidRequest: DecisionCoordinationRequest = {
        contextId: uuidv4(),
        participants: ['agent1'], // 只有一个参与者，应该失败
        strategy: 'simple_voting',
        parameters: {}
      };

      await expect(coreOrchestrator.coordinateDecision(invalidRequest))
        .rejects.toThrow('At least 2 participants are required');
    });

    test('应该在模块错误后保持系统稳定', async () => {
      // 先执行一个会失败的请求
      const invalidRequest: LifecycleCoordinationRequest = {
        contextId: uuidv4(),
        creation_strategy: 'template_based',
        parameters: {} // 缺少template_source
      };

      await expect(coreOrchestrator.coordinateLifecycle(invalidRequest))
        .rejects.toThrow('Template source is required');

      // 然后执行一个正常的请求，验证系统仍然正常
      const validRequest: LifecycleCoordinationRequest = {
        contextId: uuidv4(),
        creation_strategy: 'static',
        parameters: {}
      };

      const result = await coreOrchestrator.coordinateLifecycle(validRequest);
      expect(result.role_id).toBeDefined();
    });
  });

  describe('性能和资源管理', () => {
    test('应该在合理时间内完成集成协调', async () => {
      const startTime = Date.now();

      const roleRequest: LifecycleCoordinationRequest = {
        contextId: uuidv4(),
        creation_strategy: 'static',
        parameters: {}
      };

      const decisionRequest: DecisionCoordinationRequest = {
        contextId: uuidv4(),
        participants: ['agent1', 'agent2'],
        strategy: 'simple_voting',
        parameters: {}
      };

      await Promise.all([
        coreOrchestrator.coordinateLifecycle(roleRequest),
        coreOrchestrator.coordinateDecision(decisionRequest)
      ]);

      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(2000); // 应该在2秒内完成
    });

    test('应该正确管理模块状态', async () => {
      const initialStatus = coreOrchestrator.getModuleStatusReport();
      expect(initialStatus.collab.status).toBe('initialized');
      expect(initialStatus.role.status).toBe('initialized');

      // 执行一些操作
      await coreOrchestrator.coordinateDecision({
        contextId: uuidv4(),
        participants: ['agent1', 'agent2'],
        strategy: 'simple_voting',
        parameters: {}
      });

      await coreOrchestrator.coordinateLifecycle({
        contextId: uuidv4(),
        creation_strategy: 'static',
        parameters: {}
      });

      const finalStatus = coreOrchestrator.getModuleStatusReport();
      expect(finalStatus.collab.status).toBe('idle');
      expect(finalStatus.role.status).toBe('idle');
      expect(finalStatus.collab.last_execution).toBeDefined();
      expect(finalStatus.role.last_execution).toBeDefined();
    });
  });
});
