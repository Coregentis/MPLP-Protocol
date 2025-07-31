/**
 * Context仓库接口
 * 
 * 定义Context领域对象的仓库操作接口
 * 
 * @version 1.0.0
 * @created 2025-09-16
 */

import { UUID, EntityStatus, PaginationParams, PaginatedResult } from '../../../../public/shared/types';
import { Context } from '../entities/context.entity';
import { ContextLifecycleStage } from '../../../../public/shared/types/context-types';

/**
 * Context过滤条件
 */
export interface ContextFilter {
  name?: string;
  status?: EntityStatus;
  lifecycleStage?: ContextLifecycleStage;
  createdAfter?: Date;
  createdBefore?: Date;
  updatedAfter?: Date;
  updatedBefore?: Date;
  hasSessionId?: UUID;
  hasSharedStateId?: UUID;
  metadata?: Record<string, unknown>;
}

/**
 * Context排序选项
 */
export type ContextSortField = 'name' | 'status' | 'createdAt' | 'updatedAt';

/**
 * Context仓库接口
 */
export interface IContextRepository {
  /**
   * 通过ID查找Context
   */
  findById(id: UUID): Promise<Context | null>;
  
  /**
   * 保存Context
   */
  save(context: Context): Promise<void>;
  
  /**
   * 删除Context
   */
  delete(id: UUID): Promise<boolean>;
  
  /**
   * 通过过滤条件查找Context
   */
  findByFilter(
    filter: ContextFilter, 
    pagination: PaginationParams,
    sortField?: ContextSortField,
    sortOrder?: 'asc' | 'desc'
  ): Promise<PaginatedResult<Context>>;
  
  /**
   * 通过名称查找Context
   */
  findByName(name: string): Promise<Context[]>;
  
  /**
   * 通过状态查找Context
   */
  findByStatus(status: EntityStatus): Promise<Context[]>;
  
  /**
   * 通过生命周期阶段查找Context
   */
  findByLifecycleStage(stage: ContextLifecycleStage): Promise<Context[]>;
  
  /**
   * 检查Context是否存在
   */
  exists(id: UUID): Promise<boolean>;
  
  /**
   * 计算符合条件的Context数量
   */
  count(filter?: ContextFilter): Promise<number>;
  
  /**
   * 查找包含指定会话ID的Context
   */
  findBySessionId(sessionId: UUID): Promise<Context[]>;
  
  /**
   * 查找包含指定共享状态ID的Context
   */
  findBySharedStateId(sharedStateId: UUID): Promise<Context[]>;
} 