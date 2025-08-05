/**
 * Collab模块决策协调功能测试
 * @description 验证Collab模块的决策协调功能实现
 * @author MPLP Team
 * @version 2.0.0
 * @created 2025-08-04 22:19
 */

import { v4 as uuidv4 } from 'uuid';
import { CollabModuleAdapter } from '../../src/modules/collab/infrastructure/adapters/collab-module.adapter';
import { CollabService } from '../../src/modules/collab/application/services/collab.service';
import { MemoryCollabRepository } from '../../src/modules/collab/infrastructure/repositories/memory-collab.repository';
import { EventBus } from '../../src/core/event-bus';
import { DecisionCoordinationRequest, DecisionResult } from '../../src/public/modules/core/types/core.types';

describe('Collab模块决策协调功能测试', () => {
  let collabAdapter: CollabModuleAdapter;
  let collabService: CollabService;
  let eventBus: EventBus;

  beforeEach(async () => {
    // 创建事件总线
    eventBus = new EventBus();

    // 创建Collab服务
    const collabRepository = new MemoryCollabRepository();
    collabService = new CollabService(collabRepository, eventBus);

    // 创建Collab适配器
    collabAdapter = new CollabModuleAdapter(collabService);
    await collabAdapter.initialize();
  });

  afterEach(async () => {
    await collabAdapter.cleanup();
  });

  describe('模块初始化和状态管理', () => {
    test('应该成功初始化Collab模块适配器', async () => {
      const status = collabAdapter.getStatus();
      expect(status.module_name).toBe('collab');
      expect(status.status).toBe('initialized');
      expect(status.error_count).toBe(0);
    });

    test('应该正确处理模块状态变化', async () => {
      const initialStatus = collabAdapter.getStatus();
      expect(initialStatus.status).toBe('initialized');

      // 执行一个决策协调请求
      const request: DecisionCoordinationRequest = {
        contextId: uuidv4(),
        participants: ['agent1', 'agent2'],
        strategy: 'simple_voting',
        parameters: {}
      };

      await collabAdapter.execute(request);

      const finalStatus = collabAdapter.getStatus();
      expect(finalStatus.status).toBe('idle');
      expect(finalStatus.last_execution).toBeDefined();
    });
  });

  describe('简单投票决策', () => {
    test('应该成功执行简单投票决策', async () => {
      const request: DecisionCoordinationRequest = {
        contextId: uuidv4(),
        participants: ['agent1', 'agent2', 'agent3'],
        strategy: 'simple_voting',
        parameters: {}
      };

      const result: DecisionResult = await collabAdapter.execute(request);

      expect(result.decision_id).toBeDefined();
      expect(result.result).toMatch(/^(approved|rejected)$/);
      expect(result.consensus_reached).toBeDefined();
      expect(result.participants_votes).toBeDefined();
      expect(Object.keys(result.participants_votes)).toHaveLength(3);
      expect(result.timestamp).toBeDefined();
    });

    test('应该验证参与者数量要求', async () => {
      const request: DecisionCoordinationRequest = {
        contextId: uuidv4(),
        participants: ['agent1'], // 只有一个参与者
        strategy: 'simple_voting',
        parameters: {}
      };

      await expect(collabAdapter.execute(request)).rejects.toThrow(
        'At least 2 participants are required for decision coordination'
      );
    });
  });

  describe('加权投票决策', () => {
    test('应该成功执行加权投票决策', async () => {
      const request: DecisionCoordinationRequest = {
        contextId: uuidv4(),
        participants: ['agent1', 'agent2', 'agent3'],
        strategy: 'weighted_voting',
        parameters: {
          weights: {
            'agent1': 2.0,
            'agent2': 1.5,
            'agent3': 1.0
          }
        }
      };

      const result: DecisionResult = await collabAdapter.execute(request);

      expect(result.decision_id).toBeDefined();
      expect(result.result).toMatch(/^(approved|rejected)$/);
      expect(result.consensus_reached).toBeDefined();
      expect(result.participants_votes).toBeDefined();
      expect(Object.keys(result.participants_votes)).toHaveLength(3);
    });

    test('应该验证加权投票的权重配置', async () => {
      const request: DecisionCoordinationRequest = {
        contextId: uuidv4(),
        participants: ['agent1', 'agent2'],
        strategy: 'weighted_voting',
        parameters: {} // 缺少权重配置
      };

      await expect(collabAdapter.execute(request)).rejects.toThrow(
        'Weights are required for weighted voting strategy'
      );
    });

    test('应该验证所有参与者都有权重定义', async () => {
      const request: DecisionCoordinationRequest = {
        contextId: uuidv4(),
        participants: ['agent1', 'agent2', 'agent3'],
        strategy: 'weighted_voting',
        parameters: {
          weights: {
            'agent1': 2.0,
            'agent2': 1.5
            // 缺少agent3的权重
          }
        }
      };

      await expect(collabAdapter.execute(request)).rejects.toThrow(
        'All participants must have weights defined'
      );
    });
  });

  describe('共识决策', () => {
    test('应该成功执行共识决策', async () => {
      const request: DecisionCoordinationRequest = {
        contextId: uuidv4(),
        participants: ['agent1', 'agent2', 'agent3', 'agent4'],
        strategy: 'consensus',
        parameters: {
          threshold: 0.75 // 75%共识阈值
        }
      };

      const result: DecisionResult = await collabAdapter.execute(request);

      expect(result.decision_id).toBeDefined();
      expect(result.result).toMatch(/^(approved|rejected)$/);
      expect(result.consensus_reached).toBeDefined();
      expect(result.participants_votes).toBeDefined();
      expect(Object.keys(result.participants_votes)).toHaveLength(4);
    });

    test('应该验证共识阈值范围', async () => {
      const request: DecisionCoordinationRequest = {
        contextId: uuidv4(),
        participants: ['agent1', 'agent2'],
        strategy: 'consensus',
        parameters: {
          threshold: 0.3 // 无效阈值（< 0.5）
        }
      };

      await expect(collabAdapter.execute(request)).rejects.toThrow(
        'Consensus threshold must be between 0.5 and 1.0'
      );
    });
  });

  describe('委托决策', () => {
    test('应该成功执行委托决策', async () => {
      const request: DecisionCoordinationRequest = {
        contextId: uuidv4(),
        participants: ['delegate', 'agent2', 'agent3'],
        strategy: 'delegation',
        parameters: {}
      };

      const result: DecisionResult = await collabAdapter.execute(request);

      expect(result.decision_id).toBeDefined();
      expect(result.result).toMatch(/^(approved|rejected)$/);
      expect(result.consensus_reached).toBeDefined();
      expect(result.participants_votes).toBeDefined();
      // 委托决策只有委托人投票
      expect(Object.keys(result.participants_votes)).toHaveLength(1);
      expect(result.participants_votes['delegate']).toBeDefined();
    });
  });

  describe('错误处理', () => {
    test('应该处理无效的决策策略', async () => {
      const request: DecisionCoordinationRequest = {
        contextId: uuidv4(),
        participants: ['agent1', 'agent2'],
        strategy: 'invalid_strategy' as any,
        parameters: {}
      };

      await expect(collabAdapter.execute(request)).rejects.toThrow(
        'Unsupported decision strategy: invalid_strategy'
      );
    });

    test('应该处理缺少contextId的情况', async () => {
      const request: DecisionCoordinationRequest = {
        contextId: '' as any,
        participants: ['agent1', 'agent2'],
        strategy: 'simple_voting',
        parameters: {}
      };

      await expect(collabAdapter.execute(request)).rejects.toThrow(
        'Context ID is required'
      );
    });
  });

  describe('性能和并发', () => {
    test('应该在合理时间内完成决策协调', async () => {
      const request: DecisionCoordinationRequest = {
        contextId: uuidv4(),
        participants: ['agent1', 'agent2', 'agent3', 'agent4', 'agent5'],
        strategy: 'simple_voting',
        parameters: {}
      };

      const startTime = Date.now();
      const result = await collabAdapter.execute(request);
      const endTime = Date.now();

      expect(result).toBeDefined();
      expect(endTime - startTime).toBeLessThan(1000); // 应该在1秒内完成
    });

    test('应该支持并发决策协调', async () => {
      const requests = Array.from({ length: 3 }, () => ({
        contextId: uuidv4(),
        participants: ['agent1', 'agent2'],
        strategy: 'simple_voting' as const,
        parameters: {}
      }));

      const results = await Promise.all(
        requests.map(request => collabAdapter.execute(request))
      );

      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result.decision_id).toBeDefined();
        expect(result.result).toMatch(/^(approved|rejected)$/);
      });

      // 确保每个决策都有唯一的ID
      const decisionIds = results.map(r => r.decision_id);
      const uniqueIds = new Set(decisionIds);
      expect(uniqueIds.size).toBe(3);
    });
  });
});
