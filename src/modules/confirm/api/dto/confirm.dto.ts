/**
 * Confirm数据传输对象
 * 
 * API层的数据传输对象定义
 * 
 * @version 1.0.0
 * @created 2025-09-16
 */

import { UUID } from '../../../../public/shared/types';
import { 
  ConfirmationType, 
  ConfirmStatus, 
  Priority, 
  Requester, 
  ApprovalWorkflow,
  ConfirmSubject,
  ConfirmDecision,
  ConfirmMetadata 
} from '../../types';

/**
 * 创建确认请求DTO
 */
export interface CreateConfirmRequestDto {
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
 * 更新确认状态请求DTO
 */
export interface UpdateConfirmStatusRequestDto {
  status: ConfirmStatus;
  decision?: ConfirmDecision;
}

/**
 * 批量更新状态请求DTO
 */
export interface BatchUpdateStatusRequestDto {
  confirm_ids: UUID[];
  status: ConfirmStatus;
}

/**
 * 确认查询请求DTO
 */
export interface ConfirmQueryRequestDto {
  context_id?: UUID;
  plan_id?: UUID;
  confirmation_type?: ConfirmationType;
  status?: ConfirmStatus;
  priority?: Priority;
  requester_user_id?: string;
  created_after?: string;
  created_before?: string;
  expires_after?: string;
  expires_before?: string;
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

/**
 * 确认响应DTO
 */
export interface ConfirmResponseDto {
  confirm_id: UUID;
  context_id: UUID;
  plan_id?: UUID;
  protocol_version: string;
  confirmation_type: ConfirmationType;
  status: ConfirmStatus;
  priority: Priority;
  subject: ConfirmSubject;
  requester: Requester;
  approval_workflow: ApprovalWorkflow;
  decision?: ConfirmDecision;
  created_at: string;
  updated_at: string;
  expires_at?: string;
  metadata?: ConfirmMetadata;
}

/**
 * 分页确认列表响应DTO
 */
export interface PaginatedConfirmResponseDto {
  items: ConfirmResponseDto[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

/**
 * 确认统计响应DTO
 */
export interface ConfirmStatisticsResponseDto {
  total: number;
  by_status: Record<ConfirmStatus, number>;
  by_type: Record<ConfirmationType, number>;
  by_priority: Record<Priority, number>;
}

/**
 * API响应包装器
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  warnings?: string[];
}

/**
 * 错误响应DTO
 */
export interface ErrorResponseDto {
  error: string;
  code?: string;
  details?: Record<string, unknown>;
  timestamp: string;
  path: string;
}
