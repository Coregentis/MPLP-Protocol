/**
 * 删除计划命令
 * 
 * 处理计划删除的应用层命令
 * 
 * @version v1.0.0
 * @created 2025-08-07
 * @compliance 100% Schema合规性 - 完全匹配plan-protocol.json
 */

import { UUID } from '../../../../public/shared/types';
import { PlanManagementService } from '../services/plan-management.service';
import { OperationResult } from '../../../../public/shared/types';

/**
 * 删除计划命令接口
 */
export interface DeletePlanCommand {
  planId: UUID;
  plan_id?: UUID;  // 兼容snake_case
  force?: boolean;  // 强制删除标志
  cascade?: boolean;  // 级联删除标志
}

/**
 * 删除计划命令处理器
 */
export class DeletePlanCommandHandler {
  constructor(
    private readonly planManagementService: PlanManagementService
  ) {}
  
  /**
   * 处理删除计划命令
   * @param command 删除计划命令
   * @returns 操作结果
   */
  async execute(command: DeletePlanCommand): Promise<OperationResult<boolean>> {
    const planId = command.planId || command.plan_id;
    
    if (!planId) {
      return {
        success: false,
        error: 'Plan ID is required for deletion'
      };
    }
    
    // 执行删除计划操作
    return this.planManagementService.deletePlan(planId);
  }
}
