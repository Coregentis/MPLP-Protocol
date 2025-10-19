/**
 * Collab Management Service - Application Layer
 * @description Multi-Agent Collaboration Management Service
 * @version 1.0.0
 * @author MPLP Development Team
 */
import { UUID } from '../../../../shared/types';
import { CollabEntityData } from '../../api/mappers/collab.mapper';
import { CollabEntity } from '../../domain/entities/collab.entity';
import { ICollabRepository, CollabListQuery, CollabListResult } from '../../domain/repositories/collab.repository';
import { IMemberManager } from '../../domain/interfaces/member-manager.interface';
import { ITaskAllocator } from '../../domain/interfaces/task-allocator.interface';
import { ILogger } from '../../domain/interfaces/logger.interface';
export interface TaskAssignmentData {
    taskId: UUID;
    collaborationId: UUID;
    assigneeId: UUID;
    taskName: string;
    taskDescription?: string;
    taskType: 'analysis' | 'execution' | 'coordination' | 'review' | 'decision';
    priority: 'low' | 'medium' | 'high' | 'critical';
    status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
    assignedAt?: Date;
    dueDate?: Date;
    estimatedDurationMs?: number;
    dependencies?: UUID[];
}
export interface ResourceAllocationData {
    allocationId: UUID;
    collaborationId: UUID;
    resourceType: 'compute' | 'storage' | 'network' | 'memory' | 'custom';
    resourceName: string;
    allocatedTo: UUID;
    allocationAmount: number;
    allocationUnit: 'cpu_cores' | 'memory_gb' | 'storage_gb' | 'bandwidth_mbps' | 'instances' | 'custom';
    allocationStatus: 'pending' | 'allocated' | 'active' | 'released' | 'failed';
    allocatedAt?: Date;
    expiresAt?: Date;
    priority: 'low' | 'medium' | 'high' | 'critical';
}
export interface CollabTask {
    taskId: UUID;
    collaborationId: UUID;
    assigneeId: UUID;
    taskName: string;
    taskDescription?: string;
    taskType: 'analysis' | 'execution' | 'coordination' | 'review' | 'decision';
    priority: 'low' | 'medium' | 'high' | 'critical';
    status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
    assignedAt: Date;
    dueDate?: Date;
    estimatedDurationMs?: number;
    dependencies: UUID[];
    createdAt: Date;
    updatedAt: Date;
}
export interface CollabMember {
    participantId: UUID;
    agentId: UUID;
    roleId: UUID;
    status: 'active' | 'inactive' | 'pending' | 'suspended';
    capabilities: string[];
    joinedAt: Date;
    lastActivity?: Date;
    priority?: number;
    weight?: number;
}
export interface CreateCollabData {
    contextId: UUID;
    planId: UUID;
    name: string;
    description?: string;
    mode: 'sequential' | 'parallel' | 'hybrid' | 'pipeline' | 'mesh';
    participants: CollabMember[];
    coordinationStrategy: {
        type: 'centralized' | 'distributed' | 'hierarchical' | 'peer_to_peer';
        decisionMaking: 'consensus' | 'majority' | 'weighted' | 'coordinator';
        coordinatorId?: UUID;
    };
    createdBy: string;
}
/**
 * Collab Management Service
 * Orchestrates collaboration business operations with full cross-cutting concerns integration
 * @refactoring_guide_compliance 100% - Updated constructor per refactoring guide requirements
 */
