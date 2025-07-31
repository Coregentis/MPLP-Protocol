/**
 * Context管理服务
 * 
 * 应用层服务，实现Context的核心业务逻辑
 * 
 * @version 1.0.0
 * @created 2025-09-16
 */

import { UUID, EntityStatus, Result, PaginationParams, PaginatedResult } from '../../../../public/shared/types';
import { ContextLifecycleStage } from '../../../../public/shared/types/context-types';
import { Context } from '../../domain/entities/context.entity';
import { ContextFactory, CreateContextParams } from '../../domain/factories/context.factory';
import { IContextRepository, ContextFilter } from '../../domain/repositories/context-repository.interface';
import { ContextValidationService, ValidationError } from '../../domain/services/context-validation.service';
import { Logger } from '../../../../public/utils/logger';

/**
 * Context操作结果
 */
export interface ContextOperationResult extends Result<Context> {}

/**
 * Context管理服务
 */
export class ContextManagementService {
  private readonly logger = new Logger('ContextManagementService');
  
  constructor(
    private readonly contextRepository: IContextRepository,
    private readonly contextFactory: ContextFactory,
    private readonly validationService: ContextValidationService
  ) {}
  
  /**
   * 创建Context
   */
  async createContext(params: CreateContextParams): Promise<ContextOperationResult> {
    this.logger.info('Creating new context', { name: params.name });
    
    try {
      // 创建Context实体
      const context = this.contextFactory.createContext(params);
      
      // 验证Context
      const validationErrors = this.validationService.validateContext(context);
      if (validationErrors.length > 0) {
        this.logger.warn('Context validation failed', { errors: validationErrors });
        return {
          success: false,
          error: validationErrors
        };
      }
      
      // 保存Context
      await this.contextRepository.save(context);
      
      this.logger.info('Context created successfully', { contextId: context.contextId });
      
      return {
        success: true,
        data: context
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Failed to create context', error);
      return {
        success: false,
        error: [{ field: 'system', message: `System error: ${errorMessage}` }]
      };
    }
  }
  
  /**
   * 获取Context
   */
  async getContextById(contextId: UUID): Promise<Context | null> {
    this.logger.debug('Getting context by ID', { contextId });
    
    try {
      const context = await this.contextRepository.findById(contextId);
      
      if (!context) {
        this.logger.debug('Context not found', { contextId });
        return null;
      }
      
      return context;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Error getting context by ID', { error, contextId });
      throw new Error(`Failed to get context: ${errorMessage}`);
    }
  }
  
  /**
   * 更新Context
   */
  async updateContext(
    contextId: UUID, 
    updates: Partial<CreateContextParams>
  ): Promise<ContextOperationResult> {
    this.logger.info('Updating context', { contextId });
    
    try {
      // 获取现有Context
      const existingContext = await this.contextRepository.findById(contextId);
      
      if (!existingContext) {
        this.logger.warn('Context not found for update', { contextId });
        return {
          success: false,
          error: [{ field: 'contextId', message: 'Context not found' }]
        };
      }
      
      // 应用更新
      if (updates.name !== undefined) {
        existingContext.update(updates.name, updates.description);
      } else if (updates.description !== undefined) {
        existingContext.update(existingContext.name, updates.description);
      }
      
      if (updates.lifecycleStage !== undefined) {
        // 验证生命周期阶段转换
        const transitionError = this.validationService.validateLifecycleTransition(
          existingContext.lifecycleStage,
          updates.lifecycleStage
        );
        
        if (transitionError) {
          return {
            success: false,
            error: [transitionError]
          };
        }
        
        existingContext.updateLifecycleStage(updates.lifecycleStage);
      }
      
      if (updates.status !== undefined) {
        // 验证状态转换
        const statusTransitionError = this.validationService.validateStatusTransition(
          existingContext.status,
          updates.status
        );
        
        if (statusTransitionError) {
          return {
            success: false,
            error: [statusTransitionError]
          };
        }
        
        // 应用状态变更
        switch (updates.status) {
          case 'active':
            existingContext.activate();
            break;
          case 'suspended':
            existingContext.suspend();
            break;
          case 'deleted':
            existingContext.terminate();
            break;
          default:
            // 其他状态变更通过直接赋值处理
            existingContext.status = updates.status;
            existingContext.updatedAt = new Date();
        }
      }
      
      if (updates.configuration) {
        existingContext.updateConfiguration(updates.configuration);
      }
      
      if (updates.metadata) {
        existingContext.updateMetadata(updates.metadata);
      }
      
      // 验证更新后的Context
      const validationErrors = this.validationService.validateContext(existingContext);
      if (validationErrors.length > 0) {
        this.logger.warn('Updated context validation failed', { errors: validationErrors });
        return {
          success: false,
          error: validationErrors
        };
      }
      
      // 保存更新后的Context
      await this.contextRepository.save(existingContext);
      
      this.logger.info('Context updated successfully', { contextId });
      
      return {
        success: true,
        data: existingContext
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Failed to update context', { error, contextId });
      return {
        success: false,
        error: [{ field: 'system', message: `System error: ${errorMessage}` }]
      };
    }
  }
  
  /**
   * 删除Context
   */
  async deleteContext(contextId: UUID): Promise<ContextOperationResult> {
    this.logger.info('Deleting context', { contextId });
    
    try {
      // 获取现有Context
      const existingContext = await this.contextRepository.findById(contextId);
      
      if (!existingContext) {
        this.logger.warn('Context not found for deletion', { contextId });
        return {
          success: false,
          error: [{ field: 'contextId', message: 'Context not found' }]
        };
      }
      
      // 验证是否可以删除
      const deletionError = this.validationService.validateDeletion(existingContext);
      if (deletionError) {
        return {
          success: false,
          error: [deletionError]
        };
      }
      
      // 标记为已删除
      existingContext.terminate();
      
      // 保存更新后的Context
      await this.contextRepository.save(existingContext);
      
      this.logger.info('Context marked as deleted', { contextId });
      
      return {
        success: true,
        data: existingContext
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Failed to delete context', { error, contextId });
      return {
        success: false,
        error: [{ field: 'system', message: `System error: ${errorMessage}` }]
      };
    }
  }
  
  /**
   * 查找Context
   */
  async findContexts(
    filter: ContextFilter,
    pagination: PaginationParams
  ): Promise<PaginatedResult<Context>> {
    this.logger.debug('Finding contexts with filter', { filter, pagination });
    
    try {
      return await this.contextRepository.findByFilter(
        filter,
        pagination,
        pagination.sort_by as any,
        pagination.sort_order
      );
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Error finding contexts', error);
      throw new Error(`Failed to find contexts: ${errorMessage}`);
    }
  }
  
  /**
   * 克隆Context
   */
  async cloneContext(
    contextId: UUID,
    overrides: Partial<CreateContextParams> = {}
  ): Promise<ContextOperationResult> {
    this.logger.info('Cloning context', { contextId });
    
    try {
      // 获取源Context
      const sourceContext = await this.contextRepository.findById(contextId);
      
      if (!sourceContext) {
        this.logger.warn('Source context not found for cloning', { contextId });
        return {
          success: false,
          error: [{ field: 'contextId', message: 'Source context not found' }]
        };
      }
      
      // 克隆Context
      const clonedContext = this.contextFactory.cloneContext(sourceContext, overrides);
      
      // 验证克隆后的Context
      const validationErrors = this.validationService.validateContext(clonedContext);
      if (validationErrors.length > 0) {
        this.logger.warn('Cloned context validation failed', { errors: validationErrors });
        return {
          success: false,
          error: validationErrors
        };
      }
      
      // 保存克隆后的Context
      await this.contextRepository.save(clonedContext);
      
      this.logger.info('Context cloned successfully', { 
        sourceContextId: contextId,
        clonedContextId: clonedContext.contextId
      });
      
      return {
        success: true,
        data: clonedContext
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Failed to clone context', { error, contextId });
      return {
        success: false,
        error: [{ field: 'system', message: `System error: ${errorMessage}` }]
      };
    }
  }
} 