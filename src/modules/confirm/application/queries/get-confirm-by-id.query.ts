/**
 * 根据ID获取确认查询
 * 
 * CQRS模式中的查询处理器
 * 
 * @version 1.0.0
 * @created 2025-09-16
 */

import { UUID } from '../../../../public/shared/types';
import { ConfirmManagementService, OperationResult } from '../services/confirm-management.service';
import { Confirm } from '../../domain/entities/confirm.entity';

/**
 * 根据ID获取确认查询
 */
export interface GetConfirmByIdQuery {
  confirm_id: UUID;
}

/**
 * 根据ID获取确认查询处理器
 */
export class GetConfirmByIdHandler {
  constructor(
    private readonly confirmManagementService: ConfirmManagementService
  ) {}

  /**
   * 处理查询
   */
  async handle(query: GetConfirmByIdQuery): Promise<OperationResult<Confirm>> {
    return await this.confirmManagementService.getConfirmById(query.confirm_id);
  }
}
