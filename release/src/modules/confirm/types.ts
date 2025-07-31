/**
 * MPLP Confirm模块类型定义
 * 
 * Confirm模块负责确认流程和决策管理，实现审批工作流、风险评估和合规验证
 * 严格按照confirm-protocol.json Schema规范定义
 * 
 * @version v1.0.2
 * @updated 2025-08-05T15:00:00+08:00
 * @compliance 100% Schema合规性 - 完全匹配confirm-protocol.json Schema定义
 * @schema_path src/schemas/confirm-protocol.json
 */

// ===== 导入公共基础类型 =====
import type { UUID, Timestamp, Version, Priority } from '../../types/index';

// ===== 重新导出基础类型 (确保模块可访问) =====
export type { UUID, Timestamp, Version, Priority };

// ===== 基础枚举类型 (完全匹配Schema定义) =====

/**
 * 确认类型 - 定义不同类型的确认流程
 * @schema_path #/properties/confirmation_type/enum
 */
export type ConfirmationType = 
  /** 计划审批 - 用于批准整体计划 */
  | 'plan_approval' 
  /** 任务审批 - 用于批准特定任务 */
  | 'task_approval' 
  /** 里程碑确认 - 用于验证里程碑完成 */
  | 'milestone_confirmation' 
  /** 风险接受 - 用于接受已识别风险 */
  | 'risk_acceptance' 
  /** 资源分配 - 用于批准资源分配 */
  | 'resource_allocation' 
  /** 紧急审批 - 用于紧急情况下的快速审批 */
  | 'emergency_approval';

/**
 * 确认状态 - 表示当前确认流程的状态
 * @schema_path #/properties/status/enum
 */
export type ConfirmStatus =
  /** 待处理 - 确认请求已创建但未开始审核 */
  | 'pending'
  /** 审核中 - 确认请求正在被审核 */
  | 'in_review'
  /** 已批准 - 确认请求已被批准 */
  | 'approved'
  /** 已拒绝 - 确认请求已被拒绝 */
  | 'rejected'
  /** 已取消 - 确认请求已被取消 */
  | 'cancelled'
  /** 已过期 - 确认请求已过期 */
  | 'expired'
  /** 已升级 - 确认请求已被升级 */
  | 'escalated';

/**
 * 确认决策类型
 */
export type ConfirmDecision = 'approved' | 'rejected' | 'escalated';

/**
 * 确认元数据接口
 */
export interface ConfirmMetadata {
  source?: string;
  tags?: string[];
  custom_fields?: Record<string, any>;
  attachments?: Array<{
    name: string;
    url: string;
    type: string;
    size?: number;
  }>;
}

// ===== 请求者信息 (Schema定义) =====

/**
 * 请求者 - 发起确认请求的实体信息
 * @schema_path #/properties/requester
 * @required ["user_id", "role", "request_reason"]
 */
export interface Requester {
  /**
   * 用户ID - 请求者的唯一标识
   * @schema_path #/properties/requester/properties/user_id
   */
  user_id: string;
  
  /**
   * 角色 - 请求者的角色
   * @schema_path #/properties/requester/properties/role
   */
  role: string;
  
  /**
   * 部门 - 请求者所属的部门，可选
   * @schema_path #/properties/requester/properties/department
   */
  department?: string;
  
  /**
   * 请求原因 - 发起确认请求的原因
   * @schema_path #/properties/requester/properties/request_reason
   * 最大长度: 1000字符
   */
  request_reason: string;
}

// ===== 审批工作流 (Schema定义) =====

/**
 * 审批工作流 - 定义确认流程的审批步骤和规则
 * @schema_path #/properties/approval_workflow
 * @required ["workflow_type", "steps"]
 */
export interface ApprovalWorkflow {
  /**
   * 工作流类型 - 定义审批流程的类型
   * @schema_path #/properties/approval_workflow/properties/workflow_type
   */
  workflow_type: WorkflowType;
  
  /**
   * 审批步骤 - 审批流程的各个步骤
   * @schema_path #/properties/approval_workflow/properties/steps
   */
  steps: ApprovalStep[];
  
  /**
   * 升级规则 - 定义何时和如何升级审批请求
   * @schema_path #/properties/approval_workflow/properties/escalation_rules
   */
  escalation_rules?: EscalationRule[];

  /**
   * 自动审批规则 - 定义自动审批的条件
   */
  auto_approval_rules?: {
    enabled: boolean;
    conditions?: string[];
  };
}

/**
 * 工作流类型 - 定义不同类型的审批工作流
 * @schema_path #/properties/approval_workflow/properties/workflow_type/enum
 */
export type WorkflowType = 
  /** 单一审批人 - 只需一个人审批 */
  | 'single_approver' 
  /** 顺序审批 - 按顺序依次审批 */
  | 'sequential' 
  /** 并行审批 - 多人同时审批 */
  | 'parallel' 
  /** 共识审批 - 需要达成一定比例的同意 */
  | 'consensus' 
  /** 升级审批 - 包含升级机制的审批流程 */
  | 'escalation';

/**
 * 审批步骤 - 审批工作流中的单个步骤
 * @schema_path #/properties/approval_workflow/properties/steps/items
 * @required ["step_id", "step_order", "approver", "status"]
 */
export interface ApprovalStep {
  /**
   * 步骤ID - 步骤的唯一标识符
   * @schema_path #/properties/approval_workflow/properties/steps/items/properties/step_id
   */
  step_id: UUID;

  /**
   * 步骤名称 - 步骤的名称
   */
  step_name: string;

  /**
   * 步骤顺序 - 步骤的执行顺序
   * @schema_path #/properties/approval_workflow/properties/steps/items/properties/step_order
   * 最小值: 1
   */
  step_order: number;

  /**
   * 审批者 - 负责此步骤审批的人员
   * @schema_path #/properties/approval_workflow/properties/steps/items/properties/approver
   */
  approver: Approver;

  /**
   * 审批者角色 - 审批者的角色
   */
  approver_role?: string;

  /**
   * 超时时间 - 步骤超时时间（小时）
   */
  timeout_hours?: number;

  /**
   * 是否必需 - 此步骤是否为必需步骤
   */
  is_required?: boolean;

  /**
   * 升级规则 - 步骤的升级规则
   */
  escalation_rules?: {
    enabled: boolean;
    escalation_timeout_hours: number;
    escalation_target: string;
  };
  
  /**
   * 审批标准 - 此步骤的审批标准
   * @schema_path #/properties/approval_workflow/properties/steps/items/properties/approval_criteria
   */
  approval_criteria?: ApprovalCriterion[];
  
