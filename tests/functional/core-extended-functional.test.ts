/**
 * Core协议扩展功能场景测试 - 10模块完整协调
 * @description 验证Core模块对10个模块的完整协调功能
 * @author MPLP Team
 * @version 2.0.0
 * @created 2025-08-04
 */

import { v4 as uuidv4 } from 'uuid';
import {
  WorkflowStage,
  ProtocolModule,
  CoordinationEventType,
  DecisionCoordinationRequest,
  DecisionResult,
  LifecycleCoordinationRequest,
  LifecycleResult,
  DialogCoordinationRequest,
  DialogResult,
  PluginCoordinationRequest,
  PluginResult,
  KnowledgeCoordinationRequest,
  KnowledgeResult,
  ExtendedWorkflowConfig,
  ModuleInterface,
  ModuleStatus
} from '../../src/public/modules/core/types/core.types';
import { CoreOrchestrator } from '../../src/public/modules/core/orchestrator/core-orchestrator';

// Mock模块实现
class MockModule implements ModuleInterface {
  constructor(public module_name: ProtocolModule) {}

  async initialize(): Promise<void> {
    // Mock初始化
  }

  async execute(context: any): Promise<any> {
    // 根据模块类型返回不同的结果
    switch (this.module_name) {
      case 'collab':
        return {
          decision_id: uuidv4(),
          result: 'consensus_reached',
          consensus_reached: true,
          participants_votes: { agent1: 'yes', agent2: 'yes' },
          timestamp: new Date().toISOString()
        } as DecisionResult;
      
      case 'role':
        return {
          role_id: uuidv4(),
          role_data: { name: 'test_role', capabilities: ['test'] },
          capabilities: ['test'],
          timestamp: new Date().toISOString()
        } as LifecycleResult;
      
      case 'dialog':
        return {
          dialog_id: uuidv4(),
          turns: [{ speaker: 'user', message: 'hello' }],
          final_state: { completed: true },
          timestamp: new Date().toISOString()
        } as DialogResult;
      
      case 'extension':
        return {
          plugin_id: uuidv4(),
          execution_result: { status: 'success' },
          integration_status: { pre_execution: true },
          timestamp: new Date().toISOString()
        } as PluginResult;
      
      case 'context':
        return {
          knowledge_id: uuidv4(),
          persisted_data: { key: 'value' },
          sharing_status: { cross_session: true },
          timestamp: new Date().toISOString()
        } as KnowledgeResult;
      
      default:
        return { status: 'completed', data: {} };
    }
  }

  async cleanup(): Promise<void> {
    // Mock清理
  }

  getStatus(): ModuleStatus {
    return 'active';
  }
}

