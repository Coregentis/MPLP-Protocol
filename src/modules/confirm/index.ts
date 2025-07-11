/**
 * MPLP Confirm模块导出接口
 * 
 * Confirm模块负责验证决策和审批管理
 * 所有导出类型都严格按照 confirm-protocol.json Schema规范定义
 * 
 * @version v1.0.1
 * @updated 2025-07-10T17:15:00+08:00
 * @compliance 100% Schema合规性 - 完全匹配confirm-protocol.json Schema定义
 */

// ===== 基础类型重新导出 =====
export type {
  UUID,
  Timestamp,
  Version,
  Priority
} from './types';

// ===== 核心协议接口 =====
export type {
  ConfirmProtocol
} from './types';

// ===== 状态和枚举类型 =====
export type {
  ConfirmationType,
  ConfirmStatus,
  WorkflowType,
  StepStatus,
  DecisionOutcome,
  TimeoutUnit,
  TimeoutAction,
  EscalationTrigger,
  ImpactScope,
  ImpactLevel,
  RiskLevel,
  ComplianceStatus,
  NotificationEvent,
  NotificationChannel,
  NotificationPreference,
  AuditEventType
} from './types';

// ===== 结构化数据类型 =====
export type {
  Requester,
  ApprovalWorkflow,
  ApprovalStep,
  Approver,
  ApprovalCriterion,
  Decision,
  StepTimeout,
  EscalationRule,
  EscalationTarget,
  ConfirmSubject,
  ImpactAssessment,
  Attachment,
  RiskAssessment,
  RiskFactor,
  ComplianceRequirement
} from './types';

// ===== 通知和审计类型 =====
export type {
  NotificationSettings,
  NotificationStakeholder,
  AuditTrail,
  AuditActor,
  AuditChanges
} from './types';

// ===== API接口类型 =====
export type {
  CreateConfirmRequest,
  UpdateConfirmRequest,
  ConfirmResponse,
  BatchConfirmRequest,
  BatchConfirmResponse,
  ConfirmFilter,
  StepActionRequest,
  WorkflowActionResponse
} from './types';

// ===== 错误处理类型 =====
export {
  ConfirmErrorCode,
  ConfirmError,
  ValidationError,
  WorkflowError,
  PermissionError
} from './types';

// ===== 服务实现 =====
export { ConfirmService } from './confirm-service';
export { ConfirmController } from './confirm.controller';
export { ConfirmManager } from './confirm-manager'; 