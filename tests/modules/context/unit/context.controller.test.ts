/**
 * Context控制器单元测试
 * 
 * @description 基于实际接口的ContextController测试
 * @version 1.0.0
 * @layer 测试层 - 单元测试
 * @coverage 目标覆盖率 95%+
 */

import { ContextController } from '../../../../src/modules/context/api/controllers/context.controller';
import { ContextManagementService } from '../../../../src/modules/context/application/services/context-management.service';
import { ContextEntity } from '../../../../src/modules/context/domain/entities/context.entity';
import { CreateContextDto } from '../../../../src/modules/context/api/dto/context.dto';

describe('ContextController测试', () => {
  let controller: ContextController;
  let mockService: jest.Mocked<ContextManagementService>;

  beforeEach(() => {
    // 创建模拟的ContextManagementService
    mockService = {
      createContext: jest.fn(),
      getContextById: jest.fn(),
      getContextByName: jest.fn(),
      updateContext: jest.fn(),
      deleteContext: jest.fn(),
      getContextStatistics: jest.fn(),
      healthCheck: jest.fn(),
      createMultipleContexts: jest.fn()
    } as any;

    controller = new ContextController(mockService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createContext功能测试', () => {
    it('应该成功创建Context并返回操作结果', async () => {
      // 📋 Arrange
      const createDto: CreateContextDto = {
        name: 'Test Context',
        description: 'Test context description'
      };

      const mockEntity = new ContextEntity({
        name: 'Test Context',
        description: 'Test context description'
      });

      mockService.createContext.mockResolvedValue(mockEntity);

      // 🎬 Act
      const result = await controller.createContext(createDto);

      // ✅ Assert
      expect(result.success).toBe(true);
      expect(result.contextId).toBe(mockEntity.contextId);
      expect(result.message).toBe('Context created successfully');
      expect(mockService.createContext).toHaveBeenCalledWith(createDto);
    });

    it('应该在创建失败时返回错误结果', async () => {
      // 📋 Arrange
      const createDto: CreateContextDto = {
        name: 'Test Context'
      };

      mockService.createContext.mockRejectedValue(new Error('Creation failed'));

      // 🎬 Act
      const result = await controller.createContext(createDto);

      // ✅ Assert
      expect(result.success).toBe(false);
      expect(result.error?.message).toBe('Creation failed');
      expect(result.error?.code).toBe('CONTEXT_CREATION_FAILED');
    });
  });
});
