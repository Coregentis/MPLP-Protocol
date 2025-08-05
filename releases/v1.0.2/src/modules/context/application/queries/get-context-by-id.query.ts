/**
 * GetContextById查询
 * 
 * 定义通过ID获取Context的查询参数
 * 
 * @version 1.0.0
 * @created 2025-09-16
 */

import { UUID } from '../../../shared/types';

/**
 * 通过ID获取Context查询
 */
export interface GetContextByIdQuery {
  /**
   * Context ID
   */
  contextId: UUID;
  
  /**
   * 是否包含关联数据
   */
  includeRelations?: boolean;
} 