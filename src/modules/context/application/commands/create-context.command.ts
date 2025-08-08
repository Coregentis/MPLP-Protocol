/**
 * CreateContext命令
 * 
 * 定义创建Context的命令参数
 * 
 * @version 1.0.0
 * @created 2025-09-16
 */

import { ContextLifecycleStage } from '../../types';
import { EntityStatus } from '../../../../public/shared/types';

/**
 * 创建Context命令
 */
export interface CreateContextCommand {
  /**
   * Context名称
   */
  name: string;
  
  /**
   * Context描述
   */
  description?: string | null;
  
  /**
   * 生命周期阶段
   */
  lifecycleStage?: ContextLifecycleStage;
  
  /**
   * 状态
   */
  status?: EntityStatus;
  
  /**
   * 配置信息
   */
  configuration?: {
    allowSharing?: boolean;
    maxSessions?: number;
    expirationPolicy?: string;
    autoSuspendAfterInactivity?: number | null;
    allowAnonymousAccess?: boolean;
    features?: string[];
  };
  
  /**
   * 元数据
   */
  metadata?: Record<string, unknown>;
} 