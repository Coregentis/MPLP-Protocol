/**
 * Context仓库实现
 * 
 * 实现领域仓库接口，提供Context的持久化操作
 * 
 * @version 1.0.0
 * @created 2025-09-16
 */

// 从具体路径导入TypeORM组件
import { Repository } from 'typeorm/repository/Repository';
import { DataSource } from 'typeorm/data-source/DataSource';
import { SelectQueryBuilder } from 'typeorm/query-builder/SelectQueryBuilder';
import { FindOptionsWhere } from 'typeorm/find-options/FindOptionsWhere';
import { DeleteResult } from 'typeorm/query-builder/result/DeleteResult';
import { UUID, EntityStatus, PaginationParams, PaginatedResult } from '../../../shared/types';
import { ContextLifecycleStage } from '../../../shared/types';
import { Context } from '../../domain/entities/context.entity';
import { IContextRepository, ContextFilter, ContextSortField } from '../../domain/repositories/context-repository.interface';
import { ContextEntity, ContextEntitySchema } from '../persistence/context.entity';
import { Logger } from '../../../utils/logger';

/**
 * Context仓库实现
 */
export class ContextRepository implements IContextRepository {
  private readonly logger = new Logger('ContextRepository');
  private repository: Repository<ContextEntity>;
  
  /**
   * 构造函数
   */
  constructor(private readonly dataSource: DataSource) {
    this.repository = dataSource.getRepository<ContextEntity>(ContextEntitySchema);
  }
  
  /**
   * 通过ID查找Context
   */
  async findById(id: UUID): Promise<Context | null> {
    this.logger.debug('Finding context by ID', { contextId: id });
    
    try {
      const where: FindOptionsWhere<ContextEntity> = { context_id: id } as FindOptionsWhere<ContextEntity>;
      
      const entity = await this.repository.findOne({
        where
      });
      
      if (!entity) {
        return null;
      }
      
      return this.mapToDomain(entity);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Error finding context by ID', { error, contextId: id });
      throw new Error(`Failed to find context: ${errorMessage}`);
    }
  }

  /**
   * 保存Context
   */
  async save(context: Context): Promise<void> {
    this.logger.debug('Saving context', { contextId: context.contextId });

    try {
      const entity = this.mapToEntity(context);
      await this.repository.save(entity);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Error saving context', { error, contextId: context.contextId });
      throw new Error(`Failed to save context: ${errorMessage}`);
    }
  }
  