describe('Core协议扩展功能场景测试 - 10模块完整协调', () => {
  let orchestrator: CoreOrchestrator;
  let mockModules: Map<ProtocolModule, MockModule>;
  let eventLog: any[];

  beforeEach(async () => {
    // 创建Core协调器
    orchestrator = new CoreOrchestrator({
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

    // 创建所有10个模块的Mock实现
    mockModules = new Map();
    const allModules: ProtocolModule[] = [
      'context', 'plan', 'confirm', 'trace', 'role', 'extension', 'collab', 'dialog', 'network'
    ];

    for (const moduleName of allModules) {
      const mockModule = new MockModule(moduleName);
      mockModules.set(moduleName, mockModule);
      orchestrator.registerModule(mockModule);
    }

    // 设置事件监听器
    eventLog = [];
    orchestrator.addEventListener((event) => {
      eventLog.push(event);
    });

    await orchestrator.initialize();
  });

  afterEach(async () => {
    await orchestrator.cleanup();
  });

  describe('模块注册和验证', () => {
    test('应该成功注册所有9个必需模块', () => {
      const validation = orchestrator.validateModuleRegistration();
      expect(validation.isComplete).toBe(true);
      expect(validation.missingModules).toHaveLength(0);
    });

    test('应该返回正确的模块状态报告', () => {
      const statusReport = orchestrator.getModuleStatusReport();
      expect(Object.keys(statusReport)).toHaveLength(9);
      
      for (const status of Object.values(statusReport)) {
        expect(status).toBe('active');
      }
    });
  });

  describe('决策协调功能 (Collab模块)', () => {
    test('应该成功协调多Agent决策过程', async () => {
      const request: DecisionCoordinationRequest = {
        contextId: uuidv4(),
        participants: ['agent1', 'agent2'],
        strategy: 'consensus',
        parameters: { threshold: 0.8 }
      };

      const result = await orchestrator.coordinateDecision(request);

      expect(result.decision_id).toBeDefined();
      expect(result.consensus_reached).toBe(true);
      expect(result.participants_votes).toEqual({ agent1: 'yes', agent2: 'yes' });

      // 验证事件发出
      const decisionEvents = eventLog.filter(e => 
        e.event_type === 'decision_started' || 
        e.event_type === 'decision_completed' ||
        e.event_type === 'consensus_reached'
      );
      expect(decisionEvents.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('生命周期协调功能 (Role模块)', () => {
    test('应该成功协调角色生命周期管理', async () => {
      const request: LifecycleCoordinationRequest = {
        contextId: uuidv4(),
        creation_strategy: 'dynamic',
        parameters: { creation_rules: ['rule1'] },
        capability_management: {
          skills: ['test_skill'],
          expertise_level: 5,
          learning_enabled: true
        }
      };

      const result = await orchestrator.coordinateLifecycle(request);

      expect(result.role_id).toBeDefined();
      expect(result.capabilities).toContain('test');

      // 验证角色事件
      const roleEvents = eventLog.filter(e => 
        e.event_type === 'role_created' || 
        e.event_type === 'role_activated'
      );
      expect(roleEvents.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('对话协调功能 (Dialog模块)', () => {
    test('应该成功协调多轮对话管理', async () => {
      const request: DialogCoordinationRequest = {
        contextId: uuidv4(),
        turn_strategy: 'adaptive',
        parameters: { max_turns: 10 },
        state_management: {
          persistence: true,
          transitions: ['start', 'continue', 'end'],
          rollback_support: true
        }
      };

      const result = await orchestrator.coordinateDialog(request);

      expect(result.dialog_id).toBeDefined();
      expect(result.turns).toHaveLength(1);
      expect(result.final_state.completed).toBe(true);
    });
  });

  describe('插件协调功能 (Extension模块)', () => {
    test('应该成功协调插件生命周期管理', async () => {
      const request: PluginCoordinationRequest = {
        contextId: uuidv4(),
        categories: ['methodology', 'workflow'],
        lifecycle: {
          registration: { auto: true },
          activation: { immediate: true },
          execution: { async: false },
          deactivation: { graceful: true }
        },
        integration_points: ['pre_execution', 'post_execution']
      };

      const result = await orchestrator.coordinatePlugin(request);

      expect(result.plugin_id).toBeDefined();
      expect(result.execution_result.status).toBe('success');
      expect(result.integration_status.pre_execution).toBe(true);
    });
  });

  describe('知识协调功能 (Context模块)', () => {
    test('应该成功协调知识持久化和共享', async () => {
      const request: KnowledgeCoordinationRequest = {
        contextId: uuidv4(),
        strategy: 'memory',
        parameters: { retention_policy: { days: 30 } },
        sharing: {
          cross_session: true,
          cross_application: false,
          sharing_rules: ['rule1', 'rule2']
        }
      };

      const result = await orchestrator.coordinateKnowledge(request);

      expect(result.knowledge_id).toBeDefined();
      expect(result.persisted_data).toEqual({ key: 'value' });
      expect(result.sharing_status.cross_session).toBe(true);
    });
  });

  describe('扩展工作流执行', () => {
    test('应该成功执行包含所有9个模块的扩展工作流', async () => {
      const contextId = uuidv4();
      const config: ExtendedWorkflowConfig = {
        stages: ['context', 'plan', 'confirm', 'trace', 'role', 'extension', 'collab', 'dialog', 'network'],
        execution_mode: 'sequential',
        timeout_ms: 60000,
        collabConfig: {
          participants: ['agent1', 'agent2'],
          strategy: 'consensus'
        },
        roleConfig: {
          creation_strategy: 'dynamic'
        },
        dialogConfig: {
          turn_strategy: 'adaptive'
        },
        extensionConfig: {
          categories: ['methodology']
        },
        contextConfig: {
          strategy: 'memory'
        }
      };

      const result = await orchestrator.executeExtendedWorkflow(contextId, config);

      expect(result.status).toBe('completed');
      expect(result.stages).toHaveLength(9);
      expect(result.stages.every(s => s.status === 'completed')).toBe(true);
      expect(result.total_duration_ms).toBeGreaterThanOrEqual(0);
    });
  });

  describe('事件系统扩展', () => {
    test('应该支持特定事件类型的监听器', () => {
      const decisionEvents: any[] = [];
      
      orchestrator.addEventTypeListener('decision_completed', (event) => {
        decisionEvents.push(event);
      });

      orchestrator.emitModuleEvent('decision_completed', 'collab', { test: 'data' });

      expect(decisionEvents).toHaveLength(1);
      expect(decisionEvents[0].event_type).toBe('decision_completed');
      expect(decisionEvents[0].stage).toBe('collab');
    });

    test('应该支持模块特定的事件监听器', () => {
      const collabEvents: any[] = [];
      
      orchestrator.addModuleEventListener('collab', (event) => {
        collabEvents.push(event);
      });

      orchestrator.emitModuleEvent('decision_started', 'collab', { test: 'data' });
      orchestrator.emitModuleEvent('role_created', 'role', { test: 'data' });

      expect(collabEvents).toHaveLength(1);
      expect(collabEvents[0].stage).toBe('collab');
    });

    test('应该支持批量事件发出', () => {
      const events = [
        {
          event_type: 'decision_started' as CoordinationEventType,
          execution_id: uuidv4(),
          stage: 'collab' as WorkflowStage,
          data: { test: 'data1' }
        },
        {
          event_type: 'role_created' as CoordinationEventType,
          execution_id: uuidv4(),
          stage: 'role' as WorkflowStage,
          data: { test: 'data2' }
        }
      ];

      orchestrator.emitEvents(events);

      const batchEvents = eventLog.slice(-2);
      expect(batchEvents).toHaveLength(2);
      expect(batchEvents[0].event_type).toBe('decision_started');
      expect(batchEvents[1].event_type).toBe('role_created');
    });
  });
});
