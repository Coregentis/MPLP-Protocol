/**
 * 创建确认命令
 * 
 * CQRS模式中的命令处理器
 * 
 * @version 1.0.0
 * @created 2025-09-16
 */

import { UUID } from '../../../../public/shared/types';
import { 
  ConfirmationType, 
  Priority, 
  Requester, 
  ApprovalWorkflow,
  ConfirmSubject,
  ConfirmMetadata 
} from '../../types';
import { ConfirmManagementService } from '../services/confirm-management.service';
import { OperationResult } from '../../../../public/shared/types';
import { CreateConfirmRequestDto } from '../../api/dto/confirm.dto';
import { Confirm } from '../../domain/entities/confirm.entity';

/**
 * 创建确认命令
 * Application层使用camelCase
 */
export interface CreateConfirmCommand {
  contextId: UUID;
  planId?: UUID;
  confirmationType: ConfirmationType;
  priority: Priority;
  subject: ConfirmSubject;
  requester: Requester;
  approvalWorkflow: ApprovalWorkflow;
  expiresAt?: string;
  metadata?: ConfirmMetadata;
  notificationSettings?: {
    email?: boolean;
    sms?: boolean;
    webhook?: boolean;
    escalationEnabled?: boolean;
  };
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
    // 使用类型断言进行转换，service内部会处理具体的类型转换
    return await this.confirmManagementService.createConfirm(command as unknown as CreateConfirmRequestDto);
  }
}
