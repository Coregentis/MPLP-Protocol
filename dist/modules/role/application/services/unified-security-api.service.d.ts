import { RoleSecurityService, SecurityContext, SecurityToken, SecurityEvent, PermissionRequest, PermissionResult } from './role-security.service';
export declare class UnifiedSecurityAPI {
    private readonly roleSecurityService;
    constructor(roleSecurityService: RoleSecurityService);
    hasPermission(userId: string, resource: string, action: string, context?: SecurityContext): Promise<boolean>;
    hasMultiplePermissions(userId: string, permissions: PermissionRequest[]): Promise<PermissionResult[]>;
    validateToken(tokenString: string): Promise<SecurityToken | null>;
    reportSecurityEvent(event: SecurityEvent): Promise<void>;
    validateContextAccess(userId: string, contextId: string, action: string, context?: SecurityContext): Promise<boolean>;
    validatePlanAccess(userId: string, planId: string, action: string, context?: SecurityContext): Promise<boolean>;
    validateConfirmAccess(userId: string, confirmId: string, action: string, context?: SecurityContext): Promise<boolean>;
    validateTraceAccess(userId: string, traceId: string, action: string, context?: SecurityContext): Promise<boolean>;
    validateExtensionAccess(userId: string, extensionId: string, action: string, context?: SecurityContext): Promise<boolean>;
    validateDialogAccess(userId: string, dialogId: string, action: string, context?: SecurityContext): Promise<boolean>;
    validateCollabAccess(userId: string, collabId: string, action: string, context?: SecurityContext): Promise<boolean>;
    validateNetworkAccess(userId: string, networkId: string, action: string, context?: SecurityContext): Promise<boolean>;
    validateCoreAccess(userId: string, coreResource: string, action: string, context?: SecurityContext): Promise<boolean>;
    validateResourceAccess(userId: string, resourceType: string, resourceId: string, action: string, context?: SecurityContext): Promise<boolean>;
    validateSystemPermission(userId: string, systemAction: string, context?: SecurityContext): Promise<boolean>;
    validateAdminPermission(userId: string, adminAction: string, context?: SecurityContext): Promise<boolean>;
}
export declare class ContextSecurityService {
    private readonly unifiedSecurityAPI;
    constructor(unifiedSecurityAPI: UnifiedSecurityAPI);
    validateContextAccess(userId: string, contextId: string, action: string): Promise<boolean>;
}
export declare class PlanSecurityService {
    private readonly unifiedSecurityAPI;
    constructor(unifiedSecurityAPI: UnifiedSecurityAPI);
    validatePlanAccess(userId: string, planId: string, action: string): Promise<boolean>;
}
//# sourceMappingURL=unified-security-api.service.d.ts.map