  /**
   * 步骤状态 - 此步骤的当前状态
   * @schema_path #/properties/approval_workflow/properties/steps/items/properties/status
   */
  status: StepStatus;
  
  /**
   * 决策 - 审批者的决策结果
   * @schema_path #/properties/approval_workflow/properties/steps/items/properties/decision
   */
  decision?: Decision;
  
  /**
   * 超时设置 - 步骤的超时设置
   * @schema_path #/properties/approval_workflow/properties/steps/items/properties/timeout
   */
  timeout?: StepTimeout;
}

/**
 * 审批者 - 负责审批的人员信息
 * @schema_path #/properties/approval_workflow/properties/steps/items/properties/approver
 * @required ["user_id", "role", "is_required"]
 */
export interface Approver {
  /**
   * 用户ID - 审批者的唯一标识符
   * @schema_path #/properties/approval_workflow/properties/steps/items/properties/approver/properties/user_id
   */
  user_id: string;
  
  /**
   * 角色 - 审批者的角色
   * @schema_path #/properties/approval_workflow/properties/steps/items/properties/approver/properties/role
   */
  role: string;
  
  /**
   * 是否必需 - 此审批者是否必须参与审批
   * @schema_path #/properties/approval_workflow/properties/steps/items/properties/approver/properties/is_required
   */
  is_required: boolean;
  
  /**
   * 是否允许委托 - 是否允许此审批者委托他人审批
   * @schema_path #/properties/approval_workflow/properties/steps/items/properties/approver/properties/delegation_allowed
   */
  delegation_allowed?: boolean;
}

/**
 * 审批标准 - 用于评估审批决策的标准
 * @schema_path #/properties/approval_workflow/properties/steps/items/properties/approval_criteria/items
 * @required ["criterion", "required"]
 */
export interface ApprovalCriterion {
  /**
   * 标准内容 - 审批标准的具体内容
   * @schema_path #/properties/approval_workflow/properties/steps/items/properties/approval_criteria/items/properties/criterion
   */
  criterion: string;
  
  /**
   * 是否必需 - 此标准是否必须满足
   * @schema_path #/properties/approval_workflow/properties/steps/items/properties/approval_criteria/items/properties/required
   */
  required: boolean;
  
  /**
   * 权重 - 此标准在决策中的权重
   * @schema_path #/properties/approval_workflow/properties/steps/items/properties/approval_criteria/items/properties/weight
   * 最小值: 0, 最大值: 1
   */
  weight?: number;
}

/**
 * 步骤状态 - 审批步骤的当前状态
 * @schema_path #/properties/approval_workflow/properties/steps/items/properties/status/enum
 */
export type StepStatus = 
  /** 待处理 - 步骤尚未开始 */
  | 'pending' 
  /** 已批准 - 步骤已获批准 */
  | 'approved' 
  /** 已拒绝 - 步骤已被拒绝 */
  | 'rejected' 
  /** 已委托 - 步骤已委托给他人 */
  | 'delegated' 
  /** 已跳过 - 步骤已被跳过 */
  | 'skipped';

/**
 * 决策 - 审批者的决策结果
 * @schema_path #/properties/approval_workflow/properties/steps/items/properties/decision
 * @required ["outcome", "timestamp"]
 */
export interface Decision {
  /**
   * 决策结果 - 审批者的决定
   * @schema_path #/properties/approval_workflow/properties/steps/items/properties/decision/properties/outcome
   */
  outcome: DecisionOutcome;
  
  /**
   * 评论 - 审批者的评论
   * @schema_path #/properties/approval_workflow/properties/steps/items/properties/decision/properties/comments
   * 最大长度: 2000字符
   */
  comments?: string;
  
  /**
   * 条件 - 审批附带的条件
   * @schema_path #/properties/approval_workflow/properties/steps/items/properties/decision/properties/conditions
   */
  conditions?: string[];
  
  /**
   * 时间戳 - 做出决策的时间
   * @schema_path #/properties/approval_workflow/properties/steps/items/properties/decision/properties/timestamp
   */
  timestamp: Timestamp;
  
  /**
   * 签名 - 决策的数字签名
   * @schema_path #/properties/approval_workflow/properties/steps/items/properties/decision/properties/signature
   */
  signature?: string;
}

/**
 * 决策结果 - 审批者可能的决策类型
 * @schema_path #/properties/approval_workflow/properties/steps/items/properties/decision/properties/outcome/enum
 */
export type DecisionOutcome = 
  /** 批准 - 同意此请求 */
  | 'approve' 
  /** 拒绝 - 不同意此请求 */
  | 'reject' 
  /** 请求修改 - 要求修改后重新提交 */
  | 'request_changes' 
  /** 委托 - 将审批委托给他人 */
  | 'delegate';

/**
 * 步骤超时 - 审批步骤的超时设置
 * @schema_path #/properties/approval_workflow/properties/steps/items/properties/timeout
 * @required ["duration", "unit", "action_on_timeout"]
 */
export interface StepTimeout {
  /**
   * 持续时间 - 超时的时间长度
   * @schema_path #/properties/approval_workflow/properties/steps/items/properties/timeout/properties/duration
   * 最小值: 1
   */
  duration: number;
  
  /**
   * 时间单位 - 持续时间的单位
   * @schema_path #/properties/approval_workflow/properties/steps/items/properties/timeout/properties/unit
   */
  unit: TimeoutUnit;
  
  /**
   * 超时操作 - 超时后执行的操作
   * @schema_path #/properties/approval_workflow/properties/steps/items/properties/timeout/properties/action_on_timeout
   */
  action_on_timeout: TimeoutAction;
}

/**
 * 超时单位 - 超时持续时间的单位
 * @schema_path #/properties/approval_workflow/properties/steps/items/properties/timeout/properties/unit/enum
 */
export type TimeoutUnit = 
  /** 分钟 */
  | 'minutes' 
  /** 小时 */
  | 'hours' 
  /** 天 */
  | 'days';

/**
 * 超时操作 - 超时后执行的操作
 * @schema_path #/properties/approval_workflow/properties/steps/items/properties/timeout/properties/action_on_timeout/enum
 */
export type TimeoutAction = 
  /** 自动批准 - 超时后自动批准 */
  | 'auto_approve' 
  /** 自动拒绝 - 超时后自动拒绝 */
  | 'auto_reject' 
  /** 升级 - 超时后升级到上级 */
  | 'escalate' 
  /** 延长 - 超时后延长时间 */
  | 'extend';

