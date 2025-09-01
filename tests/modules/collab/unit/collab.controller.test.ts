/**
 * Collab Controller Unit Tests
 * @description 基于源代码功能的API控制器测试，验证HTTP请求处理
 * @version 1.0.0
 */

import { Request, Response } from 'express';
import { CollabController } from '../../../../src/modules/collab/api/controllers/collab.controller';
import { CollabManagementService } from '../../../../src/modules/collab/application/services/collab-management.service';
import { CollabMapper } from '../../../../src/modules/collab/api/mappers/collab.mapper';
import { CollabTestFactory } from '../factories/collab-test.factory';
import { generateUUID } from '../../../../src/shared/utils';

// Mock CollabMapper
jest.mock('../../../../src/modules/collab/api/mappers/collab.mapper');
const MockedCollabMapper = CollabMapper as jest.Mocked<typeof CollabMapper>;

describe('CollabController单元测试', () => {
  let controller: CollabController;
  let mockCollabManagementService: jest.Mocked<CollabManagementService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    // 创建模拟服务
    mockCollabManagementService = {
      createCollaboration: jest.fn(),
      getCollaboration: jest.fn(),
      updateCollaboration: jest.fn(),
      deleteCollaboration: jest.fn(),
      listCollaborations: jest.fn(),
      startCollaboration: jest.fn(),
      stopCollaboration: jest.fn()
    } as any;

    controller = new CollabController(mockCollabManagementService);

    // 创建模拟请求和响应
    mockRequest = {
      body: {},
      params: {},
      query: {}
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };

    // 重置所有模拟
    jest.clearAllMocks();
  });

  describe('createCollaboration', () => {
    it('应该成功创建协作', async () => {
      // 🎯 Arrange
      const createDTO = {
        name: 'Test Collaboration',
        description: 'Test description',
        mode: 'sequential' as const,
        contextId: generateUUID(),
        planId: generateUUID()
      };
      const entity = CollabTestFactory.createCollabEntity();
      const responseDTO = {
        collaborationId: entity.id,
        name: entity.name,
        mode: entity.mode,
        status: entity.status
      };

      mockRequest.body = createDTO;
      MockedCollabMapper.fromCreateDTO.mockReturnValue(entity as any);
      MockedCollabMapper.toResponseDTO.mockReturnValue(responseDTO as any);
      mockCollabManagementService.createCollaboration.mockResolvedValue(entity);

      // 🎯 Act
      await controller.createCollaboration(mockRequest as Request, mockResponse as Response);

      // ✅ Assert
      expect(MockedCollabMapper.fromCreateDTO).toHaveBeenCalledWith(createDTO);
      expect(mockCollabManagementService.createCollaboration).toHaveBeenCalledWith(entity);
      expect(MockedCollabMapper.toResponseDTO).toHaveBeenCalledWith(entity);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: responseDTO
      });
    });

    it('应该处理创建失败的情况', async () => {
      // 🎯 Arrange
      const createDTO = { name: 'Test Collaboration' };
      const error = new Error('Creation failed');

      mockRequest.body = createDTO;
      MockedCollabMapper.fromCreateDTO.mockReturnValue({} as any);
      mockCollabManagementService.createCollaboration.mockRejectedValue(error);

      // 🎯 Act
      await controller.createCollaboration(mockRequest as Request, mockResponse as Response);

      // ✅ Assert
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'CREATION_FAILED',
          message: 'Creation failed'
        }
      });
    });

    it('应该处理未知错误', async () => {
      // 🎯 Arrange
      const createDTO = { name: 'Test Collaboration' };
      mockRequest.body = createDTO;
      MockedCollabMapper.fromCreateDTO.mockReturnValue({} as any);
      mockCollabManagementService.createCollaboration.mockRejectedValue('Unknown error');

      // 🎯 Act
      await controller.createCollaboration(mockRequest as Request, mockResponse as Response);

      // ✅ Assert
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'CREATION_FAILED',
          message: 'Failed to create collaboration'
        }
      });
    });
  });

  describe('getCollaboration', () => {
    it('应该成功获取协作', async () => {
      // 🎯 Arrange
      const collaborationId = generateUUID();
      const entity = CollabTestFactory.createCollabEntity();
      const responseDTO = {
        collaborationId: entity.id,
        name: entity.name,
        mode: entity.mode,
        status: entity.status
      };

      mockRequest.params = { id: collaborationId };
      mockCollabManagementService.getCollaboration.mockResolvedValue(entity);
      MockedCollabMapper.toResponseDTO.mockReturnValue(responseDTO as any);

      // 🎯 Act
      await controller.getCollaboration(mockRequest as Request, mockResponse as Response);

      // ✅ Assert
      expect(mockCollabManagementService.getCollaboration).toHaveBeenCalledWith(collaborationId);
      expect(MockedCollabMapper.toResponseDTO).toHaveBeenCalledWith(entity);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: responseDTO
      });
    });

    it('应该处理协作不存在的情况', async () => {
      // 🎯 Arrange
      const collaborationId = generateUUID();
      mockRequest.params = { id: collaborationId };
      mockCollabManagementService.getCollaboration.mockResolvedValue(null);

      // 🎯 Act
      await controller.getCollaboration(mockRequest as Request, mockResponse as Response);

      // ✅ Assert
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Collaboration not found'
        }
      });
    });

    it('应该处理获取失败的情况', async () => {
      // 🎯 Arrange
      const collaborationId = generateUUID();
      const error = new Error('Database error');
      mockRequest.params = { id: collaborationId };
      mockCollabManagementService.getCollaboration.mockRejectedValue(error);

      // 🎯 Act
      await controller.getCollaboration(mockRequest as Request, mockResponse as Response);

      // ✅ Assert
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'RETRIEVAL_FAILED',
          message: 'Database error'
        }
      });
    });
  });

  describe('updateCollaboration', () => {
    it('应该成功更新协作', async () => {
      // 🎯 Arrange
      const collaborationId = generateUUID();
      const updateDTO = { name: 'Updated Collaboration' };
      const entity = CollabTestFactory.createCollabEntity();
      const responseDTO = {
        collaborationId: entity.id,
        name: 'Updated Collaboration',
        mode: entity.mode,
        status: entity.status
      };

      mockRequest.params = { id: collaborationId };
      mockRequest.body = updateDTO;
      MockedCollabMapper.fromUpdateDTO.mockReturnValue(updateDTO as any);
      mockCollabManagementService.updateCollaboration.mockResolvedValue(entity);
      MockedCollabMapper.toResponseDTO.mockReturnValue(responseDTO as any);

      // 🎯 Act
      await controller.updateCollaboration(mockRequest as Request, mockResponse as Response);

      // ✅ Assert
      expect(MockedCollabMapper.fromUpdateDTO).toHaveBeenCalledWith(updateDTO);
      expect(mockCollabManagementService.updateCollaboration).toHaveBeenCalledWith(collaborationId, updateDTO);
      expect(MockedCollabMapper.toResponseDTO).toHaveBeenCalledWith(entity);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: responseDTO
      });
    });

    it('应该处理更新失败的情况', async () => {
      // 🎯 Arrange
      const collaborationId = generateUUID();
      const updateDTO = { name: 'Updated Collaboration' };
      const error = new Error('Update failed');

      mockRequest.params = { id: collaborationId };
      mockRequest.body = updateDTO;
      MockedCollabMapper.fromUpdateDTO.mockReturnValue(updateDTO as any);
      mockCollabManagementService.updateCollaboration.mockRejectedValue(error);

      // 🎯 Act
      await controller.updateCollaboration(mockRequest as Request, mockResponse as Response);

      // ✅ Assert
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'UPDATE_FAILED',
          message: 'Update failed'
        }
      });
    });
  });

  describe('deleteCollaboration', () => {
    it('应该成功删除协作', async () => {
      // 🎯 Arrange
      const collaborationId = generateUUID();
      mockRequest.params = { id: collaborationId };
      mockCollabManagementService.deleteCollaboration.mockResolvedValue(undefined);

      // 🎯 Act
      await controller.deleteCollaboration(mockRequest as Request, mockResponse as Response);

      // ✅ Assert
      expect(mockCollabManagementService.deleteCollaboration).toHaveBeenCalledWith(collaborationId);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true
      });
    });

    it('应该处理删除失败的情况', async () => {
      // 🎯 Arrange
      const collaborationId = generateUUID();
      const error = new Error('Delete failed');
      mockRequest.params = { id: collaborationId };
      mockCollabManagementService.deleteCollaboration.mockRejectedValue(error);

      // 🎯 Act
      await controller.deleteCollaboration(mockRequest as Request, mockResponse as Response);

      // ✅ Assert
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'DELETE_FAILED',
          message: 'Delete failed'
        }
      });
    });
  });

  describe('listCollaborations', () => {
    it('应该成功列出协作', async () => {
      // 🎯 Arrange
      const entities = [CollabTestFactory.createCollabEntity()];
      const listResult = {
        items: entities,
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1
        }
      };
      const responseDTOs = entities.map(entity => ({
        collaborationId: entity.id,
        name: entity.name,
        mode: entity.mode,
        status: entity.status
      }));

      mockRequest.query = { page: '1', limit: '10' };
      mockCollabManagementService.listCollaborations.mockResolvedValue(listResult as any);
      MockedCollabMapper.toResponseDTO.mockReturnValue(responseDTOs[0] as any);

      // 🎯 Act
      await controller.listCollaborations(mockRequest as Request, mockResponse as Response);

      // ✅ Assert
      expect(mockCollabManagementService.listCollaborations).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        status: undefined
      });
      expect(MockedCollabMapper.toResponseDTO).toHaveBeenCalledWith(entities[0]);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: {
          items: responseDTOs,
          pagination: listResult.pagination
        }
      });
    });

    it('应该处理查询参数', async () => {
      // 🎯 Arrange
      const listResult = {
        items: [],
        pagination: { page: 2, limit: 5, total: 0, totalPages: 0 }
      };

      mockRequest.query = {
        page: '2',
        limit: '5',
        status: 'active',
        mode: 'parallel',
        sortBy: 'name',
        sortOrder: 'asc'
      };
      mockCollabManagementService.listCollaborations.mockResolvedValue(listResult as any);
      // 不需要mock toResponseDTO，因为没有items

      // 🎯 Act
      await controller.listCollaborations(mockRequest as Request, mockResponse as Response);

      // ✅ Assert
      expect(mockCollabManagementService.listCollaborations).toHaveBeenCalledWith({
        page: 2,
        limit: 5,
        status: 'active'
      });
    });

    it('应该处理列表失败的情况', async () => {
      // 🎯 Arrange
      const error = new Error('List failed');
      mockRequest.query = {};
      mockCollabManagementService.listCollaborations.mockRejectedValue(error);

      // 🎯 Act
      await controller.listCollaborations(mockRequest as Request, mockResponse as Response);

      // ✅ Assert
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'LIST_FAILED',
          message: 'List failed'
        }
      });
    });
  });
});
