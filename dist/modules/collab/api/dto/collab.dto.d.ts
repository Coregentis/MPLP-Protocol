import { UUID } from '../../../../shared/types';
export interface CollabCreateDTO {
    contextId: UUID;
    planId: UUID;
    name: string;
    description?: string;
    mode: 'sequential' | 'parallel' | 'hybrid' | 'pipeline' | 'mesh';
    participants: CollabParticipantCreateDTO[];
    coordinationStrategy: CollabCoordinationStrategyCreateDTO;
}
export interface CollabParticipantCreateDTO {
    agentId: UUID;
    roleId: UUID;
    capabilities?: string[];
}
export interface CollabCoordinationStrategyCreateDTO {
    type: 'centralized' | 'distributed' | 'hierarchical' | 'peer_to_peer';
    coordinatorId?: UUID;
    decisionMaking: 'consensus' | 'majority' | 'weighted' | 'coordinator';
}
export interface CollabUpdateDTO {
    name?: string;
    description?: string;
    mode?: 'sequential' | 'parallel' | 'hybrid' | 'pipeline' | 'mesh';
    status?: string;
    participants?: CollabParticipantUpdateDTO[];
    coordinationStrategy?: CollabCoordinationStrategyUpdateDTO;
}
export interface CollabParticipantUpdateDTO {
    participantId: UUID;
    status?: 'active' | 'inactive' | 'pending' | 'suspended';
    capabilities?: string[];
}
export interface CollabCoordinationStrategyUpdateDTO {
    type?: 'centralized' | 'distributed' | 'hierarchical' | 'peer_to_peer';
    coordinatorId?: UUID;
    decisionMaking?: 'consensus' | 'majority' | 'weighted' | 'coordinator';
}
export interface CollabResponseDTO {
    collaborationId: UUID;
    protocolVersion: string;
    timestamp: string;
    contextId: UUID;
    planId: UUID;
    name: string;
    description?: string;
    mode: 'sequential' | 'parallel' | 'hybrid' | 'pipeline' | 'mesh';
    status: string;
    participants: CollabParticipantResponseDTO[];
    coordinationStrategy: CollabCoordinationStrategyResponseDTO;
    createdAt: string;
    createdBy: string;
    updatedAt?: string;
    updatedBy?: string;
    performanceMetrics?: CollabPerformanceMetricsResponseDTO;
}
export interface CollabParticipantResponseDTO {
    participantId: UUID;
    agentId: UUID;
    roleId: UUID;
    status: 'active' | 'inactive' | 'pending' | 'suspended';
    capabilities?: string[];
    joinedAt: string;
    lastActivity?: string;
}
export interface CollabCoordinationStrategyResponseDTO {
    type: 'centralized' | 'distributed' | 'hierarchical' | 'peer_to_peer';
    coordinatorId?: UUID;
    decisionMaking: 'consensus' | 'majority' | 'weighted' | 'coordinator';
}
export interface CollabPerformanceMetricsResponseDTO {
    enabled: boolean;
    collectionIntervalSeconds: number;
    metrics: {
        coordinationLatencyMs: number;
        participantResponseTimeMs: number;
        successRatePercent: number;
        throughputOperationsPerSecond: number;
    };
}
export interface CollabListQueryDTO {
    page?: number;
    limit?: number;
    status?: string;
    mode?: 'sequential' | 'parallel' | 'hybrid' | 'pipeline' | 'mesh';
    contextId?: UUID;
    planId?: UUID;
    participantId?: UUID;
    sortBy?: 'name' | 'createdAt' | 'updatedAt' | 'status';
    sortOrder?: 'asc' | 'desc';
}
export interface CollabSearchQueryDTO {
    query: string;
    fields?: string[];
    filters?: {
        status?: string[];
        mode?: string[];
        dateRange?: {
            from: string;
            to: string;
        };
    };
    page?: number;
    limit?: number;
}
export interface CollabStartOperationDTO {
    collaborationId: UUID;
    parameters?: Record<string, unknown>;
}
export interface CollabStopOperationDTO {
    collaborationId: UUID;
    reason?: string;
}
export interface CollabAddParticipantDTO {
    collaborationId: UUID;
    participant: CollabParticipantCreateDTO;
}
export interface CollabRemoveParticipantDTO {
    collaborationId: UUID;
    participantId: UUID;
    reason?: string;
}
export interface CollabUpdateCoordinationStrategyDTO {
    collaborationId: UUID;
    coordinationStrategy: CollabCoordinationStrategyUpdateDTO;
}
export interface CollabStatisticsResponseDTO {
    totalCollaborations: number;
    activeCollaborations: number;
    completedCollaborations: number;
    failedCollaborations: number;
    averageParticipants: number;
    averageDurationMinutes: number;
    successRate: number;
    modeDistribution: {
        sequential: number;
        parallel: number;
        hybrid: number;
        pipeline: number;
        mesh: number;
    };
    coordinationStrategyDistribution: {
        centralized: number;
        distributed: number;
        hierarchical: number;
        peer_to_peer: number;
    };
}
export interface CollabHealthCheckResponseDTO {
    status: 'healthy' | 'degraded' | 'unhealthy';
    timestamp: string;
    checks: {
        database: 'healthy' | 'unhealthy';
        eventBus: 'healthy' | 'unhealthy';
        coordination: 'healthy' | 'unhealthy';
        monitoring: 'healthy' | 'unhealthy';
    };
    metrics: {
        activeCollaborations: number;
        averageResponseTime: number;
        errorRate: number;
    };
    version: string;
}
//# sourceMappingURL=collab.dto.d.ts.map