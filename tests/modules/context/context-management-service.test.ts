/**
 * ContextManagementService单元测试
 * 
 * 基于实际实现的严格测试，确保85%+覆盖率
 * 遵循协议级测试标准：TypeScript严格模式，零any类型，ESLint零警告
 * 
 * @version 1.0.0
 * @created 2025-08-07
 */

import { ContextManagementService } from '../../../src/modules/context/application/services/context-management.service';
import { Context } from '../../../src/modules/context/domain/entities/context.entity';
import { ContextFactory, CreateContextParams } from '../../../src/modules/context/domain/factories/context.factory';
import { IContextRepository } from '../../../src/modules/context/domain/repositories/context-repository.interface';
import { ContextValidationService, ValidationError } from '../../../src/modules/context/domain/services/context-validation.service';
import { SharedStateManagementService } from '../../../src/modules/context/application/services/shared-state-management.service';
import { AccessControlManagementService } from '../../../src/modules/context/application/services/access-control-management.service';
import { UUID, EntityStatus } from '../../../src/public/shared/types';
import { ContextLifecycleStage } from '../../../src/public/shared/types/context-types';

describe('ContextManagementService', () => {
  let contextManagementService: ContextManagementService;
  let mockContextRepository: jest.Mocked<IContextRepository>;
  let mockContextFactory: jest.Mocked<ContextFactory>;
  let mockValidationService: jest.Mocked<ContextValidationService>;
  let mockSharedStateService: jest.Mocked<SharedStateManagementService>;
  let mockAccessControlService: jest.Mocked<AccessControlManagementService>;

  const mockContextId = 'test-context-id' as UUID;
  const mockCreateParams: CreateContextParams = {
    name: 'Test Context',
    description: 'Test description',
    lifecycleStage: ContextLifecycleStage.ACTIVE,
    metadata: { test: 'value' }
  };

  beforeEach(() => {
    // 创建所有依赖的mock
    mockContextRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByFilter: jest.fn(),
      delete: jest.fn(),
      exists: jest.fn()
    } as unknown as jest.Mocked<IContextRepository>;

    mockContextFactory = {
      createContext: jest.fn(),
      cloneContext: jest.fn()
    } as unknown as jest.Mocked<ContextFactory>;

    mockValidationService = {
      validateContext: jest.fn(),
      validateDeletion: jest.fn(),
      validateStatusTransition: jest.fn(),
      validateLifecycleTransition: jest.fn(),
      validateName: jest.fn(),
      validateDescription: jest.fn(),
      validateLifecycleStage: jest.fn(),
      validateStatus: jest.fn()
    } as unknown as jest.Mocked<ContextValidationService>;

    mockSharedStateService = {
      updateSharedState: jest.fn(),
      getSharedVariable: jest.fn(),
      setSharedVariable: jest.fn()
    } as unknown as jest.Mocked<SharedStateManagementService>;

    mockAccessControlService = {
      updateAccessControl: jest.fn(),
      checkPermission: jest.fn(),
      grantPermission: jest.fn(),
      revokePermission: jest.fn()
    } as unknown as jest.Mocked<AccessControlManagementService>;

    // 创建服务实例
    contextManagementService = new ContextManagementService(
      mockContextRepository,
      mockContextFactory,
      mockValidationService,
      mockSharedStateService,
      mockAccessControlService
    );
  });

  describe('createContext', () => {
    let mockContext: Context;

    beforeEach(() => {
      mockContext = new Context(
        mockContextId,
        mockCreateParams.name,
        mockCreateParams.description || null,
        mockCreateParams.lifecycleStage,
        EntityStatus.ACTIVE,
        new Date(),
        new Date(),
        [],
        [],
        mockCreateParams.metadata || {},
        {}
      );
    });

    it('should create context successfully', async () => {
      // Arrange
      mockContextFactory.createContext.mockReturnValue(mockContext);
      mockValidationService.validateContext.mockReturnValue([]);
      mockContextRepository.save.mockResolvedValue(undefined);

      // Act
      const result = await contextManagementService.createContext(mockCreateParams);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toBe(mockContext);
      expect(mockContextFactory.createContext).toHaveBeenCalledWith(mockCreateParams);
      expect(mockValidationService.validateContext).toHaveBeenCalledWith(mockContext);
      expect(mockContextRepository.save).toHaveBeenCalledWith(mockContext);
    });

    it('should return validation errors when context is invalid', async () => {
      // Arrange
      const validationErrors: ValidationError[] = [
        { field: 'name', message: 'Name is required' }
      ];
      mockContextFactory.createContext.mockReturnValue(mockContext);
      mockValidationService.validateContext.mockReturnValue(validationErrors);

      // Act
      const result = await contextManagementService.createContext(mockCreateParams);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toEqual(validationErrors);
      expect(mockContextRepository.save).not.toHaveBeenCalled();
    });

    it('should handle repository save errors', async () => {
      // Arrange
      const saveError = new Error('Database connection failed');
      mockContextFactory.createContext.mockReturnValue(mockContext);
      mockValidationService.validateContext.mockReturnValue([]);
      mockContextRepository.save.mockRejectedValue(saveError);

      // Act
      const result = await contextManagementService.createContext(mockCreateParams);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toEqual([{
        field: 'system',
        message: 'System error: Database connection failed'
      }]);
    });
  });

  describe('getContextById', () => {
    it('should return context when found', async () => {
      // Arrange
      const mockContext = new Context(
        mockContextId,
        'Test Context',
        null,
        ContextLifecycleStage.ACTIVE,
        EntityStatus.ACTIVE,
        new Date(),
        new Date(),
        [],
        [],
        {},
        {}
      );
      mockContextRepository.findById.mockResolvedValue(mockContext);

      // Act
      const result = await contextManagementService.getContextById(mockContextId);

      // Assert
      expect(result).toBe(mockContext);
      expect(mockContextRepository.findById).toHaveBeenCalledWith(mockContextId);
    });

    it('should return null when context not found', async () => {
      // Arrange
      mockContextRepository.findById.mockResolvedValue(null);

      // Act
      const result = await contextManagementService.getContextById(mockContextId);

      // Assert
      expect(result).toBeNull();
      expect(mockContextRepository.findById).toHaveBeenCalledWith(mockContextId);
    });

    it('should throw error when repository fails', async () => {
      // Arrange
      const repositoryError = new Error('Database error');
      mockContextRepository.findById.mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(contextManagementService.getContextById(mockContextId))
        .rejects.toThrow('Failed to get context: Database error');
    });

    it('should handle unknown error types', async () => {
      // Arrange
      mockContextRepository.findById.mockRejectedValue('Unknown error');

      // Act & Assert
      await expect(contextManagementService.getContextById(mockContextId))
        .rejects.toThrow('Failed to get context: Unknown error');
    });
  });

  describe('deleteContext', () => {
    let existingContext: Context;

    beforeEach(() => {
      existingContext = new Context(
        mockContextId,
        'Test Context',
        null,
        ContextLifecycleStage.ACTIVE,
        EntityStatus.ACTIVE,
        new Date(),
        new Date(),
        [],
        [],
        {},
        {}
      );
    });

    it('should delete context successfully', async () => {
      // Arrange
      mockContextRepository.findById.mockResolvedValue(existingContext);
      mockValidationService.validateDeletion.mockReturnValue(null);
      mockContextRepository.save.mockResolvedValue(undefined);
      const terminateSpy = jest.spyOn(existingContext, 'terminate');

      // Act
      const result = await contextManagementService.deleteContext(mockContextId);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toBe(existingContext);
      expect(terminateSpy).toHaveBeenCalled();
      expect(mockContextRepository.save).toHaveBeenCalledWith(existingContext);
    });

    it('should return error when context not found', async () => {
      // Arrange
      mockContextRepository.findById.mockResolvedValue(null);

      // Act
      const result = await contextManagementService.deleteContext(mockContextId);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toEqual([{
        field: 'contextId',
        message: 'Context not found'
      }]);
    });

    it('should return validation error when deletion is not allowed', async () => {
      // Arrange
      const deletionError: ValidationError = {
        field: 'status',
        message: 'Context cannot be deleted'
      };
      mockContextRepository.findById.mockResolvedValue(existingContext);
      mockValidationService.validateDeletion.mockReturnValue(deletionError);

      // Act
      const result = await contextManagementService.deleteContext(mockContextId);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toEqual([deletionError]);
    });
  });
