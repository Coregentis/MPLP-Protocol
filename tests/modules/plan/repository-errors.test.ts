import { 
  PlanRepositoryError,
  PlanCreationError,
  PlanNotFoundError,
  PlanUpdateError,
  PlanDeletionError,
  DatabaseQueryError,
  RepositoryErrorHandler,
  RepositoryErrorLogger
} from '../../../src/modules/plan/infrastructure/errors/repository-errors';
import { v4 as uuidv4 } from 'uuid';

// Mock TypeORM module
jest.mock('typeorm', () => ({
  QueryFailedError: class QueryFailedError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'QueryFailedError';
    }
  },
  EntityNotFoundError: class EntityNotFoundError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'EntityNotFoundError';
    }
  }
}));

// Import the mocked classes for testing
const { QueryFailedError: mockQueryFailedError, EntityNotFoundError: mockEntityNotFoundError } = require('typeorm');

describe('Repository Errors', () => {
  describe('PlanRepositoryError (抽象基类)', () => {
    // 创建具体实现来测试抽象类
    class TestPlanRepositoryError extends PlanRepositoryError {
      readonly code = 'TEST_ERROR';
      readonly operation = 'test';
    }

    it('应该创建基础仓储错误', () => {
      const message = 'Test repository error';
      const planId = uuidv4();
      const originalError = new Error('Original error');
      
      const error = new TestPlanRepositoryError(message, planId, originalError);

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(PlanRepositoryError);
      expect(error.message).toBe(message);
      expect(error.name).toBe('TestPlanRepositoryError');
      expect(error.planId).toBe(planId);
      expect(error.originalError).toBe(originalError);
      expect(error.code).toBe('TEST_ERROR');
      expect(error.operation).toBe('test');
    });

    it('应该支持可选参数', () => {
      const message = 'Test error';
      const error = new TestPlanRepositoryError(message);

      expect(error.message).toBe(message);
      expect(error.planId).toBeUndefined();
      expect(error.originalError).toBeUndefined();
    });
  });

  describe('PlanCreationError', () => {
    it('应该创建计划创建错误', () => {
      const message = 'Failed to create plan';
      const planId = uuidv4();
      const originalError = new Error('Database error');
      
      const error = new PlanCreationError(message, planId, originalError);

      expect(error).toBeInstanceOf(PlanRepositoryError);
      expect(error).toBeInstanceOf(PlanCreationError);
      expect(error.name).toBe('PlanCreationError');
      expect(error.code).toBe('PLAN_CREATION_FAILED');
      expect(error.operation).toBe('create');
      expect(error.message).toBe(message);
      expect(error.planId).toBe(planId);
      expect(error.originalError).toBe(originalError);
    });
  });

  describe('PlanNotFoundError', () => {
    it('应该创建计划未找到错误', () => {
      const message = 'Plan not found';
      const planId = uuidv4();
      
      const error = new PlanNotFoundError(message, planId);

      expect(error).toBeInstanceOf(PlanRepositoryError);
      expect(error).toBeInstanceOf(PlanNotFoundError);
      expect(error.name).toBe('PlanNotFoundError');
      expect(error.code).toBe('PLAN_NOT_FOUND');
      expect(error.operation).toBe('find');
      expect(error.message).toBe(message);
      expect(error.planId).toBe(planId);
    });
  });

  describe('PlanUpdateError', () => {
    it('应该创建计划更新错误', () => {
      const message = 'Failed to update plan';
      const planId = uuidv4();
      
      const error = new PlanUpdateError(message, planId);

      expect(error).toBeInstanceOf(PlanRepositoryError);
      expect(error).toBeInstanceOf(PlanUpdateError);
      expect(error.name).toBe('PlanUpdateError');
      expect(error.code).toBe('PLAN_UPDATE_FAILED');
      expect(error.operation).toBe('update');
      expect(error.message).toBe(message);
      expect(error.planId).toBe(planId);
    });
  });

  describe('PlanDeletionError', () => {
    it('应该创建计划删除错误', () => {
      const message = 'Failed to delete plan';
      const planId = uuidv4();
      
      const error = new PlanDeletionError(message, planId);

      expect(error).toBeInstanceOf(PlanRepositoryError);
      expect(error).toBeInstanceOf(PlanDeletionError);
      expect(error.name).toBe('PlanDeletionError');
      expect(error.code).toBe('PLAN_DELETION_FAILED');
      expect(error.operation).toBe('delete');
      expect(error.message).toBe(message);
      expect(error.planId).toBe(planId);
    });
  });

  describe('DatabaseQueryError', () => {
    it('应该创建数据库查询错误', () => {
      const message = 'Database query failed';
      const planId = uuidv4();
      
      const error = new DatabaseQueryError(message, planId);

      expect(error).toBeInstanceOf(PlanRepositoryError);
      expect(error).toBeInstanceOf(DatabaseQueryError);
      expect(error.name).toBe('DatabaseQueryError');
      expect(error.code).toBe('DATABASE_QUERY_FAILED');
      expect(error.operation).toBe('query');
      expect(error.message).toBe(message);
      expect(error.planId).toBe(planId);
    });
  });

  describe('RepositoryErrorHandler', () => {
    describe('handleCreateError', () => {
      it('应该处理QueryFailedError', () => {
        const planId = uuidv4();
        const originalError = new mockQueryFailedError('Constraint violation');

        expect(() => {
          RepositoryErrorHandler.handleCreateError(originalError, planId);
        }).toThrow(PlanCreationError);

        try {
          RepositoryErrorHandler.handleCreateError(originalError, planId);
        } catch (error) {
          expect(error).toBeInstanceOf(PlanCreationError);
          expect(error.message).toContain('Failed to create plan');
          expect(error.message).toContain('Constraint violation');
          expect(error.planId).toBe(planId);
          expect(error.originalError).toBe(originalError);
        }
      });

      it('应该处理普通Error', () => {
        const planId = uuidv4();
        const originalError = new Error('Generic error');

        expect(() => {
          RepositoryErrorHandler.handleCreateError(originalError, planId);
        }).toThrow(PlanCreationError);

        try {
          RepositoryErrorHandler.handleCreateError(originalError, planId);
        } catch (error) {
          expect(error).toBeInstanceOf(PlanCreationError);
          expect(error.message).toContain('Plan creation failed');
          expect(error.message).toContain('Generic error');
          expect(error.planId).toBe(planId);
          expect(error.originalError).toBe(originalError);
        }
      });

      it('应该处理未知错误', () => {
        const planId = uuidv4();
        const unknownError = 'string error';

        expect(() => {
          RepositoryErrorHandler.handleCreateError(unknownError, planId);
        }).toThrow(PlanCreationError);

        try {
          RepositoryErrorHandler.handleCreateError(unknownError, planId);
        } catch (error) {
          expect(error).toBeInstanceOf(PlanCreationError);
          expect(error.message).toBe('Unknown error during plan creation');
          expect(error.planId).toBe(planId);
          expect(error.originalError).toBeUndefined();
        }
      });
    });

    describe('handleFindError', () => {
      it('应该处理EntityNotFoundError', () => {
        const planId = uuidv4();
        const originalError = new mockEntityNotFoundError('Entity not found');

        expect(() => {
          RepositoryErrorHandler.handleFindError(originalError, planId);
        }).toThrow(PlanNotFoundError);

        try {
          RepositoryErrorHandler.handleFindError(originalError, planId);
        } catch (error) {
          expect(error).toBeInstanceOf(PlanNotFoundError);
          expect(error.message).toContain('Plan not found');
          expect(error.planId).toBe(planId);
          expect(error.originalError).toBe(originalError);
        }
      });

      it('应该处理QueryFailedError', () => {
        const planId = uuidv4();
        const originalError = new mockQueryFailedError('Query failed');

        expect(() => {
          RepositoryErrorHandler.handleFindError(originalError, planId);
        }).toThrow(DatabaseQueryError);

        try {
          RepositoryErrorHandler.handleFindError(originalError, planId);
        } catch (error) {
          expect(error).toBeInstanceOf(DatabaseQueryError);
          expect(error.message).toContain('Database query failed');
          expect(error.planId).toBe(planId);
          expect(error.originalError).toBe(originalError);
        }
      });
    });

    describe('handleUpdateError', () => {
      it('应该处理QueryFailedError', () => {
        const planId = uuidv4();
        const originalError = new mockQueryFailedError('Update failed');

        expect(() => {
          RepositoryErrorHandler.handleUpdateError(originalError, planId);
        }).toThrow(PlanUpdateError);

        try {
          RepositoryErrorHandler.handleUpdateError(originalError, planId);
        } catch (error) {
          expect(error).toBeInstanceOf(PlanUpdateError);
          expect(error.message).toContain('Failed to update plan');
          expect(error.planId).toBe(planId);
          expect(error.originalError).toBe(originalError);
        }
      });
    });

    describe('handleDeleteError', () => {
      it('应该处理QueryFailedError', () => {
        const planId = uuidv4();
        const originalError = new mockQueryFailedError('Delete failed');

        expect(() => {
          RepositoryErrorHandler.handleDeleteError(originalError, planId);
        }).toThrow(PlanDeletionError);

        try {
          RepositoryErrorHandler.handleDeleteError(originalError, planId);
        } catch (error) {
          expect(error).toBeInstanceOf(PlanDeletionError);
          expect(error.message).toContain('Failed to delete plan');
          expect(error.planId).toBe(planId);
          expect(error.originalError).toBe(originalError);
        }
      });
    });

    describe('handleQueryError', () => {
      it('应该处理通用查询错误', () => {
        const operation = 'custom_operation';
        const context = 'test_context';
        const originalError = new mockQueryFailedError('Query failed');

        expect(() => {
          RepositoryErrorHandler.handleQueryError(originalError, operation, context);
        }).toThrow(DatabaseQueryError);

        try {
          RepositoryErrorHandler.handleQueryError(originalError, operation, context);
        } catch (error) {
          expect(error).toBeInstanceOf(DatabaseQueryError);
          expect(error.message).toContain('Database query failed during custom_operation');
          expect(error.planId).toBe(context);
          expect(error.originalError).toBe(originalError);
        }
      });
    });
  });

  describe('RepositoryErrorLogger', () => {
    it('应该记录错误信息', () => {
      const mockLogger = {
        error: jest.fn()
      };

      const planId = uuidv4();
      const originalError = new Error('Original error');
      const repositoryError = new PlanNotFoundError('Plan not found', planId, originalError);

      RepositoryErrorLogger.logError(repositoryError, mockLogger);

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Repository Error [PLAN_NOT_FOUND]',
        {
          operation: 'find',
          planId: planId,
          message: 'Plan not found',
          originalError: 'Original error',
          stack: repositoryError.stack
        }
      );
    });

    it('应该处理没有原始错误的情况', () => {
      const mockLogger = {
        error: jest.fn()
      };

      const planId = uuidv4();
      const repositoryError = new PlanNotFoundError('Plan not found', planId);

      RepositoryErrorLogger.logError(repositoryError, mockLogger);

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Repository Error [PLAN_NOT_FOUND]',
        {
          operation: 'find',
          planId: planId,
          message: 'Plan not found',
          originalError: undefined,
          stack: repositoryError.stack
        }
      );
    });
  });
});
