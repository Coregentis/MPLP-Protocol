/**
 * MPLP安全管理器
 *
 * @description L3层统一安全管理，提供认证、授权、审计等安全功能
 * @version 1.0.0
 * @integration 与所有10个模块统一集成
 */
/**
 * 安全上下文接口
 */
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
/**
 * 权限检查结果
 */
export interface PermissionCheckResult {
    granted: boolean;
    reason?: string;
    requiredPermissions: string[];
    grantedPermissions: string[];
    deniedPermissions: string[];
}
/**
 * 安全审计事件
 */
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
/**
 * MPLP安全管理器
 *
 * @description 统一的安全管理实现，所有模块使用相同的安全策略
 */
export declare class MLPPSecurityManager {
    private securityContexts;
    private auditEvents;
    /**
     * 验证用户身份
     */
    authenticateUser(_credentials: Record<string, unknown>): Promise<SecurityContext | null>;
    /**
     * 检查用户权限
     */
    checkPermission(_sessionId: string, _resource: string, _action: string): Promise<PermissionCheckResult>;
    /**
     * 获取安全上下文
     */
    getSecurityContext(_sessionId: string): SecurityContext | null;
    /**
     * 注销用户会话
     */
    revokeSession(_sessionId: string): Promise<boolean>;
    /**
     * 记录安全审计事件
     */
    recordAuditEvent(event: SecurityAuditEvent): Promise<void>;
    /**
     * 获取审计事件
     */
    getAuditEvents(_filter?: {
        userId?: string;
        eventType?: string;
        startTime?: string;
        endTime?: string;
    }): SecurityAuditEvent[];
    /**
     * 加密敏感数据
     */
    encryptData(_data: string, _algorithm?: string): Promise<string>;
    /**
     * 解密敏感数据
     */
    decryptData(_encryptedData: string, _algorithm?: string): Promise<string>;
    /**
     * 生成安全令牌
     */
    generateToken(_payload: Record<string, unknown>, _expiresIn?: string): Promise<string>;
    /**
     * 验证安全令牌
     */
    verifyToken(_token: string): Promise<Record<string, unknown> | null>;
    /**
     * 健康检查
     */
    healthCheck(): Promise<boolean>;
}
//# sourceMappingURL=security-manager.d.ts.map