/**
 * 升级规则 - 定义何时和如何升级审批请求
 * @schema_path #/properties/approval_workflow/properties/escalation_rules/items
 * @required ["trigger", "escalate_to"]
 */
export interface EscalationRule {
  /**
   * 触发条件 - 何时触发升级
   * @schema_path #/properties/approval_workflow/properties/escalation_rules/items/properties/trigger
   */
  trigger: EscalationTrigger;
  
  /**
   * 升级目标 - 将请求升级给谁
   * @schema_path #/properties/approval_workflow/properties/escalation_rules/items/properties/escalate_to
   */
  escalate_to: EscalationTarget;
  
  /**
   * 通知延迟 - 升级前的延迟时间（分钟）
   * @schema_path #/properties/approval_workflow/properties/escalation_rules/items/properties/notification_delay
   * 最小值: 0
   */
  notification_delay?: number;
}

/**
 * 升级触发器 - 触发升级的条件
 * @schema_path #/properties/approval_workflow/properties/escalation_rules/items/properties/trigger/enum
 */
export type EscalationTrigger = 
  /** 超时 - 审批步骤超时 */
  | 'timeout' 
  /** 拒绝 - 审批被拒绝 */
  | 'rejection' 
  /** 手动 - 手动触发升级 */
  | 'manual' 
  /** 系统 - 系统自动触发升级 */
  | 'system';

/**
 * 升级目标 - 将请求升级给谁
 * @schema_path #/properties/approval_workflow/properties/escalation_rules/items/properties/escalate_to
 * @required ["user_id", "role"]
 */
export interface EscalationTarget {
  /**
   * 用户ID - 升级目标用户的唯一标识符
   * @schema_path #/properties/approval_workflow/properties/escalation_rules/items/properties/escalate_to/properties/user_id
   */
  user_id: string;
  
  /**
   * 角色 - 升级目标用户的角色
   * @schema_path #/properties/approval_workflow/properties/escalation_rules/items/properties/escalate_to/properties/role
   */
  role: string;
}

// ===== 确认主题 (Schema定义) =====

/**
 * 确认主题 - 确认请求的主题和影响评估
 * @schema_path #/properties/subject
 * @required ["title", "description", "impact_assessment"]
 */
export interface ConfirmSubject {
  /**
   * 标题 - 确认请求的标题
   * @schema_path #/properties/subject/properties/title
   * 最大长度: 255字符
   */
  title: string;
  
  /**
   * 描述 - 确认请求的详细描述
   * @schema_path #/properties/subject/properties/description
   * 最大长度: 2000字符
   */
  description: string;
  
  /**
   * 影响评估 - 确认请求的影响评估
   * @schema_path #/properties/subject/properties/impact_assessment
   */
  impact_assessment: ImpactAssessment;
  
  /**
   * 附件 - 与确认请求相关的附件
   * @schema_path #/properties/subject/properties/attachments
   */
  attachments?: Attachment[];
}

/**
 * 影响评估 - 评估确认请求的影响范围和程度
 * @schema_path #/properties/subject/properties/impact_assessment
 * @required ["scope", "business_impact", "technical_impact"]
 */
export interface ImpactAssessment {
  /**
   * 范围 - 影响的范围
   * @schema_path #/properties/subject/properties/impact_assessment/properties/scope
   */
  scope: ImpactScope;
  
  /**
   * 受影响系统 - 可能受影响的系统列表
   * @schema_path #/properties/subject/properties/impact_assessment/properties/affected_systems
   */
  affected_systems?: string[];
  
  /**
   * 受影响用户 - 可能受影响的用户列表
   * @schema_path #/properties/subject/properties/impact_assessment/properties/affected_users
   */
  affected_users?: string[];
  
  /**
   * 业务影响 - 对业务的影响程度
   * @schema_path #/properties/subject/properties/impact_assessment/properties/business_impact
   */
  business_impact: ImpactLevel;
  
  /**
   * 技术影响 - 对技术系统的影响程度
   * @schema_path #/properties/subject/properties/impact_assessment/properties/technical_impact
   */
  technical_impact: ImpactLevel;
}

/**
 * 影响范围 - 确认请求影响的范围
 * @schema_path #/properties/subject/properties/impact_assessment/properties/scope/enum
 */
export type ImpactScope = 
  /** 任务级 - 影响限于单个任务 */
  | 'task' 
  /** 项目级 - 影响整个项目 */
  | 'project' 
  /** 组织级 - 影响整个组织 */
  | 'organization' 
  /** 外部级 - 影响超出组织边界 */
  | 'external';

/**
 * 影响级别 - 影响的严重程度
 * @schema_path #/properties/subject/properties/impact_assessment/properties/business_impact/enum
 * @schema_path #/properties/subject/properties/impact_assessment/properties/technical_impact/enum
 */
export type ImpactLevel = 
  /** 无影响 - 没有明显影响 */
  | 'none' 
  /** 低影响 - 影响较小，可忽略 */
  | 'low' 
  /** 中影响 - 有一定影响，需关注 */
  | 'medium' 
  /** 高影响 - 影响较大，需重点关注 */
  | 'high' 
  /** 严重影响 - 影响极大，可能导致重大问题 */
  | 'critical';

/**
 * 附件 - 与确认请求相关的文件
 * @schema_path #/properties/subject/properties/attachments/items
 * @required ["file_id", "filename", "mime_type", "size"]
 */
export interface Attachment {
  /**
   * 文件ID - 附件文件的唯一标识符
   * @schema_path #/properties/subject/properties/attachments/items/properties/file_id
   */
  file_id: string;
  
  /**
   * 文件名 - 附件的文件名
   * @schema_path #/properties/subject/properties/attachments/items/properties/filename
   */
  filename: string;
  
  /**
   * MIME类型 - 附件的MIME类型
   * @schema_path #/properties/subject/properties/attachments/items/properties/mime_type
   */
  mime_type: string;
  
  /**
   * 大小 - 附件的大小（字节）
   * @schema_path #/properties/subject/properties/attachments/items/properties/size
   * 最小值: 0
   */
  size: number;
  
  /**
   * 描述 - 附件的描述
   * @schema_path #/properties/subject/properties/attachments/items/properties/description
   */
  description?: string;
}

// ===== 风险评估 (Schema定义) =====

/**
 * 风险评估 - 确认请求相关的风险评估
 * @schema_path #/properties/risk_assessment
 * @required ["overall_risk_level", "risk_factors"]
 */
