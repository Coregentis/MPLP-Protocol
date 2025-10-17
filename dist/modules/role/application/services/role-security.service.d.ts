import { RoleManagementService } from './role-management.service';
export interface SecurityContext {
    userId: string;
    sessionId: string;
    roles: string[];
    permissions: string[];
    authenticationMethod?: string;
    authenticationTime?: string;
    ipAddress?: string;
    userAgent?: string;
    timestamp?: Date;
}
export interface SecurityToken {
    tokenId: string;
    userId: string;
    permissions: Array<{
        resource: string;
        action: string;
    }>;
    sessionData: SessionData;
    expiresAt: Date;
}
export interface SessionData {
    deviceId?: string;
    location?: string;
    metadata?: Record<string, string>;
}
export interface SecurityEvent {
    type: 'unauthorized_access' | 'suspicious_activity' | 'security_violation' | 'access_attempt' | 'access_denied' | 'token_created' | 'token_validation_error';
    userId?: string;
    resource?: string;
    action?: string;
    timestamp: Date;
    context?: SecurityContext;
    result?: 'pending' | 'granted' | 'denied' | 'success' | 'failed';
    reason?: string;
    metadata?: Record<string, unknown>;
}
export interface PermissionRequest {
    resource: string;
    action: string;
    context?: SecurityContext;
}
export interface PermissionResult {
    resource: string;
    action: string;
    granted: boolean;
}
export interface SecurityCondition {
    type: 'time_range' | 'ip_address' | 'user_agent';
    value: string;
}
export interface PolicyExecutionResult {
    success: boolean;
    message?: string;
    data?: Record<string, unknown>;
}
export interface TokenManager {
    createToken(data: {
        userId: string;
        permissions: Array<{
            resource: string;
            action: string;
        }>;
        sessionData: SessionData;
        expiresAt: Date;
    }): Promise<SecurityToken>;
    validateToken(tokenString: string): Promise<SecurityToken | null>;
}
export interface SecurityPolicyEngine {
    executePolicy(policyName: string, context: SecurityContext): Promise<PolicyExecutionResult>;
}
export interface AuditLogger {
    logAccess(data: {
        userId: string;
        resource: string;
        action: string;
        granted: boolean;
        timestamp: Date;
        context?: SecurityContext;
    }): Promise<void>;
    logError(data: {
        userId: string;
        resource: string;
        action: string;
        error: string;
        timestamp: Date;
    }): Promise<void>;
    logTokenCreated(data: {
        userId: string;
        tokenId: string;
        expiresAt: Date;
        timestamp: Date;
    }): Promise<void>;
    logTokenValidationError(data: {
        tokenString: string;
        error: string;
        timestamp: Date;
    }): Promise<void>;
    logSecurityEvent(event: SecurityEvent): Promise<void>;
}
export declare class RoleSecurityService {
    private readonly roleManagementService;
    private readonly tokenManager;
    private readonly securityPolicyEngine;
    private readonly auditLogger;
    constructor(roleManagementService: RoleManagementService, tokenManager: TokenManager, securityPolicyEngine: SecurityPolicyEngine, auditLogger: AuditLogger);
    validatePermission(userId: string, resource: string, action: string, context?: SecurityContext): Promise<boolean>;
    validateMultiplePermissions(userId: string, permissions: PermissionRequest[]): Promise<PermissionResult[]>;
    createSecurityToken(userId: string, sessionData: SessionData): Promise<SecurityToken>;
    validateSecurityToken(tokenString: string): Promise<SecurityToken | null>;
    executeSecurityPolicy(policyName: string, context: SecurityContext): Promise<PolicyExecutionResult>;
    handleSecurityEvent(event: SecurityEvent): Promise<void>;
    private evaluateConditions;
    private checkTimeRange;
    private checkIPAddress;
    private checkUserAgent;
    private handleUnauthorizedAccess;
    private handleSuspiciousActivity;
    private handleSecurityViolation;
}
//# sourceMappingURL=role-security.service.d.ts.map