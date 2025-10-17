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
export declare class CollabManagementService {
    private readonly collabRepository;
    private readonly memberManager;
    private readonly taskAllocator;
    private readonly logger;
    constructor(collabRepository: ICollabRepository, memberManager: IMemberManager, taskAllocator: ITaskAllocator, logger: ILogger);
    createCollaboration(data: Partial<CollabEntityData>): Promise<CollabEntity>;
    private validateCollabData;
    private createCollaborationEntity;
    getCollaboration(id: UUID): Promise<CollabEntity | null>;
    updateCollaboration(id: UUID, data: Partial<CollabEntityData>): Promise<CollabEntity>;
    deleteCollaboration(id: UUID): Promise<void>;
    listCollaborations(query: CollabListQuery): Promise<CollabListResult>;
    startCollaboration(id: UUID, startedBy: string): Promise<CollabEntity>;
    stopCollaboration(id: UUID, stoppedBy: string, _reason?: string): Promise<CollabEntity>;
    addParticipant(collaborationId: UUID, participantData: {
        agentId: UUID;
        roleId: UUID;
        capabilities?: string[];
    }, addedBy: string): Promise<CollabEntity>;
    removeParticipant(collaborationId: UUID, participantId: UUID, removedBy: string, reason?: string): Promise<CollabEntity>;
    updateTaskStatus(collaborationId: UUID, taskId: UUID, status: string, updatedBy: string): Promise<CollabEntity>;
    private validateTaskStatusData;
    allocateResource(collaborationId: UUID, resourceData: {
        resourceId: UUID;
        targetId: UUID;
        amount: number;
        duration: number;
    }, allocatedBy: string): Promise<CollabEntity>;
    private validateResourceData;
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
    endCollaboration(collaborationId: UUID, endedBy: string, _reason?: string): Promise<CollabEntity>;
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
    private calculateHealthScore;
    addMember(collaborationId: UUID, memberData: {
        agentId: UUID;
        roleId: UUID;
        capabilities?: string[];
    }, addedBy: string): Promise<CollabEntity>;
    private validateMemberData;
    assignTask(collaborationId: UUID, taskData: {
        taskId: UUID;
        assigneeId: UUID;
        priority: string;
        dueDate?: Date;
    }, assignedBy: string): Promise<CollabEntity>;
    private validateTaskData;
    private applyEnterpriseIntelligence;
    private optimizeParticipantComposition;
    private enhanceCoordinationStrategy;
    private validateEnterprisePolicies;
    private calculateOptimalTeamSize;
    private analyzeCapabilityGaps;
    private analyzeRoleBalance;
    private recommendCoordinationStrategy;
    private recommendDecisionMaking;
    private selectOptimalCoordinator;
    private estimateResourceUsage;
}
//# sourceMappingURL=collab-management.service.d.ts.map