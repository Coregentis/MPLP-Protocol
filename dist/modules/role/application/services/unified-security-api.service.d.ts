/**
 * 统一安全API服务
 *
 * @description 跨模块安全集成接口，供其他模块使用的统一安全验证API
 * @version 1.0.0
 * @layer 应用层 - 统一安全接口
 */
import { RoleSecurityService, SecurityContext, SecurityToken, SecurityEvent, PermissionRequest, PermissionResult } from './role-security.service';
/**
 * 统一安全API - 供其他模块使用
 * 所有模块都通过这个API进行安全验证
 */
export declare class UnifiedSecurityAPI {
    private readonly roleSecurityService;
    constructor(roleSecurityService: RoleSecurityService);
    /**
     * 检查用户权限
     * @param userId 用户ID
     * @param resource 资源
     * @param action 操作
     * @param context 安全上下文
     * @returns 是否有权限
     */
    hasPermission(userId: string, resource: string, action: string, context?: SecurityContext): Promise<boolean>;
    /**
     * 批量权限验证
     * @param userId 用户ID
     * @param permissions 权限请求列表
     * @returns 权限验证结果列表
     */
    hasMultiplePermissions(userId: string, permissions: PermissionRequest[]): Promise<PermissionResult[]>;
    /**
     * 验证安全令牌
     * @param tokenString 令牌字符串
     * @returns 安全令牌或null
     */
    validateToken(tokenString: string): Promise<SecurityToken | null>;
    /**
     * 报告安全事件
     * @param event 安全事件
     */
    reportSecurityEvent(event: SecurityEvent): Promise<void>;
    /**
     * Context模块权限验证
     * @param userId 用户ID
     * @param contextId 上下文ID
     * @param action 操作
     * @param context 安全上下文
     * @returns 是否有权限
     */
    validateContextAccess(userId: string, contextId: string, action: string, context?: SecurityContext): Promise<boolean>;
    /**
     * Plan模块权限验证
     * @param userId 用户ID
     * @param planId 计划ID
     * @param action 操作
     * @param context 安全上下文
     * @returns 是否有权限
     */
    validatePlanAccess(userId: string, planId: string, action: string, context?: SecurityContext): Promise<boolean>;
    /**
     * Confirm模块权限验证
     * @param userId 用户ID
     * @param confirmId 确认ID
     * @param action 操作
     * @param context 安全上下文
     * @returns 是否有权限
     */
    validateConfirmAccess(userId: string, confirmId: string, action: string, context?: SecurityContext): Promise<boolean>;
    /**
     * Trace模块权限验证
     * @param userId 用户ID
     * @param traceId 追踪ID
     * @param action 操作
     * @param context 安全上下文
     * @returns 是否有权限
     */
    validateTraceAccess(userId: string, traceId: string, action: string, context?: SecurityContext): Promise<boolean>;
    /**
     * Extension模块权限验证
     * @param userId 用户ID
     * @param extensionId 扩展ID
     * @param action 操作
     * @param context 安全上下文
     * @returns 是否有权限
     */
    validateExtensionAccess(userId: string, extensionId: string, action: string, context?: SecurityContext): Promise<boolean>;
    /**
     * Dialog模块权限验证
     * @param userId 用户ID
     * @param dialogId 对话ID
     * @param action 操作
     * @param context 安全上下文
     * @returns 是否有权限
     */
    validateDialogAccess(userId: string, dialogId: string, action: string, context?: SecurityContext): Promise<boolean>;
    /**
     * Collab模块权限验证
     * @param userId 用户ID
     * @param collabId 协作ID
     * @param action 操作
     * @param context 安全上下文
     * @returns 是否有权限
     */
    validateCollabAccess(userId: string, collabId: string, action: string, context?: SecurityContext): Promise<boolean>;
    /**
     * Network模块权限验证
     * @param userId 用户ID
     * @param networkId 网络ID
     * @param action 操作
     * @param context 安全上下文
     * @returns 是否有权限
     */
    validateNetworkAccess(userId: string, networkId: string, action: string, context?: SecurityContext): Promise<boolean>;
    /**
     * Core模块权限验证
     * @param userId 用户ID
     * @param coreResource 核心资源
     * @param action 操作
     * @param context 安全上下文
     * @returns 是否有权限
     */
    validateCoreAccess(userId: string, coreResource: string, action: string, context?: SecurityContext): Promise<boolean>;
    /**
     * 验证资源访问权限
     * @param userId 用户ID
     * @param resourceType 资源类型
     * @param resourceId 资源ID
     * @param action 操作
     * @param context 安全上下文
     * @returns 是否有权限
     */
    validateResourceAccess(userId: string, resourceType: string, resourceId: string, action: string, context?: SecurityContext): Promise<boolean>;
    /**
     * 验证系统级权限
     * @param userId 用户ID
     * @param systemAction 系统操作
     * @param context 安全上下文
     * @returns 是否有权限
     */
    validateSystemPermission(userId: string, systemAction: string, context?: SecurityContext): Promise<boolean>;
    /**
     * 验证管理员权限
     * @param userId 用户ID
     * @param adminAction 管理员操作
     * @param context 安全上下文
     * @returns 是否有权限
     */
    validateAdminPermission(userId: string, adminAction: string, context?: SecurityContext): Promise<boolean>;
}
/**
 * Context模块安全服务示例
 */
export declare class ContextSecurityService {
    private readonly unifiedSecurityAPI;
    constructor(unifiedSecurityAPI: UnifiedSecurityAPI);
    validateContextAccess(userId: string, contextId: string, action: string): Promise<boolean>;
}
/**
 * Plan模块安全服务示例
 */
export declare class PlanSecurityService {
    private readonly unifiedSecurityAPI;
    constructor(unifiedSecurityAPI: UnifiedSecurityAPI);
    validatePlanAccess(userId: string, planId: string, action: string): Promise<boolean>;
}
//# sourceMappingURL=unified-security-api.service.d.ts.map