  /**
   * 删除Context
   */
  async delete(id: UUID): Promise<boolean> {
    this.logger.debug('Deleting context', { contextId: id });
    
    try {
      const where: FindOptionsWhere<ContextEntity> = { context_id: id } as FindOptionsWhere<ContextEntity>;
      const result: DeleteResult = await this.repository.delete(where);
      return !!result.affected && result.affected > 0;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Error deleting context', { error, contextId: id });
      throw new Error(`Failed to delete context: ${errorMessage}`);
    }
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
    this.logger.debug('Finding contexts by filter', { filter, pagination });
    
    try {
      const queryBuilder = this.repository.createQueryBuilder('context') as SelectQueryBuilder<ContextEntity>;
      
      // 应用过滤条件
      if (filter.name) {
        queryBuilder.andWhere('context.name LIKE :name', { name: `%${filter.name}%` });
      }
      
      if (filter.status) {
        queryBuilder.andWhere('context.status = :status', { status: filter.status });
      }
      
      if (filter.lifecycleStage) {
        queryBuilder.andWhere('context.lifecycle_stage = :lifecycleStage', { 
          lifecycleStage: filter.lifecycleStage 
        });
      }
      
      if (filter.createdAfter) {
        queryBuilder.andWhere('context.created_at >= :createdAfter', { 
          createdAfter: filter.createdAfter 
        });
      }
      
      if (filter.createdBefore) {
        queryBuilder.andWhere('context.created_at <= :createdBefore', { 
          createdBefore: filter.createdBefore 
        });
      }
      
      if (filter.updatedAfter) {
        queryBuilder.andWhere('context.updated_at >= :updatedAfter', { 
          updatedAfter: filter.updatedAfter 
        });
      }
      
      if (filter.updatedBefore) {
        queryBuilder.andWhere('context.updated_at <= :updatedBefore', { 
          updatedBefore: filter.updatedBefore 
        });
      }
      
      if (filter.hasSessionId) {
        queryBuilder.andWhere("context.session_ids LIKE :sessionId", { 
          sessionId: `%${filter.hasSessionId}%` 
        });
      }
      
      if (filter.hasSharedStateId) {
        queryBuilder.andWhere("context.shared_state_ids LIKE :sharedStateId", { 
          sharedStateId: `%${filter.hasSharedStateId}%` 
        });
      }
      
      // 应用排序
      const orderField = this.mapSortFieldToColumn(sortField || 'createdAt');
      queryBuilder.orderBy(`context.${orderField}`, sortOrder?.toUpperCase() as 'ASC' | 'DESC' || 'DESC');
      
      // 应用分页
      const page = pagination.page || 1;
      const limit = pagination.limit || 10;
      const skip = (page - 1) * limit;
      
      queryBuilder.skip(skip).take(limit);
      
      // 执行查询
      const [entities, total] = await queryBuilder.getManyAndCount();
      
      // 转换为领域对象
      const items = entities.map((entity: ContextEntity) => this.mapToDomain(entity));
      
      return {
        data: items,
        items,
        total,
        page,
        limit,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Error finding contexts by filter', error);
      throw new Error(`Failed to find contexts: ${errorMessage}`);
    }
  }
  
  /**
   * 通过名称查找Context
   */
  async findByName(name: string): Promise<Context[]> {
    this.logger.debug('Finding contexts by name', { name });
    
    try {
      const where: FindOptionsWhere<ContextEntity> = { name } as FindOptionsWhere<ContextEntity>;
      
      const entities = await this.repository.find({
        where
      });
      
      return entities.map((entity: ContextEntity) => this.mapToDomain(entity));
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Error finding contexts by name', { error, name });
      throw new Error(`Failed to find contexts by name: ${errorMessage}`);
    }
  }

  /**
   * 通过状态查找Context
   */
  async findByStatus(status: EntityStatus): Promise<Context[]> {
    this.logger.debug('Finding contexts by status', { status });

    try {
      const where: FindOptionsWhere<ContextEntity> = { status } as FindOptionsWhere<ContextEntity>;

      const entities = await this.repository.find({
        where
      });

      return entities.map((entity: ContextEntity) => this.mapToDomain(entity));
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Error finding contexts by status', { error, status });
      throw new Error(`Failed to find contexts by status: ${errorMessage}`);
    }
  }
  
  /**
   * 通过生命周期阶段查找Context
   */
  async findByLifecycleStage(stage: ContextLifecycleStage): Promise<Context[]> {
    this.logger.debug('Finding contexts by lifecycle stage', { stage });
    
    try {
      const where: FindOptionsWhere<ContextEntity> = { 
        lifecycle_stage: stage 
      } as FindOptionsWhere<ContextEntity>;
      
      const entities = await this.repository.find({
        where
      });
      
      return entities.map((entity: ContextEntity) => this.mapToDomain(entity));
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Error finding contexts by lifecycle stage', { error, stage });
      throw new Error(`Failed to find contexts by lifecycle stage: ${errorMessage}`);
    }
  }

  /**
   * 检查Context是否存在
   */
  async exists(id: UUID): Promise<boolean> {
    this.logger.debug('Checking if context exists', { contextId: id });

    try {
      const where: FindOptionsWhere<ContextEntity> = {
        context_id: id
      } as FindOptionsWhere<ContextEntity>;

      const count = await this.repository.count({
        where
      });

      return count > 0;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Error checking if context exists', { error, contextId: id });
      throw new Error(`Failed to check if context exists: ${errorMessage}`);
    }
  }
  
  /**
   * 计算符合条件的Context数量
   */
  async count(filter?: ContextFilter): Promise<number> {
    this.logger.debug('Counting contexts', { filter });
    
    try {
      if (!filter) {
        return await this.repository.count();
      }
      
      const queryBuilder = this.repository.createQueryBuilder('context') as SelectQueryBuilder<ContextEntity>;
      
      // 应用过滤条件
      if (filter.name) {
        queryBuilder.andWhere('context.name LIKE :name', { name: `%${filter.name}%` });
      }
      
      if (filter.status) {
        queryBuilder.andWhere('context.status = :status', { status: filter.status });
      }
      
      if (filter.lifecycleStage) {
        queryBuilder.andWhere('context.lifecycle_stage = :lifecycleStage', { 
          lifecycleStage: filter.lifecycleStage 
        });
      }
      
      return await queryBuilder.getCount();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Error counting contexts', error);
      throw new Error(`Failed to count contexts: ${errorMessage}`);
    }
  }
  
  /**
   * 查找包含指定会话ID的Context
   */
  async findBySessionId(sessionId: UUID): Promise<Context[]> {
    this.logger.debug('Finding contexts by session ID', { sessionId });
    
    try {
      const queryBuilder = this.repository.createQueryBuilder('context') as SelectQueryBuilder<ContextEntity>;
      queryBuilder.where("context.session_ids LIKE :sessionId", { sessionId: `%${sessionId}%` });
      
      const entities = await queryBuilder.getMany();
      return entities.map((entity: ContextEntity) => this.mapToDomain(entity));
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Error finding contexts by session ID', { error, sessionId });
      throw new Error(`Failed to find contexts by session ID: ${errorMessage}`);
    }
  }

  /**
   * 查找包含指定共享状态ID的Context
   */
  async findBySharedStateId(sharedStateId: UUID): Promise<Context[]> {
    this.logger.debug('Finding contexts by shared state ID', { sharedStateId });

    try {
      const queryBuilder = this.repository.createQueryBuilder('context') as SelectQueryBuilder<ContextEntity>;
      queryBuilder.where("context.shared_state_ids LIKE :sharedStateId", {
        sharedStateId: `%${sharedStateId}%`
      });

      const entities = await queryBuilder.getMany();
      return entities.map((entity: ContextEntity) => this.mapToDomain(entity));
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Error finding contexts by shared state ID', { error, sharedStateId });
      throw new Error(`Failed to find contexts by shared state ID: ${errorMessage}`);
    }
  }
  
  /**
   * 将持久化实体映射到领域对象
   */
  private mapToDomain(entity: ContextEntity): Context {
    return new Context(
      entity.context_id,
      entity.name,
      entity.description,
      entity.lifecycle_stage,
      entity.status,
      entity.created_at,
      entity.updated_at,
      entity.session_ids || [],
      entity.shared_state_ids || [],
      entity.configuration || {},
      entity.metadata || {}
    );
  }
  
  /**
   * 将领域对象映射到持久化实体
   */
  private mapToEntity(domain: Context): ContextEntity {
    return {
      context_id: domain.contextId,
      name: domain.name,
      description: domain.description,
      lifecycle_stage: domain.lifecycleStage,
      status: domain.status,
      created_at: domain.createdAt,
      updated_at: domain.updatedAt,
      session_ids: domain.sessionIds,
      shared_state_ids: domain.sharedStateIds,
      configuration: domain.configuration,
      metadata: domain.metadata
    };
  }
  
  /**
   * 将排序字段映射到数据库列
   */
  private mapSortFieldToColumn(field: ContextSortField): string {
    const mapping: Record<ContextSortField, string> = {
      'name': 'name',
      'status': 'status',
      'createdAt': 'created_at',
      'updatedAt': 'updated_at'
    };
    
    return mapping[field] || 'created_at';
  }
} 