export interface RiskAssessment {
  /**
   * 整体风险级别 - 确认请求的整体风险评级
   * @schema_path #/properties/risk_assessment/properties/overall_risk_level
   */
  overall_risk_level: RiskLevel;
  
  /**
   * 风险因素 - 确认请求相关的具体风险因素
   * @schema_path #/properties/risk_assessment/properties/risk_factors
   */
  risk_factors: RiskFactor[];
  
  /**
   * 合规要求 - 确认请求相关的合规要求
   * @schema_path #/properties/risk_assessment/properties/compliance_requirements
   */
  compliance_requirements?: ComplianceRequirement[];
}

/**
 * 风险级别 - 风险的严重程度
 * @schema_path #/properties/risk_assessment/properties/overall_risk_level/enum
 */
export type RiskLevel = 
  /** 低风险 - 风险较小，影响有限 */
  | 'low' 
  /** 中风险 - 风险中等，需要关注 */
  | 'medium' 
  /** 高风险 - 风险较大，需要重点关注 */
  | 'high' 
  /** 严重风险 - 风险极高，可能导致严重后果 */
  | 'critical';

/**
 * 风险因素 - 确认请求相关的具体风险因素
 * @schema_path #/properties/risk_assessment/properties/risk_factors/items
 * @required ["factor", "probability", "impact"]
 */
export interface RiskFactor {
  /**
   * 因素 - 风险因素的名称
   * @schema_path #/properties/risk_assessment/properties/risk_factors/items/properties/factor
   */
  factor: string;
  
  /**
   * 描述 - 风险因素的详细描述
   * @schema_path #/properties/risk_assessment/properties/risk_factors/items/properties/description
   */
  description?: string;
  
  /**
   * 概率 - 风险发生的概率（0-1）
   * @schema_path #/properties/risk_assessment/properties/risk_factors/items/properties/probability
   * 最小值: 0, 最大值: 1
   */
  probability: number;
  
  /**
   * 影响 - 风险发生的影响程度
   * @schema_path #/properties/risk_assessment/properties/risk_factors/items/properties/impact
   */
  impact: ImpactLevel;
  
  /**
   * 缓解措施 - 降低风险的措施
   * @schema_path #/properties/risk_assessment/properties/risk_factors/items/properties/mitigation
   */
  mitigation?: string;
}

/**
 * 合规要求 - 确认请求相关的合规要求
 * @schema_path #/properties/risk_assessment/properties/compliance_requirements/items
 * @required ["regulation", "requirement", "compliance_status"]
 */
export interface ComplianceRequirement {
  /**
   * 法规 - 适用的法规或标准
   * @schema_path #/properties/risk_assessment/properties/compliance_requirements/items/properties/regulation
   */
  regulation: string;
  
  /**
   * 要求 - 具体的合规要求
   * @schema_path #/properties/risk_assessment/properties/compliance_requirements/items/properties/requirement
   */
  requirement: string;
  
  /**
   * 合规状态 - 当前的合规状态
   * @schema_path #/properties/risk_assessment/properties/compliance_requirements/items/properties/compliance_status
   */
  compliance_status: ComplianceStatus;
  
  /**
   * 证据 - 支持合规状态的证据
   * @schema_path #/properties/risk_assessment/properties/compliance_requirements/items/properties/evidence
   */
  evidence?: string;
}

/**
 * 合规状态 - 合规要求的当前状态
 * @schema_path #/properties/risk_assessment/properties/compliance_requirements/items/properties/compliance_status/enum
 */
export type ComplianceStatus = 
  /** 合规 - 完全符合要求 */
  | 'compliant' 
  /** 不合规 - 不符合要求 */
  | 'non_compliant' 
  /** 部分合规 - 部分符合要求 */
  | 'partially_compliant' 
  /** 不适用 - 要求不适用 */
  | 'not_applicable';

// ===== 通知设置 (Schema定义) =====

/**
 * 通知设置 - 确认流程的通知配置
 * @schema_path #/properties/notification_settings
 * @required ["notify_on_events", "notification_channels"]
 */
export interface NotificationSettings {
  /**
   * 通知事件 - 触发通知的事件
   * @schema_path #/properties/notification_settings/properties/notify_on_events
   */
  notify_on_events: NotificationEvent[];
  
  /**
   * 通知渠道 - 发送通知的渠道
   * @schema_path #/properties/notification_settings/properties/notification_channels
   */
  notification_channels: NotificationChannel[];
  
  /**
   * 相关方 - 需要接收通知的相关方
   * @schema_path #/properties/notification_settings/properties/stakeholders
   */
  stakeholders?: NotificationStakeholder[];
}

/**
 * 通知事件 - 触发通知的事件类型
 * @schema_path #/properties/notification_settings/properties/notify_on_events/items/enum
 */
export type NotificationEvent = 
  /** 创建 - 确认请求创建时 */
  | 'created' 
  /** 批准 - 确认请求批准时 */
  | 'approved' 
  /** 拒绝 - 确认请求拒绝时 */
  | 'rejected' 
  /** 超时 - 确认请求超时时 */
  | 'timeout' 
  /** 升级 - 确认请求升级时 */
  | 'escalated' 
  /** 取消 - 确认请求取消时 */
  | 'cancelled';

/**
 * 通知渠道 - 发送通知的渠道
 * @schema_path #/properties/notification_settings/properties/notification_channels/items/enum
 */
export type NotificationChannel = 
  /** 电子邮件 */
  | 'email' 
  /** 短信 */
  | 'sms' 
  /** 网络钩子 */
  | 'webhook' 
  /** 应用内通知 */
  | 'in_app' 
  /** Slack消息 */
  | 'slack';

/**
 * 通知相关方 - 需要接收通知的相关方
 * @schema_path #/properties/notification_settings/properties/stakeholders/items
 * @required ["user_id", "role", "notification_preference"]
 */
export interface NotificationStakeholder {
  /**
   * 用户ID - 相关方的唯一标识符
   * @schema_path #/properties/notification_settings/properties/stakeholders/items/properties/user_id
   */
  user_id: string;
  
  /**
   * 角色 - 相关方的角色
   * @schema_path #/properties/notification_settings/properties/stakeholders/items/properties/role
   */
  role: string;
  
  /**
   * 通知偏好 - 相关方的通知偏好
   * @schema_path #/properties/notification_settings/properties/stakeholders/items/properties/notification_preference
   */
  notification_preference: NotificationPreference;
}

