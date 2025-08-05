/**
 * 创建确认命令
 * 
 * CQRS模式中的命令处理器
 * 
 * @version 1.0.0
 * @created 2025-09-16
 */

import { UUID } from '../../../shared/types';
import { 
  ConfirmationType, 
  Priority, 
  Requester, 
  ApprovalWorkflow,
  ConfirmSubject,
  ConfirmMetadata 
} from '../../shared/types';
import { ConfirmManagementService, OperationResult } from '../services/confirm-management.service';
import { Confirm } from '../../domain/entities/confirm.entity';

/**
 * 创建确认命令
 */
export interface CreateConfirmCommand {
  context_id: UUID;
  plan_id?: UUID;
  confirmation_type: ConfirmationType;
  priority: Priority;
  subject: ConfirmSubject;
  requester: Requester;
  approval_workflow: ApprovalWorkflow;
  expires_at?: string;
  metadata?: ConfirmMetadata;
}

/**
 * 创建确认命令处理器
 */
export class CreateConfirmHandler {
  constructor(
    private readonly confirmManagementService: ConfirmManagementService
  ) {}

  /**
   * 处理创建确认命令
   */
  async handle(command: CreateConfirmCommand): Promise<OperationResult<Confirm>> {
    return await this.confirmManagementService.createConfirm(command);
  }
}
