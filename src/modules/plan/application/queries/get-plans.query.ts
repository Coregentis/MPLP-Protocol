/**
 * 获取计划列表查询
 * 
 * 处理计划列表查询的应用层查询
 * 
 * @version v1.0.0
 * @created 2025-08-07
 * @compliance 100% Schema合规性 - 完全匹配plan-protocol.json
 */

import { UUID } from '../../../../public/shared/types';
import { PlanStatus, Priority } from '../../types';
import { PlanManagementService } from '../services/plan-management.service';
import { Plan } from '../../domain/entities/plan.entity';
import { OperationResult } from '../../../../public/shared/types';

/**
 * 获取计划列表查询接口
 */
export interface GetPlansQuery {
  contextId?: UUID;
  context_id?: UUID;  // 兼容snake_case
  status?: PlanStatus;
  priority?: Priority;
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sort_by?: string;  // 兼容snake_case
  sortOrder?: 'asc' | 'desc';
  sort_order?: 'asc' | 'desc';  // 兼容snake_case
}

/**
 * 计划列表查询结果
 */
export interface PlansQueryResult {
  plans: Plan[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  total_pages?: number;  // 兼容snake_case
}

/**
 * 获取计划列表查询处理器
 */
export class GetPlansQueryHandler {
  constructor(
    private readonly planManagementService: PlanManagementService
  ) {}
  
  /**
   * 处理获取计划列表查询
   * @param query 查询参数
   * @returns 操作结果
   */
  async execute(query: GetPlansQuery): Promise<OperationResult<PlansQueryResult>> {
    // 标准化查询参数
    const normalizedQuery = {
      contextId: query.contextId || query.context_id,
      status: query.status,
      priority: query.priority,
      page: query.page || 1,
      limit: query.limit || 10,
      search: query.search,
      sortBy: query.sortBy || query.sort_by || 'created_at',
      sortOrder: query.sortOrder || query.sort_order || 'desc'
    };
    
    // 执行查询操作
    return this.planManagementService.getPlans(normalizedQuery);
  }
}
