/**
 * MPLP Collab Module - Type Definitions
 *
 * @version v1.0.0
 * @created 2025-08-02T01:08:00+08:00
 * @description Collab模块的TypeScript类型定义
 */

// 定义实体状态类型，与Schema保持一致
export type EntityStatus =
  | 'active'
  | 'inactive'
  | 'pending'
  | 'completed'
  | 'failed'
  | 'cancelled';

// ==================== 核心实体类型 ====================

/**
 * 协作实体
 */
export interface CollabEntity {
  collaboration_id: string;
  version: string;
  timestamp: string;
  context_id: string;
  plan_id: string;
  name: string;
  description?: string;
  mode: CollabMode;
  participants: CollabParticipant[];
  coordination_strategy: CoordinationStrategy;
  status: EntityStatus;
  created_at: string;
  updated_at: string;
  created_by: string;
  decision_making?: DecisionMakingConfig; // 决策制定配置
  council_configuration?: CouncilConfiguration; // 决策议会配置
  metadata?: Record<string, unknown>;
}

/**
 * 协作参与者
 */
export interface CollabParticipant {
  participant_id: string;
  agent_id: string;
  role_id: string;
  status: EntityStatus;
  capabilities: string[];
  priority: number;
  weight: number;
  joined_at: string;
}

/**
 * 协调策略
 */
export interface CoordinationStrategy {
  type: CoordinationType;
  coordinator_id?: string;
  decision_making: DecisionMaking;
}

// ==================== 枚举类型 ====================

/**
 * 协作模式
 */
export type CollabMode =
  | 'sequential' // 顺序执行
  | 'parallel' // 并行执行
  | 'hybrid' // 混合模式
  | 'pipeline' // 流水线模式
  | 'mesh'; // 网格模式

/**
 * 协调类型
 */
export type CoordinationType =
  | 'centralized' // 中心化
  | 'distributed' // 分布式
  | 'hierarchical' // 层次化
  | 'peer-to-peer'; // 点对点

/**
 * 决策机制
 */
export type DecisionMaking =
  | 'consensus' // 共识
  | 'majority' // 多数决
  | 'weighted' // 权重决策
  | 'coordinator'; // 协调者决策

/**
 * 决策算法类型
 */
export type DecisionAlgorithm =
  | 'majority_vote' // 多数投票
  | 'consensus' // 共识算法
  | 'weighted_vote' // 权重投票
  | 'pbft' // 拜占庭容错
  | 'custom'; // 自定义算法

/**
 * 权重策略类型
 */
export type WeightingStrategy =
  | 'equal' // 平等权重
  | 'expertise_based' // 基于专业度
  | 'role_based' // 基于角色
  | 'performance_based'; // 基于性能

/**
 * 议会类型
 */
export type CouncilType =
  | 'advisory' // 咨询议会
  | 'executive' // 执行议会
  | 'judicial' // 司法议会
  | 'mixed'; // 混合议会

// ==================== 请求/响应类型 ====================

/**
 * 创建协作请求
 */
export interface CreateCollabRequest {
  context_id: string;
  plan_id: string;
  name: string;
  description?: string;
  mode: CollabMode;
  participants: Omit<CollabParticipant, 'participant_id' | 'joined_at'>[];
  coordination_strategy: CoordinationStrategy;
  decision_making?: DecisionMakingConfig; // 决策制定配置
  council_configuration?: CouncilConfiguration; // 决策议会配置
  metadata?: Record<string, unknown>;
}

/**
 * 更新协作请求
 */
export interface UpdateCollabRequest {
  collaboration_id: string;
  name?: string;
  description?: string;
  mode?: CollabMode;
  coordination_strategy?: Partial<CoordinationStrategy>;
  metadata?: Record<string, unknown>;
}

/**
 * 协作查询参数
 */
export interface CollabQueryParams {
  context_id?: string;
  plan_id?: string;
  status?: EntityStatus;
  mode?: CollabMode;
  created_by?: string;
  limit?: number;
  offset?: number;
  sort_by?: 'created_at' | 'updated_at' | 'name';
  sort_order?: 'asc' | 'desc';
}

/**
 * 协作响应
 */
export interface CollabResponse {
  success: boolean;
  data?: CollabEntity;
  error?: string;
  timestamp: string;
}

/**
 * 协作列表响应
 */
export interface CollabListResponse {
  success: boolean;
  data?: {
    collaborations: CollabEntity[];
    total: number;
    limit: number;
    offset: number;
  };
  error?: string;
  timestamp: string;
}

// ==================== 参与者管理类型 ====================

