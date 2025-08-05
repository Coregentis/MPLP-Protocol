/**
 * Collab实体单元测试
 * 
 * 基于实际实现的测试，确保100%分支覆盖
 * 
 * @version 1.0.0
 * @created 2025-08-02T04:10:00+08:00
 */

import { Collab } from '../../../src/modules/collab/domain/entities/collab.entity';
import { EntityStatus, CollabEntity, CollabParticipant, CoordinationStrategy, CollabMode } from '../../../src/modules/collab/types';
import { TestDataFactory } from '../../public/test-utils/test-data-factory';
import { TestHelpers } from '../../public/test-utils/test-helpers';
import { PERFORMANCE_THRESHOLDS } from '../../test-config';

describe('Collab Entity', () => {
  let collabData: Partial<CollabEntity>;

  beforeEach(() => {
    collabData = {
      context_id: 'context-001',
      plan_id: 'plan-001',
      name: 'Test Collaboration',
      description: 'Test collaboration description',
      mode: 'sequential' as CollabMode,
      participants: [],
      coordination_strategy: {
        type: 'centralized',
        coordinator_id: 'agent-001',
        decision_making: 'consensus'
      } as CoordinationStrategy,
      created_by: 'user-001',
      metadata: { test: true }
    };
  });

  afterEach(async () => {
    await TestDataFactory.Manager.cleanup();
  });

  describe('构造函数', () => {
    it('应该正确创建Collab实例', () => {
      const collab = new Collab(collabData);

      expect(collab.collaboration_id).toBeDefined();
      expect(collab.name).toBe(collabData.name);
      expect(collab.description).toBe(collabData.description);
      expect(collab.mode).toBe(collabData.mode);
      expect(collab.status).toBe('pending');
      expect(collab.context_id).toBe(collabData.context_id);
      expect(collab.plan_id).toBe(collabData.plan_id);
      expect(collab.created_by).toBe(collabData.created_by);
      expect(collab.participants).toEqual([]);
      expect(collab.coordination_strategy).toEqual(collabData.coordination_strategy);
    });

    it('应该使用默认值创建实例', () => {
      const minimalData = {
        context_id: 'context-001',
        plan_id: 'plan-001',
        name: 'Test Collab',
        mode: 'sequential' as CollabMode,
        coordination_strategy: {
          type: 'centralized',
          coordinator_id: 'agent-001',
          decision_making: 'consensus'
        } as CoordinationStrategy,
        created_by: 'user-001'
      };

      const collab = new Collab(minimalData);

      expect(collab.collaboration_id).toBeDefined();
      expect(collab.version).toBe('1.0.0');
      expect(collab.timestamp).toBeDefined();
      expect(collab.status).toBe('pending');
      expect(collab.participants).toEqual([]);
    });
  });

  describe('参与者管理', () => {
    let collab: Collab;

    beforeEach(() => {
      collab = new Collab(collabData);
    });

    it('应该成功添加参与者', () => {
      const participant = {
        agent_id: 'agent-001',
        role_id: 'contributor',
        status: 'active' as EntityStatus,
        capabilities: ['planning', 'execution'],
        priority: 1,
        weight: 1.0
      };

      collab.addParticipant(participant);

      const participants = collab.participants;
      expect(participants).toHaveLength(1);
      expect(participants[0].agent_id).toBe(participant.agent_id);
      expect(participants[0].role_id).toBe(participant.role_id);
      expect(participants[0].participant_id).toBeDefined();
      expect(participants[0].joined_at).toBeDefined();
    });

    it('应该防止重复添加相同Agent', () => {
      const participant = {
        agent_id: 'agent-001',
        role_id: 'contributor',
        status: 'active' as EntityStatus,
        capabilities: ['planning'],
        priority: 1,
        weight: 1.0
      };

      collab.addParticipant(participant);
      
      expect(() => collab.addParticipant(participant)).toThrow('Agent已经是协作参与者');
    });

    it('应该限制参与者数量到100个', () => {
      // 添加100个参与者
      for (let i = 0; i < 100; i++) {
        collab.addParticipant({
          agent_id: `agent-${i}`,
          role_id: 'contributor',
          status: 'active' as EntityStatus,
          capabilities: ['planning'],
          priority: 1,
          weight: 1.0
        });
      }

      const newParticipant = {
        agent_id: 'agent-new',
        role_id: 'contributor',
        status: 'active' as EntityStatus,
        capabilities: ['planning'],
        priority: 1,
        weight: 1.0
      };

      expect(() => collab.addParticipant(newParticipant)).toThrow('协作参与者数量已达上限');
    });

    it('应该成功移除参与者', () => {
      // 先添加3个参与者
      const participants = [
        { agent_id: 'agent-001', role_id: 'contributor', status: 'active' as EntityStatus, capabilities: ['planning'], priority: 1, weight: 1.0 },
        { agent_id: 'agent-002', role_id: 'contributor', status: 'active' as EntityStatus, capabilities: ['planning'], priority: 1, weight: 1.0 },
        { agent_id: 'agent-003', role_id: 'contributor', status: 'active' as EntityStatus, capabilities: ['planning'], priority: 1, weight: 1.0 }
      ];

      participants.forEach(p => collab.addParticipant(p));
      const participantId = collab.participants[0].participant_id;

      collab.removeParticipant(participantId);

      expect(collab.participants).toHaveLength(2);
      expect(collab.participants.find(p => p.participant_id === participantId)).toBeUndefined();
    });

    it('应该防止移除不存在的参与者', () => {
      expect(() => collab.removeParticipant('non-existent')).toThrow('参与者不存在');
    });

    it('应该防止移除导致参与者少于2个', () => {
      // 添加2个参与者
      collab.addParticipant({
        agent_id: 'agent-001',
        role_id: 'contributor',
        status: 'active' as EntityStatus,
        capabilities: ['planning'],
        priority: 1,
        weight: 1.0
      });
      collab.addParticipant({
        agent_id: 'agent-002',
        role_id: 'contributor',
        status: 'active' as EntityStatus,
        capabilities: ['planning'],
        priority: 1,
        weight: 1.0
      });

      const participantId = collab.participants[0].participant_id;
      expect(() => collab.removeParticipant(participantId)).toThrow('协作至少需要2个参与者');
    });

    it('应该成功更新参与者状态', () => {
      collab.addParticipant({
        agent_id: 'agent-001',
        role_id: 'contributor',
        status: 'active' as EntityStatus,
        capabilities: ['planning'],
        priority: 1,
        weight: 1.0
      });

      const participantId = collab.participants[0].participant_id;
      collab.updateParticipantStatus(participantId, 'inactive');

      expect(collab.participants[0].status).toBe('inactive');
    });

    it('应该防止更新不存在参与者的状态', () => {
      expect(() => collab.updateParticipantStatus('non-existent', 'inactive')).toThrow('参与者不存在');
    });
  });

  describe('状态管理', () => {
    let collab: Collab;

    beforeEach(() => {
      collab = new Collab(collabData);
      // 添加2个活跃参与者以满足启动条件
      collab.addParticipant({
        agent_id: 'agent-001',
        role_id: 'contributor',
        status: 'active' as EntityStatus,
        capabilities: ['planning'],
        priority: 1,
        weight: 1.0
      });
      collab.addParticipant({
        agent_id: 'agent-002',
        role_id: 'contributor',
        status: 'active' as EntityStatus,
        capabilities: ['planning'],
        priority: 1,
        weight: 1.0
      });
    });

    it('应该成功启动协作', () => {
      collab.start();
      expect(collab.status).toBe('active');
    });

    it('应该防止非pending状态启动协作', () => {
      collab.start();
      expect(() => collab.start()).toThrow('无法启动协作，当前状态: active');
    });

    it('应该防止活跃参与者少于2个时启动', () => {
      // 将一个参与者设为非活跃
      const participantId = collab.participants[0].participant_id;
      collab.updateParticipantStatus(participantId, 'inactive');

      expect(() => collab.start()).toThrow('至少需要2个活跃参与者才能启动协作');
    });

    it('应该成功暂停协作', () => {
      collab.start();
      collab.pause();
      expect(collab.status).toBe('inactive');
    });

    it('应该防止非active状态暂停协作', () => {
      expect(() => collab.pause()).toThrow('无法暂停协作，当前状态: pending');
    });

    it('应该成功恢复协作', () => {
      collab.start();
      collab.pause();
      collab.resume();
      expect(collab.status).toBe('active');
    });

    it('应该防止非inactive状态恢复协作', () => {
      expect(() => collab.resume()).toThrow('无法恢复协作，当前状态: pending');
    });

    it('应该成功完成协作', () => {
      collab.start();
      collab.complete();
      expect(collab.status).toBe('completed');
    });

    it('应该允许从inactive状态完成协作', () => {
      collab.start();
      collab.pause();
      collab.complete();
      expect(collab.status).toBe('completed');
    });

    it('应该防止无效状态完成协作', () => {
      expect(() => collab.complete()).toThrow('无法完成协作，当前状态: pending');
    });

    it('应该成功取消协作', () => {
      collab.cancel();
      expect(collab.status).toBe('cancelled');
    });

    it('应该防止已完成或已取消的协作再次取消', () => {
      collab.start(); // 先启动协作
      collab.complete(); // 然后完成协作
      expect(() => collab.cancel()).toThrow('无法取消协作，当前状态: completed');
    });

    it('应该成功标记协作失败', () => {
      const reason = 'Network error';
      collab.fail(reason);
      expect(collab.status).toBe('failed');
      expect(collab.metadata?.failure_reason).toBe(reason);
    });
  });

  describe('协调策略', () => {
    let collab: Collab;

    beforeEach(() => {
      collab = new Collab(collabData);
    });

    it('应该成功更新协调策略', () => {
      const newStrategy: Partial<CoordinationStrategy> = {
        type: 'distributed',
        coordinator_id: 'agent-002',
        decision_making: 'majority'
      };

      collab.updateCoordinationStrategy(newStrategy);
      
      expect(collab.coordination_strategy.type).toBe('distributed');
      expect(collab.coordination_strategy.coordinator_id).toBe('agent-002');
      expect(collab.coordination_strategy.decision_making).toBe('majority');
    });
  });

  describe('性能测试', () => {
    it('应该在性能阈值内创建实例', async () => {
      await TestHelpers.Performance.expectExecutionTime(
        () => new Collab(collabData),
        PERFORMANCE_THRESHOLDS.UNIT_TEST.ENTITY_VALIDATION
      );
    });
  });

  describe('updateMetadata', () => {
    it('应该成功更新元数据', async () => {
      // 准备测试数据
      const collab = new Collab({
        context_id: TestDataFactory.Base.generateUUID(),
        plan_id: TestDataFactory.Base.generateUUID(),
        name: 'Test Collaboration',
        description: 'Test collaboration description',
        mode: 'sequential' as CollabMode,
        participants: [],
        coordination_strategy: {
          type: 'centralized',
          coordinator_id: 'agent-001',
          decision_making: 'consensus'
        } as CoordinationStrategy,
        created_by: TestDataFactory.Base.generateUUID(),
        metadata: { original: 'data' }
      });
      const originalUpdatedAt = collab.updated_at;
      const newMetadata = {
        updated: true,
        version: '2.0',
        additional_info: 'test data'
      };

      // 等待一毫秒确保时间戳不同
      await new Promise(resolve => setTimeout(resolve, 2));

      // 执行测试
      collab.updateMetadata(newMetadata);

      // 验证结果
      expect(collab.metadata).toEqual({
        original: 'data',
        updated: true,
        version: '2.0',
        additional_info: 'test data'
      });
      expect(collab.updated_at).not.toBe(originalUpdatedAt);
    });
  });

  describe('toObject', () => {
    it('应该正确转换为普通对象', () => {
      // 准备测试数据
      const collaborationId = TestDataFactory.Base.generateUUID();
      const contextId = TestDataFactory.Base.generateUUID();
      const planId = TestDataFactory.Base.generateUUID();
      const createdBy = TestDataFactory.Base.generateUUID();
      const timestamp = new Date().toISOString();
      const createdAt = new Date().toISOString();
      const updatedAt = new Date().toISOString();
      const participants: CollabParticipant[] = [];
      const coordinationStrategy = {
        type: 'centralized',
        coordinator_id: 'agent-001',
        decision_making: 'consensus'
      } as CoordinationStrategy;
      const metadata = { test: true };

      const collab = new Collab({
        collaboration_id: collaborationId,
        version: '1.0.0',
        timestamp: timestamp,
        context_id: contextId,
        plan_id: planId,
        name: 'Test Collaboration',
        description: 'Test collaboration description',
        mode: 'sequential' as CollabMode,
        status: 'pending',
        participants: participants,
        coordination_strategy: coordinationStrategy,
        created_by: createdBy,
        created_at: createdAt,
        updated_at: updatedAt,
        metadata: metadata
      });

      // 执行测试
      const result = collab.toObject();

      // 验证结果
      expect(result.collaboration_id).toBe(collaborationId);
      expect(result.version).toBe('1.0.0');
      expect(result.timestamp).toBe(timestamp);
      expect(result.context_id).toBe(contextId);
      expect(result.plan_id).toBe(planId);
      expect(result.name).toBe('Test Collaboration');
      expect(result.description).toBe('Test collaboration description');
      expect(result.status).toBe('pending');
      expect(result.participants).toEqual(participants);
      expect(result.coordination_strategy).toEqual(coordinationStrategy);
      expect(result.created_by).toBe(createdBy);
      expect(result.created_at).toBe(createdAt);
      expect(result.updated_at).toBe(updatedAt);
      expect(result.metadata).toEqual(metadata);
    });
  });

  describe('validation and error handling', () => {
    it('应该验证必需字段 - context_id', () => {
      // 执行测试并验证异常
      expect(() => new Collab({
        context_id: '', // 空的context_id
        plan_id: TestDataFactory.Base.generateUUID(),
        name: 'Test Collaboration',
        description: 'Test collaboration description',
        mode: 'sequential' as CollabMode,
        participants: [],
        coordination_strategy: {
          type: 'centralized',
          coordinator_id: 'agent-001',
          decision_making: 'consensus'
        } as CoordinationStrategy,
        created_by: TestDataFactory.Base.generateUUID(),
        metadata: { test: true }
      })).toThrow('context_id是必需的');
    });

    it('应该验证必需字段 - name', () => {
      // 执行测试并验证异常
      expect(() => new Collab({
        context_id: TestDataFactory.Base.generateUUID(),
        plan_id: TestDataFactory.Base.generateUUID(),
        name: '', // 空的name
        description: 'Test collaboration description',
        mode: 'sequential' as CollabMode,
        participants: [],
        coordination_strategy: {
          type: 'centralized',
          coordinator_id: 'agent-001',
          decision_making: 'consensus'
        } as CoordinationStrategy,
        created_by: TestDataFactory.Base.generateUUID(),
        metadata: { test: true }
      })).toThrow('name是必需的');
    });
  });

  describe('updateBasicInfo method', () => {
    it('应该成功更新名称和模式', () => {
      // 准备测试数据
      const collab = new Collab(collabData);

      // 执行测试
      collab.updateBasicInfo({
        name: 'Updated Collaboration',
        mode: 'parallel' as CollabMode
      });

      // 验证结果
      expect(collab.name).toBe('Updated Collaboration');
      expect(collab.mode).toBe('parallel');
    });

    it('应该成功更新描述为undefined', () => {
      // 准备测试数据
      const collab = new Collab({
        ...collabData,
        description: 'Original description'
      });

      // 执行测试
      collab.updateBasicInfo({
        description: undefined
      });

      // 验证结果
      expect(collab.description).toBeUndefined();
    });
  });

  describe('static methods', () => {
    it('应该通过fromObject创建实例', () => {
      // 准备测试数据
      const data = {
        collaboration_id: TestDataFactory.Base.generateUUID(),
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        context_id: TestDataFactory.Base.generateUUID(),
        plan_id: TestDataFactory.Base.generateUUID(),
        name: 'Test Collaboration',
        description: 'Test collaboration description',
        mode: 'sequential' as CollabMode,
        status: 'pending' as EntityStatus,
        participants: [],
        coordination_strategy: {
          type: 'centralized',
          coordinator_id: 'agent-001',
          decision_making: 'consensus'
        } as CoordinationStrategy,
        created_by: TestDataFactory.Base.generateUUID(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        metadata: { test: true }
      };

      // 执行测试
      const collab = Collab.fromObject(data);

      // 验证结果
      expect(collab.collaboration_id).toBe(data.collaboration_id);
      expect(collab.name).toBe(data.name);
      expect(collab.created_at).toBe(data.created_at);
    });
  });
});
