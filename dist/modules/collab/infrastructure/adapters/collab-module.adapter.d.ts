import { UUID } from '../../../../shared/types';
import { CollabEntity } from '../../domain/entities/collab.entity';
import { CollabManagementService } from '../../application/services/collab-management.service';
export declare class CollabModuleAdapter {
    private readonly collabManagementService;
    constructor(collabManagementService: CollabManagementService);
    createCollaborationFromContext(contextId: UUID, contextData: Record<string, unknown>, userId: string): Promise<CollabEntity>;
    updateCollaborationContext(collaborationId: UUID, contextUpdates: Record<string, unknown>): Promise<void>;
    createCollaborationFromPlan(planId: UUID, planData: Record<string, unknown>, userId: string): Promise<CollabEntity>;
    synchronizeWithPlanUpdates(collaborationId: UUID, planUpdates: Record<string, unknown>): Promise<void>;
    validateParticipantRoles(collaborationId: UUID, participantRoles: Array<{
        agentId: UUID;
        roleId: UUID;
    }>): Promise<{
        valid: boolean;
        violations: string[];
        recommendations: string[];
    }>;
    updateParticipantRoles(collaborationId: UUID, roleUpdates: Array<{
        participantId: UUID;
        newRoleId: UUID;
    }>): Promise<void>;
    requestCollaborationApproval(collaborationId: UUID, approvalRequest: Record<string, unknown>): Promise<{
        approvalId: UUID;
        status: string;
        requiredApprovers: UUID[];
    }>;
    processCollaborationApproval(collaborationId: UUID, approvalResponse: Record<string, unknown>): Promise<void>;
    startCollaborationTracing(collaborationId: UUID, tracingConfig: Record<string, unknown>): Promise<{
        traceId: UUID;
        tracingEnabled: boolean;
    }>;
    recordCollaborationTraceEvent(collaborationId: UUID, traceEvent: Record<string, unknown>): Promise<void>;
    loadCollaborationExtensions(collaborationId: UUID, extensionRequirements: string[]): Promise<{
        loadedExtensions: string[];
        failedExtensions: string[];
    }>;
    executeCollaborationExtension(collaborationId: UUID, extensionId: string, _extensionData: Record<string, unknown>): Promise<Record<string, unknown>>;
    registerCollaborationWorkflow(_collaborationId: UUID, _workflowDefinition: Record<string, unknown>): Promise<{
        workflowId: UUID;
        registered: boolean;
    }>;
    createCollaborationDialogSession(_collaborationId: UUID, _dialogConfig: Record<string, unknown>): Promise<{
        dialogSessionId: UUID;
        participants: UUID[];
    }>;
    establishCollaborationNetworkConnections(_collaborationId: UUID, _networkConfig: Record<string, unknown>): Promise<{
        connectionId: UUID;
        connectedParticipants: UUID[];
        networkTopology: string;
    }>;
    coordinateCollaborationAcrossModules(_collaborationId: UUID, _coordinationRequest: {
        requiredModules: string[];
        coordinationData: Record<string, unknown>;
        priority: 'low' | 'medium' | 'high' | 'critical';
    }): Promise<{
        coordinationId: UUID;
        moduleResponses: Record<string, unknown>;
        success: boolean;
        errors: string[];
    }>;
    getCollaborationIntegrationStatus(_collaborationId: UUID): Promise<{
        integrationStatus: Record<string, {
            connected: boolean;
            lastSync: string;
            health: 'healthy' | 'degraded' | 'unhealthy';
        }>;
        overallHealth: 'healthy' | 'degraded' | 'unhealthy';
    }>;
    private determineModeFromPlan;
    private determineCoordinationFromPlan;
    private extractParticipantsFromPlan;
    private checkExtensionCompatibility;
}
//# sourceMappingURL=collab-module.adapter.d.ts.map