/**
 * Mock Context Repository
 * 
 * 用于测试的Context仓库模拟实现
 * 
 * @version 1.0.0
 * @created 2025-08-07
 */

import { UUID, PaginationParams, PaginatedResult } from '../../../../src/public/shared/types';
import { Context } from '../../../../src/modules/context/domain/entities/context.entity';
import { IContextRepository, ContextFilter, ContextSortField } from '../../../../src/modules/context/domain/repositories/context-repository.interface';

/**
 * Mock Context Repository
 */
export class MockContextRepository implements IContextRepository {
  private contexts: Map<UUID, Context> = new Map();

  /**
   * 通过ID查找Context
   */
  async findById(id: UUID): Promise<Context | null> {
    return this.contexts.get(id) || null;
  }

  /**
   * 保存Context
   */
  async save(context: Context): Promise<void> {
    this.contexts.set(context.contextId, context);
  }

  /**
   * 删除Context
   */
  async delete(id: UUID): Promise<boolean> {
    return this.contexts.delete(id);
  }

  /**
   * 通过过滤条件查找Context
   */
  async findByFilter(
    filter: ContextFilter,
    pagination: PaginationParams,
    sortField?: ContextSortField,
    sortOrder?: 'asc' | 'desc'
  ): Promise<PaginatedResult<Context>> {
    let results = Array.from(this.contexts.values());

    // 应用过滤条件
    if (filter.name) {
      results = results.filter(context => context.name.includes(filter.name!));
    }

    if (filter.status) {
      results = results.filter(context => context.status === filter.status);
    }

    if (filter.lifecycleStage) {
      results = results.filter(context => context.lifecycleStage === filter.lifecycleStage);
    }

    // 应用排序
    if (sortField) {
      results.sort((a, b) => {
        let aValue: any;
        let bValue: any;

        switch (sortField) {
          case 'name':
            aValue = a.name;
            bValue = b.name;
            break;
          case 'status':
            aValue = a.status;
            bValue = b.status;
            break;
          case 'createdAt':
            aValue = a.createdAt;
            bValue = b.createdAt;
            break;
          case 'updatedAt':
            aValue = a.updatedAt;
            bValue = b.updatedAt;
            break;
          default:
            return 0;
        }

        if (sortOrder === 'desc') {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        } else {
          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        }
      });
    }

    // 应用分页
    const page = pagination.page || 1;
    const limit = pagination.limit || 10;
    const offset = (page - 1) * limit;
    const paginatedResults = results.slice(offset, offset + limit);

    const totalPages = Math.ceil(results.length / limit);

    return {
      data: paginatedResults,
      items: paginatedResults, // 兼容性别名
      total: results.length,
      page,
      limit,
      pagination: {
        page,
        limit,
        total: results.length,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
  }

  /**
   * 检查Context是否存在
   */
  async exists(id: UUID): Promise<boolean> {
    return this.contexts.has(id);
  }

  /**
   * 获取Context总数
   */
  async count(filter?: ContextFilter): Promise<number> {
    if (!filter) {
      return this.contexts.size;
    }

    let results = Array.from(this.contexts.values());

    if (filter.name) {
      results = results.filter(context => context.name.includes(filter.name!));
    }

    if (filter.status) {
      results = results.filter(context => context.status === filter.status);
    }

    if (filter.lifecycleStage) {
      results = results.filter(context => context.lifecycleStage === filter.lifecycleStage);
    }

    return results.length;
  }

  /**
   * 通过名称查找Context
   */
  async findByName(name: string): Promise<Context[]> {
    return Array.from(this.contexts.values()).filter(context => context.name === name);
  }

  /**
   * 通过状态查找Context
   */
  async findByStatus(status: string): Promise<Context[]> {
    return Array.from(this.contexts.values()).filter(context => context.status === status);
  }

  /**
   * 通过生命周期阶段查找Context
   */
  async findByLifecycleStage(stage: string): Promise<Context[]> {
    return Array.from(this.contexts.values()).filter(context => context.lifecycleStage === stage);
  }

  /**
   * 通过会话ID查找Context
   */
  async findBySessionId(sessionId: UUID): Promise<Context[]> {
    return Array.from(this.contexts.values()).filter(context => 
      context.sessionIds.includes(sessionId)
    );
  }

  /**
   * 通过共享状态ID查找Context
   */
  async findBySharedStateId(sharedStateId: UUID): Promise<Context[]> {
    return Array.from(this.contexts.values()).filter(context => 
      context.sharedStateIds.includes(sharedStateId)
    );
  }

  /**
   * 清空所有数据（仅用于测试）
   */
  clear(): void {
    this.contexts.clear();
  }

  /**
   * 获取所有Context（仅用于测试）
   */
  getAll(): Context[] {
    return Array.from(this.contexts.values());
  }
}
