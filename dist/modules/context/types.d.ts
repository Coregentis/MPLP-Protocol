import { UUID, Timestamp, Priority } from '../../shared/types';
export type ContextStatus = 'active' | 'suspended' | 'completed' | 'terminated';
export type LifecycleStage = 'planning' | 'executing' | 'monitoring' | 'completed';
export type ResourceStatus = 'available' | 'allocated' | 'exhausted';
export type DependencyType = 'context' | 'plan' | 'external';
export type DependencyStatus = 'pending' | 'resolved' | 'failed';
export type GoalStatus = 'defined' | 'active' | 'achieved' | 'abandoned';
export type Operator = 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte';
export type PrincipalType = 'user' | 'role' | 'group';
export type Permission = 'read' | 'write' | 'execute' | 'delete' | 'admin';
export type PolicyType = 'security' | 'compliance' | 'operational';
export type PolicyEnforcement = 'strict' | 'advisory' | 'disabled';
export interface ResourceAllocation {
    type: string;
    amount: number;
    unit: string;
    status: ResourceStatus;
}
export interface ResourceRequirement {
    minimum: number;
    optimal?: number;
    maximum?: number;
    unit: string;
}
export interface ResourceManagement {
    allocated: Record<string, ResourceAllocation>;
    requirements: Record<string, ResourceRequirement>;
}
export interface Dependency {
    id: UUID;
    type: DependencyType;
    name: string;
    version?: string;
    status: DependencyStatus;
}
export interface SuccessCriteria {
    metric: string;
    operator: Operator;
    value: string | number | boolean;
    unit?: string;
}
export interface Goal {
    id: UUID;
    name: string;
    description?: string;
    priority: Priority;
    status: GoalStatus;
    successCriteria?: SuccessCriteria[];
}
export interface SharedState {
    variables?: Record<string, string | number | boolean | object>;
    resources?: {
        allocated?: Record<string, {
            type: string;
            amount: number;
            unit: string;
            status: 'available' | 'allocated' | 'exhausted';
        }>;
        limits?: Record<string, {
            max_amount: number;
            unit: string;
            enforcement_policy: string;
        }>;
    };
    dependencies?: string[];
    goals?: string[];
}
export interface Owner {
    userId: string;
    role: string;
}
export interface PermissionConfig {
    principal: string;
    principalType: PrincipalType;
    resource: string;
    actions: Permission[];
    conditions?: Record<string, unknown>;
}
export interface PolicyConfig {
    id: UUID;
    name: string;
    type: PolicyType;
    rules: Record<string, unknown>[];
    enforcement: PolicyEnforcement;
}
export interface AccessControl {
    owner: Owner;
    permissions: PermissionConfig[];
    policies?: PolicyConfig[];
}
export interface TimeoutSettings {
    defaultTimeout: number;
    maxTimeout: number;
    cleanupTimeout?: number;
}
export interface NotificationSettings {
    enabled: boolean;
    channels?: ('email' | 'webhook' | 'sms' | 'push')[];
    events?: ('created' | 'updated' | 'completed' | 'failed' | 'timeout')[];
}
export interface PersistenceConfig {
    enabled: boolean;
    storageBackend: 'memory' | 'database' | 'file' | 'redis';
    retentionPolicy?: {
        duration?: string;
        maxVersions?: number;
    };
}
export interface Configuration {
    timeoutSettings: TimeoutSettings;
    notificationSettings?: NotificationSettings;
    persistence: PersistenceConfig;
}
export interface AuditEvent {
    eventId: UUID;
    eventType: 'context_created' | 'context_updated' | 'context_deleted' | 'context_accessed' | 'context_shared' | 'permission_changed' | 'state_changed' | 'cache_updated' | 'sync_executed';
    timestamp: Timestamp;
    userId: string;
    userRole?: string;
    action: string;
    resource: string;
    contextOperation?: string;
    contextId?: UUID;
    contextName?: string;
    lifecycleStage?: string;
    sharedStateKeys?: string[];
    accessLevel?: string;
    contextDetails?: Record<string, unknown>;
    oldValue?: Record<string, unknown>;
    newValue?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
    sessionId?: string;
    correlationId?: UUID;
}
export interface ComplianceSettings {
    gdprEnabled?: boolean;
    hipaaEnabled?: boolean;
    soxEnabled?: boolean;
    contextAuditLevel?: 'basic' | 'detailed' | 'comprehensive';
    contextDataLogging?: boolean;
    customCompliance?: string[];
}
export interface AuditTrail {
    enabled: boolean;
    retentionDays: number;
    auditEvents?: AuditEvent[];
    complianceSettings?: ComplianceSettings;
}
export interface ContextEntityData {
    protocolVersion: string;
    timestamp: Timestamp;
    contextId: UUID;
    name: string;
    description?: string;
    status: ContextStatus;
    lifecycleStage: LifecycleStage;
    createdAt?: Date;
    updatedAt?: Date;
    version?: string;
    tags?: string[];
    sharedState?: Partial<SharedState>;
    accessControl?: Partial<AccessControl>;
    configuration?: Partial<Configuration>;
    auditTrail: AuditTrail;
    monitoringIntegration: Record<string, unknown>;
    performanceMetrics: Record<string, unknown>;
    versionHistory: Record<string, unknown>;
    searchMetadata: Record<string, unknown>;
    cachingPolicy: Record<string, unknown>;
    syncConfiguration: Record<string, unknown>;
    errorHandling: Record<string, unknown>;
    integrationEndpoints: Record<string, unknown>;
    eventIntegration: Record<string, unknown>;
}
export interface ContextSchema {
    protocol_version: string;
    timestamp: string;
    context_id: string;
    name: string;
    description?: string;
    status: ContextStatus;
    lifecycle_stage: LifecycleStage;
    shared_state: Record<string, unknown>;
    access_control: Record<string, unknown>;
    configuration: Record<string, unknown>;
    audit_trail: Record<string, unknown>;
    monitoring_integration: Record<string, unknown>;
    performance_metrics: Record<string, unknown>;
    version_history: Record<string, unknown>;
    search_metadata: Record<string, unknown>;
    caching_policy: Record<string, unknown>;
    sync_configuration: Record<string, unknown>;
    error_handling: Record<string, unknown>;
    integration_endpoints: Record<string, unknown>;
    event_integration: Record<string, unknown>;
}
export interface CreateContextRequest {
    name: string;
    description?: string;
    sharedState?: Partial<SharedState>;
    accessControl?: Partial<AccessControl>;
    configuration?: Partial<Configuration>;
}
export interface UpdateContextRequest {
    name?: string;
    description?: string;
    status?: ContextStatus;
    lifecycleStage?: LifecycleStage;
    sharedState?: Partial<SharedState>;
    accessControl?: Partial<AccessControl>;
    configuration?: Partial<Configuration>;
}
export interface ContextQueryFilter {
    status?: ContextStatus | ContextStatus[];
    lifecycleStage?: LifecycleStage | LifecycleStage[];
    owner?: string;
    createdAfter?: Timestamp;
    createdBefore?: Timestamp;
    namePattern?: string;
}
export interface ContextFilter {
    status?: ContextStatus | ContextStatus[];
    lifecycleStage?: LifecycleStage | LifecycleStage[];
    owner?: string;
    createdAfter?: Timestamp;
    createdBefore?: Timestamp;
    namePattern?: string;
    tags?: string[];
}
export interface StateUpdates {
    variables?: Record<string, unknown>;
    resources?: Partial<ResourceManagement>;
    dependencies?: Dependency[];
    goals?: Goal[];
}
export interface CreateContextData {
    name: string;
    description?: string;
    sharedState?: Partial<SharedState>;
    accessControl?: Partial<AccessControl>;
    configuration?: Partial<Configuration>;
    tags?: string[];
}
export interface UpdateContextData {
    name?: string;
    description?: string;
    status?: ContextStatus;
    lifecycleStage?: LifecycleStage;
    sharedState?: Partial<SharedState>;
    accessControl?: Partial<AccessControl>;
    configuration?: Partial<Configuration>;
    tags?: string[];
}
export interface UsageMetrics {
    totalAccess: number;
    lastAccessTime: Timestamp;
    avgSessionDuration: number;
    uniqueUsers: number;
    lastAccessed: Timestamp;
    averageSessionDuration: number;
}
export interface SearchQuery {
    query: string;
    filters?: ContextFilter;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    limit?: number;
    offset?: number;
}
//# sourceMappingURL=types.d.ts.map