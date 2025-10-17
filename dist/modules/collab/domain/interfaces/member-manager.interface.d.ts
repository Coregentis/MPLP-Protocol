import { UUID } from '../../../../shared/types';
import { CollabParticipant } from '../entities/collab.entity';
export interface CollabMemberData {
    memberId: UUID;
    agentId: UUID;
    role: string;
    capabilities: string[];
    status?: 'pending' | 'active' | 'inactive' | 'suspended';
    joinedAt?: Date;
    metadata?: Record<string, unknown>;
}
export interface MemberValidationResult {
    isValid: boolean;
    violations: string[];
    warnings: string[];
    recommendations: string[];
}
export interface MemberCreationResult {
    member: CollabParticipant;
    validationResult: MemberValidationResult;
    createdAt: Date;
    metadata: Record<string, unknown>;
}
export interface IMemberManager {
    createMember(memberData: CollabMemberData): Promise<CollabParticipant>;
    validateMemberData(memberData: CollabMemberData): Promise<MemberValidationResult>;
    updateMember(memberId: UUID, updateData: Partial<CollabMemberData>): Promise<CollabParticipant>;
    removeMember(memberId: UUID, reason?: string): Promise<void>;
    getMember(memberId: UUID): Promise<CollabParticipant | null>;
    listMembers(filter?: {
        status?: string;
        role?: string;
        capabilities?: string[];
        joinedAfter?: Date;
        joinedBefore?: Date;
    }): Promise<CollabParticipant[]>;
    hasCapabilities(memberId: UUID, requiredCapabilities: string[]): Promise<boolean>;
    updateMemberStatus(memberId: UUID, status: 'pending' | 'active' | 'inactive' | 'suspended', reason?: string): Promise<void>;
    assignRole(memberId: UUID, role: string): Promise<void>;
    addCapabilities(memberId: UUID, capabilities: string[]): Promise<void>;
    removeCapabilities(memberId: UUID, capabilities: string[]): Promise<void>;
    getMemberActivity(memberId: UUID, timeRange?: {
        startDate: Date;
        endDate: Date;
    }): Promise<MemberActivitySummary>;
}
export interface MemberActivitySummary {
    memberId: UUID;
    totalActivities: number;
    lastActivity: Date;
    activitiesByType: Record<string, number>;
    engagementScore: number;
    contributionScore: number;
    collaborationScore: number;
    timeRange: {
        startDate: Date;
        endDate: Date;
    };
}
//# sourceMappingURL=member-manager.interface.d.ts.map