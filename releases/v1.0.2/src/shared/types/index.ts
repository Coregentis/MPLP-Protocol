/**
 * 统一类型定义
 */

// 基础类型
export type UUID = string;
export type Timestamp = string;
export type ISO8601DateTime = string;
export type Version = string;

// 实体状态
export enum EntityStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  DELETED = 'deleted'
}

// 结果类型
export interface Result<T, E = Error> {
  success: boolean;
  data?: T;
  error?: E;
}

// 分页类型
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Context相关类型
export enum ContextLifecycleStage {
  INITIALIZATION = 'initialization',
  PLANNING = 'planning',
  EXECUTION = 'execution',
  MONITORING = 'monitoring',
  COMPLETION = 'completion'
}

export interface ContextOperationResult {
  success: boolean;
  data?: any;
  error?: string;
}

// Confirm相关类型
export enum ConfirmStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  EXPIRED = 'expired'
}

export enum ConfirmationType {
  MANUAL = 'manual',
  AUTOMATIC = 'automatic',
  CONDITIONAL = 'conditional'
}

export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Extension相关类型
export enum ExtensionStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ERROR = 'error'
}

export enum ExtensionType {
  PLUGIN = 'plugin',
  MIDDLEWARE = 'middleware',
  ADAPTER = 'adapter'
}

export interface ExtensionPoint {
  name: string;
  version: string;
}

export interface ApiExtension {
  id: string;
  name: string;
  version: string;
}

// Role相关类型
export enum RoleStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended'
}

export enum RoleType {
  ADMIN = 'admin',
  USER = 'user',
  AGENT = 'agent'
}

export enum ResourceType {
  CONTEXT = 'context',
  PLAN = 'plan',
  TRACE = 'trace'
}

export enum PermissionAction {
  READ = 'read',
  WRITE = 'write',
  DELETE = 'delete',
  EXECUTE = 'execute'
}

export interface Permission {
  resource: ResourceType;
  action: PermissionAction;
}

// Trace相关类型
export enum TraceType {
  EVENT = 'event',
  ERROR = 'error',
  PERFORMANCE = 'performance'
}

export enum TraceSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum EventType {
  USER_ACTION = 'user_action',
  SYSTEM_EVENT = 'system_event',
  API_CALL = 'api_call'
}

// Plan相关类型 (从plan-types导入的类型)
export enum PlanStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export enum ExecutionStrategy {
  SEQUENTIAL = 'sequential',
  PARALLEL = 'parallel',
  CONDITIONAL = 'conditional'
}

export enum OptimizationStrategy {
  SPEED = 'speed',
  QUALITY = 'quality',
  BALANCED = 'balanced'
}

export enum DependencyType {
  HARD = 'hard',
  SOFT = 'soft',
  OPTIONAL = 'optional'
}

export enum DependencyCriticality {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum MilestoneStatus {
  PENDING = 'pending',
  ACHIEVED = 'achieved',
  MISSED = 'missed'
}

export enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum RiskCategory {
  TECHNICAL = 'technical',
  BUSINESS = 'business',
  OPERATIONAL = 'operational'
}

export enum RiskStatus {
  IDENTIFIED = 'identified',
  MITIGATED = 'mitigated',
  ACCEPTED = 'accepted',
  RESOLVED = 'resolved'
}

export type Duration = number; // 毫秒
