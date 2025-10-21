/**
 * Role安全服务
 *
 * @description 统一安全策略和验证服务，实现权限验证、安全策略执行、令牌管理
 * @version 1.0.0
 * @layer 应用层 - 安全服务
 */
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
/**
 * 统一安全策略和验证服务
 * 职责：权限验证、安全策略执行、令牌管理
 */
export declare class RoleSecurityService {
    private readonly roleManagementService;
    private readonly tokenManager;
    private readonly securityPolicyEngine;
    private readonly auditLogger;
    constructor(roleManagementService: RoleManagementService, tokenManager: TokenManager, securityPolicyEngine: SecurityPolicyEngine, auditLogger: AuditLogger);
    /**
     * 验证用户权限
     * @param userId 用户ID
     * @param resource 资源
     * @param action 操作
     * @param context 安全上下文
     * @returns 是否有权限
     */
    validatePermission(userId: string, resource: string, action: string, context?: SecurityContext): Promise<boolean>;
    /**
     * 批量权限验证
     * @param userId 用户ID
     * @param permissions 权限请求列表
     * @returns 权限验证结果列表
     */
    validateMultiplePermissions(userId: string, permissions: PermissionRequest[]): Promise<PermissionResult[]>;
    /**
     * 创建安全令牌
     * @param userId 用户ID
     * @param sessionData 会话数据
     * @returns 安全令牌
     */
    createSecurityToken(userId: string, sessionData: SessionData): Promise<SecurityToken>;
    /**
     * 验证安全令牌
     * @param tokenString 令牌字符串
     * @returns 安全令牌或null
     */
    validateSecurityToken(tokenString: string): Promise<SecurityToken | null>;
    /**
     * 执行安全策略
     * @param policyName 策略名称
     * @param context 安全上下文
     * @returns 策略执行结果
     */
    executeSecurityPolicy(policyName: string, context: SecurityContext): Promise<PolicyExecutionResult>;
    /**
     * 处理安全事件
     * @param event 安全事件
     */
    handleSecurityEvent(event: SecurityEvent): Promise<void>;
    private evaluateConditions;
    private handleUnauthorizedAccess;
    private handleSuspiciousActivity;
    private handleSecurityViolation;
}
//# sourceMappingURL=role-security.service.d.ts.map