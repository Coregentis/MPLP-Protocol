/**
 * Collab Entity Unit Tests
 * @description 基于源代码功能的领域实体测试，验证业务规则和领域逻辑
 * @version 1.0.0
 */

import { CollabEntity, CollabParticipant, CollabCoordinationStrategy } from '../../../../src/modules/collab/domain/entities/collab.entity';
import { CollabTestFactory } from '../factories/collab-test.factory';
import { generateUUID } from '../../../../src/shared/utils';

describe('CollabEntity单元测试', () => {
  describe('构造函数和基本属性', () => {
    it('应该成功创建协作实体', () => {
      // 🎯 Arrange
      const id = generateUUID();
      const contextId = generateUUID();
      const planId = generateUUID();
      const name = 'Test Collaboration';
      const mode = 'sequential' as const;
      const coordinationStrategy = new CollabCoordinationStrategy('centralized', 'coordinator', generateUUID());
      const createdBy = 'test-user';
      const description = 'Test description';

      // 🎯 Act
      const entity = new CollabEntity(
        id,
        contextId,
        planId,
        name,
        mode,
        coordinationStrategy,
        createdBy,
        description
      );

      // ✅ Assert
      expect(entity.id).toBe(id);
      expect(entity.contextId).toBe(contextId);
      expect(entity.planId).toBe(planId);
      expect(entity.name).toBe(name);
      expect(entity.mode).toBe(mode);
      expect(entity.coordinationStrategy).toBe(coordinationStrategy);
      expect(entity.createdBy).toBe(createdBy);
      expect(entity.description).toBe(description);
      expect(entity.status).toBe('draft');
      expect(entity.participants).toEqual([]);
    });

    it('应该验证协调策略配置', () => {
      // 🎯 Arrange - 创建一个真正无效的策略（空字段）
      const invalidStrategy = new CollabCoordinationStrategy('', ''); // 空字符串应该失败

      // 🎯 Act & Assert
      expect(() => {
        new CollabEntity(
          generateUUID(),
          generateUUID(),
          generateUUID(),
          'Test Collab',
          'sequential',
          invalidStrategy,
          'test-user'
        );
      }).toThrow('Invalid coordination strategy configuration');
    });

    it('应该生成CollabCreated领域事件', () => {
      // 🎯 Arrange & Act
      const entity = CollabTestFactory.createCollabEntity();

      // ✅ Assert
      const events = entity.domainEvents;
      expect(events.length).toBeGreaterThanOrEqual(1); // 至少有CollabCreated事件

      const createdEvent = events.find(e => e.type === 'CollabCreated');
      expect(createdEvent).toBeDefined();
      expect(createdEvent).toHaveProperty('collaborationId');
      expect(createdEvent).toHaveProperty('name');
      expect(createdEvent).toHaveProperty('mode');
      expect(createdEvent).toHaveProperty('participantCount');
    });
  });

  describe('参与者管理', () => {
    let entity: CollabEntity;

    beforeEach(() => {
      entity = CollabTestFactory.createCollabEntity();
    });

    it('应该成功添加参与者', () => {
      // 🎯 Arrange
      const initialCount = entity.participants.length;
      const participant = new CollabParticipant(
        generateUUID(),
        generateUUID(),
        generateUUID(),
        'active',
        ['test-capability']
      );

      // 🎯 Act
      entity.addParticipant(participant, 'test-user');

      // ✅ Assert
      expect(entity.participants).toHaveLength(initialCount + 1);
      expect(entity.participants).toContain(participant);

      // 验证领域事件 - 查找最新的ParticipantAdded事件
      const events = entity.domainEvents;
      const addedEvents = events.filter(e => e.type === 'CollabParticipantAdded');
      const latestAddedEvent = addedEvents[addedEvents.length - 1]; // 获取最新的事件
      expect(latestAddedEvent).toBeDefined();
      expect(latestAddedEvent).toHaveProperty('participantId', participant.participantId);
    });

    it('应该防止添加重复参与者', () => {
      // 🎯 Arrange
      const existingParticipant = entity.participants[0];
      const duplicateParticipant = new CollabParticipant(
        existingParticipant.participantId, // 相同的participantId
        generateUUID(),
        generateUUID(),
        'active',
        ['test-capability']
      );

      // 🎯 Act & Assert
      expect(() => {
        entity.addParticipant(duplicateParticipant, 'test-user');
      }).toThrow('Participant already exists in collaboration');
    });

    it('应该成功移除参与者', () => {
      // 🎯 Arrange - 先添加额外的参与者，确保移除后仍有至少2个
      const extraParticipant = new CollabParticipant(
        generateUUID(),
        generateUUID(),
        generateUUID(),
        'active',
        ['extra-capability']
      );
      entity.addParticipant(extraParticipant, 'test-user');

      const participantToRemove = entity.participants[0];
      const initialCount = entity.participants.length;

      // 🎯 Act
      entity.removeParticipant(participantToRemove.participantId, 'test-user', 'No longer needed');

      // ✅ Assert
      expect(entity.participants).toHaveLength(initialCount - 1);
      expect(entity.participants.find(p => p.participantId === participantToRemove.participantId)).toBeUndefined();

      // 验证领域事件
      const events = entity.domainEvents;
      const removedEvent = events.find(e => e.type === 'CollabParticipantRemoved');
      expect(removedEvent).toBeDefined();
      expect(removedEvent).toHaveProperty('participantId', participantToRemove.participantId);
      expect(removedEvent).toHaveProperty('reason', 'No longer needed');
    });

    it('应该防止移除不存在的参与者', () => {
      // 🎯 Arrange
      const nonExistentId = generateUUID();

      // 🎯 Act & Assert
      expect(() => {
        entity.removeParticipant(nonExistentId, 'test-user');
      }).toThrow('Participant not found in collaboration');
    });

    it('应该防止移除参与者导致少于最小数量', () => {
      // 🎯 Arrange - 确保只有2个参与者（最小数量）
      expect(entity.participants.length).toBe(2);
      const participantToRemove = entity.participants[0];

      // 🎯 Act & Assert
      expect(() => {
        entity.removeParticipant(participantToRemove.participantId, 'test-user');
      }).toThrow('Cannot remove participant: minimum 2 participants required');
    });

    it('应该根据能力查找参与者', () => {
      // 🎯 Arrange
      const capability = 'test-capability';

      // 🎯 Act
      const participantsWithCapability = entity.getParticipantsByCapability(capability);

      // ✅ Assert
      expect(Array.isArray(participantsWithCapability)).toBe(true);
      participantsWithCapability.forEach(participant => {
        expect(participant.hasCapability(capability)).toBe(true);
      });
    });
  });

  describe('状态管理', () => {
    let entity: CollabEntity;

    beforeEach(() => {
      entity = CollabTestFactory.createCollabEntity();
    });

    it('应该成功改变状态', () => {
      // 🎯 Arrange
      const newStatus = 'active';
      const updatedBy = 'test-user';

      // 🎯 Act
      entity.changeStatus(newStatus, updatedBy);

      // ✅ Assert
      expect(entity.status).toBe(newStatus);
      expect(entity.updatedBy).toBe(updatedBy);
      
      // 验证领域事件
      const events = entity.domainEvents;
      const statusEvent = events.find(e => e.type === 'CollabStatusChanged');
      expect(statusEvent).toBeDefined();
      expect(statusEvent).toHaveProperty('oldStatus', 'draft');
      expect(statusEvent).toHaveProperty('newStatus', newStatus);
    });

    it('应该检查是否可以启动', () => {
      // 🎯 Act & Assert
      expect(entity.canStart()).toBe(true); // 有2个参与者，状态为draft，策略有效
    });

    it('应该检查是否可以停止', () => {
      // 🎯 Arrange
      entity.changeStatus('active', 'test-user');

      // 🎯 Act & Assert
      expect(entity.canStop()).toBe(true);
    });

    it('应该在draft状态时不能停止', () => {
      // 🎯 Act & Assert
      expect(entity.canStop()).toBe(false); // 状态为draft
    });
  });

  describe('协调策略管理', () => {
    let entity: CollabEntity;

    beforeEach(() => {
      entity = CollabTestFactory.createCollabEntity();
    });

    it('应该成功更新协调策略', () => {
      // 🎯 Arrange
      const newStrategy = new CollabCoordinationStrategy('distributed', 'consensus');
      const updatedBy = 'test-user';

      // 🎯 Act
      entity.updateCoordinationStrategy(newStrategy, updatedBy);

      // ✅ Assert
      expect(entity.coordinationStrategy).toBe(newStrategy);
      expect(entity.updatedBy).toBe(updatedBy);
      
      // 验证领域事件
      const events = entity.domainEvents;
      const strategyEvent = events.find(e => e.type === 'CollabCoordinationStrategyChanged');
      expect(strategyEvent).toBeDefined();
      expect(strategyEvent).toHaveProperty('newStrategy', newStrategy);
    });

    it('应该验证新协调策略的有效性', () => {
      // 🎯 Arrange - 创建一个真正无效的策略（空字段）
      const invalidStrategy = new CollabCoordinationStrategy('', ''); // 空字符串应该失败

      // 🎯 Act & Assert
      expect(() => {
        entity.updateCoordinationStrategy(invalidStrategy, 'test-user');
      }).toThrow('Invalid coordination strategy configuration');
    });
  });

  describe('领域事件管理', () => {
    let entity: CollabEntity;

    beforeEach(() => {
      entity = CollabTestFactory.createCollabEntity();
    });

    it('应该清除领域事件', () => {
      // 🎯 Arrange
      expect(entity.domainEvents.length).toBeGreaterThan(0);

      // 🎯 Act
      entity.clearDomainEvents();

      // ✅ Assert
      expect(entity.domainEvents).toHaveLength(0);
    });

    it('应该在操作时生成相应的领域事件', () => {
      // 🎯 Arrange
      const initialEventCount = entity.domainEvents.length;

      // 🎯 Act
      entity.changeStatus('active', 'test-user');
      const participant = new CollabParticipant(generateUUID(), generateUUID(), generateUUID(), 'active');
      entity.addParticipant(participant, 'test-user');

      // ✅ Assert
      expect(entity.domainEvents.length).toBe(initialEventCount + 2); // StatusChanged + ParticipantAdded
    });
  });

  describe('时间戳管理', () => {
    it('应该在创建时设置时间戳', () => {
      // 🎯 Arrange
      const beforeCreate = new Date();

      // 🎯 Act
      const entity = CollabTestFactory.createCollabEntity();

      // ✅ Assert
      const afterCreate = new Date();
      expect(entity.timestamp.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime());
      expect(entity.timestamp.getTime()).toBeLessThanOrEqual(afterCreate.getTime());
    });

    it('应该在更新时更新时间戳', async () => {
      // 🎯 Arrange
      const entity = CollabTestFactory.createCollabEntity();
      const originalTimestamp = entity.timestamp;
      
      // 等待一小段时间确保时间戳不同
      await new Promise(resolve => setTimeout(resolve, 10));

      // 🎯 Act
      entity.changeStatus('active', 'test-user');

      // ✅ Assert
      expect(entity.timestamp.getTime()).toBeGreaterThan(originalTimestamp.getTime());
    });
  });
});
