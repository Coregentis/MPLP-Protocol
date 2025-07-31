/**
 * GetContextById查询处理器
 * 
 * 处理通过ID获取Context的查询
 * 
 * @version 1.0.0
 * @created 2025-09-16
 */

import { Context } from '../../domain/entities/context.entity';
import { ContextManagementService } from '../services/context-management.service';
import { GetContextByIdQuery } from './get-context-by-id.query';
import { Logger } from '../../../../public/utils/logger';

/**
 * GetContextById查询处理器
 */
export class GetContextByIdHandler {
  private readonly logger = new Logger('GetContextByIdHandler');
  
  /**
   * 构造函数
   */
  constructor(private readonly contextService: ContextManagementService) {}
  
  /**
   * 执行查询
   * @returns Context实体或null
   */
  async execute(query: GetContextByIdQuery): Promise<Context | null> {
    this.logger.debug('Executing GetContextById query', { contextId: query.contextId });
    
    try {
      // 调用应用服务获取Context
      const context = await this.contextService.getContextById(query.contextId);
      
      if (!context) {
        this.logger.debug('Context not found', { contextId: query.contextId });
        return null;
      }
      
      // TODO: 如果需要，处理includeRelations参数
      
      return context;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Error executing GetContextById query', { error, contextId: query.contextId });
      throw new Error(`Failed to get context: ${errorMessage}`);
    }
  }
} 