/**
 * 通知偏好 - 相关方的通知偏好设置
 * @schema_path #/properties/notification_settings/properties/stakeholders/items/properties/notification_preference/enum
 */
export type NotificationPreference = 
  /** 所有 - 接收所有通知 */
  | 'all' 
  /** 重要 - 只接收重要通知 */
  | 'important' 
  /** 关键 - 只接收关键通知 */
  | 'critical' 
  /** 无 - 不接收任何通知 */
  | 'none';

// ===== 审计追踪 (Schema定义) =====

/**
 * 审计追踪 - 记录确认流程中的事件和变更
 * @schema_path #/properties/audit_trail/items
 * @required ["event_id", "timestamp", "event_type", "actor"]
 */
export interface AuditTrail {
  /**
   * 事件ID - 审计事件的唯一标识符
   * @schema_path #/properties/audit_trail/items/properties/event_id
   */
  event_id: UUID;
  
  /**
   * 时间戳 - 事件发生的时间
   * @schema_path #/properties/audit_trail/items/properties/timestamp
   */
  timestamp: Timestamp;
  
  /**
   * 事件类型 - 审计事件的类型
   * @schema_path #/properties/audit_trail/items/properties/event_type
   */
  event_type: AuditEventType;
  
  /**
   * 操作者 - 执行操作的用户或系统
   * @schema_path #/properties/audit_trail/items/properties/actor
   */
  actor: AuditActor;
  
  /**
   * 变更 - 事件中发生的变更
   * @schema_path #/properties/audit_trail/items/properties/changes
   */
  changes?: AuditChanges;
  
  /**
   * 描述 - 事件的文字描述
   * @schema_path #/properties/audit_trail/items/properties/description
   * 最大长度: 500字符
   */
  description?: string;
}

/**
 * 审计事件类型 - 定义确认流程中可能发生的事件类型
 * @schema_path #/properties/audit_trail/items/properties/event_type/enum
 */
export type AuditEventType = 
  /** 创建 - 确认请求被创建 */
  | 'created' 
  /** 更新 - 确认请求被更新 */
  | 'updated' 
  /** 批准 - 确认请求被批准 */
  | 'approved' 
  /** 拒绝 - 确认请求被拒绝 */
  | 'rejected' 
  /** 升级 - 确认请求被升级 */
  | 'escalated' 
  /** 取消 - 确认请求被取消 */
  | 'cancelled' 
  /** 超时 - 确认请求超时 */
  | 'timeout';

/**
 * 审计操作者 - 执行操作的用户或系统信息
 * @schema_path #/properties/audit_trail/items/properties/actor
 * @required ["user_id", "role"]
 */
export interface AuditActor {
  /**
   * 用户ID - 操作者的唯一标识符
   * @schema_path #/properties/audit_trail/items/properties/actor/properties/user_id
   */
  user_id: string;
  
  /**
   * 角色 - 操作者的角色
   * @schema_path #/properties/audit_trail/items/properties/actor/properties/role
   */
  role: string;
  
  /**
   * IP地址 - 操作者的IP地址
   * @schema_path #/properties/audit_trail/items/properties/actor/properties/ip_address
   */
  ip_address?: string;
  
  /**
   * 用户代理 - 操作者的用户代理字符串
   * @schema_path #/properties/audit_trail/items/properties/actor/properties/user_agent
   */
  user_agent?: string;
}

/**
 * 审计变更 - 记录事件中发生的字段变更
 * @schema_path #/properties/audit_trail/items/properties/changes
 */
export interface AuditChanges {
  /**
   * 字段 - 变更的字段名称
   * @schema_path #/properties/audit_trail/items/properties/changes/properties/field
   */
  field?: string;
  
  /**
   * 旧值 - 字段的原始值
   * @schema_path #/properties/audit_trail/items/properties/changes/properties/old_value
   */
  old_value?: string | number | boolean | null;
  
  /**
   * 新值 - 字段的新值
   * @schema_path #/properties/audit_trail/items/properties/changes/properties/new_value
   */
  new_value?: string | number | boolean | null;
}

/**
 * Confirm协议 - 定义完整的确认请求结构
 * 实现审批工作流、风险评估和合规验证
 * 
 * @schema_path # (根对象)
 * @required ["protocol_version", "timestamp", "confirm_id", "context_id", "confirmation_type", "status", "priority"]
 */
export interface ConfirmProtocol {
  /** 
   * MPLP协议版本 - 遵循语义化版本规范
   * @schema_path #/properties/protocol_version 
   * 当前固定值: "1.0.1"
   */
  protocol_version: Version;
  
  /** 
   * 协议消息时间戳 - ISO 8601格式
   * @schema_path #/properties/timestamp 
   */
  timestamp: Timestamp;
  
  /** 
   * 确认唯一标识符 - UUID格式
   * @schema_path #/properties/confirm_id 
   */
  confirm_id: UUID;
  
  /** 
   * 关联的上下文ID - UUID格式
   * @schema_path #/properties/context_id 
   */
  context_id: UUID;
  
  /** 
   * 关联的计划ID - UUID格式，可选
   * @schema_path #/properties/plan_id 
   */
  plan_id?: UUID;
  
  /** 
   * 确认类型 - 表示确认流程的类型
   * @schema_path #/properties/confirmation_type 
   */
  confirmation_type: ConfirmationType;
  
  /** 
   * 确认状态 - 表示确认流程的当前状态
   * @schema_path #/properties/status 
   */
  status: ConfirmStatus;
  
  /** 
   * 确认优先级 - 表示确认流程的优先级
   * @schema_path #/properties/priority 
   */
  priority: Priority;
  
  /** 
   * 请求者信息 - 发起确认请求的实体信息
   * @schema_path #/properties/requester 
   */
  requester?: Requester;
  
  /** 
   * 审批工作流 - 定义确认流程的审批步骤和规则
   * @schema_path #/properties/approval_workflow 
   */
  approval_workflow?: ApprovalWorkflow;
  
  /** 
   * 确认主题 - 确认请求的主题和影响评估
   * @schema_path #/properties/subject 
   */
  subject?: ConfirmSubject;
  
  /** 
   * 风险评估 - 与确认请求相关的风险评估
   * @schema_path #/properties/risk_assessment 
   */
  risk_assessment?: RiskAssessment;
  
  /** 
   * 通知设置 - 与确认流程相关的通知配置
   * @schema_path #/properties/notification_settings 
   */
  notification_settings?: NotificationSettings;
  
  /** 
   * 审计追踪 - 确认流程的审计记录
   * @schema_path #/properties/audit_trail 
   */
  audit_trail?: AuditTrail[];
}

