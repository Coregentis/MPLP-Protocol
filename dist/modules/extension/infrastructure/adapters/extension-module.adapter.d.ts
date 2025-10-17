import { UUID } from '../../../../shared/types';
import { ExtensionEntityData, ExtensionType, ExtensionStatus } from '../../types';
import { ExtensionManagementService } from '../../application/services/extension-management.service';
export interface IExtensionModuleAdapter {
    createExtension(request: CreateExtensionRequest): Promise<ExtensionEntityData>;
    getExtension(extensionId: UUID): Promise<ExtensionEntityData | null>;
    updateExtension(extensionId: UUID, updates: Partial<ExtensionEntityData>): Promise<ExtensionEntityData | null>;
    deleteExtension(extensionId: UUID): Promise<boolean>;
    activateExtension(extensionId: UUID): Promise<boolean>;
    deactivateExtension(extensionId: UUID): Promise<boolean>;
    listExtensions(options: ExtensionQueryOptions): Promise<ExtensionListResult>;
    queryExtensions(criteria: ExtensionQueryCriteria): Promise<ExtensionEntityData[]>;
    getActiveExtensions(contextId?: UUID): Promise<ExtensionEntityData[]>;
    getExtensionsByType(extensionType: ExtensionType): Promise<ExtensionEntityData[]>;
    getHealthStatus(): Promise<ExtensionHealthStatus>;
    getPerformanceMetrics(): Promise<ExtensionPerformanceMetrics>;
}
import { ExtensionConfiguration, ExtensionCompatibility } from '../../types';
export interface CreateExtensionRequest {
    contextId: UUID;
    name: string;
    displayName: string;
    description: string;
    version: string;
    extensionType: ExtensionType;
    configuration?: ExtensionConfiguration;
    security?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
    compatibility?: ExtensionCompatibility;
}
export interface UpdateExtensionRequest {
    extensionId: UUID;
    name?: string;
    displayName?: string;
    description?: string;
    version?: string;
    extensionType?: ExtensionType;
    status?: ExtensionStatus;
    configuration?: Record<string, unknown>;
    security?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
}
export interface ExtensionActivationRequest {
    extensionId: UUID;
    contextId?: UUID;
    activationOptions?: Record<string, unknown>;
}
export interface ExtensionQueryOptions {
    contextId?: UUID;
    extensionType?: ExtensionType;
    status?: ExtensionStatus;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
export interface ExtensionQueryCriteria {
    name?: string;
    displayName?: string;
    extensionType?: ExtensionType;
    status?: ExtensionStatus;
    tags?: string[];
    category?: string;
}
export interface ExtensionListResult {
    extensions: ExtensionEntityData[];
    totalCount: number;
    hasMore: boolean;
    nextPage?: number;
}
export interface ExtensionHealthStatus {
    status: 'healthy' | 'degraded' | 'unhealthy';
    timestamp: string;
    checks: Array<{
        name: string;
        status: 'pass' | 'fail' | 'warn';
        message?: string;
        duration?: number;
    }>;
    metrics: {
        totalExtensions: number;
        activeExtensions: number;
        errorCount: number;
        averageResponseTime: number;
    };
}
export interface ExtensionPerformanceMetrics {
    activationLatency: number;
    memoryUsage: number;
    cpuUsage: number;
    networkRequests: number;
    errorRate: number;
    throughput: number;
    responseTime: number;
    healthStatus: 'healthy' | 'degraded' | 'unhealthy';
    alerts: Array<{
        type: string;
        message: string;
        severity: 'low' | 'medium' | 'high' | 'critical';
        timestamp: string;
    }>;
}
export declare class ExtensionModuleAdapter implements IExtensionModuleAdapter {
    private readonly extensionManagementService;
    constructor(extensionManagementService: ExtensionManagementService);
    createExtension(request: CreateExtensionRequest): Promise<ExtensionEntityData>;
    getExtension(extensionId: UUID): Promise<ExtensionEntityData | null>;
    updateExtension(extensionId: UUID, updates: Partial<ExtensionEntityData>): Promise<ExtensionEntityData | null>;
    deleteExtension(extensionId: UUID): Promise<boolean>;
    activateExtension(extensionId: UUID): Promise<boolean>;
    deactivateExtension(extensionId: UUID): Promise<boolean>;
    listExtensions(options: ExtensionQueryOptions): Promise<ExtensionListResult>;
    queryExtensions(criteria: ExtensionQueryCriteria): Promise<ExtensionEntityData[]>;
    getActiveExtensions(contextId?: UUID): Promise<ExtensionEntityData[]>;
    getExtensionsByType(extensionType: ExtensionType): Promise<ExtensionEntityData[]>;
    getHealthStatus(): Promise<ExtensionHealthStatus>;
    getPerformanceMetrics(): Promise<ExtensionPerformanceMetrics>;
}
//# sourceMappingURL=extension-module.adapter.d.ts.map