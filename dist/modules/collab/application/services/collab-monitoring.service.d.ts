import { UUID } from '../../../../shared/types';
import { ICollabRepository } from '../../domain/repositories/collab.repository';
export declare class CollabMonitoringService {
    private readonly collabRepository;
    private readonly alertThresholds;
    private readonly monitoringMetrics;
    constructor(collabRepository: ICollabRepository, alertThresholds?: Partial<CollabAlertThresholds>);
    startMonitoring(collaborationId: UUID): Promise<void>;
    stopMonitoring(collaborationId: UUID): Promise<void>;
    getMonitoringStatus(collaborationId: UUID): Promise<CollabMonitoringStatus>;
    getActiveAlerts(collaborationId?: UUID): Promise<CollabAlert[]>;
    acknowledgeAlert(collaborationId: UUID, alertId: UUID, acknowledgedBy: string): Promise<void>;
    resolveAlert(collaborationId: UUID, alertId: UUID, resolvedBy: string, resolution: string): Promise<void>;
    generateDashboard(): Promise<CollabMonitoringDashboard>;
    private updateMetrics;
    private checkAlertConditions;
    private createAlert;
    private schedulePeriodicCheck;
    private calculateOverallHealth;
    private calculateUptime;
    private generateMonitoringRecommendations;
    private calculateCoordinationEfficiency;
    private estimateDecisionMakingSpeed;
    private calculateAverageHealth;
    private calculateAverageMetric;
    private getRecentAlerts;
    private identifyTopIssues;
    private generateAlertId;
}
export interface CollabAlertThresholds {
    participantUtilizationMin: number;
    coordinationEfficiencyMin: number;
    decisionMakingSpeedMin: number;
    taskCompletionRateMin: number;
    qualityScoreMin: number;
    responseTimeMax: number;
    errorRateMax: number;
}
export interface CollabMonitoringMetrics {
    collaborationId: UUID;
    startTime: Date;
    lastUpdate: Date;
    status: 'active' | 'paused' | 'stopped';
    alerts: CollabAlert[];
    performanceMetrics: CollabPerformanceMetrics;
    healthChecks: CollabHealthChecks;
}
export interface CollabPerformanceMetrics {
    participantUtilization: number;
    coordinationEfficiency: number;
    decisionMakingSpeed: number;
    taskCompletionRate: number;
    qualityScore: number;
    responseTime: number;
    errorRate: number;
    throughput: number;
}
export interface CollabHealthChecks {
    participantHealth: 'healthy' | 'warning' | 'critical';
    coordinationHealth: 'healthy' | 'warning' | 'critical';
    performanceHealth: 'healthy' | 'warning' | 'critical';
    systemHealth: 'healthy' | 'warning' | 'critical';
}
export interface CollabAlert {
    id: UUID;
    collaborationId: UUID;
    type: string;
    severity: 'info' | 'warning' | 'critical';
    status: 'active' | 'acknowledged' | 'resolved';
    title: string;
    description: string;
    threshold?: number;
    currentValue?: number;
    createdAt: Date;
    lastOccurrence: Date;
    occurrenceCount: number;
    acknowledgedBy?: string;
    acknowledgedAt?: Date;
    resolvedBy?: string;
    resolvedAt?: Date;
    resolution?: string;
}
export interface CollabMonitoringStatus {
    collaborationId: UUID;
    monitoringStatus: 'active' | 'paused' | 'stopped';
    lastUpdate: Date;
    overallHealth: 'healthy' | 'warning' | 'critical';
    activeAlerts: CollabAlert[];
    performanceMetrics: CollabPerformanceMetrics;
    healthChecks: CollabHealthChecks;
    uptime: number;
    recommendations: string[];
}
export interface CollabMonitoringDashboard {
    summary: {
        totalCollaborations: number;
        activeCollaborations: number;
        totalAlerts: number;
        activeAlerts: number;
        averageHealth: number;
    };
    healthOverview: {
        healthy: number;
        warning: number;
        critical: number;
    };
    performanceOverview: {
        averageParticipantUtilization: number;
        averageCoordinationEfficiency: number;
        averageResponseTime: number;
        averageErrorRate: number;
    };
    recentAlerts: CollabAlert[];
    topIssues: string[];
}
//# sourceMappingURL=collab-monitoring.service.d.ts.map