/**
 * 主题类型别名 - 为了保持向后兼容而保留ConfirmSubject名称，同时提供与Schema一致的命名
 * @schema_path #/properties/subject
 */
export type Subject = ConfirmSubject;

// ===== API请求和响应类型 (应用层实现) =====

/**
 * 创建确认请求 - API请求类型
 * @implementation 应用层API类型，非Schema定义
 */
export interface CreateConfirmRequest {
  /**
   * 关联的上下文ID - UUID格式
   * @implementation 对应Schema: #/properties/context_id
   */
  context_id: UUID;
  
  /**
   * 关联的计划ID - UUID格式，可选
   * @implementation 对应Schema: #/properties/plan_id
   */
  plan_id?: UUID;
  
  /**
   * 确认类型 - 表示确认流程的类型
   * @implementation 对应Schema: #/properties/confirmation_type
   */
  confirmation_type: ConfirmationType;
  
  /**
   * 确认优先级 - 表示确认流程的优先级
   * @implementation 对应Schema: #/properties/priority
   */
  priority: Priority;
  
  /**
   * 请求者信息 - 发起确认请求的实体信息
   * @implementation 对应Schema: #/properties/requester
   */
  requester?: Requester;
  
  /**
   * 审批工作流 - 定义确认流程的审批步骤和规则
   * @implementation 对应Schema: #/properties/approval_workflow
   */
  approval_workflow?: ApprovalWorkflow;
  
  /**
   * 确认主题 - 确认请求的主题和影响评估
   * @implementation 对应Schema: #/properties/subject
   */
  subject?: ConfirmSubject;
  
  /**
   * 风险评估 - 与确认请求相关的风险评估
   * @implementation 对应Schema: #/properties/risk_assessment
   */
  risk_assessment?: RiskAssessment;
  
  /**
   * 通知设置 - 与确认流程相关的通知配置
   * @implementation 对应Schema: #/properties/notification_settings
   */
  notification_settings?: NotificationSettings;
}

/**
 * 更新确认请求 - API请求类型
 * @implementation 应用层API类型，非Schema定义
 */
export interface UpdateConfirmRequest {
  /**
   * 确认ID - 要更新的确认请求ID
   * @implementation 对应Schema: #/properties/confirm_id
   */
  confirm_id: UUID;
  
  /**
   * 确认状态 - 要更新的确认状态
   * @implementation 对应Schema: #/properties/status
   */
  status?: ConfirmStatus;
  
  /**
   * 确认优先级 - 要更新的优先级
   * @implementation 对应Schema: #/properties/priority
   */
  priority?: Priority;
  
  /**
   * 确认主题 - 要更新的主题信息（部分更新）
   * @implementation 对应Schema: #/properties/subject
   */
  subject?: Partial<ConfirmSubject>;
  
  /**
   * 通知设置 - 要更新的通知设置（部分更新）
   * @implementation 对应Schema: #/properties/notification_settings
   */
  notification_settings?: Partial<NotificationSettings>;
}

/**
 * 确认响应 - API响应类型
 * @implementation 应用层API类型，非Schema定义
 */
export interface ConfirmResponse {
  /**
   * 成功标志 - 操作是否成功
   * @implementation 应用层字段
   */
  success: boolean;
  
  /**
   * 响应数据 - 确认协议数据
   * @implementation 应用层字段，包含Schema定义的数据
   */
  data?: ConfirmProtocol;
  
  /**
   * 错误信息 - 操作失败时的错误详情
   * @implementation 应用层字段
   */
  error?: {
    /**
     * 错误代码 - 错误类型标识符
     * @implementation 应用层字段
     */
    code: string;
    
    /**
     * 错误消息 - 人类可读的错误描述
     * @implementation 应用层字段
     */
    message: string;
    
    /**
     * 错误详情 - 额外的错误信息
     * @implementation 应用层字段
     */
    details?: unknown;
  };
  
  /**
   * 元数据 - 关于请求处理的附加信息
   * @implementation 应用层字段
   */
  metadata?: {
    /**
     * 请求ID - 请求的唯一标识符
     * @implementation 应用层字段
     */
    request_id: string;
    
    /**
     * 处理时间 - 请求处理耗时（毫秒）
     * @implementation 应用层字段
     */
    processing_time_ms: number;
    
    /**
     * 跟踪ID - 用于分布式追踪的ID
     * @implementation 应用层字段
     */
    trace_id: string;
  };
}

/**
 * 确认过滤器 - 用于查询确认请求的过滤条件
 * @implementation 应用层API类型，非Schema定义
 */
export interface ConfirmFilter {
  /**
   * 确认ID列表 - 根据ID过滤
   * @implementation 应用层字段
   */
  confirm_ids?: UUID[];
  
  /**
   * 上下文ID - 单个上下文过滤
   * @implementation 应用层字段
   */
  context_id?: UUID;

  /**
   * 上下文ID列表 - 根据上下文过滤
   * @implementation 应用层字段
   */
  context_ids?: UUID[];
  
  /**
   * 计划ID - 单个计划过滤
   * @implementation 应用层字段
   */
  plan_id?: UUID;

  /**
   * 计划ID列表 - 根据计划过滤
   * @implementation 应用层字段
   */
  plan_ids?: UUID[];

  /**
   * 确认类型 - 单个类型过滤
   * @implementation 应用层字段
   */
  confirmation_type?: ConfirmationType;

  /**
   * 确认类型列表 - 根据类型过滤
   * @implementation 应用层字段
   */
  confirmation_types?: ConfirmationType[];

  /**
   * 状态 - 单个状态过滤
   * @implementation 应用层字段
   */
  status?: ConfirmStatus;

  /**
   * 状态列表 - 根据状态过滤
   * @implementation 应用层字段
   */
  statuses?: ConfirmStatus[];

  /**
   * 优先级 - 单个优先级过滤
   * @implementation 应用层字段
   */
  priority?: Priority;

  /**
   * 优先级列表 - 根据优先级过滤
   * @implementation 应用层字段
   */
  priorities?: Priority[];
  
  /**
   * 请求者用户ID - 单个请求者过滤
   * @implementation 应用层字段
   */
  requester_user_id?: string;

  /**
   * 请求者用户ID列表 - 根据请求者过滤
   * @implementation 应用层字段
   */
  requester_user_ids?: string[];

  /**
   * 创建时间下限 - 在此时间之后创建
   * @implementation 应用层字段
   */
  created_after?: Timestamp;

