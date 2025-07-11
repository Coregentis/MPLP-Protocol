/**
 * MPLP协议核心类型定义
 * 
 * @version v1.0.0
 * @created 2025-07-09T24:10:00+08:00
 * @compliance .cursor/rules/technical-standards.mdc - TypeScript严格模式
 */

// ===== 基础类型定义 (按照Schema规范) =====

/**
 * UUID v4格式的唯一标识符
 * 符合 Schema $defs/uuid 规范
 */
export type UUID = string;

/**
 * ISO 8601格式的时间戳
 * 符合 Schema $defs/timestamp 规范
 */
export type Timestamp = string;

/**
 * 语义化版本号 (SemVer)
 * 符合 Schema $defs/version 规范
 */
export type Version = string;

/**
 * 优先级枚举
 * 符合所有Schema $defs/priority 规范
 */
export type Priority = 'critical' | 'high' | 'medium' | 'low';

/**
 * MPLP协议基础接口
 * 所有MPLP协议消息都必须实现此接口
 */
export interface BaseProtocol {
  protocol_version: Version;
  timestamp: Timestamp;
}

/**
 * MPLP错误接口
 */
export interface MPLPError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: Timestamp;
}

/**
 * MPLP响应接口
 */
export interface MPLPResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: MPLPError;
  metadata?: Record<string, unknown>;
}

/**
 * 资源标识符
 */
export interface ResourceIdentifier {
  type: string;
  id: UUID;
  version?: Version;
}

/**
 * 元数据接口
 */
export interface Metadata {
  created_at: Timestamp;
  updated_at: Timestamp;
  created_by?: string;
  updated_by?: string;
  tags?: string[];
  [key: string]: unknown;
}

// ===== 模块特定类型导出 =====

// Context模块类型 (命名空间导入避免冲突)
import * as ContextTypes from '../modules/context/types';
export { ContextTypes };

// Plan模块类型 (命名空间导入避免冲突) 
import * as PlanTypes from '../modules/plan/types';
export { PlanTypes };

// Trace模块类型 (命名空间导入避免冲突)
import * as TraceTypes from '../modules/trace/types';
export { TraceTypes };

// Role模块类型 (命名空间导入避免冲突)
import * as RoleTypes from '../modules/role/types';
export { RoleTypes };

// Confirm模块类型 (命名空间导入避免冲突)
import * as ConfirmTypes from '../modules/confirm/types';
export { ConfirmTypes };

// Extension模块类型 (命名空间导入避免冲突)
import * as ExtensionTypes from '../modules/extension/types';
export { ExtensionTypes };

// ===== 核心协议类型直接导出 =====
export type { ContextProtocol } from '../modules/context/types';
export type { PlanProtocol } from '../modules/plan/types';
export type { TraceProtocol } from '../modules/trace/types';
export type { RoleProtocol } from '../modules/role/types';
export type { ConfirmProtocol } from '../modules/confirm/types';
export type { ExtensionProtocol } from '../modules/extension/types'; 