/**
 * 通过ID获取计划查询
 * 
 * 处理单个计划查询的应用层查询
 * 
 * @version v1.0.0
 * @created 2025-08-07
 * @compliance 100% Schema合规性 - 完全匹配plan-protocol.json
 */

import { UUID } from '../../../../public/shared/types';
import { PlanManagementService } from '../services/plan-management.service';
import { Plan } from '../../domain/entities/plan.entity';
import { OperationResult } from '../../../../public/shared/types';

/**
 * 通过ID获取计划查询接口
 */
export interface GetPlanByIdQuery {
  planId: UUID;
  plan_id?: UUID;  // 兼容snake_case
  includeDetails?: boolean;
  include_details?: boolean;  // 兼容snake_case
}

/**
 * 通过ID获取计划查询处理器
 */
export class GetPlanByIdQueryHandler {
  constructor(
    private readonly planManagementService: PlanManagementService
  ) {}
  
  /**
   * 处理通过ID获取计划查询
   * @param query 查询参数
   * @returns 操作结果
   */
  async execute(query: GetPlanByIdQuery): Promise<OperationResult<Plan | null>> {
    const planId = query.planId || query.plan_id;
    
    if (!planId) {
      return {
        success: false,
        error: 'Plan ID is required'
      };
    }
    
    // 执行查询操作
    return this.planManagementService.getPlanById(planId);
  }
}
