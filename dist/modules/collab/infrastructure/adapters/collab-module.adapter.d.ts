/**
 * Collab Module Adapter - Infrastructure Layer
 * @description Adapter for integrating Collab module with other MPLP modules
 * @version 1.0.0
 * @author MPLP Development Team
 */
import { UUID } from '../../../../shared/types';
import { CollabEntity } from '../../domain/entities/collab.entity';
import { CollabManagementService } from '../../application/services/collab-management.service';
/**
 * Collab Module Adapter
 * Provides standardized interface for other MPLP modules to interact with Collab module
 *
 * Reserved Interfaces for CoreOrchestrator Integration:
 * - Context Module Integration
 * - Plan Module Integration
 * - Role Module Integration
 * - Confirm Module Integration
 * - Trace Module Integration
 * - Extension Module Integration
 * - Core Module Integration
 * - Dialog Module Integration
 * - Network Module Integration
 */
export declare class CollabModuleAdapter {
    private readonly collabManagementService;
    constructor(collabManagementService: CollabManagementService);
    /**
     * Create collaboration from context
     * Reserved interface for Context module integration
     */
    createCollaborationFromContext(contextId: UUID, // Reserved for CoreOrchestrator activation
    contextData: Record<string, unknown>, // Reserved for CoreOrchestrator activation
    userId: string): Promise<CollabEntity>;
    /**
     * Update collaboration context
     * Reserved interface for Context module integration
     */
    updateCollaborationContext(collaborationId: UUID, // Reserved for CoreOrchestrator activation
    contextUpdates: Record<string, unknown>): Promise<void>;
    /**
     * Create collaboration from plan
     * Reserved interface for Plan module integration
     */
    createCollaborationFromPlan(planId: UUID, // Reserved for CoreOrchestrator activation
    planData: Record<string, unknown>, // Reserved for CoreOrchestrator activation
    userId: string): Promise<CollabEntity>;
    /**
     * Synchronize collaboration with plan updates
     * Reserved interface for Plan module integration
     */
    synchronizeWithPlanUpdates(collaborationId: UUID, // Reserved for CoreOrchestrator activation
    planUpdates: Record<string, unknown>): Promise<void>;
    /**
     * Validate participant roles
     * Reserved interface for Role module integration
     */
    validateParticipantRoles(collaborationId: UUID, // Reserved for CoreOrchestrator activation
    participantRoles: Array<{
        agentId: UUID;
        roleId: UUID;
    }>): Promise<{
        valid: boolean;
        violations: string[];
        recommendations: string[];
    }>;
    /**
     * Update participant role assignments
     * Reserved interface for Role module integration
     */
    updateParticipantRoles(collaborationId: UUID, // Reserved for CoreOrchestrator activation
    roleUpdates: Array<{
        participantId: UUID;
        newRoleId: UUID;
    }>): Promise<void>;
    /**
     * Request collaboration approval
     * Reserved interface for Confirm module integration
     */
    requestCollaborationApproval(collaborationId: UUID, // Reserved for CoreOrchestrator activation
    approvalRequest: Record<string, unknown>): Promise<{
        approvalId: UUID;
        status: string;
        requiredApprovers: UUID[];
    }>;
    /**
     * Process collaboration approval response
     * Reserved interface for Confirm module integration
     */
    processCollaborationApproval(collaborationId: UUID, // Reserved for CoreOrchestrator activation
    approvalResponse: Record<string, unknown>): Promise<void>;
    /**
     * Start collaboration tracing
     * Reserved interface for Trace module integration
     */
    startCollaborationTracing(collaborationId: UUID, // Reserved for CoreOrchestrator activation
    _tracingConfig: Record<string, unknown>): Promise<{
        traceId: UUID;
        tracingEnabled: boolean;
    }>;
    /**
     * Record collaboration trace event
     * Reserved interface for Trace module integration
     */
    recordCollaborationTraceEvent(_collaborationId: UUID, // Reserved for CoreOrchestrator activation
    traceEvent: Record<string, unknown>): Promise<void>;
    /**
     * Load collaboration extensions
     * Reserved interface for Extension module integration
     */
    loadCollaborationExtensions(collaborationId: UUID, // Reserved for CoreOrchestrator activation
    extensionRequirements: string[]): Promise<{
        loadedExtensions: string[];
        failedExtensions: string[];
    }>;
    /**
     * Execute collaboration extension
     * Reserved interface for Extension module integration
     */
    executeCollaborationExtension(collaborationId: UUID, // Reserved for CoreOrchestrator activation
    extensionId: string, // Reserved for CoreOrchestrator activation
    _extensionData: Record<string, unknown>): Promise<Record<string, unknown>>;
    /**
     * Register collaboration workflow
     * Reserved interface for Core module integration
     */
    registerCollaborationWorkflow(_collaborationId: UUID, // Reserved for CoreOrchestrator activation
    _workflowDefinition: Record<string, unknown>): Promise<{
        workflowId: UUID;
        registered: boolean;
    }>;
    /**
     * Create collaboration dialog session
     * Reserved interface for Dialog module integration
     */
    createCollaborationDialogSession(_collaborationId: UUID, // Reserved for CoreOrchestrator activation
    _dialogConfig: Record<string, unknown>): Promise<{
        dialogSessionId: UUID;
        participants: UUID[];
    }>;
    /**
     * Establish collaboration network connections
     * Reserved interface for Network module integration
     */
    establishCollaborationNetworkConnections(_collaborationId: UUID, // Reserved for CoreOrchestrator activation
    _networkConfig: Record<string, unknown>): Promise<{
        connectionId: UUID;
        connectedParticipants: UUID[];
        networkTopology: string;
    }>;
    /**
     * Coordinate collaboration across all MPLP modules
     * This method orchestrates interactions with all other modules
     */
    coordinateCollaborationAcrossModules(_collaborationId: UUID, // Reserved for CoreOrchestrator activation
    _coordinationRequest: {
        requiredModules: string[];
        coordinationData: Record<string, unknown>;
        priority: 'low' | 'medium' | 'high' | 'critical';
    }): Promise<{
        coordinationId: UUID;
        moduleResponses: Record<string, unknown>;
        success: boolean;
        errors: string[];
    }>;
    /**
     * Get collaboration integration status
     * Returns the current status of all module integrations
     */
    getCollaborationIntegrationStatus(_collaborationId: UUID): Promise<{
        integrationStatus: Record<string, {
            connected: boolean;
            lastSync: string;
            health: 'healthy' | 'degraded' | 'unhealthy';
        }>;
        overallHealth: 'healthy' | 'degraded' | 'unhealthy';
    }>;
    /**
     * Determine collaboration mode from plan data
     */
    private determineModeFromPlan;
    /**
     * Determine coordination strategy from plan data
     */
    private determineCoordinationFromPlan;
    /**
     * Extract participants from plan data
     */
    private extractParticipantsFromPlan;
    /**
     * Check extension compatibility with collaboration
     */
    private checkExtensionCompatibility;
}
//# sourceMappingURL=collab-module.adapter.d.ts.map