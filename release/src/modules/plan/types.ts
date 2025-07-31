/**
 * Plan模块类型定义
 *
 * 重新导出Plan模块的所有类型定义
 *
 * @version 1.0.0
 * @created 2025-09-16
 */

// 重新导出共享类型
export * from '../../public/shared/types/plan-types';

// 重新导出API相关类型
export * from './api/dtos/plan.dto';

// 重新导出Domain类型
export * from './domain/entities/plan.entity';
export * from './domain/value-objects/plan-configuration.value-object';

// Plan协议类型
export interface PlanProtocol {
  plan_id: string;
  context_id: string;
  name: string;
  description?: string;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled' | 'archived';
  priority: 'critical' | 'high' | 'medium' | 'low';
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>;
}
