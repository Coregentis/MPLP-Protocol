/**
 * Context模块DTO定义
 * 
 * @description API层数据传输对象，用于请求和响应的数据结构定义
 * @version 1.0.0
 * @layer API层 - 数据传输对象
 */

import { 
  ContextStatus, 
  LifecycleStage,
  CreateContextRequest,
  UpdateContextRequest,
  ContextQueryFilter
} from '../../types';

/**
 * 创建Context请求DTO
 */
export class CreateContextDto implements CreateContextRequest {
  name!: string;
  description?: string;
  sharedState?: Record<string, unknown>;
  accessControl?: Record<string, unknown>;
  configuration?: Record<string, unknown>;
}

/**
 * 更新Context请求DTO
 */
export class UpdateContextDto implements UpdateContextRequest {
  name?: string;
  description?: string;
  status?: ContextStatus;
  lifecycleStage?: LifecycleStage;
  sharedState?: Record<string, unknown>;
  accessControl?: Record<string, unknown>;
  configuration?: Record<string, unknown>;
}

/**
 * Context查询DTO
 */
export class ContextQueryDto implements ContextQueryFilter {
  status?: ContextStatus | ContextStatus[];
  lifecycleStage?: LifecycleStage | LifecycleStage[];
  owner?: string;
  createdAfter?: string;
  createdBefore?: string;
  namePattern?: string;
}

/**
 * Context响应DTO
 */
export class ContextResponseDto {
  contextId!: string;
  name!: string;
  description?: string;
  status!: ContextStatus;
  lifecycleStage!: LifecycleStage;
  protocolVersion!: string;
  timestamp!: string;
  sharedState!: Record<string, unknown>;
  accessControl!: Record<string, unknown>;
  configuration!: Record<string, unknown>;
  auditTrail!: Record<string, unknown>;
  monitoringIntegration!: Record<string, unknown>;
  performanceMetrics!: Record<string, unknown>;
  versionHistory!: Record<string, unknown>;
  searchMetadata!: Record<string, unknown>;
  cachingPolicy!: Record<string, unknown>;
  syncConfiguration!: Record<string, unknown>;
  errorHandling!: Record<string, unknown>;
  integrationEndpoints!: Record<string, unknown>;
  eventIntegration!: Record<string, unknown>;
}

/**
 * 分页Context响应DTO
 */
export class PaginatedContextResponseDto {
  data!: ContextResponseDto[];
  total!: number;
  page!: number;
  limit!: number;
  totalPages!: number;
}

/**
 * Context操作结果DTO
 */
export class ContextOperationResultDto {
  success!: boolean;
  contextId?: string;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  metadata?: Record<string, unknown>;
}
