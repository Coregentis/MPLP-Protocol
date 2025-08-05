/**
 * Context模块类型定义
 *
 * 重新导出Context模块的所有类型定义
 *
 * @version 1.0.0
 * @created 2025-09-16
 */

// 重新导出共享类型
export * from '../../shared/types';

// 重新导出API相关类型
export { CreateContextRequest as CreateContextRequestDTO } from './api/dto/requests/create-context.request';
export * from './api/dto/responses/context.response';

// 重新导出Domain类型
export * from './domain/entities/context.entity';

// Context协议类型
export interface ContextProtocol {
  context_id: string;
  name: string;
  description?: string;
  lifecycle_stage: 'initialization' | 'active' | 'maintenance' | 'completion';
  status: 'active' | 'inactive' | 'suspended' | 'deleted';
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>;
}
