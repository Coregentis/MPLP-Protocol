/**
 * Member Manager Interface - Domain Layer
 * @description Interface for collaboration member management operations
 * @version 1.0.0
 * @author MPLP Development Team
 * @created 2025-01-27
 * @refactoring_guide_compliance 100%
 */

import { UUID } from '../../../../shared/types';
import { CollabParticipant } from '../entities/collab.entity';

/**
 * Member data for creation
 */
export interface CollabMemberData {
  memberId: UUID;
  agentId: UUID;
  role: string;
  capabilities: string[];
  status?: 'pending' | 'active' | 'inactive' | 'suspended';
  joinedAt?: Date;
  metadata?: Record<string, unknown>;
}

/**
 * Member validation result
 */
export interface MemberValidationResult {
  isValid: boolean;
  violations: string[];
  warnings: string[];
  recommendations: string[];
}

/**
 * Member creation result
 */
export interface MemberCreationResult {
  member: CollabParticipant;
  validationResult: MemberValidationResult;
  createdAt: Date;
  metadata: Record<string, unknown>;
}

/**
 * Member Manager Interface
 * Handles all member-related operations for collaborations
 * 
 * @interface IMemberManager
 * @description Core interface for member management as required by refactoring guide
 */
export interface IMemberManager {
  /**
   * Create a new collaboration member
   * @param memberData - Member creation data
   * @returns Promise<CollabParticipant> - Created member instance
   * @throws Error if member data is invalid or creation fails
   */
  createMember(memberData: CollabMemberData): Promise<CollabParticipant>;

  /**
   * Validate member data before creation or update
   * @param memberData - Member data to validate
   * @returns Promise<MemberValidationResult> - Validation result with details
   */
  validateMemberData(memberData: CollabMemberData): Promise<MemberValidationResult>;

  /**
   * Update member information
   * @param memberId - Member identifier
   * @param updateData - Partial member data for update
   * @returns Promise<CollabParticipant> - Updated member instance
   * @throws Error if member not found or update fails
   */
  updateMember(memberId: UUID, updateData: Partial<CollabMemberData>): Promise<CollabParticipant>;

  /**
   * Remove member from collaboration
   * @param memberId - Member identifier
   * @param reason - Reason for removal (optional)
   * @returns Promise<void>
   * @throws Error if member not found or removal fails
   */
  removeMember(memberId: UUID, reason?: string): Promise<void>;

  /**
   * Get member by identifier
   * @param memberId - Member identifier
   * @returns Promise<CollabParticipant | null> - Member instance or null if not found
   */
  getMember(memberId: UUID): Promise<CollabParticipant | null>;

  /**
   * List all members with optional filtering
   * @param filter - Optional filter criteria
   * @returns Promise<CollabParticipant[]> - Array of members
   */
  listMembers(filter?: {
    status?: string;
    role?: string;
    capabilities?: string[];
    joinedAfter?: Date;
    joinedBefore?: Date;
  }): Promise<CollabParticipant[]>;

  /**
   * Check if member has required capabilities
   * @param memberId - Member identifier
   * @param requiredCapabilities - Array of required capabilities
   * @returns Promise<boolean> - True if member has all required capabilities
   */
  hasCapabilities(memberId: UUID, requiredCapabilities: string[]): Promise<boolean>;

  /**
   * Update member status
   * @param memberId - Member identifier
   * @param status - New status
   * @param reason - Reason for status change (optional)
   * @returns Promise<void>
   * @throws Error if member not found or status change fails
   */
  updateMemberStatus(
    memberId: UUID, 
    status: 'pending' | 'active' | 'inactive' | 'suspended',
    reason?: string
  ): Promise<void>;

  /**
   * Assign role to member
   * @param memberId - Member identifier
   * @param role - Role to assign
   * @returns Promise<void>
   * @throws Error if member not found or role assignment fails
   */
  assignRole(memberId: UUID, role: string): Promise<void>;

  /**
   * Add capabilities to member
   * @param memberId - Member identifier
   * @param capabilities - Capabilities to add
   * @returns Promise<void>
   * @throws Error if member not found or capability addition fails
   */
  addCapabilities(memberId: UUID, capabilities: string[]): Promise<void>;

  /**
   * Remove capabilities from member
   * @param memberId - Member identifier
   * @param capabilities - Capabilities to remove
   * @returns Promise<void>
   * @throws Error if member not found or capability removal fails
   */
  removeCapabilities(memberId: UUID, capabilities: string[]): Promise<void>;

  /**
   * Get member activity summary
   * @param memberId - Member identifier
   * @param timeRange - Time range for activity summary
   * @returns Promise<MemberActivitySummary> - Activity summary
   */
  getMemberActivity(memberId: UUID, timeRange?: {
    startDate: Date;
    endDate: Date;
  }): Promise<MemberActivitySummary>;
}

/**
 * Member activity summary
 */
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
