/**
 * 共享状态响应DTO
 * 
 * API层数据传输对象，用于返回Context的共享状态信息
 * 
 * @version 1.0.0
 * @created 2025-08-07
 */

import { UUID } from '../../../../../public/shared/types';
import {
  ResourceSchema,
  ResourceRequirementSchema,
  DependencySchema,
  GoalSchema
} from '../requests/update-shared-state.request';

/**
 * 共享状态响应接口（Schema格式 - snake_case）
 */
export interface SharedStateResponse {
  /**
   * 共享变量
   */
  variables: Record<string, unknown>;

  /**
   * 资源配置
   */
  resources: {
    /**
     * 已分配资源
     */
    allocated: Record<string, ResourceSchema>;

    /**
     * 资源需求
     */
    requirements: Record<string, ResourceRequirementSchema>;
  };

  /**
   * 依赖列表
   */
  dependencies: DependencySchema[];

  /**
   * 目标列表
   */
  goals: GoalSchema[];
}

/**
 * 共享变量响应接口
 */
export interface SharedVariableResponse {
  /**
   * 变量键
   */
  key: string;

  /**
   * 变量值
   */
  value: unknown;

  /**
   * 变量类型
   */
  type: string;
}

/**
 * 资源状态响应接口
 */
export interface ResourceStatusResponse {
  /**
   * 资源键
   */
  resource_key: string;

  /**
   * 资源配置
   */
  resource: ResourceSchema;

  /**
   * 是否可用
   */
  is_available: boolean;

  /**
   * 使用率（百分比）
   */
  utilization_percentage?: number;
}

/**
 * 依赖状态响应接口
 */
export interface DependencyStatusResponse {
  /**
   * 依赖ID
   */
  dependency_id: UUID;

  /**
   * 依赖信息
   */
  dependency: DependencySchema;

  /**
   * 是否已解决
   */
  is_resolved: boolean;

  /**
   * 解决时间
   */
  resolved_at?: string;
}

/**
 * 目标状态响应接口
 */
export interface GoalStatusResponse {
  /**
   * 目标ID
   */
  goal_id: UUID;

  /**
   * 目标信息
   */
  goal: GoalSchema;

  /**
   * 是否已达成
   */
  is_achieved: boolean;

  /**
   * 达成时间
   */
  achieved_at?: string;

  /**
   * 进度百分比
   */
  progress_percentage?: number;
}

/**
 * 资源分配摘要响应接口
 */
export interface ResourceAllocationSummaryResponse {
  /**
   * 总资源数
   */
  total_resources: number;

  /**
   * 可用资源数
   */
  available_resources: number;

  /**
   * 已分配资源数
   */
  allocated_resources: number;

  /**
   * 耗尽资源数
   */
  exhausted_resources: number;

  /**
   * 资源详情
   */
  resource_details: ResourceStatusResponse[];
}

/**
 * 依赖摘要响应接口
 */
export interface DependencySummaryResponse {
  /**
   * 总依赖数
   */
  total_dependencies: number;

  /**
   * 已解决依赖数
   */
  resolved_dependencies: number;

  /**
   * 待解决依赖数
   */
  pending_dependencies: number;

  /**
   * 失败依赖数
   */
  failed_dependencies: number;

  /**
   * 依赖详情
   */
  dependency_details: DependencyStatusResponse[];
}

/**
 * 目标摘要响应接口
 */
export interface GoalSummaryResponse {
  /**
   * 总目标数
   */
  total_goals: number;

  /**
   * 已达成目标数
   */
  achieved_goals: number;

  /**
   * 活跃目标数
   */
  active_goals: number;

  /**
   * 已放弃目标数
   */
  abandoned_goals: number;

  /**
   * 高优先级目标数
   */
  high_priority_goals: number;

  /**
   * 目标详情
   */
  goal_details: GoalStatusResponse[];
}

/**
 * 共享状态摘要响应接口
 */
export interface SharedStateSummaryResponse {
  /**
   * 变量数量
   */
  variable_count: number;

  /**
   * 资源摘要
   */
  resource_summary: ResourceAllocationSummaryResponse;

  /**
   * 依赖摘要
   */
  dependency_summary: DependencySummaryResponse;

  /**
   * 目标摘要
   */
  goal_summary: GoalSummaryResponse;

  /**
   * 最后更新时间
   */
  last_updated_at: string;
}
