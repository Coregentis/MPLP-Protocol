/**
 * MPLP Context Types - Context模块类型定义
 *
 * 提供Context模块相关的类型定义
 *
 * @version 1.0.3
 * @created 2025-07-09T21:00:00+08:00
 * @updated 2025-08-15T20:45:00+08:00
 */

import { UUID, Timestamp } from './index';

// ===== Context生命周期阶段枚举 =====

/**
 * Context生命周期阶段枚举
 */
export enum ContextLifecycleStage {
  INITIALIZATION = 'initialization',
  ACTIVE = 'active',
  MAINTENANCE = 'maintenance',
  COMPLETION = 'completion'
}

// Context基础类型
export interface ContextData {
  id: string;
  name: string;
  description?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// Context创建请求
export interface CreateContextRequest {
  name: string;
  description?: string;
  metadata?: Record<string, any>;
}

// Context更新请求
export interface UpdateContextRequest {
  name?: string;
  description?: string;
  metadata?: Record<string, any>;
}

// Context查询参数
export interface ContextQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
