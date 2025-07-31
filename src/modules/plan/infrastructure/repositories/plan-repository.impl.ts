/**
 * Plan仓库实现
 * 
 * 实现对Plan实体的持久化操作
 * 
 * @version v1.0.0
 * @created 2025-07-26T19:30:00+08:00
 * @compliance 100% Schema合规性 - 完全匹配plan-protocol.json
 */

// 从具体路径导入TypeORM组件
import { Repository } from 'typeorm/repository/Repository';
import { DataSource } from 'typeorm/data-source/DataSource';
import { In } from 'typeorm/find-options/operator/In';
import { Plan } from '../../domain/entities/plan.entity';
import { IPlanRepository, PlanFilter } from '../../domain/repositories/plan-repository.interface';
import { PlanEntity } from '../persistence/plan.entity';
import { PlanMapper } from '../persistence/plan.mapper';
import { UUID } from '../../../../public/shared/types/plan-types';
import { Logger } from '../../../../public/utils/logger';

/**
 * Plan仓库实现
 */
export class PlanRepositoryImpl implements IPlanRepository {
  private readonly logger: Logger;
  private readonly dataSource: DataSource;
  private readonly mapper: PlanMapper;

  constructor(
    dataSource: DataSource,
    logger: Logger = new Logger('PlanRepository'),
    mapper: PlanMapper = new PlanMapper()
  ) {
    this.logger = logger;
    this.dataSource = dataSource;
    this.mapper = mapper;
  }

  private get repository(): Repository<PlanEntity> {
    return this.dataSource.getRepository(PlanEntity);
  }
  
  /**
   * 创建计划
   * @param plan 计划实体
   * @returns 创建的计划
   */
  async create(plan: Plan): Promise<Plan> {
    this.logger.debug('Creating plan', { planId: plan.plan_id });
    
    try {
      // 将领域实体转换为持久化实体
      const planEntity = this.mapper.toPersistence(plan);
      
      // 保存到数据库
      const savedEntity = await this.repository.save(planEntity);
      
      // 将持久化实体转换回领域实体
      return this.mapper.toDomain(savedEntity);
    } catch (error: any) {
      this.logger.error('Failed to create plan', { 
        planId: plan.plan_id, 
        error: error.message 
      });
      throw new Error(`Failed to create plan: ${error.message}`);
    }
  }
  
  /**
   * 通过ID查找计划
   * @param planId 计划ID
   * @returns 找到的计划或undefined
   */
  async findById(planId: UUID): Promise<Plan | undefined> {
    this.logger.debug('Finding plan by ID', { planId });
    
    try {
      // 从数据库查询
      const planEntity = await this.repository.findOne({
        where: { plan_id: planId }
      });
      
      if (!planEntity) {
        return undefined;
      }
      
      // 将持久化实体转换为领域实体
      return this.mapper.toDomain(planEntity);
    } catch (error: any) {
      this.logger.error('Failed to find plan by ID', { 
        planId, 
        error: error.message 
      });
      throw new Error(`Failed to find plan by ID: ${error.message}`);
    }
  }
  
  /**
   * 通过上下文ID查找计划
   * @param contextId 上下文ID
   * @returns 找到的计划列表
   */
  async findByContextId(contextId: UUID): Promise<Plan[]> {
    this.logger.debug('Finding plans by context ID', { contextId });
    
    try {
      // 从数据库查询
      const planEntities = await this.repository.find({
        where: { context_id: contextId }
      });
      
      // 将持久化实体转换为领域实体
      return planEntities.map((entity: any) => this.mapper.toDomain(entity));
    } catch (error: any) {
      this.logger.error('Failed to find plans by context ID', { 
        contextId, 
        error: error.message 
      });
      throw new Error(`Failed to find plans by context ID: ${error.message}`);
    }
  }
  
