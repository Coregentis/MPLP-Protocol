/**
 * MPLP协议核心类型定义 - 厂商中立设计
 * 
 * 定义了MPLP协议中使用的所有核心类型，
 * 确保与JSON Schema定义完全一致，支持厂商中立原则。
 * 
 * @version v1.0.2
 * @created 2025-07-09T24:10:00+08:00
 * @updated 2025-08-15T19:00:00+08:00
 * @compliance .cursor/rules/technical-standards.mdc - TypeScript严格模式
 * @compliance .cursor/rules/development-standards.mdc - 厂商中立原则
 * @compliance .cursor/rules/schema-standards.mdc - Schema驱动开发原则
 */

// ===== 基础类型定义 (按照Schema规范) =====

/**
 * UUID v4格式的唯一标识符
 * 
 * 符合 Schema $defs/uuid 规范
 * 格式: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
 * 其中x为任意十六进制数字，y为8、9、A或B
 * 
 * @schema_path #/$defs/uuid
 */
export type UUID = string;

/**
 * ISO 8601格式的时间戳
 * 
 * 符合 Schema $defs/timestamp 规范
 * 格式: YYYY-MM-DDThh:mm:ss.sssZ
 * 
 * @schema_path #/$defs/timestamp
 */
export type Timestamp = string;

/**
 * 语义化版本号 (SemVer)
 * 
 * 符合 Schema $defs/version 规范
 * 格式: MAJOR.MINOR.PATCH[-PRERELEASE][+BUILD]
 * 
 * @schema_path #/$defs/version
 */
export type Version = string;

/**
 * 优先级枚举
 * 
 * 符合所有Schema $defs/priority 规范
 * 
 * @schema_path #/$defs/priority
 */
export type Priority = 'critical' | 'high' | 'medium' | 'low';

/**
 * MPLP协议基础接口
 * 
 * 所有MPLP协议消息都必须实现此接口
 * 
 * @schema_path #/$defs/base_protocol
 */
export interface BaseProtocol {
  /**
   * 协议版本
   */
  protocolVersion: Version;
  
  /**
   * 消息时间戳
   */
  timestamp: Timestamp;
}

/**
 * MPLP错误接口
 * 
 * 定义了标准的错误结构
 * 
 * @schema_path #/$defs/error
 */
export interface MPLPError {
  /**
   * 错误代码
   */
  code: string;
  
  /**
   * 错误消息
   */
  message: string;
  
  /**
   * 错误详情
   */
  details?: Record<string, unknown>;
  
  /**
   * 错误时间戳
   */
  timestamp: Timestamp;
}

/**
 * MPLP响应接口
 * 
 * 定义了标准的响应结构
 * 
 * @schema_path #/$defs/response
 */
export interface MPLPResponse<T = unknown> {
  /**
   * 操作是否成功
   */
  success: boolean;
  
  /**
   * 响应数据
   */
  data?: T;
  
  /**
   * 错误信息
   */
  error?: MPLPError;
  
  /**
   * 元数据
   */
  metadata?: Record<string, unknown>;
}

/**
 * 资源标识符
 * 
 * 用于唯一标识MPLP系统中的资源
 * 
 * @schema_path #/$defs/resource_identifier
 */
export interface ResourceIdentifier {
  /**
   * 资源类型
   */
  type: string;
  
  /**
   * 资源ID
   */
  id: UUID;
  
  /**
   * 资源版本
   */
  version?: Version;
}

/**
 * 元数据接口
 * 
 * 定义了资源元数据的标准结构
 * 
 * @schema_path #/$defs/metadata
 */
export interface Metadata {
  /**
   * 创建时间
   */
  createdAt: Timestamp;
  
  /**
   * 更新时间
   */
  updatedAt: Timestamp;
  
  /**
   * 创建者
   */
  created_by?: string;
  
  /**
   * 更新者
   */
  updated_by?: string;
  
  /**
   * 标签列表
   */
  tags?: string[];
  
  /**
   * 其他元数据
   */
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

/**
 * 上下文协议类型
 * @schema_path context-protocol.json
 */
export type { ContextProtocol } from '../modules/context/types';

/**
 * 计划协议类型
 * @schema_path plan-protocol.json
 */
export type { PlanProtocol } from '../modules/plan/types';

/**
 * 追踪数据类型
 * @schema_path trace-protocol.json
 */
export type { MPLPTraceData } from '../modules/trace/types';

/**
 * 角色协议类型
 * @schema_path role-protocol.json
 */
export type { RoleProtocol } from '../modules/role/types';

/**
 * 确认协议类型
 * @schema_path confirm-protocol.json
 */
export type { ConfirmProtocol } from '../modules/confirm/types';

/**
 * 扩展协议类型
 * @schema_path extension-protocol.json
 */
export type { ExtensionProtocol } from '../modules/extension/types';

// ===== 模块导出接口类型 =====

/**
 * 通用操作结果类型
 */
export interface OperationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  warnings?: string[];
}

/**
 * 分页选项
 */
export interface PaginationOptions {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

/**
 * 分页结果
 */
export interface PaginatedResult<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

// 导出模块导出类型定义
export * from './module-exports';