  /**
   * 创建时间上限 - 在此时间之前创建
   * @implementation 应用层字段
   */
  created_before?: Timestamp;

  /**
   * 过期时间下限 - 在此时间之后过期
   * @implementation 应用层字段
   */
  expires_after?: Timestamp;

  /**
   * 过期时间上限 - 在此时间之前过期
   * @implementation 应用层字段
   */
  expires_before?: Timestamp;
}

/**
 * 批量确认请求 - 用于批量创建确认请求
 * @implementation 应用层API类型，非Schema定义
 */
export interface BatchConfirmRequest {
  /**
   * 请求数组 - 批量创建的确认请求列表
   * @implementation 应用层字段
   */
  requests: CreateConfirmRequest[];
  
  /**
   * 批处理选项 - 批量处理的行为配置
   * @implementation 应用层字段
   */
  batch_options?: {
    /**
     * 并行处理 - 是否并行处理请求
     * @implementation 应用层字段
     */
    parallel_processing: boolean;
    
    /**
     * 遇错停止 - 是否在出错时停止处理
     * @implementation 应用层字段
     */
    stop_on_error: boolean;
    
    /**
     * 通知合并 - 是否合并通知
     * @implementation 应用层字段
     */
    notification_consolidation: boolean;
  };
}

/**
 * 批量确认响应 - 批量创建确认请求的响应
 * @implementation 应用层API类型，非Schema定义
 */
export interface BatchConfirmResponse {
  /**
   * 成功标志 - 整体操作是否成功
   * @implementation 应用层字段
   */
  success: boolean;
  
  /**
   * 结果数组 - 每个确认请求的处理结果
   * @implementation 应用层字段
   */
  results: ConfirmResponse[];
  
  /**
   * 汇总信息 - 批量处理的统计信息
   * @implementation 应用层字段
   */
  summary: {
    /**
     * 总数 - 请求总数
     * @implementation 应用层字段
     */
    total: number;
    
    /**
     * 成功数 - 成功处理的请求数
     * @implementation 应用层字段
     */
    succeeded: number;
    
    /**
     * 失败数 - 处理失败的请求数
     * @implementation 应用层字段
     */
    failed: number;
    
    /**
     * 处理时间 - 总处理耗时（毫秒）
     * @implementation 应用层字段
     */
    processing_time_ms: number;
  };
  
  /**
   * 错误信息 - 批量处理中的通用错误
   * @implementation 应用层字段
   */
  error?: {
    /**
     * 错误代码 - 错误类型标识符
     * @implementation 应用层字段
     */
    code: string;
    
    /**
     * 错误消息 - 人类可读的错误描述
     * @implementation 应用层字段
     */
    message: string;
    
    /**
     * 错误详情 - 额外的错误信息
     * @implementation 应用层字段
     */
    details?: unknown;
  };
}

/**
 * 步骤操作请求 - 用于执行审批步骤操作
 * @implementation 应用层API类型，非Schema定义
 */
export interface StepActionRequest {
  /**
   * 步骤ID - 要操作的步骤ID
   * @implementation 应用层字段
   */
  step_id: UUID;
  
  /**
   * 操作 - 要执行的操作类型
   * @implementation 应用层字段
   */
  action: DecisionOutcome;
  
  /**
   * 评论 - 操作的附加评论
   * @implementation 应用层字段
   */
  comments?: string;
  
  /**
   * 条件 - 操作附带的条件
   * @implementation 应用层字段
   */
  conditions?: string[];
  
  /**
   * 签名 - 操作的数字签名
   * @implementation 应用层字段
   */
  signature?: string;
}

/**
 * 工作流操作响应 - 执行工作流操作的响应
 * @implementation 应用层API类型，非Schema定义
 */
export interface WorkflowActionResponse {
  /**
   * 成功标志 - 操作是否成功
   * @implementation 应用层字段
   */
  success: boolean;
  
  /**
   * 更新后的确认 - 操作后的确认数据
   * @implementation 应用层字段
   */
  updated_confirmation: ConfirmProtocol;
  
  /**
   * 下一步 - 工作流的下一步骤
   * @implementation 应用层字段
   */
  next_steps?: ApprovalStep[];
  
  /**
   * 工作流完成 - 工作流是否已完成
   * @implementation 应用层字段
   */
  workflow_completed: boolean;
}

/**
 * 确认健康状态 - 确认模块的健康状态
 * @implementation 应用层API类型，非Schema定义
 */
export interface ConfirmHealthStatus {
  /**
   * 状态 - 整体健康状态
   * @implementation 应用层字段
   */
  status: 'healthy' | 'unhealthy';
  
  /**
   * 检查结果 - 各组件的健康状态
   * @implementation 应用层字段
   */
  checks: {
    /**
     * 适配器状态 - 确认适配器的健康状态
     * @implementation 应用层字段
     */
    adapter: 'pass' | 'fail';
    
    /**
     * 数据库状态 - 数据库的健康状态
     * @implementation 应用层字段
     */
    database: 'pass' | 'fail';
    
    /**
     * 通知状态 - 通知系统的健康状态
     * @implementation 应用层字段
     */
    notification: 'pass' | 'fail';
    
    /**
     * 工作流状态 - 工作流系统的健康状态
     * @implementation 应用层字段
     */
    workflow: 'pass' | 'fail';
    
    /**
     * 系统状态 - 系统整体的健康状态，可选
     * @implementation 应用层字段
     */
    system?: 'pass' | 'fail';
  };
}

/**
 * 确认操作结果 - 确认操作的结果
 * @implementation 应用层API类型，非Schema定义
 */
export interface ConfirmOperationResult {
  /**
   * 成功标志 - 操作是否成功
   * @implementation 应用层字段
   */
  success: boolean;
  
  /**
   * 确认对象 - 操作成功时返回的确认对象
   * @implementation 应用层字段
   */
  confirm?: ConfirmProtocol;
  
  /**
   * 错误信息 - 操作失败时的错误信息
   * @implementation 应用层字段
   */
  error?: {
    /**
     * 错误代码 - 错误类型标识符
     * @implementation 应用层字段
     */
    code: string;
    
    /**
     * 错误消息 - 人类可读的错误描述
     * @implementation 应用层字段
     */
    message: string;
    
    /**
     * 错误详情 - 额外的错误信息
     * @implementation 应用层字段
     */
    details?: unknown;
  };
  
