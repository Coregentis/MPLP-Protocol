import { ContextManagementService } from '../services/context-management.service';
import { ContextAnalyticsService } from '../services/context-analytics.service';
import { ContextSecurityService } from '../services/context-security.service';
import { ContextEntity } from '../../domain/entities/context.entity';
import { UUID } from '../../../../shared/types';
import { CreateContextData } from '../../types';
export interface ContextOperationResult {
    success: boolean;
    contextId: UUID;
    operation: string;
    timestamp: Date;
    data?: ContextEntity | Record<string, string | number | boolean | Date>;
    errors?: string[];
    warnings?: string[];
    performance?: {
        duration: number;
        servicesInvolved: string[];
    };
}
export interface ContextHealthCheck {
    contextId: UUID;
    overallHealth: 'healthy' | 'warning' | 'critical';
    managementHealth: 'healthy' | 'warning' | 'critical';
    analyticsHealth: 'healthy' | 'warning' | 'critical';
    securityHealth: 'healthy' | 'warning' | 'critical';
    recommendations: string[];
    lastChecked: Date;
}
export interface ILogger {
    info(message: string, meta?: Record<string, unknown>): void;
    warn(message: string, meta?: Record<string, unknown>): void;
    error(message: string, error?: Error, meta?: Record<string, unknown>): void;
    debug(message: string, meta?: Record<string, unknown>): void;
}
export declare class ContextServicesCoordinator {
    private readonly managementService;
    private readonly analyticsService;
    private readonly securityService;
    private readonly logger;
    constructor(managementService: ContextManagementService, analyticsService: ContextAnalyticsService, securityService: ContextSecurityService, logger: ILogger);
    createContextWithFullCoordination(data: CreateContextData, userId: UUID): Promise<ContextOperationResult>;
    performHealthCheck(contextId: UUID): Promise<ContextHealthCheck>;
    generateOptimizationRecommendations(contextId: UUID): Promise<{
        contextId: UUID;
        recommendations: Array<{
            category: 'performance' | 'security' | 'usage' | 'maintenance';
            priority: 'high' | 'medium' | 'low';
            description: string;
            action: string;
            estimatedImpact: string;
        }>;
        generatedAt: Date;
    }>;
    private checkManagementHealth;
    private checkAnalyticsHealth;
    private checkSecurityHealth;
    private calculateOverallHealth;
    private generateHealthRecommendations;
    private isMaintenanceNeeded;
    private createErrorResult;
}
//# sourceMappingURL=context-services-coordinator.d.ts.map