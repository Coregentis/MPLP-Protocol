/**
 * MPLP Shared Types - 厂商中立类型定义
 * 
 * 提供跨模块共享的类型定义
 * 
 * @version 1.0.3
 * @created 2025-07-09T21:00:00+08:00
 * @updated 2025-08-15T20:45:00+08:00
 */

// 基础操作结果类型
export interface OperationResult<T = any> {
  success: boolean;
  data?: T;
  error?: string | any[];
  message?: string;
}

// Context相关类型
export interface ContextOperationResult<T = any> extends OperationResult<T> {
  contextId?: string;
  timestamp?: string;
}

// 通用错误类型
export interface ErrorInfo {
  code: string;
  message: string;
  details?: any;
}

// UUID类型
export type UUID = string;

// 时间戳类型
export type Timestamp = string;
export type ISO8601DateTime = string;

// 版本类型
export type Version = string;

// 通用结果类型
export type Result<T = any> = OperationResult<T>;

// 分页参数
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

// 分页结果
export interface PaginatedResult<T = any> {
  data: T[];
  items: T[];  // 兼容性别名
  total: number;
  page: number;
  limit: number;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// 实体状态枚举
export enum EntityStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  DELETED = 'deleted'
}

// Context生命周期阶段
export enum ContextLifecycleStage {
  INITIALIZATION = 'initialization',
  ACTIVE = 'active',
  MAINTENANCE = 'maintenance',
  COMPLETION = 'completion'
}

// 导出所有类型
export * from './context-types';
export * from './plan-types';
export * from './trace-types';
export * from './role-types';
export * from './confirm-types';
export * from './extension-types';