  /**
   * 元数据 - 关于请求处理的附加信息
   * @implementation 应用层字段
   */
  metadata?: {
    /**
     * 请求ID - 请求的唯一标识符
     * @implementation 应用层字段
     */
    request_id: string;
    
    /**
     * 处理时间 - 请求处理耗时（毫秒）
     * @implementation 应用层字段
     */
    processing_time_ms: number;
    
    /**
     * 跟踪ID - 用于分布式追踪的ID
     * @implementation 应用层字段
     */
    trace_id: string;
  };
}

/**
 * 确认查询结果 - 确认查询的结果
 * @implementation 应用层API类型，非Schema定义
 */
export interface ConfirmQueryResult {
  /**
   * 确认详情列表 - 查询结果列表
   * @implementation 应用层字段
   */
  items: ConfirmDetail[];
  
  /**
   * 总数 - 满足条件的确认总数
   * @implementation 应用层字段
   */
  total: number;
  
  /**
   * 页码 - 当前页码
   * @implementation 应用层字段
   */
  page: number;
  
  /**
   * 页大小 - 每页记录数
   * @implementation 应用层字段
   */
  page_size: number;
  
  /**
   * 总页数 - 总页数
   * @implementation 应用层字段
   */
  total_pages: number;
}

/**
 * 确认详情 - 确认的简要信息
 * @implementation 应用层API类型，非Schema定义
 */
export interface ConfirmDetail {
  /**
   * 确认ID - 确认的唯一标识符
   * @implementation 应用层字段
   */
  confirm_id: UUID;
  
  /**
   * 上下文ID - 关联的上下文ID
   * @implementation 应用层字段
   */
  context_id: UUID;
  
  /**
   * 确认类型 - 确认的类型
   * @implementation 应用层字段
   */
  confirmation_type: ConfirmationType;
  
  /**
   * 状态 - 确认的当前状态
   * @implementation 应用层字段
   */
  status: ConfirmStatus;
  
  /**
   * 优先级 - 确认的优先级
   * @implementation 应用层字段
   */
  priority: Priority;
  
  /**
   * 创建时间 - 确认的创建时间
   * @implementation 应用层字段
   */
  created_at: Timestamp;
  
  /**
   * 更新时间 - 确认的最后更新时间
   * @implementation 应用层字段
   */
  updated_at: Timestamp;
}

// ===== 错误处理类型 (应用层实现) =====

/**
 * 确认错误代码 - 确认模块的错误代码枚举
 * @implementation 应用层错误处理，非Schema定义
 */
export enum ConfirmErrorCode {
  /** 确认未找到 - 指定的确认ID不存在 */
  CONFIRM_NOT_FOUND = 'CONFIRM_NOT_FOUND',
  
  /** 确认已存在 - 尝试创建的确认已经存在 */
  CONFIRM_ALREADY_EXISTS = 'CONFIRM_ALREADY_EXISTS',
  
  /** 确认数据无效 - 提供的确认数据无效 */
  INVALID_CONFIRM_DATA = 'INVALID_CONFIRM_DATA',
  
  /** 审批步骤未找到 - 指定的步骤ID不存在 */
  APPROVAL_STEP_NOT_FOUND = 'APPROVAL_STEP_NOT_FOUND',
  
  /** 审批者未授权 - 用户无权执行该审批操作 */
  UNAUTHORIZED_APPROVER = 'UNAUTHORIZED_APPROVER',
  
  /** 工作流验证失败 - 工作流定义或状态无效 */
  WORKFLOW_VALIDATION_FAILED = 'WORKFLOW_VALIDATION_FAILED',
  
  /** 审批超时已超出 - 步骤已超过审批期限 */
  APPROVAL_TIMEOUT_EXCEEDED = 'APPROVAL_TIMEOUT_EXCEEDED',
  
  /** 升级失败 - 工作流升级操作失败 */
  ESCALATION_FAILED = 'ESCALATION_FAILED',
  
  /** 上下文未找到 - 指定的上下文ID不存在 */
  CONTEXT_NOT_FOUND = 'CONTEXT_NOT_FOUND',
  
  /** 计划未找到 - 指定的计划ID不存在 */
  PLAN_NOT_FOUND = 'PLAN_NOT_FOUND',
  
  /** 访问被拒绝 - 用户无权访问该资源 */
  ACCESS_DENIED = 'ACCESS_DENIED',
  
  /** 内部错误 - 服务器内部错误 */
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  
  /** Schema验证失败 - 数据不符合Schema定义 */
  SCHEMA_VALIDATION_FAILED = 'SCHEMA_VALIDATION_FAILED',
}

/**
 * 确认错误 - 确认模块的基础错误类
 * @implementation 应用层错误处理，非Schema定义
 */
export class ConfirmError extends Error {
  /**
   * 创建确认错误实例
   * @param code 错误代码
   * @param message 错误消息
   * @param details 错误详情
   */
  constructor(
    public code: ConfirmErrorCode,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ConfirmError';
    
    // 兼容ES5
    Object.setPrototypeOf(this, ConfirmError.prototype);
  }
}

/**
 * 验证错误 - 数据验证失败时的错误
 * @implementation 应用层错误处理，非Schema定义
 */
export class ValidationError extends ConfirmError {
  /**
   * 创建验证错误实例
   * @param message 错误消息
   * @param details 验证错误详情
   */
  constructor(message: string, details?: unknown) {
    super(ConfirmErrorCode.SCHEMA_VALIDATION_FAILED, message, details);
    this.name = 'ValidationError';
    
    // 兼容ES5
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * 工作流错误 - 工作流操作失败时的错误
 * @implementation 应用层错误处理，非Schema定义
 */
export class WorkflowError extends ConfirmError {
  /**
   * 创建工作流错误实例
   * @param message 错误消息
   * @param details 工作流错误详情
   */
  constructor(message: string, details?: unknown) {
    super(ConfirmErrorCode.WORKFLOW_VALIDATION_FAILED, message, details);
    this.name = 'WorkflowError';
    
    // 兼容ES5
    Object.setPrototypeOf(this, WorkflowError.prototype);
  }
}

/**
 * 权限错误 - 权限验证失败时的错误
 * @implementation 应用层错误处理，非Schema定义
 */
export class PermissionError extends ConfirmError {
  /**
   * 创建权限错误实例
   * @param message 错误消息
   * @param details 权限错误详情
   */
  constructor(message: string, details?: unknown) {
    super(ConfirmErrorCode.ACCESS_DENIED, message, details);
    this.name = 'PermissionError';
    
    // 兼容ES5
    Object.setPrototypeOf(this, PermissionError.prototype);
  }
} 