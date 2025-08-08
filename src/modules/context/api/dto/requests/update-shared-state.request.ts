/**
 * 更新共享状态请求DTO
 * 
 * API层数据传输对象，用于更新Context的共享状态
 * 
 * @version 1.0.0
 * @created 2025-08-07
 */

import { UUID } from '../../../../../public/shared/types';

/**
 * 资源状态枚举（Schema格式）
 */
export enum ResourceStatusSchema {
  AVAILABLE = 'available',
  ALLOCATED = 'allocated',
  EXHAUSTED = 'exhausted'
}

/**
 * 依赖状态枚举（Schema格式）
 */
export enum DependencyStatusSchema {
  PENDING = 'pending',
  RESOLVED = 'resolved',
  FAILED = 'failed'
}

/**
 * 依赖类型枚举（Schema格式）
 */
export enum DependencyTypeSchema {
  CONTEXT = 'context',
  PLAN = 'plan',
  EXTERNAL = 'external'
}

/**
 * 目标状态枚举（Schema格式）
 */
export enum GoalStatusSchema {
  DEFINED = 'defined',
  ACTIVE = 'active',
  ACHIEVED = 'achieved',
  ABANDONED = 'abandoned'
}

/**
 * 优先级枚举（Schema格式）
 */
export enum PrioritySchema {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

/**
 * 成功标准操作符（Schema格式）
 */
export enum SuccessCriteriaOperatorSchema {
  EQ = 'eq',
  NE = 'ne',
  GT = 'gt',
  GTE = 'gte',
  LT = 'lt',
  LTE = 'lte'
}

/**
 * 资源接口（Schema格式）
 */
export interface ResourceSchema {
  type: string;
  amount: number;
  unit: string;
  status: ResourceStatusSchema;
}

/**
 * 资源需求接口（Schema格式）
 */
export interface ResourceRequirementSchema {
  minimum: number;
  optimal?: number;
  maximum?: number;
  unit: string;
}

/**
 * 依赖接口（Schema格式）
 */
export interface DependencySchema {
  id: UUID;
  type: DependencyTypeSchema;
  name: string;
  version?: string;
  status: DependencyStatusSchema;
}

/**
 * 成功标准接口（Schema格式）
 */
export interface SuccessCriteriaSchema {
  metric: string;
  operator: SuccessCriteriaOperatorSchema;
  value: string | number | boolean;
  unit?: string;
}

/**
 * 目标接口（Schema格式）
 */
export interface GoalSchema {
  id: UUID;
  name: string;
  description?: string;
  priority: PrioritySchema;
  status: GoalStatusSchema;
  success_criteria: SuccessCriteriaSchema[];
}

/**
 * 更新共享状态请求接口（Schema格式 - snake_case）
 */
export interface UpdateSharedStateRequest {
  /**
   * 共享变量
   */
  variables?: Record<string, unknown>;

  /**
   * 资源配置
   */
  resources?: {
    /**
     * 已分配资源
     */
    allocated?: Record<string, ResourceSchema>;

    /**
     * 资源需求
     */
    requirements?: Record<string, ResourceRequirementSchema>;
  };

  /**
   * 依赖列表
   */
  dependencies?: DependencySchema[];

  /**
   * 目标列表
   */
  goals?: GoalSchema[];
}

/**
 * 设置共享变量请求接口
 */
export interface SetSharedVariableRequest {
  /**
   * 变量键
   */
  key: string;

  /**
   * 变量值
   */
  value: unknown;
}

/**
 * 分配资源请求接口
 */
export interface AllocateResourceRequest {
  /**
   * 资源键
   */
  resource_key: string;

  /**
   * 资源配置
   */
  resource: ResourceSchema;
}

/**
 * 设置资源需求请求接口
 */
export interface SetResourceRequirementRequest {
  /**
   * 资源键
   */
  resource_key: string;

  /**
   * 资源需求
   */
  requirement: ResourceRequirementSchema;
}

/**
 * 添加依赖请求接口
 */
export interface AddDependencyRequest {
  /**
   * 依赖配置
   */
  dependency: DependencySchema;
}

/**
 * 更新依赖状态请求接口
 */
export interface UpdateDependencyStatusRequest {
  /**
   * 依赖ID
   */
  dependency_id: UUID;

  /**
   * 新状态
   */
  status: DependencyStatusSchema;
}

/**
 * 添加目标请求接口
 */
export interface AddGoalRequest {
  /**
   * 目标配置
   */
  goal: GoalSchema;
}

/**
 * 更新目标状态请求接口
 */
export interface UpdateGoalStatusRequest {
  /**
   * 目标ID
   */
  goal_id: UUID;

  /**
   * 新状态
   */
  status: GoalStatusSchema;
}
