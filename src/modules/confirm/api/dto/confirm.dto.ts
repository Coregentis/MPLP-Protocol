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
  contextId: UUID;
  planId?: UUID;
  confirmationType: ConfirmationType;
  priority: Priority;
  subject: ConfirmSubject;
  requester: Requester;
  approvalWorkflow: ApprovalWorkflow;
  expiresAt?: string;
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
  confirmIds: UUID[];
  status: ConfirmStatus;
}

/**
 * 确认查询请求DTO
 */
export interface ConfirmQueryRequestDto {
  contextId?: UUID;
  planId?: UUID;
  confirmationType?: ConfirmationType;
  status?: ConfirmStatus;
  priority?: Priority;
  requesterUserId?: string;
  createdAfter?: string;
  createdBefore?: string;
  expiresAfter?: string;
  expiresBefore?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * 确认响应DTO
 */
export interface ConfirmResponseDto {
  confirmId: UUID;
  contextId: UUID;
  planId?: UUID;
  protocolVersion: string;
  confirmationType: ConfirmationType;
  status: ConfirmStatus;
  priority: Priority;
  subject: ConfirmSubject;
  requester: Requester;
  approvalWorkflow: ApprovalWorkflow;
  decision?: ConfirmDecision;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
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
  totalPages: number;
}

/**
 * 确认统计响应DTO
 */
export interface ConfirmStatisticsResponseDto {
  total: number;
  byStatus: Record<ConfirmStatus, number>;
  byType: Record<ConfirmationType, number>;
  byPriority: Record<Priority, number>;
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