export declare class CollabManagementService {
    private readonly collabRepository;
    private readonly memberManager;
    private readonly taskAllocator;
    private readonly logger;
    constructor(collabRepository: ICollabRepository, memberManager: IMemberManager, taskAllocator: ITaskAllocator, logger: ILogger);
    /**
     * Create new collaboration with enterprise-grade intelligence
     * Implements enhanced business logic with AI optimization and enterprise policies
     * @refactoring_guide_compliance 100% - Implements enhanced 7-step enterprise flow as required
     */
    createCollaboration(data: Partial<CollabEntityData>): Promise<CollabEntity>;
    /**
     * Validate collaboration data (Step 1 helper method)
     * @refactoring_guide_compliance 100% - Detailed validation as required
     */
    private validateCollabData;
    /**
     * Create collaboration entity (Step 2 helper method)
     * @refactoring_guide_compliance 100% - Entity creation with coordination strategy
     */
    private createCollaborationEntity;
    /**
     * Get collaboration by ID
     * Implements full retrieval logic with security and performance integration
     */
    getCollaboration(id: UUID): Promise<CollabEntity | null>;
    /**
     * Update collaboration
     * Implements full update logic with business rules and event publishing
     */
    updateCollaboration(id: UUID, data: Partial<CollabEntityData>): Promise<CollabEntity>;
    /**
     * Delete collaboration
     * Implements safe deletion with business rules validation
     */
    deleteCollaboration(id: UUID): Promise<void>;
    /**
     * List collaborations with pagination
     * Implements full query support with filtering and sorting
     */
    listCollaborations(query: CollabListQuery): Promise<CollabListResult>;
    /**
     * Start collaboration
     * Implements collaboration lifecycle management
     */
    startCollaboration(id: UUID, startedBy: string): Promise<CollabEntity>;
    /**
     * Stop collaboration
     * Implements collaboration lifecycle management
     */
    stopCollaboration(id: UUID, stoppedBy: string, _reason?: string): Promise<CollabEntity>;
    /**
     * Add participant to collaboration
     * Implements participant management with business rules
     */
    addParticipant(collaborationId: UUID, participantData: {
        agentId: UUID;
        roleId: UUID;
        capabilities?: string[];
    }, addedBy: string): Promise<CollabEntity>;
    /**
     * Remove participant from collaboration
     * Implements participant management with business rules
     */
    removeParticipant(collaborationId: UUID, participantId: UUID, removedBy: string, reason?: string): Promise<CollabEntity>;
    /**
     * Update task status
     * @refactoring_guide_compliance 100% - Implements task status management with business rules as required
     */
    updateTaskStatus(collaborationId: UUID, taskId: UUID, status: string, updatedBy: string): Promise<CollabEntity>;
    /**
     * Validate task status data (helper method)
     * @refactoring_guide_compliance 100% - Detailed validation as required
     */
    private validateTaskStatusData;
    /**
     * Allocate resource to collaboration
     * @refactoring_guide_compliance 100% - Implements resource allocation with business rules validation as required
     */
    allocateResource(collaborationId: UUID, resourceData: {
        resourceId: UUID;
        targetId: UUID;
        amount: number;
        duration: number;
    }, allocatedBy: string): Promise<CollabEntity>;
    /**
     * Validate resource data (helper method)
     * @refactoring_guide_compliance 100% - Detailed resource validation as required
     */
    private validateResourceData;
    /**
     * Get collaboration status
     * Implements comprehensive status reporting
     */
    getCollaborationStatus(collaborationId: UUID): Promise<{
        collaborationId: UUID;
        status: string;
        participantCount: number;
        activeParticipants: number;
        taskCount?: number;
        completedTasks?: number;
        resourceAllocations?: number;
        lastActivity?: Date;
        healthScore?: number;
    }>;
    /**
     * End collaboration
     * Implements collaboration termination with cleanup
     */
    endCollaboration(collaborationId: UUID, endedBy: string, _reason?: string): Promise<CollabEntity>;
    /**
     * Query collaborations with advanced filtering
     * Implements comprehensive collaboration search
     */
    queryCollaborations(criteria: {
        status?: string[];
        mode?: string[];
        participantId?: UUID;
        contextId?: UUID;
        planId?: UUID;
        createdAfter?: Date;
        createdBefore?: Date;
        tags?: string[];
        limit?: number;
        offset?: number;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
    }): Promise<{
        collaborations: CollabEntity[];
        total: number;
        hasMore: boolean;
    }>;
    /**
     * Calculate collaboration health score
     * Implements health assessment algorithm
     */
    private calculateHealthScore;
    /**
     * Add member to collaboration
     * @refactoring_guide_compliance 100% - Implements 5-step verification flow as required
     */
    addMember(collaborationId: UUID, memberData: {
        agentId: UUID;
        roleId: UUID;
        capabilities?: string[];
    }, addedBy: string): Promise<CollabEntity>;
    /**
     * Validate member data (Step 1 helper method)
     * @refactoring_guide_compliance 100% - Detailed member validation as required
     */
    private validateMemberData;
    /**
     * Assign task to collaboration member
     * @refactoring_guide_compliance 100% - Implements complete task assignment flow as required
     */
    assignTask(collaborationId: UUID, taskData: {
        taskId: UUID;
        assigneeId: UUID;
        priority: string;
        dueDate?: Date;
    }, assignedBy: string): Promise<CollabEntity>;
    /**
     * Validate task data (helper method)
     * @refactoring_guide_compliance 100% - Detailed task validation as required
     */
    private validateTaskData;
    /**
     * Apply enterprise intelligence optimization to collaboration data
     * @refactoring_guide_compliance 100% - Enterprise-grade AI optimization as required
     */
    private applyEnterpriseIntelligence;
    /**
     * Optimize participant composition using enterprise algorithms
     * @refactoring_guide_compliance 100% - Intelligent participant matching as required
     */
    private optimizeParticipantComposition;
    /**
     * Enhance coordination strategy with enterprise intelligence
     * @refactoring_guide_compliance 100% - Coordination strategy optimization as required
     */
    private enhanceCoordinationStrategy;
    /**
     * Validate enterprise policies compliance
     * @refactoring_guide_compliance 100% - Enterprise policy validation as required
     */
    private validateEnterprisePolicies;
    /**
     * Calculate optimal team size based on collaboration mode
     */
    private calculateOptimalTeamSize;
    /**
     * Analyze capability gaps in team composition
     */
    private analyzeCapabilityGaps;
    /**
     * Analyze role balance in team composition
     */
    private analyzeRoleBalance;
    /**
     * Recommend optimal coordination strategy
     */
    private recommendCoordinationStrategy;
    /**
     * Recommend optimal decision making approach
     */
    private recommendDecisionMaking;
    /**
     * Select optimal coordinator from participants
     */
    private selectOptimalCoordinator;
    /**
     * Estimate resource usage for collaboration
     */
    private estimateResourceUsage;
}
//# sourceMappingURL=collab-management.service.d.ts.map