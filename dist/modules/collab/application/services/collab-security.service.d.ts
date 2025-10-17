import { UUID } from '../../../../shared/types';
import { ICollabRepository } from '../../domain/repositories/collab.repository';
import { SecurityManager } from '../../domain/interfaces/security-manager.interface';
import { IGovernanceEngine } from '../../domain/interfaces/governance-engine.interface';
import { IAuditLogger } from '../../domain/interfaces/audit-logger.interface';
import { GovernanceCheckResult, CollabSecurityAudit, SuspiciousActivity } from '../../types';
export interface CollabSecurityPolicies {
    requireAuthentication: boolean;
    enableEncryption: boolean;
    allowGuestParticipants: boolean;
    maxParticipants: number;
    sessionTimeout: number;
    auditLogging: boolean;
}
export interface CollabSecurityContext {
    userId: UUID;
    sessionId: string;
    permissions: string[];
    ipAddress?: string;
    userAgent?: string;
    timestamp: Date;
}
export interface CollabSecurityAuditEntry {
    id: string;
    type: 'access_attempt' | 'access_granted' | 'access_denied' | 'security_error' | 'policy_violation' | 'governance_check' | 'data_protection_applied' | 'security_audit_completed' | 'suspicious_activity_monitoring';
    operation: string;
    collaborationId: UUID;
    userId: UUID;
    timestamp: Date;
    result: 'pending' | 'granted' | 'denied' | 'error' | 'unknown' | 'passed' | 'failed' | 'warning' | 'success' | 'completed';
    reason?: string;
    context?: CollabSecurityContext;
    error?: string;
    responseTime?: number;
    details?: Record<string, unknown>;
}
export declare class CollabSecurityService {
    private readonly collabRepository;
    private readonly securityManager;
    private readonly _governanceEngine;
    private readonly auditLogger;
    private readonly securityPolicies;
    private readonly auditLog;
    constructor(collabRepository: ICollabRepository, securityManager: SecurityManager, _governanceEngine: IGovernanceEngine, auditLogger: IAuditLogger, securityPolicies?: Partial<CollabSecurityPolicies>);
    validateCollaborationAccess(userId: string, collabId: string, action: string): Promise<boolean>;
    validateAccess(operation: string, collaborationId: string, userId: string, _context?: CollabSecurityContext): Promise<{
        isAllowed: boolean;
        reason?: string;
        requiredActions?: string[];
        securityLevel?: string;
    }>;
    performGovernanceCheck(collaborationId: string, checkType: string, _context?: Record<string, unknown>): Promise<GovernanceCheckResult>;
    private createFallbackGovernanceResult;
    manageDataProtection(collaborationId: UUID, protectionLevel: 'basic' | 'standard' | 'high' | 'maximum'): Promise<{
        protectionId: UUID;
        collaborationId: UUID;
        protectionLevel: string;
        appliedMeasures: string[];
        encryptionStatus: 'enabled' | 'disabled';
        accessControls: string[];
        dataRetentionPolicy: string;
        complianceStandards: string[];
        implementedAt: Date;
    }>;
    private generateUUID;
    private logSecurityEvent;
    performSecurityAudit(_collaborationId: UUID): Promise<CollabSecurityAudit>;
    monitorSuspiciousActivity(_collaborationId: UUID): Promise<SuspiciousActivity[]>;
}
//# sourceMappingURL=collab-security.service.d.ts.map