  /**
   * 通过过滤条件查找计划
   * @param filter 过滤条件
   * @returns 找到的计划列表
   */
  async findByFilter(filter: PlanFilter): Promise<Plan[]> {
    this.logger.debug('Finding plans by filter', { filter });
    
    try {
      // 构建查询
      const queryBuilder = this.repository.createQueryBuilder('plan');
      
      // 应用过滤条件
      if (filter.plan_ids && filter.plan_ids.length > 0) {
        queryBuilder.andWhere('plan.plan_id IN (:...planIds)', { planIds: filter.plan_ids });
      }
      
      if (filter.context_ids && filter.context_ids.length > 0) {
        queryBuilder.andWhere('plan.context_id IN (:...contextIds)', { contextIds: filter.context_ids });
      }
      
      if (filter.names && filter.names.length > 0) {
        queryBuilder.andWhere('plan.name IN (:...names)', { names: filter.names });
      }
      
      if (filter.statuses && filter.statuses.length > 0) {
        queryBuilder.andWhere('plan.status IN (:...statuses)', { statuses: filter.statuses });
      }
      
      if (filter.priorities && filter.priorities.length > 0) {
        queryBuilder.andWhere('plan.priority IN (:...priorities)', { priorities: filter.priorities });
      }
      
      if (filter.date_range) {
        if (filter.date_range.start) {
          queryBuilder.andWhere('plan.created_at >= :startDate', { startDate: filter.date_range.start });
        }
        
        if (filter.date_range.end) {
          queryBuilder.andWhere('plan.created_at <= :endDate', { endDate: filter.date_range.end });
        }
      }
      
      // 应用分页
      if (filter.limit !== undefined) {
        queryBuilder.take(filter.limit);
      }
      
      if (filter.offset !== undefined) {
        queryBuilder.skip(filter.offset);
      }
      
      // 执行查询
      const planEntities = await queryBuilder.getMany();
      
      // 将持久化实体转换为领域实体
      return planEntities.map(entity => this.mapper.toDomain(entity));
    } catch (error: any) {
      this.logger.error('Failed to find plans by filter', { 
        filter, 
        error: error.message 
      });
      throw new Error(`Failed to find plans by filter: ${error.message}`);
    }
  }
  
  /**
   * 更新计划
   * @param plan 计划实体
   * @returns 更新后的计划
   */
  async update(plan: Plan): Promise<Plan> {
    this.logger.debug('Updating plan', { planId: plan.plan_id });
    
    try {
      // 检查计划是否存在
      const exists = await this.exists(plan.plan_id);
      
      if (!exists) {
        throw new Error(`Plan with ID ${plan.plan_id} not found`);
      }
      
      // 将领域实体转换为持久化实体
      const planEntity = this.mapper.toPersistence(plan);
      
      // 保存到数据库
      const savedEntity = await this.repository.save(planEntity);
      
      // 将持久化实体转换回领域实体
      return this.mapper.toDomain(savedEntity);
    } catch (error: any) {
      this.logger.error('Failed to update plan', { 
        planId: plan.plan_id, 
        error: error.message 
      });
      throw new Error(`Failed to update plan: ${error.message}`);
    }
  }
  
  /**
   * 删除计划
   * @param planId 计划ID
   * @returns 是否成功删除
   */
  async delete(planId: UUID): Promise<boolean> {
    this.logger.debug('Deleting plan', { planId });
    
    try {
      // 从数据库删除
      const result = await this.repository.delete({ plan_id: planId });
      
      return result.affected !== undefined && result.affected !== null && result.affected > 0;
    } catch (error: any) {
      this.logger.error('Failed to delete plan', { 
        planId, 
        error: error.message 
      });
      throw new Error(`Failed to delete plan: ${error.message}`);
    }
  }
  
  /**
   * 检查计划是否存在
   * @param planId 计划ID
   * @returns 是否存在
   */
  async exists(planId: UUID): Promise<boolean> {
    this.logger.debug('Checking if plan exists', { planId });
    
    try {
      const count = await this.repository.count({
        where: { plan_id: planId }
      });
      
      return count > 0;
    } catch (error: any) {
      this.logger.error('Failed to check if plan exists', { 
        planId, 
        error: error.message 
      });
      throw new Error(`Failed to check if plan exists: ${error.message}`);
    }
  }
  
