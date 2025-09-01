/**
 * Collab Repository Interface - Domain Layer
 * @description Repository interface for Collab entity persistence
 * @version 1.0.0
 * @author MPLP Development Team
 */

import { UUID } from '../../../../shared/types';
import { CollabEntity } from '../entities/collab.entity';

// ===== QUERY INTERFACES =====

export interface CollabListQuery {
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

export interface CollabSearchQuery {
  query: string;
  fields?: string[];
  filters?: {
    status?: string[];
    mode?: string[];
    dateRange?: {
      from: Date;
      to: Date;
    };
  };
  page?: number;
  limit?: number;
}

export interface CollabListResult {
  items: CollabEntity[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CollabSearchResult {
  items: CollabEntity[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  searchMetadata: {
    query: string;
    executionTimeMs: number;
    totalMatches: number;
  };
}

// ===== STATISTICS INTERFACES =====

export interface CollabStatistics {
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

// ===== MAIN REPOSITORY INTERFACE =====

/**
 * Collab Repository Interface
 * Defines persistence operations for Collab entities
 */
export interface ICollabRepository {
  // ===== BASIC CRUD OPERATIONS =====
  
  /**
   * Find collaboration by ID
   */
  findById(id: UUID): Promise<CollabEntity | null>;

  /**
   * Find multiple collaborations by IDs
   */
  findByIds(ids: UUID[]): Promise<CollabEntity[]>;

  /**
   * Save collaboration entity
   */
  save(entity: CollabEntity): Promise<CollabEntity>;

  /**
   * Update collaboration entity
   */
  update(entity: CollabEntity): Promise<CollabEntity>;

  /**
   * Delete collaboration by ID
   */
  delete(id: UUID): Promise<void>;

  /**
   * Check if collaboration exists
   */
  exists(id: UUID): Promise<boolean>;

  // ===== QUERY OPERATIONS =====

  /**
   * List collaborations with pagination and filtering
   */
  list(query: CollabListQuery): Promise<CollabListResult>;

  /**
   * Search collaborations with full-text search
   */
  search(query: CollabSearchQuery): Promise<CollabSearchResult>;

  /**
   * Count collaborations matching criteria
   */
  count(filters?: Partial<CollabListQuery>): Promise<number>;

  // ===== RELATIONSHIP QUERIES =====

  /**
   * Find collaborations by context ID
   */
  findByContextId(contextId: UUID): Promise<CollabEntity[]>;

  /**
   * Find collaborations by plan ID
   */
  findByPlanId(planId: UUID): Promise<CollabEntity[]>;

  /**
   * Find collaborations by participant ID
   */
  findByParticipantId(participantId: UUID): Promise<CollabEntity[]>;

  /**
   * Find collaborations by agent ID
   */
  findByAgentId(agentId: UUID): Promise<CollabEntity[]>;

  /**
   * Find collaborations by role ID
   */
  findByRoleId(roleId: UUID): Promise<CollabEntity[]>;

  /**
   * Find collaborations by coordinator ID
   */
  findByCoordinatorId(coordinatorId: UUID): Promise<CollabEntity[]>;

  // ===== STATUS AND MODE QUERIES =====

  /**
   * Find collaborations by status
   */
  findByStatus(status: string): Promise<CollabEntity[]>;

  /**
   * Find collaborations by mode
   */
  findByMode(mode: 'sequential' | 'parallel' | 'hybrid' | 'pipeline' | 'mesh'): Promise<CollabEntity[]>;

  /**
   * Find active collaborations
   */
  findActive(): Promise<CollabEntity[]>;

  /**
   * Find completed collaborations
   */
  findCompleted(): Promise<CollabEntity[]>;

  /**
   * Find failed collaborations
   */
  findFailed(): Promise<CollabEntity[]>;

  // ===== TIME-BASED QUERIES =====

  /**
   * Find collaborations created within date range
   */
  findByDateRange(from: Date, to: Date): Promise<CollabEntity[]>;

  /**
   * Find collaborations created by user
   */
  findByCreatedBy(userId: string): Promise<CollabEntity[]>;

  /**
   * Find collaborations updated by user
   */
  findByUpdatedBy(userId: string): Promise<CollabEntity[]>;

  /**
   * Find recently created collaborations
   */
  findRecent(limit?: number): Promise<CollabEntity[]>;

  /**
   * Find stale collaborations (not updated for specified duration)
   */
  findStale(olderThanHours: number): Promise<CollabEntity[]>;

  // ===== STATISTICS AND ANALYTICS =====

  /**
   * Get collaboration statistics
   */
  getStatistics(): Promise<CollabStatistics>;

  /**
   * Get statistics for specific time period
   */
  getStatisticsForPeriod(from: Date, to: Date): Promise<CollabStatistics>;

  /**
   * Get participant statistics
   */
  getParticipantStatistics(): Promise<{
    totalParticipants: number;
    activeParticipants: number;
    averageParticipantsPerCollaboration: number;
    topAgents: Array<{ agentId: UUID; collaborationCount: number }>;
    topRoles: Array<{ roleId: UUID; collaborationCount: number }>;
  }>;

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(): Promise<{
    averageCreationTime: number;
    averageCompletionTime: number;
    successRate: number;
    errorRate: number;
    throughput: number;
  }>;

  // ===== BATCH OPERATIONS =====

  /**
   * Batch save multiple collaborations
   */
  batchSave(entities: CollabEntity[]): Promise<CollabEntity[]>;

  /**
   * Batch update multiple collaborations
   */
  batchUpdate(entities: CollabEntity[]): Promise<CollabEntity[]>;

  /**
   * Batch delete multiple collaborations
   */
  batchDelete(ids: UUID[]): Promise<void>;

  // ===== TRANSACTION SUPPORT =====

  /**
   * Execute operations within a transaction
   */
  withTransaction<T>(operation: (repository: ICollabRepository) => Promise<T>): Promise<T>;

  // ===== HEALTH AND MAINTENANCE =====

  /**
   * Check repository health
   */
  healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    responseTime: number;
    connectionStatus: 'connected' | 'disconnected';
    lastError?: string;
  }>;

  /**
   * Clean up old data
   */
  cleanup(olderThanDays: number): Promise<{
    deletedCount: number;
    cleanupDuration: number;
  }>;

  /**
   * Optimize repository performance
   */
  optimize(): Promise<{
    optimizationDuration: number;
    improvements: string[];
  }>;
}
