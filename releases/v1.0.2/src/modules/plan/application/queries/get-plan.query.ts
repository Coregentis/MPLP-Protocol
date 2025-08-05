/**
 * GetPlan查询处理器
 * 
 * 处理获取计划的查询
 * 
 * @version v1.0.0
 * @created 2025-07-26T19:25:00+08:00
 * @compliance 100% Schema合规性 - 完全匹配plan-protocol.json
 */

import { Plan } from '../../domain/entities/plan.entity';
import { PlanManagementService, OperationResult } from '../services/plan-management.service';
import { UUID } from '../../../shared/types';

/**
 * 获取计划查询接口
 */
export interface GetPlanQuery {
  plan_id: UUID;
}

/**
 * 获取计划查询处理器
 */
export class GetPlanQueryHandler {
  constructor(private readonly planManagementService: PlanManagementService) {}
  
  /**
   * 处理获取计划查询
   * @param query 获取计划查询
   * @returns 操作结果
   */
  async execute(query: GetPlanQuery): Promise<OperationResult<Plan>> {
    return this.planManagementService.getPlan(query.plan_id);
  }
} 