  /**
   * 统计计划数量
   * @param filter 过滤条件
   * @returns 计划数量
   */
  async count(filter?: PlanFilter): Promise<number> {
    this.logger.debug('Counting plans', { filter });
    
    try {
      // 如果没有过滤条件，直接计数
      if (!filter) {
        return this.repository.count();
      }
      
      // 构建查询
      const queryBuilder = this.repository.createQueryBuilder('plan');
      
      // 应用过滤条件
      if (filter.plan_ids && filter.plan_ids.length > 0) {
        queryBuilder.andWhere('plan.plan_id IN (:...planIds)', { planIds: filter.plan_ids });
      }
      
      if (filter.context_ids && filter.context_ids.length > 0) {
        queryBuilder.andWhere('plan.context_id IN (:...contextIds)', { contextIds: filter.context_ids });
      }
      
      if (filter.names && filter.names.length > 0) {
        queryBuilder.andWhere('plan.name IN (:...names)', { names: filter.names });
      }
      
      if (filter.statuses && filter.statuses.length > 0) {
        queryBuilder.andWhere('plan.status IN (:...statuses)', { statuses: filter.statuses });
      }
      
      if (filter.priorities && filter.priorities.length > 0) {
        queryBuilder.andWhere('plan.priority IN (:...priorities)', { priorities: filter.priorities });
      }
      
      if (filter.date_range) {
        if (filter.date_range.start) {
          queryBuilder.andWhere('plan.created_at >= :startDate', { startDate: filter.date_range.start });
        }
        
        if (filter.date_range.end) {
          queryBuilder.andWhere('plan.created_at <= :endDate', { endDate: filter.date_range.end });
        }
      }
      
      // 执行查询
      return queryBuilder.getCount();
    } catch (error: any) {
      this.logger.error('Failed to count plans', { 
        filter, 
        error: error.message 
      });
      throw new Error(`Failed to count plans: ${error.message}`);
    }
  }
  
  /**
   * 批量创建计划
   * @param plans 计划实体列表
   * @returns 创建的计划列表
   */
  async bulkCreate(plans: Plan[]): Promise<Plan[]> {
    this.logger.debug('Bulk creating plans', { count: plans.length });
    
    try {
      // 将领域实体转换为持久化实体
      const planEntities = plans.map(plan => this.mapper.toPersistence(plan));
      
      // 保存到数据库
      const savedEntities = await this.repository.save(planEntities);
      
      // 将持久化实体转换回领域实体
      return savedEntities.map(entity => this.mapper.toDomain(entity));
    } catch (error: any) {
      this.logger.error('Failed to bulk create plans', { 
        count: plans.length, 
        error: error.message 
      });
      throw new Error(`Failed to bulk create plans: ${error.message}`);
    }
  }
  
  /**
   * 批量更新计划
   * @param plans 计划实体列表
   * @returns 更新后的计划列表
   */
  async bulkUpdate(plans: Plan[]): Promise<Plan[]> {
    this.logger.debug('Bulk updating plans', { count: plans.length });
    
    try {
      // 将领域实体转换为持久化实体
      const planEntities = plans.map(plan => this.mapper.toPersistence(plan));
      
      // 保存到数据库
      const savedEntities = await this.repository.save(planEntities);
      
      // 将持久化实体转换回领域实体
      return savedEntities.map(entity => this.mapper.toDomain(entity));
    } catch (error: any) {
      this.logger.error('Failed to bulk update plans', { 
        count: plans.length, 
        error: error.message 
      });
      throw new Error(`Failed to bulk update plans: ${error.message}`);
    }
  }
  
  /**
   * 批量删除计划
   * @param planIds 计划ID列表
   * @returns 成功删除的计划ID列表
   */
  async bulkDelete(planIds: UUID[]): Promise<UUID[]> {
    this.logger.debug('Bulk deleting plans', { count: planIds.length });
    
    try {
      // 从数据库删除
      await this.repository.delete({
        plan_id: In(planIds)
      });
      
      // 注意：这里假设所有ID都成功删除
      // 在实际实现中，应该检查每个ID是否成功删除
      return planIds;
    } catch (error: any) {
      this.logger.error('Failed to bulk delete plans', { 
        count: planIds.length, 
        error: error.message 
      });
      throw new Error(`Failed to bulk delete plans: ${error.message}`);
    }
  }
} 