export interface SecurityContext {
    userId: string;
    sessionId: string;
    roles: string[];
    permissions: string[];
    authenticationMethod: 'password' | 'token' | 'oauth' | 'certificate';
    authenticationTime: string;
    ipAddress?: string;
    userAgent?: string;
}
export interface PermissionCheckResult {
    granted: boolean;
    reason?: string;
    requiredPermissions: string[];
    grantedPermissions: string[];
    deniedPermissions: string[];
}
export interface SecurityAuditEvent {
    eventId: string;
    eventType: 'authentication' | 'authorization' | 'access' | 'modification' | 'security_violation';
    timestamp: string;
    userId: string;
    sessionId: string;
    resource: string;
    action: string;
    result: 'success' | 'failure' | 'denied';
    ipAddress?: string;
    userAgent?: string;
    details?: Record<string, unknown>;
}
export declare class MLPPSecurityManager {
    private securityContexts;
    private auditEvents;
    authenticateUser(_credentials: Record<string, unknown>): Promise<SecurityContext | null>;
    checkPermission(_sessionId: string, _resource: string, _action: string): Promise<PermissionCheckResult>;
    getSecurityContext(_sessionId: string): SecurityContext | null;
    revokeSession(_sessionId: string): Promise<boolean>;
    recordAuditEvent(event: SecurityAuditEvent): Promise<void>;
    getAuditEvents(_filter?: {
        userId?: string;
        eventType?: string;
        startTime?: string;
        endTime?: string;
    }): SecurityAuditEvent[];
    encryptData(_data: string, _algorithm?: string): Promise<string>;
    decryptData(_encryptedData: string, _algorithm?: string): Promise<string>;
    generateToken(_payload: Record<string, unknown>, _expiresIn?: string): Promise<string>;
    verifyToken(_token: string): Promise<Record<string, unknown> | null>;
    healthCheck(): Promise<boolean>;
}
//# sourceMappingURL=security-manager.d.ts.map