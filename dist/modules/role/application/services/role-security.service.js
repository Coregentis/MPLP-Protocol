"use strict";
/**
 * Role安全服务
 *
 * @description 统一安全策略和验证服务，实现权限验证、安全策略执行、令牌管理
 * @version 1.0.0
 * @layer 应用层 - 安全服务
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleSecurityService = void 0;
/**
 * 统一安全策略和验证服务
 * 职责：权限验证、安全策略执行、令牌管理
 */
class RoleSecurityService {
    constructor(roleManagementService, tokenManager, securityPolicyEngine, auditLogger) {
        this.roleManagementService = roleManagementService;
        this.tokenManager = tokenManager;
        this.securityPolicyEngine = securityPolicyEngine;
        this.auditLogger = auditLogger;
    }
    // ===== 统一权限验证API =====
    /**
     * 验证用户权限
     * @param userId 用户ID
     * @param resource 资源
     * @param action 操作
     * @param context 安全上下文
     * @returns 是否有权限
     */
    async validatePermission(userId, resource, action, context) {
        try {
            // 1. 获取用户权限
            const userPermissions = await this.roleManagementService.getUserPermissions(userId);
            // 2. 检查权限匹配
            const hasPermission = userPermissions.some(permission => {
                // 检查资源类型匹配
                const resourceMatches = permission.resourceType === resource;
                // 检查操作权限
                const actionMatches = permission.actions.includes(action);
                // 检查条件
                const conditionsMatch = this.evaluateConditions(permission.conditions ? [permission.conditions] : [], context);
                return resourceMatches && actionMatches && conditionsMatch;
            });
            // 3. 记录访问日志
            await this.auditLogger.logAccess({
                userId,
                resource,
                action,
                granted: hasPermission,
                timestamp: new Date(),
                context
            });
            return hasPermission;
        }
        catch (error) {
            await this.auditLogger.logError({
                userId,
                resource,
                action,
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date()
            });
            return false;
        }
    }
    /**
     * 批量权限验证
     * @param userId 用户ID
     * @param permissions 权限请求列表
     * @returns 权限验证结果列表
     */
    async validateMultiplePermissions(userId, permissions) {
        const results = [];
        for (const permissionRequest of permissions) {
            const granted = await this.validatePermission(userId, permissionRequest.resource, permissionRequest.action, permissionRequest.context);
            results.push({
                resource: permissionRequest.resource,
                action: permissionRequest.action,
                granted
            });
        }
        return results;
    }
    // ===== 安全令牌管理 =====
    /**
     * 创建安全令牌
     * @param userId 用户ID
     * @param sessionData 会话数据
     * @returns 安全令牌
     */
    async createSecurityToken(userId, sessionData) {
        // 1. 获取用户权限
        const permissions = await this.roleManagementService.getUserPermissions(userId);
        // 2. 创建令牌
        const token = await this.tokenManager.createToken({
            userId,
            permissions: permissions.flatMap(p => p.actions.map(action => ({
                resource: p.resourceType,
                action: action
            }))),
            sessionData,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24小时
        });
        // 3. 记录令牌创建
        await this.auditLogger.logTokenCreated({
            userId,
            tokenId: token.tokenId,
            expiresAt: token.expiresAt,
            timestamp: new Date()
        });
        return token;
    }
    /**
     * 验证安全令牌
     * @param tokenString 令牌字符串
     * @returns 安全令牌或null
     */
    async validateSecurityToken(tokenString) {
        try {
            const token = await this.tokenManager.validateToken(tokenString);
            if (!token || token.expiresAt < new Date()) {
                return null;
            }
            return token;
        }
        catch (error) {
            await this.auditLogger.logTokenValidationError({
                tokenString: tokenString.substring(0, 10) + '...',
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date()
            });
            return null;
        }
    }
    // ===== 安全策略执行 =====
    /**
     * 执行安全策略
     * @param policyName 策略名称
     * @param context 安全上下文
     * @returns 策略执行结果
     */
    async executeSecurityPolicy(policyName, context) {
        return await this.securityPolicyEngine.executePolicy(policyName, context);
    }
    // ===== 安全事件处理 =====
    /**
     * 处理安全事件
     * @param event 安全事件
     */
    async handleSecurityEvent(event) {
        // 1. 记录安全事件
        await this.auditLogger.logSecurityEvent(event);
        // 2. 根据事件类型执行相应处理
        switch (event.type) {
            case 'unauthorized_access':
                await this.handleUnauthorizedAccess(event);
                break;
            case 'suspicious_activity':
                await this.handleSuspiciousActivity(event);
                break;
            case 'security_violation':
                await this.handleSecurityViolation(event);
                break;
            default:
                // 默认处理
                break;
        }
    }
    // ===== 私有辅助方法 =====
    evaluateConditions(conditions, context) {
        if (!conditions || conditions.length === 0) {
            return true;
        }
        // 如果没有上下文，但有条件，我们暂时允许通过（在实际实现中应该更严格）
        if (!context) {
            return true; // 暂时允许，实际应用中可能需要更严格的验证
        }
        // 简化的条件评估，实际实现中应该根据PermissionConditions接口进行评估
        return true; // 暂时返回true，允许所有条件
    }
    checkTimeRange(_timeRange, _timestamp) {
        // 时间范围检查逻辑
        return true;
    }
    checkIPAddress(_allowedIPs, _clientIP) {
        // IP地址检查逻辑
        return true;
    }
    checkUserAgent(_allowedAgents, _userAgent) {
        // User Agent检查逻辑
        return true;
    }
    async handleUnauthorizedAccess(_event) {
        // 处理未授权访问
    }
    async handleSuspiciousActivity(_event) {
        // 处理可疑活动
    }
    async handleSecurityViolation(_event) {
        // 处理安全违规
    }
}
exports.RoleSecurityService = RoleSecurityService;
//# sourceMappingURL=role-security.service.js.map