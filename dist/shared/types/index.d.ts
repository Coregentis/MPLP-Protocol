export type UUID = string;
export type Timestamp = string;
export type Version = string;
export type Priority = 'critical' | 'high' | 'medium' | 'low';
export type Status = 'active' | 'inactive' | 'suspended' | 'completed' | 'terminated';
export type MLPPModuleName = 'context' | 'plan' | 'confirm' | 'trace' | 'role' | 'extension' | 'core' | 'collab' | 'dialog' | 'network';
export type ProtocolLayer = 'L1' | 'L2' | 'L3';
export type L1Component = 'security' | 'performance' | 'events' | 'storage';
export type L3ManagerType = 'security' | 'performance' | 'eventBus' | 'errorHandler' | 'coordination' | 'orchestration' | 'stateSync' | 'transaction' | 'protocolVersion';
export interface BaseEntity {
    id: UUID;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    version: number;
}
export interface Metadata {
    [key: string]: unknown;
}
export interface PaginationParams {
    page: number;
    limit: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
export interface PaginatedResult<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export interface QueryFilter {
    [key: string]: unknown;
}
export interface OperationResult<T = unknown> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
        details?: Metadata;
    };
    metadata?: Metadata;
}
export interface ModuleConfig {
    enabled: boolean;
    version: Version;
    dependencies: MLPPModuleName[];
    settings: Metadata;
}
export type Environment = 'development' | 'testing' | 'staging' | 'production';
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';
export interface BaseEvent {
    id: UUID;
    type: string;
    timestamp: Timestamp;
    source: MLPPModuleName;
    payload: Metadata;
}
export type EventHandler<T = Metadata> = (event: BaseEvent & {
    payload: T;
}) => Promise<void> | void;
export interface MLPPError {
    code: string;
    message: string;
    module: MLPPModuleName;
    timestamp: Timestamp;
    details?: Metadata;
    stack?: string;
}
export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';
export interface PerformanceMetric {
    name: string;
    value: number;
    unit: string;
    timestamp: Timestamp;
    tags?: Record<string, string>;
}
export interface HealthCheckResult {
    status: 'healthy' | 'degraded' | 'unhealthy';
    timestamp: Timestamp;
    checks: Array<{
        name: string;
        status: 'pass' | 'fail' | 'warn';
        message?: string;
        duration?: number;
    }>;
}
export type Permission = 'read' | 'write' | 'execute' | 'delete' | 'admin';
export interface Role {
    id: UUID;
    name: string;
    permissions: Permission[];
    description?: string;
}
export interface User {
    id: UUID;
    username: string;
    email: string;
    roles: Role[];
    metadata?: Metadata;
}
export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type KeyValuePair<K extends string | number | symbol = string, V = unknown> = {
    [key in K]: V;
};
//# sourceMappingURL=index.d.ts.map