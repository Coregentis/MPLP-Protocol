/**
 * Collab Management Service Unit Tests
 * @description 基于源代码功能的完整单元测试，发现并修复源代码问题
 * @version 1.0.0
 */

import { CollabManagementService } from '../../../../src/modules/collab/application/services/collab-management.service';
import { CollabEntity } from '../../../../src/modules/collab/domain/entities/collab.entity';
import { ICollabRepository } from '../../../../src/modules/collab/domain/repositories/collab.repository';
import { CollabTestFactory } from '../factories/collab-test.factory';
import { CollabMapper } from '../../../../src/modules/collab/api/mappers/collab.mapper';

describe('CollabManagementService单元测试', () => {
  let service: CollabManagementService;
  let mockRepository: jest.Mocked<ICollabRepository>;

  beforeEach(() => {
    // 创建模拟仓库
    mockRepository = {
      findById: jest.fn(),
      findByIds: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      list: jest.fn(),
      search: jest.fn(),
      count: jest.fn(),
      exists: jest.fn()
    };

    service = new CollabManagementService(mockRepository);
  });

  describe('createCollaboration', () => {
    it('应该成功创建协作', async () => {
      // 🎯 Arrange
      const schemaData = CollabTestFactory.createCollabSchemaData();
      const entityData = CollabMapper.fromSchema(schemaData);
      const expectedEntity = CollabTestFactory.createCollabEntity();

      mockRepository.save.mockResolvedValue(expectedEntity);

      // 🎯 Act
      const result = await service.createCollaboration(entityData);

      // ✅ Assert
      expect(result).toBeDefined();
      expect(result.name).toBe(expectedEntity.name);
      expect(result.mode).toBe(expectedEntity.mode);
      expect(result.participants.length).toBe(expectedEntity.participants.length);
      expect(mockRepository.save).toHaveBeenCalledTimes(1);
    });

    it('应该验证必需的contextId', async () => {
      // 🎯 Arrange
      const invalidData = { name: 'Test Collab' };

      // 🎯 Act & Assert
      await expect(service.createCollaboration(invalidData))
        .rejects.toThrow('Context ID is required for collaboration creation');
    });

    it('应该验证必需的planId', async () => {
      // 🎯 Arrange
      const invalidData = { 
        contextId: 'context-123',
        name: 'Test Collab' 
      };

      // 🎯 Act & Assert
      await expect(service.createCollaboration(invalidData))
        .rejects.toThrow('Plan ID is required for collaboration creation');
    });

    it('应该验证必需的协作名称', async () => {
      // 🎯 Arrange
      const invalidData = { 
        contextId: 'context-123',
        planId: 'plan-123'
      };

      // 🎯 Act & Assert
      await expect(service.createCollaboration(invalidData))
        .rejects.toThrow('Collaboration name is required');
    });

    it('应该验证空白协作名称', async () => {
      // 🎯 Arrange
      const invalidData = { 
        contextId: 'context-123',
        planId: 'plan-123',
        name: '   '
      };

      // 🎯 Act & Assert
      await expect(service.createCollaboration(invalidData))
        .rejects.toThrow('Collaboration name is required');
    });

    it('应该验证必需的协作模式', async () => {
      // 🎯 Arrange
      const invalidData = { 
        contextId: 'context-123',
        planId: 'plan-123',
        name: 'Test Collab'
      };

      // 🎯 Act & Assert
      await expect(service.createCollaboration(invalidData))
        .rejects.toThrow('Collaboration mode is required');
    });

    it('应该验证必需的协调策略', async () => {
      // 🎯 Arrange
      const invalidData = { 
        contextId: 'context-123',
        planId: 'plan-123',
        name: 'Test Collab',
        mode: 'sequential' as const
      };

      // 🎯 Act & Assert
      await expect(service.createCollaboration(invalidData))
        .rejects.toThrow('Coordination strategy is required');
    });

    it('应该验证最少参与者数量', async () => {
      // 🎯 Arrange
      const invalidData = { 
        contextId: 'context-123',
        planId: 'plan-123',
        name: 'Test Collab',
        mode: 'sequential' as const,
        coordinationStrategy: CollabTestFactory.createCoordinationStrategyData('centralized', 'coordinator'),
        participants: [CollabTestFactory.createParticipantEntityData()]
      };

      // 🎯 Act & Assert
      await expect(service.createCollaboration(invalidData))
        .rejects.toThrow('At least 2 participants are required for collaboration');
    });
  });

  describe('getCollaboration', () => {
    it('应该成功获取协作', async () => {
      // 🎯 Arrange
      const collaborationId = 'collab-123';
      const expectedEntity = CollabTestFactory.createCollabEntity();
      mockRepository.findById.mockResolvedValue(expectedEntity);

      // 🎯 Act
      const result = await service.getCollaboration(collaborationId);

      // ✅ Assert
      expect(result).toBe(expectedEntity);
      expect(mockRepository.findById).toHaveBeenCalledWith(collaborationId);
    });

    it('应该返回null当协作不存在时', async () => {
      // 🎯 Arrange
      const collaborationId = 'nonexistent-123';
      mockRepository.findById.mockResolvedValue(null);

      // 🎯 Act
      const result = await service.getCollaboration(collaborationId);

      // ✅ Assert
      expect(result).toBeNull();
      expect(mockRepository.findById).toHaveBeenCalledWith(collaborationId);
    });

    it('应该验证必需的协作ID', async () => {
      // 🎯 Act & Assert
      await expect(service.getCollaboration(''))
        .rejects.toThrow('Collaboration ID is required');
    });
  });

  describe('updateCollaboration', () => {
    it('应该成功更新协作', async () => {
      // 🎯 Arrange
      const collaborationId = 'collab-123';
      const existingEntity = CollabTestFactory.createCollabEntity();
      const updateData = { name: 'Updated Collab Name' };
      const updatedEntity = { ...existingEntity, name: updateData.name };

      mockRepository.findById.mockResolvedValue(existingEntity);
      mockRepository.update.mockResolvedValue(updatedEntity as CollabEntity);

      // 🎯 Act
      const result = await service.updateCollaboration(collaborationId, updateData);

      // ✅ Assert
      expect(result).toBeDefined();
      expect(mockRepository.findById).toHaveBeenCalledWith(collaborationId);
      expect(mockRepository.update).toHaveBeenCalledTimes(1);
    });

    it('应该抛出错误当协作不存在时', async () => {
      // 🎯 Arrange
      const collaborationId = 'nonexistent-123';
      const updateData = { name: 'Updated Name' };
      mockRepository.findById.mockResolvedValue(null);

      // 🎯 Act & Assert
      await expect(service.updateCollaboration(collaborationId, updateData))
        .rejects.toThrow('Collaboration not found');
    });

    it('应该验证必需的协作ID', async () => {
      // 🎯 Act & Assert
      await expect(service.updateCollaboration('', {}))
        .rejects.toThrow('Collaboration ID is required');
    });
  });

  describe('deleteCollaboration', () => {
    it('应该成功删除协作', async () => {
      // 🎯 Arrange
      const collaborationId = 'collab-123';
      const existingEntity = CollabTestFactory.createCollabEntity();
      mockRepository.findById.mockResolvedValue(existingEntity);
      mockRepository.delete.mockResolvedValue(undefined);

      // 🎯 Act
      await service.deleteCollaboration(collaborationId);

      // ✅ Assert
      expect(mockRepository.findById).toHaveBeenCalledWith(collaborationId);
      expect(mockRepository.delete).toHaveBeenCalledWith(collaborationId);
    });

    it('应该抛出错误当协作不存在时', async () => {
      // 🎯 Arrange
      const collaborationId = 'nonexistent-123';
      mockRepository.findById.mockResolvedValue(null);

      // 🎯 Act & Assert
      await expect(service.deleteCollaboration(collaborationId))
        .rejects.toThrow('Collaboration not found');
    });

    it('应该验证必需的协作ID', async () => {
      // 🎯 Act & Assert
      await expect(service.deleteCollaboration(''))
        .rejects.toThrow('Collaboration ID is required');
    });
  });

  describe('listCollaborations', () => {
    it('应该成功列出协作', async () => {
      // 🎯 Arrange
      const query = { page: 1, limit: 10 };
      const expectedResult = {
        items: [CollabTestFactory.createCollabEntity()],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1
      };
      mockRepository.list.mockResolvedValue(expectedResult);

      // 🎯 Act
      const result = await service.listCollaborations(query);

      // ✅ Assert
      expect(result).toBe(expectedResult);
      expect(mockRepository.list).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        status: undefined,
        mode: undefined,
        contextId: undefined,
        planId: undefined,
        participantId: undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });
    });

    it('应该验证和修正分页参数', async () => {
      // 🎯 Arrange
      const invalidQuery = { page: -1, limit: 200 };
      const expectedResult = {
        items: [],
        total: 0,
        page: 1,
        limit: 100,
        totalPages: 0
      };
      mockRepository.list.mockResolvedValue(expectedResult);

      // 🎯 Act
      const result = await service.listCollaborations(invalidQuery);

      // ✅ Assert
      expect(mockRepository.list).toHaveBeenCalledWith({
        page: 1,        // 修正为最小值1
        limit: 100,     // 修正为最大值100
        status: undefined,
        mode: undefined,
        contextId: undefined,
        planId: undefined,
        participantId: undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });
    });
  });

  describe('startCollaboration', () => {
    it('应该成功启动协作', async () => {
      // 🎯 Arrange
      const collaborationId = 'collab-123';
      const startedBy = 'user-123';
      const existingEntity = CollabTestFactory.createCollabEntity();
      const updatedEntity = { ...existingEntity, status: 'active' };

      mockRepository.findById.mockResolvedValue(existingEntity);
      mockRepository.update.mockResolvedValue(updatedEntity as CollabEntity);

      // 🎯 Act
      const result = await service.startCollaboration(collaborationId, startedBy);

      // ✅ Assert
      expect(result).toBeDefined();
      expect(mockRepository.findById).toHaveBeenCalledWith(collaborationId);
      expect(mockRepository.update).toHaveBeenCalledTimes(1);
    });

    it('应该抛出错误当协作不存在时', async () => {
      // 🎯 Arrange
      const collaborationId = 'nonexistent-123';
      const startedBy = 'user-123';
      mockRepository.findById.mockResolvedValue(null);

      // 🎯 Act & Assert
      await expect(service.startCollaboration(collaborationId, startedBy))
        .rejects.toThrow('Collaboration not found');
    });
  });

  describe('stopCollaboration', () => {
    it('应该成功停止协作', async () => {
      // 🎯 Arrange
      const collaborationId = 'collab-123';
      const stoppedBy = 'user-123';
      const reason = 'Task completed';
      const existingEntity = CollabTestFactory.createCollabEntity();

      // 先启动协作，使其状态变为'active'
      existingEntity.changeStatus('active', 'user-123');

      const updatedEntity = { ...existingEntity, status: 'stopped' };

      mockRepository.findById.mockResolvedValue(existingEntity);
      mockRepository.update.mockResolvedValue(updatedEntity as CollabEntity);

      // 🎯 Act
      const result = await service.stopCollaboration(collaborationId, stoppedBy, reason);

      // ✅ Assert
      expect(result).toBeDefined();
      expect(mockRepository.findById).toHaveBeenCalledWith(collaborationId);
      expect(mockRepository.update).toHaveBeenCalledTimes(1);
    });

    it('应该抛出错误当协作不存在时', async () => {
      // 🎯 Arrange
      const collaborationId = 'nonexistent-123';
      const stoppedBy = 'user-123';
      mockRepository.findById.mockResolvedValue(null);

      // 🎯 Act & Assert
      await expect(service.stopCollaboration(collaborationId, stoppedBy))
        .rejects.toThrow('Collaboration not found');
    });
  });
});