/**
 * 添加参与者请求
 */
export interface AddParticipantRequest {
  collaboration_id: string;
  agent_id: string;
  role_id: string;
  capabilities: string[];
  priority: number;
  weight: number;
}

/**
 * 移除参与者请求
 */
export interface RemoveParticipantRequest {
  collaboration_id: string;
  participant_id: string;
  reason?: string;
}

/**
 * 更新参与者请求
 */
export interface UpdateParticipantRequest {
  collaboration_id: string;
  participant_id: string;
  capabilities?: string[];
  priority?: number;
  weight?: number;
  status?: EntityStatus;
}

// ==================== 决策制定类型 ====================

/**
 * 投票机制配置
 */
export interface VotingMechanism {
  anonymity: boolean; // 是否匿名投票
  transparency: boolean; // 是否透明投票
  revision_allowed: boolean; // 是否允许修改投票
  time_limit_ms?: number; // 投票时间限制(毫秒)
}

/**
 * 权重策略配置
 */
export interface WeightingStrategyConfig {
  strategy: WeightingStrategy;
  weights?: Record<string, number>; // 参与者权重映射
}

/**
 * 共识要求配置
 */
export interface ConsensusRequirements {
  threshold: number; // 共识阈值(0-1)
  quorum: number; // 最小参与者数量
  unanimity_required?: boolean; // 是否需要一致同意
}

/**
 * 决策制定配置
 */
export interface DecisionMakingConfig {
  enabled: boolean; // 是否启用决策功能
  algorithm?: DecisionAlgorithm; // 决策算法
  voting?: VotingMechanism; // 投票机制
  weighting?: WeightingStrategyConfig; // 权重策略
  consensus?: ConsensusRequirements; // 共识要求
}

/**
 * 议会会话管理配置
 */
export interface SessionManagement {
  max_session_duration_ms: number; // 最大会话时长
  quorum_enforcement: boolean; // 是否强制法定人数
  automatic_adjournment?: boolean; // 是否自动休会
}

/**
 * 投票规则配置
 */
export interface VotingRules {
  multiple_rounds_allowed: boolean; // 是否允许多轮投票
  abstention_allowed: boolean; // 是否允许弃权
  delegation_allowed?: boolean; // 是否允许委托投票
}

/**
 * 决策议会配置
 */
export interface CouncilConfiguration {
  council_type?: CouncilType; // 议会类型
  session_management?: SessionManagement; // 会话管理
  voting_rules?: VotingRules; // 投票规则
}

// ==================== 协调操作类型 ====================

/**
 * 协调操作请求
 */
export interface CoordinationRequest {
  collaboration_id: string;
  operation: CoordinationOperation;
  parameters?: Record<string, unknown>;
  initiated_by: string;
}

/**
 * 协调操作类型
 */
export type CoordinationOperation =
  | 'initiate' // 启动协作
  | 'coordinate' // 协调执行
  | 'synchronize' // 同步状态
  | 'resolve' // 解决冲突
  | 'pause' // 暂停协作
  | 'resume' // 恢复协作
  | 'terminate'; // 终止协作

/**
 * 协调结果
 */
export interface CoordinationResult {
  success: boolean;
  operation: CoordinationOperation;
  collaboration_id: string;
  result?: unknown;
  error?: string;
  timestamp: string;
}

// ==================== 事件类型 ====================

/**
 * 协作事件
 */
export interface CollabEvent {
  event_id: string;
  collaboration_id: string;
  event_type: CollabEventType;
  data: unknown;
  timestamp: string;
  source: string;
}

/**
 * 协作事件类型
 */
export type CollabEventType =
  | 'collaboration_created'
  | 'collaboration_updated'
  | 'collaboration_started'
  | 'collaboration_paused'
  | 'collaboration_resumed'
  | 'collaboration_completed'
  | 'collaboration_failed'
  | 'participant_added'
  | 'participant_removed'
  | 'participant_updated'
  | 'coordination_initiated'
  | 'coordination_completed'
  | 'conflict_detected'
  | 'conflict_resolved';

// ==================== 配置类型 ====================

/**
 * 协作模块配置
 */
export interface CollabModuleConfig {
  max_participants: number;
  default_coordination_timeout: number;
  enable_conflict_detection: boolean;
  enable_performance_monitoring: boolean;
  cache_ttl: number;
  event_retention_days: number;
}

/**
 * 协作性能指标
 */
export interface CollabPerformanceMetrics {
  collaboration_id: string;
  total_participants: number;
  active_participants: number;
  coordination_latency: number;
  throughput: number;
  error_rate: number;
  last_updated: string;
}
