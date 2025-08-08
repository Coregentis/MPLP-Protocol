/**
 * Plan Repository 错误处理
 * 
 * 定义专门的错误类型和处理策略，避免使用any类型
 * 
 * @version v1.0.0
 * @created 2025-08-06
 */

const { QueryFailedError, EntityNotFoundError } = require('typeorm');

/**
 * 计划仓储基础错误
 */
export abstract class PlanRepositoryError extends Error {
  abstract readonly code: string;
  abstract readonly operation: string;
  
  constructor(
    message: string,
    public readonly planId?: string,
    public readonly originalError?: Error
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

/**
 * 计划创建错误
 */
export class PlanCreationError extends PlanRepositoryError {
  readonly code = 'PLAN_CREATION_FAILED';
  readonly operation = 'create';
}

/**
 * 计划查找错误
 */
export class PlanNotFoundError extends PlanRepositoryError {
  readonly code = 'PLAN_NOT_FOUND';
  readonly operation = 'find';
}

/**
 * 计划更新错误
 */
export class PlanUpdateError extends PlanRepositoryError {
  readonly code = 'PLAN_UPDATE_FAILED';
  readonly operation = 'update';
}

/**
 * 计划删除错误
 */
export class PlanDeletionError extends PlanRepositoryError {
  readonly code = 'PLAN_DELETION_FAILED';
  readonly operation = 'delete';
}

/**
 * 数据库查询错误
 */
export class DatabaseQueryError extends PlanRepositoryError {
  readonly code = 'DATABASE_QUERY_FAILED';
  readonly operation = 'query';
}

/**
 * 错误处理器 - 将未知错误转换为明确的错误类型
 */
export class RepositoryErrorHandler {
  /**
   * 处理创建操作错误
   */
  static handleCreateError(error: unknown, planId?: string): never {
    if (error instanceof QueryFailedError) {
      throw new PlanCreationError(
        `Failed to create plan: ${(error as Error).message}`,
        planId,
        error as Error
      );
    }
    
    if (error instanceof Error) {
      throw new PlanCreationError(
        `Plan creation failed: ${error.message}`,
        planId,
        error
      );
    }
    
    throw new PlanCreationError(
      'Unknown error during plan creation',
      planId
    );
  }

  /**
   * 处理查找操作错误
   */
  static handleFindError(error: unknown, planId?: string): never {
    if (error instanceof EntityNotFoundError) {
      throw new PlanNotFoundError(
        `Plan not found: ${planId}`,
        planId,
        error as Error
      );
    }
    
    if (error instanceof QueryFailedError) {
      throw new DatabaseQueryError(
        `Database query failed: ${(error as Error).message}`,
        planId,
        error as Error
      );
    }
    
    if (error instanceof Error) {
      throw new DatabaseQueryError(
        `Find operation failed: ${error.message}`,
        planId,
        error
      );
    }
    
    throw new DatabaseQueryError(
      'Unknown error during find operation',
      planId
    );
  }

  /**
   * 处理更新操作错误
   */
  static handleUpdateError(error: unknown, planId?: string): never {
    if (error instanceof QueryFailedError) {
      throw new PlanUpdateError(
        `Failed to update plan: ${(error as Error).message}`,
        planId,
        error as Error
      );
    }
    
    if (error instanceof Error) {
      throw new PlanUpdateError(
        `Plan update failed: ${error.message}`,
        planId,
        error
      );
    }
    
    throw new PlanUpdateError(
      'Unknown error during plan update',
      planId
    );
  }

  /**
   * 处理删除操作错误
   */
  static handleDeleteError(error: unknown, planId?: string): never {
    if (error instanceof QueryFailedError) {
      throw new PlanDeletionError(
        `Failed to delete plan: ${(error as Error).message}`,
        planId,
        error as Error
      );
    }
    
    if (error instanceof Error) {
      throw new PlanDeletionError(
        `Plan deletion failed: ${error.message}`,
        planId,
        error
      );
    }
    
    throw new PlanDeletionError(
      'Unknown error during plan deletion',
      planId
    );
  }

  /**
   * 处理通用查询错误
   */
  static handleQueryError(error: unknown, operation: string, context?: string): never {
    if (error instanceof QueryFailedError) {
      throw new DatabaseQueryError(
        `Database query failed during ${operation}: ${(error as Error).message}`,
        context,
        error as Error
      );
    }
    
    if (error instanceof Error) {
      throw new DatabaseQueryError(
        `${operation} failed: ${error.message}`,
        context,
        error
      );
    }
    
    throw new DatabaseQueryError(
      `Unknown error during ${operation}`,
      context
    );
  }
}

/**
 * 错误日志记录器
 */
export class RepositoryErrorLogger {
  static logError(error: PlanRepositoryError, logger: { error: (message: string, meta?: unknown) => void }): void {
    logger.error(`Repository Error [${error.code}]`, {
      operation: error.operation,
      planId: error.planId,
      message: error.message,
      originalError: error.originalError?.message,
      stack: error.stack
    });
  }
}
